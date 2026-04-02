const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    const log = await prisma.auditLog.create({
      data: {
        adminEmail: "test@spassmitdeutsch.com",
        adminName: "Automated Test",
        action: "TEST_SYSTEM",
        targetType: "SYSTEM",
        targetName: "Initial Setup",
        details: { status: "Active" }
      }
    });
    console.log("SUCCESS: Audit record created with ID:", log.id);
  } catch (e) {
    console.error("FAILURE creating audit record:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
