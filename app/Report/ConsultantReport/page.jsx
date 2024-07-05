'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Mock data for consultants
const getConsultants = () => {
    return [
        { name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { name: 'Logesh', scan: 'CT', scanType: 'Type A', count: 1, price: 1000 },
        { name: 'Logesh', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { name: 'Siva', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { name: 'Asath', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { name: 'Kumaran', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
    ];
};

export default function ExpandableRowGroupDemo() {
    const [consultants, setConsultants] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    useEffect(() => {
        // Fetch consultants data
        const consultantsData = getConsultants();
        // Merge rows with same scan and scanType into a single row
        const mergedConsultants = mergeConsultants(consultantsData);
        setConsultants(mergedConsultants);
    }, []);

    const mergeConsultants = (data) => {
        const mergedData = [];

        // Create a map to track merged entries
        const mergeMap = {};

        // Iterate through each consultant
        data.forEach((consultant) => {
            // Generate a unique key for each name
            const key = consultant.name;

            if (mergeMap[key]) {
                // If entry exists, update scans array
                const existingScan = mergeMap[key].scans.find(s => s.scan === consultant.scan && s.scanType === consultant.scanType);
                if (existingScan) {
                    existingScan.count += consultant.count;
                    existingScan.price += consultant.price;
                } else {
                    mergeMap[key].scans.push({ scan: consultant.scan, scanType: consultant.scanType, count: consultant.count, price: consultant.price });
                }
            } else {
                // If entry does not exist, add to merge map
                mergeMap[key] = { name: consultant.name, scans: [{ scan: consultant.scan, scanType: consultant.scanType, count: consultant.count, price: consultant.price }] };
            }
        });

        // Convert merge map back to array
        Object.values(mergeMap).forEach((entry) => {
            mergedData.push({
                ...entry,
                scans: entry.scans // flatten scans array
            });
        });

        return mergedData;
    };

    const scanBodyTemplate = (rowData) => {
        // Render all scans for the consultant
        return (
            <React.Fragment>
                {rowData.scans && rowData.scans.map((scan, index) => (
                    <div key={index}>{scan.scan}</div>
                ))}
            </React.Fragment>
        );
    };

    const scanTypeBodyTemplate = (rowData) => {
        // Render all scan types for the consultant
        return (
            <React.Fragment>
                {rowData.scans && rowData.scans.map((scan, index) => (
                    <div key={index}>{scan.scanType}</div>
                ))}
            </React.Fragment>
        );
    };

    const statusBodyTemplate = (rowData) => {
        // Render count and price for all scans of the consultant
        return (
            <React.Fragment>
                {rowData.scans && rowData.scans.map((scan, index) => (
                    <div key={index}>{scan.count} - {scan.price}</div>
                ))}
            </React.Fragment>
        );
    };

    const headerTemplate = (data) => {
        return (
            <React.Fragment>
                <span className="ml-2 font-bold text-blue-600">{data.name}</span>
            </React.Fragment>
        );
    };

    const footerTemplate = (data) => {
        return (
            <React.Fragment>
                <td colSpan={5}>
                    <div className="flex justify-content-end font-bold w-full">Total Consultants: {calculateConsultantTotal(data.name)}</div>
                </td>
            </React.Fragment>
        );
    };

    const calculateConsultantTotal = (name) => {
        return consultants.filter((consultant) => consultant.name === name).length;
    };

    return (
        <div className="container mx-auto">
            <div className="overflow-x-auto">
                <DataTable
                    value={consultants}
                    rowGroupMode="subheader"
                    groupRowsBy="name"
                    sortMode="single"
                    sortField="name"
                    sortOrder={1}
                    expandableRowGroups
                    expandedRows={expandedRows}
                    onRowToggle={(e) => setExpandedRows(e.data)}
                    rowGroupHeaderTemplate={headerTemplate}
                    rowGroupFooterTemplate={footerTemplate}
                    className="text-center border border-gray-300"
                >
                    <Column field="scans" header="Scans" body={scanBodyTemplate} style={{ width: '30%' }} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="scans" header="Scan Type" body={scanTypeBodyTemplate} style={{ width: '30%' }} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="scans" header="Count - Price" body={statusBodyTemplate} style={{ width: '40%' }} className="bg-gray-100 border border-gray-300 p-2"></Column>
                </DataTable>
            </div>
        </div>
    );
}
