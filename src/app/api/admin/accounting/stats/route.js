import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [candidates, payments] = await Promise.all([
      prisma.candidate.findMany({
        select: {
          totalAmount: true,
          amountPaid: true,
          paymentStatus: true,
        }
      }),
      prisma.payment.findMany({
        select: {
          amount: true,
          createdAt: true,
        }
      })
    ]);

    const totalExpected = candidates.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    const totalReceived = candidates.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
    const totalOutstanding = totalExpected - totalReceived;

    const statusCounts = {
      PAID: candidates.filter(c => c.paymentStatus === 'PAID').length,
      PARTIAL: candidates.filter(c => c.paymentStatus === 'PARTIAL').length,
      UNPAID: candidates.filter(c => c.paymentStatus === 'UNPAID').length,
    };

    // Monthly revenue for the last 6 months
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthAmount = payments
        .filter(p => {
          const pDate = new Date(p.createdAt);
          return pDate.getMonth() === month && pDate.getFullYear() === year;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      monthlyRevenue.push({
        month: date.toLocaleString('fr-FR', { month: 'short' }),
        amount: monthAmount
      });
    }

    return NextResponse.json({
      totalExpected,
      totalReceived,
      totalOutstanding,
      statusCounts,
      monthlyRevenue,
      totalCandidates: candidates.length
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
