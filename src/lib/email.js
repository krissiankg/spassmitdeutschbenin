import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendConsultationCodeEmail(candidate, sessionTitle) {
  if (!candidate.email) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.spassmitdeutschbenin.com";

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: candidate.email,
    subject: `Vos résultats d'examen - Session ${sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Spass mit Deutsch Benin</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #003366; font-size: 20px; margin-top: 0;">Bonjour ${candidate.firstName} ${candidate.lastName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">Les résultats de l'examen <strong>${sessionTitle}</strong> sont désormais disponibles !</p>
          <p style="font-size: 16px; line-height: 1.5;">Vous pouvez consulter vos notes détaillées (modules, moyenne, décision) directement sur notre plateforme sécurisée en utilisant vos identifiants uniques ci-dessous.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Vos identifiants de consultation</p>
            <div style="margin-top: 15px;">
              <p style="margin: 0; font-size: 15px; color: #003366;">Numéro candidat : <strong>${candidate.candidateNumber}</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #003366;">Code secret : <strong style="font-size: 20px; color: #ef4444; background: #fee2e2; padding: 4px 8px; border-radius: 6px;">${candidate.consultationCode}</strong></p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/consultation" style="display: inline-block; background-color: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Consulter mes résultats
            </a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            Ceci est un message automatique, merci de ne pas y répondre.<br>
            © ${new Date().getFullYear()} Spass mit Deutsch Benin.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi d'email pour", candidate.email, error);
    return false;
  }
}

/**
 * Email de bienvenue après inscription (sans code secret)
 */
export async function sendRegistrationEmail(candidate) {
  if (!candidate.email) return false;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: candidate.email,
    subject: `Confirmation d'inscription - Spass mit Deutsch Benin`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Spass mit Deutsch Benin</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #003366; font-size: 20px; margin-top: 0;">Félicitations ${candidate.firstName} !</h2>
          <p style="font-size: 16px; line-height: 1.5;">Votre pré-inscription pour le niveau <strong>${candidate.level}</strong> a été enregistrée avec succès.</p>
          <p style="font-size: 16px; line-height: 1.5;">Votre dossier porte le numéro : <strong>${candidate.candidateNumber}</strong></p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Prochaines étapes :</strong></p>
            <ul style="margin-top: 10px; font-size: 14px; color: #475569;">
              <li>Validez votre inscription en réglant vos frais au secrétariat ou par mobile money.</li>
              <li>Conservez précieusement votre matricule.</li>
              <li>Vos codes secrets de consultation vous seront envoyés par email le jour des résultats.</li>
            </ul>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} Spass mit Deutsch Benin.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi registration email:", error);
    return false;
  }
}

/**
 * Reçu de paiement avec PDF joint
 */
export async function sendPaymentReceiptEmail(candidate, payment, sessionTitle) {
  if (!candidate.email) return false;

  const { generatePaymentReceiptBuffer } = await import("./pdf-server");
  const pdfBuffer = await generatePaymentReceiptBuffer(candidate, payment, sessionTitle);

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: candidate.email,
    subject: `Reçu de paiement - Dossier ${candidate.candidateNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Paiement Validé</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #003366; font-size: 20px; margin-top: 0;">Bonjour ${candidate.firstName},</h2>
          <p style="font-size: 16px; line-height: 1.5;">Nous vous confirmons la réception de votre paiement pour l'examen ÖSD.</p>
          
          <div style="margin: 25px 0; padding: 20px; border: 2px dashed #e2e8f0; border-radius: 12px; text-align: center;">
             <p style="margin:0; font-size: 14px; color: #64748b;">Montant encaissé :</p>
             <h3 style="margin: 5px 0; font-size: 28px; color: #059669;">${payment.amount.toLocaleString()} FCFA</h3>
             <p style="margin:0; font-size: 12px; color: #94a3b8;">Mode : ${payment.method} | Ref : ${payment.reference || 'N/A'}</p>
          </div>

          <p style="font-size: 14px; color: #64748b;">Vous trouverez votre reçu officiel au format PDF en pièce jointe de cet email.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Recu_Paiement_${candidate.candidateNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi payment email:", error);
    return false;
  }
}

/**
 * Test SMTP
 */
export async function testSMTPSettings(targetEmail) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: targetEmail,
    subject: "Test de connexion SMTP - Spass mit Deutsch",
    text: "Félicitations ! Votre serveur SMTP est correctement configuré. L'application Spass mit Deutsch peut désormais envoyer des emails."
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Test SMTP échoué:", error);
    throw error;
  }
}
