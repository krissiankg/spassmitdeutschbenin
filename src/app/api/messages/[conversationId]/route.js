import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(req, { params }) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { conversationId } = params;
  const userId = session.user.id;
  const userType = session.user.userType;

  try {
    // Vérifier que l'utilisateur participe à cette conversation
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        OR: [
          { candidateId: userId },
          { adminId: userId }
        ]
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        senderCandidate: {
          select: { id: true, firstName: true, lastName: true }
        },
        senderAdmin: {
          select: { id: true, name: true }
        }
      }
    });

    // Marquer les messages non lus comme lus
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        NOT: userType === "STUDENT"
          ? { senderCandidateId: userId }
          : { senderAdminId: userId }
      },
      data: { isRead: true }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { conversationId } = params;
  const { content, attachmentUrl, attachmentType, attachmentName } = await req.json();
  const userId = session.user.id;
  const userType = session.user.userType;

  if (!content && !attachmentUrl) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  try {
    // Vérifier la participation
    const participant = await prisma.participant.findFirst({
      where: {
        conversationId,
        OR: [
          { candidateId: userId },
          { adminId: userId }
        ]
      }
    });

    if (!participant) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        content: content || "",
        senderCandidateId: userType === "STUDENT" ? userId : null,
        senderAdminId: userType === "ADMIN" ? userId : null,
        attachmentUrl,
        attachmentType,
        attachmentName
      }
    });

    // Mettre à jour le updatedAt de la conversation pour le tri
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Notifier les autres participants
    const otherParticipants = await prisma.participant.findMany({
      where: {
        conversationId,
        NOT: userType === "STUDENT" 
          ? { candidateId: userId }
          : { adminId: userId }
      }
    });

    for (const p of otherParticipants) {
      await prisma.notification.create({
        data: {
          recipientAdminId: p.adminId,
          recipientCandidateId: p.candidateId,
          title: `Nouveau message de ${session.user.name}`,
          message: content ? (content.substring(0, 50) + (content.length > 50 ? "..." : "")) : "Pièce jointe reçue",
          type: "MESSAGE"
        }
      });
    }

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
