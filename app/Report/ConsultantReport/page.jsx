'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './ConsultantStyles.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Mock data for consultants
const getConsultants = () => {
    return [
        { id: 1, name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { id: 2, name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { id: 3, name: 'Logesh', scan: 'CT', scanType: 'Type A', count: 1, price: 1000 },
        { id: 4, name: 'Logesh', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { id: 5, name: 'Siva', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { id: 6, name: 'Asath', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { id: 7, name: 'Kumaran', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
    ];
};

export default function GroupedRowsDemo() {
    const [consultants, setConsultants] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        const consultantsData = getConsultants();
        const groupedConsultants = groupConsultants(consultantsData);
        setConsultants(groupedConsultants);
    }, []);

    const groupConsultants = (data) => {
        const groupedData = [];

        data.forEach((consultant) => {
            let existingName = groupedData.find(group => group.name === consultant.name);

            if (!existingName) {
                existingName = { name: consultant.name, scans: [], total: 0 }; // Initialize total
                groupedData.push(existingName);
            }

            let existingScan = existingName.scans.find(scan => scan.scan === consultant.scan);

            if (!existingScan) {
                existingScan = { scan: consultant.scan, scanTypes: [] };
                existingName.scans.push(existingScan);
            }

            let existingScanType = existingScan.scanTypes.find(scanType => scanType.scanType === consultant.scanType);

            if (!existingScanType) {
                existingScanType = { scanType: consultant.scanType, count: 0, price: consultant.price };
                existingScan.scanTypes.push(existingScanType);
            }

            existingScanType.count += consultant.count;
            existingName.total += consultant.count * consultant.price; // Update total for the consultant
        });

        return groupedData;
    };

    const renderGroupedData = (groupedData) => {
        const rows = [];

        groupedData.forEach(group => {
            group.scans.forEach((scan, scanIndex) => {
                scan.scanTypes.forEach((scanType, scanTypeIndex) => {
                    rows.push({
                        id: `${group.name}-${scan.scan}-${scanType.scanType}`, // Add a unique identifier
                        name: scanIndex === 0 && scanTypeIndex === 0 ? group.name : null,
                        scan: scanTypeIndex === 0 ? scan.scan : null,
                        scanType: scanType.scanType,
                        count: scanType.count,
                        price: scanType.price,
                        total: scanType.count * scanType.price, // Total for each row
                        isGroup: scanIndex === 0 && scanTypeIndex === 0,
                        isScanGroup: scanTypeIndex === 0
                    });
                });
            });

            // Add a row for the total of each consultant
            rows.push({
                id: `${group.name}-total`, // Unique identifier for total row
                name: '',
                scan: '',
                scanType: '',
                count: '',
                price: '',
                total: `Total: ₹${Math.round(group.total)}`, // Total amount without decimal points
                isGroup: true, // Mark as a group total row
                isScanGroup: false
            });
        });

        return rows;
    };

    const groupedData = renderGroupedData(consultants);

    const handlePriceChange = (id, newPrice) => {
        setConsultants(prevConsultants => {
            const updatedConsultants = [...prevConsultants];
            
            // Find the row by id and update price
            updatedConsultants.forEach(group => {
                group.scans.forEach(scan => {
                    scan.scanTypes.forEach(scanType => {
                        if (`${group.name}-${scan.scan}-${scanType.scanType}` === id) {
                            scanType.price = newPrice;
                            scanType.total = scanType.count * newPrice;
                            group.total = group.scans.reduce((sum, scan) => 
                                sum + scan.scanTypes.reduce((innerSum, scanType) => 
                                    innerSum + (scanType.count * scanType.price), 0), 0);
                        }
                    });
                });
            });

            return updatedConsultants;
        });
    };

    const priceBodyTemplate = (rowData) => {

        if (typeof rowData.total === 'string' && rowData.total.startsWith('Total:')) {
            return null; // Do not render the input for total rows
        } else {

        const handleChange = (e) => {
            const newPrice = parseFloat(e.target.value) || 0;
            handlePriceChange(rowData.id, newPrice);
        };

        return (
            <input
                type="number"
                value={rowData.price}
                onChange={handleChange}
                className="p-inputtext p-component w-32 h-full m-0 p-2 box-border bg-white"
            />
        );
    }
    };

    const totalBodyTemplate = (rowData) => {
        // Check if it's a total row and format accordingly
        if (typeof rowData.total === 'string' && rowData.total.startsWith('Total:')) {
            return <span className="font-bold">{rowData.total}</span>;
        }
        return <span>{rowData.total}</span>; // Ensure this displays properly if it's a number
    };

    const nameBodyTemplate = (rowData) => {
        if (rowData.name) {
            return <span className="font-bold">{rowData.name}</span>;
        }
        return null;
    };

    const scanBodyTemplate = (rowData) => {
        if (rowData.scan) {
            return <span className="font-bold">{rowData.scan}</span>;
        }
        return null;
    };

    const scanTypeBodyTemplate = (rowData) => {
        return rowData.scanType;
    };

    const countBodyTemplate = (rowData) => {
        return rowData.count;
    };

    const customRowClassName = (rowData) => {   
        const baseClass = rowData.isGroup ? 'bg-white' : rowData.isScanGroup ? 'bg-white' : '';
        return `${baseClass} border-b border-sky-100`; // Add bottom border class here
    };

    // Calculate totals and counts for the information section
    const totalAmount = groupedData.reduce((sum, row) => {
        if (typeof row.total === 'string' && row.total.startsWith('Total:')) {
            return sum + parseFloat(row.total.split('₹')[1]);
        }
        return sum;
    }, 0);
    const numberOfConsultants = [...new Set(groupedData.map(row => row.name))].length;
    const numberOfScans = groupedData.length;

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(groupedData.map(row => ({
            Consultant: row.name || '',
            Scan: row.scan || '',
            'Scan Type': row.scanType || '',
            Count: row.count || '',
            Price: row.price || '',
            Total: row.total || ''
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consultants');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'ConsultantsReport.xlsx');
    };

    return (
        <div className="relative min-h-screen mb-20">
            {/* Background colors */}
            <div className="absolute inset-0 bg-blue-600 h-1/2"></div>
            <div className="absolute inset-x-0 bottom-0 bg-white h-1/2 "></div>

            {/* Main content */}
            <div className="relative z-10 pt-8 px-4 sm:px-8 lg:px-12">
                {/* Page title */}
                <div className="absolute top-6 left-7 sm:left-12 lg:left-16 text-2xl font-bold text-white">
                    Consultant Report
                </div>

                {/* Information section */}
                <div className="relative top-12 mx-5 mb-8 flex overflow-x-auto gap-4">
                    <div className="w-fit h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
                          ₹{totalAmount}
                        </div>
                        <div className="text-sm sm:text-base lg:text-lg text-gray-200">
                          Total Amount
                        </div>
                    </div>
                    <div className="w-fit h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
                          {numberOfConsultants}
                        </div>
                        <div className="text-sm sm:text-base lg:text-lg text-blue-100">
                          No. of Consultants
                        </div>
                    </div>
                    <div className="w-fit h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold">
                          {numberOfScans}
                        </div>
                        <div className="text-sm sm:text-base lg:text-lg text-gray-200">
                          No. of Scans
                        </div>
                    </div>
                </div>

                {/* Content container */}
                <div className="mt-20 p-4">
                <div className="flex justify-between items-center mb-4">
        <div></div> {/* Placeholder div to push the button to the right */}
        <button
                            onClick={handleExport}
                            className="bg-green-500 text-white py-2 px-4 rounded shadow hover:bg-green-600 flex items-center"
                        >
                            <i className="pi pi-file-excel mr-2"></i>
                            Export to Excel
                        </button>
    </div>
                    <div className="overflow-x-auto border border-sky-100 rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                        <DataTable
                            value={groupedData}
                            rowClassName={customRowClassName}
                            selection={selectedRows}
                            onSelectionChange={(e) => setSelectedRows(e.value)}
                            className="text-left"
                        >
                            <Column field="name" header="Consultant" body={nameBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"></Column>
                            <Column field="scan" header="Scan" body={scanBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-50 text-nowrap"></Column>
                            <Column field="scanType" header="Scan Type" body={scanTypeBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"></Column>
                            <Column field="count" header="Count" body={countBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-fit p-2"></Column>
                            <Column field="price" header="Price" body={priceBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-fit p-2 text-nowrap"></Column>
                            <Column field="total" header="Total" body={totalBodyTemplate} headerClassName="bg-gray-200 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
}
