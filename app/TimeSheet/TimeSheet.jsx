'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useAppSelector } from '@/redux/store';
import { FetchOrderSeachTerm } from '../api/FetchAPI';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const activities = [
    { label: 'Client Discussion', value: 'Client Discussion' },
    { label: 'Vendor Discussion', value: 'Vendor Discussion' },
    { label: 'Quote Preparation', value: 'Quote Preparation' },
    { label: 'Order Preparation', value: 'Order Preparation' },
    { label: 'Design Cooperation', value: 'Design Cooperation' },
    { label: 'Execution', value: 'Execution' },
    { label: 'Invoicing', value: 'Invoicing' },
    { label: 'Discussion with Management', value: 'Discussion with Management' },
];

const TimeSheetModule = () => {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [rows, setRows] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingRows, setEditingRows] = useState({});
    const [orderNumberSuggestions, setOrderNumberSuggestions] = useState([]);
    const [quoteNumberSuggestions, setQuoteNumberSuggestions] = useState([]);
    const [deleteRowIndex, setDeleteRowIndex] = useState(null); // For the row to be deleted
    const [openDialog, setOpenDialog] = useState(false);

    console.log(deleteRowIndex, rows)

    // Format date for DB
    const formatDateForDB = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch time sheet data from the backend
    const fetchTimeSheetData = async () => {
        const workDate = formatDateForDB(selectedDate);
        try {
            const response = await axios.get(`https://orders.baleenmedia.com/API/Media/FetchTimeSheetReport.php/get?JsonWorkDate=${workDate}&JsonDBName=${companyName}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching time sheet data:", error);
            return [];
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchTimeSheetData();
            const formattedData = data.map(item => ({
                ID: item.ID,
                orderNumber: item.OrderNumber,
                quoteNumber: item.QuoteNumber,
                activity: item.Activity,
                duration: item.Duration,
                isNew: false,  // Existing row, not new
                isEdited: false // Not edited yet
            }));
            setRows(formattedData);
        };
        loadData();
    }, [selectedDate]);

    const [typedOrderNumber, setTypedOrderNumber] = useState(''); // Local state for typed order number

    // Handle input changes for order number and fetch suggestions
    const handleOrderNumberChange = async (e, options) => {
      // e.preventDefault(); // Prevent default action
      e.stopPropagation(); 
        const value = e.target.value;
        setTypedOrderNumber(value); // Update the local state for the typed value
         // Update the field with the current input
    
        const searchSuggestions = await FetchOrderSeachTerm(companyName, value);
        setOrderNumberSuggestions(searchSuggestions);

        options.editorCallback(value);
    };
    
    // Function to handle selection of a suggestion
    const handleSuggestionSelect = (suggestion, options) => {
        const splitResult = suggestion.split('-'); // Split by '-'
    
        const orderNumber = splitResult[0].trim();  // First part as order number
        const additionalInfo = splitResult.slice(1).join('-').trim(); // Remaining parts
    
        options.editorCallback(orderNumber); // Set the order number
        setTypedOrderNumber(''); // Clear the typed input after selection
        setOrderNumberSuggestions([]); // Clear suggestions
    };



    // Handle input changes for quote number and fetch suggestions
    const handleQuoteNumberChange = (e, options) => {
        options.editorCallback(e.target.value);
    };

    // Editor for text fields with suggestions
    const textEditorWithSuggestions = (options, type) => {
        return (
            <div className="relative">
                <InputText
                    className="p-2 border border-blue-300"
                    type="text"
                    value={options.value}
                    onChange={(e) => (type === 'order' ? handleOrderNumberChange(e, options) : handleQuoteNumberChange(e, options))}
                />
                {type === 'order' && orderNumberSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto border border-gray-200 bg-white shadow-md">
                    {orderNumberSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionSelect(suggestion, options)} // Select suggestion
                        >
                            {suggestion}
                        </div>
                    ))}
                </div>
            )}
                {type === 'quote' && quoteNumberSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 max-h-40 w-full overflow-auto border border-gray-200 bg-white shadow-md">
                        {quoteNumberSuggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => options.editorCallback(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Handle row edit completion
    const onRowEditComplete = async (e) => {
        const updatedRows = [...rows];
        const { newData, index } = e;
        updatedRows[index] = { ...newData, isEdited: !newData.isNew }; // Mark as edited if not new
        setRows(updatedRows);

        // Determine if the row is new or edited
        if (newData.isNew) {
            // If it's a new row, send a POST request
            try {
                const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertTimeSheet.php/?JsonEntryUser=${loggedInUser}&JsonOrderNumber=${newData.orderNumber}&JsonQuoteNumber=${newData.quoteNumber}&JsonActivity=${newData.activity}&JsonDuration=${newData.duration}&JsonWorkDate=${formatDateForDB(selectedDate)}&JsonDBName=${companyName}`);
                const result = await response.json();
                updatedRows[index].isNew = false; // Mark as saved
                console.log(result);
            } catch (error) {
                console.error("Error saving new row:", error);
            }
        } else {
            // If it's an edited row, send a PUT request
            try {
                const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateTimeSheet.php/?JsonId=${newData.ID}&JsonOrderNumber=${newData.orderNumber}&JsonQuoteNumber=${newData.quoteNumber}&JsonActivity=${newData.activity}&JsonDuration=${newData.duration}&JsonLastModifiedUser=${loggedInUser}&JsonDBName=${companyName}`);
                const result = await response.json();
                console.log(result);
            } catch (error) {
                console.error("Error updating row:", error);
            }
        }

        setEditingRows((prevState) => {
            const updatedEditingRows = { ...prevState };
            delete updatedEditingRows[newData.ID]; // Disable editing for the row
            return updatedEditingRows;
        });
    };

    // Dropdown editor for activity field
    const dropdownEditor = (options) => (
        <Dropdown
            className="border border-blue-300"
            value={options.value}
            options={activities}
            onChange={(e) => options.editorCallback(e.value)}
            placeholder="Select Activity"
            optionLabel="label"
            optionValue="value"
        />
    );

    // Add a new row to the table
    const addNewRow = () => {
        const newRow = {
            ID: `new-${rows.length + 1}`, // Unique ID for the new row
            orderNumber: '',
            quoteNumber: '',
            activity: '',
            duration: '',
            isNew: true,   // Mark as new
            isEdited: false // Not yet edited
        };
    
        const newRows = [newRow, ...rows]; // Add new row to the beginning of the rows array
    
        setRows(newRows);
    
        // Enable editing for the new row right after adding it
        setEditingRows((prevState) => ({
            ...prevState,
            [newRow.ID]: true, // Mark the new row as editable by its ID
        }));
    };

    const handleDeleteRow = async () => {
        const rowToDelete = rows[deleteRowIndex];
        const { ID } = rowToDelete; // Extract the ID of the row to delete
        console.log(ID , rowToDelete)

        try {
            // Send DELETE request to the API to remove the row by ID
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/DeleteATimeSheetRecord.php/?JsonLastModifiedUser=${loggedInUser}&JsonId=${ID}&JsonDBName=${companyName}`);

            const result = await response.json();

            if (result === "Row deleted successfully.") {
                // Remove row from the frontend after successful deletion
                fetchTimeSheetData();
                setOpenDialog(false); // Close the dialog after deletion
            } else {
                console.error("Failed to delete row from database:", result);
            }
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    };

    const openDeleteConfirmation = (index) => {
        setDeleteRowIndex(index);
        setOpenDialog(true); // Open confirmation dialog
    };

    const closeDialog = () => {
        setOpenDialog(false);
    };

    const deleteBodyTemplate = (rowData, options) => {
        return (
            <Button
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={() => openDeleteConfirmation(options.rowIndex)}
            />
            
        );
    };
    

    return (
        <div className="relative min-h-screen mb-20 px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
            <div className="absolute inset-0 bg-blue-600 h-96"></div>
            <div className="relative z-10">
                <div className="absolute text-2xl font-bold text-white">
                    Time Sheet Report
                </div>
                <div className="flex justify-end items-center space-x-4">
                    <Calendar
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.value)}
                        className="w-fit text-sm sm:text-base md:text-sm lg:text-base mt-12 sm:mt-0"
                        inputClassName="w-fit border border-sky-300 rounded-lg pl-2 py-1 bg-white text-gray-900"
                        dateFormat='dd-M-yy'
                    />
                    <Button label="Add Row" icon="pi pi-plus" className=" mt-12 sm:mt-0 bg-blue-500 h-fit text-white py-1.5 px-3 rounded shadow hover:bg-blue-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base" onClick={addNewRow} />
                </div>
                <DataTable
                    value={rows}
                    editMode="row"
                    dataKey="ID"
                    onRowEditComplete={onRowEditComplete}
                    onRowEditInit={(e) => setEditingRows({ ...editingRows, [e.index]: true })}
                    onRowEditCancel={(e) => {
                        const updatedEditingRows = { ...editingRows };
                        delete updatedEditingRows[e.index];
                        setEditingRows(updatedEditingRows);
                    }}
                    editingRows={editingRows}
                    className="mt-2 h-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-300"
                    tableClassName="min-w-full min-h-full text-sm text-left text-black"
                    rowClassName="hover:bg-gray-50"
                >
                    <Column
                        field="orderNumber"
                        header="Order Number"
                        editor={(options) => textEditorWithSuggestions(options, 'order')}
                        className="p-4 border-b border-gray-200"
                        style={{ width: '200px', height: '50px' }}
                    />
                    <Column
                        field="quoteNumber"
                        header="Quote Number"
                        editor={(options) => textEditorWithSuggestions(options, 'quote')}
                        className="p-4 border-b border-gray-200"
                        style={{ width: '200px', height: '50px' }}
                    />
                    <Column
                        field="activity"
                        header="Activity"
                        editor={dropdownEditor}
                        className="p-4 border-b border-gray-200"
                        style={{ width: '200px', height: '50px' }}
                    />
                    <Column
                        field="duration"
                        header="Duration (hours)"
                        editor={(options) => (
                            <InputText
                                className="p-2 border border-blue-300"
                                value={options.value}
                                onChange={(e) => options.editorCallback(e.target.value)}
                            />
                        )}
                        className="p-4 border-b border-gray-200"
                        style={{ width: '200px', height: '50px' }}
                    />
                    <Column
                        rowEditor
                        headerStyle={{ width: '10px', textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                     <Column
                        body={deleteBodyTemplate}
                        headerStyle={{ width: '120px', textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                </DataTable>
            </div>
            {/* Delete Confirmation Dialog */}
            <Dialog open={openDialog} onClose={closeDialog}>
    <DialogTitle className="text-lg font-semibold">Confirm Delete</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Are you sure you want to delete this row? This action cannot be undone.
        </DialogContentText>
    </DialogContent>
    <DialogActions className="flex justify-end space-x-2 p-4">
        {/* Cancel Button */}
        <Button
            onClick={closeDialog}
            className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md px-4 py-2"
        >
            Cancel
        </Button>

        {/* Delete Button */}
        <Button
            onClick={handleDeleteRow}
            className="bg-red-600 text-white hover:bg-red-700 rounded-md px-4 py-2"
        >
            Delete
        </Button>
    </DialogActions>
</Dialog>

        </div>
    );
};

export default TimeSheetModule;
