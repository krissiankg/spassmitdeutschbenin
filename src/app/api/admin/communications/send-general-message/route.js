import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { sendGeneralEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const sessionAuth = await getAuthSession();
    if (!sessionAuth || (sessionAuth.user.role !== "SUPER_ADMIN" && sessionAuth.user.role !== "SECRETARY")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { title, body, recipientGroup } = await request.json();

    if (!title || !body || !recipientGroup) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    let recipients = [];

    if (recipientGroup === "ALL_STUDENTS") {
      recipients = await prisma.candidate.findMany({
        where: { formType: "SIMPLE", email: { not: null, not: "" } },
        select: { email: true, firstName: true, lastName: true }
      });
    } else if (recipientGroup === "OSD_CANDIDATES") {
      recipients = await prisma.candidate.findMany({
        where: { formType: "OSD", email: { not: null, not: "" } },
        select: { email: true, firstName: true, lastName: true }
      });
    } else if (recipientGroup === "ADMIN_TEAM") {
      recipients = await prisma.admin.findMany({
        where: { email: { not: null, not: "" } },
        select: { email: true, name: true }
      });
      // Adapt name for sendGeneralEmail
      recipients = recipients.map(r => ({ email: r.email, firstName: r.name, lastName: "" }));
    } else if (recipientGroup === "EVERYONE") {
      const candidates = await prisma.candidate.findMany({
        where: { email: { not: null, not: "" } },
        select: { email: true, firstName: true, lastName: true }
      });
      const admins = await prisma.admin.findMany({
        where: { email: { not: null, not: "" } },
        select: { email: true, name: true }
      });
      recipients = [
        ...candidates,
        ...admins.map(r => ({ email: r.email, firstName: r.name, lastName: "" }))
      ];
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "Aucun destinataire trouvé pour ce groupe" }, { status: 404 });
    }

    let successCount = 0;
    let failCount = 0;

    // Use a batch of promises to send emails
    const emailPromises = recipients.map(async (recipient) => {
      const name = recipient.lastName ? `${recipient.firstName} ${recipient.lastName}` : recipient.firstName;
      const sent = await sendGeneralEmail(recipient.email, name, title, body);
      if (sent) successCount++;
      else failCount++;
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      message: "Emails envoyés",
      successCount,
      failCount,
      total: recipients.length
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message général:", error);
    return NextResponse.json({ error: "Erreur serveur lors de l'envoi" }, { status: 500 });
  }
}
