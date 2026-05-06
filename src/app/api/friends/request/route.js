import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(req) {
  const session = await getAuthSession();
  if (!session || session.user.userType !== "STUDENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { targetId } = await req.json();
  const userId = session.user.id;

  if (!targetId) {
    return NextResponse.json({ error: "Cible manquante" }, { status: 400 });
  }

  try {
    // Check if a request already exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetId },
          { senderId: targetId, receiverId: userId }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Une demande existe déjà", status: existing.status }, { status: 400 });
    }

    const request = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: targetId,
        status: "PENDING"
      }
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.userType !== "STUDENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING"
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            level: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Fetch friend requests error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
