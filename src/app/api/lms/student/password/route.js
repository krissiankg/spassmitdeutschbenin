import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;
    const { password } = await req.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.candidate.updateMany({
      where: { email },
      data: {
        lmsPassword: hashedPassword
      }
    });

    return NextResponse.json({ message: "Mot de passe mis à jour avec succès" });

  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
