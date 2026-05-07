import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL, UNPAID, PARTIAL

    let where = {
      OR: [
        { paymentStatus: "UNPAID" },
        { paymentStatus: "PARTIAL" }
      ],
      totalAmount: { gt: 0 }
    };

    if (filter === "UNPAID") where.paymentStatus = "UNPAID";
    if (filter === "PARTIAL") where.paymentStatus = "PARTIAL";

    const candidates = await prisma.candidate.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        candidateNumber: true,
        totalAmount: true,
        amountPaid: true,
        paymentStatus: true,
        level: true,
        session: { select: { title: true } }
      },
      orderBy: [
        { paymentStatus: 'asc' }, // UNPAID first maybe? Or by amount
        { totalAmount: 'desc' }
      ]
    });

    return NextResponse.json(candidates);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
