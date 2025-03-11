'use client';
import React, { useState, useEffect, useRef } from 'react';
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
import { Dropdown } from 'primereact/dropdown';
import { FaCheck, FaTimes, FaWindowClose, FaFilter } from 'react-icons/fa';
import Tippy from '@tippyjs/react'; // Tooltip library
import 'tippy.js/dist/tippy.css'; // Import Tippy's default CSS
import { generateReferralPdf } from '../../generatePDF/generateConsultantSlipPDF';

const matchModes = [
    { label: 'Contains', value: 'contains' },
    { label: 'Starts with', value: 'startsWith' },
    { label: 'Ends with', value: 'endsWith' },
    { label: 'Equals', value: 'equals' },
];


export default function GroupedRowsDemo() {
    const dbName = useAppSelector(state => state.authSlice.dbName);
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const username = useAppSelector(state => state.authSlice.userName);
    const [consultants, setConsultants] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    // const [filteredConsultants, setFilteredConsultants] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const currentStartDate = startOfMonth(new Date());
    const currentEndDate = endOfMonth(new Date());
    const sessionStartDate = sessionStorage.getItem('startDate');
    const sessionEndDate = sessionStorage.getItem('endDate');
    const [selectedRange, setSelectedRange] = useState({
        startDate: currentStartDate,
        endDate: currentEndDate,
      });
    const [startDate, setStartDate] = useState(sessionStartDate || format(currentStartDate, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(sessionEndDate || format(currentEndDate, 'yyyy-MM-dd'));
    const defaultFilters = {
        orderNumber: { value: null, matchMode: 'contains' },
        consultant: { value: null, matchMode: 'contains' },
        client: { value: null, matchMode: 'contains' },
        rateCard: { value: null, matchMode: 'contains' },
        rateType: { value: null, matchMode: 'contains' },
    };
    const sessionFilters = sessionStorage.getItem('filters')
    ? JSON.parse(sessionStorage.getItem('filters'))
    : null;
    const [filters, setFilters] = useState(sessionFilters || defaultFilters);
    const [dates, setDates] = useState(
        sessionStartDate && sessionEndDate
            ? [new Date(sessionStartDate), new Date(sessionEndDate)]
            : [currentStartDate, currentEndDate]
    );
    const [toast, setToast] = useState(false);
    const [severity, setSeverity] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [orderNumbers, setOrderNumbers] = useState([]);
    const [selectedOrderNumbers, setSelectedOrderNumbers] = useState([]);
    const [open, setOpen] = useState(false);
    const [consultantsWithZeroPrice, setConsultantsWithZeroPrice] = useState([]);
    const [matchMode, setMatchMode] = useState('contains');
    const [showIcProcessedConsultantsOnly, setShowIcProcessedConsultantsOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const sessionFilterValues = sessionStorage.getItem('filterValues')
    ? JSON.parse(sessionStorage.getItem('filterValues'))
    : null;
    const [tempFilterValues, setTempFilterValues] = useState(sessionFilterValues || {
        rateWiseOrderNumber: '',
        consultant: '',
        client: '',
        rateCard: '',
        rateType: '',
    });

    const activeFilters = {
        rateWiseOrderNumber: filters.rateWiseOrderNumber ? filters.rateWiseOrderNumber.value : '',
        rateCard: filters.rateCard ? filters.rateCard.value : '',
        consultant: filters.consultant ? filters.consultant.value : '',
        client: filters.client ? filters.client.value : '',
        rateType: filters.rateType ? filters.rateType.value : ''
    };

    useEffect(() => {
        if (!username || dbName === "") {
          router.push('/login');
          sessionStorage.removeItem("unitPrices");
          sessionStorage.clear();
        }
      },[])

      useEffect(() => {
        // Retrieve and set dates on page load if not already set
        const savedStartDate = sessionStorage.getItem('startDate');
        const savedEndDate = sessionStorage.getItem('endDate');
        if (savedStartDate && savedEndDate) {
            setDates([new Date(savedStartDate), new Date(savedEndDate)]);
        }
    }, []);

    const getConsultants = async (companyName, startDate, endDate, showIcProcessedConsultantsOnly) => {
        try {
            const response = await axios.get(`https://orders.baleenmedia.com/API/Media/FetchConsultantReport.php?JsonDBName=${companyName}&JsonStartDate=${startDate}&JsonEndDate=${endDate}&JsonShowIcProcessedConsultantsOnly=${showIcProcessedConsultantsOnly}`);
            const constData = response.data;
            if (constData.error === "No orders found.") {
                setGroupedData([]);
                return [];
            }
            // Extract all order numbers
            const allOrderNumbers = constData.map(item => item.OrderNumbers);
            setOrderNumbers(allOrderNumbers);
            return response.data;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

        // Utility function to apply filters to data
        const applyFilters = (data, filters) => {
            let filteredData = [...data];
            
            for (const key in filters) {
                const filterValue = filters[key]?.value;
                if (filterValue) {
                    filteredData = filteredData.filter(row => {
                        const fieldValue = row[key];
                        return (
                            fieldValue &&
                            typeof fieldValue === 'string' &&
                            fieldValue.toLowerCase().includes(filterValue.toLowerCase())
                        );
                    });
                }
            }
            return filteredData;
        };

    const fetchConsultants = async () => {
        const data = await getConsultants(companyName, startDate, endDate, showIcProcessedConsultantsOnly);
        
        const groupedData = groupConsultants(data);
        setConsultants(groupedData);
    };
    
    useEffect(() => {
        fetchConsultants();
    }, [startDate, endDate, showIcProcessedConsultantsOnly]);

    useEffect(() => {
         // Check if any filter has a non-null value
        const hasActiveFilters = Object.values(filters).some(
            filter => filter.value !== null
        );
        
        // Select all rows by default when groupedData is ready and filters are active
        if (consultants.length > 0) {
            if (hasActiveFilters) {
                const data = renderGroupedData(consultants, activeFilters);
                setGroupedData(data)
                const combinedFilteredRows = applyFilters(data, filters);
                setSelectedRows(combinedFilteredRows);
            } else {
                const data = renderGroupedData(consultants, activeFilters);
                setGroupedData(data)
                setSelectedRows(data);
            }
            
        } else {
            setGroupedData([])
            setSelectedRows([]);
        }
    }, [consultants]);

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const saveConsultant = async (event) => {
    event.preventDefault();
    setLoading(true);
    let dataToSave = null;
        
    // Function to filter out rows where id contains "total"
    const filterRows = (rows) => rows.filter(row => !row.rateCard.includes("total"));

    const orderNumbersToUse = selectedRows && selectedRows.length > 0
    ? selectedRows
        .filter(row => !row.rateCard.startsWith('Total')) // Exclude 'Total' rows
        .map(row => row.orderNumber)
    : groupedData
        .filter(row => !row.rateCard.startsWith('Total')) // Exclude 'Total' rows
        .map(row => row.orderNumber)
    
    // Check if selectedRows has data
    if (selectedRows && selectedRows.length > 0) {
        // Filter out rows where id contains "total"
        const filteredRows = filterRows(selectedRows);
        // Extract data from filteredRows
        dataToSave = filteredRows.map(row => {
            return {
                consultantName: row.consultant,
                rateCard: row.rateCard, 
                rateType: row.rateType,
                unitPrice: row.price, 
            };
        });
    } else if (groupedData && groupedData.length > 0) {

        const filteredgroupedData = filterRows(groupedData);
        // Extract data from groupedData
        dataToSave = filteredgroupedData.map(row => {
            return {
                consultantName: row.consultant, 
                rateCard: row.rateCard, 
                rateType: row.rateType,
                unitPrice: row.price,
            };
        });
    }
        if (dataToSave) {
            try {
                for (const data of dataToSave) {
                    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/SaveConsultantIncentives.php/?JsonCID=&JsonConsultantName=${data.consultantName}&JsonRateCard=${encodeURIComponent(data.rateCard)}&JsonRateType=${encodeURIComponent(data.rateType)}&JsonUnitPrice=${data.unitPrice}&JsonDBName=${companyName}`);
                    const result = await response.json();
    
                    if (result !== "Values Inserted Successfully!") {
                        
                        return; // Stop the loop if there's an error
                    }
    
                    // Add a delay between requests to avoid rate limiting
                    await delay(500); // Delay of 500ms
                }
                // Update incentive status
                if (orderNumbersToUse && orderNumbersToUse.length > 0) {
                    const orderNumbersString = orderNumbersToUse.join(',').replace(/\s*,\s*/g, ',');

                    const updateResponse = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateConsultantStatusOnOrderTable.php?JsonDBName=${companyName}&JsonOrderNumbers=${encodeURIComponent(orderNumbersString)}`);
                    const updateResult = await updateResponse.json();


                    if (updateResult.error) {
                        console.error('Error updating incentive status:', updateResult.error);
                    } else {
                        console.log('Incentive status updated:', updateResult.success);
                    }
                }
                setLoading(false);
                setOpen(false);
                setSuccessMessage(`Incentive(s) for ${numberOfConsultants} consultant(s) processed successfully!`);
                fetchConsultants();
                setTimeout(() => {
                setSuccessMessage('');
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


const handleMarkAsUnprocessed = async () => {
    if (selectedRows && selectedRows.length > 0) {
        setLoading(true);
        try {
            const orderNumbersToUse = selectedRows
            .filter(row => row.rateCard !== "Total")
            .map(row => row.orderNumber)
 
            const orderNumbersString = orderNumbersToUse.join(',').replace(/\s*,\s*/g, ',');
                if (orderNumbersToUse && orderNumbersToUse.length > 0) {
                    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/MarkAsICUnprocessed.php?JsonOrderNumber=${encodeURIComponent(orderNumbersString)}&JsonDBName=${companyName}`);
                    const result = await response.json();

                    if (result.error) {
                        console.error('Error marking as unprocessed:', result.error);
                        return; // Stop if there's an error
                    }
                }
            

            //Optionally refresh the consultants after marking them unprocessed
            setLoading(false);
            fetchConsultants();
            setSuccessMessage(`Incentive(s) for selected consultant(s) marked as unprocessed successfully!`);
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error marking as unprocessed:', error);
        }
    } else {
        setToastMessage('No consultants selected!');
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
            sessionStorage.setItem('startDate', formattedStartDate);
            sessionStorage.setItem('endDate', formattedEndDate);
            }
        }
      };

      const groupConsultants = (data) => {
        const groupedData = [];
    
        data.forEach((consultant) => {
            let existingConsultant = groupedData.find(group => group.id === consultant.ConsultantId);
    
            if (!existingConsultant) {
                existingConsultant = {
                    id: consultant.ConsultantId,
                    name: consultant.name,
                    rates: [],
                    totalCount: 0,
                    totalPrice: 0,
                };
                groupedData.push(existingConsultant);
            }
    
            existingConsultant.rates.push({
                rateCard: consultant.rateCard,
                rateType: consultant.rateType,
                price: consultant.price ? parseFloat(consultant.price) : 0,
                orderNumber: consultant.orderNumber,
                client: consultant.clientName,
                rateWiseOrderNumber: consultant.rateWiseOrderNumber
            });
    
            existingConsultant.totalCount++;
            existingConsultant.totalPrice += consultant.price ? parseFloat(consultant.price) : 0;
        });
    
        return groupedData;
    };
    

    const renderGroupedData = (consultants) => {
        const rows = [];
    
        consultants.forEach((consultant, consultantIndex) => {
            consultant.rates.forEach((rate, rateIndex) => {
                rows.push({
                    id: `${consultant.id}-${consultant.name}-${rateIndex}`,
                    consultant: consultant.name,
                    client: rate.client,
                    rateCard: rate.rateCard,
                    rateType: rate.rateType,
                    price: rate.price,
                    orderNumber: rate.orderNumber,
                    rateWiseOrderNumber: rate.rateWiseOrderNumber,
                    consultantId: consultant.id
                });
            });
    
            // Add a total row for the consultant
            rows.push({
                id: `${consultant.id}-${consultant.name}-total`,
                consultant: "",
                client: "",
                rateCard: "Total",
                rateType: consultant.totalCount,
                price: consultant.totalPrice,
                orderNumber: "",
                rateWiseOrderNumber: "", 
                consultantId: ""
            });
        });
    
        return rows;
    };
    

    const priceBodyTemplate = (rowData) => {
        // Check if it's a total row and format accordingly
        if (typeof rowData.rateCard === 'string' && rowData.rateCard.startsWith('Total')) {
            return <span className="font-bold text-blue-500">₹{rowData.price}</span>;
        }
        return <span>₹{rowData.price}</span>; // Ensure this displays properly if it's a number
    };

    const consultantBodyTemplate = (rowData) => {
        if (rowData.consultant) {
            return <span className="font-bold ml-2">{rowData.consultant}</span>;
        }
        return null;
    };

    const clientBodyTemplate = (rowData) => {
        if (rowData.consultant) {
            return <span className="ml-2">{rowData.client}</span>;
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

    const rateWiseOrderNumberBodyTemplate = (rowData) => {
        if (rowData.rateCard === 'Total') {
            return <span className="text-blue-500">{rowData.rateWiseOrderNumber}</span>;
        } else if (rowData.rateCard) {
            return <span>#{rowData.rateWiseOrderNumber}</span>;
        }
        return null;
    };
    

    const scanTypeBodyTemplate = (rowData) => {
        if (rowData.rateCard === 'Total') {
            const orderLabel = rowData.rateType > 1 ? 'Orders' : 'Order';
            return <span className="font-bold text-blue-500">{rowData.rateType} {orderLabel}</span>;
        } else if (rowData.rateCard) {
            return <span>{rowData.rateType}</span>;
        }
        return null;
    };

    const customRowClassName = (rowData) => {
        const isTotalRow = typeof rowData.rateCard === 'string' && rowData.rateCard.startsWith('Total');
    
        const additionalClass = isTotalRow ? 'hide-checkbox border-b-2 border-gray-300' : '';
    
        return `'bg-white' ${additionalClass}`;
    };

    const selectionBodyTemplate = (rowData) => {
        if (rowData.consultant) {
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

// Dashboard Calculations  
const rowsToCalucalate = selectedRows.length > 0 ? selectedRows : groupedData;

// Total Amount Calculation
const filteredAmountRows = rowsToCalucalate.filter(row => row.price && !row.rateCard.startsWith('Total'));

const totalAmount = filteredAmountRows.reduce((sum, row) => {
    return sum + parseFloat(row.price);
}, 0);

const formattedtotalAmount = formatIndianNumber(totalAmount);

// Total No. Of Consultant Calulation
const filteredNameRows = rowsToCalucalate.map(row => {
    if (row.consultant) {
        return row;
    } else if (rowsToCalucalate.length > 0 && row.id) {
        // If name is null and rowsToCalucalate is greater than 0, extract the name from row.id
        
        return { ...row, consultant: row.consultant };
    }
    return row;
});

const numberOfConsultants = new Set(
    filteredNameRows
        .map(row => row.consultantId) // Use consultantId instead of name
        .filter(consultantId => consultantId) // Ensure no null or empty values
).size;

// Total No. Of Orders Calculation
const totalCount = rowsToCalucalate.reduce((accumulator, row) => {
    if (!row.rateCard.startsWith('Total')) {
      return accumulator + 1;
    }
    return accumulator; // Skip the row if it starts with 'Total'
  }, 0);

const numberOfScans = totalCount;


// const handleExport = () => {
//     // Filter out rows where the rateCard field is 'Total'
//     const filteredData = groupedData.filter(row => row.rateCard !== 'Total');
//     const filteredRows = selectedRows.filter(row => row.rateCard !== 'Total');

//     const rowsToExport = filteredRows.length > 0 ? filteredRows : filteredData;
//     // Prepare the data for export
//     const exportData = rowsToExport.map(row => ({
//         rateWiseOrderNumber: row.rateWiseOrderNumber,
//         Consultant: row.consultant,
//         Client: row.client,
//         RateCard: row.rateCard,
//         RateType: row.rateType,
//         Price: row.price
//     }));

//     // Create a worksheet from the data
//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     // Create a workbook and add the worksheet
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultant Report');

//     // Generate a binary string representation of the workbook
//     const excelBuffer = XLSX.write(workbook, {
//         bookType: 'xlsx',
//         type: 'array'
//     });

//     // Create a Blob from the buffer and trigger a download
//     const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
//     saveAs(blob, 'Consultant_Report.xlsx');
// };

const handleExport = () => {
    setExportDialogOpen(true);
};

// Add these new functions for export options
const handleDetailedExport = () => {
    // Filter out rows where the rateCard field is 'Total'
    const filteredData = groupedData.filter(row => row.rateCard !== 'Total');
    const filteredRows = selectedRows.filter(row => row.rateCard !== 'Total');

    const rowsToExport = filteredRows.length > 0 ? filteredRows : filteredData;
    // Prepare the data for export
    const exportData = rowsToExport.map(row => ({
        rateWiseOrderNumber: row.rateWiseOrderNumber,
        Consultant: row.consultant,
        Client: row.client,
        RateCard: row.rateCard,
        RateType: row.rateType,
        Price: row.price
    }));

    // Format date range for filename
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const dateRangeForFilename = `${formattedStartDate} to ${formattedEndDate}`;

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
    saveAs(blob,  `Consultant_Report_Detailed (${dateRangeForFilename}).xlsx`);
    
    setExportDialogOpen(false);
};

const handleGroupedExport = () => {
    const filteredRows = selectedRows.length > 0 
        ? selectedRows.filter(row => row.rateCard !== "Total")
        : groupedData.filter(row => row.rateCard !== "Total");
  
    const groupedData = filteredRows.reduce((acc, row) => {
        const { consultantId, consultant, rateCard, price, rateType } = row;
      
        if (!acc[consultantId]) {
            acc[consultantId] = { consultant, data: {} };
        }
      
        if (!acc[consultantId].data[rateCard]) {
            acc[consultantId].data[rateCard] = {};
        }
      
        if (!acc[consultantId].data[rateCard][price]) {
            acc[consultantId].data[rateCard][price] = { count: 0, totalPrice: 0, rateTypes: new Set() };
        }
      
        acc[consultantId].data[rateCard][price].count += 1;
        acc[consultantId].data[rateCard][price].totalPrice += price;
      
        if (rateType) {
            acc[consultantId].data[rateCard][price].rateTypes.add(rateType.trim());
        }
      
        return acc;
    }, {});
      
    // Sort consultants by name (alphabetical order)
    const sortedConsultants = Object.values(groupedData).sort((a, b) => a.consultant.localeCompare(b.consultant));

    // Convert to an array format for Excel export
    const exportData = [];
    sortedConsultants.forEach(({ consultant, data }) => {
        for (const rateCard in data) {
            for (const price in data[rateCard]) {
                const { count, totalPrice, rateTypes } = data[rateCard][price];
                exportData.push({
                    Consultant: consultant,
                    RateCard: rateCard,
                    RateType: [...rateTypes].join(", "),
                    Price: price,
                    Count: count,
                    TotalAmount: totalPrice
                });
            }
        }
    });

    // Format date range for filename
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const dateRangeForFilename = `${formattedStartDate} to ${formattedEndDate}`;
      
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
    saveAs(blob, `Consultant_Report_Grouped (${dateRangeForFilename}).xlsx`);
    
    setExportDialogOpen(false);
};

const handleSelectionChange = (e) => {
    const selectedRows = e.value; // Get the selected rows from the event
    const rowsToCheck = groupedData; // Reference to the grouped data (could be consultants grouped by their rates)

    // Reduce the grouped data to the new selection based on selected rows
    const newSelection = rowsToCheck.reduce((acc, row) => {
        // Check if the current row's orderNumber and id exist in the selected rows
        const isSelected = selectedRows.some(selectedRow => 
            selectedRow.orderNumber === row.orderNumber && 
            selectedRow.id === row.id // Check if `orderNumber` and `id` match
        );

        if (isSelected) {
            acc.push(row); // Add to the selection if it matches the selected rows
        }

        return acc;
    }, []);

    if (selectedRows.length === 0) {
        // If no rows are selected, reset to all orderNumbers
        setSelectedOrderNumbers([]); // Reset the order numbers
    } else {
        // Extract the unique orderNumbers from the selected rows
        const selectedOrderNumbers = selectedRows.map(row => row.orderNumber);
        
        // Set the selectedOrderNumbers state with the selected order numbers
        setSelectedOrderNumbers(selectedOrderNumbers);
    }

    // Update the selected rows state with the new selection
    setSelectedRows(newSelection); // Update selected rows
};

const filterHeaderTemplate = (column, filterField) => {
    
    const handleApplyFilter = () => {
        let newFilters = { ...filters };
        let combinedFilteredRows = [...groupedData]; 
        
        // Apply filters based on each filter field
        for (const key in tempFilterValues) {
            if (tempFilterValues[key] !== '') {
                newFilters[key] = { value: tempFilterValues[key], matchMode: 'contains' };
    
                // Apply the filter on the combinedFilteredRows
                combinedFilteredRows = combinedFilteredRows.filter(row => {
                    const fieldValue = row[key]; // Dynamically access the field based on key
    
                    // Handle null or undefined values
                    if (fieldValue === null || fieldValue === undefined) {
                        return false; // Skip rows with null/undefined values for filtering
                    }
    
                    let formattedFilterValue = tempFilterValues[key];
    
                    // If filter value starts with #, remove it for filtering
                    if (formattedFilterValue && formattedFilterValue.startsWith("#")) {
                        formattedFilterValue = formattedFilterValue.slice(1); // Remove #
                    }
    
                    // If fieldValue is a string, compare it after converting both to lowercase
                    if (typeof fieldValue === 'string') {
                        return fieldValue.toLowerCase().includes(formattedFilterValue.toLowerCase());
                    }
    
                    // If fieldValue is a number (like orderNumber), compare it directly
                    if (typeof fieldValue === 'number') {
                        return fieldValue.toString().includes(formattedFilterValue); // Ensure to convert to string for comparison
                    }
    
                    return false; // Return false for unsupported types
                });
            }
        }

    
        // Update session storage and filters
        sessionStorage.setItem('filters', JSON.stringify(newFilters));
        setFilters(newFilters);
        setSelectedRows(combinedFilteredRows); // Automatically select the filtered rows
    };
    

    const handleClearFilter = () => {
        let newFilters = { ...filters };
        newFilters[filterField].value = '';
    
        // Clear the temporary filter value for the specific filter
        setTempFilterValues({ ...tempFilterValues, [filterField]: '' });
        sessionStorage.setItem('filterValues', JSON.stringify({ ...tempFilterValues, [filterField]: '' }));
    
        // Reset combined filtered rows to the original dataset
        let combinedFilteredRows = [...groupedData]; 
    
        // Apply remaining filters
        for (const key in newFilters) {
            const filterValue = newFilters[key]?.value; // Safely access the filter value
    
            if (filterValue && filterValue !== '') { // Check for non-empty filter values
                combinedFilteredRows = combinedFilteredRows.filter(row => {
                    const fieldValue = row[key]; 
                    // Handle null or undefined values
                    if (fieldValue === null || fieldValue === undefined) {
                        return false; // Skip rows with null/undefined values for filtering
                    }
    
                    if (typeof fieldValue === 'string') {
                        return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
                    }
                    return false; // Handle other cases if necessary
                });
            }
        }
    
        sessionStorage.setItem('filters', JSON.stringify(newFilters));
        setFilters(newFilters); // Update filters without the cleared filter
    
        // Reset selectedRows when all filters are cleared
        if (Object.values(newFilters).every(filter => filter.value === null || filter.value === '')) {
            setSelectedRows([...groupedData]); // Ensure to reset selected rows to the full dataset
        } else {
            setSelectedRows(combinedFilteredRows); // Update selected rows based on remaining active filters
        }
    };

    return (
        <div>
            <div className="border-b-2 border-sky-500 mb-2 pb-1 text-center">
                <span className="font-bold text-sky-500">Contains</span>
            </div>
            <span className="p-column-title">{column.header}</span>
            <input
                type="text"
                value={tempFilterValues[filterField]}
                onChange={(e) => {setTempFilterValues({ ...tempFilterValues, [filterField]: e.target.value }); sessionStorage.setItem('filterValues', JSON.stringify({ ...tempFilterValues, [filterField]: e.target.value })); }}
                placeholder={`Search ${column.header}`}
                className="p-inputtext-custom"
                style={{ width: '100%' }}
            />
            
            {/* Apply Button */}
            <Tippy content="Apply Filter" placement="bottom">
                <button
                    onClick={handleApplyFilter}
                    className="mt-2 px-4 py-2 font-base bg-green-600 text-white border border-green-200 font-semibold rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                    <FaCheck />
                </button>
            </Tippy>

            {/* Clear Button */}
            <Tippy content="Clear Filter" placement="bottom">
                <button
                    onClick={handleClearFilter}
                    className="mt-2 px-4 py-2 ml-2 font-base bg-red-600 text-white border border-red-200 font-semibold rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition duration-150 ease-in-out"
                >
                    <FaTimes />
                </button>
            </Tippy>
        </div>
    );
};

useEffect(() => {
    if (selectedRows.length > 0) {
        // Filter consultants with zero-priced rates in selected rows
        const zeroPriceConsultants = selectedRows.filter(
            row => row.price === '0' || row.price === 0
        );
        setConsultantsWithZeroPrice(zeroPriceConsultants);
    } else {
        // Filter consultants with zero-priced rates in the full consultants list
        const zeroPriceConsultants = consultants.filter(consultant => 
            consultant.rates.some(rate => rate.price === 0)
        );
        setConsultantsWithZeroPrice(zeroPriceConsultants);
    }

    // Restore filters from session if available
    if (sessionFilters) {
        setFilters(sessionFilters);
    }
    if (sessionFilterValues) {
        setTempFilterValues(sessionFilterValues);
    }
}, [consultants, selectedRows]);


const handleClickOpen = () => {
    setOpen(true);
};

const handleClose = () => {
    setOpen(false);
};

const handleCheckboxChange = () => {
    setShowIcProcessedConsultantsOnly((prev) => !prev);
};

const handleSlipGeneration = () => {
    const filteredRows = selectedRows.filter(row => row.rateCard !== "Total");
  
    const groupedData = filteredRows.reduce((acc, row) => {
        const { consultantId, consultant, rateCard, price, rateType } = row;
      
        if (!acc[consultantId]) {
            acc[consultantId] = { consultant, data: {} };
        }
      
        if (!acc[consultantId].data[rateCard]) {
            acc[consultantId].data[rateCard] = {};
        }
      
        if (!acc[consultantId].data[rateCard][price]) {
            acc[consultantId].data[rateCard][price] = { count: 0, totalPrice: 0, rateTypes: new Set() };
        }
      
        acc[consultantId].data[rateCard][price].count += 1;
        acc[consultantId].data[rateCard][price].totalPrice += price;
      
        if (rateType) {
            acc[consultantId].data[rateCard][price].rateTypes.add(rateType.trim());
        }
      
        return acc;
    }, {});
      
    // Sort consultants by name (alphabetical order)
    const sortedConsultants = Object.values(groupedData).sort((a, b) => a.consultant.localeCompare(b.consultant));

    // Convert to an array format for PDF generation
    const summaryByConsultant = [];
    sortedConsultants.forEach(({ consultant, data }) => {
        summaryByConsultant.push({ consultant, isHeader: true });

        for (const rateCard in data) {
            for (const price in data[rateCard]) {
                const { count, totalPrice, rateTypes } = data[rateCard][price];
                summaryByConsultant.push({
                    consultant,
                    rateCard,
                    price,
                    count,
                    totalPrice,
                    dateRange: `${formatDate(startDate)} - ${formatDate(endDate)}`,
                    rateType: [...rateTypes].join(", "), // Merge only for that rateCard & price
                });
            }
        }
    });
      
    generateReferralPdf(summaryByConsultant);      
};




  const formatDate = (dateString) => {
    const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };

    return (
        <div className="relative min-h-screen mb-20">
            {/* Export Options Dialog */}
            <Dialog 
                open={exportDialogOpen} 
                onClose={() => setExportDialogOpen(false)} 
                className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            >
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg sm:max-w-md">
                    <DialogTitle className="text-lg font-semibold text-gray-900 text-center sm:text-left">
                        Export Options
                    </DialogTitle>
                    <DialogContent className="mt-2">
                        <DialogContentText className="text-gray-600 text-sm text-center sm:text-left">
                            Please select how you would like to export the data:
                        </DialogContentText>
                        <div className="mt-4 space-y-3">
                            <div 
                                className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition"
                                onClick={handleDetailedExport}
                            >
                                <h3 className="font-medium text-gray-800">Detailed Export</h3>
                                <p className="text-sm text-gray-600">Export all individual records with complete details</p>
                            </div>
                            <div 
                                className="p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition"
                                onClick={handleGroupedExport}
                            >
                                <h3 className="font-medium text-gray-800">Grouped Export</h3>
                                <p className="text-sm text-gray-600">Export data grouped by consultant, rate card, and price</p>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                        <button
                            onClick={() => setExportDialogOpen(false)}
                            className="w-full sm:w-auto px-5 py-2 text-gray-700 bg-gray-200 rounded-full font-medium hover:bg-gray-300 transition duration-200 ease-in-out shadow-sm active:scale-95 focus:ring-2 focus:ring-gray-400"
                        >
                            Cancel
                        </button>
                    </DialogActions>
                </div>
            </Dialog>

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
                          Payable Consultants
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
        onClick={() => handleSlipGeneration()}
        className="bg-orange-500 h-fit text-white py-1.5 px-3 rounded shadow hover:bg-orange-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
        >
        <i className="pi pi-download mr-1 sm:mr-2"></i>
        Generate Slip
        </button>


        <button
          onClick={handleExport}
          className="bg-green-500 h-fit text-white py-1.5 px-3 rounded shadow hover:bg-green-600 flex items-center text-sm sm:text-base md:text-sm lg:text-base"
        >
          <i className="pi pi-file-excel mr-1 sm:mr-2"></i>
          Export to Excel
        </button>
        {showIcProcessedConsultantsOnly ? (
            <button
                onClick={handleMarkAsUnprocessed}
                disabled={loading}
                className={`h-fit text-white py-1.5 px-3 rounded shadow flex items-center text-sm sm:text-base md:text-sm lg:text-base bg-red-500 hover:bg-red-600 ${loading ? "bg-red-500 opacity-50 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
            >
                <i className="pi pi-ban mr-1 sm:mr-2"></i>
                Mark As Unprocessed
            </button>
        ) : (
            <button
                onClick={saveConsultant}
                disabled={loading}
                className={`h-fit text-white py-1.5 px-3 rounded shadow flex items-center text-sm sm:text-base md:text-sm lg:text-base
                    ${loading ? "bg-blue-500 opacity-50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}
                `}
            >
                <i className="pi pi-check mr-1 sm:mr-2"></i>
                Process Incentive
            </button>
        )}
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
                            <ul className="mt-2 ml-4 list-disc ">
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
        <div className="mb-2 flex items-center justify-end text-black">
        <label className="flex items-center cursor-pointer">
            <input
            type="checkbox"
            color='green'
            className="h-5 w-5 text-green-600 border-gray-300 rounded-lg focus:ring-green-500 cursor-pointer"
            checked={showIcProcessedConsultantsOnly}
            onChange={handleCheckboxChange} // Handle checkbox change
            />
            <span className="ml-2 text-sm text-white font-medium">Show Processed ICs Only</span>
        </label>
        </div>
        
    <div className="overflow-x-auto border rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                        <DataTable
                            value={groupedData}
                            rowClassName={customRowClassName}
                            selection={selectedRows}
                            onSelectionChange={handleSelectionChange}
                            className="text-left"
                            dataKey="id"
                            selectionMode="checkbox"
                            metaKeySelection={false}
                            paginator
                            rows={20}
                            filters={filters}
                            globalFilterFields={['rateWiseOrderNumber','consultant','client', 'rateCard', 'rateType']}
                            
                        >
                        
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} headerClassName="bg-gray-100" body={selectionBodyTemplate}></Column>
                            
                            <Column field="rateWiseOrderNumber" header="RO#" headerStyle={{ width: '1rem' }} body={rateWiseOrderNumberBodyTemplate} headerClassName={`bg-gray-100 pt-5 pb-5 pl-3 pr-2 border-r-2 ${filters.orderNumber?.value ? 'text-blue-600' : 'text-gray-800'}`} className="bg-white p-2 w-50 text-nowrap"
                             filter
                             filterElement={filterHeaderTemplate({ header: 'Rate Wise Order Number' }, 'rateWiseOrderNumber')}
                             showFilterMatchModes={false}
                            ></Column>
                            <Column field="consultant" header="Consultant" headerStyle={{ width: '13rem' }} body={consultantBodyTemplate} 
                            headerClassName={`bg-gray-100 pt-5 pb-5 pl-3 pr-2 border-r-2 ${filters.consultant?.value ? 'text-blue-600' : 'text-gray-800'}`} 
                            className="bg-white p-2 w-fit text-nowrap"
                            filter
                            filterElement={filterHeaderTemplate({ header: 'Consultant' }, 'consultant')}
                            showFilterMatchModes={false}
                            
                            ></Column>
                            <Column field="client" header="Client"  headerStyle={{ width: '13rem' }} body={clientBodyTemplate} 
                            headerClassName={`bg-gray-100 pt-5 pb-5 pl-3 pr-2 border-r-2 ${filters.client?.value ? 'text-blue-600' : 'text-gray-800'}`} 
                            className="bg-white p-2 w-fit text-nowrap"
                            filter
                            filterElement={filterHeaderTemplate({ header: 'Client' }, 'client')}
                            showFilterMatchModes={false}
                            
                            ></Column>
                            <Column field="rateCard" header="Rate Card"  headerStyle={{ width: '13rem' }} body={scanBodyTemplate} headerClassName={`bg-gray-100 pt-5 pb-5 pl-3 pr-2 border-r-2 ${filters.rateCard?.value ? 'text-blue-600' : 'text-gray-800'}`} className="bg-white p-2 w-50 text-nowrap"
                            filter
                            filterElement={filterHeaderTemplate({ header: 'Rate Card' }, 'rateCard')}
                            showFilterMatchModes={false}
                            showApplyButton={false}
                            showClearButton={false}
                            
                            ></Column>
                            <Column field="rateType" header="Rate Type"  headerStyle={{ width: '13rem' }} body={scanTypeBodyTemplate} headerClassName={`bg-gray-100 pt-5 pb-5 pl-3 pr-2 border-r-2 ${filters.rateType?.value ? 'text-blue-600' : 'text-gray-800'}`} className="bg-white w-fit p-2"
                            filter
                            filterElement={filterHeaderTemplate({ header: 'Rate Type' }, 'rateType')}
                            showFilterMatchModes={false}
                            showApplyButton={false}
                            showClearButton={false}
                            ></Column>
                            <Column field="price" header="Price" headerStyle={{ width: '13rem' }} body={priceBodyTemplate} headerClassName="bg-gray-100 text-gray-800 pt-5 pb-5 pl-2 pr-2" className="bg-white p-2 w-fit text-nowrap"
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
