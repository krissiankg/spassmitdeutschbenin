import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Candidates
    const totalCandidates = await prisma.candidate.count();

    // 2. Active Sessions (Not ARCHIVED)
    const activeSessionsCount = await prisma.session.count({
      where: {
        status: { in: ["DRAFT", "PUBLISHED"] }
      }
    });

    // 3. Published Results
    const publishedResultsCount = await prisma.result.count({
      where: {
        status: "PUBLISHED"
      }
    });

    // 4. Pending Results (Candidates in non-archived sessions without a result record or with DRAFT result)
    // For simplicity, let's count results with status DRAFT
    const pendingResultsCount = await prisma.result.count({
      where: {
        status: "DRAFT"
      }
    });

    // 5. Recent Sessions
    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { candidates: true }
        }
      }
    });

    // 6. Level Distribution
    const levelsQuery = await prisma.candidate.groupBy({
      by: ['level'],
      _count: { level: true }
    });
    const levelDistribution = levelsQuery.map(l => ({ name: l.level, value: l._count.level }));

    // 7. Monthly Registrations (Approximation over the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const candidatesRecent = await prisma.candidate.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const monthlyMap = {};
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthlyMap[`${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`] = 0;
    }

    candidatesRecent.forEach(c => {
      const d = new Date(c.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyMap[key] !== undefined) {
          monthlyMap[key]++;
      }
    });

    const monthlyRegistrations = Object.keys(monthlyMap).map(k => ({ name: k, total: monthlyMap[k] }));

    return NextResponse.json({
      stats: {
        totalCandidates,
        activeSessions: activeSessionsCount,
        publishedResults: publishedResultsCount,
        pendingResults: pendingResultsCount
      },
      levelDistribution,
      monthlyRegistrations,
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        name: s.title,
        level: s.level,
        students: s._count.candidates,
        status: s.status === "PUBLISHED" ? "Publié" : s.status === "DRAFT" ? "En cours" : "Archivé"
      }))
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
