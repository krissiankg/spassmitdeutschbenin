import prisma from "./prisma";

/**
 * Crée une notification pour tous les administrateurs du système
 * Cela permet à chaque admin d'avoir son propre état "lu/non lu"
 */
export async function createAdminNotification({ title, message, type = "INFO" }) {
  try {
    // Récupérer tous les administrateurs
    const admins = await prisma.admin.findMany({
      select: { id: true }
    });

    if (admins.length === 0) return null;

    // Créer une notification pour chaque admin
    const notifications = await Promise.all(
      admins.map(admin => 
        prisma.notification.create({
          data: {
            title,
            message,
            type,
            recipientAdminId: admin.id
          }
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Erreur lors de la création des notifications admin:", error);
    return null;
  }
}

/**
 * Crée une notification pour un candidat spécifique
 */
export async function createCandidateNotification({ candidateId, title, message, type = "INFO" }) {
  try {
    return await prisma.notification.create({
      data: {
        title,
        message,
        type,
        recipientCandidateId: candidateId
      }
    });
  } catch (error) {
    console.error("Erreur lors de la création de la notification candidat:", error);
    return null;
  }
}
