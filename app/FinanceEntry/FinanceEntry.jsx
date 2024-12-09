'use client';
import './page.css';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreatableSelect from 'react-select/creatable';
import { CircularProgress, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import {MdClear, MdClearAll, MdOutlineSave, MdUploadFile} from "react-icons/md";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useAppSelector } from '@/redux/store';
import axios from 'axios';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { resetOrderData } from '@/redux/features/order-slice';
import { resetClientData } from '@/redux/features/client-slice';
import { useDispatch } from 'react-redux';
import { setIsOrderExist } from '@/redux/features/order-slice';
import FormData from 'form-data';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FetchFinanceSearchTerm } from '../api/FetchAPI';
import { generateBillPdf } from '../generatePDF/generateBillPDF';

const transactionOptions = [
  { value: 'Income', label: 'Income' },
  { value: 'Operational Expense', label: 'Operational Expense' }
];

const taxTypeOptions = [
  { value: 'GST', label: 'GST' },
  { value: 'IGST', label: 'IGST' },
  { value: 'NA', label: 'NA' }
];

const expenseCategoryOptions = [
  { value: 'Bank', label: 'Bank' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Commission', label: 'Commission' },
  { value: 'Consumables', label: 'Consumables' },
  { value: 'Conveyance', label: 'Conveyance' },
  { value: 'EB', label: 'EB' },
  { value: 'Maintainance', label: 'Maintainance' },
  { value: 'Offering', label: 'Offering' },
  { value: 'PC', label: 'PC' },
  { value: 'Project', label: 'Project' },
  { value: 'Promotion', label: 'Promotion' },
  { value: 'Rent', label: 'Rent' },
  { value: 'Laborcost', label: 'Labor Cost' },
  { value: 'Stationary', label: 'Stationary' },
  { value: 'Refund', label: 'Refund' }
];

const paymentModeOptions = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Online', label: 'Online' },
  { value: 'Cheque', label: 'Cheque' }
];

