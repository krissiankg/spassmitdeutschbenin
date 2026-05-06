import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const body = await request.json();
    
    // Check for unique constraints manually to give better errors
    if (body.candidateNumber) {
      const existingCandidateNumber = await prisma.candidate.findFirst({
        where: { candidateNumber: body.candidateNumber, NOT: { id } }
      });
      if (existingCandidateNumber) {
        return NextResponse.json({ error: "Ce numéro de candidat est déjà utilisé" }, { status: 400 });
      }
    }

    if (body.consultationCode) {
      const existingCode = await prisma.candidate.findFirst({
        where: { consultationCode: body.consultationCode, NOT: { id } }
      });
      if (existingCode) {
        return NextResponse.json({ error: "Ce code de consultation est déjà utilisé" }, { status: 400 });
      }
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        candidateNumber: body.candidateNumber,
        consultationCode: body.consultationCode,
        level: body.level,
        sessionId: body.sessionId,
        formType: body.formType,
        customData: body.customData || {}
      }
    });

    await recordAuditLog({
      session: sessionAuth,
      action: "UPDATE_CANDIDATE",
      targetType: "CANDIDATE",
      targetId: id,
      targetName: `${updated.firstName} ${updated.lastName}`,
      details: { changedFields: Object.keys(body) }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Candidate error:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || sessionAuth.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      select: { firstName: true, lastName: true, candidateNumber: true }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }

    await prisma.candidate.delete({
      where: { id }
    });

    await recordAuditLog({
      session: sessionAuth,
      action: "DELETE_CANDIDATE",
      targetType: "CANDIDATE",
      targetId: id,
      targetName: `${candidate.firstName} ${candidate.lastName}`,
      details: { candidateNumber: candidate.candidateNumber }
    });

    return NextResponse.json({ message: "Candidat supprimé avec succès" });
  } catch (error) {
    console.error("DELETE Candidate error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
