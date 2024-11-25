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
    clientContact,
    clientAddress,
  } = entryDetails;

  // Initialize jsPDF with A4 size in portrait orientation
  const pdf = new jsPDF("portrait", "pt", "A4");

  // Watermark Image (Replace with your Base64 string or image URL)
  const watermarkBase64 = '/GS/icon-BW-512x512.png'; // Replace with your Base64 image
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;

  // Create a canvas to adjust image opacity
  const img = new Image();
  img.src = watermarkBase64;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size and draw the image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.globalAlpha = 0.2; // Set the desired opacity (0.0 to 1.0)
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Get the Base64 string of the modified image
    const transparentImage = canvas.toDataURL("image/png");

    // Add the adjusted image to the PDF
    const watermarkHeight = pageHeight / 3;
    const watermarkAspectRatio = 1; // Assuming the watermark is square
    const watermarkWidth = watermarkHeight * watermarkAspectRatio;

    pdf.addImage(
      transparentImage,
      "PNG",
      (pageWidth - watermarkWidth) / 2, // Center horizontally
      (pageHeight - watermarkHeight) / 2, // Center vertically
      watermarkWidth,
      watermarkHeight
    );

    pdf.setTextColor(0, 0, 0);

    // Header Section (Receipt Title and Clinic Logo)
    pdf.setFontSize(32);
    pdf.text("RECEIPT", 20, 80);
    pdf.setFontSize(18);
    pdf.text("GRACE SCANS", pageWidth - 150, 80);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.line(20, 100, pageWidth - 20, 100);

    // Client Details Section
    const clientDetailsY = 130;
    pdf.setFontSize(16);
    pdf.text("Name", 20, clientDetailsY);
    pdf.text("Date", pageWidth - 250, clientDetailsY);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(clientName || "N/A", 20, clientDetailsY + 25);
    pdf.text(transactionDate || "N/A", pageWidth - 250, clientDetailsY + 25);

    // Contact and Bill No.
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "normal");
    pdf.text("Contact", 20, clientDetailsY + 65);
    pdf.text("Bill No", pageWidth - 250, clientDetailsY + 65);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(clientContact || "N/A", 20, clientDetailsY + 90);
    pdf.text("007" || "N/A", pageWidth - 250, clientDetailsY + 90);

    // Address Section
    pdf.setFont("helvetica", "normal");
    pdf.text("Address", 20, clientDetailsY + 130);
    const clientAddressBreak = clientAddress || "N/A";
    const addressLines = pdf.splitTextToSize(clientAddressBreak, pageWidth - 40);
    let yPosition = clientDetailsY + 155;
    addressLines.forEach((line, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(line, 20, yPosition + index * 20);
    });

    const tableStartY = yPosition + addressLines.length * 20 + 20;

    // Itemized List Table
    autoTable(pdf, {
      startY: tableStartY,
      head: [["S.No", "Description", "Qty", "Amount"]],
      body: [
        ["1", "USG Scan - Abdomen", "1", orderAmount || "0.00"],
        ["2", "X-Ray - Hand", "1", orderAmount || "0.00"],
      ],
      styles: {
        fontSize: 12,
        halign: "center",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
      },
      margin: { left: 20, right: 20 },
    });

    // Total Section
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold"); // Set font to bold

    const totalAmount = parseFloat(orderAmount || 0) + parseFloat(gstAmount || 0);
    const totalText = `Total: Rs ${totalAmount}`;
    const letterSpacing = 3; // Adjust letter spacing (in points)

    let currentX = pageWidth - 70;
    for (let i = totalText.length - 1; i >= 0; i--) {
      const charWidth = pdf.getTextWidth(totalText[i]);
      currentX -= charWidth + letterSpacing;
      pdf.text(totalText[i], currentX, pdf.lastAutoTable.finalY + 30);
    }

    // Footer Section
    pdf.setFontSize(12);
    pdf.text("19/61, Jawahar Main Road, NRT Nagar, Theni, 625531", 20, pageHeight - 60);
    pdf.text("Tel: 04546-253607", 20, pageHeight - 45);
    pdf.text("Email: gracescans@gmail.com", pageWidth - 200, pageHeight - 60);
    pdf.text("Website: gracescans.com", pageWidth - 200, pageHeight - 45);

    // Save the PDF
    pdf.save(`Receipt_${clientName || "Unknown"}.pdf`);
  };
};
