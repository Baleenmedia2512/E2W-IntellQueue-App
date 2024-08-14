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
import DateRangePicker from '../CustomDateRangePicker';
import { startOfMonth, endOfMonth, format, isValid } from 'date-fns';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import ToastMessage from '../../components/ToastMessage';
import SuccessToast from '../../components/SuccessToast';
import { useAppSelector } from '@/redux/store';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';



export default function GroupedRowsDemo() {
    const companyName = "Baleen Test";
    // const companyName = useAppSelector(state => state.authSlice.companyName);
    const [consultants, setConsultants] = useState([]);
    const [filteredConsultants, setFilteredConsultants] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const currentStartDate = startOfMonth(new Date());
  const currentEndDate = endOfMonth(new Date());
    const [selectedRange, setSelectedRange] = useState({
        startDate: currentStartDate,
        endDate: currentEndDate,
      });
      const [startDate, setStartDate] = useState(format(currentStartDate, 'yyyy-MM-dd'));
      const [endDate, setEndDate] = useState(format(currentEndDate, 'yyyy-MM-dd'));

      const [filters, setFilters] = useState({
        global: { value: null, matchMode: 'contains' },
        id:{ value: null, matchMode: 'contains' },
        name: { value: null, matchMode: 'contains' },
        rateCard: { value: null, matchMode: 'contains' },
        rateType: { value: null, matchMode: 'contains' },
        count: { value: null, matchMode: 'equals' },
        price: { value: null, matchMode: 'equals' },
        total: { value: null, matchMode: 'equals' }
    });
    const [dates, setDates] = useState([currentStartDate, currentEndDate]);
    const [toast, setToast] = useState(false);
    const [severity, setSeverity] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [orderNumbers, setOrderNumbers] = useState([]);
    const [selectedOrderNumbers, setSelectedOrderNumbers] = useState([]);
    const [open, setOpen] = useState(false);
    const [consultantsWithZeroPrice, setConsultantsWithZeroPrice] = useState([]);
    

    const getConsultants = async (companyName, startDate, endDate) => {
        try {
            const response = await axios.get(`https://orders.baleenmedia.com/API/Media/FetchConsultantReport.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}`);
            const constData = response.data;

            // Extract all order numbers
            const allOrderNumbers = constData.map(item => item.OrderNumber);
            setOrderNumbers(allOrderNumbers);
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const fetchConsultants = async () => {
        const data = await getConsultants(companyName, startDate, endDate);
        const groupedData = groupConsultants(data);
        setConsultants(groupedData);
    };


    useEffect(() => {
        fetchConsultants();
    }, [startDate, endDate]);



    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const saveConsultant = async (event) => {
            event.preventDefault();
    
        let dataToSave = null;
        
        // Function to filter out rows where id contains "total"
        const filterRows = (rows) => rows.filter(row => !row.id.includes("total"));

        // Helper function to extract data from id
        const extractDataFromId = (id) => {
            const parts = id.split('-');
            let name, rateCard, rateType;

            if (parts.length === 3) {
                // When id contains three parts, map them to name, rateCard, and rateType
                name = parts[0];
                rateCard = parts[1];
                rateType = parts[2];
            } else if (parts.length === 4) {
                // When id contains two parts, assume the rateCard is 'X-Ray'
                name = parts[0];
                rateCard = 'X-Ray';
                rateType = parts[3];
            }
            
            return { name, rateCard, rateType };
        };

          // Determine which order numbers to use
    const orderNumbersToUse = selectedRows && selectedRows.length > 0
    ? selectedRows.map(row => row.orderNumber) // Use selectedOrderNumbers if selectedRows has data
    : orderNumbers; // Fall back to all orderNumbers if no selectedRows
    
        // Check if selectedRows has data
        if (selectedRows && selectedRows.length > 0) {
            // Filter out rows where id contains "total"
            const filteredRows = filterRows(selectedRows);
    
            // Extract data from filteredRows
            dataToSave = filteredRows.map(row => {
                const { name, rateCard, rateType } = extractDataFromId(row.id);
                return {
                    consultantName: name, // Use extracted name as consultant name
                    rateCard: rateCard, // Use extracted rateCard or default to 'X-Ray'
                    rateType: rateType, // Use extracted rateType or fallback to an empty string
                    unitPrice: row.price, // Fallback to '0' if price is null
                };
            });
    } else if (consultants && consultants.length > 0) {
        // Extract data from consultants
        dataToSave = consultants.flatMap(consultant => 
            consultant.rates.flatMap(rate => 
                rate.rateTypes.map(rateType => ({
                    consultantName: consultant.name,
                    rateCard: rate.rateCard,
                    rateType: rateType.rateType,
                    unitPrice: rateType.price
                }))
            )
        );
    }
        if (dataToSave) {
            try {
                for (const data of dataToSave) {
                    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/SaveConsultantIncentives.php/?JsonCID=&JsonConsultantName=${data.consultantName}&JsonRateCard=${data.rateCard}&JsonRateType=${data.rateType}&JsonUnitPrice=${data.unitPrice}&JsonDBName=${companyName}`);
                    const result = await response.json();
    
                    if (result !== "Values Inserted Successfully!") {
                        
                        return; // Stop the loop if there's an error
                    }
    
                    // Add a delay between requests to avoid rate limiting
                    await delay(500); // Delay of 500ms
                }
                // Update incentive status
                if (orderNumbersToUse && orderNumbersToUse.length > 0) {
                    const orderNumbersString = orderNumbersToUse.join(',');
                    const updateResponse = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateConsultantStatusOnOrderTable.php?JsonDBName=${companyName}&JsonOrderNumbers=${encodeURIComponent(orderNumbersString)}`);
                    const updateResult = await updateResponse.json();

                    if (updateResult.error) {
                        console.error('Error updating incentive status:', updateResult.error);
                    } else {
                        console.log('Incentive status updated:', updateResult.success);
                    }
                }
                setSuccessMessage(`Incentive(s) for ${numberOfConsultants} consultant(s) processed successfully!`);
                setTimeout(() => {
                setSuccessMessage('');
                fetchConsultants();
              }, 3000);
            } catch (error) {
                console.error('Error saving consultant:', error);
            }
        } else {
            setToastMessage('No data to save.');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
                setToast(false);
            }, 2000);
        }
        
    };
    

    const handleDateChange = (range) => {
        if (range && range.length === 2) {
          const [start, end] = range;
            setDates(range);
            if (start && end) {
            
            const formattedStartDate = format(start, 'yyyy-MM-dd');
            const formattedEndDate = format(end, 'yyyy-MM-dd');
            setStartDate(formattedStartDate);
            setEndDate(formattedEndDate);
            }
        }
      };

    // const groupConsultants = (data) => {
    //     const groupedData = [];

    //     data.forEach((consultant) => {
    //         let existingName = groupedData.find(group => group.name === consultant.name);

    //         if (!existingName) {
    //             existingName = { name: consultant.name, rates: [], total: 0 }; // Initialize total
    //             groupedData.push(existingName);
    //         }

    //         let existingScan = existingName.rates.find(rateCard => rateCard.rateCard === consultant.rateCard);

    //         if (!existingScan) {
    //             existingScan = { rateCard: consultant.rateCard, rateTypes: [] };
    //             existingName.rates.push(existingScan);
    //         }

    //         let existingScanType = existingScan.rateTypes.find(rateType => rateType.rateType === consultant.rateType);

    //         if (!existingScanType) {
    //             existingScanType = { rateType: consultant.rateType, count: 0, price: consultant.price };
    //             existingScan.rateTypes.push(existingScanType);
    //         }

    //         existingScanType.count += consultant.count;
    //         existingName.total += consultant.count * consultant.price; // Update total for the consultant
    //     });

    //     return groupedData;
    // };

    const groupConsultants = (data) => {
        const groupedData = [];
    
        data.forEach((consultant) => {
            let existingName = groupedData.find(group => group.name === consultant.name);
    
            if (!existingName) {
                existingName = { 
                    name: consultant.name, 
                    rates: [], 
                    total: 0,
                    orderNumber: consultant.OrderNumber // Add orderNumbers array
                };
                groupedData.push(existingName);
            }
    
            let existingScan = existingName.rates.find(rateCard => rateCard.rateCard === consultant.rateCard);
    
            if (!existingScan) {
                existingScan = { rateCard: consultant.rateCard, rateTypes: [] };
                existingName.rates.push(existingScan);
            }
    
            let existingScanType = existingScan.rateTypes.find(rateType => rateType.rateType === consultant.rateType);
    
            if (!existingScanType) {
                existingScanType = { rateType: consultant.rateType, count: 0, price: consultant.price };
                existingScan.rateTypes.push(existingScanType);
            }
    
            existingScanType.count += consultant.count;
            existingName.total += consultant.count * consultant.price; // Update total for the consultant
    
            // Add orderNumber if not already included
            // if (!existingName.orderNumber.includes(consultant.OrderNumber)) {
            //     existingName.orderNumber.push(consultant.OrderNumber);
            // }
        });
    
        return groupedData;
    };
    

    const renderGroupedData = (groupedData) => {
        const rows = [];
    
        groupedData.forEach(group => {
            let totalRows = group.rates.reduce((sum, rateCard) => sum + rateCard.rateTypes.length, 0);
            let middleIndex = Math.floor(totalRows / 2);
    
            let currentIndex = 0;
            group.rates.forEach((rateCard, scanIndex) => {
                rateCard.rateTypes.forEach((rateType, scanTypeIndex) => {
                    rows.push({
                        id: `${group.name}-${rateCard.rateCard}-${rateType.rateType}`,
                        name: currentIndex === middleIndex ? group.name : null,
                        rateCard: scanTypeIndex === 0 ? rateCard.rateCard : null,
                        rateType: rateType.rateType,
                        count: rateType.count,
                        price: rateType.price,
                        total: rateType.count * rateType.price,
                        isGroup: currentIndex === middleIndex,
                        isScanGroup: scanTypeIndex === 0,
                        orderNumber: group.orderNumber,
                    });
                    currentIndex++;
                });
            });
    
            // Add a row for the total of each consultant
            rows.push({
                id: `${group.name}-total`,
                name: '',
                rateCard: 'Total',
                count: '',
                price: '',
                total: `₹${Math.round(group.total)}`,
                isGroup: true,
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
                group.rates.forEach(rateCard => {
                    rateCard.rateTypes.forEach(rateType => {
                        if (`${group.name}-${rateCard.rateCard}-${rateType.rateType}` === id) {
                            rateType.price = newPrice;
                            rateType.total = rateType.count * newPrice;
                            group.total = group.rates.reduce((sum, rateCard) => 
                                sum + rateCard.rateTypes.reduce((innerSum, rateType) => 
                                    innerSum + (rateType.count * rateType.price), 0), 0);
                        }
                    });
                });
            });

            return updatedConsultants;
        });
        setSelectedRows(prevSelectedRows => {
            const updatedSelectedRows = prevSelectedRows.map(row => 
                row.id === id ? { 
                    ...row, 
                    price: newPrice, 
                    total: newPrice * row.count  // Update total for the specific row
                } : row
            );
    
            // Update the total in the "total" row
            const totalRowIndex = updatedSelectedRows.findIndex(row => row.id.includes('-total'));
            if (totalRowIndex !== -1) {
                const groupName = updatedSelectedRows[totalRowIndex].id.split('-')[0];
                const groupTotal = updatedSelectedRows.reduce((sum, row) => 
                    row.id.startsWith(groupName) && row.id !== `${groupName}-total`
                        ? sum + row.total 
                        : sum, 0);
    
                updatedSelectedRows[totalRowIndex].total = `₹${groupTotal}`;
            }
    
            return updatedSelectedRows;
        });
    };

    const priceBodyTemplate = (rowData) => {

        if (typeof rowData.total === 'string' && rowData.rateCard.startsWith('Total')) {
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
                className="p-inputtext p-component w-32 md:w-fit lg:w-fit h-full m-0 p-2 box-border rounded-md border border-sky-400 bg-white"
            />
        );
    }
    };

    const totalBodyTemplate = (rowData) => {
        // Check if it's a total row and format accordingly
        if (typeof rowData.total === 'string' && rowData.rateCard.startsWith('Total')) {
            return <span className="font-bold text-blue-500">{rowData.total}</span>;
        }
        return <span>₹{rowData.total}</span>; // Ensure this displays properly if it's a number
    };

    const nameBodyTemplate = (rowData) => {
        if (rowData.name) {
            return <span className="font-bold ml-2">{rowData.name}</span>;
        }
        return null;
    };

    const scanBodyTemplate = (rowData) => {
        if (rowData.rateCard === 'Total') {
            return <span className="font-bold text-blue-500">{rowData.rateCard}</span>;
        } else if (rowData.rateCard) {
            return <span className="font-bold">{rowData.rateCard}</span>;
        }
        return null;
    };
    

    const scanTypeBodyTemplate = (rowData) => {
        return rowData.rateType;
    };

    const countBodyTemplate = (rowData) => {
        return rowData.count;
    };

    const customRowClassName = (rowData) => {
        if (typeof rowData.total === 'string' && rowData.rateCard.startsWith('Total')) {
            const baseClass = rowData.isGroup ? 'bg-white' : rowData.isScanGroup ? 'bg-white' : '';
            return `${baseClass} border-b-2 border-gray-300`; // Add bottom border class here
        }   
        
    };

    const selectionBodyTemplate = (rowData) => {
        // Check if the rowData contains a consultant name
        if (rowData.name) {
            return <input type="checkbox" checked={selectedRows.includes(rowData)} readOnly />;
        }
        return null; // Render nothing if no consultant name
    };
    
    // Utility function to format numbers with commas in Indian format
