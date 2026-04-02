import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 25;
    const skip = (page - 1) * limit;
    const action = searchParams.get('action') || "All";
    const admin = searchParams.get('admin') || "All";

    const where = {};
    if (action !== "All") where.action = action;
    if (admin !== "All") where.adminEmail = admin;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("GET Audit Logs Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const beforeDate = searchParams.get('before'); // Date format e.g., "2024-01-01"

    if (!beforeDate) {
      return NextResponse.json({ error: "Date limite requise" }, { status: 400 });
    }

    const deleteResult = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(beforeDate)
        }
      }
    });

    // Logger l'action de nettoyage elle-même !
    await prisma.auditLog.create({
        data: {
            adminEmail: session.user.email,
            adminName: session.user.name,
            action: "CLEANUP_LOGS",
            targetType: "SYSTEM",
            targetName: `Nettoyage des logs avant le ${beforeDate}`,
            details: { count: deleteResult.count }
        }
    });

    return NextResponse.json({ 
        message: `${deleteResult.count} logs supprimés avec succès`,
        count: deleteResult.count 
    });

  } catch (error) {
    console.error("DELETE Audit Logs Error:", error);
    return NextResponse.json({ error: "Erreur serveur lors du nettoyage" }, { status: 500 });
  }
}