const FinanceData = () => {
  const orderData = useAppSelector(state => state.orderSlice);
  const { clientName: orderClientName, clientNumber: orderClientNumber ,maxOrderNumber: orderOrderNumber, rateWiseOrderNumber: nextRateWiseOrderNumber, remarks: orderRemarks } = orderData;
  // const username = "Grace Scans"
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const amountRef = useRef(null);
  const orderNumberRef = useRef(null);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const billNumberRef = useRef(null);
  // const dbName = "Grace Scans";
  // const companyName = "Baleen Test";
  const username = useAppSelector(state => state.authSlice.userName);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [anchorElDate, setAnchorElDate] = React.useState(null);
  const [billAnchorElDate, setBillAnchorElDate] = useState(null);
  const [anchorElChequeDate, setAnchorElChequeDate] = React.useState(null);
  const [bill, setBill] = useState(null);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(dayjs());
  // const [orderNumber, setOrderNumber] = useState(null);
  // const [clientName, setClientName] = useState(null);
  // const [orderAmount, setOrderAmount] = useState(null);
  // const [remarks, setRemarks] = useState(null);
  const [clientName, setClientName] = useState(orderClientName || '');
  const [clientNumber, setClientNumber] = useState(orderClientNumber || '');
  const [orderNumber, setOrderNumber] = useState(orderOrderNumber || 0);
  const [rateWiseOrderNumber, setRateWiseOrderNumber] = useState(nextRateWiseOrderNumber || '');
  const [orderAmount, setOrderAmount] = useState('');
  const [remarks, setRemarks] = useState(orderRemarks || '');
  const [taxType, setTaxType] = useState(taxTypeOptions[2]);
  const [gstAmount, setGSTAmount] = useState(null);
  const [gstPercentage, setGSTPercentage] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState(expenseCategoryOptions[0]);
  const [transactionDate, setTransactionDate] = useState(dayjs());
  const [transactionTime, setTransactionTime] = useState(dayjs());
  const [paymentMode, setPaymentMode] = useState(paymentModeOptions[0]);
  const [transactionType, setTransactionType] = useState(transactionOptions[0]);
  const [ordersData, setOrdersData] = useState(null);
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState(dayjs());
  const [chequeTime, setChequeTime] = useState(dayjs());
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  // const [isOrderExist, setIsOrderExist] = useState(false);
  const [billsOnly, setBillsOnly] = useState(false);
  const isOrderExist = useAppSelector(state => state.orderSlice.isOrderExist);
  const router = useRouter();
  const dispatch = useDispatch();
  const [elementsToHide, setElementsToHide] = useState([]);
  const [financeSearchSuggestion, setFinanceSearchSuggestion] = useState([]);
  const [financeSearchTerm,setFinanceSearchTerm] = useState("");
  const [financeId, setFinanceId] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [amount, setAmount] = useState('');
  const [displayClientName, setDisplayClientName] = useState(clientName);
  const [financeClientID, setFinanceClientID] = useState('');
  const [financeAmount, setFinanceAmount] = useState('');
  const [prevData, setPrevData] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [rateName, setRateName] = useState('');
  const [rateType, setRateType] = useState('');
  const [adjustedOrderAmount, setAdjustedOrderAmount] = useState(0);
  const [waiverAmount, setWaiverAmount] = useState(0);
  const [receivableAmount, setReceivableAmount] = useState(0);
  const [previousPaymentMode, setPreviousPaymentMode] = useState('');
  const [previousAmountPaid, setPreviousAmountPaid] = useState(0);
  const [isDownloadInvoiceChecked, setIsDownloadInvoiceChecked] = useState(false);

  useEffect(() => {
    if(dbName){
    elementsToHideList();
    const fetchSubscriptions = async () => {
      try {
        const data = await fetchInvoiceData();
        setInvoiceData(data);
      } catch (err) {
        console.error("Error Fetching Invoice Data: " + err)
      }
    };

    fetchSubscriptions();
    }
  },[dbName])

  useEffect(() => {
    if (!username || dbName === "") {
      router.push('/login');
    }
  },[])
  useEffect(() => {
    // Use the orderData values to initialize the state
    setClientName(orderClientName || '');
    setClientNumber(orderClientNumber || '');
    setOrderNumber(orderOrderNumber || '');
    // setRemarks(orderRemarks || '')
    setRateWiseOrderNumber(nextRateWiseOrderNumber || '')
    fetchClientDetails(orderClientNumber, orderClientName);
  }, [orderClientName, orderOrderNumber, orderRemarks, orderClientNumber, nextRateWiseOrderNumber]);


  const formattedTransactionDate = transactionDate.format('YYYY-MM-DD');
  const transactionDateFormatted = transactionDate.format('DD-MMM-YY');
  //const formattedChequeDate = chequeDate.format('YYYY-MM-DD');

  const year = transactionDate.$y;
  const month = transactionDate.$M + 1; // Months are zero-based, so we add 1 to get the correct month
  const day = transactionDate.$D;
  const hours = transactionTime.$H;
  const minutes = transactionTime.$m;
  const seconds = transactionTime.$s;
  
  const formattedBillDate = billDate.format('DD-MMM-YY');
  //const formattedChequeDate = chequeDate.format('YYYY-MM-DD');

  // Assuming chequeTime is a dayjs object like transactionTime
const chequeHours = chequeTime.$H;
const chequeMinutes = chequeTime.$m;
const chequeSeconds = chequeTime.$s;

const formattedChequeTime = `${chequeHours < 10 ? '0' : ''}${chequeHours}:${chequeMinutes < 10 ? '0' : ''}${chequeMinutes}:${chequeSeconds < 10 ? '0' : ''}${chequeSeconds}`;

// Extract year, month, and day from chequeDate
const chequeYear = chequeDate.$y;
const chequeMonth = chequeDate.$M + 1; // Months are zero-based, so add 1
const chequeDay = chequeDate.$D;

// Format the date as YYYY-MM-DD
const formattedChequeDate = `${chequeYear}-${chequeMonth < 10 ? '0' : ''}${chequeMonth}-${chequeDay < 10 ? '0' : ''}${chequeDay}`;

  const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  // Handle Transaction Date popover
const handleDateClick = (event) => {
  setAnchorElDate(event.currentTarget);
};

const handleDateClose = () => {
  setAnchorElDate(null);
};

// Handle Cheque Date popover
const handleChequeDateClick = (event) => {
  setAnchorElChequeDate(event.currentTarget);
};

const handleChequeDateClose = () => {
  setAnchorElChequeDate(null);
};

// Open state for both popovers
const openDate = Boolean(anchorElDate);
const openChequeDate = Boolean(anchorElChequeDate);



  const handleChange = (selectedOption, name) => {
    switch(name) {
      case 'TransactionTypeSelect':
        setTransactionType(selectedOption);
        break;
      case 'TaxTypeSelect':
        setTaxType(selectedOption);
        break;
      case 'ExpenseCategorySelect':
        setExpenseCategory(selectedOption);
        break;
      case 'PaymentModeSelect':
        setPaymentMode(selectedOption);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
    elementsToHideList()
  };

  const fetchInvoiceData = async () => {
    try {
      const response = await fetch('https://orders.baleenmedia.com/API/Hospital-Form/FetchKeys.php?JsonDBName=Grace Scans');
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error('Failed to fetch active subscriptions:', error.message);
      throw error;
    }
  };

  const handleClientNameTermChange = (event) => {
    const newName = event.target.value
    
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNamesFinance.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setClientNameSuggestions(data));
        setClientName(newName);
    } catch(error){
      console.error("Error Suggesting Client Names: " + error)
    }
    // MP-96-As a user, I want the validation to go away while filling the details.
    if (errors.clientName) {
      setErrors((prevErrors) => ({ ...prevErrors, clientName: undefined }));
    }
  };  

  const handleClientNameSelection = (e) => {
    const input = e.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

    setClientNameSuggestions([]);
    setClientName(name);
    setClientNumber(number);
    fetchClientDetails(number, name);

  };

  const fetchClientDetails = (clientNumber, clientName) => {
    axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsFromOrderTable.php?ClientContact=${clientNumber}&ClientName=${clientName}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const clientDetails = data[0];
          dispatch(setIsOrderExist(true));
          setOrderNumber(clientDetails.orderNumber);
          setRateWiseOrderNumber(clientDetails.rateWiseOrderNumber);
          //setRemarks(clientDetails.remarks);
          setOrderAmount(clientDetails.balanceAmount);
          setBalanceAmount(clientDetails.balanceAmount);
          setGSTPercentage(clientDetails.gstPercentage);
          setRateName(clientDetails.rateName);
          setRateType(clientDetails.rateType);
          setAdjustedOrderAmount(clientDetails.adjustedOrderAmount);
          setWaiverAmount(clientDetails.waiverAmount);
          setReceivableAmount(clientDetails.receivableAmount);
          setPreviousPaymentMode(clientDetails.previousPaymentMode);
          setPreviousAmountPaid(clientDetails.previousAmountPaid);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }; 

  const SendSMSViaNetty = (clientNumber, clientName, orderAmount, paymentMode) => {


    if (!clientNumber || clientNumber === '0' || clientNumber === '' || !/^\d+$/.test(clientNumber)) {
        setToastMessage('SMS Not Sent! Reason: Phone Number is Unavailable');
              setSeverity('warning');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
        return; // Prevent the function from continuing if clientNumber is invalid
    }

    const sendableNumber = `91${clientNumber}`;
    let message;
    if (paymentMode === 'Cash') {
        message = `Hi, Your payment of Rs. ${orderAmount ? orderAmount : 0} received as Cash by Grace Scans.`;
    } else if (paymentMode === 'Online') {
        message = `Hi, Your payment of Rs. ${orderAmount ? orderAmount : 0} received by Grace Scans in Bank A/c.`;
    } else {
        message = `Hi, Your payment of Rs. ${orderAmount ? orderAmount : 0} received by Grace Scans. Thank You.`;
    }
    const encodedMessage = encodeURIComponent(message);
    
    axios
      .get(`https://orders.baleenmedia.com/API/Media/SendSmsNetty.php?JsonNumber=${sendableNumber}&JsonMessage=${encodedMessage}&JsonConsultantName=&JsonConsultantNumber=&JsonDBName=${companyName}`)
      .then((response) => {

        const result = response.data;
        if (result === "SMS Sent but Consultant details are missing.") {
          // Success Case
          setSuccessMessage('SMS Sent!');
          setTimeout(() => {
            setSuccessMessage('');
          }, 1500);
        } else {
          // Error Case
          setToastMessage(`SMS Not Sent! Reason: ${result}`);
          setSeverity('warning');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
        }
    })

      .catch((error) => {
        console.error(error);
      });
    
  };


  const SendSMS = (clientNumber, orderAmount, rateWiseOrderNumber) => {

    // Ensure clientNumber is valid
    if (!clientNumber || clientNumber === '0' || clientNumber === '' || !/^\d+$/.test(clientNumber)) {
        setToastMessage('SMS Not Sent! Reason: Phone Number is Unavailable');
              setSeverity('warning');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
        return; // Prevent the function from continuing if clientNumber is invalid
    }

    const sendableNumber = `91${clientNumber}`;
    const sender = 'BALEEN';
    const message = `Your payment of Rs. ${orderAmount ? orderAmount : 0} paid against WO# ${rateWiseOrderNumber} is received by Baleen Media Finance team. Thanks for your Payment. - Baleen Media`
    const encodedMessage = encodeURIComponent(message);
    

    axios
      .get(`https://orders.baleenmedia.com/API/Media/SendSms.php?JsonPhoneNumber=${sendableNumber}&JsonSender=${sender}&JsonMessage=${encodedMessage}`)
      .then((response) => {

        const responseData = JSON.parse(response.data);

        if (responseData.status === 'success') {
            setSuccessMessage('SMS Sent!');
              setTimeout(() => {
            setSuccessMessage('');
          }, 1500);
        } else {
            setToastMessage('SMS Not Sent! Reason', responseData.message);
              setSeverity('warning');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
        }
    })

      .catch((error) => {
        console.error(error);
      });
    
  }; 



  const handleOrderNumberChange = (event) => {
    
    const newOrderNumber = event.target.value.replace(/[^\d,]/g, '');
    setOrderNumber(newOrderNumber);
    
    {!billsOnly &&
    axios
    .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsFromOrderTableUsingOrderNumber.php?OrderNumber=${newOrderNumber}&JsonDBName=${companyName}`)
    .then((response) => {
      const data = response.data;
      if (data.length > 0) {
        const clientDetails = data[0];
        dispatch(setIsOrderExist(true));
        //setRemarks(clientDetails.remarks);
        setOrderAmount(clientDetails.balanceAmount);
        setGSTPercentage(clientDetails.gstPercentage);
        setClientName(clientDetails.clientName);
        setClientNumber(clientDetails.clientContact);
        setBalanceAmount(clientDetails.balanceAmount);
        setRateWiseOrderNumber(clientDetails.rateWiseOrderNumber);
        setRateName(clientDetails.rateName);
        setRateType(clientDetails.rateType);
        setAdjustedOrderAmount(clientDetails.adjustedOrderAmount);
        setWaiverAmount(clientDetails.waiverAmount);
        setReceivableAmount(clientDetails.receivableAmount);
        setPreviousPaymentMode(clientDetails.previousPaymentMode);
        setPreviousAmountPaid(clientDetails.previousAmountPaid);
      } else {
        dispatch(setIsOrderExist(false));
      }
    })
    .catch((error) => {
      console.error(error);
    });
    // Clear validation errors
    if (errors.orderNumber) {
      setErrors((prevErrors) => ({ ...prevErrors, orderNumber: undefined }));
    }
  }
  };

  const handleRateWiseOrderNumberChange = (event) => {
    
    const newOrderNumber = event.target.value.replace(/[^\d,]/g, '');

    setRateWiseOrderNumber(newOrderNumber);
    {!billsOnly && axios
    .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsFromOrderTableUsingRateWiseOrderNumber.php?RateWiseOrderNumber=${newOrderNumber}&JsonDBName=${companyName}`)
    .then((response) => {
      const data = response.data;
      if (data.length > 0) {
        const clientDetails = data[0];
        dispatch(setIsOrderExist(true));
        setRemarks(clientDetails.remarks);
        setOrderAmount(clientDetails.balanceAmount);
        setGSTPercentage(clientDetails.gstPercentage);
        setClientName(clientDetails.clientName);
        setClientNumber(clientDetails.clientContact);
        setBalanceAmount(clientDetails.balanceAmount);
        setOrderNumber(clientDetails.orderNumber);
        setRateName(clientDetails.rateName);
        setRateType(clientDetails.rateType);
        setAdjustedOrderAmount(clientDetails.adjustedOrderAmount);
        setWaiverAmount(clientDetails.waiverAmount);
        setReceivableAmount(clientDetails.receivableAmount);
        setPreviousPaymentMode(clientDetails.previousPaymentMode);
        setPreviousAmountPaid(clientDetails.previousAmountPaid);
      } else {
        dispatch(setIsOrderExist(false));
      }
    })
    .catch((error) => {
      console.error(error);
    });
    // Clear validation errors
    if (errors.orderNumber) {
      setErrors((prevErrors) => ({ ...prevErrors, orderNumber: undefined }));
    }}
  };

  useEffect(()=>{
    if(transactionType.value === 'Operational Expense' && expenseCategory.value !== 'Project'){
      setOrderNumber(0);
      setRateWiseOrderNumber(0);
    }
    if(transactionType.value === 'Income'){
      setBillsOnly(false);
    }

  },[transactionType])


  const handleUploadBills = async () => {
    // Format bill date
    var orderNumberToBeUploaded = !elementsToHide.includes("RateWiseOrderNumberText") ? rateWiseOrderNumber : orderNumber
 
    const formattedBillDate = billDate.format("YYYY-MM-DD");
    const orderNumberArray = (parseInt(orderNumberToBeUploaded))
      ? orderNumberToBeUploaded.split(",").map(num => parseFloat(num.trim())) 
      : null;

    // // Function to create FormData
    const createFormData = (orderNum, isNotUploaded) => {
      const formData = new FormData();
      formData.append("JsonFile", bill);
      formData.append("JsonCompanyName", companyName);
      formData.append("JsonEntryUser", username);
      formData.append("JsonBillNumber", billNumber);
      formData.append("JsonBillDate", formattedBillDate);
      formData.append("JsonOrderNumber", orderNum);
      formData.append("JsonOrderAmountExclGST", orderAmount - gstAmount);
      formData.append("JsonGSTAmount", gstAmount);
      formData.append("JsonIsNotUploaded", isNotUploaded);
      return formData;
    };
  
    // // Function to send data
    const uploadBill = async (formData) => {
      try {
        const response = await axios.post(
          "https://orders.baleenmedia.com/API/Media/UploadExpenseBills.php",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        // setSuccessMessage("Bills Uploaded Successfully!")
        
      } catch (error) {
        console.error("Error uploading record:", error);
      }
    };
  
    // // Handle upload logic
    if (!orderNumberArray) {
      const formData = createFormData(orderNumberToBeUploaded, true);
      await uploadBill(formData);
    } else {
      let isNotUploaded = true;
      setToastMessage(<span>
        <CircularProgress size={20} style={{ marginRight: "8px" }} />
        {`Please wait while we are uploading your bills for ${orderNumberArray.length} Orders`}
      </span>);
      setSeverity('warning');
      setToast(true);
      for (const number of orderNumberArray) {
        const formData = createFormData(number, isNotUploaded);
        await uploadBill(formData);
        isNotUploaded = false; // Only the first record is marked as "not uploaded"
      }
      setToast(false);
      setSuccessMessage("Bill added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  
  const sendDataToPdf = () => {
    const PDFData = {
      companyName: invoiceData.SubscriberName,
      companyLogoPath: invoiceData.SubscriberLogoPath,
      companyWatermarkLogoPath: invoiceData.SubscriberWatermarkPath,
      companyStreetAddress: invoiceData?.SubscriberStreetAddress || "Not Provided",
      companyAreaAddress: invoiceData?.SubscriberAreaAddress || "",
      companyPincodeAddress: invoiceData?.SubscriberPincodeAddress || "",
      companyEmailAddress: invoiceData?.SubscriberEmailAddress || "",
      companyTelephoneNumber: invoiceData?.SubscriberTelephoneNumber || "",
      companyContactNumber: invoiceData?.SubscriberContactNumber || "",
      companyWebsiteURL: invoiceData?.SubscriberWebsiteURL || "",
      customerName: clientName,
      customerContact: (clientNumber === 0 || clientNumber === '0' || clientNumber === null || clientNumber === "") ? 
      "Contact number not provided" : clientNumber,
      customerAddress: "Chennai",
      invoiceNumber: orderNumber,
      refNumber: rateWiseOrderNumber || "N/A",
      date: dayjs(transactionDate).format("MMMM D, YYYY"),
      items: [
        {
          description: `${rateName || ""} - ${rateType || ""}`,
          qty: 1,
          price: receivableAmount,
          total: receivableAmount,
        },
      ],
      subtotal: receivableAmount || 0,  // Ensure subtotal is always a number
      // Discount can be negative (e.g., Rs. -1500) and it should be added to the total amount
      discount: (parseFloat(adjustedOrderAmount) || 0) + (parseFloat(waiverAmount) || 0), // Ensure valid numbers
      // Total is receivableAmount + discount, where discount can be negative
      total: (parseFloat(receivableAmount) || 0) + ((parseFloat(adjustedOrderAmount) || 0) + (parseFloat(waiverAmount) || 0)),
      previousAmountPaid: (previousAmountPaid !== null && previousAmountPaid !== undefined && previousAmountPaid !== ""
        ? parseFloat(previousAmountPaid)
        : 0),
      paid: (parseFloat(orderAmount) || 0),    
      // paid: (parseFloat(orderAmount) || 0) +
      // (previousAmountPaid !== null && previousAmountPaid !== undefined && previousAmountPaid !== ""
      //     ? parseFloat(previousAmountPaid)
      //     : 0),  // Ensure paid is a number
      // Amount Due is the difference between total and paid amount
      amountDue: isUpdateMode
      ?  
        (((parseFloat(receivableAmount) || 0) +
          ((parseFloat(adjustedOrderAmount) || 0) + (parseFloat(waiverAmount) || 0))) - ((parseFloat(previousAmountPaid) || 0) +
          (parseFloat(orderAmount) || 0)))
      : (parseFloat(balanceAmount) || 0) - (parseFloat(orderAmount) || 0),
      paymentMethod: previousPaymentMode && previousPaymentMode !== paymentMode.value
      ? Array.from(new Set([...previousPaymentMode.split(',').map(item => item.trim()), paymentMode.value])).join(', ') 
      : paymentMode.value,
    };
    

    generateBillPdf(PDFData);
};
  

  const insertNewFinance = async (e) => {
    e.preventDefault();

    var orderNumberToBeUploaded = !elementsToHide.includes("RateWiseOrderNumberText") ? rateWiseOrderNumber : orderNumber

    if(billsOnly){
      if(!bill){
        setToastMessage("Please upload a Bill!");
        setSeverity('error');
        setToast(true);
        setTimeout(() => {
          setToast(false);
        }, 3000);
        return;
      }else if(!expenseCategory){
        setErrors((prevErrors) => ({...prevErrors, expenseCategory: "Select an Expense Category!"}));
        return;
      }else if(orderAmount === 0 || orderAmount === ""){
        setErrors((prevErrors) => ({...prevErrors, orderAmount: "Enter a valid Order Amount"}));
        amountRef?.current.focus();
        return;
      }else if(bill && billNumber === ''){
        setErrors((prevErrors) => ({...prevErrors, billNumber: "Enter a valid bill number"}));
        billNumberRef?.current.focus();
        return;
      }else if((orderNumberToBeUploaded === "" || parseInt(orderNumberToBeUploaded) === 0) && expenseCategory?.value === 'Project'){
        setErrors((prevErrors) => ({...prevErrors, orderNumber: "Order Number is required for Project Category!"}));
        orderNumberRef?.current.focus();
        return;
      }else{
        await handleUploadBills();
        setBill(null);
        setClientName('');
        setErrors({})
        setExpenseCategory('');
        setGSTAmount('');
        setOrderAmount('');
        setOrderNumber('');
        setBillNumber("");
        setBillDate(dayjs());
        setRateWiseOrderNumber('');
        setTaxType(taxTypeOptions[2]);
        setTransactionType(transactionOptions[0]);
        dispatch(resetOrderData());
        dispatch(resetClientData());
        return;
      }
    }

    if (!isOrderExist && !expenseCategory) {
      setToastMessage('Order Number does not exist!');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return;
    }
    if (balanceAmount === 0 || balanceAmount < 0) {
      setToastMessage('Full payment has already been received!');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return;
    } else if(orderNumber === "" || isNaN(orderNumber)){
      // orderNumber?.current.focus()
      setErrors((prevErrors) => ({ ...prevErrors, orderNumber: "Please enter an valid Order Number!" }));
      return;
    }else if(isNaN(parseInt(orderAmount)) || orderAmount === "0"){
      orderAmount?.current.focus()
      setErrors((prevErrors) => ({...prevErrors, orderAmount: "Please enter an valid Order Amount!"}));
      return;
    }else if(bill && billNumber === ""){
      setErrors((prevErrors) => ({...prevErrors, billNumber: "Enter a valid bill number"}));
      billNumberRef?.current.focus()
      return;
    }else {

    if (validateFields()) {
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewFinanceEntry.php/?JsonTransactionType=${transactionType ? transactionType.value : ''}&JsonEntryUser=${username ? username : ''}&JsonOrderNumber=${orderNumber ? orderNumber : ''}&JsonOrderAmount=${orderAmount ? orderAmount : ''}&JsonTaxType=${taxType ? taxType.value : ''}&JsonGSTAmount=${gstAmount ? gstAmount : ''}&JsonExpenseCategory=${expenseCategory ? expenseCategory.value : ''}&JsonRemarks=${remarks ? remarks : ''}&JsonTransactionDate=${formattedDate + ' ' + formattedTime}&JsonPaymentMode=${paymentMode ? paymentMode.value : ''}&JsonChequeNumber=${chequeNumber ? chequeNumber : ''}&JsonChequeDate=${formattedChequeDate + ' ' + formattedChequeTime}&JsonDBName=${companyName}&JsonRateWiseOrderNumber=${rateWiseOrderNumber}&JsonClientName=${clientName}`);
          const data = await response.json();
          if (data === 'Inserted Successfully!') {
            setSuccessMessage('Finance Entry Added');
              setTimeout(() => {
            setSuccessMessage('');

            if (transactionType && transactionType.value === "Income") {
              if (elementsToHide.includes("RateWiseOrderNumberText")) {
                //BM
                  SendSMS(clientNumber, orderAmount, rateWiseOrderNumber);
              } else if (elementsToHide.includes("OrderNumberText")) {
                SendSMSViaNetty(clientNumber, clientName, orderAmount, paymentMode.value);
                if (isDownloadInvoiceChecked) {
                  sendDataToPdf();
                }
              } else {
                setToastMessage('SMS Not Sent! Reason: No Database Found.');
                setSeverity('warning');
                setToast(true);
                setTimeout(() => {
                  setToast(false);
                }, 2000);
              }
          }

          }, 1000);
        }
        if(transactionType && transactionType.value === "Operational Expense"){
          handleUploadBills();
          setBill(null);
        }
          
          // showToastMessage('success', data);
          setChequeNumber('');;
          setClientName('');
          setExpenseCategory('');
          setGSTAmount('');
          setGSTPercentage('');
          setOrderAmount('');
          setOrderNumber('');
          setRateWiseOrderNumber('');
          setPaymentMode(paymentModeOptions[0]);
          setRemarks('');
          setTaxType(taxTypeOptions[2]);
          setTransactionType(transactionOptions[0]);
          dispatch(resetOrderData());
          dispatch(resetClientData());
          // window.location.reload();
          cancelFinance();
          
    
      } catch (error) {
          console.error(error);
      }
      
    } else {
      setToastMessage('Please fill the necessary details in the form.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
         
  }
}

const elementsToHideList = () => {
  try{
    fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
      .then((response) => response.json())
      .then((data) => setElementsToHide(data));
  } catch(error){
    console.error("Error showing element names: " + error)
  }
}


useEffect(() => {
  //searching elements to Hide from database

  elementsToHide.forEach((name) => {
    const elements = document.getElementsByName(name);
    elements.forEach((element) => {
      element.style.display = 'none'; // Hide the element
    });
  });
}, [elementsToHide])

  // const getOptions = (filterKey, selectedValues) => {
  //   const filteredData = ordersData.filter(item => {
  //     return Object.entries(selectedValues).every(([key, value]) =>
  //       key === filterKey || !value || item[key] === value.value
  //     );
  //   });

  //   const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  //   return distinctValues.sort().map(value => ({ value, label: value }));
  // };
  

  const validateFields = () => {
    let errors = {};

    if (!transactionType) errors.transactionType = 'Transaction Type is required';
    if (transactionType?.value === 'Operational Expense' && !expenseCategory) {
      errors.expenseCategory = 'Expense Category is required';
    }
    if (transactionType?.value !== 'Operational Expense' && !clientName) {
      errors.clientName = 'Client Name is required';
    }
    if ((!orderNumber || isNaN(orderNumber) ) && !expenseCategory ) errors.orderNumber = 'Order Number is required';
    // if (!orderAmount || isNaN(orderAmount)) errors.orderAmount = 'Valid Amount is required';
    if (!taxType) errors.taxType = 'Tax Type is required';
    // if (taxType?.value === 'GST' && (!gstPercentage || isNaN(gstPercentage))) {
    //   errors.gstPercentage = 'Valid GST % is required';
    // }
    // if (taxType?.value === 'GST' && !gstAmount) {
    //   errors.gstAmount = 'GST Amount is required';
    // }
    if (!transactionDate) {
      errors.transactionDate = 'Transaction Date is required';
    } else if (!dayjs(transactionDate).isValid()) {
      errors.transactionDate = 'Invalid Transaction Date';
    } else if (dayjs(transactionDate).isAfter(dayjs(), 'day')) {
      errors.transactionDate = 'Transaction Date cannot be in the future';
    }
    
    if (!transactionTime) errors.transactionTime = 'Transaction Time is required';
    if (!chequeTime) errors.chequeTime = 'Transaction Time is required';
    if (!paymentMode) errors.paymentMode = 'Payment Mode is required';
    if (paymentMode?.value === 'Cheque' && !chequeNumber) {
      errors.chequeNumber = 'Cheque Number is required';
    }
    if (paymentMode?.value === 'Cheque' && !chequeDate) {
      errors.chequeDate = 'Cheque Date is required';
    } else if (chequeDate && dayjs(chequeDate).isAfter(dayjs())) {
      errors.chequeDate = 'Cheque Date cannot be in the future';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const cancelFinance = (e) => {
          setChequeNumber('');
          setClientName('');
          setExpenseCategory('');
          setGSTAmount('');
          setGSTPercentage('');
          setOrderAmount('');
          setOrderNumber('');
          setRateWiseOrderNumber('');
          setPaymentMode(paymentModeOptions[0]);
          setRemarks('');
          setTaxType(taxTypeOptions[2]);
          setTransactionType(transactionOptions[0]);
          dispatch(resetOrderData());
          setFinanceSearchTerm('');
          setIsUpdateMode(false);
          setTransactionDate(dayjs()); 
          setDisplayClientName('');
          setRateName('');
          setRateType('');
          setAdjustedOrderAmount(0);
          setWaiverAmount(0);
          setReceivableAmount(0);
          setPreviousPaymentMode('');
          setPreviousAmountPaid(0);
          setBalanceAmount(0);
          setIsDownloadInvoiceChecked(false);

  };
  const handleFileChange = (e) => {

    const file = e.target.files[0]
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024); // Convert file size to MB

      if (fileSizeMB > 10) {
        alert('File size should not be more than 10 MB. File not Uploaded!');
        return;
      }else{
        setBill(file);
      }
    } 
  };

 const handleFinanceSearch = async (e) => {
  const searchTerm = e.target.value;
  setFinanceSearchTerm(searchTerm);

  // If search term is cleared, reset the update mode
  if (searchTerm.trim() === "") {
    setIsUpdateMode(false); // Reset update mode
      setChequeNumber('');
          setClientName('');
          setExpenseCategory('');
          setGSTAmount('');
          setGSTPercentage('');
          setOrderAmount('');
          setOrderNumber('');
          setRateWiseOrderNumber('');
          setPaymentMode(paymentModeOptions[0]);
          setRemarks('');
          setTaxType(taxTypeOptions[2]);
          setTransactionType(transactionOptions[0]);
          dispatch(resetOrderData());
          setFinanceSearchTerm('');
    setFinanceSearchSuggestion([]); // Clear suggestions
    return; // Exit early
  }

  const searchSuggestions = await FetchFinanceSearchTerm(companyName, searchTerm);
  setFinanceSearchSuggestion(searchSuggestions);
};

  const handleFinanceId = async (financeId, companyName) => {
    try {
      let savedOrderAmount;
      const response = await axios.get(`https://orders.baleenmedia.com/API/Media/FetchFinanceCategory.php?JsonFinanceId=${financeId}&JsonDBName=${companyName}`);
      
      const data = response.data;
  
      if (data === "Finance ID is rejected") {
        console.error("Finance ID is rejected");
      } else if (data === "No finance details found for the provided ID") {
        console.error("No finance details found for the provided ID");
      } else {
        const transactionDate = data.TransactionDate ? dayjs(data.TransactionDate) : dayjs();
        const chequeDate = data.ChequeDate ? dayjs(data.ChequeDate) : null;
        const paymentMode = paymentModeOptions.find(option => option.value === data.PaymentMode) || paymentModeOptions[0];
        const transactionType = transactionOptions.find(option => option.value === data.TransactionType) || transactionOptions[0];
        const expenseCategory = expenseCategoryOptions.find(option => option.value === data.ExpensesCategory) || expenseCategoryOptions[0];
        const taxType = taxTypeOptions.find(option => option.value === data.TaxType) || taxTypeOptions[0];

        // Set the previous data for comparison in the update function
        setPrevData({
          clientName: data.ClientName,
          orderAmount: data.Amount,
          remarks: data.Remarks,
          taxType,
          transactionDate,
          paymentMode,
          transactionType,
          expenseCategory,
          chequeDate,
          chequeNumber: data.ChequeNumber
        });

        // Populate state fields with the response data
        setOrderNumber(data.OrderNumber);
        setRateWiseOrderNumber(data.RateWiseOrderNumber);
        setOrderAmount(data.Amount);
        setRemarks(data.Remarks);
        setTaxType(taxType);
        setTransactionDate(transactionDate);
        setPaymentMode(paymentMode);
        setChequeDate(chequeDate);
        setChequeNumber(data.ChequeNumber);
        setFinanceClientID(data.ID);
        setFinanceAmount(data.Amount);
        setGSTAmount(data.TaxAmount);

        savedOrderAmount = parseFloat(data.Amount) || 0;

        if ( data.TransactionType === 'Project Expense') {
          setTransactionType({value: 'Operational Expense', label: 'Operational Expense'});
          setExpenseCategory({ value: 'Project', label: 'Project' });
        } else {
          setTransactionType(transactionType);
          setExpenseCategory(expenseCategory);
        }
      }

      try {
        const clientResponse = await axios.get(`https://orders.baleenmedia.com/API/Media/FetchClientDetailsFromOrderTableUsingOrderNumber.php?OrderNumber=${data.OrderNumber}&JsonDBName=${companyName}`);
        const clientData = clientResponse.data;
        setClientName(clientData[0].clientName);
        setDisplayClientName(clientData[0].clientName);
        setRateName(clientData[0].rateName);
        setRateType(clientData[0].rateType);
        setAdjustedOrderAmount(clientData[0].adjustedOrderAmount);
        setWaiverAmount(clientData[0].waiverAmount);
        setReceivableAmount(clientData[0].receivableAmount);
        setPreviousPaymentMode(clientData[0].previousPaymentMode);
        setBalanceAmount(((parseFloat(clientData[0].balanceAmount) || 0) + (parseFloat(clientData[0].previousAmountPaid) || 0)) - (savedOrderAmount || 0));
        setPreviousAmountPaid((parseFloat(clientData[0].previousAmountPaid) || 0) - (savedOrderAmount || 0));
      } catch (clientError) {
        console.error("Error fetching client details:", clientError);
      }

    } catch (error) {
      console.error("Error fetching finance details:", error);
    }
};
  
  
  const handleFinanceSelection = (e) => {
    const selectedFinance = e.target.value;
  
    // Extract the selected Finance ID from the value (assuming it's in 'ID-name' format)
    const selectedFinanceId = selectedFinance.split('-')[0];
  
    // Clear finance suggestions and set the search term
    setFinanceSearchSuggestion([]);
    setFinanceSearchTerm(selectedFinance);
  
    // Call the handleFinanceId function with the selected ID
    handleFinanceId(selectedFinanceId, companyName);
  
    // Set the finance ID state
    setFinanceId(selectedFinanceId);

    // Set the mode to "Update"
    setIsUpdateMode(true);


  };
  
  const updateFinance = async () => {
    // Check if remarks are empty
    if (remarks.trim() === '') {
      setToastMessage('Remarks cannot be empty.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return; // Exit the function early if remarks are empty
    }
  
    const hasRemarksChanged = remarks.trim() !== prevData.remarks.trim();
  
    // Validate transaction date
    const transactionDateError = validateTransactionDate(transactionDate);
    
    if (transactionDateError) {
      setToastMessage(transactionDateError);
      setSeverity('error');
      setToast(true);
      setErrors((prevErrors) => ({
        ...prevErrors,
        transactionDate: transactionDateError, // Update the errors state
      }));
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return; // Exit if transaction date is invalid
    }
  
    // Check if there are any changes
    const hasChanges = (
      orderAmount !== prevData.orderAmount ||
      remarks.trim() !== prevData.remarks.trim() ||
      taxType.value !== prevData.taxType.value ||
      transactionDate.format('YYYY-MM-DD') !== dayjs(prevData.transactionDate).format('YYYY-MM-DD') ||
      paymentMode.value !== prevData.paymentMode.value ||
      transactionType.value !== prevData.transactionType.value ||
      expenseCategory.value !== prevData.expenseCategory.value ||
      formattedChequeDate !== dayjs(prevData.chequeDate).format('YYYY-MM-DD') ||
      chequeNumber !== prevData.chequeNumber
    );
  
    // Check if remarks haven't been changed and show popup
    if (!hasChanges) {
      setToastMessage('No changes have been made.');
      setSeverity('warning');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
      return; // Exit if no changes are detected
    }
  
    if (!hasRemarksChanged) {
      setToastMessage('Remarks need to be changed.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return; // Exit if remarks have not been changed
    }
  
    try {
      
      
      // Send the GET request with query parameters using axios
      const response = await axios.get(`https://www.orders.baleenmedia.com/API/Media/UpdateFinanceFields.php`, {
        params: {
          JsonFinanceId: financeId,
          JsonUserName: username,
          JsonAmount: orderAmount,
          JsonRemarks: remarks,
          JsonTaxType: taxType.value,
          JsonTransactionDate: formattedDate + ' ' + formattedTime,
          JsonPaymentMode: paymentMode.value,
          JsonTransactionType: transactionType.value,
          JsonExpenseCategory: expenseCategory.value,
          JsonChequeDate: formattedChequeDate + ' ' + formattedChequeTime,
          JsonClentName: clientName,
          JsonTaxAmount: gstAmount,
          JsonDBName: companyName,
          JsonOrderNumber: orderNumber,
          JsonRateWiseOrderNumber: rateWiseOrderNumber,
          JsonChequeNumber: chequeNumber
        }
      });
      // Check if the response is successful
      const data = response.data;
      if (data === "Values Updated Successfully!") {
        setSuccessMessage('Finance record updated successfully!');
  
        // Clear the success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000); // 3000 milliseconds = 3 seconds

        if (elementsToHide.includes("OrderNumberText") && isDownloadInvoiceChecked) {
          sendDataToPdf();
        }

        // Clear form fields and switch to normal mode if needed
        setFinanceSearchTerm('');
        setRateWiseOrderNumber('');
        setIsUpdateMode(false);
        cancelFinance();
      } else {
        alert(`Error updating finance data: ${data}`);
      }
    } catch (error) {
      console.error('Error updating finance:', error);
      // Alert the user in case of error
      alert('An error occurred while updating the finance record.');
    }
  };
  

  
 const validateTransactionDate = (newDate) => {
  if (!newDate) {
    return 'Transaction Date is required';
  } else if (dayjs(newDate).isAfter(dayjs(), 'day')) {
    return 'Transaction Date cannot be in the future';
  }
  return ''; // No error
};

const handleGSTChange = (e) => {
  const gstPer = parseFloat(e); // GST percentage
  const gst = (orderAmount * gstPer) / 100; // Calculate GST amount
  setGSTAmount(gst); // Update GST amount
};

useEffect(() => {
  if(parseFloat(gstPercentage) > 0 ){
    handleGSTChange(gstPercentage)
  }
},[orderAmount, gstPercentage])

const handleGSTAmountChange = (gst) => {
  const amount = gst.target.value
  const gstPer = (amount / orderAmount) * 100; // Calculate GST percentage
  setGSTPercentage(gstPer); // Update GST percentage
};

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 mb-14 p-4">
        <div className="max-w-6xl w-full align-middle">
  <div className="flex items-center justify-between top-0 z-10 sticky bg-gray-100">
    
      <div >
        <h2 className="text-lg md:text-2xl ml-4 lg:text-3xl font-bold text-blue-500">Finance Manager</h2>
        <div className="border-2 w-10 ml-4 inline-block border-blue-500 mb-2"></div>
        
        {/* <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4">Add your rates here</p> */}
      </div>
      
      <div className="flex items-center mt-2 justify-center mb-2">
      {!isUpdateMode && (
    <button className="cancel-button" onClick={cancelFinance}>
      Clear
    </button>
  )}

  <button
    className="Add-button ml-2"
    onClick={isUpdateMode ? updateFinance : insertNewFinance}
  >
    
    {isUpdateMode ? 'Update' : 'Add'} 
  </button>
</div>

      </div>
      
      <div className="flex flex-col sm:flex-row justify-center mx-auto mb-4 pt-3 sm:pt-7 mt-4">
      
  {/* Search Input Section */}
  <div className="w-full sm:w-1/2">
    
    <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
      <input
        className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0"
        type="text"
        id="RateSearchInput"
        placeholder="Search Transaction for Update.."
        value={financeSearchTerm}
        onChange={handleFinanceSearch}
        onFocus={(e) => { e.target.select() }}
      />
      <div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
      </div>
    </div>

    {/* Search Suggestions */}
    <div className="relative">
      {financeSearchSuggestion.length > 0 && financeSearchTerm !== "" && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
          {financeSearchSuggestion.map((name, index) => (
            <li key={index}>
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={handleFinanceSelection}
                value={name}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>


        {/* <h1 className="font-bold text-3xl text-black text-center mb-4 ">Finance Manager</h1> */}
      <div className="bg-white p-6 py-10 rounded-lg shadow-lg overflow-y-auto">
      {isUpdateMode ? (
  <div className="w-full sm:w-fit bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-center shadow-md sm:mr-4">
    <button
      className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
       onClick={cancelFinance}
    >
      Exit Edit
    </button>
    <div className="flex flex-row text-left text-sm md:text-base pr-2">
      <p className="text-gray-600 font-semibold">{financeClientID}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayClientName}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">₹{financeAmount}</p>
    </div>
  </div>
) : (transactionType?.value === "Operational Expense" && <div className="mb-2 flex items-center text-black">
<label className="flex items-center cursor-pointer">
  <input
    type="checkbox"
    className="ml-5 form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    checked={billsOnly}
    onChange={() => {setBillsOnly(!billsOnly); setClientName('')}}
  />
  <span className="ml-2 text-sm font-medium">Add Bills Only </span>
</label>
</div>
)}
      <form className="space-y-4 ">
      
      {transactionType.value === 'Operational Expense' && 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <div className=' bg-white rounded-lg ml-4 '>
                        <div className='relative '>
                      <button type="button" className="Upload-button" onClick={(e) => {setBill(null)}}>
                      {!bill ? 'Upload Bill' : 'Clear Bill'}
                    {!bill && <input type = "file" accept="application/pdf, image/jpg, image/jpeg" onChange={handleFileChange} className={`absolute inset-0 opacity-0`}/>}
                    </button></div>
            <div className="mt-2 text-sm text-gray-700 break-words">
            {bill && bill.name}
            </div>
            </div>
            { bill && (
              <div className='mt-3' >
            <label className='block mb-2 mt-1 text-gray-700 font-semibold'>Bill Number<span className="text-red-500">*</span></label>
            <div className="w-full flex gap-3">
            <input className={`w-full text-black px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.billNumber ? 'border-red-400' : isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
                type="text"
                placeholder="Bill Number"
                id='billno'
                name="BillNumberInput" 
                ref={billNumberRef}
                // required={!isEmpty} 
                value={billNumber}
                pattern="\d*"
                // inputMode="numeric"
                onFocus={e => e.target.select()}
                onChange={(e) => {
                  const input = e.target.value;
                  setBillNumber(input);
                  if (errors.billNumber) {
                    setErrors((prevErrors) => ({ ...prevErrors, billNumber: undefined }));
                  }
                }}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const index = Array.from(inputs).findIndex(input => input === e.target);
                    if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    }
                }
                }}
                />
            </div>
            {errors.billNumber && <span className="text-red-500 text-sm">{errors.billNumber}</span>}
            </div>
            )}
            {bill && (
              <div className='mt-3 ml-4'>
                    <label className="block mt-1 mb-2 text-gray-700 font-semibold">Bill Date<span className="text-red-500">*</span></label>
                    <div className='flex w-full gap-1'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box mb={2} >
            <TextField

              // className="py-2"
              fullWidth
              label="Select Date"
              value={formattedBillDate}
              onClick={(e) => setBillAnchorElDate(e.currentTarget)}
              InputProps={{
                style: {
                  borderColor: isUpdateMode ? '#facc15' : '', // Yellow in update mode, default otherwise
                  borderWidth: isUpdateMode ? 1 : 1, // Thicker border when in update mode
                  maxHeight: 40,
                },
              }}
            />
            <Popover
              open={Boolean(billAnchorElDate)}
              anchorEl={billAnchorElDate}
              onClose={() => setBillAnchorElDate(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <DateCalendar
                value={billDate}
                onChange={(newValue) => {
                  setBillDate(newValue);
      //             validateTransactionDate(newValue);  // Call validation after setting the new date
      //             // Validate the new transaction date and set errors
      // const errorMsg = validateTransactionDate(newValue);
      // setErrors((prevErrors) => ({
      //   ...prevErrors,
      //   transactionDate: errorMsg, // Set the error message if any
      // }));
                  setBillAnchorElDate(null);
                }}
                
              />
            </Popover>
          </Box>
          </LocalizationProvider>
          </div>
          </div>
            )}
            </div>}
            
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      
    
      <div className='mt-4' >
            <label className='mt-4 mb-2 text-gray-700 font-semibold' >Transaction Type</label>
            <Dropdown
              className={`w-full mt-2 text-black border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.transactionType ? 'border-red-400' : ''} overflow-visible`}
              id="1"
              name="TransactionTypeSelect"
              
              placeholder="Select Transaction Type"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: 'auto', // adjust the width as needed
                  minHeight: '50px', // adjust the height as needed
                }),
              }}
              defaultValue={transactionOptions[0]}
              value={transactionType.value}
              onChange={(option) => handleChange(option, 'TransactionTypeSelect')}
              options={transactionOptions}
              disabled={isUpdateMode}
            //   required
              /> 
               {errors.transactionType && <span className="text-red-500 text-sm">{errors.transactionType}</span>}
               {transactionType && transactionType.value === 'Income' &&  (
          <div className="flex items-center space-x-1 mt-1">
            <input
              type="checkbox"
              id="invoiceRequired"
              className={`h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 ${isUpdateMode ? 'border-yellow-500' : 'border-gray-300'} rounded`}
              checked={isDownloadInvoiceChecked}
              onChange={(e) => setIsDownloadInvoiceChecked(e.target.checked)}
            />
            <label htmlFor="invoiceRequired" className={`text-gray-500 font-medium text-sm ${isUpdateMode ? 'border-yellow-500' : 'border-gray-300'}`}>
              Invoice Required
            </label>
          </div>
          )}
               </div>
               {transactionType && transactionType.value === 'Operational Expense' && (
                <div className='mt-4' >
              <>
            <label className='mt-4 mb-2 text-gray-700 font-semibold'>Expense Category</label>
            <Dropdown
              className={`w-full mt-2 text-black border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.expenseCategory ? 'border-red-400' : ''} overflow-visible`}
              id="1"
              name="ExpenseCategorySelect"
              placeholder="Select Expense Category"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: 'auto', // adjust the width as needed
                  minHeight: '50px', // adjust the height as needed
                }),
              }}
              defaultValue={expenseCategoryOptions[0].value}
              value={expenseCategory.value}
              options={expenseCategoryOptions}
              onChange={(option) => handleChange(option, 'ExpenseCategorySelect')}
              disabled={isUpdateMode}
            //   required
              />
               {errors.expenseCategory && <span className="text-red-500 text-sm">{errors.expenseCategory}</span>}
               </>
               </div>
            )}
            

            
            {/* {transactionType && transactionType.value !== 'Operational Expense' && ( */}

            {(
  transactionType?.value === 'Income' || 
  (transactionType?.value === 'Operational Expense' && expenseCategory?.value === 'Project')
) ? (
  <div className='mt-2' >
              <>
            <label className='block mb-2 mt-3 text-gray-700 font-semibold '>Client Name<span className="text-red-500">*</span></label>
            <div className="w-full flex gap-3">
            <input 
            className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none border-gray-400 focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientName ? 'border-red-400' : ''} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                type="text"
                placeholder="Client Name" 
                id='2'
                name="ClientNameInput" 
                // required={!isEmpty} 
                value={clientName}
                onChange = {handleClientNameTermChange}
                disabled={isUpdateMode || billsOnly}
                onFocus={e => e.target.select()}
                onBlur={() => {
            setTimeout(() => {
              setClientNameSuggestions([]);
            }, 200); // Adjust the delay time according to your preference
          }}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const index = Array.from(inputs).findIndex(input => input === e.target);
                    if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    }
                }
                }}
                />
                
            </div>
            {(clientNameSuggestions.length > 0 && clientName !== '') && (
                <ul className={`list-none bg-white shadow-lg rounded-md mt-2 overflow-y-scroll ${
                  clientNameSuggestions.length > 5 ? 'h-40' : 'h-fit'
                }`}>
                {clientNameSuggestions.map((name, index) => (
                    <li key={index}>
                    <button
                        type="button"
                        // className="text-black text-left pl-3 border w-full bg-gradient-to-r from-green-100 via-green-200 to-green-300 hover:cursor-pointer transition
                        //     duration-300"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-non"e
                        onClick={handleClientNameSelection}
                        value={name}
                    >
                        {name}
                    </button>
                    </li>
                ))}
                </ul>
            )}
{errors.clientName && <span className="text-red-500 text-sm">{errors.clientName}</span>}</>
</div>) : null}
 {/* )} */}

    {(
  transactionType?.value === 'Income' || 
  (transactionType?.value === 'Operational Expense' && expenseCategory?.value === 'Project')
) ? (
    <div id="4" name="RateWiseOrderNumberText">
        <label className='block mb-2 mt-4 text-gray-700 font-semibold' >
          Order Number<span className="text-red-500">*</span>
        </label>
        <div className="w-full flex gap-3">
          <input
           className={`w-full text-black px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderNumber ? 'border-red-400' : ''} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
            type="text"
            placeholder="Ex. 10000"
            ref={orderNumberRef}
            value={rateWiseOrderNumber}
            pattern="/[^\d,]/g"
            inputMode="numeric"
            onChange={handleRateWiseOrderNumberChange}
            disabled={isUpdateMode}
            onFocus={(e) => { e.target.select(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
        </div>
        {errors.orderNumber && <span className="text-red-500 text-sm">{errors.orderNumber}</span>}
        </div>
        ) : null}
      {(
  transactionType?.value === 'Income' || 
  (transactionType?.value === 'Operational Expense' && expenseCategory?.value === 'Project')
) ? (
  <div name="OrderNumberText">
    <label className="block mb-2 mt-4 text-gray-700 font-semibold">
      Order Number<span className="text-red-500">*</span>
    </label>
    <div className="w-full flex gap-3">
      <input
        className={`w-full text-black px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderNumber ? 'border-red-400' : ''} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
        type="text"
        placeholder="Ex. 10000"
        ref={orderNumberRef}
        value={orderNumber}
        pattern="\d*"
        inputMode="numeric"
        onChange={handleOrderNumberChange}
        disabled={isUpdateMode}
        onFocus={(e) => { e.target.select(); }}
        required
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
      />
    </div>
    {errors.orderNumber && <span className="text-red-500 text-sm">{errors.orderNumber}</span>}
  </div>
) : null}


      {/* {transactionType && transactionType.value !== 'Operational Expense' && (
      <div name="OrderNumberText" >
        <label className='block mb-2 mt-4 text-gray-700 font-semibold'>
          Order Number<span className="text-red-500">*</span>
        </label>
        <div className="w-full flex gap-3">
          <input
            className={`w-full text-black px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderNumber ? 'border-red-400' : ''} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
            type="text"
            placeholder="Ex. 10000"
            value={orderNumber}
            pattern="\d*"
            inputMode="numeric"
            onChange={handleOrderNumberChange}
            disabled={isUpdateMode}
            onFocus={(e) => { e.target.select(); }}
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
        </div>
        {errors.orderNumber && <span className="text-red-500 text-sm">{errors.orderNumber}</span>}
        </div>)} */}
     {/* )} */}
      {/* </>
    )}</div>
  </> */}
  <div className='mt-3' >
            <label className='block mb-2 mt-1 text-gray-700 font-semibold'>Amount(₹)<span className="text-red-500">*</span></label>
            <div className="w-full flex gap-3">
            <input className={`w-full text-black px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderAmount ? 'border-red-400' : isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
                type="text"
                placeholder="Amount (₹)" 
                id='4'
                ref={amountRef}
                name="AmountInput" 
                // required={!isEmpty} 
                value={orderAmount}
                pattern="\d*"
                inputMode="numeric"
                onFocus={e => e.target.select()}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, '');
                  setOrderAmount(input);
                  if (errors.orderAmount) {
                    setErrors((prevErrors) => ({ ...prevErrors, orderAmount: undefined }));
                  }
                }}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const index = Array.from(inputs).findIndex(input => input === e.target);
                    if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    }
                }
                }}
                />
            </div>
            {errors.orderAmount && <span className="text-red-500 text-sm">{errors.orderAmount}</span>}
            </div>
            {/* <div className='block mb-2 mt-3 text-gray-700 font-semibold'>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel value="None" control={<Radio />} label="None" />
              <FormControlLabel value="TDS" control={<Radio />} label="TDS" />
              <FormControlLabel value="DiscountBaddebt" control={<Radio />} label="Discount/Bad Debt" />
             
            </RadioGroup>
            <div className='mb-2 mt-4' style={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" style={{ backgroundColor: '#88cc6b' }}>Split TDS</Button>
          </div>
            </div> */}
            
            {/* <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Balance</label>
          <div className="w-full flex gap-3">
          <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
              type="text"
              placeholder="Balance" 
              id='4'
              name="BalanceInput" 
              // required={!isEmpty} 
              // value={Balance}
              // onChange={handleSearchTermChange}
              onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  const inputs = document.querySelectorAll('input, select, textarea');
                  const index = Array.from(inputs).findIndex(input => input === e.target);
                  if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                  }
              }
              }}
              />
          </div> */}
<div className='mt-3'>
            <label className='block mb-2 mt-1 text-gray-700 font-semibold'>Tax Type</label>

            <Dropdown
              className={`w-full text-black border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 overflow-visible ${isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
              id="5"
              name="TaxTypeSelect"
              placeholder="Select Tax Type"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: 'auto', // adjust the width as needed
                  minHeight: '50px', // adjust the height as needed
                }),
              }}
              value={taxType.value}
              options={taxTypeOptions}
              onChange={(option) => handleChange(option, 'TaxTypeSelect')}
            //   required
              />
               {/* {errors.taxType && <span className="text-red-500 text-sm">{errors.taxType}</span>} */}
               </div>
               {taxType && taxType.value === 'GST' && transactionType.value === 'Operational Expense' && (
              <div>
               <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST %<span className="text-red-500">*</span></label>
          <div className="w-full flex gap-3">
          <input className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.gstPercentage ? 'border-red-400' :  isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
              type="text"
              placeholder="GST%" 
              id='4'
              name="GSTInput" 
              value={gstPercentage}
              onChange = {(e) => {setGSTPercentage(e.target.value)
                if (errors.gstPercentage) {
                  setErrors((prevErrors) => ({ ...prevErrors, gstPercentage: undefined }));
                }
              }}
              onFocus={e => e.target.select()}
              onKeyDown={(e) => {
              if (e.key === 'Enter') {
                  e.preventDefault();
                  const inputs = document.querySelectorAll('input, select, textarea');
                  const index = Array.from(inputs).findIndex(input => input === e.target);
                  if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                  }
              }
              }}
              />
          </div>
          {errors.gstPercentage && <span className="text-red-500 text-sm">{errors.gstPercentage}</span>}
               </div>
                    )}
          {taxType && taxType.value === 'GST' && transactionType.value === 'Operational Expense' && ( 
          <div>
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST Amount<span className="text-red-500">*</span></label>
            <div className="w-full flex gap-3">
            <input className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.gstAmount ? 'border-red-400' :  isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
                type="text"
                placeholder="GST Amount" 
                id='7'
                name="GSTAmountInput" 
                // required={!isEmpty} 
                value={gstAmount}
                onChange = {(e) => {setGSTAmount(e.target.value);
                  if (errors.gstAmount) {
                    setErrors((prevErrors) => ({ ...prevErrors, gstAmount: undefined }));
                  }
                }}
                onBlur={handleGSTAmountChange}
                onFocus={e => e.target.select()}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const index = Array.from(inputs).findIndex(input => input === e.target);
                    if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    }
                }
                }}
                />
            </div>
            {errors.gstAmount && <span className="text-red-500 text-sm">{errors.gstAmount}</span>}
            </div>
            )} 
            
            <div className='mt-3'> 
            <label className='block mb-2 mt-1 text-gray-700 font-semibold'>Remarks</label>
            <div className="w-full flex gap-3">
            <TextareaAutosize
              className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none border-gray-400 focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
              id="7"
              name="RemarksTextArea"
              placeholder="Remarks"
              value={remarks}
              disabled={billsOnly}
              onChange={e => setRemarks(e.target.value)}
              onFocus={e => e.target.select()}
            ></TextareaAutosize>
            </div>
            </div>
            <div className='mt-3'>
                  <label className="block mt-1 mb-2 text-gray-700 font-semibold">Transaction Date</label>
                  <div className='flex w-full gap-1'>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box mb={2} >
          <TextField
            className="custom-date-picker"
            fullWidth
            label="Select Date"
            value={transactionDateFormatted}
            onClick={handleDateClick}
            disabled={billsOnly}
            InputProps={{
              style: {
                borderColor: isUpdateMode ? '#facc15' : '', // Yellow in update mode, default otherwise
                borderWidth: isUpdateMode ? 1 : 1, // Thicker border when in update mode
                maxHeight: 40,
              },
            }}
          />
          <Popover
            open={openDate}
            anchorEl={anchorElDate}
            onClose={handleDateClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <DateCalendar
              value={transactionDate}
              onChange={(newValue) => {
                setTransactionDate(newValue);
                validateTransactionDate(newValue);  // Call validation after setting the new date
                // Validate the new transaction date and set errors
    const errorMsg = validateTransactionDate(newValue);
    setErrors((prevErrors) => ({
      ...prevErrors,
      transactionDate: errorMsg, // Set the error message if any
    }));
                handleDateClose();
              }}
              
            />
          </Popover>
        </Box>
        <Box>
        <TimePicker
            disabled={billsOnly}
            className="custom-time-picker"
            label="Select Time"
            value={transactionTime}
            onChange={(newValue) => {
              setTransactionTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
            ampm
            views={['hours', 'minutes']}
            sx={{
              '& .MuiInputBase-root': {
                height: 40,  // Consistent time picker height
                borderColor: isUpdateMode ? '#facc15' : '', // Yellow in update mode
                borderWidth: isUpdateMode ? '1px' : '1px',  // Thicker border in update mode
                borderStyle: 'solid', // Ensure the border is visible
              },
            }}
          
          />
        </Box>
      </LocalizationProvider>
                </div>
                {errors.transactionDate && <span className="text-red-500 text-sm">{errors.transactionDate}</span>}
                {errors.transactionTime && <span className="text-red-500 text-sm">{errors.transactionTime}</span>}
                </div>
                <div className='mt-3'>
                <label className="block mt-1 mb-2 text-gray-700 font-semibold">Payment Mode</label>
            {/* <div className='flex w-full'> */}
            <Dropdown
              className={`w-full text-black border border-gray-400 rounded-lg focus:outline-none focus:shadow-outline disabled:cursor-not-allowed focus:border-blue-300 focus:ring focus:ring-blue-300 overflow-visible ${isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
              id="5"
              name="PaymentModeSelect"
              disabled={billsOnly}
              placeholder="Select Payment Mode"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: 'auto', // adjust the width as needed
                  minHeight: '50px', // adjust the height as needed
                }),
              }}
              value={paymentMode.value}
              onChange={(option) => handleChange(option, 'PaymentModeSelect')}
              options={paymentModeOptions}
            //   required
              />
               {/* </div>
               {errors.paymentMode && <span className="text-red-500 text-sm">{errors.paymentMode}</span>} */}
               </div>
               {paymentMode && paymentMode.value === 'Cheque' && (
              <div className='mt-3'>
               <label className='block mb-2 mt-2 text-gray-700 font-semibold'>Cheque Number<span className="text-red-500">*</span></label>
            <input 
                className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none border-gray-400 focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.chequeNumber ? 'border-red-400' : isUpdateMode ? 'border-yellow-400' : 'border-gray-400'}`}
                type="text"
                placeholder="Ex. 10000" 
                id='3'
                name="ChequeNumberInput"
                disabled={billsOnly}
                value={chequeNumber} 
                onChange = {(e) => {setChequeNumber(e.target.value)
                  if (errors.chequeNumber) {
                    setErrors((prevErrors) => ({ ...prevErrors, chequeNumber: undefined }));
                  }
                }}
                onFocus={(e) => {e.target.select()}}
                onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = document.querySelectorAll('input, select, textarea');
                    const index = Array.from(inputs).findIndex(input => input === e.target);
                    if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                    }
                }
                }}
                />
            {errors.chequeNumber && <span className="text-red-500 text-sm">{errors.chequeNumber}</span>}
            </div>
               )}
               {paymentMode && paymentMode.value === 'Cheque' && (
           <div className='mt-3'>
           <label className="block mt-1 mb-2 text-gray-700 font-semibold">Cheque Date</label>
           <div className='flex w-full gap-1'>
             <LocalizationProvider dateAdapter={AdapterDayjs}>
               <Box mb={2}>
                 <TextField
                   className="custom-date-picker"
                   fullWidth
                   disabled={billsOnly}
                   label="Select Date"
                   value={formattedChequeDate}
                   onClick={handleChequeDateClick}
                   InputProps={{
                    style: {
                      borderColor: isUpdateMode ? '#facc15' : '', // Yellow in update mode, default otherwise
                      borderWidth: isUpdateMode ? 1 : 1, // Thicker border when in update mode
                      maxHeight: 40,
                    },
                  }}
                 />
                 <Popover
                   open={openChequeDate}
                   anchorEl={anchorElChequeDate}
                   onClose={handleChequeDateClose}
                   anchorOrigin={{
                     vertical: 'bottom',
                     horizontal: 'left',
                   }}
                 >
                   <DateCalendar
                     value={chequeDate}
                     onChange={(newValue) => {
                       setChequeDate(newValue);
                       handleChequeDateClose();
                     }}
                   />
                 </Popover>
               </Box>
               {/* <Box>
                 <TimePicker
                   className="custom-time-picker"
                   label="Select Time"
                   value={chequeTime}
                   onChange={(newValue) => {
                    setChequeTime(newValue);
                   }}
                   renderInput={(params) => <TextField {...params} fullWidth />}
                   ampm
                   views={['hours', 'minutes']}
                   sx={{
                    '& .MuiInputBase-root': {
                      height: 40,  // Consistent time picker height
                      borderColor: isUpdateMode ? '#facc15' : '', // Yellow in update mode
                      borderWidth: isUpdateMode ? '1px' : '1px',  // Thicker border in update mode
                      borderStyle: 'solid', // Ensure the border is visible
                    },
                  }}
                 />
               </Box> */}
             </LocalizationProvider>
           </div>
           {errors.chequeDate && <span className="text-red-500 text-sm">{errors.chequeDate}</span>}
           {/* {errors.chequeTime && <span className="text-red-500 text-sm">{errors.chequeTime}</span>} */}
         </div>
         
            )}
            
               
  </div>
  {/* <div className='bg-surface-card p-8 rounded-2xl mb-4'>
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div> */}
  </form>
  {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
  {toast && <ToastMessage message={toastMessage} type="warning"/>}
  </div>
  </div>
  </div>
    );
}

export default FinanceData;