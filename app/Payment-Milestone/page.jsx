"use client";  // Mark as client-side component
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import SuccessToast from '../components/SuccessToast';
import ToastMessage from '../components/ToastMessage';
import { Calendar } from 'primereact/calendar';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';          // Core styles
import { updateStage, removeItem, addStage, setStagesFromServer, resetStageItem, setStageEdit } from '@/redux/features/stage-slice';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Import icons
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FetchFinanceSeachTerm } from '../api/FetchAPI';
import './style.css';

const Stages = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const orderDetails = useAppSelector(state => state.orderSlice);
  const companyName = useAppSelector(state => state.authSlice.companyName)
  const stages = useAppSelector(state => state.stageSlice.stages);
  const stageEdit = useAppSelector(state => state.stageSlice.editMode);
  const {receivable: receivableRP} = orderDetails;
  const [financeSearchTerm,setFinanceSearchTerm] = useState("");
  const [orderAmount, setOrderAmount] = useState(receivableRP);
  const [inputCount, setInputCount] = useState(1); // For user input
  const dbName = useAppSelector(state => state.authSlice.dbName);
  //const [errors, setErrors] = useState([]); // Array to store field-specific errors
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [financeSearchSuggestion, setFinanceSearchSuggestion] = useState("")

  
  useEffect(() => {
    setOrderAmount(receivableRP);
  },[])
  // Helper function to get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize fields with a single field and current due date
  // const [fields, setFields] = useState([{ title: "", description: "", dueDate: getCurrentDate(), stageAmount: "" }]);

