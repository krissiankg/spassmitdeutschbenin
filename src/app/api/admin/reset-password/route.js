import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token et mot de passe requis." }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { resetToken: token },
    });

    if (!admin || !admin.resetTokenExpiry || admin.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Le lien de réinitialisation est invalide ou a expiré." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ success: true, message: "Mot de passe réinitialisé avec succès." });

  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de la réinitialisation." }, { status: 500 });
  }
}
