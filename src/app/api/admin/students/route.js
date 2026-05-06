import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 25;
    const search = searchParams.get('search') || "";
    const searchName = searchParams.get('searchName') || "";
    const searchEmail = searchParams.get('searchEmail') || "";
    const level = searchParams.get('level') || "";
    const skip = (page - 1) * limit;

    try {
        const session = await getAuthSession();
        if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY" && session.user.role !== "ACCOUNTANT")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let where = {
            AND: [
                { formType: 'SIMPLE' }
            ]
        };

        if (search) {
            where.AND.push({
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            });
        }

        if (searchName) {
            where.AND.push({
                OR: [
                    { firstName: { contains: searchName, mode: 'insensitive' } },
                    { lastName: { contains: searchName, mode: 'insensitive' } },
                ]
            });
        }

        if (searchEmail) {
            where.AND.push({
                email: { contains: searchEmail, mode: 'insensitive' }
            });
        }

        if (level) {
            where.AND.push({ level });
        }

    const [students, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where })
    ]);

    return NextResponse.json({
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Fetch students error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
