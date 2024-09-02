'use client';
import './page.css';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreatableSelect from 'react-select/creatable';
import { TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import {MdOutlineSave} from "react-icons/md";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useAppSelector } from '@/redux/store';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { resetOrderData } from '@/redux/features/order-slice';
import { useDispatch } from 'react-redux';
import { setIsOrderExist } from '@/redux/features/order-slice';
import { resetClientData } from '@/redux/features/client-slice';

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
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const username = useAppSelector(state => state.authSlice.userName);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [anchorElDate, setAnchorElDate] = React.useState(null);
  // const [orderNumber, setOrderNumber] = useState(null);
  // const [clientName, setClientName] = useState(null);
  // const [orderAmount, setOrderAmount] = useState(null);
  // const [remarks, setRemarks] = useState(null);
  const [clientName, setClientName] = useState(orderClientName || '');
  const [clientNumber, setClientNumber] = useState(orderClientNumber || '');
  const [orderNumber, setOrderNumber] = useState(orderOrderNumber || '');
  const [rateWiseOrderNumber, setRateWiseOrderNumber] = useState(nextRateWiseOrderNumber || '');
  const [orderAmount, setOrderAmount] = useState('');
  const [remarks, setRemarks] = useState(orderRemarks || '');
  const [taxType, setTaxType] = useState(taxTypeOptions[2]);
  const [gstAmount, setGSTAmount] = useState(null);
  const [gstPercentage, setGSTPercentage] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState(null);
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
  const isOrderExist = useAppSelector(state => state.orderSlice.isOrderExist);
  const router = useRouter();
  const dispatch = useDispatch();
  const [elementsToHide, setElementsToHide] = useState([]);

  useEffect(() => {
    elementsToHideList();
  },[companyName])

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
  const formattedChequeDate = chequeDate.format('YYYY-MM-DD');

  const year = transactionDate.$y;
  const month = transactionDate.$M + 1; // Months are zero-based, so we add 1 to get the correct month
  const day = transactionDate.$D;
  const hours = transactionTime.$H;
  const minutes = transactionTime.$m;
  const seconds = transactionTime.$s;
  
  const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  const handleDateClick = (event) => {
    setAnchorElDate(event.currentTarget);
  };
  
  const handleDateClose = () => {
    setAnchorElDate(null);
  };

  const openDate = Boolean(anchorElDate);


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
    
    const newOrderNumber = event.target.value;
    setOrderNumber(newOrderNumber);
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
        setBalanceAmount(clientDetails.balanceAmount);
        setRateWiseOrderNumber(clientDetails.rateWiseOrderNumber);
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
  };

  const handleRateWiseOrderNumberChange = (event) => {
    
    const newOrderNumber = event.target.value;
    setRateWiseOrderNumber(newOrderNumber);
    axios
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
        setBalanceAmount(clientDetails.balanceAmount);
        setOrderNumber(clientDetails.orderNumber);
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
  };

  useEffect(()=>{
    if(transactionType.value === 'Operational Expense'){
      setOrderNumber(0);
      setRateWiseOrderNumber(0);
    }
  },[transactionType])



  const insertNewFinance = async (e) => {
    e.preventDefault()
    if (!isOrderExist && !expenseCategory) {
      setToastMessage('Order Number does not exist!');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return;
    }
    if (balanceAmount === 0) {
      setToastMessage('Full payment has already been received!');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 3000);
      return;
    } else {

    if (validateFields()) {
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewFinanceEntry.php/?JsonTransactionType=${transactionType ? transactionType.value : ''}&JsonEntryUser=${username ? username : ''}&JsonOrderNumber=${orderNumber ? orderNumber : ''}&JsonOrderAmount=${orderAmount ? orderAmount : ''}&JsonTaxType=${taxType ? taxType.value : ''}&JsonGSTAmount=${gstAmount ? gstAmount : ''}&JsonExpenseCategory=${expenseCategory ? expenseCategory.value : ''}&JsonRemarks=${remarks ? remarks : ''}&JsonTransactionDate=${formattedDate + ' ' + formattedTime}&JsonPaymentMode=${paymentMode ? paymentMode.value : ''}&JsonChequeNumber=${chequeNumber ? chequeNumber : ''}&JsonChequeDate=${formattedDate + ' ' + formattedTime}&JsonDBName=${companyName}&JsonRateWiseOrderNumber=${rateWiseOrderNumber}`);


          const data = await response.json();
          if (data === 'Inserted Successfully!') {
            setSuccessMessage('Finance Entry Added');
              setTimeout(() => {
            setSuccessMessage('');
            
            SendSMS(clientNumber, orderAmount, rateWiseOrderNumber);
          }, 1000);
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
    if (!orderNumber && !expenseCategory) errors.orderNumber = 'Order Number is required';
    // if (!orderAmount || isNaN(orderAmount)) errors.orderAmount = 'Valid Amount is required';
    if (!taxType) errors.taxType = 'Tax Type is required';
    if (taxType?.value === 'GST' && (!gstPercentage || isNaN(gstPercentage))) {
      errors.gstPercentage = 'Valid GST % is required';
    }
    if (taxType?.value === 'GST' && !gstAmount) {
      errors.gstAmount = 'GST Amount is required';
    }
    if (!transactionDate) {
      errors.transactionDate = 'Transaction Date is required';
    } else if (dayjs(transactionDate).isAfter(dayjs())) {
      errors.transactionDate = 'Transaction Date cannot be in the future';
    }
    if (!transactionTime) errors.transactionTime = 'Transaction Time is required';
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

  const clearFinance = (e) => {
    e.preventDefault();
          setChequeNumber('');
          setClientName('');
          setExpenseCategory('');
          setGSTAmount('');
          setGSTPercentage('');
          setOrderAmount('');
          setOrderNumber('');
          setPaymentMode(paymentModeOptions[0]);
          setRemarks('');
          setTaxType(taxTypeOptions[2]);
          setTransactionType(transactionOptions[0]);
          dispatch(resetOrderData());
  };

    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
      <form className="px-7 h-screen grid justify-center items-center ">
    <div className="grid gap-6 " id="form">
    <h1 className="font-bold text-3xl text-black text-center mb-4 ">Finance Manager</h1>
        <div>
            <label className='block mb-2 text-gray-700 font-semibold'>Transaction Type*</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass text-black shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
              value={transactionType}
              onChange={(option) => handleChange(option, 'TransactionTypeSelect')}
              options={transactionOptions}
            //   required
              />
               </div>
               {errors.transactionType && <span className="text-red-500 text-sm">{errors.transactionType}</span>}
               {transactionType && transactionType.value === 'Operational Expense' && (
              <>
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Expense Category*</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass text-black shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
              value={expenseCategory}
              options={expenseCategoryOptions}
              onChange={(option) => handleChange(option, 'ExpenseCategorySelect')}
            //   required
              />
              
               </div>
               {errors.expenseCategory && <span className="text-red-500 text-sm">{errors.expenseCategory}</span>}
               </>
            )}
            {transactionType && transactionType.value !== 'Operational Expense' && (
    <>
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Client Name*</label>
            <div className="w-full flex gap-3">
            <input className="p-3 text-black capitalize shadow-2xl glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Client Name" 
                id='2'
                name="ClientNameInput" 
                // required={!isEmpty} 
                value={clientName}
                onChange = {handleClientNameTermChange}
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
                <ul className="list-none">
                {clientNameSuggestions.map((name, index) => (
                    <li key={index}>
                    <button
                        type="button"
                        // className="text-black text-left pl-3 border w-full bg-gradient-to-r from-green-100 via-green-200 to-green-300 hover:cursor-pointer transition
                        //     duration-300"
                        className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md"
                        onClick={handleClientNameSelection}
                        value={name}
                    >
                        {name}
                    </button>
                    </li>
                ))}
                </ul>
            )}
{errors.clientName && <span className="text-red-500 text-sm">{errors.clientName}</span>}
{/* <>
    {!elementsToHide.includes("RateWiseOrderNumber") ? (
      <> */}
      <div id="4" name="RateWiseOrderNumberText">
        <label className='block mb-2 mt-5 text-gray-700 font-semibold' >
          Order Number*
        </label>
        <div className="w-full flex gap-3">
          <input
            className="p-3 text-black capitalize shadow-2xl glass w-full outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="text"
            placeholder="Ex. 10000"
            value={rateWiseOrderNumber}
            pattern="\d*"
            inputMode="numeric"
            onChange={handleRateWiseOrderNumberChange}
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
      {/* </>
    ) : (
      <> */}
      <div id="21" name="OrderNumberText">
        <label className='block mb-2 mt-5 text-gray-700 font-semibold'>
          Order Number*
        </label>
        <div className="w-full flex gap-3">
          <input
            className="p-3 text-black capitalize shadow-2xl glass w-full outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="text"
            placeholder="Ex. 10000"
            value={orderNumber}
            pattern="\d*"
            inputMode="numeric"
            onChange={handleOrderNumberChange}
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
      {/* </>
    )}
  </> */}
            </>
  )}
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Amount*</label>
            <div className="w-full flex gap-3">
            <input className="p-3 text-black capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Amount (₹)" 
                id='4'
                name="AmountInput" 
                // required={!isEmpty} 
                value={orderAmount}
                pattern="\d*"
                inputMode="numeric"
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

            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Tax Type*</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass text-black shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
              value={taxType}
              options={taxTypeOptions}
              onChange={(option) => handleChange(option, 'TaxTypeSelect')}
            //   required
              />
               </div>
               {errors.taxType && <span className="text-red-500 text-sm">{errors.taxType}</span>}
               {taxType && taxType.value === 'GST' && (
              <>
               <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST %*</label>
          <div className="w-full flex gap-3">
          <input className="p-3 text-black capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
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
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST Amount*</label>
            <div className="w-full flex gap-3">
            <input className="p-3 text-black capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
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
            </>
            )}
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Remarks</label>
            <div className="w-full flex gap-3">
            <TextareaAutosize
              className="p-3 glass text-black shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
              id="7"
              name="RemarksTextArea"
              placeholder="Remarks"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              
            ></TextareaAutosize>
            </div>

                  <label className="block mt-5 mb-4 text-gray-700 font-semibold">Transaction Date*</label>
                  <div className='flex w-full gap-1'>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box mb={2} >
          <TextField
            className="custom-date-picker"
            fullWidth
            label="Select Date"
            value={formattedTransactionDate}

            onClick={handleDateClick}
            InputProps={{
              style: { borderColor: '#88cc6b' } 
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
                handleDateClose();
              }}
            />
          </Popover>
        </Box>
        <Box>
        <TimePicker
            className="custom-time-picker"
            label="Select Time"
            value={transactionTime}
            onChange={(newValue) => {
              setTransactionTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
            ampm
            views={['hours', 'minutes']}
          />
        </Box>
      </LocalizationProvider>
                </div>
                {errors.transactionDate && <span className="text-red-500 text-sm">{errors.transactionDate}</span>}
                {errors.transactionTime && <span className="text-red-500 text-sm">{errors.transactionTime}</span>}
                <label className='block mb-2 mt-2 text-gray-700 font-semibold'>Payment Mode*</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass text-black shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
              id="5"
              name="PaymentModeSelect"
              placeholder="Select Payment Mode"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: 'auto', // adjust the width as needed
                  minHeight: '50px', // adjust the height as needed
                }),
              }}
              value={paymentMode}
              onChange={(option) => handleChange(option, 'PaymentModeSelect')}
              options={paymentModeOptions}
            //   required
              />
               </div>
               {errors.paymentMode && <span className="text-red-500 text-sm">{errors.paymentMode}</span>}
               {paymentMode && paymentMode.value === 'Cheque' && (
              <>
               <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Cheque Number*</label>
            <div className="w-full flex gap-3">
            <input className="p-3 capitalize text-black shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Ex. 10000" 
                id='3'
                name="ChequeNumberInput" 
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
            </div>
            {errors.chequeNumber && <span className="text-red-500 text-sm">{errors.chequeNumber}</span>}
            <label className="block mt-5 mb-4 text-gray-700 font-semibold">Cheque Date*</label>
                  <div className='flex w-full gap-1'>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box mb={2} >
          <TextField
            className="custom-date-picker"
            fullWidth
            label="Select Date"
            value={formattedChequeDate}
            onClick={handleDateClick}
            InputProps={{
              style: { borderColor: '#88cc6b' } 
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
              value={chequeDate}
              onChange={(newValue) => {
                setChequeDate(newValue);
                handleDateClose();
              }}
            />
          </Popover>
        </Box>
        <Box>
        <TimePicker
            className="custom-time-picker"
            label="Select Time"
            value={chequeTime}
            onChange={(newValue) => {
              setChequeDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
            ampm
            views={['hours', 'minutes']}
          />
        </Box>
      </LocalizationProvider>
                </div>
                {errors.chequeDate && <span className="text-red-500 text-sm">{errors.chequeDate}</span>}
                {errors.chequeDate && <span className="text-red-500 text-sm">{errors.chequeDate}</span>}
                </>
            )}
               <div className="flex items-center justify-center mb-36 mt-11 mr-14">
               <button className = "bg-red-400 text-white p-2 rounded-full ml-4 w-24 justify-center" onClick={clearFinance}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Clear</span>
                      </button>

                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center " onClick={insertNewFinance}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Add</span>
                      </button>
                    
                </div>
            
  </div>
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
    );
}

export default FinanceData;