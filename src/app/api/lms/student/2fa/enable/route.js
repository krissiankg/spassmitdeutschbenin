import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verify } from "otplib";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { code } = await req.json();
    const email = session.user.email;

    const student = await prisma.candidate.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!student || !student.twoFactorSecret) {
      return NextResponse.json({ error: "Configuration 2FA non trouvée" }, { status: 400 });
    }

    // otplib v13+ : verify renvoie un objet avec une propriété 'valid'
    const result = await verify({ 
      token: code, 
      secret: student.twoFactorSecret 
    });

    if (!result.valid) {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

    await prisma.candidate.updateMany({
      where: { email },
      data: {
        twoFactorEnabled: true
      }
    });

    return NextResponse.json({ message: "2FA activé avec succès" });

  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
