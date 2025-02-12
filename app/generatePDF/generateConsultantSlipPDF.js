import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReferralPdf = (summary) => {
  const doc = new jsPDF();

  // Extract date range (assuming the same for all)
  const dateRange = summary.length > 0 ? summary[1]?.dateRange : "Unknown_Date_Range";

  let yOffset = 10;
  const maxPageHeight = doc.internal.pageSize.height - 30; // Ensure footer space

  const createConsultantSection = (consultant, rows) => {
      let tempDoc = new jsPDF(); // Temporary PDF to measure height
      tempDoc.autoTable({
          startY: 10,
          head: [["Doctor's Name", "Date", "Service", "No. of Case", "Total Amount"]],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
          bodyStyles: { fontSize: 10 },
          margin: { left: 20, right: 20 },
      });
      const sectionHeight = tempDoc.lastAutoTable.finalY + 40; // Estimate full section height

      // If section does not fit, move to next page
      if (yOffset + sectionHeight > maxPageHeight) {
          doc.addPage();
          yOffset = 10;
      }

      // Consultant Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("GOD IS GREAT", 105, yOffset, { align: "center" });

      const logoPath = "/GS/GSTitleMidLogo600x200.png";
      doc.addImage(logoPath, "PNG", 80, yOffset + 0.5, 50, 16.67);

      doc.setFontSize(10);
      doc.text(
          "Dear Doctor, Warm greetings from GRACE SCANS, and thank you for your valuable referrals.",
          105, yOffset + 25, { align: "center" }
      );

      // Table data
      doc.autoTable({
          startY: yOffset + 30,
          head: [["Doctor's Name", "Date", "Service", "No. of Case", "Total Amount"]],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
          bodyStyles: { fontSize: 10 },
          margin: { left: 20, right: 20 },
      });

      // Footer
      const footerY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("FOR GRACE SCANS & DIAGNOSTIC CENTER", 105, footerY, { align: "center" });

      // Draw line separator
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      const separatorY = footerY + 10;
      for (let x = 0; x < 250; x += 3) {
          doc.line(x, separatorY, x + 1, separatorY);
      }

      yOffset = separatorY + 10;
  };

  let currentConsultant = "";
  let consultantRows = [];

  summary.forEach((item) => {
      if (item.isHeader) {
          if (consultantRows.length > 0) {
              createConsultantSection(currentConsultant, consultantRows);
          }
          currentConsultant = item.consultant;
          consultantRows = [];
      } else {
          consultantRows.push([currentConsultant, item.dateRange, item.rateCard, item.count, item.totalPrice]);
      }
  });

  if (consultantRows.length > 0) {
      createConsultantSection(currentConsultant, consultantRows);
  }

  // Save as single PDF
  const fileName = `IC_Slip_${dateRange}.pdf`;
  doc.save(fileName);
};



