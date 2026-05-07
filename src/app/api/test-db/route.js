import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const total = await prisma.candidate.count();
    const simple = await prisma.candidate.count({ where: { formType: 'SIMPLE' } });
    const osd = await prisma.candidate.count({ where: { formType: 'OSD' } });
    const nulls = await prisma.candidate.count({ where: { formType: null } });
    const empty = await prisma.candidate.count({ where: { formType: '' } });
    
    const types = await prisma.candidate.groupBy({
        by: ['formType'],
        _count: true
    });

    return NextResponse.json({
      total,
      simple,
      osd,
      nulls,
      empty,
      types
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
