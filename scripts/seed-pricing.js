const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pricingData = [
  // Niveaux OSD complets (raccourcis)
  { code: 'ZA1_COMPLET', category: 'LEVEL', label: 'ZA1', price: 70000, level: 'A1' },
  { code: 'ZA2_COMPLET', category: 'LEVEL', label: 'ZA2', price: 76000, level: 'A2' },
  { code: 'B1_COMPLET', category: 'LEVEL', label: 'B1', price: 98000, level: 'B1' },
  { code: 'B2_COMPLET', category: 'LEVEL', label: 'B2', price: 114500, level: 'B2' },

  // Modules ZA1
  { code: 'ZA1_ORAL', category: 'MODULE', label: 'Oral', price: 20000, level: 'A1' },
  { code: 'ZA1_ECRIT', category: 'MODULE', label: 'Écrit', price: 50000, level: 'A1' },

  // Modules ZA2
  { code: 'ZA2_ORAL', category: 'MODULE', label: 'Oral', price: 23000, level: 'A2' },
  { code: 'ZA2_ECRIT', category: 'MODULE', label: 'Écrit', price: 53000, level: 'A2' },

  // Modules B1
  { code: 'B1_LESEN', category: 'MODULE', label: 'Lesen (Lecture)', price: 24500, level: 'B1' },
  { code: 'B1_HOREN', category: 'MODULE', label: 'Hören (Écoute)', price: 24500, level: 'B1' },
  { code: 'B1_SCHREIBEN', category: 'MODULE', label: 'Schreiben (Écriture)', price: 35000, level: 'B1' },
  { code: 'B1_SPRECHEN', category: 'MODULE', label: 'Sprechen (Oral)', price: 24500, level: 'B1' },

  // Modules B2
  { code: 'B2_ECRIT', category: 'MODULE', label: 'Écrit (Schriftlich)', price: 80000, level: 'B2' },
  { code: 'B2_ORAL', category: 'MODULE', label: 'Oral (Mündlich)', price: 34500, level: 'B2' },

  // Cours Préparatoires
  { code: 'PREP_B1_INT', category: 'PREP_COURSE', label: 'B1 (Apprenants Internes)', price: 25000, level: 'B1' },
  { code: 'PREP_B2_INT', category: 'PREP_COURSE', label: 'B2 (Apprenants Internes)', price: 34500, level: 'B2' },
  { code: 'PREP_B1_EXT', category: 'PREP_COURSE', label: 'B1 (Apprenants Externes)', price: 35000, level: 'B1' },
  { code: 'PREP_B2_EXT', category: 'PREP_COURSE', label: 'B2 (Apprenants Externes)', price: 45000, level: 'B2' },
];

async function main() {
  console.log("Seeding Pricing...");
  
  for (const item of pricingData) {
    await prisma.pricing.upsert({
      where: { code: item.code },
      update: { price: item.price, label: item.label, category: item.category, level: item.level },
      create: item,
    });
  }

  console.log("Pricing Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
