const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const count = await prisma.auditLog.count();
    console.log("AuditLog table exists, count:", count);
  } catch (e) {
    console.error("AuditLog table does NOT exist or error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
