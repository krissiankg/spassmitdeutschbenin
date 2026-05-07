import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
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
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    const oldEnrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { course: true, candidate: true }
    });

    if (!oldEnrollment) {
      return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }

    let totalAmountChange = 0;
    if (oldEnrollment.status !== "APPROVED" && status === "APPROVED") {
      totalAmountChange = oldEnrollment.course.price;
    } else if (oldEnrollment.status === "APPROVED" && status !== "APPROVED") {
      totalAmountChange = -oldEnrollment.course.price;
    }

    if (totalAmountChange !== 0) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: oldEnrollment.candidateId },
        select: { amountPaid: true, totalAmount: true }
      });

      const newTotalAmount = Math.max(0, (candidate.totalAmount || 0) + totalAmountChange);
      
      let paymentStatus = "UNPAID";
      if (newTotalAmount <= 0) paymentStatus = "PAID";
      else if (candidate.amountPaid >= newTotalAmount) paymentStatus = "PAID";
      else if (candidate.amountPaid > 0) paymentStatus = "PARTIAL";

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
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getAuthSession();
  if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SECRETARY")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { course: true, candidate: true }
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Inscription introuvable" }, { status: 404 });
    }

    // Si l'inscription était validée, on retire le prix du total dû par l'étudiant
    if (enrollment.status === "APPROVED") {
      const candidate = await prisma.candidate.findUnique({
        where: { id: enrollment.candidateId },
        select: { amountPaid: true, totalAmount: true }
      });

      const newTotalAmount = Math.max(0, (candidate.totalAmount || 0) - enrollment.course.price);
      
      let paymentStatus = "UNPAID";
      if (newTotalAmount <= 0) paymentStatus = "PAID";
      else if (candidate.amountPaid >= newTotalAmount) paymentStatus = "PAID";
      else if (candidate.amountPaid > 0) paymentStatus = "PARTIAL";

      await prisma.candidate.update({
        where: { id: enrollment.candidateId },
        data: {
          totalAmount: newTotalAmount,
          paymentStatus
        }
      });
    }

    await prisma.enrollment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
