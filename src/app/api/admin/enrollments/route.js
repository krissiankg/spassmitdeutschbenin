import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        course: true
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    // Récupérer l'inscription actuelle pour connaître l'ancien statut et le prix
    const oldEnrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { course: true, candidate: true }
    });

    if (!oldEnrollment) {
      return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }

    // Logique de synchronisation du totalAmount du candidat
    let totalAmountChange = 0;
    if (oldEnrollment.status !== "APPROVED" && status === "APPROVED") {
      // On passe à APPROVED : on ajoute le prix
      totalAmountChange = oldEnrollment.course.price;
    } else if (oldEnrollment.status === "APPROVED" && status !== "APPROVED") {
      // On n'est plus APPROVED : on retire le prix
      totalAmountChange = -oldEnrollment.course.price;
    }

    // Mettre à jour le candidat si nécessaire
    if (totalAmountChange !== 0) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: oldEnrollment.candidateId },
        select: { amountPaid: true, totalAmount: true }
      });

      const newTotalAmount = Math.max(0, (candidate.totalAmount || 0) + totalAmountChange);
      
      let paymentStatus = "UNPAID";
      if (newTotalAmount <= 0) {
        paymentStatus = "PAID";
      } else if (candidate.amountPaid >= newTotalAmount) {
        paymentStatus = "PAID";
      } else if (candidate.amountPaid > 0) {
        paymentStatus = "PARTIAL";
      }

      await prisma.candidate.update({
        where: { id: oldEnrollment.candidateId },
        data: {
          totalAmount: newTotalAmount,
          paymentStatus
        }
      });
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : (status === "PENDING" ? null : oldEnrollment.approvedAt)
      }
    });

    // Notification Étudiant si approuvé
    if (status === "APPROVED" && oldEnrollment.status !== "APPROVED") {
      await prisma.notification.create({
        data: {
          recipientCandidateId: oldEnrollment.candidateId,
          title: "Inscription Approuvée",
          message: `Votre inscription au cours "${oldEnrollment.course.name}" a été approuvée. Vous pouvez maintenant y accéder.`,
          type: "SUCCESS"
        }
      });
    }

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error("Update enrollment error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du statut" }, { status: 500 });
  }
}
