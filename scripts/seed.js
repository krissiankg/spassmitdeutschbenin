const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Create Admins
  await prisma.admin.create({
    data: {
      name: "Admin SMU",
      email: "admin@smd.com",
      password: "password123", // Should be hashed in production
      role: "SUPER_ADMIN"
    }
  });

  // 2. Create Sessions
  const sessionB2 = await prisma.session.create({
    data: {
      title: "Session B2 - Mars 2026",
      date: new Date("2026-03-15"),
      level: "B2",
      status: "PUBLISHED"
    }
  });

  const sessionA1 = await prisma.session.create({
    data: {
      title: "Printemps A1 - 2026",
      date: new Date("2026-04-10"),
      level: "A1",
      status: "DRAFT"
    }
  });

  // 3. Create Modules
  const modules = [
    { name: "Lesen", code: "L", level: "B2", coeff: 1, maxScore: 20 },
    { name: "Hören", code: "H", level: "B2", coeff: 1, maxScore: 20 },
    { name: "Schreiben", code: "S", level: "B2", coeff: 1, maxScore: 20 },
    { name: "Sprechen", code: "O", level: "B2", coeff: 1, maxScore: 20 }
  ];

  for (const m of modules) {
    await prisma.module.create({ data: m });
  }

  // 4. Create Candidates
  const candidates = [
    { 
      candidateNumber: "2603001", 
      firstName: "Jean", 
      lastName: "KOFFI", 
      level: "B2", 
      sessionId: sessionB2.id,
      consultationCode: "SMU123"
    },
    { 
      candidateNumber: "2603002", 
      firstName: "Marie", 
      lastName: "AGOSSOU", 
      level: "B2", 
      sessionId: sessionB2.id,
      consultationCode: "XYZ789"
    }
  ];

  for (const c of candidates) {
    await prisma.candidate.create({ data: c });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
