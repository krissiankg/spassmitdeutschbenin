import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      include: {
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const sessionCreated = await prisma.session.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        level: body.level,
        status: "DRAFT"
      }
    });

    await recordAuditLog({
      session,
      action: "CREATE_SESSION",
      targetType: "SESSION",
      targetId: sessionCreated.id,
      targetName: sessionCreated.title,
      details: { level: sessionCreated.level, date: sessionCreated.date }
    });

    return NextResponse.json(sessionCreated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
