import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { sendConsultationCodeEmail } from "@/lib/email";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request, { params }) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // 1. Marquer la session comme publiée
    const session = await prisma.session.update({
      where: { id },
      data: { status: "PUBLISHED" }
    });

    await prisma.result.updateMany({
      where: { sessionId: id },
      data: { status: "PUBLISHED" }
    });

    await recordAuditLog({
      session: sessionAuth,
      action: "PUBLISH_RESULTS",
      targetType: "SESSION",
      targetId: id,
      targetName: session.title,
      details: { status: "PUBLISHED" }
    });

    // 3. Récupérer tous les candidats de cette session qui ont un email
    const candidates = await prisma.candidate.findMany({
      where: {
        sessionId: id,
        email: { not: null }
      }
    });

    // 4. Boucler pour envoyer les emails
    let emailsSent = 0;
    for (const candidate of candidates) {
      const success = await sendConsultationCodeEmail(candidate, session.title);
      if (success) {
        emailsSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      session, 
      emailsSent,
      totalCandidatesWithEmail: candidates.length,
      message: `${emailsSent} emails envoyés avec succès.`
    });

  } catch (error) {
    console.error("Erreur lors de la publication :", error);
    return NextResponse.json({ error: "Echec de la publication" }, { status: 500 });
  }
}