const handleInputCountChange = (event) => {
    const value = event.target.value;

    // Check if the value is empty; if so, set inputCount to an empty string
    if (value === '') {
        setInputCount('');
    } else {
        const newCount = parseInt(value, 10) || 1; // Default to 1 if not a valid number

        // Enforce the limit so that the count does not exceed 5
        if (newCount > 5) {
            setInputCount(5); // Set to 5 if the input exceeds the limit
        } else {
            setInputCount(newCount);
        }
    }
};

  useEffect(() => {
    if(!loggedInUser){
      router.push("/login");  
    }
  },[])

  const [errors, setErrors] = useState(stages.map(() => ({ stageAmount: "", description: "", dueDate: "" })));

  const postStages = () => {
    const hasError = validateAllFields(); // Validate all fields before submission
  
    if (!hasError) {
      setSuccessMessage("Stages Created");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      router.push('/Create-Order');
    } else {
      // Show some form of error message or toast to the user if validation fails
      setToast(true);
      setToastMessage("Please fill all necessary fields before submitting.");
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  };
  
  const validateAllFields = () => {
    const newErrors = [];
    let hasError = false;
    let totalStageAmount = 0;

    stages.forEach((field, index) => {
      const error = { stageAmount: "", description: "", dueDate: "" };

      // Validate stageAmount
      if (!field.stageAmount) {
        error.stageAmount = "Stage Amount is required";
        hasError = true;
      } else if (isNaN(field.stageAmount) || Number(field.stageAmount) <= 0) {
        error.stageAmount = "Stage Amount must be a positive number";
        hasError = true;
      } else {
        totalStageAmount += Number(field.stageAmount); // Sum stage amounts
      }

      // Validate description
      if (!field.description) {
        error.description = "Description is required";
        hasError = true;
      }

      // Validate dueDate
      if (!field.dueDate) {
        error.dueDate = "Due date is required";
        hasError = true;
      }

      newErrors[index] = error;
    });

    // Check if the total stage amounts match the orderAmount
    if (totalStageAmount !== Number(orderAmount)) {
      setToast(true);
      setToastMessage(`Total stage amount (${totalStageAmount}) does not match the order amount (${orderAmount})`);
      hasError = true;
    }

    setErrors(newErrors);
    return hasError;
  };
  
  const validateField = (index, fieldName, value) => {
    const error = { ...errors[index] };

    switch (fieldName) {
      case "stageAmount":
        if (!value) {
          error.stageAmount = "Stage Amount is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error.stageAmount = "Stage Amount must be a positive number";
        } else {
          error.stageAmount = "";
        }
        break;

      case "description":
        if (!value) {
          error.description = "Description is required";
        } else {
          error.description = "";
        }
        break;

      case "dueDate":
        if (!value) {
          error.dueDate = "Due date is required";
        } else {
          error.dueDate = "";
        }
        break;

      default:
        break;
    }

    const newErrors = [...errors];
    newErrors[index] = error;
    setErrors(newErrors);
  };

  useEffect(() => {
    // Sync errors array with stages length
    setErrors(stages.map(() => ({ stageAmount: "", description: "", dueDate: "" })));
  }, [stages]);

  const handleFinanceSearch = async (e) => {
    const searchTerm = e.target.value;
    setFinanceSearchTerm(searchTerm);
  
    const searchSuggestions = await FetchFinanceSeachTerm(companyName, searchTerm);
    setFinanceSearchSuggestion(searchSuggestions);
  };
  
  const handleFinanceSelection = (e) => {
    const selectedFinance = e.target.value;
  
    // Extract the selected Finance ID from the value (assuming it's in 'ID-name' format)
    const selectedFinanceId = selectedFinance.split('-')[0];
  
    // Clear finance suggestions and set the search term
    setFinanceSearchSuggestion([]);
    setFinanceSearchTerm(selectedFinance);
    FetchMilestoneData(selectedFinanceId)
    dispatch(setStageEdit(true));
  };

  const FetchMilestoneData = async (FinanceId) => {
    // Fetch the data (replace with your actual API call)
    const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchPaymentMilestone.php?JsonFinanceId=${FinanceId}&JsonDBName=${companyName}`);
    const data = await response.json();

    // Dispatch the action to update stages with the received data
    dispatch(setStagesFromServer(data));
  };

  const updateStages = async(StageId) => {
    const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchPaymentMilestone.php?JsonFinanceId=${StageId}&JsonDBName=${companyName}`);
    const data = await response.json();
  }

  const handleCancelUpdate = () => {
    dispatch(resetStageItem());
    dispatch(setStageEdit(false));
  }

  const handleFieldChange = (index, event, field) => {
    const value = event.target.value;
    dispatch(updateStage({ index, field, value }));
    validateField(index, field, value);
  };

  return (
    <div className="flex items-start justify-start sm:items-center sm:justify-center min-h-screen bg-gray-100 p-4 mb-10 sm:mb-0">

  <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl">
    
    {/* Sticky Button container */}
    <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-100 z-10 p-4">
      <div>
        <h2 className="text-3xl font-bold text-left text-blue-600 mb-4 max-w-[90%] md:max-w-full">Payment MileStone</h2>
        <div className="border-2 w-10 border-blue-500"></div>
      </div>

      {/* Button container with sticky positioning */}
      <div className="flex justify-between items-center space-x-4 md:space-x-6">
        <button className="submit-button" onClick={postStages}>
          Submit
        </button>
        <button className="cancelupdate-button" onClick={postStages}>
          Clear All
        </button>
      </div>
    </div>
    <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto my-4 bg-white p-6 sm:p-10 rounded-lg shadow-md">{/* Increased padding */}
  {/* Header Section */}
  <div className="flex flex-row justify-between items-center mb-4"> {/* Use flex-row for all views */}
  <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Total Stages: {stages.length}</h4> {/* Adjusted font size for responsiveness */}
  <div className="bg-blue-100 p-4 rounded-lg ml-auto"> {/* Removed mt-2 for phone view */}
    <h4 className="text-sm sm:text-lg font-semibold text-blue-700">Order Amount: ₹{orderAmount}</h4>
  </div>
</div>



  <div className="space-y-6">
    {/* Dynamic Fields for Stages */}
    {stages.map((field, index) => (
      <div key={index} className="mb-4">
        <span className='flex flex-row items-center space-x-2'>
        <button
          type="button"
          onClick={() => dispatch(removeItem({index}))}
          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center w-6 h-5"
        >
          <FaMinus className='text-xs font-bold' />
        </button>
        <h3 className="text-lg font-semibold text-gray-500">Stage {index + 1}</h3>
        <button
            type="button"
            onClick={() => dispatch(addStage({index}))}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-6 h-5"
          >
            <FaPlus className='text-xs font-bold'/>
          </button>
      </span>
        <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 items-center">

          {/* Stage Amount */}
          <div className="w-full md:w-1/3 px-4">
            <label htmlFor={`stageAmount-${index}`} className="block mb-1 text-black font-medium">
              Stage Amount
            </label>
            <input
              type="number"
              id={`stageAmount-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black"
              value={field.stageAmount}
              onChange={(e) => handleFieldChange(index, e, 'stageAmount')}
              placeholder={`Stage Amount ${index + 1}`}
              onFocus={e => e.target.select()}
            />
            {(errors && errors[index].stageAmount) && <p className="text-red-500 text-sm mt-2">{errors[index].stageAmount}</p>}
          </div>

          {/* Description */}
          <div className="w-full md:w-1/3 px-4">
            <label htmlFor={`description-${index}`} className="block mb-1 text-black font-medium">
              Description
            </label>
            <textarea
              id={`description-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none h-10 text-black"
              value={field.description}
              onChange={(e) => handleFieldChange(index, e, 'description')}
              placeholder={`Description for stage ${index + 1}`}
              onFocus={e => e.target.select()}
            />
            {(errors && errors[index].description) && <p className="text-red-500 text-sm mt-2">{errors[index].description}</p>}
          </div>

          {/* Due Date and Plus Icon */}
          <div className="flex flex-col sm:flex-row w-full md:w-1/3 px-4 items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="w-full">
              <label htmlFor={`dueDate-${index}`} className="block mb-1 text-black font-medium">
                Due Date
              </label>
              <Calendar
                id={`dueDate-${index}`}
                value={field.dueDate ? new Date(field.dueDate) : null}
                onChange={(e) => handleFieldChange(index, e, 'dueDate')}
                dateFormat="dd/mm/yy"
                placeholder="dd/mm/yyyy"
                className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300`}
                inputClassName="w-full px-3 py-2 text-gray-700 placeholder-gray-400"
                showIcon
                minDate={new Date()}
              />
            </div>
            <div>
            
          </div>
          </div>
          
          
        </div>
      </div>
    ))}
  </div>
</div>

{/* </div> */}
</div>
    {/* ToastMessage component */}
    {successMessage && <SuccessToast message={successMessage} />}
    {toast && <ToastMessage message={toastMessage} type="error" />}
  </div>

);
};

export default Stages;