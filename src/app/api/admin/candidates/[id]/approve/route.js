import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const session = await getAuthSession();
    const { id } = params;

    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Vérifier l'existence du candidat
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { participants: true }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidat non trouvé" }, { status: 404 });
    }

    if (candidate.status === "APPROVED") {
      return NextResponse.json({ error: "Ce candidat est déjà approuvé" }, { status: 400 });
    }

    // 2. Mettre à jour le statut
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: { status: "APPROVED" }
    });

    // 3. Envoyer un message automatique de bienvenue/validation
    const adminId = session.user.id;

    // Trouver ou créer une conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { candidateId: candidate.id } } },
          { participants: { some: { adminId: adminId } } }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { candidateId: candidate.id },
              { adminId: adminId }
            ]
          }
        }
      });
    }

    // Créer le message de confirmation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderAdminId: adminId,
        content: `Félicitations ! Votre demande d'inscription pour le niveau **${candidate.level}** a été validée par le secrétariat. Vous pouvez désormais accéder à vos cours dans votre espace personnel.`
      }
    });

    return NextResponse.json({
      success: true,
      message: "Candidat approuvé et message de confirmation envoyé.",
      candidate: updatedCandidate
    });

  } catch (error) {
    console.error("Approval API error:", error);
    return NextResponse.json({ error: "Erreur lors de l'approbation" }, { status: 500 });
  }
}
