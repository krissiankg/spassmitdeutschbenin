import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "L'adresse email est requise." }, { status: 400 });
    }

    // Trouver l'étudiant (on prend le plus récent comme pour le login)
    const candidate = await prisma.candidate.findFirst({
      where: { 
        email,
        lmsPassword: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Pour des raisons de sécurité, on ne dit pas si l'email existe ou pas
    if (!candidate) {
      return NextResponse.json({ success: true, message: "Si cet email correspond à un compte, un lien de réinitialisation sera envoyé." });
    }

    // Générer un jeton unique
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 heure

    // Mettre à jour tous les dossiers liés à cet email pour éviter les incohérences
    await prisma.candidate.updateMany({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/lms/reset-password?token=${token}`;

    const emailSent = await sendResetPasswordEmail(email, candidate.firstName, resetUrl);

    if (!emailSent) {
        return NextResponse.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Un email de réinitialisation a été envoyé." });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
