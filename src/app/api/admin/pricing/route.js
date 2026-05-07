import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const pricings = await prisma.pricing.findMany({
      orderBy: [{ level: 'asc' }, { category: 'asc' }, { label: 'asc' }]
    });

    return NextResponse.json(pricings);
  } catch (err) {
    return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { code, label, price, category, level } = body;

    const newPricing = await prisma.pricing.create({
      data: { code, label, price: Number(price), category, level }
    });

    return NextResponse.json(newPricing);
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { id, price, label, category, code, level } = body;

    const updated = await prisma.pricing.update({
      where: { id },
      data: { price: Number(price), label, category, code, level }
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    await prisma.pricing.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

