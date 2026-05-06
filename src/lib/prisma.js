import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
    console.log(">>> NEW PRISMA CLIENT INITIALIZED. HAS COURSE:", !!global.prisma.course);
  }
  prisma = global.prisma;
  console.log(">>> USING GLOBAL PRISMA. HAS COURSE:", !!prisma.course);
}

export default prisma;
