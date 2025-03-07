import jsPDF from "jspdf";
import "jspdf-autotable";
  
export const generateReferralPdf = (summary) => {
  const doc = new jsPDF();
  const dateRange = summary.length > 0 ? summary[1]?.dateRange : "Unknown_Date_Range";

  let yOffset = 7;
  const maxPageHeight = doc.internal.pageSize.height - 25;
  const maxSectionsPerPage = 5;
  let sectionsOnCurrentPage = 0;

  const createConsultantSection = (consultant, rows) => {
    let tempDoc = new jsPDF();
    tempDoc.autoTable({
      startY: 7,
      head: [["Service", "Cases", "Price", "Amount", "Remarks"]],
      body: rows.map(row => [
        row[2].replace(" Scan", ""),
        row[4],
        row[3],
        row[5],
        row[6],  // Correctly merged remarks for that rateCard & price
      ]),
      theme: "grid",
      headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 18, right: 18 },
    });

    const sectionHeight = tempDoc.lastAutoTable?.finalY + 18 || 40;

    if (sectionsOnCurrentPage >= maxSectionsPerPage || yOffset + sectionHeight > maxPageHeight) {
      doc.addPage();
      yOffset = 7;
      sectionsOnCurrentPage = 0;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("GOD IS GREAT", 105, yOffset, { align: "center" });

    const logoPath = "/GS/GSTitleMidLogo600x200.png";
    try {
      doc.addImage(logoPath, "PNG", 80, yOffset + 1, 50, 16.67);
    } catch (e) {
      console.error("Error loading image: ", e);
    }

    doc.setFontSize(10);
    doc.text(
      `Dear ${consultant}, thank you for your referrals. Summary for ${rows[0][1]}.`,
      105,
      yOffset + 21,
      { align: "center" }
    );

    doc.autoTable({
      startY: yOffset + 26,
      head: [["Service", "Cases", "Price", "Amount", "Remarks"]],
      body: rows.map(row => [
        row[2].replace(" Scan", ""),
        row[4],
        row[3],
        row[5],
        row[6],
      ]),
      theme: "grid",
      headStyles: { fillColor: "#0070C0", textColor: "#FFFFFF", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      margin: { left: 18, right: 18 },
    });

    const separatorY = doc.autoTable.previous.finalY + 7;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    for (let x = 0; x < 250; x += 3) {
      doc.line(x, separatorY, x + 1, separatorY);
    }

    yOffset = separatorY + 7;
    sectionsOnCurrentPage++;
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
      consultantRows.push([
        currentConsultant,
        item.dateRange,
        item.rateCard,
        item.price,
        item.count,
        item.totalPrice,
        item.rateType, // Correctly merged remarks for that rateCard & price
      ]);
    }
  });

  if (consultantRows.length > 0) {
    createConsultantSection(currentConsultant, consultantRows);
  }

  const fileName = `IC_Slip_${dateRange}.pdf`;
  doc.save(fileName);
};
