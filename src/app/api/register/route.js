import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Validate required fields
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const gender = formData.get('gender');
    const dateOfBirth = formData.get('dateOfBirth');
    const birthPlace = formData.get('birthPlace');
    const country = formData.get('country');
    
    const idType = formData.get('idType');
    const idNumber = formData.get('idNumber');
    const idIssueDate = formData.get('idIssueDate');
    const idExpiryDate = formData.get('idExpiryDate');

    const phone = formData.get('phone');
    const email = formData.get('email');
    const sessionId = formData.get('sessionId');
    
    const documentFile = formData.get('document');

    const selectedLevelsStr = formData.get('selectedLevels');
    const selectedModulesStr = formData.get('selectedModules');
    const selectedPrepCoursesStr = formData.get('selectedPrepCourses');
    const customDataStr = formData.get('customData');
    const formType = formData.get('formType') || 'SIMPLE'; // SIMPLE ou OSD

    let selectedLevels = [];
    let selectedModules = [];
    let selectedPrepCourses = [];
    let customData = null;
    try {
      selectedLevels = JSON.parse(selectedLevelsStr || "[]");
      selectedModules = JSON.parse(selectedModulesStr || "[]");
      selectedPrepCourses = JSON.parse(selectedPrepCoursesStr || "[]");
      customData = JSON.parse(customDataStr || "{}");
    } catch(e) {}

    if (!firstName || !lastName || !sessionId || selectedLevels.length === 0) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const sessionExists = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!sessionExists) {
        return NextResponse.json({ error: "Session invalide" }, { status: 400 });
    }

    // Handle document upload once for all candidates
    let documentUrl = null;
    if (documentFile && documentFile.size > 0 && typeof documentFile.arrayBuffer === 'function') {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const fileExtension = documentFile.name.split('.').pop() || 'tmp';
      const fileName = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      const arrayBuffer = await documentFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      fs.writeFileSync(filePath, buffer);
      documentUrl = `/uploads/documents/${fileName}`;
    }

    // Handle dynamic custom files
    const uploadsDirCustom = path.join(process.cwd(), 'public', 'uploads', 'custom');
    if (!fs.existsSync(uploadsDirCustom)) fs.mkdirSync(uploadsDirCustom, { recursive: true });

    for (const key of formData.keys()) {
      if (key.startsWith('customFile_')) {
        const fieldId = key.replace('customFile_', '');
        const cFile = formData.get(key);
        if (cFile && cFile.size > 0 && typeof cFile.arrayBuffer === 'function') {
          const ext = cFile.name.split('.').pop() || 'tmp';
          const cFileName = `custom_${fieldId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          const cFilePath = path.join(uploadsDirCustom, cFileName);
          
          const arrBuffer = await cFile.arrayBuffer();
          fs.writeFileSync(cFilePath, Buffer.from(arrBuffer));
          
          if (!customData) customData = {};
          customData[fieldId] = `/uploads/custom/${cFileName}`;
        }
      }
    }

    // Server-side calculation to prevent manipulation
    const pricings = await prisma.pricing.findMany();
    
    // We split into multiple Candidate rows (One per selectedLevel)
    const createdIds = [];
    
    // We compute the total basket price to distribute it or just save the partial on each dossier.
    // Let's attach the total basket size only on the first dossier? Or calculate the true cost of just that level.
    // Easiest is to calculate the cost matching the level.
    
    let candidateSequenceCounter = await prisma.candidate.count();
    const { sendRegistrationEmail } = await import("@/lib/email");
    const bcrypt = await import("bcryptjs");

    // Génération du mot de passe LMS (unique pour tous les niveaux de ce candidat)
    const generateLmsPassword = () => {
      const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const lower = 'abcdefghjkmnpqrstuvwxyz';
      const digits = '23456789';
      const special = '@#!';
      const all = upper + lower + digits + special;
      let pwd = upper[Math.floor(Math.random() * upper.length)]
              + lower[Math.floor(Math.random() * lower.length)]
              + digits[Math.floor(Math.random() * digits.length)]
              + special[Math.floor(Math.random() * special.length)];
      for (let i = 0; i < 5; i++) pwd += all[Math.floor(Math.random() * all.length)];
      return pwd.split('').sort(() => Math.random() - 0.5).join('');
    };
    const lmsPasswordClear = generateLmsPassword();
    const lmsPasswordHash = await bcrypt.default.hash(lmsPasswordClear, 10);

    for (const lvl of selectedLevels) {
       // Filter modules/courses belonging to this specific level
       const lvlModules = selectedModules.filter(mCode => pricings.find(p => p.code === mCode && p.level === lvl));
       const lvlCourses = selectedPrepCourses.filter(cCode => pricings.find(p => p.code === cCode && p.level === lvl));
       
       let partialTotal = 0;
       lvlModules.forEach(code => partialTotal += pricings.find(p => p.code === code)?.price || 0);
       lvlCourses.forEach(code => partialTotal += pricings.find(p => p.code === code)?.price || 0);

       candidateSequenceCounter++;
       const candidateNumber = `SMD-${candidateSequenceCounter.toString().padStart(6, '0')}`;
       const consultationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

       const c = await prisma.candidate.create({
         data: {
           firstName, lastName, gender, 
           dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
           birthPlace, country,
           idType, idNumber, 
           idIssueDate: idIssueDate ? new Date(idIssueDate) : null,
           idExpiryDate: idExpiryDate ? new Date(idExpiryDate) : null,
           phone, email, sessionId, documentUrl,
           level: lvl,
           chosenModules: lvlModules,
           prepCourses: lvlCourses,
           totalAmount: partialTotal,
           candidateNumber,
           consultationCode,
           status: "PENDING",
           customData,
           formType,        // SIMPLE ou OSD
           lmsPassword: lmsPasswordHash // Mot de passe hashé
         }
       });
       createdIds.push(c.id);

       // Envoi email avec identifiants LMS (mot de passe en clair seulement au 1er niveau)
       if (email) {
          try {
            const pwdToSend = createdIds.length === 1 ? lmsPasswordClear : null;
            await sendRegistrationEmail({ ...c, formType }, pwdToSend);
          } catch(e) {
            console.error("Erreur envoi mail welcome:", e);
          }
       }
    }

    // Créer des notifications dans le tableau de bord pour TOUS les admins
    try {
      const { createAdminNotification } = await import("@/lib/notifications");
      await createAdminNotification({
        title: "Nouvelle pré-inscription " + (selectedLevels.length > 1 ? "Multi-Niveaux" : ""),
        message: `${firstName} ${lastName} vient de s'inscrire pour : ${levelsTitle}.`,
        type: "SUCCESS"
      });
    } catch (e) {
      console.error("Erreur création notification dashboard admin:", e);
    }

    // Notification par Email aux admins
    try {
      const { sendAdminNotificationEmail } = await import("@/lib/email");
      await sendAdminNotificationEmail(
        { firstName, lastName, email, phone, formType, sessionId },
        selectedLevels,
        pricings
      );
    } catch (e) {
      console.error("Erreur notification email admin:", e);
    }

    return NextResponse.json({ success: true, createdIds });
  } catch (err) {
    console.error("Erreur inscription:", err);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
