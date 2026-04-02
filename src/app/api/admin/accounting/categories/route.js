import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "SECRETARY")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const categories = await prisma.pricingCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

    const newCategory = await prisma.pricingCategory.create({
      data: { name, description },
    });
    return NextResponse.json(newCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id, name, description } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID et Nom requis" }, { status: 400 });

    const updatedCategory = await prisma.pricingCategory.update({
      where: { id },
      data: { name, description },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT")) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    await prisma.pricingCategory.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
