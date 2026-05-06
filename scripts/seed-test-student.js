const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = "test@student.com";
  const passwordClear = "Password123!";
  const hashedPassword = await bcrypt.hash(passwordClear, 10);

  // Check if test student already exists
  const existing = await prisma.candidate.findFirst({ where: { email } });

  if (existing) {
    await prisma.candidate.updateMany({
      where: { email },
      data: { lmsPassword: hashedPassword }
    });
    console.log(`L'étudiant ${email} existait déjà. Son mot de passe a été réinitialisé à : ${passwordClear}`);
  } else {
    // Need a session to link the candidate
    const session = await prisma.session.findFirst();
    if (!session) {
      console.log("Erreur: Aucune session d'examen trouvée dans la base. Créez-en une d'abord.");
      return;
    }

    await prisma.candidate.create({
      data: {
        candidateNumber: "SMD-TEST01",
        firstName: "Test",
        lastName: "Student",
        email: email,
        lmsPassword: hashedPassword,
        consultationCode: "TEST66",
        level: "B1",
        sessionId: session.id,
        status: "APPROVED",
        paymentStatus: "PAID",
        amountPaid: 45000,
        totalAmount: 45000
      }
    });
    console.log(`Étudiant de test créé avec succès !`);
    console.log(`Email : ${email}`);
    console.log(`Mot de passe : ${passwordClear}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
