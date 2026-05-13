import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isPublished = searchParams.get("published");

    const where = {};
    if (category && category !== "ALL") where.category = category;
    
    if (isPublished !== null) {
      where.isPublished = isPublished === "true";
    }

    // Restriction : Si pas Super Admin, on ne voit QUE les publiés
    if (session.user.role !== "SUPER_ADMIN") {
      where.isPublished = true;
    }

    const tutorials = await prisma.tutorial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(tutorials);
  } catch (error) {
    console.error("[TUTORIALS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch tutorials" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tutorial = await prisma.tutorial.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || "GENERAL",
        content: body.content || [],
        isPublished: body.isPublished || false,
        authorEmail: session.user.email
      }
    });

    await recordAuditLog({
      session,
      action: "CREATE_TUTORIAL",
      targetType: "TUTORIAL",
      targetId: tutorial.id,
      targetName: tutorial.title,
      details: { category: tutorial.category }
    });

    return NextResponse.json(tutorial);
  } catch (error) {
    console.error("[TUTORIALS_POST]", error);
    return NextResponse.json({ error: "Failed to create tutorial" }, { status: 500 });
  }
}
