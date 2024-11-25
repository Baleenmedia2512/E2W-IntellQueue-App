import { useState } from 'react';
import { jsPDF } from 'jspdf';

const InvoicePreview = ({ invoice }) => {
  const [editableInvoice, setEditableInvoice] = useState(invoice);

  const handleTextChange = (e, field) => {
    setEditableInvoice({
      ...editableInvoice,
      [field]: e.target.value,
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add dynamic content sections to PDF
    doc.text(`Invoice #${editableInvoice.invoiceNumber}`, 20, 20);
    doc.text(`Client Name: ${editableInvoice.clientName}`, 20, 30);
    doc.text(`Total Amount: ${editableInvoice.totalAmount}`, 20, 40);

    // Add items dynamically
    editableInvoice.items.forEach((item, index) => {
      doc.text(
        `${item.description} - ${item.quantity} x ${item.unitPrice}`,
        20,
        50 + index * 10
      );
    });

    // Add payment terms
    doc.text(`Payment Terms: ${editableInvoice.paymentTerms}`, 20, 100);

    // Save the generated PDF
    doc.save('invoice.pdf');
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-md">
      <h2 className="text-xl font-bold">Invoice Preview</h2>
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-gray-700">Client Name:</label>
          <input
            type="text"
            value={editableInvoice.clientName}
            onChange={(e) => handleTextChange(e, 'clientName')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-gray-700">Total Amount:</label>
          <input
            type="text"
            value={editableInvoice.totalAmount}
            onChange={(e) => handleTextChange(e, 'totalAmount')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700">Items:</label>
          {editableInvoice.items.map((item, index) => (
            <div key={index} className="space-x-2">
              <input
                type="text"
                value={item.description}
                onChange={(e) => {
                  const updatedItems = [...editableInvoice.items];
                  updatedItems[index].description = e.target.value;
                  setEditableInvoice({ ...editableInvoice, items: updatedItems });
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Item Description"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const updatedItems = [...editableInvoice.items];
                  updatedItems[index].quantity = e.target.value;
                  setEditableInvoice({ ...editableInvoice, items: updatedItems });
                }}
                className="w-24 p-2 border border-gray-300 rounded-md"
                placeholder="Quantity"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => {
                  const updatedItems = [...editableInvoice.items];
                  updatedItems[index].unitPrice = e.target.value;
                  setEditableInvoice({ ...editableInvoice, items: updatedItems });
                }}
                className="w-24 p-2 border border-gray-300 rounded-md"
                placeholder="Unit Price"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-gray-700">Payment Terms:</label>
          <input
            type="text"
            value={editableInvoice.paymentTerms}
            onChange={(e) => handleTextChange(e, 'paymentTerms')}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={generatePDF}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
