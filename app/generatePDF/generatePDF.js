import Cookies from 'js-cookie';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchNextQuoteNumber } from '../api/fetchNextQuoteNumber';

export const generatePdf = async(checkoutData) => {

  const ImageUrl = '/images/WHITE PNG.png';
  const quoteNumber = await fetchNextQuoteNumber();
  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: 'letter'
  });
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
  pdf.text(Cookies.get('clientname'), 10, 180);
  pdf.text(Cookies.get('clientemail'), 10, 195);

  const lineThickness = 3; // Set the desired thickness
  pdf.setLineWidth(lineThickness);

  const pageWidth = pdf.internal.pageSize.width;
  var textWidth = pdf.getStringUnitWidth('Kasturba Nagar, Adyar, Chennai-20.   ') * 12; // Adjust the font size multiplier as needed
  var xCoordinate = pageWidth - textWidth - 40;
  pdf.setDrawColor("#df5f98");
  pdf.line(xCoordinate, 60, xCoordinate, 135);

  pdf.setDrawColor("#0097d0");
  pdf.line(xCoordinate, 136, xCoordinate, 195);

  // Calculate the x-coordinate for right-aligned text
 
  // textWidth = pdf.getStringUnitWidth('From,') * 12; // Adjust the font size multiplier as needed
  // xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  // pdf.text('From,', xCoordinate, 60);

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

  textWidth = pdf.getStringUnitWidth(`Proposal ID: ${quoteNumber}`) * 12; // Adjust the font size multiplier as needed
  xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  pdf.text(`Proposal ID: ${quoteNumber}`, xCoordinate, 165)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const today = new Date();
const proposedDay = ('0' + today.getDate()).slice(-2); // Ensure two digits for day
const proposedMonth = months[today.getMonth()]; // Get month abbreviation from the array
const proposedYear = today.getFullYear();

const formattedDate = `${proposedDay}-${proposedMonth}-${proposedYear}`;

  textWidth = pdf.getStringUnitWidth(`Proposal Date: ${formattedDate}`) * 12; // Adjust the font size multiplier as needed
  xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  pdf.text(`Proposal Date: ${formattedDate}`, xCoordinate, 180)

  // textWidth = pdf.getStringUnitWidth(`Valid Till: ${checkoutData[14]}`) * 12; // Adjust the font size multiplier as needed
  // xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  // pdf.text(`Valid Till: ${checkoutData[14]}`, xCoordinate, 195)
  // textWidth = pdf.getStringUnitWidth('No.32, 3rd Cross Street,') * 12; // Adjust the font size multiplier as needed
  // xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  // pdf.text('No.32, 3rd Cross Street,', xCoordinate, 90)
  //pdf.text('From,', 10, 90);
  // Set font styles for the table
  // pdf.setFont('normal');
  // pdf.setFontSize(12);

  const [day, month, year] = checkoutData[14].split('-');
  const yearYY = year.slice(-2);

// Concatenate day, month, and the shortened year to form the new date string
const formattedValidityDate = `${day}-${month}-${yearYY}`;

  // Create a table
  let headers = [['S.No.', 'Ad Medium', 'Ad Type', 'Ad Category', 'Edition', 'Package', 'Qty', 'Campaign Duration', 'Rate Per Qty (in Rs.)', 'Amount (Excl. GST) (in Rs.)', 'GST', "Amount (incl. GST) (in Rs.)", "Validity Date"]];
  let data = [
    ['1', checkoutData[0], checkoutData[13], checkoutData[1], checkoutData[2], checkoutData[3], checkoutData[4] + " " + checkoutData[12], checkoutData[5] + " " + checkoutData[11], checkoutData[6], checkoutData[7], checkoutData[8], checkoutData[9], formattedValidityDate],
    //['Row 2 Data 1', 'Row 2 Data 2', 'Row 2 Data 3', 'Column 3', 'Column 3', 'Column 3', 'Column 3', 'Column 3', 'Column 3', 'Column 3'],
    // Add more rows as needed
  ]; 

  if (!checkoutData[3]) {
    headers = headers.map(row => row.filter(column => column !== 'Package'));
    data = data.map(row => row.filter(column => column !== checkoutData[3]));
}
if (!checkoutData[1]) {
  headers = headers.map(row => row.filter(column => column !== 'Ad Category'));
  data = data.map(row => row.filter(column => column !== checkoutData[1]));
}
if (!checkoutData[13]) {
  headers = headers.map(row => row.filter(column => column !== 'Ad Type'));
  data = data.map(row => row.filter(column => column !== checkoutData[13]));
}

