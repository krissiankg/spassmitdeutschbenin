import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { generateCode } from "@/lib/utils";

export async function POST(req) {
  try {
    const session = await getAuthSession();

    if (!session || session.user.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { level } = await req.json();
    const email = session.user.email;

    if (!level) {
      return NextResponse.json({ error: "Niveau manquant" }, { status: 400 });
    }

    // 1. Vérifier si une demande identique est déjà en cours ou déjà approuvée
    const existing = await prisma.candidate.findFirst({
      where: {
        email,
        level,
        status: { in: ["PENDING", "APPROVED"] }
      }
    });

    if (existing) {
      const msg = existing.status === "APPROVED"
        ? "Vous êtes déjà inscrit à ce cours."
        : "Une demande d'inscription pour ce niveau est déjà en attente de validation.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 2. Récupérer les infos de profil de l'étudiant (depuis un record APPROVED existant)
    const profile = await prisma.candidate.findFirst({
      where: { email, status: "APPROVED" },
      orderBy: { createdAt: "desc" }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil étudiant non trouvé" }, { status: 404 });
    }

    // 3. Créer la demande d'inscription
    // On génère un numéro de candidat temporaire ou fictif pour la demande
    const newRequest = await prisma.candidate.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        country: profile.country,
        level: level,
        status: "PENDING",
        consultationCode: generateCode(),
        candidateNumber: `REQ-${Math.floor(Math.random() * 100000)}`,
        amountPaid: 0,
        paymentStatus: "UNPAID"
      }
    });

    // Notification Dashboard pour les admins
    try {
      const { createAdminNotification } = await import("@/lib/notifications");
      await createAdminNotification({
        title: "Nouvelle demande d'inscription (LMS)",
        message: `${profile.firstName} ${profile.lastName} demande à s'inscrire au niveau ${level}.`,
        type: "INFO"
      });
    } catch (e) {
      console.error("Erreur notification dashboard admin:", e);
    }

    // Notification Email pour les admins
    try {
      const { sendAdminNotificationEmail } = await import("@/lib/email");
      await sendAdminNotificationEmail(
        { 
          firstName: profile.firstName, 
          lastName: profile.lastName, 
          email: profile.email, 
          phone: profile.phone, 
          formType: 'SIMPLE' 
        },
        [level],
        [] // Pricings non nécessaires ici
      );
    } catch (e) {
      console.error("Erreur notification email admin:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Demande d'inscription envoyée au secrétariat.",
      candidate: newRequest
    });

  } catch (error) {
    console.error("Enrollment API error:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription" }, { status: 500 });
  }
}
