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
 * Email de bienvenue après inscription + identifiants LMS
 */
export async function sendRegistrationEmail(candidate, lmsPasswordClear = null) {
  if (!candidate.email) return false;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.spassmitdeutschbenin.com";
  const lmsUrl = `${appUrl}/lms/login`;

  const lmsBlock = lmsPasswordClear ? `
    <div style="background-color: #003366; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 13px; color: #D4AF37; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">🎓 Votre accès Espace Étudiant</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; font-size: 14px; color: #cbd5e1; text-align: left;">Identifiant (email) :</td>
          <td style="padding: 8px; font-size: 14px; color: #ffffff; font-weight: bold; text-align: right;">${candidate.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-size: 14px; color: #cbd5e1; text-align: left;">Mot de passe temporaire :</td>
          <td style="padding: 8px; font-size: 18px; color: #D4AF37; font-weight: bold; text-align: right; font-family: monospace; letter-spacing: 2px;">${lmsPasswordClear}</td>
        </tr>
      </table>
      <a href="${lmsUrl}" style="display: inline-block; margin-top: 16px; background-color: #D4AF37; color: #003366; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
        Se connecter à mon espace →
      </a>
      <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8;">Nous vous recommandons de changer ce mot de passe après votre première connexion.</p>
    </div>
  ` : '';

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: candidate.email,
    subject: `Confirmation d'inscription - Spass mit Deutsch Benin`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Spass mit Deutsch Benin</h1>
          <p style="color: #D4AF37; margin: 6px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            ${candidate.formType === 'OSD' ? '📋 Inscription Examen ÖSD' : '📚 Inscription Cours'}
          </p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #003366; font-size: 20px; margin-top: 0;">Félicitations ${candidate.firstName} !</h2>
          <p style="font-size: 16px; line-height: 1.5;">Votre pré-inscription pour le niveau <strong>${candidate.level}</strong> a été enregistrée avec succès.</p>
          <p style="font-size: 15px; color: #475569;">N° dossier : <strong style="color: #003366;">${candidate.candidateNumber}</strong></p>

          ${lmsBlock}

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Prochaines étapes :</strong></p>
            <ul style="margin-top: 10px; font-size: 14px; color: #475569;">
              <li>Validez votre inscription en réglant vos frais au secrétariat ou par mobile money.</li>
              <li>Conservez précieusement votre numéro de dossier.</li>
              <li>Vos codes de consultation de résultats vous seront envoyés le jour des résultats.</li>
            </ul>
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
 * Email de réinitialisation de mot de passe (Version Enrichie)
 */
export async function sendResetPasswordEmail(email, name, resetUrl) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe - Spass mit Deutsch",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 30px; text-align: center; position: relative;">
          <h1 style="color: white; margin: 0; font-size: 26px; letter-spacing: -0.5px;">Spass mit Deutsch Benin</h1>
          <div style="height: 3px; width: 60px; background-color: #D4AF37; margin: 15px auto 0;"></div>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #003366; font-size: 22px; margin-top: 0; font-weight: 800;">Bonjour ${name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 25px;">
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Spass mit Deutsch LMS</strong>.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #003366; color: #ffffff; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0,51,102,0.25); transition: all 0.2s;">
              Définir un nouveau mot de passe
            </a>
          </div>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
              <strong>⚠️ Sécurité :</strong> Ce lien est à usage unique et expirera dans <strong>60 minutes</strong>. 
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe restera inchangé.
            </p>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
            <span style="color: #003366; word-break: break-all;">${resetUrl}</span>
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 12px; font-size: 15px; font-weight: 800; color: #003366; text-transform: uppercase; letter-spacing: 1px;">Besoin d'aide ?</p>
          <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
            Notre équipe est à votre disposition :<br>
            📞 <strong>+229 01 96 64 19 61</strong><br>
            📧 <strong>necsima@yahoo.fr</strong>
          </p>
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">
              © ${new Date().getFullYear()} Spass mit Deutsch Benin • Excellence & Réussite
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi reset password email:", error);
    return false;
  }
}


/**
 * Notification aux administrateurs lors d'une nouvelle inscription
 */
