import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
    if (!admin) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;

    if (newPassword) {
      if (!currentPassword) {
         return NextResponse.json({ error: "Le mot de passe actuel est requis pour le modifier" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
         return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.admin.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
