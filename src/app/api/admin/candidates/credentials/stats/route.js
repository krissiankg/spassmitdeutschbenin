import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [totalCandidates, withoutAccess, totalLms] = await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.count({
        where: {
          OR: [
            { lmsPassword: null },
            { lmsPassword: "" }
          ]
        }
      }),
      prisma.candidate.count({
        where: {
          NOT: { lmsPassword: null }
        }
      })
    ]);

    return NextResponse.json({
      total: totalCandidates,
      withoutAccess,
      totalLms
    });
  } catch (error) {
    console.error("LMS Stats API Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
