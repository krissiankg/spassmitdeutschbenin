const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

const candidatesData = {
  "A1": [
    { "nom": "AKOTONOU Christine", "modules": ["Gesamt"] },
    { "nom": "MOZIMO Marvelous", "modules": ["Gesamt"] },
    { "nom": "SABO Olafoumi", "modules": ["Gesamt"] },
    { "nom": "TAÏROU ZANFARA Iptissam", "modules": ["Gesamt"] }
  ],
  "A2": [
    { "nom": "DOHOU Kissmath", "modules": ["Gesamt"] }
  ],
  "B1": [
    { "nom": "ZINSOU Mariama", "modules": ["Gesamt"] },
    { "nom": "AHIKPON Géraud", "modules": ["Gesamt"] },
    { "nom": "FONTON Expédit", "modules": ["Gesamt"] },
    { "nom": "FAGNON Natacha", "modules": ["Gesamt"] },
    { "nom": "AMOUSSOU Félicien", "modules": ["Gesamt"] },
    { "nom": "AMOUSSOU Marie-Rose", "modules": ["Gesamt"] },
    { "nom": "AGBOHOUTO Abed", "modules": ["Gesamt"] },
    { "nom": "AHIKPON Carmel", "modules": ["Gesamt"] },
    { "nom": "MONTCHO Michel", "modules": ["Gesamt"] },
    { "nom": "ADANDE Christiano", "modules": ["Gesamt"] },
    { "nom": "PAKAPOH Samuel", "modules": ["Gesamt"] },
    { "nom": "YABI Rafiatou", "modules": ["Gesamt"] },
    { "nom": "ANAGONOU Jean-Pierre", "modules": ["Gesamt"] },
    { "nom": "ESSE Elodie", "modules": ["Gesamt"] },
    { "nom": "INOUSSA Michkath", "modules": ["Gesamt"] },
    { "nom": "KOUSSOUGBO Christian", "modules": ["Gesamt"] },
    { "nom": "TCHOKONA Bérénice", "modules": ["Gesamt"] },
    { "nom": "JAKOU Richard", "modules": ["Gesamt"] },
    { "nom": "QUENUM Borgia", "modules": ["Gesamt"] },
    { "nom": "DJATCHI Hamdiya", "modules": ["Hören", "Schreiben"] },
    { "nom": "ABAHOU Thierry", "modules": ["Gesamt"] },
    { "nom": "MOUSTAPHA Faïkoth", "modules": ["Gesamt"] },
    { "nom": "BA-AGBA Marwiyath", "modules": ["Gesamt"] },
    { "nom": "ADJEDJEGO Mechack", "modules": ["Gesamt"] },
    { "nom": "ZINSOU Roxane", "modules": ["Gesamt"] },
    { "nom": "YEDJANLOGNON Whalis", "modules": ["Gesamt"] },
    { "nom": "SANNI Sinantou", "modules": ["Gesamt"] },
    { "nom": "VISSOH Jean-Bienvenu", "modules": ["Gesamt"] },
    { "nom": "BEKE Bérénice", "modules": ["Gesamt"] },
    { "nom": "AGBESSI Estelle", "modules": ["Gesamt"] },
    { "nom": "SANNI Youssira", "modules": ["Gesamt"] },
    { "nom": "SAH Guillaume", "modules": ["Gesamt"] },
    { "nom": "HOUNDETE Dickens", "modules": ["Gesamt"] },
    { "nom": "KOUTON Hubert", "modules": ["Gesamt"] },
    { "nom": "ATCHIDI Brunel", "modules": ["Gesamt"] },
    { "nom": "AHEGNI Déo-Gratias", "modules": ["Gesamt"] },
    { "nom": "LANDOU Kossimé", "modules": ["Gesamt"] },
    { "nom": "TAÏROU Houriyath", "modules": ["Gesamt"] },
    { "nom": "HOUNGUEVOU Eunicia", "modules": ["Gesamt"] },
    { "nom": "ALAO Achabi", "modules": ["Gesamt"] },
    { "nom": "HOUNKPEVI Kamal", "modules": ["Gesamt"] },
    { "nom": "ATCHIPA Merveille", "modules": ["Gesamt"] },
    { "nom": "KPADENOU Maéla", "modules": ["Gesamt"] },
    { "nom": "DOSSOU Jespéro", "modules": ["Gesamt"] },
    { "nom": "ADJAVOUNVOUN Bérénice", "modules": ["Gesamt"] },
    { "nom": "AGOSSOU Monel", "modules": ["Gesamt"] },
    { "nom": "QUENUM Gabin", "modules": ["Gesamt"] },
    { "nom": "HOUNGBEDJI Arafat", "modules": ["Gesamt"] },
    { "nom": "FONTON Emma", "modules": ["Gesamt"] },
    { "nom": "TOMTOKOM Same", "modules": ["Gesamt"] },
    { "nom": "ATCHADE Opportune", "modules": ["Gesamt"] },
    { "nom": "HOUNGA Laura", "modules": ["Gesamt"] },
    { "nom": "ACOGO Thalès", "modules": ["Gesamt"] },
    { "nom": "AKADIRI Wifak", "modules": ["Gesamt"] },
    { "nom": "AWOMI Béatrice", "modules": ["Gesamt"] },
    { "nom": "BOCO Cédric", "modules": ["Gesamt"] },
    { "nom": "SOSSOUKPE Yolande", "modules": ["Gesamt"] },
    { "nom": "AKADIRI Kamil", "modules": ["Gesamt"] },
    { "nom": "FAGLA Déo-Gratias", "modules": ["Gesamt"] },
    { "nom": "DANTE Ibrahim", "modules": ["Gesamt"] },
    { "nom": "YANKEP Claudia Melissa", "modules": ["Gesamt"] },
    { "nom": "GANDONOU Modestie", "modules": ["Lesen", "Hören", "Schreiben"] },
    { "nom": "BIAOU Isnelle", "modules": ["Lesen", "Hören", "Schreiben"] },
    { "nom": "TAVI Alex", "modules": ["Lesen", "Hören"] },
    { "nom": "AGOSSOUVO Donald", "modules": ["Lesen", "Hören", "Sprechen"] },
    { "nom": "DOVONOU Brigitte", "modules": ["Lesen", "Schreiben", "Sprechen"] },
    { "nom": "MENOU Comlan", "modules": ["Schreiben"] },
    { "nom": "SABO Olafoumi", "modules": ["Lesen", "Hören", "Schreiben"] },
    { "nom": "ATCHRIMI Jean", "modules": ["Lesen", "Hören", "Schreiben"] },
    { "nom": "LEJIOGUIA Isabelle", "modules": ["Lesen", "Hören"] },
    { "nom": "AKOAKOU Solange", "modules": ["Schreiben", "Sprechen"] },
    { "nom": "MONTCHO Arthur", "modules": ["Schreiben"] },
    { "nom": "MALATE Lisette", "modules": ["Hören"] },
    { "nom": "GODONOU J. Richard", "modules": ["Lesen", "Hören", "Sprechen"] }
  ],
  "B2": [
    { "nom": "KANLINSOU Mechack", "modules": ["Gesamt"] },
    { "nom": "POUSSEU Esther", "modules": ["Gesamt"] },
    { "nom": "SIMEN Eva", "modules": ["Gesamt"] },
    { "nom": "AWANOU Olivier", "modules": ["Gesamt"] },
    { "nom": "SOSSOUKPE Stella Yolande", "modules": ["Gesamt"] },
    { "nom": "ANIFA Daniel", "modules": ["Gesamt"] },
    { "nom": "TCHANO Antoine", "modules": ["Gesamt"] },
    { "nom": "ANIFA Conceptia", "modules": ["Gesamt"] },
    { "nom": "TCHANOU Marlène", "modules": ["Gesamt"] },
    { "nom": "ARMATOE Lawrence", "modules": ["Gesamt"] },
    { "nom": "ADJIKOUIN Luc Davy", "modules": ["Gesamt"] },
    { "nom": "VLAVONOU Herbert", "modules": ["Mündlich"] },
    { "nom": "DAANON Sergio", "modules": ["Gesamt"] },
    { "nom": "OUSMANE Nadjahatou", "modules": ["Gesamt"] },
    { "nom": "AÏGBAN Tania", "modules": ["Gesamt"] },
    { "nom": "DADI Adonis", "modules": ["Gesamt"] },
    { "nom": "MALATE Lissette", "modules": ["Gesamt"] },
    { "nom": "MADOUGOU Oubédoulaye", "modules": ["Gesamt"] },
    { "nom": "DOSSA Tatiana", "modules": ["Mündlich"] }
  ]
};

