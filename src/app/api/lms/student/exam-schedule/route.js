import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;

    // 1. Trouver les dossiers de l'étudiant
    const candidates = await prisma.candidate.findMany({
      where: { email },
      select: { sessionId: true }
    });

    const sessionIds = candidates.map(c => c.sessionId).filter(id => id !== null);

    if (sessionIds.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Récupérer les calendriers pour ces sessions
    const schedules = await prisma.$queryRaw`
      SELECT es.*, m.name as "moduleName", m.code as "moduleCode", s.title as "sessionTitle"
      FROM "ExamSchedule" es
      JOIN "Module" m ON es."moduleId" = m.id
      JOIN "Session" s ON es."sessionId" = s.id
      WHERE es."sessionId" = ANY(${sessionIds})
      ORDER BY es.date ASC, es."timeStart" ASC
    `;

    return NextResponse.json(schedules);

  } catch (error) {
    console.error("Student exam schedule GET error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
