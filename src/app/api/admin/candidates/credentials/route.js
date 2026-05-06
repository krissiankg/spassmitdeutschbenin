import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { generateLmsPassword } from "@/lib/utils";
import { sendRegistrationEmail } from "@/lib/email";
import { recordAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

/**
 * Endpoint pour gérer les identifiants LMS des étudiants.
 * Actions supportées : 
 * - INITIALIZE : Génère des mots de passe pour ceux qui n'en ont pas.
 * - SEND_CREDENTIALS : Génère (si besoin) et envoie les identifiants par email.
 */
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, candidateIds, sessionId, force = false } = await request.json();

    if (!action || (!candidateIds && !sessionId)) {
      return NextResponse.json({ error: "Paramètres manquants (action, candidateIds ou sessionId)" }, { status: 400 });
    }

    // Déterminer la liste des candidats ciblés
    const where = {};
    if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
      where.id = { in: candidateIds };
    } else if (sessionId === "SIMPLE") {
      where.formType = "SIMPLE";
    } else if (sessionId) {
      where.sessionId = sessionId;
    }

    const candidates = await prisma.candidate.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        candidateNumber: true,
        lmsPassword: true,
        level: true,
        formType: true
      }
    });

    if (candidates.length === 0) {
      return NextResponse.json({ message: "Aucun candidat trouvé pour cette sélection", successCount: 0 });
    }

    let successCount = 0;
    let failCount = 0;

    for (const candidate of candidates) {
      try {
        let lmsPasswordClear = null;
        let lmsPasswordHash = candidate.lmsPassword;

        // Génération de mot de passe si INITIALIZE et absent, ou si SEND_CREDENTIALS
        const needsNewPassword = (action === 'INITIALIZE' && !candidate.lmsPassword) || 
                                 (action === 'SEND_CREDENTIALS' && (!candidate.lmsPassword || force));

        if (needsNewPassword) {
          lmsPasswordClear = generateLmsPassword();
          lmsPasswordHash = await bcrypt.hash(lmsPasswordClear, 10);
          
          await prisma.candidate.update({
            where: { id: candidate.id },
            data: { lmsPassword: lmsPasswordHash }
          });
        }

        // Envoi de l'email si action SEND_CREDENTIALS
        if (action === 'SEND_CREDENTIALS') {
          if (!candidate.email) {
            failCount++;
            continue;
          }

          // Note : on ne peut envoyer que si on a le password en clair (on vient de le générer)
          // Si on force l'envoi sans régénérer, on ne peut pas car le hash est irréversible.
          // Donc on envoie seulement si lmsPasswordClear est défini.
          if (lmsPasswordClear) {
            const sent = await sendRegistrationEmail({ ...candidate }, lmsPasswordClear);
            if (sent) successCount++;
            else failCount++;
          } else {
            // Cas où le password existait déjà et on n'a pas forcé la régénération
            // Pour l'instant, on considère que l'envoi nécessite une régénération pour être sûr du clair.
            failCount++;
          }
        } else if (action === 'INITIALIZE') {
          if (needsNewPassword) successCount++;
        }
      } catch (err) {
        console.error(`Error processing candidate ${candidate.id}:`, err);
        failCount++;
      }
    }

    // Log l'audit
    await recordAuditLog({
      session,
      action: action === 'INITIALIZE' ? "INITIALIZE_LMS_ACCESS" : "SEND_LMS_CREDENTIALS",
      targetType: "CANDIDATE",
      targetName: sessionId ? `Session ${sessionId}` : `${candidates.length} candidats`,
      details: { successCount, failCount, total: candidates.length, action }
    });

    return NextResponse.json({
      message: "Opération terminée",
      successCount,
      failCount,
      total: candidates.length
    });

  } catch (error) {
    console.error("Credentials API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
