const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Migration des modules Schreiben pour A1 et A2...");

  const levelsToMigrate = ["A1", "A2"];

  for (const level of levelsToMigrate) {
    const oldCode = `${level}-SCH`;
    const newCode1 = `${level}-SC1`;
    const newCode2 = `${level}-SC2`;

    // 1. Trouver les candidats ayant un score lié à SCH
    const oldScores = await prisma.moduleScore.findMany({
      where: { moduleId: oldCode }
    });

    console.log(`Trouvé ${oldScores.length} notes pour ${oldCode} à migrer...`);

    // 2. Créer les nouveaux modules s'ils n'existent pas
    await prisma.module.upsert({
      where: { id: newCode1 },
      update: {},
      create: {
        id: newCode1,
        code: newCode1,
        name: "Schreiben 1",
        level: level,
        maxScore: 5.0,
        coeff: 1.0
      }
    });

    await prisma.module.upsert({
      where: { id: newCode2 },
      update: {},
      create: {
        id: newCode2,
        code: newCode2,
        name: "Schreiben 2",
        level: level,
        maxScore: 10.0,
        coeff: 1.0
      }
    });

    // 3. Pour chaque score, le diviser ou plutôt le remplacer par deux scores (à 0)
    for (const score of oldScores) {
      await prisma.moduleScore.createMany({
        data: [
          { resultId: score.resultId, moduleId: newCode1, score: 0 },
          { resultId: score.resultId, moduleId: newCode2, score: 0 },
        ]
      });
    }

    // 4. Supprimer l'ancien module et ses scores
    await prisma.moduleScore.deleteMany({
      where: { moduleId: oldCode }
    });
    
    await prisma.module.delete({
      where: { id: oldCode }
    }).catch(e => console.log(`${oldCode} déjà supprimé.`));

    console.log(`Migration ${level} complétée avec succès.`);
  }

  console.log("Terminé.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
