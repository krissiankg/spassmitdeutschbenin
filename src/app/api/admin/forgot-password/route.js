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

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      // Security: do not reveal if the email exists or not
      return NextResponse.json({ success: true, message: "Si cet email correspond à un compte, un lien de réinitialisation sera envoyé." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.admin.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });

    const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000");

    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const emailSent = await sendResetPasswordEmail(email, admin.name, resetUrl);

    if (!emailSent) {
        return NextResponse.json({ error: "Erreur lors de l'envoi de l'email." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Un email de réinitialisation a été envoyé." });

  } catch (error) {
    console.error("Admin forgot password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
