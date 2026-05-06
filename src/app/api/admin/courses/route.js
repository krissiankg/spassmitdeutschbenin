import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log(">>> ADMIN COURSES GET CALLED");
  console.log(">>> PRISMA KEYS:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  try {
    const session = await getAuthSession();

    if (!session) {
      console.log(">>> NO SESSION");
      return NextResponse.json({ error: "Session non trouvée" }, { status: 401 });
    }

    const adminRoles = ["SUPER_ADMIN", "SECRETARY", "COMPTABLE"];
    if (!adminRoles.includes(session.user.role)) {
      console.log(">>> ROLE NOT AUTHORIZED:", session.user.role);
      return NextResponse.json({ error: `Rôle ${session.user.role} non autorisé` }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log(">>> FOUND COURSES WITH COUNTS:", courses.length);
    return NextResponse.json(courses);
  } catch (error) {
    console.error(">>> FETCH COURSES ERROR:", error);
    const prismaKeys = Object.keys(prisma).filter(k => !k.startsWith("_"));
    return NextResponse.json({
      error: "Erreur serveur",
      details: error.message,
      availableModels: prismaKeys
    }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const course = await prisma.course.create({
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        price: parseInt(data.price),
        duration: data.duration,
        days: data.days,
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        isActive: data.isActive ?? true,
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    const fs = require('fs');
    const logMsg = `[${new Date().toISOString()}] CREATE COURSE ERROR: ${error.message}\n${error.stack}\n\n`;
    fs.appendFileSync('c:/Users/krissiank/Documents/GitHub/spassmitdeutschbenin/scratch/api_errors.log', logMsg);
    return NextResponse.json({ error: "Erreur lors de la création", details: error.message }, { status: 500 });
  }
}
