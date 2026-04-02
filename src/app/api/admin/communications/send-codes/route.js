import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { sendConsultationCodeEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || (sessionAuth.user.role !== "SUPER_ADMIN" && sessionAuth.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "ID de session requis" }, { status: 400 });
    }

    const candidates = await prisma.candidate.findMany({
      where: { sessionId, email: { not: null, not: "" } },
      include: {
        session: true
      }
    });

    if (candidates.length === 0) {
      return NextResponse.json({ error: "Aucun candidat avec une adresse email trouvée pour cette session" }, { status: 404 });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails
    const emailPromises = candidates.map(async (candidate) => {
      const sent = await sendConsultationCodeEmail(candidate, candidate.session.title);
      if (sent) successCount++;
      else failCount++;
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      message: "Emails envoyés",
      successCount,
      failCount,
      total: candidates.length
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des codes:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'envoi" }, { status: 500 });
  }
}
