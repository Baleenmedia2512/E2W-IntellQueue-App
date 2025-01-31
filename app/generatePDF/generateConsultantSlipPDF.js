import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReferralPdf = (summary, rateCard) => {
  const doc = new jsPDF();

  // Extract date range from the first item in summary (assuming the same date range for all rows)
  const dateRange = summary.length > 0 ? summary[0].dateRange : "Unknown_Date_Range";

  // Table header
  const tableData = [
    ["Doctor's Name", "Date", "Service", "No. of Case", "Total Amount"],
  ];

  // Add the dynamic rows based on the summary data
  summary.forEach(item => {
    tableData.push([item.consultant, item.dateRange, item.rateCard, item.count, item.totalPrice]);
  });

  const createSection = (yOffset, rowData) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("GOD IS GREAT", 105, yOffset, { align: "center" });

    const logoPath = "/GS/GSTitleMidLogo600x200.png";
    doc.addImage(logoPath, "PNG", 80, yOffset + 0.5, 50, 16.67); 

    doc.setFontSize(10);
    doc.text(
      "Dear Doctor, Warm greetings from GRACE SCANS, and thank you for your valuable referrals.",
      105,
      yOffset + 25,
      { align: "center" }
    );

    doc.autoTable({
      startY: yOffset + 30,
      head: [tableData[0]],
      body: [rowData],
      theme: "grid",
      headStyles: {
        fillColor: "#0070C0",
        textColor: "#FFFFFF",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 10,
      },
      margin: { left: 20, right: 20 },
    });

    doc.setFontSize(10);
    const footerY = doc.lastAutoTable.finalY + 10;
    doc.text("FOR GRACE SCANS & DIAGNOSTIC CENTER", 105, footerY, {
      align: "center",
    });

    return footerY;
  };

  let yOffset = 10;
  const maxSectionsPerPage = 4;
  let sectionsOnCurrentPage = 0;

  for (let i = 1; i < tableData.length; i++) {
    if (sectionsOnCurrentPage >= maxSectionsPerPage) {
      doc.addPage();
      yOffset = 10;
      sectionsOnCurrentPage = 0;
    }

    const footerY = createSection(yOffset, tableData[i]);

    doc.setDrawColor(0); 
    doc.setLineWidth(0.5); 
    const separatorY = footerY + 10;
    for (let x = 0; x < 250; x += 3) {
      doc.line(x, separatorY, x + 1, separatorY);
    }

    yOffset = separatorY + 10;
    sectionsOnCurrentPage++;
  }

  // Save the PDF with the rate card and DateRange in the filename
  const fileName = `${rateCard}_${dateRange}_IC_Slip.pdf`;
  doc.save(fileName);
};

