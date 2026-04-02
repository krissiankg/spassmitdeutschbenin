const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(__dirname, '../contacts_export_ba8dbcba88d8c9c285acb565909bfcdd.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  const contacts = parsed.data;

  // Récupérer les 29 candidats restants sans email
  const candidates = await prisma.candidate.findMany({
    where: { email: { equals: null } },
    orderBy: { lastName: 'asc' }
  });

  const normalize = (str) => {
    if (!str) return '';
    return str.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // On refait le même algo pour trouver les contacts non utilisés
  const matchedCsvIndices = new Set();
  const allCandidates = await prisma.candidate.findMany(); // tous les candidats pour voir les correspondances globales

  for (const candidate of allCandidates) {
    if (!candidate.email) continue; // il a déjà un email, peut provenir du csv ou non, on va supposer qu'on cherche juste ceux du csv
  }

  // En fait, on a juste besoin des emails qui sont dans le CSV.
  // Les contacts CSV qui ne sont pas dans la base `candidate` (on peut comparer par l'email)
  const dbEmails = new Set(allCandidates.filter(c => c.email).map(c => c.email.toLowerCase().trim()));
  
  const unmatchedCsv = contacts.filter((c) => {
      const email = (c['Courriel '] || c['Courriel'] || '').toLowerCase().trim();
      if (!email || !email.includes('@')) return false; // si pas d'email valide, on l'ignore
      return !dbEmails.has(email); // s'il n'est pas déjà en base, il est orphelin
  });

  const unmatchedCandidates = candidates.map(c => `${c.firstName} ${c.lastName}`);
  const orphanCsvContacts = unmatchedCsv.map(c => `${c['Prénom']} ${c['Nom']} (${c['Courriel '] || c['Courriel']})`);

  fs.writeFileSync('final_lists.json', JSON.stringify({
      unmatchedCandidates,
      orphanCsvContacts
  }, null, 2));

  console.log("Fichier généré.");
}

main().finally(async () => await prisma.$disconnect());
