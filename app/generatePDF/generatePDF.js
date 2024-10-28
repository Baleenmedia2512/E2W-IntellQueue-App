import { data } from 'autoprefixer';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdf = async(checkoutData, clientName, clientEmail, clientTitle, quoteNumber, TnC) => {
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
    const Header = 'Proposal'
    // Set font styles
    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(16);

    // Add a title
    pdf.text(Header, 350, 30);

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

  const addTermsAndConditions = (index) => {
    var pageHeight = pdf.internal.pageSize.height;
    var bottomMargin = 50; // Space you want to leave at the bottom of the page
    var termsHeight = 130; // Estimated height of the terms and conditions section

    // Determine yPosition for terms and conditions
    let yPosition = pageHeight - termsHeight - bottomMargin;

    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(16);
    pdf.text("IMPORTANT TERMS & CONDITIONS", 10, yPosition)

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);

    let tempPosition = yPosition + 40;
    TnC.forEach((message, index) => {
      
      if (TnC[index]["ID"] === 2) {
          // For the 2nd content, include clientTitle and clientName
          pdf.text(`${index+1}. ${TnC[index]["Message"]} ${clientTitle} ${clientName}`, 10, tempPosition);
          tempPosition += 15; // Move down for the next line (as per your original example)
      } else {
          // Adjust yPosition for the 3rd content
          pdf.text((index+1) + ". " + TnC[index]["Message"], 10, tempPosition);
          tempPosition += 15; // Move down for the next line (as per your original example)
      }
  });

  yPosition = tempPosition
  //   let tempPosition = yposition + 40;
  //   TnC.map((message, index) => {
  //     pdf.text( TnC[index][message], 10, tempPosition)
  //     tempPosition += 1;
  // });

     //"1.For Online Transfer: Current Acc.No:104005500375,IFSC: ICIC0001040,SWIFT: ICICNBBXXX"
    // pdf.text(`${TnC[1]["Message"]} ${clientTitle} ${clientName}`, 10, yPosition + 55) //2.Ad. Material shall be shared by
    // pdf.text(TnC[2]["Message"], 10, yPosition + 70) //"3.100% Upfront payment required for releasing the Ads"
    // //pdf.text(`4.Lead time to book the Ad : ${getMinLeadDays()} Days`, 10, pdf.internal.pageSize.height - 75)
    // pdf.text(TnC[3]["Message"], 10, yPosition + 85) //"4.Tax invoice shall be issued only on or after Ad. Release date"

    pdf.setDrawColor("#df5f98");
    pdf.line(10, yPosition, 400, yPosition);

    pdf.setDrawColor("#0097d0");
    pdf.line(401, yPosition , 790, yPosition);
    
    yPosition += 15;

    const Address = "No.32, 3rd Cross Street, Kasturba Nagar, Adyar, Chennai-20 | GST: 33AEDPL3590D1ZT"
    pdf.text(Address, 200, yPosition)
    
    yPosition += 15;

    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(12);
    pdf.text('Call: 95660 31113', 10, yPosition)

    

    var pageWidth = pdf.internal.pageSize.width;
    var textWidth = pdf.getStringUnitWidth('www.baleenmedia.com') * 12;
    var xCoordinate = pageWidth - textWidth - 20;
    pdf.text('www.baleenmedia.com', xCoordinate, yPosition);
    // pageWidth = pdf.internal.pageSize.width;
    // textWidth = pdf.getStringUnitWidth('Page 10 Of 10') * 12;
    // xCoordinate = pageWidth - textWidth - 20;
    // pdf.setFont('helvetica', 'normal', '100');
    // pageHeight = pdf.internal.pageSize.height;
    // bottomMargin = 10; // Space you want to leave at the bottom of the page
    // termsHeight = 10; // Estimated height of the terms and conditions section
    // pdf.internal.pages.length > 2 && pdf.text(`Page ${index} of ${pdf.internal.pages.length - 1}`, xCoordinate, pageHeight - bottomMargin - termsHeight)
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
    const hasCampaignDuration = items.some(item => item.campaignDuration);
    const hasAdType = items.some(item => item.adType && item.adType !== "");
    const hasAdCategory = items.some(item => item.adCategory && item.adCategory !== "");
    const hasPosition = items.some(item => item.edition && item.edition !== "");
    const isNewspaper = items.some(item => item.adMedium === 'Newspaper');
    const hasRemarks = items.some(item => item.remarks && item.remarks !== "NA");
    

    //Getting GST value
    const gstPercentage = calculateGstPercentage(items);

    //showing the ratename of the ad
    pdf.setFont('helvetica', 'normal', 'bold');
    pdf.setFontSize(14);
    pdf.text(`${adMedium} Campaign (GST@${gstPercentage})`, 10, 230);

    const data = items.map((item, i) => [
      (i + 1).toString(), item.rateId, item.adType ? item.adType : 'NA', item.adCategory ? item.adCategory : 'NA', item.edition, item.position ? item.position : 'NA', item.qtyUnit === "SCM" ? item.width + "W x " + item.qty + "H" + " (" + item.qtyUnit + ")": item.qty + " " + item.qtyUnit, hasCampaignDuration ? item.campaignDuration ? (item.campaignDuration + " " + (item.CampaignDurationUnit ? item.CampaignDurationUnit : '')) : 'NA' : null, item.ratePerQty + ' Per ' + item.qtyUnit, item.amountExclGst, item.amountInclGst, item.leadDays ? item.leadDays : 2, hasRemarks ? item.remarks ? item.remarks : 'NA' : null
    ].filter(Boolean))

    const headerColumns = [['S.No.', 'Rate Card ID', hasAdType ? 'Rate Type' : null, hasAdCategory ? 'Rate Category' : null, isNewspaper ? 'Edition' : 'Service Location', hasPosition ? 'Package' : null, isNewspaper ? 'Size' :'Qty', hasCampaignDuration ? 'Service Duration' : null, `Unit Price (in Rs.)`, 'Price (Excl. GST) (in Rs.)', "Price (Incl. GST) (in Rs.)", "Lead Days", hasRemarks ? "Remarks" : null].filter(Boolean)];

    let columnWidths = {
      'S.No.': 45,
      'Rate Card ID': 45,
      // 'Rate Type': 60,
      'Rate Category': 80,
      // 'Edition': 60,
      // 'Package': 60,
      'Size': 60,
      // 'Campaign Duration': hasCampaignDuration ? 80 : 0,
      'Unit Price (in Rs.)': 80,
      'Price (Excl. GST) (in Rs.)': 80,
      'Price (Incl. GST) (in Rs.)': 80,
      // 'Lead Days': 50,
      // 'Remarks': 60
    };
    
    // Map column names to their indices
    let headerMap = {};
    headerColumns[0].forEach((header, index) => {
      headerMap[header] = index;
    });

    const rightAlignColumns = ['Unit Price (in Rs.)', 'Price (Excl. GST) (in Rs.)', 'Price (Incl. GST) (in Rs.)'];
   // Convert column names to indices and assign column widths
    let columnStyles = {};
    Object.keys(columnWidths).forEach(columnName => {
      let columnIndex = headerMap[columnName];
      if (columnIndex !== undefined) {
          columnStyles[columnIndex] = { 
            cellWidth: columnWidths[columnName], 
            halign: rightAlignColumns.includes(columnName) ? 'right' : columnName === 'Lead Days' ? 'center' : 'left'
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

  const pageHeight = pdf.internal.pageSize.height;
    const bottomMargin = 10; // Space you want to leave at the bottom of the page
    const termsHeight = 10; // Estimated height of the terms and conditions section

  pdf.setFont('helvetica', 'normal', '100');
  const pageWidth = pdf.internal.pageSize.width;
    const textWidth = pdf.getStringUnitWidth('Page 10 Of 10') * 12;
    var xCoordinate = pageWidth - textWidth - 20;
    pdf.text(`Page ${index + 1} of ${pdf.internal.pages.length - 1}`, xCoordinate, pageHeight - termsHeight - bottomMargin)
  if(index === Object.keys(groupedData).length - 1 && yPosition + 150 <= pdf.internal.pageSize.height){
    addTermsAndConditions(index + 2)
    
  } else if(index === Object.keys(groupedData).length - 1){
    pdf.addPage();
    addTermsAndConditions(index + 2);
    
  }
})
  // Save the PDF
  pdf.save(`Quote${quoteNumber}_${clientName}.pdf`);

  return
};