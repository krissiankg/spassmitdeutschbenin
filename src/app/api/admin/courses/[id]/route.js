import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;

  try {
    const data = await req.json();
    const course = await prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        price: parseInt(data.price),
        duration: data.duration,
        days: data.days,
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        isActive: data.isActive,
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
