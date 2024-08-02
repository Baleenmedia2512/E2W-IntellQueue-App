'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import * as XLSX from 'xlsx';
const { saveAs } = require('file-saver');
import './consultantStyles.css';

// Mock data for consultants
const getConsultants = () => {
    return [
        { id: 1, name: 'Dr. Ravi Kumar', scan: 'CT', scanType: 'Head', count: 2, price: 1500 },
        { id: 2, name: 'Dr. Ravi Kumar', scan: 'CT', scanType: 'Chest', count: 1, price: 2000 },
        { id: 3, name: 'Dr. Sundar Raj', scan: 'USG', scanType: 'Abdomen', count: 1, price: 1200 },
        { id: 4, name: 'Dr. Sundar Raj', scan: 'USG', scanType: 'Pelvis', count: 1, price: 1300 },
        { id: 5, name: 'Dr. Arunachalam R', scan: 'MRI', scanType: 'Spine', count: 1, price: 2500 },
        { id: 6, name: 'Dr. Kumaravel S', scan: 'X-Ray', scanType: 'Chest', count: 3, price: 500 },
        { id: 7, name: 'Dr. Vijayalakshmi P', scan: 'CT', scanType: 'Abdomen', count: 2, price: 1800 },
        { id: 8, name: 'Dr. Nandakumar R', scan: 'USG', scanType: 'Thyroid', count: 1, price: 1100 },
        { id: 9, name: 'Dr. Lakshmi Narayanan', scan: 'MRI', scanType: 'Brain', count: 1, price: 2700 },
        { id: 10, name: 'Dr. Ramesh Babu', scan: 'X-Ray', scanType: 'Limb', count: 2, price: 400 },
        { id: 11, name: 'Dr. Arul Selvan', scan: 'CT', scanType: 'Pelvis', count: 2, price: 1600 },
        { id: 12, name: 'Dr. Mani Shankar', scan: 'USG', scanType: 'Kidney', count: 1, price: 1250 },
        { id: 13, name: 'Dr. Divya Rani', scan: 'CT', scanType: 'Chest', count: 2, price: 2200 },
        { id: 14, name: 'Dr. Ganesh Kannan', scan: 'MRI', scanType: 'Shoulder', count: 1, price: 2400 },
        { id: 15, name: 'Dr. Kalpana Devi', scan: 'USG', scanType: 'Pelvis', count: 1, price: 1350 },
        { id: 16, name: 'Dr. Ravi Shankar', scan: 'X-Ray', scanType: 'Spine', count: 2, price: 450 },
        { id: 17, name: 'Dr. Siva Prasad', scan: 'MRI', scanType: 'Knee', count: 1, price: 2600 },
        { id: 18, name: 'Dr. Gopalakrishnan', scan: 'CT', scanType: 'Head', count: 2, price: 1500 },
        { id: 19, name: 'Dr. Janani R', scan: 'USG', scanType: 'Abdomen', count: 1, price: 1150 },
        { id: 20, name: 'Dr. Lakshmi Priya', scan: 'MRI', scanType: 'Pelvis', count: 1, price: 2300 },
        { id: 21, name: 'Dr. Ravi Kumar', scan: 'USG', scanType: 'Brain', count: 1, price: 2000 },
        { id: 22, name: 'Dr. Ravi Kumar', scan: 'X-Ray', scanType: 'Hand', count: 1, price: 2000 },
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
                        // scanType: scanType.scanType,
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
                scan: 'Total',
                // scanType: '',
                count: '',
                price: '',
                total: `₹${Math.round(group.total)}`, // Total amount without decimal points
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
                min="0"
                className="p-inputtext p-component w-32 md:w-fit lg:w-fit h-full m-0 p-2 box-border border border-sky-400 bg-white"
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
            return <span className="font-bold ml-2">{rowData.name}</span>;
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
        return `${baseClass} border-b border-gray-200`; // Add bottom border class here
    };

   // Determine the rows to calculate based on selection
const rowsToCalculate = selectedRows.length > 0 ? selectedRows : groupedData;

// Filter rows where total starts with "Total:"
const filteredRows = rowsToCalculate.filter(row => typeof row.total === 'string' && row.total.startsWith('Total:'));

// Filter out rows with null or empty values for name and scan
const filteredNameRows = rowsToCalculate.filter(row => row.name);
const filteredScanRows = rowsToCalculate.filter(row => row.scan);

// Calculate total amount
const totalAmount = filteredRows.reduce((sum, row) => {
    return sum + parseFloat(row.total.split('₹')[1]);
}, 0);

// Calculate number of unique consultants
const numberOfConsultants = new Set(filteredNameRows.map(row => row.name)).size;

// Calculate number of scans
const numberOfScans = filteredScanRows.length;

    const handleExport = () => {
        // Check if there are any selected rows
        const rowsToExport = selectedRows.length > 0 ? selectedRows : groupedData;
    
        // Convert the rows to a format suitable for exporting
        const ws = XLSX.utils.json_to_sheet(rowsToExport.map(row => ({
            Consultant: row.name || '',
            Scan: row.scan || '',
            // 'Scan Type': row.scanType || '',
            Count: row.count || '',
            Price: row.price || '',
            Total: row.total || ''
        })));
    
        // Create a new workbook and append the sheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consultants');
    
        // Write the workbook to a file and trigger download
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'ConsultantsReport.xlsx');
    };
    

