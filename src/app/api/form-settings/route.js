import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.formSettings.findUnique({ where: { id: "global" } });
    if (!settings) settings = { isOpen: true, closingMessage: "", activeSessions: [] };

    const fields = await prisma.formField.findMany({
      orderBy: { order: 'asc' }
    });

    const activeSessions = await prisma.session.findMany({
      where: {
        id: { in: settings.activeSessions },
        status: "PUBLISHED"
      },
      orderBy: { date: 'desc' }
    });

    const activePricings = await prisma.pricing.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    return NextResponse.json({ settings, fields, activeSessions, activePricings });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
