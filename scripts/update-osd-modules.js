const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OSD_RULES = {
  "A1": {
    "Lesen": { max: 30, min: 6 },
    "Hören": { max: 30, min: 6 },
    "Schreiben": { max: 15, min: 4 },
    "Sprechen": { max: 25, min: 12 }
  },
  "A2": {
    "Lesen": { max: 30, min: 6 },
    "Hören": { max: 30, min: 6 },
    "Schreiben": { max: 15, min: 4 },
    "Sprechen": { max: 25, min: 12 }
  },
  "B1": {
    "Lesen": { max: 100, min: 60 },
    "Hören": { max: 100, min: 60 },
    "Schreiben": { max: 100, min: 60 },
    "Sprechen": { max: 100, min: 60 }
  },
  "B2": {
    "Lesen": { max: 20, min: 10 },
    "Hören": { max: 20, min: 10 },
    "Schreiben": { max: 30, min: 15 },
    "Sprechen": { max: 30, min: 18 }
  }
};

async function main() {
  console.log("Mise à jour des plafonds de notes des modules dans la base de données...");

  for (const [level, modules] of Object.entries(OSD_RULES)) {
    for (const [name, rule] of Object.entries(modules)) {
      const code = `${level}-${name.substring(0, 3).toUpperCase()}`;

      await prisma.module.upsert({
        where: { id: code },
        update: {
          maxScore: rule.max
        },
        create: {
          id: code,
          code: code,
          name: name,
          level: level,
          maxScore: rule.max,
          coeff: 1.0
        }
      });
      console.log(`✓ Module ${code} configuré (Max: ${rule.max})`);
    }
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
