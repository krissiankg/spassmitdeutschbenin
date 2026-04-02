"use client";
import jsPDF from "jspdf";

export async function generateResultPDF(candidate, session, osdData, result) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const formatDateDe = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  const formattedDate = formatDateDe(session.date);

  // Base setup
  const logoUrl = window.location.origin + "/logo.png";
  
  // Try loading logo
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = logoUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // proceed even without logo
    });
    // draw logo top left
    doc.addImage(img, "PNG", 20, 15, 25, 25);
  } catch (e) {
    // ignore
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`ÖSD Zertifikat ${candidate.level}`, 90, 35, { align: "center" });

  // Right edge color bar
  const colors = ["#E8823F", "#DF972E", "#DFB746", "#EAE251", "#E6E668", "#D90B75", "#6B8529", "#248B25", "#3FA8DE", "#0E78AE"];
  let cy = 50;
  for (const color of colors) {
    doc.setFillColor(color);
    doc.rect(190, cy, 10, 10, "F");
    cy += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Ergebnismitteilung`, 20, 50);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Sehr geehrte(r) ${candidate.firstName} ${candidate.lastName},`, 20, 60);
  doc.text(`nachstehend finden Sie die Detailergebnisse zu Ihrer Prüfung ÖSD Zertifikat ${candidate.level}, die Sie am`, 20, 68);
  doc.setFont("helvetica", "bold");
  doc.text(`Prüfungszentrum Spass mit Deutsch Benin`, 20, 73);
  doc.setFont("helvetica", "normal");
  doc.text(` abgelegt haben:`, 95, 73);

  // Helper for drawing rows
  let currentY = 90;

  function drawScoreBox(x, y, text, w, isBold = false) {
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(x, y - 5, w, 7);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.text(text.toString(), x + (w/2), y, { align: "center" });
    doc.setFont("helvetica", "normal");
  }

  function drawPassedBox(x, y, passed, w) {
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(x, y - 5, w, 7);
    doc.setFont("helvetica", "bold");
    const text = passed ? "bestanden" : "nicht bestanden";
    doc.text(text, x + (w/2), y, { align: "center" });
    doc.setFont("helvetica", "normal");
  }

  // SCHRIFTLICHE
  if (osdData.schriftlich.modules.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Schriftliche Prüfung am ${formattedDate}`, 20, currentY);
    
    drawPassedBox(120, currentY, osdData.schriftlich.passed, 45);
    currentY += 12;

    osdData.schriftlich.modules.forEach(m => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`${m.moduleName} (max. ${m.maxScore} / min. ${m.minScore || 0})`, 30, currentY);
      drawScoreBox(150, currentY, m.score, 15);
      
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(80, currentY + 1, 145, currentY + 1);

      currentY += 8;
    });

    currentY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Schriftliche Prüfung gesamt (max. ${osdData.schriftlich.max} / min. ${osdData.schriftlich.min})`, 30, currentY);
    drawScoreBox(150, currentY, osdData.schriftlich.score, 15, true);
    
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(100, currentY + 1, 145, currentY + 1);
    
    currentY += 15;
  }

  // MÜNDLICHE
  if (osdData.muendlich.modules.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Mündliche Prüfung am ${formattedDate}`, 20, currentY);
    
    drawPassedBox(120, currentY, osdData.muendlich.passed, 45);
    currentY += 12;

    osdData.muendlich.modules.forEach(m => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`${m.moduleName} (max. ${m.maxScore} / min. ${m.minScore || 0})`, 30, currentY);
      drawScoreBox(150, currentY, m.score, 15);
      
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(80, currentY + 1, 145, currentY + 1);

      currentY += 8;
    });

    currentY += 15;
  }

  // TOTAL
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`ÖSD Zertifikat ${candidate.level}`, 20, currentY);
  drawPassedBox(120, currentY, osdData.total.passed, 45);

  currentY += 12;
  doc.text(`Gesamtpunktezahl (max. ${osdData.total.max} / min. ${osdData.total.min})`, 20, currentY);
  drawScoreBox(150, currentY, osdData.total.score, 15, true);
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.line(100, currentY + 1, 145, currentY + 1);

  // Footer Candidate Number
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Kandidatennummer: ${candidate.candidateNumber}`, 20, 280);
  doc.text(`Generiert am: ${formatDateDe(new Date().toString())}`, 150, 280);

  doc.save(`Zertifikat_${candidate.firstName}_${candidate.lastName}_${candidate.level}.pdf`);
}
