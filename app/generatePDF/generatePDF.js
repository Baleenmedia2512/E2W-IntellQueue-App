import { data } from 'autoprefixer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdf = async(checkoutData, clientName, clientEmail, clientTitle, quoteNumber) => {
  const ImageUrl = '/images/WHITE PNG.png';
  
  const getMinValidityDays = () => {
    // Define an array of month abbreviations
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Convert formatted dates to Date objects
    const validityDaysArray = checkoutData.map(item => new Date(item.formattedDate));

    // Find the minimum date
    const minDate = new Date(Math.min(...validityDaysArray));

    // Extract year, month, and day from the minimum date
    const year = minDate.getFullYear();
    const month = monthNames[minDate.getMonth()]; // Get month abbreviation
    const day = String(minDate.getDate()).padStart(2, '0');

    // Format the date as "DD-MMM-YYYY"
    return `${day}-${month}-${year}`;
};

  const minimumValidityDate = getMinValidityDays();
  
  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: 'letter'
  });

  //Helper function to add Header Section
  const addHeader = () => {
    const Header = 'Advertisement Proposal'
    // Set font styles
    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(16);

    // Add a title
    pdf.text(Header, 300, 30);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.addImage(ImageUrl, 'PNG', 10, 60, 100, 100)
    pdf.text('To,', 10, 165);
    pdf.text(clientName, 10, 180);
    pdf.text(clientEmail, 10, 195);

    const lineThickness = 3; // Set the desired thickness
    pdf.setLineWidth(lineThickness);

    const pageWidth = pdf.internal.pageSize.width;
    var textWidth = pdf.getStringUnitWidth('Kasturba Nagar, Adyar, Chennai-20.') * 12; // Adjust the font size multiplier as needed
    var xCoordinate = pageWidth - textWidth - 40;
    pdf.setDrawColor("#df5f98");
    pdf.line(xCoordinate, 60, xCoordinate, 135);

    pdf.setDrawColor("#0097d0");
    pdf.line(xCoordinate, 136, xCoordinate, 195);

    textWidth = pdf.getStringUnitWidth('Baleen Media') * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text('Baleen Media', xCoordinate, 90);

    textWidth = pdf.getStringUnitWidth('No.32, 3rd Cross Street,') * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text('No.32, 3rd Cross Street,', xCoordinate, 105)

    textWidth = pdf.getStringUnitWidth('Kasturba Nagar, Adyar, Chennai-20.') * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text('Kasturba Nagar, Adyar, Chennai-20.', xCoordinate, 120)

    textWidth = pdf.getStringUnitWidth('Phone: 95660 31113') * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text('Phone: 95660 31113', xCoordinate, 135)

    textWidth = pdf.getStringUnitWidth('www.baleenmedia.com') * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text('www.baleenmedia.com', xCoordinate, 150)

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const proposedDay = ('0' + today.getDate()).slice(-2); // Ensure two digits for day
    const proposedMonth = months[today.getMonth()]; // Get month abbreviation from the array
    const proposedYear = today.getFullYear();
    const formattedDate = `${proposedDay}-${proposedMonth}-${proposedYear}`;

    textWidth = pdf.getStringUnitWidth(`Proposal Date: ${formattedDate}`) * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text(`Proposal Date: ${formattedDate}`, xCoordinate, 165)

    textWidth = pdf.getStringUnitWidth(`Validity Date: ${minimumValidityDate}`) * 12; // Adjust the font size multiplier as needed
    xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
    pdf.text(`Validity Date: ${minimumValidityDate}`, xCoordinate, 180);
  }

  // Calculate GST percentage for each adMedium
  const calculateGstPercentage = (items) => {
    if (!items || items.length === 0) return 'N/A';
    const gstSet = new Set(items.map(item => item.gst));
    if (gstSet.size === 1) {
      return [...gstSet][0]; // Return the single GST percentage if all are the same
    }
    return 'Varies'; // If there are multiple GST percentages
  };

  const addTermsAndConditions = () => {
    const pageHeight = pdf.internal.pageSize.height;
    const bottomMargin = 50; // Space you want to leave at the bottom of the page
    const termsHeight = 130; // Estimated height of the terms and conditions section

    // Determine yPosition for terms and conditions
    let yPosition = pageHeight - termsHeight - bottomMargin;

    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(16);
    pdf.text("IMPORTANT TERMS & CONDITIONS", 10, yPosition)

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text( "1.For Online Transfer: Current Acc.No:104005500375,IFSC: ICIC0001040,SWIFT: ICICNBBXXX", 10, yPosition + 25);
    pdf.text(`2.Ad. Material shall be shared by ${clientTitle} ${clientName}`, 10, yPosition + 40)
    pdf.text("3.100% Upfront payment required for releasing the Ads", 10, yPosition + 55)
    //pdf.text(`4.Lead time to book the Ad : ${getMinLeadDays()} Days`, 10, pdf.internal.pageSize.height - 75)
    pdf.text("5.Tax invoice shall be issued only on or after Ad. Release date", 10, yPosition + 70)

    pdf.setDrawColor("#df5f98");
    pdf.line(10, yPosition + 100, 400, yPosition + 100);

    pdf.setDrawColor("#0097d0");
    pdf.line(401, yPosition + 100, 790, yPosition + 100);
    
    const Address = "No.32, 3rd Cross Street, Kasturba Nagar, Adyar, Chennai-20 | GST: 33AEDPL3590D1ZT"
    pdf.text(Address, 200, yPosition + 115)
    
    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(12);
    pdf.text('Call: 95660 31113', 10, yPosition + 130)

    

    const pageWidth = pdf.internal.pageSize.width;
    const textWidth = pdf.getStringUnitWidth('www.baleenmedia.com') * 12;
    var xCoordinate = pageWidth - textWidth - 20;
    pdf.text('www.baleenmedia.com', xCoordinate, yPosition + 130)
  };

  //Group the adMedium and create seperate tables for each adMedium
  const groupedData = checkoutData.reduce((acc, item) => {
    if(!acc[item.adMedium]){
      acc[item.adMedium] = [];
    }
    acc[item.adMedium].push(item);
    return acc;
  }, {});

  //iterating through the adMedium for each group to create seperate tables
  Object.keys(groupedData).forEach((adMedium, index) => {
    if(index > 0){
      pdf.addPage();
    }
    
    addHeader();

    const items = groupedData[adMedium];
    const hasCampaignDuration = items.some(item => item.campaignDuration && item.campaignDuration !== 'NA');
    const isNewspaper = items.some(item => item.adMedium === 'Newspaper')

    //Getting GST value
    const gstPercentage = calculateGstPercentage(items);

    //showing the ratename of the ad
    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(14);
    pdf.text(`${adMedium} (GST@${gstPercentage})`, 10, 230);

    const data = items.map((item, i) => [
      (i + quoteNumber).toString(), item.adType, item.adCategory, item.edition, item.position ? item.position : 'NA', item.qtyUnit === "SCM" ? item.width + "W x " + item.qty + "H" : item.qty + " " + item.qtyUnit, hasCampaignDuration ? item.campaignDuration ? (item.campaignDuration + " " + (item.CampaignDurationUnit ? item.CampaignDurationUnit : '')) : 'NA' : null, item.ratePerQty, item.amountExclGst, item.amountInclGst, item.leadDays,item.remarks ? item.remarks : 'NA'
    ].filter(Boolean))

    const headerColumns = [['S.No.', 'Ad Type', 'Ad Category', isNewspaper ? 'Edition' : 'Location', 'Package', isNewspaper ? 'Size (in SCM)' :'Qty', hasCampaignDuration ? 'Campaign Duration' : null, `Price Per ${isNewspaper ? 'SCM' : 'Qty'} (in Rs.)`, 'Price (Excl. GST) (in Rs.)', "Price (incl. GST) (in Rs.)", "Lead Days","Remarks"].filter(Boolean)];

    let columnWidths = {
      'Quote.No.': 45,
      'Ad Type': 60,
      'Ad Category': 60,
      'Edition': 60,
      'Package': 60,
      'Qty': 50,
      'Campaign Duration': hasCampaignDuration ? 60 : 0,
      'Rate Per Qty (in Rs.)': 50,
      'Amount (Excl. GST) (in Rs.)': 60,
      'Amount (incl. GST) (in Rs.)': 60,
      'Lead Days': 50,
      'Remarks': 60
    };
    
    // Map column names to their indices
    let headerMap = {};
    headerColumns[0].forEach((header, index) => {
      headerMap[header] = index;
    });
    
    const rightAlignColumns = ['Price Per Qty (in Rs.)', 'Price (Excl. GST) (in Rs.)', 'GST', 'Price (incl. GST) (in Rs.)', 'Price Per SCM (in Rs.)'];
    // Convert column names to indices and assign column widths
    let columnStyles = {};
    Object.keys(columnWidths).forEach(columnName => {
      let columnIndex = headerMap[columnName];
      if (columnIndex !== undefined) {
          columnStyles[columnIndex] = { 
            cellWidth: columnWidths[columnName], 
            halign: rightAlignColumns.includes(columnName) ? 'right' : 'left' 
          };
      }
    });

    // Create a table
    autoTable(pdf, {
      head: headerColumns,
      body: data,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        valign: "middle"
      },
      headStyles: {
        textColor: [255, 255, 255],
        fillColor: [50, 50, 50]
      },
      margin: {top: 245, left: 10},
      columnStyles: columnStyles,
      tableWidth: 'auto'
    })
  
  const yPosition = pdf.lastAutoTable.finalY + 20;

  if(index === Object.keys(groupedData).length - 1 && yPosition + 135 <= pdf.internal.pageSize.height){
    addTermsAndConditions()
  } else if(index === Object.keys(groupedData).length - 1){
    pdf.addPage();
    addTermsAndConditions();
  }

  const pageHeight = pdf.internal.pageSize.height;
    const bottomMargin = 10; // Space you want to leave at the bottom of the page
    const termsHeight = 10; // Estimated height of the terms and conditions section

  pdf.setFont('helvetica', 'normal', '100');
  const pageWidth = pdf.internal.pageSize.width;
    const textWidth = pdf.getStringUnitWidth('Page 10 Of 10') * 12;
    var xCoordinate = pageWidth - textWidth - 20;
    pdf.text(`Page ${index + 1} of ${Object.keys(groupedData).length}`, xCoordinate, pageHeight - termsHeight - bottomMargin)
})
  // Save the PDF
  pdf.save(`Quote${quoteNumber}_${clientName}.pdf`);

  return
};