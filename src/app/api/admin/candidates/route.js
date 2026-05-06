import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';
import { generateCode } from "@/lib/utils";

import { getAuthSession } from "@/lib/auth";

export async function GET(request) {
  const sessionAuth = await getAuthSession();
  if (!sessionAuth || (sessionAuth.user.role !== "SUPER_ADMIN" && sessionAuth.user.role !== "ACCOUNTANT" && sessionAuth.user.role !== "SECRETARY")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 25;
  const search = searchParams.get('search') || "";
  const level = searchParams.get('level') || "All";
  const sessionId = searchParams.get('sessionId') || "All";
  const type = searchParams.get('type') || "OSD"; // Default to OSD for backward compatibility with the candidates page
  const skip = (page - 1) * limit;

  try {
    const where = {};
    if (type !== "All") where.formType = type;
    if (sessionId !== "All") where.sessionId = sessionId;
    if (level !== "All") where.level = level;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { candidateNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [candidatesRaw, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          results: true,
          session: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where })
    ]);

    // Omit sensitive fields from the response
    const candidates = candidatesRaw.map(c => {
      const { lmsPassword, resetToken, twoFactorSecret, ...safeCandidate } = c;
      return safeCandidate;
    });

    return NextResponse.json({
      candidates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Fetch candidates error:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || (sessionAuth.user.role !== "SUPER_ADMIN" && sessionAuth.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    
    // Check constraints
    if (body.candidateNumber) {
        const existNum = await prisma.candidate.findFirst({ where: { candidateNumber: body.candidateNumber }});
        if (existNum) return NextResponse.json({ error: "Numéro de candidat déjà utilisé" }, { status: 400 });
    }
    if (body.consultationCode) {
        const existCode = await prisma.candidate.findFirst({ where: { consultationCode: body.consultationCode }});
        if (existCode) return NextResponse.json({ error: "Code secret déjà utilisé" }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        candidateNumber: body.candidateNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        level: body.level,
        sessionId: body.sessionId,
        formType: body.formType || "OSD",
        consultationCode: body.consultationCode || generateCode()
      }
    });
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
