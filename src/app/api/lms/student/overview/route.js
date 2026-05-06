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

    // Récupérer tous les dossiers liés à cet email
    const candidates = await prisma.candidate.findMany({
      where: { email },
      include: {
        session: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        totalLevels: 0,
        totalPaid: 0,
        remainingBalance: 0,
        latestLevel: null
      });
    }

    const totalLevels = candidates.length;
    const totalAmount = candidates.reduce((acc, c) => acc + (c.totalAmount || 0), 0);
    const totalPaid = candidates.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
    const remainingBalance = totalAmount - totalPaid;

    // Récupérer les inscriptions aux cours réguliers
    const enrollments = await prisma.enrollment.findMany({
      where: { candidate: { email } },
      include: { course: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      totalLevels,
      totalPaid,
      remainingBalance,
      latestLevel: candidates[0]?.level || (enrollments[0]?.course?.level),
      latestSession: candidates[0]?.session?.title || "N/A",
      candidates: candidates.map(c => ({
        id: c.id,
        level: c.level,
        status: c.status,
        paymentStatus: c.paymentStatus,
        createdAt: c.createdAt
      })),
      enrollments: enrollments.map(e => ({
        id: e.id,
        courseName: e.course.name,
        courseLevel: e.course.level,
        status: e.status,
        days: e.course.days,
        timeStart: e.course.timeStart,
        timeEnd: e.course.timeEnd,
        createdAt: e.createdAt
      }))
    });

  } catch (error) {
    console.error("Student overview API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