const formatIndianNumber = (number) => {
    const parts = number.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';
  
    // Adding commas to the integer part
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherDigits = integerPart.substring(0, integerPart.length - 3);
    if (otherDigits !== '') {
      integerPart = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    } else {
      integerPart = lastThree;
    }
  
    return integerPart + decimalPart;
  };

   // Determine the rows to calculate based on selection
const rowsToCalculate = selectedRows.length > 0 ? selectedRows : groupedData;


// Filter rows where total starts with "Total:"
const filteredRows = rowsToCalculate.filter(row => typeof row.total === 'string' && row.rateCard.startsWith('Total'));

// Filter out rows with null or empty values for name and rateCard
const filteredNameRows = rowsToCalculate.filter(row => row.name);
const filteredCountRows = rowsToCalculate.filter(row => row.count);
// Calculate total amount
const totalAmount = filteredRows.reduce((sum, row) => {
    return sum + parseFloat(row.total.split('₹')[1]);
}, 0);

const formattedtotalAmount = formatIndianNumber(totalAmount);

// Calculate number of unique consultants
const numberOfConsultants = new Set(filteredNameRows.map(row => row.name)).size;

const extractNameFromId = (id) => {
    // Split the id by '-' and return the first part (the name)
    return id.split('-')[0];
};

