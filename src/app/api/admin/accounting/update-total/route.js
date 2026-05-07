import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE" && session.user.role !== "SECRETARY")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { candidateId, totalAmount } = await req.json();

    if (!candidateId || totalAmount === undefined || isNaN(totalAmount) || totalAmount < 0) {
      return NextResponse.json({ error: "Identifiant et montant valide requis" }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, amountPaid: true }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }

    let status = "UNPAID";
    if (candidate.amountPaid > 0 && candidate.amountPaid < totalAmount) status = "PARTIAL";
    else if (candidate.amountPaid >= totalAmount && totalAmount > 0) status = "PAID";
    else if (candidate.amountPaid > 0 && totalAmount === 0) status = "PAID";

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        totalAmount: Number(totalAmount),
        paymentStatus: status
      }
    });

    await recordAuditLog({
      session,
      action: "UPDATE_TOTAL_AMOUNT",
      targetType: "CANDIDATE",
      targetId: candidateId,
      targetName: `${updatedCandidate.firstName} ${updatedCandidate.lastName}`,
      details: { newTotal: totalAmount }
    });

    return NextResponse.json(updatedCandidate);

  } catch (error) {
    console.error("Erreur mise à jour total:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la modification" }, { status: 500 });
  }
}
