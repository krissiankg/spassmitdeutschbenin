import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: sessionId } = params;

    // Use $queryRaw to bypass Prisma Client types if generation failed, or prisma.examSchedule if it works.
    // Let's try raw query for safety to avoid type errors.
    const schedules = await prisma.$queryRaw`
      SELECT es.*, m.name as "moduleName", m.code as "moduleCode" 
      FROM "ExamSchedule" es
      JOIN "Module" m ON es."moduleId" = m.id
      WHERE es."sessionId" = ${sessionId}
      ORDER BY es.date ASC, es."timeStart" ASC
    `;

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("GET schedule error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: sessionId } = params;
    const body = await request.json();

    const { schedules } = body; // Expects an array of schedules

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    // Delete existing schedules for this session
    await prisma.$executeRaw`DELETE FROM "ExamSchedule" WHERE "sessionId" = ${sessionId}`;

    // Insert new schedules
    for (const s of schedules) {
      if (s.moduleId && s.date && s.timeStart && s.timeEnd) {
        // Need to parse the date string to ISO format date if it's not already
        const dateObj = new Date(s.date);
        
        await prisma.$executeRaw`
          INSERT INTO "ExamSchedule" ("id", "sessionId", "moduleId", "date", "timeStart", "timeEnd", "room", "updatedAt")
          VALUES (
            gen_random_uuid()::text,
            ${sessionId},
            ${s.moduleId},
            ${dateObj},
            ${s.timeStart},
            ${s.timeEnd},
            ${s.room || null},
            CURRENT_TIMESTAMP
          )
        `;
      }
    }

    return NextResponse.json({ success: true, message: "Calendrier mis à jour" });
  } catch (error) {
    console.error("POST schedule error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