export async function sendAdminNotificationEmail(candidateData, selectedLevels, pricings) {
  const adminEmails = ["necsima@yahoo.fr", "c37694387@gmail.com"];
  
  const { firstName, lastName, email, phone, formType, sessionId } = candidateData;
  const isOsd = formType === 'OSD';
  
  // Récupérer le titre de la session si applicable
  let sessionTitle = "N/A";
  if (sessionId) {
    try {
      const prisma = (await import("./prisma")).default;
      const session = await prisma.session.findUnique({ where: { id: sessionId } });
      if (session) sessionTitle = session.title;
    } catch (e) {
      console.error("Erreur récup session pour notification admin:", e);
    }
  }

  const levelsHtml = selectedLevels.map(lvl => `<li><strong>${lvl}</strong></li>`).join('');
  
  const typeLabel = isOsd ? "EXAMEN ÖSD" : "COURS RÉGULIER";
  const color = isOsd ? "#ef4444" : "#3b82f6";

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: adminEmails.join(", "),
    subject: `🔔 Nouvelle Inscription ${typeLabel} : ${firstName} ${lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: ${color}; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">Nouvelle Pré-inscription</h2>
          <p style="margin: 5px 0 0; font-weight: bold; opacity: 0.9;">${typeLabel}</p>
        </div>
        
        <div style="padding: 25px;">
          <h3 style="color: ${color}; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Informations Étudiant</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Nom complet :</td>
              <td style="padding: 8px 0; font-weight: bold;">${firstName} ${lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Email :</td>
              <td style="padding: 8px 0;">${email || 'Non fourni'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Téléphone :</td>
              <td style="padding: 8px 0;">${phone || 'Non fourni'}</td>
            </tr>
          </table>

          <h3 style="color: ${color}; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 25px;">Détails de l'Inscription</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Session :</td>
              <td style="padding: 8px 0; font-weight: bold;">${sessionTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Niveaux choisis :</td>
              <td style="padding: 8px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${levelsHtml}
                </ul>
              </td>
            </tr>
          </table>

          ${isOsd ? `
            <div style="margin-top: 20px; background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Note :</strong> Cette inscription concerne un examen ÖSD. Veuillez vérifier les modules sélectionnés dans le tableau de bord admin.
              </p>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/admin/candidates" style="display: inline-block; background-color: #1e293b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Accéder au Tableau de Bord
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          Système de notification automatique - Spass mit Deutsch Benin
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi notification admin:", error);
    return false;
  }
}

/**
 * Email d'envoi des identifiants à un membre de l'équipe
 */
export async function sendAdminCredentialsEmail(admin, plainPassword = null) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.spassmitdeutschbenin.com";
  const loginUrl = `${appUrl}/connexion`;

  const passwordBlock = plainPassword ? `
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0 0 10px; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Vos accès de connexion</p>
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
        <p style="margin: 0; font-size: 15px; color: #003366;">Email : <strong>${admin.email}</strong></p>
        <p style="margin: 0; font-size: 15px; color: #003366;">Mot de passe : <strong style="font-size: 18px; color: #ef4444; background: #fee2e2; padding: 4px 8px; border-radius: 6px; font-family: monospace;">${plainPassword}</strong></p>
      </div>
    </div>
  ` : `
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
        <strong>Note :</strong> Pour des raisons de sécurité, votre mot de passe actuel ne peut pas être envoyé en clair. Utilisez le lien "Mot de passe oublié" sur la page de connexion si vous ne vous en souvenez plus.
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: admin.email,
    subject: `Vos identifiants d'accès - Spass mit Deutsch Benin`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Spass mit Deutsch Benin</h1>
          <p style="color: #D4AF37; margin: 6px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Espace Administration</p>
        </div>
        
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #003366; font-size: 20px; margin-top: 0;">Bonjour ${admin.name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #334155;">
            Vous avez été enregistré en tant que <strong>${admin.role}</strong> sur la plateforme de gestion Spass mit Deutsch Benin.
          </p>
          
          ${passwordBlock}

          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #003366; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0,51,102,0.2); transition: all 0.2s;">
              Accéder à l'administration
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Si vous avez des questions concernant vos accès, veuillez contacter l'administrateur principal.
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">
            © ${new Date().getFullYear()} Spass mit Deutsch Benin • Excellence & Réussite
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Erreur d'envoi identifiants admin:", error);
    return false;
  }
}


/**
 * Email de communication générale (No-Reply)
 */
export async function sendGeneralEmail(email, name, title, body) {
  if (!email) return false;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; color: #003366; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #003366; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Spass mit Deutsch Benin</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #003366; font-size: 18px; margin-top: 0;">Bonjour ${name || 'Étudiant'},</h2>
          <div style="font-size: 15px; line-height: 1.6; color: #334155;">
            ${body.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 11px; color: #64748b;">
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
    console.error("Erreur d'envoi general email:", error);
    return false;
  }
}

/**
 * Test SMTP settings by sending a test email.
 */
export async function testSMTPSettings(targetEmail) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: targetEmail,
    subject: "Test de configuration SMTP - Spass mit Deutsch",
    text: "Ceci est un email de test pour vérifier la configuration SMTP de votre application Spass mit Deutsch Benin. Si vous recevez ce message, la configuration est correcte.",
    html: "<p>Ceci est un email de test pour vérifier la configuration SMTP de votre application <b>Spass mit Deutsch Benin</b>. Si vous recevez ce message, la configuration est correcte.</p>"
  };

  return await transporter.sendMail(mailOptions);
}
