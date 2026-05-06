import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");

    const where = {};
    if (level && level !== "Multi-niveaux" && level !== "undefined" && level !== "null") {
      where.level = level;
    }

    let modules = await prisma.module.findMany({
      where,
      orderBy: { code: 'asc' }
    });

    // Fallback: if no modules found for specific level, return all
    if (modules.length === 0 && level && level !== "Multi-niveaux") {
        modules = await prisma.module.findMany({
            orderBy: { code: 'asc' }
        });
    }

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Failed to fetch modules:", error);
    return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
  }
}
