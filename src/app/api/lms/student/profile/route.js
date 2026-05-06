import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;

    // On récupère le dossier le plus récent pour afficher le profil de base
    const student = await prisma.candidate.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!student) {
      return NextResponse.json({ error: "Étudiant non trouvé" }, { status: 404 });
    }

    const { lmsPassword, resetToken, twoFactorSecret, ...safeStudent } = student;

    return NextResponse.json(safeStudent);

  } catch (error) {
    console.error("Student profile GET error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const email = session.user.email;
    const body = await req.json();

    const { 
      firstName, 
      lastName, 
      phone, 
      dateOfBirth, 
      birthPlace, 
      country 
    } = body;

    // On met à jour tous les dossiers liés à cet email pour rester cohérent
    await prisma.candidate.updateMany({
      where: { email },
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        birthPlace,
        country
      }
    });

    return NextResponse.json({ message: "Profil mis à jour avec succès" });

  } catch (error) {
    console.error("Student profile PUT error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
