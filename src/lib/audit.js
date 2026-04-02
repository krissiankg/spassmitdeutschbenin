import prisma from "./prisma";

/**
 * Enregistre une action administrative dans le journal d'audit.
 * 
 * @param {Object} params
 * @param {Object} params.session - Session de l'utilisateur (next-auth)
 * @param {string} params.action - Code de l'action (ex: "DELETE_CANDIDATE")
 * @param {string} params.targetType - Type d'objet (ex: "CANDIDATE")
 * @param {string} [params.targetId] - ID de l'objet
 * @param {string} [params.targetName] - Nom/Libellé de l'objet pour trace historique
 * @param {Object} [params.details] - Détails supplémentaires au format JSON
 */
export async function recordAuditLog({ 
  session, 
  action, 
  targetType, 
  targetId = null, 
  targetName = null, 
  details = null 
}) {
  try {
    if (!session || !session.user) return null;

    return await prisma.auditLog.create({
      data: {
        adminEmail: session.user.email,
        adminName: session.user.name || session.user.email.split('@')[0],
        action,
        targetType,
        targetId,
        targetName,
        details: details ? details : undefined,
      }
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
    return null;
  }
}

/**
 * Vérifie s'il existe des logs de plus de 2 mois et crée une notification si nécessaire.
 */
export async function checkOldLogsAndNotify() {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const oldLogsCount = await prisma.auditLog.count({
      where: {
        createdAt: { lt: twoMonthsAgo }
      }
    });

    if (oldLogsCount > 0) {
      // Vérifier si une notification similaire existe déjà aujourd'hui pour ne pas spammer
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotif = await prisma.notification.findFirst({
        where: {
          title: "Maintenance des Journaux d'Audit",
          createdAt: { gte: today }
        }
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            title: "Maintenance des Journaux d'Audit",
            message: `Il y a ${oldLogsCount} journaux d'audit datant de plus de 2 mois. Pensez à les nettoyer dans les paramètres de sécurité.`,
            type: "WARNING"
          }
        });
      }
    }
  } catch (error) {
    console.error("Error checking old logs:", error);
  }
}