let columnWidths = {
  'S.No.': 35,
  'Ad Medium': 60,
  'Ad Type': 60,
    'Ad Category': { minCellWidth: 100 },
    'Edition': 60,
    'Package': { minCellWidth: 65 },
    'Qty': 45,
    'Campaign Duration': 65,
    'Rate Per Qty (in Rs.)': 50,
    'Amount (Excl. GST) (in Rs.)': 65,
    'GST': 30,
    'Amount (incl. GST) (in Rs.)': 65,
    'Validity Date': 55
};

// Map column names to their indices
let headerMap = {};
headers[0].forEach((header, index) => {
  headerMap[header] = index;
});

// Convert column names to indices and assign column widths
let columnStyles = {};
Object.keys(columnWidths).forEach(columnName => {
  let columnIndex = headerMap[columnName];
  if (columnIndex !== undefined) {
      columnStyles[columnIndex] = { columnWidth: columnWidths[columnName] };
  }
});

  // Add the table to the PDF
  autoTable(pdf, {
    head: headers, 
    body: data, 
      styles: {
        fillColor: [51,51,51],
        lineColor: 240, 
        lineWidth: 1,
        valign: 'middle',
      },
      margin: {top: 210, left: 10},
      columnStyles: columnStyles,
      // addPageContent: function(data) {
      //   pdf.text("", 40, 30);
      // },
      tableWidth: 'auto'
  })

  pdf.setFont('helvetica', 'normal', 'bold');
  pdf.setFontSize(16);
  pdf.text("IMPORTANT TERMS & CONDITIONS", 10, 330)

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text( "1.For Online Transfer: Current Acc.No:104005500375,IFSC: ICIC0001040,SWIFT: ICICNBBXXX", 10, 360);
  pdf.text(`2.Ad. Material shall be shared by ${Cookies.get('clientname')}`, 10, 375)
  pdf.text("3.100% Upfront payment required for releasing the Ads", 10, 390)
  pdf.text(`4.Lead time to book the Ad : ${checkoutData[10]} Days`, 10, 405)
  pdf.text("5.Tax invoice shall be issued only on or after Ad. Release date", 10, 420)

  pdf.setDrawColor("#df5f98");
  pdf.line(10, pdf.internal.pageSize.height - 45, 400, pdf.internal.pageSize.height - 45);

  pdf.setDrawColor("#0097d0");
  pdf.line(401, pdf.internal.pageSize.height - 45, 790, pdf.internal.pageSize.height - 45);
  
  const Address = "No.32, 3rd Cross Street, Kasturba Nagar, Adyar, Chennai-20 | GST: 33AEDPL3590D1ZT"
  pdf.text(Address, 200, pdf.internal.pageSize.height - 30)
  
  pdf.setFont('helvetica', 'normal', 'bold');
  pdf.setFontSize(12);
  pdf.text('Call: 95660 31113', 10, pdf.internal.pageSize.height - 15)

  textWidth = pdf.getStringUnitWidth('www.baleenmedia.com') * 12; // Adjust the font size multiplier as needed
  xCoordinate = pageWidth - textWidth - 20; // 10 is a margin value, adjust as needed
  pdf.text('www.baleenmedia.com', xCoordinate, pdf.internal.pageSize.height - 15)
  // Save the PDF
  pdf.save(`Quote${quoteNumber}_${Cookies.get('clientname')}.pdf`);
};