import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    let settings = await prisma.formSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      settings = await prisma.formSettings.create({
        data: { id: "global", isOpen: true, closingMessage: "Les inscriptions sont actuellement fermées." }
      });
    }

    const fields = await prisma.formField.findMany({
      orderBy: { order: 'asc' }
    });

    const sessionsData = await prisma.session.findMany({
      orderBy: { date: 'desc' },
      select: { id: true, title: true, level: true, status: true, date: true }
    });

    const pricingsData = await prisma.pricing.findMany({
      orderBy: { category: 'asc' }
    });

    return NextResponse.json({ settings, fields, sessionsData, pricingsData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { action, payload } = body;

    // Toggle Portal Open/Close & Message
    if (action === 'TOGGLE_PORTAL') {
      const updated = await prisma.formSettings.update({
        where: { id: "global" },
        data: { 
          isOpen: payload.isOpen, 
          closingMessage: payload.closingMessage,
          activeSessions: payload.activeSessions
        }
      });
      return NextResponse.json(updated);
    }
    
    // Toggle Pricing isActive
    if (action === 'TOGGLE_PRICING') {
      const updated = await prisma.pricing.update({
        where: { id: payload.pricingId },
        data: { isActive: payload.isActive }
      });
      return NextResponse.json(updated);
    }

    // Add new Field
    if (action === 'ADD_FIELD') {
      const field = await prisma.formField.create({
        data: {
          label: payload.label,
          type: payload.type,
          required: payload.required,
          options: payload.options || [],
          order: payload.order || 0
        }
      });
      return NextResponse.json(field);
    }

    // Delete Field
    if (action === 'DELETE_FIELD') {
      await prisma.formField.delete({ where: { id: payload.id } });
      return NextResponse.json({ success: true });
    }

    // Update Field
    if (action === 'UPDATE_FIELD') {
      const field = await prisma.formField.update({
        where: { id: payload.id },
        data: {
          label: payload.label,
          type: payload.type,
          required: payload.required,
          options: payload.options || [],
          order: payload.order
        }
      });
      return NextResponse.json(field);
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
