const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check if a session exists
  let session = await prisma.session.findFirst();
  if (!session) {
    session = await prisma.session.create({
      data: {
        title: "Session Test Consultation",
        date: new Date(),
        level: "B2",
        status: "PUBLISHED"
      }
    });
  } else {
    // Make sure we have a published session for the test
    session = await prisma.session.update({
      where: { id: session.id },
      data: { status: 'PUBLISHED' }
    });
  }

  // Create a candidate
  const candidate = await prisma.candidate.upsert({
    where: { candidateNumber: "12345678" },
    update: { sessionId: session.id, consultationCode: "SECRET123" },
    create: {
      candidateNumber: "12345678",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@test.com",
      level: "B2",
      consultationCode: "SECRET123",
      sessionId: session.id
    }
  });

  // Check if modules exist
  let moduleLese = await prisma.module.findFirst({ where: { code: 'LESE' } });
  if (!moduleLese) {
    moduleLese = await prisma.module.create({
      data: { name: 'Leseverstehen', code: 'LESE', maxScore: 25, level: 'B2', coeff: 1.0 }
    });
  }

  // Create published result
  const result = await prisma.result.create({
    data: {
      candidateId: candidate.id,
      sessionId: session.id,
      total: 85,
      average: 21.25,
      mention: "BIEN",
      decision: "ADMIS",
      status: "PUBLISHED",
      moduleScores: {
        create: [
          { moduleId: moduleLese.id, score: 22 }
        ]
      }
    }
  });

  console.log('SUCCESS! Credentials:');
  console.log('Numéro de candidat: 12345678');
  console.log('Code de consultation: SECRET123');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
