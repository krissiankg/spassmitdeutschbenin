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
            console.warn(`[Credentials] Candidat ${candidate.id} n'a pas d'email.`);
            failCount++;
            continue;
          }

          // Note : on ne peut envoyer que si on a le password en clair (on vient de le générer)
          if (lmsPasswordClear) {
            const sent = await sendRegistrationEmail({ ...candidate }, lmsPasswordClear);
            if (sent) {
              successCount++;
            } else {
              console.error(`[Credentials] Échec de l'envoi d'email à ${candidate.email}`);
              failCount++;
            }
          } else {
            // Cas où le password existait déjà et on n'a pas forcé la régénération (force=false)
            // On ne peut pas envoyer car le hash bcrypt est irréversible.
            console.log(`[Credentials] Envoi ignoré pour ${candidate.email} car le mot de passe existe déjà et 'force' est faux.`);
            failCount++;
          }
        } else if (action === 'INITIALIZE') {
          if (needsNewPassword) successCount++;
          else console.log(`[Credentials] Initialisation ignorée pour ${candidate.email} (déjà configuré).`);
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
      message: failCount > 0 
        ? "Opération terminée avec certains échecs. Note : Pour renvoyer des identifiants à un étudiant qui en a déjà, cochez 'Régénérer les mots de passe'."
        : "Opération terminée avec succès",
      successCount,
      failCount,
      total: candidates.length,
      warning: failCount > 0 ? "Le mot de passe ne peut pas être envoyé s'il existe déjà sans l'option 'Régénérer'." : null
    });

  } catch (error) {
    console.error("Credentials API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
