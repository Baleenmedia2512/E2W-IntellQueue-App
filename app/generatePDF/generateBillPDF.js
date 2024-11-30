import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateBillPdf = async (data) => {
  const doc = new jsPDF();

  // Determine label image based on payment status
  const labelUrl = data.amountDue > '0' || data.amountDue > 0 ? '/images/UnpaidLabel.png' : '/images/PaidLabel.png';

  // Add the label to the top-left of the page
  const labelX = -2; // X position
  const labelY = -1; // Y position
  const labelWidth = 30; // Adjust the width as needed
  const labelHeight = 30; // Adjust the height as needed
  doc.addImage(labelUrl, 'PNG', labelX, labelY, labelWidth, labelHeight);


  // Add watermark logo
  const watermarkLogoUrl = data.companyWatermarkLogoPath; // Path to watermark image data.companyWatermarkLogoPath
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const watermarkSize = 130; // Adjust the watermark size as needed

  // Add the logo as a watermark in the center
  doc.addImage(
    watermarkLogoUrl,
    'PNG',
    (pageWidth - watermarkSize) / 2, // Center X position
    (pageHeight - watermarkSize) / 2, // Center Y position
    watermarkSize, // Width
    watermarkSize, // Height
    undefined,
    'NONE', // Keep aspect ratio without compression
    0.1 // Set opacity to make it light as a watermark
  );
  

  // Add high-resolution logo image
  const logoUrl = data.companyLogoPath; // Path to your high-resolution logo
  const logoX = 20; // X position for the logo
  const logoY = 20; // Y position for the logo

  // Adjust width and height (use points for scaling: 1 point = 1/72 inch)
  const logoWidth = 80; // Width in points (scaled from original for higher resolution)
  const logoHeight = 26.67; // Height in points (proportional to 240x80 resolution)
  doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Add customer details
  doc.setFontSize(10);
  doc.setTextColor("#545454");
  doc.text("Bill to:", 20, 55);
  doc.setFontSize(14);
  doc.setTextColor("#292929");
  doc.setFont("helvetica", "bold");
  doc.text(`${data.customerName}`, 20, 62);
  doc.setFontSize(9);
  doc.setTextColor("#545454");
  doc.text(`${data.customerContact}`, 20, 69);
  // doc.text(`${data.customerAddress}`, 20, 74); //address

  // Add sender details
  doc.setFontSize(10);
  doc.setTextColor("#545454");
  doc.setFont("helvetica", "normal");
  doc.text("From:", 190, 55, { align: "right" });
  doc.setFontSize(14);
  doc.setTextColor("#292929");
  doc.setFont("helvetica", "bold");
  doc.text(`${data.companyName}`, 190, 62, { align: "right" });
  doc.setFontSize(9);
  doc.setTextColor("#545454");
  doc.text(`${data.companyStreetAddress}`, 190, 69, { align: "right" });
  doc.text(`${data.companyAreaAddress}`, 190, 74, { align: "right" });
  doc.text(`${data.companyPincodeAddress}`, 190, 79, { align: "right" });

  // Add divider line below customer and sender details
  const lineY = 90; // Y-coordinate for the line
  doc.setDrawColor(84); // Black color for the line
  doc.setLineWidth(0.2); // Line thickness
  doc.line(20, lineY, 190, lineY); // Draw line from (20, lineY) to (190, lineY)

  // Add invoice details
  doc.setFontSize(26);
  doc.setTextColor("#292929");
  doc.text("Invoice", 20, 105);
  doc.setFontSize(10);
  doc.setTextColor("#545454");
  doc.text(`Invoice #: ${data.invoiceNumber}`, 20, 112);
  doc.text(`Ref #: ${data.refNumber}`, 20, 117);
  doc.text(`${data.date}`, 20, 122);

  // Add invoice details
  doc.setFontSize(26);
  doc.setTextColor("#292929");
  doc.text(`Rs. ${data.total}`, 190, 105, { align: "right" });
  doc.setFontSize(10);
  doc.setTextColor("#545454");
  doc.text("Total Amount", 190, 112, { align: "right" });

// Add table for items
const tableBody = data.items.map((item) => [
  item.description,
  item.qty,
  `Rs. ${item.price}`,
  `Rs. ${item.total}`,
]);

doc.autoTable({
  startY: 135,
  head: [["Description", "Qty", "Price", "Total"]],
  body: tableBody,
  theme: "plain",
  headStyles: {
    fontSize: 12,
    fontStyle: "bold",
    textColor: "#292929",
    halign: "left", // Center-align header text
  },
  bodyStyles: {
    fontSize: 11,
    fontStyle: "bold",
    textColor: "#292929",
    lineHeight: 5,
  },
  margin: { top: 30, left: 25, right: 20, bottom: 30 },
  pageBreak: 'auto',
  didDrawCell: (data) => {
    
    // Only draw the line after the header is drawn
    if (data.section === "head" && data.row.index === 0) {
      const startX = 20; // Start X position (matches left margin)
      const endX = 190; // End X position (matches right margin)
      const lineY = data.cell.y + data.cell.height; // Position for the line after the header
      data.row.height = 10;
      // Draw the line
      doc.setDrawColor(84); // Black color for the line
      doc.setLineWidth(0.2); // Line thickness
      doc.line(startX, lineY, endX, lineY); // Draw the line from startX to endX at lineY
    }
  },
});


  doc.setDrawColor(84); // Black color for the line
  doc.setLineWidth(0.2); // Line thickness
  doc.line(20, doc.lastAutoTable.finalY + 3, 190, doc.lastAutoTable.finalY + 3); // Draw line from (20, lineY) to (190, lineY)


// Add totals with more space between label and value
const finalY = doc.lastAutoTable.finalY + 15;

doc.setTextColor("#292929");

// Adjust the Y-values to add more space
doc.setFontSize(12);
doc.text(`Sub-Total:`, 130, finalY, { align: "right" });
doc.text(`Rs. ${data.subtotal}`, 190, finalY, { align: "right" });

doc.setFontSize(10);
const discountLabel = data.discount > 0 ? "Extra Charges:" : "Discount:";
doc.text(discountLabel, 130, finalY + 5, { align: "right" });
doc.text(`Rs. ${data.discount}`, 190, finalY + 5, { align: "right" });

doc.setDrawColor(0); // Black color for the line
doc.setLineWidth(0.2); // Line thickness
doc.line(110, finalY + 11, 190, finalY + 11);

doc.setFontSize(12);
doc.text(`Total:`, 130, finalY + 21, { align: "right" });
doc.text(`Rs. ${data.total}`, 190, finalY + 21, { align: "right" });

doc.setFontSize(10);
doc.text(`Paid:`, 130, finalY + 26, { align: "right" });
doc.text(`Rs. ${data.paid}`, 190, finalY + 26, { align: "right" });

doc.setDrawColor(0); // Black color for the line
doc.setLineWidth(0.2); // Line thickness
doc.line(110, finalY + 32, 190, finalY + 32);

doc.setFontSize(12);
doc.text(`Amount Due:`, 130, finalY + 41, { align: "right" });
doc.text(`Rs. ${data.amountDue}`, 190, finalY + 41, { align: "right" });

doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.text(`Payment Method`, 20, finalY, { align: "left" });
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text(`${data.paymentMethod}`, 20, finalY + 8, { align: "left" });



  // Add footer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor("#6B7280");
  doc.text("This is a computer-generated invoice,", 20, finalY + 20);
  doc.text("no signature required.", 20, finalY + 25);

  const lineContactFooterY = lineY + 175;

  doc.setFont("helvetica", "italic", "bold");
  doc.setTextColor("#292929");
  doc.text(`Tel: ${data.companyTelephoneNumber}`, 20, lineContactFooterY);
  doc.text(`Cell: ${data.companyContactNumber}`, 20, lineContactFooterY + 5);

  doc.setFont("helvetica", "italic", "bold");
  doc.setTextColor("#292929");
  doc.text(`E-Mail: ${data.companyEmailAddress}`, 190, lineContactFooterY, { align: "right" });
  doc.text(`Website: ${data.companyWebsiteURL}`, 190, lineContactFooterY + 5, { align: "right" });

  // Save the PDF
  doc.save(`INV${data.invoiceNumber}_${data.customerName}.pdf`);
};
