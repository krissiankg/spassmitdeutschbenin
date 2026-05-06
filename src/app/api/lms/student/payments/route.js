import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;

    // Récupérer les dossiers liés à cet email avec les enrollments et les paiements
    const candidates = await prisma.candidate.findMany({
      where: { email },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({
        candidates: [],
        totalDue: 0,
        totalPaid: 0,
        balance: 0,
        payments: []
      });
    }

    // Calculer les totaux agrégés pour tous les dossiers de l'étudiant
    let totalDue = 0;
    let totalPaid = 0;
    const allPayments = [];

    candidates.forEach(c => {
      totalDue += (c.totalAmount || 0);
      totalPaid += (c.amountPaid || 0);
      c.payments.forEach(p => {
        allPayments.push({
          ...p,
          candidateLevel: c.level,
          candidateNumber: c.candidateNumber
        });
      });
    });

    // Trier tous les paiements par date
    allPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Récupérer les tarifs pour mapper les libellés OSD
    const pricings = await prisma.pricing.findMany();

    return NextResponse.json({
      candidates: candidates.map(c => {
        const resolvedModules = (c.chosenModules || []).map(code => {
          const p = pricings.find(pr => pr.code === code);
          return { code, label: p?.label || code, price: p?.price || 0 };
        });
        const resolvedPrep = (c.prepCourses || []).map(code => {
          const p = pricings.find(pr => pr.code === code);
          return { code, label: p?.label || code, price: p?.price || 0 };
        });

        return {
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          level: c.level,
          candidateNumber: c.candidateNumber,
          totalAmount: c.totalAmount,
          amountPaid: c.amountPaid,
          paymentStatus: c.paymentStatus,
          formType: c.formType,
          resolvedModules,
          resolvedPrep,
          enrollments: c.enrollments
        };
      }),
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid,
      payments: allPayments
    });

  } catch (error) {
    console.error("Student payments API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
