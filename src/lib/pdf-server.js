import { jsPDF } from "jspdf";

/**
 * Génère un PDF de reçu de paiement en Buffer pour l'envoi par email
 */
export async function generatePaymentReceiptBuffer(candidate, payment, sessionTitle) {
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
  const today = formatDateDe(new Date());

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102); // #003366
  doc.text("REÇU DE PAIEMENT", 148/2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Spass mit Deutsch Benin", 148/2, 32, { align: "center" });
  doc.text(`Date d'émission : ${today}`, 148/2, 37, { align: "center" });

  doc.setDrawColor(200);
  doc.line(15, 45, 133, 45);

  // Candidate Info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text("Informations Candidat", 15, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text(`Nom : ${candidate.lastName} ${candidate.firstName}`, 15, 63);
  doc.text(`Matricule : ${candidate.candidateNumber}`, 15, 69);
  doc.text(`Examen : ${sessionTitle || candidate.level}`, 15, 75);

  doc.line(15, 82, 133, 82);

  // Payment Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text("Détails de la Transaction", 15, 92);

  doc.setFillColor(248, 250, 252);
  doc.rect(15, 97, 118, 35, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text("Montant versé ce jour :", 20, 105);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 150, 0);
  doc.text(`${formatCurrency(payment.amount)} FCFA`, 128, 105, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Mode de paiement :", 20, 113);
  doc.text(payment.method || "CASH", 128, 113, { align: "right" });

  doc.line(20, 117, 128, 117);

  const remains = (candidate.totalAmount || 0) - (candidate.amountPaid || 0);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Solde Restant :", 20, 125);
  doc.text(`${formatCurrency(remains)} FCFA`, 128, 125, { align: "right" });

  // Status Stamp
  if (candidate.paymentStatus === "PAID" || remains <= 0) {
    doc.setFontSize(22);
    doc.setTextColor(0, 150, 0, 0.2); // Light green for stamp effect
    doc.text("PAYÉ / SOLDÉ", 148/2, 160, { align: "center", angle: 15 });
  }

  // Footer info
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  doc.text("Ceci est un justificatif de paiement électronique.", 148/2, 190, { align: "center" });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
