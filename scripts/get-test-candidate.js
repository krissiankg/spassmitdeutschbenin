const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.result.findFirst({
    where: { status: 'PUBLISHED' },
    include: { candidate: true }
  });

  if (result) {
    console.log(`CANDIDAT TROUVE! Numero: ${result.candidate.candidateNumber} | Code: ${result.candidate.consultationCode}`);
  } else {
    console.log('NO_PUBLISHED');
  }
}
main().finally(() => prisma.$disconnect());
