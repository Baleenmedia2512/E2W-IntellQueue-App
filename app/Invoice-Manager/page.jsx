'use client';
import { useState } from 'react';
import { Tooltip } from '@mui/material';  // Import Tooltip component for tooltips
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon component
import { faEye, faDownload } from '@fortawesome/free-solid-svg-icons';
import { DateRangePicker } from '@nextui-org/react';
import { motion } from "framer-motion";

const InvoiceModule = () => {
  const demoOrders = [
    {
      id: 1,
      clientName: 'John Doe',
      totalAmount: '₹5000',
      invoiceNumber: 'INV001',
      status: 'Pending',
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      totalAmount: '₹7500',
      invoiceNumber: 'INV002',
      status: 'Paid',
    },
    {
      id: 3,
      clientName: 'Emily Adams',
      totalAmount: '₹3000',
      invoiceNumber: 'INV003',
      status: 'Pending',
    },
    // Add more sample data as needed
  ];

  const [editableInvoice, setEditableInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedColumn, setSortedColumn] = useState('invoiceNumber');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [statusFilter, setStatusFilter] = useState('All'); 

  const handleDateChange = (range) => {
    setDateRange(range);
    
  };
  console.log('Selected Date Range:', dateRange);
  const handlePreview = (order) => {
    setEditableInvoice(order);
  };

  const handleDownload = (order) => {
    alert(`Downloading PDF for Invoice: ${order.invoiceNumber}`);
  };

// Filter function based on search term and status
const filteredOrders = demoOrders.filter((order) => {
  const searchLower = searchTerm.toLowerCase();
  const isStatusMatch = statusFilter === 'All' || order.status === statusFilter;
  return (
    (order.invoiceNumber.toLowerCase().includes(searchLower) ||
      order.clientName.toLowerCase().includes(searchLower) ||
      order.totalAmount.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)) &&
    isStatusMatch
  );
});

  // Sorting function
  const handleSort = (column) => {
    const direction = sortedColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortedColumn(column);
    setSortDirection(direction);

    filteredOrders.sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filtered and sorted orders
  const sortedOrders = filteredOrders.sort((a, b) => {
    if (a[sortedColumn] < b[sortedColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortedColumn] > b[sortedColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Create a mapping for button positions to animate the slider
  const buttonPositions = {
    All: 0,
    Paid: 1,
    Pending: 2
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-600">Invoice Manager</h2>
            <div className="h-1 w-20 bg-blue-600 mt-1"></div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search for an invoice..."
            className="w-full px-4 py-2 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-2.5 right-4 h-6 w-6 text-blue-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        


        {/* Table Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
{/* Status Filter Section */}
<div className="flex gap-1 mb-6 bg-gray-200 w-fit rounded-lg p-1 overflow-hidden">
  <motion.button
    onClick={() => setStatusFilter('All')}
    className={`px-4 py-2 rounded-lg ${statusFilter === 'All' ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
  >
    All
  </motion.button>
  <motion.button
    onClick={() => setStatusFilter('Paid')}
    className={`px-4 py-2 rounded-lg ${statusFilter === 'Paid' ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    Paid
  </motion.button>
  <motion.button
    onClick={() => setStatusFilter('Pending')}
    className={`px-4 py-2 rounded-lg ${statusFilter === 'Pending' ? 'bg-white text-gray-700' : 'bg-gray-200 text-gray-700'} hover:bg-gray-300`}
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    Pending
  </motion.button>
</div>


        <div className="border rounded-xl">
        <div className="flex justify-between items-center p-3">
            <h3 className="text-xl font-semibold text-gray-700">Recent Invoices</h3>
            {/* Date Picker */}
            <div>
              <DateRangePicker
              value={dateRange}
              onChange={handleDateChange}
              format="DD-MMM-YYYY"
              placeholder="Select Date Range"
              className="rounded-lg text-gray-600"
            />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-600 rounded-xl">
                  <th
                    className="px-4 py-3 cursor-pointer"
                    style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    Invoice #
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`inline h-4 w-4 ml-2 ${sortedColumn === 'invoiceNumber' ? sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 rotate-180' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th
                    className="px-4 py-3 border cursor-pointer"
                    style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                    onClick={() => handleSort('clientName')}
                  >
                    Client Name
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`inline h-4 w-4 ml-2 ${sortedColumn === 'clientName' ? sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 rotate-180' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th
                    className="px-4 py-3 border cursor-pointer"
                    style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                    onClick={() => handleSort('totalAmount')}
                  >
                    Amount
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`inline h-4 w-4 ml-2 ${sortedColumn === 'totalAmount' ? sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 rotate-180' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th
                    className="px-4 py-3 border cursor-pointer"
                    style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`inline h-4 w-4 ml-2 ${sortedColumn === 'status' ? sortDirection === 'asc' ? 'text-blue-500' : 'text-blue-500 rotate-180' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </th>
                  <th className="px-4 py-3 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100 transition">
                    <td className="px-4 py-3 border-y-1">{order.invoiceNumber}</td>
                    <td className="px-4 py-3 border-y-1">{order.clientName}</td>
                    <td className="px-4 py-3 border-y-1">{order.totalAmount}</td>
                    <td className="px-4 py-3 border-y-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-y-1 flex justify-start gap-4">
                    <Tooltip title="Preview Invoice">
                        <button
                          className="text-blue-500 hover:text-blue-700 h-full"
                          onClick={() => handlePreview(order)}
                        >
                          <FontAwesomeIcon icon={faEye} size="lg" />
                        </button>
                      </Tooltip>
                      <Tooltip title="Download Invoice">
                        <button
                          className="text-blue-500 hover:text-blue-700 h-full"
                          onClick={() => handleDownload(order)}
                        >
                          <FontAwesomeIcon icon={faDownload} size="lg" />
                        </button>
                      </Tooltip>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModule;



{/* <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600">
              Add Invoice
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600">
              Update Invoice
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600">
              Remove Invoice
            </button>
          </div> */}