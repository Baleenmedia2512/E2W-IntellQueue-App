'use client';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Mock data for consultants
const getConsultants = () => {
    return [
        { id: 1, name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { id: 2, name: 'Logesh', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        // Add id property for each object
        { id: 3, name: 'Logesh', scan: 'CT', scanType: 'Type A', count: 1, price: 1000 },
        { id: 4, name: 'Logesh', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { id: 5, name: 'Siva', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
        { id: 6, name: 'Asath', scan: 'USG', scanType: 'Type A', count: 1, price: 1000 },
        { id: 7, name: 'Kumaran', scan: 'CT', scanType: 'Type B', count: 1, price: 1000 },
    ];
};

export default function GroupedRowsDemo() {
    const [consultants, setConsultants] = useState([]);

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
                existingName = { name: consultant.name, scans: [] };
                groupedData.push(existingName);
            }

            let existingScan = existingName.scans.find(scan => scan.scan === consultant.scan);

            if (!existingScan) {
                existingScan = { scan: consultant.scan, scanTypes: [] };
                existingName.scans.push(existingScan);
            }

            let existingScanType = existingScan.scanTypes.find(scanType => scanType.scanType === consultant.scanType);

            if (!existingScanType) {
                existingScanType = { scanType: consultant.scanType, count: 0, price: 0 };
                existingScan.scanTypes.push(existingScanType);
            }

            existingScanType.count += consultant.count;
            existingScanType.price += consultant.price;
        });

        return groupedData;
    };

    const renderGroupedData = (groupedData) => {
        const rows = [];

        groupedData.forEach(group => {
            rows.push({ ...group, isGroup: true });

            group.scans.forEach(scan => {
                scan.scanTypes.forEach(scanType => {
                    rows.push({
                        name: group.name,
                        scan: scan.scan,
                        scanType: scanType.scanType,
                        count: scanType.count,
                        price: scanType.price,
                        isGroup: false
                    });
                });
            });
        });

        return rows;
    };

    const groupedData = renderGroupedData(consultants);

    const nameBodyTemplate = (rowData) => {
        if (rowData.isGroup) {
            return <span className="font-bold">{rowData.name}</span>;
        }
        return null;
    };

    const scanBodyTemplate = (rowData) => {
        if (!rowData.isGroup) {
            return rowData.scan;
        }
        return null;
    };

    const scanTypeBodyTemplate = (rowData) => {
        if (!rowData.isGroup) {
            return rowData.scanType;
        }
        return null;
    };

    const countBodyTemplate = (rowData) => {
        if (!rowData.isGroup) {
            return rowData.count;
        }
        return null;
    };

    const priceBodyTemplate = (rowData) => {
        if (!rowData.isGroup) {
            return (
                <input
                    type="number"
                    value={rowData.price}
                    onChange={(e) => {
                        const updatedData = [...groupedData];
                        updatedData[rowData.tableData.id].price = parseInt(e.target.value, 10) || 0;
                        setConsultants(updatedData);
                    }}
                    className="p-inputtext p-component"
                />
            );
        }
        return null;
    };

    const rowClassName = (rowData) => {
        return rowData.isGroup ? 'bg-gray-200' : '';
    };

    return (
        <div className="container mx-auto">
            <div className="overflow-x-auto">
                <DataTable value={groupedData} rowClassName={rowClassName} className="text-center border border-gray-300">
                    <Column field="name" header="Consultant" body={nameBodyTemplate} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="scan" header="Scan" body={scanBodyTemplate} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="scanType" header="Scan Type" body={scanTypeBodyTemplate} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="count" header="Count" body={countBodyTemplate} className="bg-gray-100 border border-gray-300 p-2"></Column>
                    <Column field="price" header="Price" body={priceBodyTemplate} className="bg-gray-100 border border-gray-300 p-2"></Column>
                </DataTable>
            </div>
        </div>
    );
}
