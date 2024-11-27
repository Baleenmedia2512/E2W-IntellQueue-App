import jsPDF from "jspdf";
import "jspdf-autotable";

const generatePDF = (data) => {
  const doc = new jsPDF();

  // Add high-resolution logo image
  const logoUrl = '/GS/GSTitleLogo360x120.png'; // Path to your high-resolution logo
  const logoX = 20; // X position for the logo
  const logoY = 20; // Y position for the logo

  // Adjust width and height (use points for scaling: 1 point = 1/72 inch)
  const logoWidth = 80; // Width in points (scaled from original for higher resolution)
  const logoHeight = 26.67; // Height in points (proportional to 240x80 resolution)
  doc.addImage(logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Add customer details
  doc.setFontSize(10);
  doc.setTextColor("#000");
  doc.text("Bill to:", 20, 55);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.customerName}`, 20, 62);
  doc.setFontSize(9);
  doc.text(`${data.customerContact}`, 20, 69);
  doc.text(`${data.customerAddress}`, 20, 74);

  // Add sender details
  doc.setFontSize(10);
  doc.setTextColor("#000");
  doc.text("From:", 180, 55, { align: "right" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Grace Scans", 180, 62, { align: "right" });
  doc.setFontSize(9);
  doc.text("19/61, Jawahar Main Road,", 180, 69, { align: "right" });
  doc.text("NRT Nagar, Theni", 180, 74, { align: "right" });
  doc.text("625531", 180, 79, { align: "right" });

  // Add divider line below customer and sender details
  const lineY = 90; // Y-coordinate for the line
  doc.setDrawColor(0); // Black color for the line
  doc.setLineWidth(0.2); // Line thickness
  doc.line(20, lineY, 180, lineY); // Draw line from (20, lineY) to (180, lineY)

  // Add invoice details
  doc.setFontSize(26);
  doc.text("Invoice", 20, 105);
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 20, 112);
  doc.text(`Ref #: ${data.refNumber}`, 20, 117);
  doc.text(`${data.date}`, 20, 122);

  // Add invoice details
  doc.setFontSize(26);
  doc.text(`Rs. ${data.total}`, 180, 105, { align: "right" });
  doc.setFontSize(10);
  doc.text("Total Amount", 180, 112, { align: "right" });

// Add table for items
const tableBody = data.items.map((item) => [
  item.description,
  item.qty,
  `Rs. ${item.price}`,
  `Rs. ${item.total}`,
]);

doc.autoTable({
  startY: 130,
  startX: 20, // Table starts at 20 (left margin)
  // Ensure the table spans the width by specifying a proper width
  width: 160, // Width of the table, calculated as (endX - startX), which is 180 - 20 = 160
  head: [["Description", "Qty", "Price", "Total"]],
  body: tableBody,
  theme: "plain", // Removes grid lines and fill colors
  headStyles: { fontSize: 12, fontStyle: "bold" }, // Font size for the header
  bodyStyles: { fontSize: 11 }, // Font size for the body
  didDrawCell: (data) => {
    // Only draw the line after the header is drawn
    if (data.section === "head" && data.row.index === 0) {
      const startX = 20;  // Start X position (matches left margin)
      const endX = 180;   // End X position (matches right margin)
      const lineY = data.cell.y + data.cell.height; // Position for the line after the header

      // Draw the line
      doc.setDrawColor(0); // Black color for the line
      doc.setLineWidth(0.2); // Line thickness
      doc.line(startX, lineY, endX, lineY); // Draw the line from startX to endX at lineY
    }
  },
});


  doc.setDrawColor(0); // Black color for the line
  doc.setLineWidth(0.2); // Line thickness
  doc.line(20, doc.lastAutoTable.finalY + 5, 180, doc.lastAutoTable.finalY + 5); // Draw line from (20, lineY) to (180, lineY)


// Add totals with more space between label and value
const finalY = doc.lastAutoTable.finalY + 15;

// Adjust the Y-values to add more space
doc.setFontSize(12);
doc.text(`Sub-Total:`, 130, finalY, { align: "right" });
doc.text(`Rs. ${data.subtotal}`, 175, finalY, { align: "right" });

doc.setFontSize(10);
doc.text(`Discount:`, 130, finalY + 5, { align: "right" });
doc.text(`Rs. ${data.discount}`, 175, finalY + 5, { align: "right" });

doc.setDrawColor(0); // Black color for the line
doc.setLineWidth(0.2); // Line thickness
doc.line(110, finalY + 11, 180, finalY + 11);

doc.setFontSize(12);
doc.text(`Total:`, 130, finalY + 21, { align: "right" });
doc.text(`Rs. ${data.total}`, 175, finalY + 21, { align: "right" });

doc.setFontSize(10);
doc.text(`Paid:`, 130, finalY + 26, { align: "right" });
doc.text(`Rs. ${data.paid}`, 175, finalY + 26, { align: "right" });

doc.setDrawColor(0); // Black color for the line
doc.setLineWidth(0.2); // Line thickness
doc.line(110, finalY + 32, 180, finalY + 32);

doc.setFontSize(12);
doc.text(`Amount Due:`, 130, finalY + 41, { align: "right" });
doc.text(`Rs. ${data.amountDue}`, 175, finalY + 41, { align: "right" });

doc.setFont("helvetica", "normal");
doc.setFontSize(12);
doc.text(`Payment Method`, 20, finalY, { align: "left" });
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text(`${data.amountDue}`, 20, finalY + 8, { align: "left" });


  // Add footer
  doc.setFontSize(10);
  doc.setTextColor("#6B7280");
  doc.text(
    "This is a computer-generated invoice, no signature required.",
    20,
    finalY + 30
  );
  doc.text(`Contact: ${data.contactInfo}`, 20, finalY + 35);

  // Save the PDF
  doc.save("Invoice.pdf");
};

const InvoicePDF = () => {
  // Example dynamic data
  const invoiceData = {
    customerName: "Logeshwaran",
    customerAddress: "Andipatti",
    customerContact: "01310983913",
    invoiceNumber: "1234",
    refNumber: "220",
    date: "November 27, 2024",
    items: [
      { description: "CT Scan - Abdomen & Thorax", qty: 1, price: 5500, total: 5500 },
      { description: "CT Scan - Duplicate Report", qty: 2, price: 200, total: 400 },
    ],
    subtotal: 5900,
    discount: 1000,
    total: 4900,
    contactInfo: "Tel: 04546 - 253607 | Cell: 97918 03006",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Invoice Generator</h1>
      <button
        onClick={() => generatePDF(invoiceData)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Download Invoice
      </button>
    </div>
  );
};

export default InvoicePDF;
