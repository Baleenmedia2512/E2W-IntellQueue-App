import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBillPdf = async (entryDetails) => {
  const {
    clientName,
    orderNumber,
    orderAmount,
    gstAmount,
    transactionDate,
    paymentMode,
    remarks,
    clientContact, // Assuming you might get client contact info
    clientAddress, // Assuming you might get client address info
  } = entryDetails;

  // Initialize jsPDF with A4 size in portrait orientation
  const pdf = new jsPDF("portrait", "pt", "A4");

  // Set modern font style (Helvetica)
  pdf.setFont("helvetica");

  // Header Section (Receipt Title and Clinic Logo)
  pdf.setFontSize(32); // Larger font size for title
  pdf.setTextColor(0, 0, 0); // Black color for text
  pdf.text("RECEIPT", 20, 80); // Left-aligned title with more vertical space

  // Add clinic logo or name (right-aligned)
  pdf.setFontSize(18); // Slightly smaller font for logo
  pdf.text("GRACE SCANS", pdf.internal.pageSize.width - 150, 80);

  // Add a thin grey line below the title section
  pdf.setDrawColor(200, 200, 200); // Grey color for the line
  pdf.setLineWidth(1); // Thin line width
  pdf.line(20, 100, pdf.internal.pageSize.width - 20, 100); // Draw the line across the page

  // Client Details Section (Name, Date, Contact, Bill No.)
  const clientDetailsY = 130;
  pdf.setFontSize(16); // Standard font size for labels
  pdf.setTextColor(0, 0, 0); // Dark grey for labels

  // Name and Date (dark grey for labels)
  pdf.text("Name", 20, clientDetailsY);
  pdf.text("Date", pdf.internal.pageSize.width - 250, clientDetailsY);

  // Name and Date values (bold black)
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0); // Black for the values
  pdf.text(clientName || "N/A", 20, clientDetailsY + 25);
  pdf.text(transactionDate || "N/A", pdf.internal.pageSize.width - 250, clientDetailsY + 25);

  // Contact and Bill No. (dark grey for labels)
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0); // Dark grey for labels
  pdf.text("Contact", 20, clientDetailsY + 65);
  pdf.text("Bill No", pdf.internal.pageSize.width - 250, clientDetailsY + 65);

  // Contact and Bill No. values (bold black)
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0); // Black for the values
  pdf.text(clientContact || "N/A", 20, clientDetailsY + 90);
  pdf.text("007" || "N/A", pdf.internal.pageSize.width - 250, clientDetailsY + 90);

  // Address (dark grey for label)
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0); // Dark grey for label
  pdf.text("Address", 20, clientDetailsY + 130);

  // Address value (bold black)
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0); // Black for the value
  const clientAddressBreak = clientAddress || "N/A";

  // Split the address into multiple lines if it's too long
  const addressLines = pdf.splitTextToSize(clientAddressBreak, pdf.internal.pageSize.width - 40); // -40 for left and right margins
  
  // Print each line of the address, incrementing the Y position for each line
  let yPosition = clientDetailsY + 155; // Starting position for the address
  addressLines.forEach((line, index) => {
    pdf.text(line, 20, yPosition + index * 20); // 20px line spacing
  });
  
  // Adjust the startY for the table based on the number of lines in the address
  const tableStartY = yPosition + addressLines.length * 20 + 20; // Add 20px for spacing after the last address line
  
  // Itemized List Table (Qty, Description, Price, Amount)
  autoTable(pdf, {
    startY: tableStartY, // Start the table after the address
    head: [["Qty", "Description", "Price", "Amount"]],
    body: [
      ["1", "Consultation", orderAmount || "0.00", orderAmount || "0.00"],
      ["1", "GST (5%)", gstAmount || "0.00", gstAmount || "0.00"],
    ],
    styles: {
      fontSize: 12, // Standard font size for table content
      halign: "center", // Horizontal alignment in the center
      lineWidth: 0.5, // Set line width for table borders
      lineColor: [0, 0, 0], // Set line color (black)
    },
    headStyles: {
      fillColor: [0, 0, 0], // Black background for header
      textColor: [255, 255, 255], // White text for header
      lineWidth: 0.5, // Border width for header
      lineColor: [0, 0, 0], // Border color for header
    },
    margin: { left: 20, right: 20 },
  });
  
  // Total Section (Right-aligned Total)
  pdf.setFontSize(16); // Larger font for total
  const totalAmount = parseFloat(orderAmount || 0) + parseFloat(gstAmount || 0);
  pdf.text(
    `Total: ₹${totalAmount.toFixed(2)}`,
    pdf.internal.pageSize.width - 120,
    pdf.lastAutoTable.finalY + 20, // Adjust position to be below the table
    { align: "right" }
  );
  

  // Footer Section (Clinic Contact Details)
  pdf.setFontSize(12); // Standard font size for footer
  pdf.text("1942 Ethels Lane, Fort Myers, Florida, 33912", 20, pdf.internal.pageSize.height - 60);
  pdf.text("Tel: (605) 905-8389", 20, pdf.internal.pageSize.height - 45);
  pdf.text("Fax: (605) 916-7847", pdf.internal.pageSize.width - 80, pdf.internal.pageSize.height - 60);
  pdf.text("firstrefuge@gmail.com", pdf.internal.pageSize.width - 80, pdf.internal.pageSize.height - 45);

  // Save the generated PDF
  pdf.save(`Receipt_${clientName || "Unknown"}.pdf`);
};
