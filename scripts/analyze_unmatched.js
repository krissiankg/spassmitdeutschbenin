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

  const matchedCandidatesIds = new Set();
  const matchedCsvIndices = new Set();

  for (const candidate of candidates) {
    const candFirst = normalize(candidate.firstName);
    const candLast = normalize(candidate.lastName);

    for (let i = 0; i < contacts.length; i++) {
        const c = contacts[i];
      const csvFirst = normalize(c['Prénom']);
      const csvLast = normalize(c['Nom']);
      
      if ((csvFirst === candFirst && csvLast === candLast) || 
          (csvFirst === candLast && csvLast === candFirst)) {
          if ((c['Courriel '] || c['Courriel'] || '').includes('@')) {
            matchedCandidatesIds.add(candidate.id);
            matchedCsvIndices.add(i);
          }
      }
    }
  }

  const unmatchedCandidates = candidates.filter(c => !matchedCandidatesIds.has(c.id));
  const unmatchedCsv = contacts.filter((c, i) => !matchedCsvIndices.has(i)).filter(c => (c['Courriel '] || c['Courriel'] || '').includes('@'));

  console.log(`Candidats restants sans email en BD: ${unmatchedCandidates.length}`);
  console.log(`Contacts restants avec email dans le CSV: ${unmatchedCsv.length}`);
  
  console.log('\n--- 10 premiers candidats restants sans email ---');
  unmatchedCandidates.slice(0, 10).forEach(c => console.log(`${c.firstName} ${c.lastName}`));
  
  console.log('\n--- 10 premiers contacts CSV non matchés ---');
  unmatchedCsv.slice(0, 10).forEach(c => console.log(`${c['Prénom']} ${c['Nom']} -> ${c['Courriel '] || c['Courriel']}`));
}

main().finally(async () => await prisma.$disconnect());
