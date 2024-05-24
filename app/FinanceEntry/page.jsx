'use client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import DatePicker from 'react-datepicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { RemoveCircleOutline, Event, SignalCellularNullOutlined, Balance } from '@mui/icons-material';
import 'react-datepicker/dist/react-datepicker.css';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import Grid from '@mui/material/Grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {Button} from '@mui/material';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MdDeleteOutline , MdOutlineSave, MdAddCircle} from "react-icons/md";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useAppSelector } from '@/redux/store';

const FinanceData = () => {
  // const username = "GraceScans"
  const username = useAppSelector(state => state.authSlice.userName)
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [anchorElDate, setAnchorElDate] = React.useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [orderAmount, setOrderAmount] = useState(null);
  const [taxType, setTaxType] = useState(null);
  const [gstAmount, setGSTAmount] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState(null);
  const [remarks, setRemarks] = useState(null);
  const [transactionDate, setTransactionDate] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [ordersData, setOrdersData] = useState(null);

  const transactionOptions = [
    { value: 'income', label: 'Income' },
    { value: 'opex', label: 'Operational Expense' }
  ];

  const taxTypeOptions = [
    { value: 'gst', label: 'GST' },
    { value: 'igst', label: 'IGST' },
    { value: 'na', label: 'NA' }
  ];

  const expenseCategoryOptions = [
    { value: 'bank', label: 'Bank' },
    { value: 'communication', label: 'Communication' },
    { value: 'commission', label: 'Commission' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'conveyance', label: 'Conveyance' },
    { value: 'eb', label: 'EB' },
    { value: 'maintainance', label: 'Maintainance' },
    { value: 'offering', label: 'Offering' },
    { value: 'pc', label: 'PC' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'rent', label: 'Rent' },
    { value: 'laborcost', label: 'Labor Cost' },
    { value: 'stationary', label: 'Stationary' },
    { value: 'refund', label: 'Refund' }
  ];

  const handleDateClick = (event) => {
    setAnchorElDate(event.currentTarget);
  };

  const handleDateClose = () => {
    setAnchorElDate(null);
  };

  const openDate = Boolean(anchorElDate);

  const handleOrderNumber = async () => {
    if(orderNumber > 0){
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchFinanceData.php/?JsonOrderNumber=${orderNumber}&DBName=${username}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if(data === "Order is invalid" || data === "No data found for the provided Order Number"){
        return null
      } else{
        const matchedTransactionType = transactionOptions.find(option => option.value === data.TransactionType);
        const matchedTaxType = taxTypeOptions.find(option => option.value === data.TaxType);
        const matchedExpenseCategory = expenseCategoryOptions.find(option => option.value === data.ExpensesCategory);

        setTransactionType(matchedTransactionType || { value: data.TransactionType, label: data.TransactionType });
        setTaxType(matchedTaxType || { value: data.TaxType, label: data.TaxType });
        setExpenseCategory(matchedExpenseCategory || { value: data.ExpensesCategory, label: data.ExpensesCategory });

        setClientName(data.ClientName)
        setOrderAmount(data.Amount)
        setGSTAmount(data.TaxAmount)
        setRemarks(data.Remarks)
        setTransactionDate(data.TransactionDate)
        setPaymentMode(data.PaymentMode)
        setOrdersData(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else{
    showToastMessage("error", "Order Number is either 0 or empty. Please check and type again properly.")
  }
  };

  const handleChange = (selectedOption, name) => {
    console.log(`Selected Option for ${name}:`, selectedOption);  // Log selected option to debug
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
      default:
        break;
    }
  };

  const insertNewFinance = async () => {
    // try {
        // if (selectedValues.rateName === null || selectedValues.adType === null || selectedValues.vendorName === null) {
        //     showToastMessage('warning', "Please fill all the fields!");
        // } else if (validTill <= 0) {
        //     showToastMessage('warning', "Validity date should 1 or more!")
        //   } else if(leadDays <= 0){
        //     showToastMessage('warning', "Lead Days should be more than 0!")
        // } else {
            try {
              const response =await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewFinanceEntry.php/?JsonTransactionType=${transactionType ? transactionType : ''}&JsonClientName=${clientName ? clientName : ''}&JsonOrderNumber=${orderNumber ? orderNumber : ''}&JsonOrderAmount=${orderAmount ? orderAmount : ''}&JsonTaxType=${taxType ? taxType : ''}&JsonGSTAmount=${gstAmount ? gstAmount : ''}&JsonExpenseCategory=${expenseCategory ? expenseCategory : ''}&JsonRemarks=${remarks ? remarks : ''}&JsonTransactionDate=${transactionDate ? transactionDate : ''}&JsonPaymentMode=${paymentMode ? paymentMode : ''}`)

                const data = await response.text();
                showToastMessage('success', 'Inserted Successfully!' + data);
                const rateId = maxRateID; 
                await Promise.all(tempSlabData.slice(1).map(async (item) => {
                    const qty = item.Qty;
                    const newUnitPrice = item.newUnitPrice;

                    const qtySlabResponse = await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${username}&JsonRateId=${rateId}&JsonQty=${qty}&JsonUnitPrice=${newUnitPrice}&JsonUnit=${selectedUnit.label}&DBName=${username}`)

                    const qtySlabData = await qtySlabResponse.text();
                }));

                // Optionally reload the window after successful insertion
                window.location.reload();
                
            } catch (error) {
                console.error(error);
            }
        // }
    // } catch (error) {
    //     console.error(error);
    // }
}

  const getOptions = (filterKey, selectedValues) => {
    const filteredData = ordersData.filter(item => {
      return Object.entries(selectedValues).every(([key, value]) =>
        key === filterKey || !value || item[key] === value.value
      );
    });

    const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
    return distinctValues.sort().map(value => ({ value, label: value }));
  };

  useEffect(() => {
    if(orderNumber > 0){
      handleOrderNumber()
    }
  }, [orderNumber]);

    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
      <form class="px-7 h-screen grid justify-center items-center ">
    <div class="grid gap-6 " id="form">
    <h1 className="font-bold text-3xl text-center mb-4 ">Finance Entry</h1>
        <div>
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Transaction Type</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
              value={transactionType}
              onChange={(option) => handleChange(option, 'TransactionTypeSelect')}
              options={transactionOptions}
            //   required
              />
               </div>
                        
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Client Name</label>
            <div class="w-full flex gap-3">
            <input className="p-3 capitalize shadow-2xl glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Client Name" 
                id='2'
                name="ClientNameInput" 
                // required={!isEmpty} 
                // value={clientDetails.clientName}
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
            </div>
            {/* {clientNameSuggestions.length > 0 && (
                <ul className="list-none">
                {clientNameSuggestions.map((name, index) => (
                    <li key={index}>
                    <button
                        type="button"
                        className="text-purple-500 hover:text-purple-700"
                        onClick={handleClientNameSelection}
                        value={name}
                    >
                        {name}
                    </button>
                    </li>
                ))}
                </ul>
            )} */}

            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Order Number</label>
            <div class="w-full flex gap-3">
            <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Ex. 10000" 
                id='3'
                name="OrderNumberInput" 
                onChange = {(e) => setOrderNumber(e.target.value)}
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

            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Amount</label>
            <div class="w-full flex gap-3">
            <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="Amount" 
                id='4'
                name="AmountInput" 
                // required={!isEmpty} 
                value={orderAmount}
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
            </div>

          
            <div className='block mb-2 mt-3 text-gray-700 font-semibold'>
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
            </div>
            
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Balance</label>
          <div class="w-full flex gap-3">
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
          </div>

            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Tax Type</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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

               
               <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST %</label>
          <div class="w-full flex gap-3">
          <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
              type="text"
              placeholder="GST%" 
              id='4'
              name="GSTInput" 
              // required={!isEmpty} 
              // value={}
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
          </div>

            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>GST Amount</label>
            <div class="w-full flex gap-3">
            <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                type="text"
                placeholder="GST Amount" 
                id='7'
                name="GSTAmountInput" 
                // required={!isEmpty} 
                value={gstAmount}
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
            </div>
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Expense Category</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
            <label className='block mb-2 mt-5 text-gray-700 font-semibold'>Remarks</label>
            <div class="w-full flex gap-3">
            <TextareaAutosize
              className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
              id="7"
              name="RemarksTextArea"
              placeholder="Remarks"
              value={remarks}
              // onChange={e => setAddress(e.target.value)}
              
            ></TextareaAutosize>
            </div>

                  <label className="block mt-5 mb-4 text-gray-700 font-semibold">Transaction Date</label>
                  <div className='flex w-full gap-1'>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Select Date"
            value={selectedDate.format('YYYY-MM-DD')}
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
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                handleDateClose();
              }}
            />
          </Popover>
        </Box>
        <Box>
        <TimePicker
            label="Select Time"
            value={selectedTime}
            onChange={(newValue) => {
              setSelectedTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
            ampm
            views={['hours', 'minutes']}
          />
        </Box>
      </LocalizationProvider>
                </div>

                <label className='block mb-2 mt-2 text-gray-700 font-semibold'>Payment Mode</label>
            <div className='flex w-full'>
            <CreatableSelect
              className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
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
              defaultValue={paymentMode}
              value={paymentMode}
            //   onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
            //   options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
            //   required
              />
               </div>
               <div className="flex items-center justify-center mb-24 mt-11 mr-14">
               <button className = "bg-red-400 text-white p-2 rounded-full ml-4 w-24 justify-center">
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Clear</span>
                      </button>

                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center " onClick={insertNewFinance}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Save</span>
                      </button>
                    
                </div>
            
  </div>
  </div>
  </form>
  </div>
    );
}

export default FinanceData;