const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { name: "Mechack ADJEDJEGO", email: "adjedjegogeorbeni@gmail.com" },
    { name: "Déo-Gratias AHEGNI", email: "ahegnigracias@gmail.com" },
    { name: "Conceptia ANIFA", email: "anifaconceptia@gmail.com" },
    { name: "Lawrence ARMATOE", email: "lawrencekdj2@gmail.com" },
    { name: "Opportune ATCHADE", email: "olgatchade@gmail.com" },
    { name: "Merveille ATCHIPA", email: "achikpamerveille@gmail.com" },
    { name: "Kissmath DOHOU", email: "romarictochoedo@yahoo.fr" },
    { name: "Maéla KPADENOU", email: "oliviakpadenou@gmail.com" },
    { name: "Comlan MENOU", email: "menoucom@gmail.com" },
    { name: "Sinantou SANNI", email: "sinantousanni@gmail.com" },
    { name: "ZANFARA Iptissam TAÏROU", email: "itpisammezanfara@gmail.com" },
    { name: "Bérénice TCHOKONA", email: "bernicesoniatchokona@gmail.com" },
  ];

  for (const update of updates) {
    const parts = update.name.split(' ');
    const lastName = parts.pop();
    const firstName = parts.join(' ');
    
    await prisma.candidate.updateMany({
      where: {
        firstName: firstName,
        lastName: lastName,
        email: null
      },
      data: { email: update.email }
    });
  }

  const remainingCount = await prisma.candidate.count({
    where: { email: null }
  });

  const remainingCandidates = await prisma.candidate.findMany({
    where: { email: null },
    orderBy: { lastName: 'asc' }
  });

  console.log(`Mise à jour effectuée avec succès.`);
  console.log(`\n--- Candidats restants sans email (${remainingCount}) ---`);
  remainingCandidates.forEach(c => console.log(`${c.firstName} ${c.lastName}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
