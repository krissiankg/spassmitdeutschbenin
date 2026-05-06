import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const session = await getAuthSession();
  if (!session || session.user.userType !== "STUDENT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = params;
  const { status } = await req.json(); // ACCEPTED or REJECTED
  const userId = session.user.id;

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    const request = await prisma.friendRequest.findUnique({
      where: { id },
    });

    if (!request || request.receiverId !== userId) {
      return NextResponse.json({ error: "Demande non trouvée" }, { status: 404 });
    }

    const updated = await prisma.friendRequest.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update friend request error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
