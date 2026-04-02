import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidates, sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "ID de session requis" }, { status: 400 });
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: "Aucun candidat à importer" }, { status: 400 });
    }

    // Determine the next candidate numbers if they are missing
    // For now, assume researchers provide them or we generate random 8-digit codes
    
    const results = await prisma.$transaction(
      candidates.map((c) => {
        // Simple mapping: Nom -> lastName, Prénom -> firstName, Email -> email, etc.
        return prisma.candidate.upsert({
          where: { candidateNumber: c.candidateNumber?.toString() || "" },
          update: {
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            level: c.level || "B2",
            center: c.center || "Cotonou",
            sessionId: sessionId,
            consultationCode: c.consultationCode || Math.random().toString(36).substring(2, 10).toUpperCase(),
          },
          create: {
            candidateNumber: c.candidateNumber?.toString() || Math.floor(10000000 + Math.random() * 90000000).toString(),
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            level: c.level || "B2",
            center: c.center || "Cotonou",
            sessionId: sessionId,
            consultationCode: c.consultationCode || Math.random().toString(36).substring(2, 10).toUpperCase(),
          },
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      message: `${results.length} candidats importés avec succès.`
    });
  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'import des candidats" }, { status: 500 });
  }
}
