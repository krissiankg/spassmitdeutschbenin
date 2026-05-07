import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ACCOUNTANT" && session.user.role !== "COMPTABLE")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { debtorIds } = await req.json(); // List of candidate IDs to remind

    const debtors = await prisma.candidate.findMany({
      where: {
        id: { in: debtorIds },
        OR: [
          { paymentStatus: "UNPAID" },
          { paymentStatus: "PARTIAL" }
        ]
      }
    });

    if (debtors.length === 0) {
      return NextResponse.json({ message: "Aucun débiteur trouvé" });
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    let sentCount = 0;
    for (const debtor of debtors) {
      if (!debtor.email) continue;

      const reste = debtor.totalAmount - debtor.amountPaid;

      try {
        await transporter.sendMail({
          from: `"Spass mit Deutsch Benin" <${process.env.EMAIL_FROM}>`,
          to: debtor.email,
          subject: "Rappel de paiement - Spass mit Deutsch",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #003366;">Cher(e) ${debtor.firstName} ${debtor.lastName},</h2>
              <p>Ceci est un rappel concernant votre solde de cours chez Spass mit Deutsch.</p>
              <p>Notre système indique un reste à payer de : <strong>${reste.toLocaleString()} FCFA</strong>.</p>
              <p>Nous vous prions de bien vouloir régulariser votre situation auprès de la comptabilité dans les plus brefs délais afin de garantir votre accès continu aux cours et examens.</p>
              <hr />
              <p style="font-size: 12px; color: #666;">Si vous avez déjà effectué ce paiement, veuillez ignorer cet e-mail ou nous envoyer une preuve de paiement.</p>
              <p>Cordialement,<br />L'administration Spass mit Deutsch</p>
            </div>
          `,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send email to ${debtor.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} rappels envoyés avec succès.`
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
