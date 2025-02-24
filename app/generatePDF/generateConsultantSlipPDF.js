import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReferralPdf = (summary) => {
  const doc = new jsPDF();

  const dateRange = summary.length > 0 ? summary[1]?.dateRange : "Unknown_Date_Range";

  let yOffset = 8;
  const maxPageHeight = doc.internal.pageSize.height - 25;

  const createConsultantSection = (consultant, rows) => {
      let tempDoc = new jsPDF();
      tempDoc.autoTable({
          startY: 8,
          head: [["Doctor's Name", "Date", "Service", "No. of Case", "Total Amount"]],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
          bodyStyles: { fontSize: 10 },
          margin: { left: 18, right: 18 },
      });
      const sectionHeight = tempDoc.lastAutoTable.finalY + 30;

      if (yOffset + sectionHeight > maxPageHeight) {
          doc.addPage();
          yOffset = 8;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.text("GOD IS GREAT", 105, yOffset, { align: "center" });

      const logoPath = "/GS/GSTitleMidLogo600x200.png";
      doc.addImage(logoPath, "PNG", 80, yOffset + 1, 50, 16.67);

      doc.setFontSize(10);
      doc.text("Dear Doctor, Warm greetings from GRACE SCANS, and thank you for your valuable referrals.", 105, yOffset + 22, { align: "center" });

      doc.autoTable({
          startY: yOffset + 27,
          head: [["Doctor's Name", "Date", "Service", "No. of Case", "Total Amount"]],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
          bodyStyles: { fontSize: 10 },
          margin: { left: 18, right: 18 },
      });

      const footerY = doc.lastAutoTable.finalY + 8;
      doc.setFontSize(10);
      doc.text("FOR GRACE SCANS & DIAGNOSTIC CENTER", 105, footerY, { align: "center" });

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      const separatorY = footerY + 8;
      for (let x = 0; x < 250; x += 3) {
          doc.line(x, separatorY, x + 1, separatorY);
      }

      yOffset = separatorY + 8;
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

  const fileName = `IC_Slip_${dateRange}.pdf`;
  doc.save(fileName);
};
