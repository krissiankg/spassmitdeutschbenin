const { recordAuditLog } = require("./src/lib/audit");

async function test() {
  const mockSession = {
    user: {
      email: "admin@test.com",
      name: "Test Admin",
      role: "SUPER_ADMIN"
    }
  };

  try {
    const log = await recordAuditLog({
      session: mockSession,
      action: "TEST_ACTION",
      targetType: "SYSTEM",
      targetName: "Test Target",
      details: { foo: "bar" }
    });
    console.log("Log recorded:", log);
  } catch (e) {
    console.error("Failed to record log:", e.message);
  }
}

test();
