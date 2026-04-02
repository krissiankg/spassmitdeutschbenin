import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";


export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "SECRETARY")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { candidateId, amount, method, reference } = await req.json();

    if (!candidateId || !amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Identifiant et montant valide requis" }, { status: 400 });
    }

    // Commencer une transaction Prisma
    const updatedCandidate = await prisma.$transaction(async (tx) => {
      // 1. Trouver le candidat actuel
      const candidate = await tx.candidate.findUnique({
        where: { id: candidateId },
        select: { id: true, amountPaid: true, totalAmount: true }
      });

      if (!candidate) throw new Error("Candidat introuvable");

      // 2. Créer l'enregistrement de paiement
      await tx.payment.create({
        data: {
          candidateId,
          amount: Number(amount),
          method: method || "CASH",
          reference: reference || null,
          recordedBy: session.user.email
        }
      });

      // 3. Mettre à jour le solde et statut du candidat
      const newAmountPaid = candidate.amountPaid + Number(amount);
      const totalAmount = candidate.totalAmount || 0;
      
      let status = "UNPAID";
      if (newAmountPaid > 0 && newAmountPaid < totalAmount) status = "PARTIAL";
      else if (newAmountPaid >= totalAmount && totalAmount > 0) status = "PAID";
      else if (newAmountPaid > 0 && totalAmount === 0) status = "PAID"; // Cas sans total défini

      return await tx.candidate.update({
        where: { id: candidateId },
        data: {
          amountPaid: newAmountPaid,
          paymentStatus: status
        },
        include: { session: true } // Need session title for email
      });
    });

    await recordAuditLog({
      session,
      action: "RECORD_PAYMENT",
      targetType: "CANDIDATE",
      targetId: candidateId,
      targetName: `${updatedCandidate.firstName} ${updatedCandidate.lastName}`,
      details: { amount, method, reference }
    });

    // Send Payment Email async
    if (updatedCandidate.email) {
      const { sendPaymentReceiptEmail } = await import("@/lib/email");
      sendPaymentReceiptEmail(updatedCandidate, { amount, method, reference }, updatedCandidate.session?.title || updatedCandidate.level)
        .catch(e => console.error("Erreur envoi recu email:", e));
    }

    return NextResponse.json(updatedCandidate);

  } catch (error) {
    console.error("Erreur enregistrement de paiement:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de l'encaissement" }, { status: 500 });
  }
}