const levels = ["A1", "A2", "B1", "B2"];
const moduleNames = ["Lesen", "Hören", "Schreiben", "Sprechen"];

function generateConsultationCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function main() {
  console.log("Démarrage de l'importation...");

  // 1. Création de la Session
  const session = await prisma.session.upsert({
    where: { id: "osh-mars-2026" },
    update: {},
    create: {
      id: "osh-mars-2026",
      title: "ÖSD - Mars 2026",
      date: new Date("2026-03-15"),
      level: "Multi-Niveaux",
      status: "DRAFT"
    }
  });
  console.log("Session créée/vérifiée:", session.title);

  // 2. Création des Modules par niveau
  const modulesByLevel = {};
  for (const level of levels) {
    modulesByLevel[level] = {};
    for (const name of moduleNames) {
      const code = `${level}-${name.substring(0, 3).toUpperCase()}`;
      const module = await prisma.module.upsert({
        where: { id: code },
        update: {},
        create: {
          id: code,
          name: name,
          code: code,
          level: level,
          maxScore: level === "B1" ? 100 : 25, // Adapté selon les standards ÖSD
          coeff: 1.0
        }
      });
      modulesByLevel[level][name] = module;
    }
  }
  console.log("Modules créés/vérifiés.");

  // 3. Importation des Candidats
  let totalCandidates = 0;
  for (const [level, candidates] of Object.entries(candidatesData)) {
    for (const data of candidates) {
      const names = data.nom.split(" ");
      const lastName = names[0];
      const firstName = names.slice(1).join(" ");
      
      const candidateCode = generateConsultationCode();
      const candidateNumber = `${level}-2026-${totalCandidates + 101}`;

      const candidate = await prisma.candidate.create({
        data: {
          firstName: firstName || "N/A",
          lastName: lastName,
          candidateNumber: candidateNumber,
          consultationCode: candidateCode,
          level: level,
          sessionId: session.id,
          center: "Spass mit Deutsch Benin",
        }
      });

      // 4. Création du Résultat et liaison aux modules
      const selectedModules = data.modules.includes("Gesamt") 
        ? moduleNames 
        : data.modules.map(m => m === "Mündlich" ? "Sprechen" : m);

      const result = await prisma.result.create({
        data: {
          candidateId: candidate.id,
          sessionId: session.id,
          status: "DRAFT"
        }
      });

      for (const moduleName of selectedModules) {
        const mod = modulesByLevel[level][moduleName];
        if (mod) {
          await prisma.moduleScore.create({
            data: {
              resultId: result.id,
              moduleId: mod.id,
              score: 0 // Initialisé à 0
            }
          });
        }
      }

      totalCandidates++;
    }
  }

  console.log(`Importation terminée ! ${totalCandidates} candidats importés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
