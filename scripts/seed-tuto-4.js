const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Trouver l'auteur Super Admin (le premier trouvé)
  const superAdmin = await prisma.admin.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  const tutorial = await prisma.tutorial.create({
    data: {
      title: "Comment enregistrer une note",
      description: "Ce tutoriel explique étape par étape comment procéder à l'enregistrement et à la validation des notes d'un candidat suite à un examen.",
      category: "SYSTEME",
      isPublished: true,
      authorEmail: superAdmin ? superAdmin.email : "admin@spassmitdeutsch.com",
      content: [
        {
          title: "Accéder à l'interface des Résultats",
          description: "Connectez-vous à votre espace administration. Dans le menu latéral de gauche, sous la section **EXAMEN ÖSD**, cliquez sur l'onglet **Résultats**.",
          imageUrl: null
        },
        {
          title: "Sélectionner la Session et le Candidat",
          description: "Utilisez les filtres en haut de page pour sélectionner la **Session d'examen** souhaitée. Recherchez ensuite le candidat dans la liste en utilisant son nom ou son numéro de candidat.",
          imageUrl: null
        },
        {
          title: "Saisir les notes par module",
          description: "Cliquez sur le bouton **Éditer les notes** (souvent représenté par un crayon) sur la ligne du candidat. Une fenêtre s'ouvre : entrez la note correspondante pour chaque module (ex: Écrit, Oral).",
          imageUrl: null
        },
        {
          title: "Valider et Sauvegarder",
          description: "Une fois les notes saisies, vérifiez qu'il n'y a pas d'erreur de saisie. Cliquez enfin sur le bouton **Enregistrer**. Le statut du résultat passera à jour automatiquement.",
          imageUrl: null
        }
      ]
    }
  });

  console.log("Tutoriel 4 créé avec succès :", tutorial.title);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
