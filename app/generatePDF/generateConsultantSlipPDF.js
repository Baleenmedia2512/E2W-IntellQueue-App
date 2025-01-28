import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReferralPdf = (summary) => {
  const doc = new jsPDF();

  // Extract date range from the first item in summary (assuming the same date range for all rows)
  const dateRange = summary.length > 0 ? summary[0].dateRange : "Unknown_Date_Range";

  // Table header
  const tableData = [
    ["Doctor's Name", "Date", "Rate Card", "No. of Case", "Total Amount"],
  ];

  // Add the dynamic rows based on the summary data
  summary.forEach(item => {
    // Combine No. of Case and Rate Type
    // const noOfCaseWithRateType = `${item.count}-${item.rateType}`;

    tableData.push([item.consultant, item.dateRange, item.rateCard, item.count, item.totalPrice]);
  });

  const createSection = (yOffset, rowData) => {
    // Add God is Great text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text("GOD IS GREAT", 105, yOffset, { align: "center" });

    // Add logo
    const logoPath = "/GS/GSTitleMidLogo600x200.png";
    doc.addImage(logoPath, "PNG", 80, yOffset + 0.5, 50, 16.67); // Centered logo

    // Add greeting message
    doc.setFontSize(10);
    doc.text(
      "Dear Doctor, Warm greetings from GRACE SCANS, and thank you for your valuable referrals.",
      105,
      yOffset + 25,
      { align: "center" }
    );

    // Add table
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

    // Add footer
    doc.setFontSize(10);
    const footerY = doc.lastAutoTable.finalY + 10;
    doc.text("FOR GRACE SCANS & DIAGNOSTIC CENTER", 105, footerY, {
      align: "center",
    });

    return footerY; // Return the footer Y position to calculate the separator position
  };

  // Set the initial yOffset and page height
  let yOffset = 10;
  const maxSectionsPerPage = 4;
  let sectionsOnCurrentPage = 0;

  // Loop through the data rows and create a section for each one
  for (let i = 1; i < tableData.length; i++) { // Start from 1 to skip header row
    if (sectionsOnCurrentPage >= maxSectionsPerPage) {
      // Add a new page and reset the section counter
      doc.addPage();
      yOffset = 10; // Reset yOffset for the new page
      sectionsOnCurrentPage = 0;
    }

    const footerY = createSection(yOffset, tableData[i]);

    // Add dashed separator line at the end of the section
    doc.setDrawColor(0); // Black color for the line
    doc.setLineWidth(0.5); // Line thickness
    const separatorY = footerY + 10; // Start dashed line right after the footer
    for (let x = 0; x < 250; x += 3) {
      doc.line(x, separatorY, x + 1, separatorY); // Add small dashes for the line
    }

    // Update the yOffset for the next section
    yOffset = separatorY + 10; // Add some space between sections
    sectionsOnCurrentPage++;
  }

  // Save the PDF with the DateRange in the filename
  const fileName = `${dateRange}_IC_Slip.pdf`;
  doc.save(fileName);
};
