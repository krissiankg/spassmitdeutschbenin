import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    const { name, email, password, role } = await request.json();

    const data = { name, email, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.admin.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true }
    });

    await recordAuditLog({
      session,
      action: "UPDATE_ADMIN",
      targetType: "ADMIN",
      targetId: id,
      targetName: `${updatedUser.name} (${updatedUser.email})`,
      details: { changedRole: role }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    
    // Empêcher l'utilisateur connecté de se supprimer lui-même
    if (session.user.id === id) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }

    const adminToDelete = await prisma.admin.findUnique({
      where: { id },
      select: { name: true, email: true }
    });

    await prisma.admin.delete({ where: { id } });

    if (adminToDelete) {
      await recordAuditLog({
        session,
        action: "DELETE_ADMIN",
        targetType: "ADMIN",
        targetId: id,
        targetName: `${adminToDelete.name} (${adminToDelete.email})`
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
