import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;

    await prisma.candidate.updateMany({
      where: { email },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    return NextResponse.json({ message: "2FA désactivé avec succès" });

  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
