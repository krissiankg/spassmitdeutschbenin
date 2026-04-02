import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const existingUser = await prisma.admin.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email existe déjà" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    await recordAuditLog({
      session,
      action: "CREATE_ADMIN",
      targetType: "ADMIN",
      targetId: newAdmin.id,
      targetName: `${newAdmin.name} (${newAdmin.email})`,
      details: { role: newAdmin.role }
    });

    return NextResponse.json(newAdmin);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
