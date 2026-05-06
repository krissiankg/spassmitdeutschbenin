import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const enrollments = await prisma.enrollment.findMany({
      where: {
        candidate: { email: session.user.email }
      },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: "ID du cours manquant" }, { status: 400 });

    // 1. Trouver le candidat lié à cet utilisateur (basé sur l'email)
    // On prend le dernier profil approuvé ou n'importe quel profil si c'est sa première fois
    const candidate = await prisma.candidate.findFirst({
      where: { email: session.user.email },
      orderBy: { createdAt: 'desc' }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Profil candidat non trouvé. Veuillez d'abord remplir vos informations de base." }, { status: 404 });
    }

    // 2. Vérifier si déjà inscrit ou en attente pour CE cours précis
    const existing = await prisma.enrollment.findFirst({
      where: {
        candidateId: candidate.id,
        courseId: courseId,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existing) {
      return NextResponse.json({
        error: existing.status === "APPROVED"
          ? "Vous êtes déjà inscrit à ce cours."
          : "Votre demande d'inscription est déjà en cours de traitement."
      }, { status: 400 });
    }

    // 3. Créer l'inscription
    const enrollment = await prisma.enrollment.create({
      data: {
        candidateId: candidate.id,
        courseId: courseId,
        status: "PENDING"
      }
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