const extractRateCardFromId = (id) => {
    // Split the id by '-' and return the first part (the name)
    return id.split('-')[1];
};

// Calculate number of rates
// Get the sum of values from the count column
const totalCount = rowsToCalculate.reduce((accumulator, row) => {
  // Add the value of count column to the accumulator if it exists and is a number
  return accumulator + (row.count || 0);
}, 0);

const numberOfScans = totalCount;


const handleExport = () => {
    // Filter out rows where the rateCard field is 'Total'
    const filteredData = groupedData.filter(row => row.rateCard !== 'Total');
    const filteredRows = selectedRows.filter(row => row.rateCard !== 'Total');

    const rowsToExport = filteredRows.length > 0 ? filteredRows : filteredData;
    // Prepare the data for export
    const exportData = rowsToExport.map(row => ({
        Consultant: extractNameFromId(row.id), // Default to an empty string if name is null
        RateCard: extractRateCardFromId(row.id),
        RateType: row.rateType,
        Count: row.count,
        Price: row.price,
        Total: row.total
    }));

    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultant Report');

    // Generate a binary string representation of the workbook
    const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
    });

    // Create a Blob from the buffer and trigger a download
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Consultant_Report.xlsx');
};
    

// const handleSelectionChange = (e) => {
//     const selectedRows = e.value; // Get the array of selected rows
//     const selectedNames = new Set(selectedRows.map(row => row.name)); // Collect unique names from selected rows

