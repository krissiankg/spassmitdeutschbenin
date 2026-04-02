const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(__dirname, '../contacts_export_ba8dbcba88d8c9c285acb565909bfcdd.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`Fichier non trouvé : ${csvFilePath}`);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const contacts = parsed.data;
  console.log(`Chargé ${contacts.length} contacts du CSV.`);

  const candidates = await prisma.candidate.findMany({
    orderBy: { lastName: 'asc' }
  });
  console.log(`Trouvé ${candidates.length} candidats en base de données.`);

  let matchCount = 0;
  let updateCount = 0;
  let alreadyHasEmail = 0;

  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ' ') // Garder que alphanum pour comparer
      .replace(/\s+/g, ' ')
      .trim();
  };

  const results = [];

  for (const candidate of candidates) {
    if (candidate.email) {
      alreadyHasEmail++;
      continue;
    }

    const candFirst = normalize(candidate.firstName);
    const candLast = normalize(candidate.lastName);

    // Chercher dans le CSV
    const match = contacts.find(c => {
      const csvFirst = normalize(c['Prénom']);
      const csvLast = normalize(c['Nom']);
      
      const candFirstNames = candFirst.split(' ').filter(w => w.length > 2);
      const candLastNames = candLast.split(' ').filter(w => w.length > 2);
      const csvFirstNames = csvFirst.split(' ').filter(w => w.length > 2);
      const csvLastNames = csvLast.split(' ').filter(w => w.length > 2);
      
      const hasIntersection = (arr1, arr2) => arr1.some(w => arr2.includes(w));
      
      const lastNameMatch = candLast === csvLast || hasIntersection(candLastNames, csvLastNames);
      const firstNameMatch = candFirst === csvFirst || hasIntersection(candFirstNames, csvFirstNames);
      
      const reversedLastNameMatch = candLast === csvFirst || hasIntersection(candLastNames, csvFirstNames);
      const reversedFirstNameMatch = candFirst === csvLast || hasIntersection(candFirstNames, csvLastNames);
      
      return (lastNameMatch && firstNameMatch) || (reversedLastNameMatch && reversedFirstNameMatch);
    });

    if (match) {
      const email = (match['Courriel '] || match['Courriel'] || '').trim();
      if (email && email.includes('@')) {
        matchCount++;
        results.push({
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: email
        });
        
        if (process.argv.includes('--apply')) {
          await prisma.candidate.update({
            where: { id: candidate.id },
            data: { email: email }
          });
          updateCount++;
        }
      }
    }
  }

  console.log('\n--- Détails des matches ---');
  results.forEach(r => console.log(`${r.name} -> ${r.email}`));

  console.log('\n--- Résumé ---');
  console.log(`Candidats sans email : ${candidates.length - alreadyHasEmail}`);
  console.log(`Matches trouvés dans le CSV : ${matchCount}`);
  
  if (process.argv.includes('--apply')) {
    console.log(`Mises à jour effectuées : ${updateCount}`);
  } else {
    console.log(`\n[MODE SIMULATION]`);
    console.log(`Relancez le script avec l'argument --apply pour enregistrer les changements.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
