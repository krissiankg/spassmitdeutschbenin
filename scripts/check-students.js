const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.candidate.findMany({
    where: {
      lmsPassword: { not: null },
      email: { not: null }
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      lmsPassword: true // This is hashed, so it won't help directly unless I know the clear one
    }
  });

  if (students.length === 0) {
    console.log("Aucun étudiant trouvé avec un mot de passe.");
  } else {
    console.log("Étudiants trouvés :");
    students.forEach(s => {
      console.log(`- ${s.firstName} ${s.lastName} : ${s.email} (Mot de passe haché : ${s.lmsPassword.substring(0, 10)}...)`);
    });
    console.log("\nNote: Le mot de passe est haché dans la base. Je vais en créer un nouveau pour le test.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