//     const newSelection = [];
//     groupedData.forEach(row => {
//         if (row.id.startsWith(`${Array.from(selectedNames).find(name => row.id.startsWith(`${name}-`))}-`)) {
//             newSelection.push(row);
//         }
//     });

//     setSelectedRows(newSelection);
// };

const handleSelectionChange = (e) => {
    const selectedRows = e.value; // Get the array of selected rows
    const selectedNames = new Set(selectedRows.map(row => row.name)); // Collect unique names from selected rows

    const newSelection = groupedData.reduce((acc, row) => {
        const matchingName = Array.from(selectedNames).find(name => row.id.startsWith(`${name}-`));
        if (matchingName) {
            const existingSelection = selectedRows.find(selectedRow => selectedRow.id === row.id);
            acc.push({
                ...row,
                price: existingSelection ? existingSelection.price : row.price, // Preserve the price or use the existing price if available
                orderNumber: existingSelection ? existingSelection.orderNumber : row.orderNumber, 
            });
        }
        return acc;
    }, []);

    if (selectedRows.length === 0) {
        // If no rows are selected, reset to all orderNumbers
        setSelectedOrderNumbers(orderNumbers); // Ensure `allOrderNumbers` is available in the scope
    } else {
        // Extract the unique orderNumbers from the selected rows
        const selectedOrderNumbs = selectedRows.map(row => row.orderNumber);
        
        // Set the selectedOrderNumbers in state
        setSelectedOrderNumbers(selectedOrderNumbs);
    }

    setSelectedRows(newSelection);
};


