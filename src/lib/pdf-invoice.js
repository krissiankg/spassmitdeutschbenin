"use client";
import jsPDF from "jspdf";

export async function generateInvoicePDF(candidate, user) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a5",
  });

  const formatDateDe = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  const formatCurrency = (amount) => String(amount || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const today = formatDateDe(new Date().toString());

  // Logo
  const logoUrl = window.location.origin + "/logo.png";
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // proceed even without logo
    });
    const imgWidth = 20;
    // Centered logo
    doc.addImage(img, "PNG", (148 - imgWidth) / 2, 10, imgWidth, imgWidth);
  } catch (e) {}

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FACTURE / REÇU DE PAIEMENT", 148/2, 38, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Spass mit Deutsch Benin`, 148/2, 44, { align: "center" });
  doc.text(`Date : ${today}`, 148/2, 49, { align: "center" });

  doc.setDrawColor(200);
  doc.line(15, 54, 133, 54);

  // Candidate Info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informations de l'Apprenant", 15, 64);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nom :`, 15, 72);
  doc.setFont("helvetica", "bold");
  doc.text(`${candidate.lastName} ${candidate.firstName}`, 45, 72);

  doc.setFont("helvetica", "normal");
  doc.text(`Matricule :`, 15, 78);
  doc.setFont("helvetica", "bold");
  doc.text(`${candidate.candidateNumber}`, 45, 78);

  if (candidate.session) {
    doc.setFont("helvetica", "normal");
    doc.text(`Session :`, 15, 84);
    doc.setFont("helvetica", "bold");
    doc.text(`${candidate.session.level} - ${candidate.session.title}`, 45, 84);
  }

  // Items Breakdown
  doc.line(15, 92, 133, 92);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Désignation", 15, 98);
  doc.text("Montant", 128, 98, { align: "right" });
  doc.line(15, 100, 133, 100);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  let currentY = 105;

  // 1. Enrollments
  (candidate.enrollments || []).forEach(en => {
    doc.text(`- ${en.course.name}`, 15, currentY);
    doc.text(`${formatCurrency(en.course.price)} F`, 128, currentY, { align: "right" });
    currentY += 5;
  });

  // 2. OSD Modules (handle both resolved and raw)
  const osdModules = candidate.resolvedModules || (candidate.chosenModules || []).map(m => ({ label: `Module OSD: ${m}`, price: 0 }));
  osdModules.forEach(m => {
    doc.text(`- ${m.label}`, 15, currentY);
    if (m.price) doc.text(`${formatCurrency(m.price)} F`, 128, currentY, { align: "right" });
    currentY += 5;
  });

  // 3. Prep Courses
  const prepCourses = candidate.resolvedPrep || (candidate.prepCourses || []).map(p => ({ label: `Préparatoire: ${p}`, price: 0 }));
  prepCourses.forEach(p => {
    doc.text(`- ${p.label}`, 15, currentY);
    if (p.price) doc.text(`${formatCurrency(p.price)} F`, 128, currentY, { align: "right" });
    currentY += 5;
  });

  // Payment Details
  const startPaymentY = Math.max(currentY + 5, 125);
  doc.line(15, startPaymentY, 133, startPaymentY);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Résumé financier", 15, startPaymentY + 8);

  doc.setFillColor(245, 245, 245);
  doc.rect(15, startPaymentY + 12, 118, 25, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total à payer :`, 20, startPaymentY + 18);
  doc.setFont("helvetica", "bold");
  doc.text(`${formatCurrency(candidate.totalAmount)} FCFA`, 128, startPaymentY + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(`Montant versé :`, 20, startPaymentY + 24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 128, 0);
  doc.text(`${formatCurrency(candidate.amountPaid)} FCFA`, 128, startPaymentY + 24, { align: "right" });
  doc.setTextColor(0);

  doc.line(20, startPaymentY + 28, 128, startPaymentY + 28);

  const remains = (candidate.totalAmount || 0) - (candidate.amountPaid || 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Reste à payer :`, 20, startPaymentY + 33);
  doc.setFont("helvetica", "bold");
  if (remains <= 0) {
    doc.setTextColor(0, 128, 0);
    doc.text(`0 FCFA`, 128, startPaymentY + 33, { align: "right" });
  } else {
    doc.setTextColor(200, 0, 0);
    doc.text(`${formatCurrency(remains)} FCFA`, 128, startPaymentY + 33, { align: "right" });
  }
  doc.setTextColor(0);

  // Status Stamp
  if (candidate.paymentStatus === "PAID") {
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 0);
    doc.text("SOLDÉ", 148/2, startPaymentY + 50, { align: "center" });
    doc.setTextColor(0);
  }

  // Author signature
  if (user) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const roleMap = { "SUPER_ADMIN": "Administrateur", "SECRETARY": "Secrétaire", "ACCOUNTANT": "Comptable" };
    const userRole = roleMap[user.role] || user.role;
    doc.text(`Émis par : ${user.name || user.email} (${userRole})`, 15, 185);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Ce document tient lieu de reçu officiel de paiement.", 148/2, 195, { align: "center" });

  doc.save(`Facture_${candidate.firstName}_${candidate.lastName}.pdf`);
}
