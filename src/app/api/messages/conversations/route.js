import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const userType = session.user.userType;

  try {
    // Trouver toutes les conversations où l'utilisateur est participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: userType === "STUDENT"
            ? { candidateId: userId }
            : { adminId: userId }
        }
      },
      include: {
        participants: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { targetId, targetType } = await req.json();
  const userId = session.user.id;
  const userType = session.user.userType;

  if (!targetId || !targetType) {
    return NextResponse.json({ error: "Cible manquante" }, { status: 400 });
  }

  // LOGIQUE DE RESTRICTION:
  // 1. Admin -> Étudiant: Toujours OK
  // 2. Étudiant -> Admin: Toujours OK
  // 3. Étudiant -> Étudiant: Doivent être AMIS (FriendRequest ACCEPTED)
  if (userType === "STUDENT" && targetType === "STUDENT") {
    const friendship = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetId, status: "ACCEPTED" },
          { senderId: targetId, receiverId: userId, status: "ACCEPTED" }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ 
        error: "Vous devez être amis pour vous envoyer des messages.",
        code: "FRIENDSHIP_REQUIRED" 
      }, { status: 403 });
    }
  }

  try {
    // Vérifier si une conversation existe déjà entre ces deux participants
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: userType === "STUDENT" ? { candidateId: userId } : { adminId: userId }
            }
          },
          {
            participants: {
              some: targetType === "STUDENT" ? { candidateId: targetId } : { adminId: targetId }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Créer une nouvelle conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            userType === "STUDENT" ? { candidateId: userId } : { adminId: userId },
            targetType === "STUDENT" ? { candidateId: targetId } : { adminId: targetId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            admin: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