const filterHeaderTemplate = (column, filterField) => {
    return (
        <div>
            <span className="p-column-title">{column.header}</span>
            <input
                type="text"
                value={filters[filterField] ? filters[filterField].value : ''}
                onChange={(e) => {
                    let newFilters = { ...filters };
                    newFilters[filterField] = { value: e.target.value, matchMode: 'contains' };
                    setFilters(newFilters);
                }}
                placeholder={`Search ${column.header}`}
                className="p-inputtext-custom"
                style={{ width: '100%' }}
            />
        </div>
    );
};

useEffect(() => {
    const zeroPriceConsultants = consultants.filter(consultant => 
        consultant.rates.some(rate => 
            rate.rateTypes.some(rateType => rateType.price === '0' || rateType.price === 0)
        )
    );
    setConsultantsWithZeroPrice(zeroPriceConsultants);
}, [consultants]);

const handleClickOpen = () => {
    setOpen(true);
};


const handleClose = () => {
    setOpen(false);
};

// const handleConfirm = () => {
//     // Add your incentive processing logic here
//     setOpen(false);
// };


    return (
        <div className="relative min-h-screen mb-20">
            {/* Background colors */}
            <div className="absolute inset-0 bg-blue-600 h-96"></div>
            {/* <div className="absolute inset-x-0 bottom-0 bg-white h-52"></div> */}

            {/* Main content */}
            <div className="relative z-10 pt-8 px-0 sm:px-8 lg:px-12">
                {/* Page title */}
                <div className="absolute top-6 left-7 sm:left-12 lg:left-16 text-2xl font-bold text-white">
                    Consultant Report
                </div>

                {/* Information section */}
                <div className="relative top-12 mx-5 mb-8 flex overflow-x-auto gap-3">
                    <div className="w-fit h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-xl sm:text-3xl lg:text-4xl text-white font-bold">
                          ₹{formattedtotalAmount}
                        </div>
                        <div className="text-xs sm:text-base lg:text-lg text-gray-200">
                        Total Amount
                        </div>
                    </div>
                    <div className="w-fit h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-xl sm:text-3xl lg:text-4xl text-white font-bold">
                          {numberOfConsultants}
                        </div>
                        <div className="text-xs sm:text-base lg:text-lg text-blue-100">
                          Consultants
                        </div>
                    </div>
                    <div className="w-fit lg:w-32 h-auto rounded-lg shadow-lg p-4 mb-5 flex flex-col border border-gray-300 flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                        <div className="text-xl sm:text-3xl lg:text-4xl text-white font-bold">
                          {numberOfScans}
                        </div>
                        <div className="text-xs sm:text-base lg:text-lg text-gray-200">
                          Orders
                        </div>
                    </div>
                </div>

                

                {/* Content container */}
                <div className="mt-8 p-4">
                <div className="flex justify-end mb-4 gap-2 flex-wrap">
                <div className="flex flex-col justify-end w-fit sm:w-auto">
  <label className="text-white font-semibold items-center text-sm sm:text-base md:text-sm lg:text-base">Select Date Range</label>
  <Calendar 
    value={dates} 
    onChange={(e) => handleDateChange(e.value)} 
    selectionMode="range" 
    dateFormat='dd-M-yy' 
    readOnlyInput 
    hideOnRangeSelection 
    className="w-56 text-sm sm:text-base md:text-sm lg:text-base"
    inputClassName="w-full border border-sky-300 rounded-lg pl-2 py-1 bg-white text-gray-900"
  />
</div>

            <div className="mt-auto flex justify-end gap-2 flex-wrap">
        <button
          onClick={handleExport}
          className="bg-green-500 h-fit text-white py-1.5 px-3 rounded shadow hover:bg-green-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
        >
          <i className="pi pi-file-excel mr-1 sm:mr-2"></i>
          Export to Excel
        </button>
        <button
          onClick={handleClickOpen}
          className="bg-blue-500 h-fit text-white py-1.5 px-3 rounded shadow hover:bg-blue-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
        >
          <i className="pi pi-check mr-1 sm:mr-2"></i>
          Process Incentive
        </button>
        <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle
                >Confirm Incentive Processing</DialogTitle>
                <DialogContent className='mt-2'>
                    <DialogContentText 
                    >
                        {consultantsWithZeroPrice.length > 0 ? (
                            <>
                            <strong>The following consultant(s) have a price of 0:</strong>
                            <ul className="mt-2 ml-4 list-disc">
                                {consultantsWithZeroPrice.map((consultant, index) => (
                                    <li key={index}>{consultant.name}</li>
                                ))}
                            </ul>
                            <p className="mt-2">
                                <strong>Are you sure you want to process incentives?</strong>
                            </p>
                        </>
                    ) : (
                        <p><strong>Are you sure you want to process incentives?</strong></p>
                    )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={saveConsultant} color="primary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
      </div>
        </div>


    <div className="overflow-x-auto border rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                        <DataTable
                            // value={groupedData}
                            value={filteredConsultants && filteredConsultants.length > 0 ? filteredConsultants : groupedData}
                            rowClassName={customRowClassName}
                            selection={selectedRows}
                            onSelectionChange={handleSelectionChange}
                            className="text-left"
                            dataKey="id"
                            selectionMode="multiple"
                            metaKeySelection={false}
                            paginator
                            rows={20}
                            filters={filters}
                            globalFilterFields={['name', 'rateCard', 'rateType', 'count', 'price', 'total']}
            
                        >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} headerClassName="bg-gray-100" body={selectionBodyTemplate}></Column>
                            <Column field="name" header="Consultant" body={nameBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-3 pr-2" className="bg-white p-2 w-fit text-nowrap"
                            filter
                            filterElement={filterHeaderTemplate({ header: 'Consultant Name' }, 'id')}></Column>
                            <Column field="rateCard" header="Rate Card" body={scanBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-50 text-nowrap"
                            ></Column>
                            <Column field="rateType" header="Rate Type" body={scanTypeBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2 text-nowrap" className="bg-white p-2 w-fit text-nowrap"
                            ></Column>
                            <Column field="count" header="Count" body={countBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-fit p-2"
                            ></Column>
                            <Column field="price" header="Unit Price" body={priceBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white w-full sm:w-1/2 md:w-1/4 lg:w-1/6 p-2 text-nowrap"
                            ></Column>
                            <Column field="total" header="Total" body={totalBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"
                            ></Column>
                        </DataTable>
                    </div>
                </div>
                {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
            </div>
            
        </div>
    );
}
