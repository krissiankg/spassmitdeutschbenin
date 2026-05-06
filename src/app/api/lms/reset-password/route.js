import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
    }

    // Trouver le candidat avec ce jeton et vérifier l'expiration
    const candidate = await prisma.candidate.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Le lien de réinitialisation est invalide ou a expiré." }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour TOUS les dossiers liés à cet email
    await prisma.candidate.updateMany({
      where: { email: candidate.email },
      data: {
        lmsPassword: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ success: true, message: "Votre mot de passe a été réinitialisé avec succès." });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
