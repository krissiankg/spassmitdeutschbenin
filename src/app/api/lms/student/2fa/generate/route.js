import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;
    
    // Pour otplib v13+
    const secret = generateSecret();
    const otpauth = generateURI({
      issuer: "Spass mit Deutsch Benin",
      label: email,
      secret: secret
    });
    
    const qrCodeUrl = await QRCode.toDataURL(otpauth);

    // On stocke le secret mais 2FA n'est pas encore activé
    await prisma.candidate.updateMany({
      where: { email },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false
      }
    });

    return NextResponse.json({ qrCodeUrl, secret });

  } catch (error) {
    console.error("2FA generate error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
