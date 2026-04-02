const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordSecretary = await bcrypt.hash("secretaire123", 10);

  // Création du SuperAdmin
  const superAdmin = await prisma.admin.upsert({
    where: { email: "admin@spassmitdeutsch.com" },
    update: { password: hashedPasswordAdmin },
    create: {
      name: "Admin SMU",
      email: "admin@spassmitdeutsch.com",
      password: hashedPasswordAdmin,
      role: "SUPER_ADMIN",
    },
  });
  console.log("SuperAdmin créé:", superAdmin.email);

  // Création du Secrétaire
  const secretary = await prisma.admin.upsert({
    where: { email: "secretary@spassmitdeutsch.com" },
    update: { password: hashedPasswordSecretary },
    create: {
      name: "Secrétaire SMU",
      email: "secretary@spassmitdeutsch.com",
      password: hashedPasswordSecretary,
      role: "SECRETARY",
    },
  });
  console.log("Secrétaire créé:", secretary.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
