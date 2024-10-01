'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  DataGrid,
  GridRowModes,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { Calendar } from 'primereact/calendar';
import { useAppSelector } from '@/redux/store';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';


const initialRows = [
    // Initial rows can be loaded from your API or kept empty for now
];

function EditToolbar(props) {
  const { setRows, setRowModesModel, rows } = props;

  const handleClick = () => {
      const maxId = rows.length > 0 ? Math.max(...rows.map(row => row.id)) : 0; // Get the maximum ID
      const newId = maxId + 1; // Increment it by 1
      setRows((oldRows) => [
        { id: newId, orderNumber: '', quoteNumber: '', activity: '', duration: '', isNew: true },
        ...oldRows,
          
      ]);
      setRowModesModel((oldModel) => ({
        [newId]: { mode: GridRowModes.Edit, fieldToFocus: 'orderNumber' },
        ...oldModel,
          
      }));
  };

  return (
      <GridToolbarContainer>
          <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
              Add Row
          </Button>
      </GridToolbarContainer>
  );
}


export default function TimeSheetModule() {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [rows, setRows] = useState(initialRows);
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [toast, setToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentRowId, setCurrentRowId] = useState(null);

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

    console.log(rows)

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchTimeSheetData();
            const formattedData = data.map(item => ({
                id: item.ID, // Ensure each row has a unique ID
                orderNumber: item.OrderNumber,
                quoteNumber: item.QuoteNumber,
                activity: item.Activity,
                duration: item.Duration,
            }));
            setRows(formattedData);
        };
        loadData();
    }, [selectedDate]);

    const handleRowEditStop = (params, event) => {
      console.log(params, event)
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
      console.log(id)
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
      console.log(id)
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => () => {
      setCurrentRowId(id); // Set the ID of the row to delete
      setDialogOpen(true); // Open the dialog
  };

  const handleConfirmDelete = async () => {
    try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/DeleteATimeSheetRecord.php/?JsonLastModifiedUser=${loggedInUser}&JsonId=${currentRowId}&JsonDBName=${companyName}`);
        const data = await response.json();

        if (data.success) {
            setRows(rows.filter((row) => row.id !== currentRowId));
            setSuccessMessage('Record deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);
        } else {
            setToastMessage(`Error: ${data.error || 'Unknown error occurred'}`);
            setSeverity('error');
            setToast(true);
            setTimeout(() => setToast(false), 3000);
        }
    } catch (error) {
        console.error("Error deleting the row:", error);
    } finally {
        setDialogOpen(false); // Close the dialog after the operation
    }
};

const handleCloseDialog = () => {
    setDialogOpen(false);
};


    const handleCancelClick = (id) => () => {
      console.log(id)
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };
    console.log()

    const processRowUpdate = async (newRow) => {
      const isNewRow = newRow.isNew; // Check if the row is new
      const workDate = formatDateForDB(selectedDate);
  
      try {
          let response;
  
          if (isNewRow) {
              // For new row
              response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertTimeSheet.php/?JsonEntryUser=${loggedInUser}&JsonOrderNumber=${newRow.orderNumber}&JsonQuoteNumber=${newRow.quoteNumber}&JsonActivity=${newRow.activity}&JsonDuration=${newRow.duration}&JsonWorkDate=${workDate}&JsonDBName=${companyName}`);
              const data = await response.json();
              if (data.success) {
                setSuccessMessage('Record Added successfully!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
              } else {
                setToastMessage(`The following error occurred while adding data: ${data}`);
                setSeverity('error');
                setToast(true);
                setTimeout(() => {
                  setToast(false);
                }, 3000);
              }
              console.log(data)
          } else {
              // For existing row
              response = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateTimeSheet.php/?JsonId=${newRow.id}&JsonOrderNumber=${newRow.orderNumber}&JsonQuoteNumber=${newRow.quoteNumber}&JsonActivity=${newRow.activity}&JsonDuration=${newRow.duration}&JsonLastModifiedUser=${loggedInUser}&JsonDBName=${companyName}`);
              const data = await response.json();
              if (data.success) {
                setSuccessMessage('Record Updated successfully!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
              } else {
                setToastMessage(`The following error occurred while updating data: ${data}`);
                setSeverity('error');
                setToast(true);
                setTimeout(() => {
                  setToast(false);
                }, 2000);
              }
              console.log(data)
          }
  
          if (!response.ok) {
              throw new Error('Failed to save the data');
          }
  
          const updatedRow = { ...newRow, isNew: false }; // Update the row to mark it as not new
          setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
          return updatedRow;
  
      } catch (error) {
          console.error("Error saving the row:", error);
          // Handle any UI indication for error (e.g., show a message)
      }
  };
  
console.log(successMessage)
    const handleRowModesModelChange = (newRowModesModel) => {
      console.log(newRowModesModel)
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        { field: 'orderNumber', headerName: 'Order Number', width: 200, editable: true },
        { field: 'quoteNumber', headerName: 'Quote Number', width: 200, editable: true },
        {
            field: 'activity',
            headerName: 'Activity',
            width: 200,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['Client Discussion', 'Vendor Discussion', 'Quote Preparation', 'Order Preparation', 'Design Cooperation', 'Execution', 'Invoicing', 'Discussion with Management'],
        },
        {
            field: 'duration',
            headerName: 'Duration (hours)',
            width: 150,
            editable: true,
            type: 'number',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                  return [
                      <GridActionsCellItem
                          icon={<SaveIcon className="text-green-500" />} // Save icon in green
                          label="Save"
                          onClick={handleSaveClick(id)}
                      />,
                      <GridActionsCellItem
                          icon={<CancelIcon className="text-red-500" />} // Cancel icon in red
                          label="Cancel"
                          onClick={handleCancelClick(id)}
                      />,
                  ];
              }
              
              return [
                  <GridActionsCellItem
                      icon={<EditIcon className="text-blue-500" />} // Edit icon in blue
                      label="Edit"
                      onClick={handleEditClick(id)}
                  />,
                  <GridActionsCellItem
                      icon={<DeleteIcon className="text-red-500" />} // Delete icon in red
                      label="Delete"
                      onClick={handleDeleteClick(id)}
                  />,
              ];
              
            },
        },
    ];

    const formatDateForDB = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
                </div>
                <Box
                    sx={{
                        height: 400,
                        width: '100%',
                        '& .actions': {
                            color: 'text.secondary',
                        },
                    }}
                >
                  <div className="h-fit w-full mt-8 bg-white rounded-xl shadow-md">
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={handleRowModesModelChange}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        slots={{
                            toolbar: EditToolbar,
                        }}
                        slotProps={{
                          toolbar: { setRows, setRowModesModel, rows },
                        }}
                    />
                    </div>
                </Box>
                 {/* Confirmation Dialog */}
                 <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                    <DialogTitle className="text-xl font-bold">Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this record?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary" className="bg-gray-300 hover:bg-gray-400">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} color="secondary" className="bg-red-500 hover:bg-red-600">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {successMessage && <SuccessToast message={successMessage} />}
                {toast && <ToastMessage message={toastMessage} type="error" />}
            </div>
        </div>
    );
}
