import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { candidateNumber, consultationCode } = await request.json();

    if (!candidateNumber || !consultationCode) {
      return NextResponse.json(
        { error: "Numéro de candidat et code de consultation requis." },
        { status: 400 }
      );
    }

    // 1. Find the candidate by number
    const candidate = await prisma.candidate.findUnique({
      where: { candidateNumber: candidateNumber.trim() },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Aucun candidat trouvé avec ce numéro." },
        { status: 404 }
      );
    }

    // 2. Verify the consultation code
    if (candidate.consultationCode !== consultationCode.trim()) {
      return NextResponse.json(
        { error: "Code de consultation incorrect." },
        { status: 401 }
      );
    }

    // 3. Fetch all PUBLISHED results for this candidate
    const results = await prisma.result.findMany({
      where: {
        candidateId: candidate.id,
        status: "PUBLISHED",
      },
      include: {
        session: true,
        moduleScores: {
          include: {
            module: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Aucun résultat publié pour ce candidat. Veuillez réessayer ultérieurement." },
        { status: 404 }
      );
    }

    // 4. Format the response
    const formattedResults = results.map((r) => ({
      id: r.id,
      session: {
        id: r.session.id,
        title: r.session.title,
        date: r.session.date,
        level: r.session.level,
      },
      moduleScores: r.moduleScores
        .map((ms) => ({
          moduleName: ms.module.name,
          moduleCode: ms.module.code,
          score: ms.score,
          maxScore: ms.module.maxScore,
        }))
        .sort((a, b) => a.moduleName.localeCompare(b.moduleName)),
      total: r.total,
      average: r.average,
      mention: r.mention,
      decision: r.decision,
      publishedAt: r.publishedAt || r.updatedAt,
    }));

    return NextResponse.json({
      candidate: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        candidateNumber: candidate.candidateNumber,
        level: candidate.level,
        center: candidate.center,
      },
      results: formattedResults,
    });
  } catch (error) {
    console.error("Consultation API error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
