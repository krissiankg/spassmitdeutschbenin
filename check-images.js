const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tutorials = await prisma.tutorial.findMany();
  for (const t of tutorials) {
    console.log(`Tutorial: ${t.title}`);
    t.content.forEach((step, i) => {
      console.log(`  Step ${i+1}: ${step.imageUrl}`);
    });
  }
}

main().finally(() => prisma.$disconnect());
