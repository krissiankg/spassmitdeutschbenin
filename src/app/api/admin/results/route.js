import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { getAuthSession } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Session
    const sessionDoc = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!sessionDoc) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Fetch ALL Modules (for Multi-Niveaux support)
    const modules = await prisma.module.findMany();

    // 3. Fetch Candidates and their results for this session
    const candidates = await prisma.candidate.findMany({
      where: { sessionId: sessionId },
      include: {
        results: {
          where: { sessionId: sessionId },
          include: {
            moduleScores: {
                include: { module: true }
            }
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    return NextResponse.json({
      session: sessionDoc,
      modules,
      candidates
    });
  } catch (error) {
    console.error("GET results error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, results } = await request.json();

    if (!sessionId || !results) {
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Transaction to save all results
    const operations = results.map((res) => {
        const { candidateId, scores, total, decision } = res;
        
        return prisma.result.upsert({
            where: {
                // We need a unique constraint or use a find-then-upsert logic
                // Since Result doesn't have a unique composite key on candidateId+sessionId explicitly in schema (it should)
                // We'll use findFirst then update/create for safety if no unique ID provided
                id: res.resultId || 'new-id'
            },
            update: {
                total: parseFloat(total),
                decision: decision,
                moduleScores: {
                    deleteMany: {},
                    create: Object.entries(scores).map(([moduleId, score]) => ({
                        moduleId: moduleId,
                        score: parseFloat(score) || 0
                    }))
                }
            },
            create: {
                candidateId,
                sessionId,
                total: parseFloat(total),
                decision: decision,
                moduleScores: {
                    create: Object.entries(scores).map(([moduleId, score]) => ({
                        moduleId: moduleId,
                        score: parseFloat(score) || 0
                    }))
                }
            }
        });
    });

    // Alternative approach if resultId is not stable: 
    // For each candidate, find or create the result record for the session.
    
    for (const res of results) {
        const { candidateId, scores, total, decision } = res;
        
        let existingResult = await prisma.result.findFirst({
            where: { candidateId, sessionId }
        });

        if (existingResult) {
            await prisma.result.update({
                where: { id: existingResult.id },
                data: {
                    total: parseFloat(total),
                    decision: decision,
                    moduleScores: {
                        deleteMany: {},
                        create: Object.entries(scores).filter(([_, s]) => s !== "").map(([moduleId, score]) => ({
                            moduleId: moduleId,
                            score: parseFloat(score) || 0
                        }))
                    }
                }
            });
        } else {
            await prisma.result.create({
                data: {
                    candidateId,
                    sessionId,
                    total: parseFloat(total),
                    decision: decision,
                    moduleScores: {
                        create: Object.entries(scores).filter(([_, s]) => s !== "").map(([moduleId, score]) => ({
                            moduleId: moduleId,
                            score: parseFloat(score) || 0
                        }))
                    }
                }
            });
        }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST results error:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}
