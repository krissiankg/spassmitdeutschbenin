import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { level: 'asc' }
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