const handleSelectionChange = (e) => {
    const selectedRows = e.value; // Get the array of selected rows
    const selectedNames = new Set(selectedRows.map(row => row.name)); // Collect unique names from selected rows

    const newSelection = [];
    groupedData.forEach(row => {
        if (row.id.startsWith(`${Array.from(selectedNames).find(name => row.id.startsWith(`${name}-`))}-`)) {
            newSelection.push(row);
        }
    });

    setSelectedRows(newSelection);
};


    return (
        <div className="relative min-h-screen mb-20">
            {/* Background colors */}
            <div className="absolute inset-0 bg-blue-600 h-1/3"></div>
            <div className="absolute inset-x-0 bottom-0 bg-white h-2/3 "></div>

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
                <div className="mt-8 p-4">
                <div className="flex justify-end mb-4 gap-2 flex-wrap">
    <button
        onClick={handleExport}
        className="bg-green-500 text-white py-1.5 px-3 rounded shadow hover:bg-green-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
    >
        <i className="pi pi-file-excel mr-1 sm:mr-2"></i>
        Export to Excel
    </button>
    <button
        // onClick={handleProcessIncentive}
        className="bg-blue-500 text-white py-1.5 px-3 rounded shadow hover:bg-blue-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
    >
        <i className="pi pi-check mr-1 sm:mr-2"></i>
        Process Incentive
    </button>
</div>


    <div className="overflow-x-auto border rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                        <DataTable
                            value={groupedData}
                            rowClassName={customRowClassName}
                            selection={selectedRows}
                            onSelectionChange={handleSelectionChange}
                            className="text-left"
                            dataKey="id"
                            selectionMode="multiple"
                            metaKeySelection={false}
                            paginator
                            rows={20}
                        >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} headerClassName="bg-gray-100"></Column>
                            <Column field="name" header="Consultant" body={nameBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-3 pr-2" className="bg-white p-2 w-fit text-nowrap"></Column>
                            <Column field="scan" header="Scan" body={scanBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-50 text-nowrap"></Column>
                            {/* <Column field="scanType" header="Scan Type" body={scanTypeBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2 text-nowrap" className="bg-white p-2 w-fit text-nowrap"></Column> */}
                            <Column field="count" header="Count" body={countBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-fit p-2"></Column>
                            <Column field="price" header="Price" body={priceBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-full sm:w-1/2 md:w-1/4 lg:w-1/6 p-2 text-nowrap"></Column>
                            <Column field="total" header="Total" body={totalBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"></Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
}
