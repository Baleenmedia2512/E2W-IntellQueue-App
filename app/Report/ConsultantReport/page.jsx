'use client';
import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';

const ConsultantsReport = () => {
  const [consultantsData, setConsultantsData] = useState([
    { id: 1, name: 'John Doe', category: 'Category A', experience: 5 },
    { id: 2, name: 'Jane Smith', category: 'Category B', experience: 8 },
    // Add more consultant data as needed
  ]);

  const renderEditableRow = (rowData) => {
    return (
      <InputText
        type="text"
        value={rowData.name}
        onChange={(e) => onNameChange(e, rowData)}
        className="p-inputtext-sm border rounded-md p-1"
      />
    );
  };

  const onNameChange = (e, rowData) => {
    const updatedData = consultantsData.map((item) =>
      item.id === rowData.id ? { ...item, name: e.target.value } : item
    );
    setConsultantsData(updatedData);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <DataTable value={consultantsData} rowGroupMode="subheader" groupField="category"
                   className="w-full">
          <Column field="name" header="Name" body={renderEditableRow} />
          <Column field="experience" header="Experience" />
          <Column field="category" header="Category" />
        </DataTable>
      </div>
    </div>
  );
};

export default ConsultantsReport;
