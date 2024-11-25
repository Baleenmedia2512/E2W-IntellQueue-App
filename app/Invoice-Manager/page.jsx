'use client'
import { useState } from 'react';
import InvoicePreview from './InvoicePreview';

const demoOrders = [
  {
    id: 1,
    clientName: 'John Doe',
    totalAmount: '₹5000',
    invoiceNumber: 'INV001',
    items: [
      { description: 'Consultation', quantity: 1, unitPrice: '₹2000' },
      { description: 'Development', quantity: 3, unitPrice: '₹1000' },
    ],
    paymentTerms: 'Net 30 days',
  },
  {
    id: 2,
    clientName: 'Jane Smith',
    totalAmount: '₹7500',
    invoiceNumber: 'INV002',
    items: [
      { description: 'Design', quantity: 2, unitPrice: '₹1500' },
      { description: 'Implementation', quantity: 2, unitPrice: '₹2000' },
    ],
    paymentTerms: 'Net 45 days',
  },
];

const InvoiceModule = () => {
  const [editableInvoice, setEditableInvoice] = useState(null);

  const handlePreview = (order) => {
    setEditableInvoice(order);
  };

  const handleDownload = (order) => {
    // Implement PDF generation logic here
    alert(`Downloading PDF for Invoice: ${order.invoiceNumber}`);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Invoice Orders</h1>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Order ID</th>
            <th className="px-4 py-2 text-left">Client</th>
            <th className="px-4 py-2 text-left">Total Amount</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {demoOrders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="px-4 py-2">{order.id}</td>
              <td className="px-4 py-2">{order.clientName}</td>
              <td className="px-4 py-2">{order.totalAmount}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={() => handlePreview(order)}
                >
                  Preview
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md ml-2"
                  onClick={() => handleDownload(order)}
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editableInvoice && <InvoicePreview invoice={editableInvoice} />}
    </div>
  );
};

export default InvoiceModule;
