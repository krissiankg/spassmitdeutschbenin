import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "ID de la session requis" }, { status: 400 });
    }

    const { title, date, level } = await request.json();

    if (!title || !date || !level) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        title,
        date: new Date(date),
        level
      }
    });

    await recordAuditLog({
      session: sessionAuth,
      action: "UPDATE_SESSION",
      targetType: "SESSION",
      targetId: id,
      targetName: updatedSession.title,
      details: { date, level }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("PUT Session Error:", error);
    return NextResponse.json({ error: "Erreur lors de la modification de la session" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || sessionAuth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const sessionToDelete = await prisma.session.findUnique({
      where: { id },
      select: { title: true }
    });

    if (!sessionToDelete) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }

    await prisma.session.delete({ where: { id } });

    await recordAuditLog({
      session: sessionAuth,
      action: "DELETE_SESSION",
      targetType: "SESSION",
      targetId: id,
      targetName: sessionToDelete.title
    });

    return NextResponse.json({ message: "Session supprimée avec succès" });
  } catch (error) {
    console.error("DELETE Session Error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression de la session" }, { status: 500 });
  }
}
