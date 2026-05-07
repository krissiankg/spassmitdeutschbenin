import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE" && session.user.role !== "SECRETARY")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 25;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { candidateNumber: { contains: search, mode: "insensitive" } },
      ]
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        select: {
          id: true,
          candidateNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          totalAmount: true,
          amountPaid: true,
          paymentStatus: true,
          createdAt: true,
          level: true,
          formType: true,
          chosenModules: true,
          prepCourses: true,
          session: { select: { title: true, level: true } },
          enrollments: {
            where: { status: "APPROVED" },
            include: { course: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.candidate.count({ where })
    ]);

    return NextResponse.json({
      candidates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
