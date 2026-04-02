import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pricings = await prisma.pricing.findMany({
      orderBy: [{ level: 'asc' }, { category: 'asc' }, { label: 'asc' }]
    });
    return NextResponse.json(pricings);
  } catch (err) {
    return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
  }
}
