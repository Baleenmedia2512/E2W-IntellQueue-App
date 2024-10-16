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
import { updateStage, removeItem, addStage, setStagesFromServer, resetStageItem, setStageEdit, setOrderNumber } from '@/redux/features/stage-slice';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Import icons
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FetchFinanceSeachTerm, FetchOrderSeachTerm, UpdatePaymentMilestone } from '../api/FetchAPI';
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
  const [orderSearchTerm,setOrderSearchTerm] = useState("");
  const [orderAmount, setOrderAmount] = useState(receivableRP);
  const [inputCount, setInputCount] = useState(1); // For user input
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const orderNumber = useAppSelector(state => state.stageSlice.orderNumber)
  const maxOrderNumber = useAppSelector(state => state.orderSlice.maxOrderNumber.nextOrderNumber)
  //const [errors, setErrors] = useState([]); // Array to store field-specific errors
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orderSearchSuggestion, setOrderSearchSuggestion] = useState("");
  const [editingField, setEditingField] = useState({ row: null, field: null });

  const handleEdit = (index, field) => {
    setEditingField({ row: index, field });
  };

  const handleSave = () => {
    setEditingField({ row: null, field: null });
  };
  
  useEffect(() => {
    setOrderAmount(receivableRP);
  },[])
  // Helper function to get the current date in YYYY-MM-DD format
  // const getCurrentDate = () => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
  //   const day = String(today.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // };

  // Initialize fields with a single field and current due date
  // const [fields, setFields] = useState([{ title: "", description: "", dueDate: getCurrentDate(), stageAmount: "" }]);

// const handleInputCountChange = (event) => {
//     const value = event.target.value;

//     // Check if the value is empty; if so, set inputCount to an empty string
//     if (value === '') {
//         setInputCount('');
//     } else {
//         const newCount = parseInt(value, 10) || 1; // Default to 1 if not a valid number

//         // Enforce the limit so that the count does not exceed 5
//         if (newCount > 5) {
//             setInputCount(5); // Set to 5 if the input exceeds the limit
//         } else {
//             setInputCount(newCount);
//         }
//     }
// };

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
      console.error(errors)
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

  const handleOrderSearch = async (e) => {
    const searchTerm = e.target.value;
    setOrderSearchTerm(searchTerm);
  
    const searchSuggestions = await FetchOrderSeachTerm(companyName, searchTerm);
    setOrderSearchSuggestion(searchSuggestions);
  };
  
  const handleFinanceSelection = (e) => {
    const selectedOrder = e.target.value;
  
    // Extract the selected Finance ID from the value (assuming it's in 'ID-name' format)
    const selectedOrderId = selectedOrder.split('-')[0];
  
    // Clear finance suggestions and set the search term
    setOrderSearchSuggestion([]);
    setOrderSearchTerm(selectedOrder);
    FetchMilestoneData(selectedOrderId);
    dispatch(setOrderNumber(selectedOrderId))
    dispatch(setStageEdit(true));
  };

  const FetchMilestoneData = async (OrderId) => {
    try {
      // Fetch the data (replace with your actual API call)
      const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchPaymentMilestone.php?JsonOrderNumber=${OrderId}&JsonDBName=${companyName}`);
      const data = await response.json();
      
      // Check if data is empty or null
      if (!data || data.length === 0) {
        // Set initial state if no data is found
        const initialStages = [
          {
            stageAmount: 0,
            description: "",
            dueDate: new Date().toISOString().slice(0, 10), // Default to today's date
          },
        ];
        
        // Dispatch initial state if no data
        dispatch(setStagesFromServer(initialStages));
      } else {
        // If data exists, update the stages with received data
        dispatch(setStagesFromServer(data));
      }
    } catch (error) {
      console.error("Error fetching milestone data:", error);
      // Optionally handle the error by dispatching an error state or showing a message
    }
  };

  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      setEditingField({ row: null, field: null }); // Exit edit mode on Enter
    }
  };

  const updateStages = async() => {
    const response = await UpdatePaymentMilestone(stages, companyName, orderNumber, loggedInUser)
    console.log(response);
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

  const formatDate = (dateString) => {
    if (!dateString) return ''; // Handle empty/null date
  
    const date = new Date(dateString);
    const day = ('0' + date.getDate()).slice(-2); // Get day and pad with 0 if necessary
    const month = date.toLocaleString('default', { month: 'short' }); // Get abbreviated month
    const year = date.getFullYear(); // Get full year
  
    return `${day}-${month}-${year}`; // Format as dd-MMM-yyyy
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10 sm:mb-0">
     <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl"> {/* Reduced max-width on larger screens */}
      
     <div className="flex justify-between items-center mb-4 top-0 left-0 right-0 z-10 sticky bg-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-left text-blue-600 mb-4 max-w-[90%] md:max-w-full">Payment Milestone</h2>
          <div className="border-2 w-10 border-blue-500 "></div>

        </div>
        {/* Button container */}
        <div className="flex justify-between items-center space-x-4 md:space-x-6">
          
         {!stageEdit ? 
         <button
            className="submit-button"
            onClick={postStages}
          >
            Save
          </button>
        :
        <button
          className="submit-button"
          onClick={updateStages}
        >
          Update
        </button>
        }

          <button
            className="cancelupdate-button"
            onClick={() => dispatch(resetStageItem())}
          >
            Clear All
          </button>
          
        </div>

      </div>
      
      <div className="flex flex-col sm:flex-row justify-center mx-auto mb-4 pt-3 sm:pt-7 mt-4">
  
  {/* Search Input Section */}
  {/* <div className="w-full sm:w-1/2">
    <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
      <input
        className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0"
        type="text"
        id="RateSearchInput"
        placeholder="Search Milestone for Update.."
        value={orderSearchTerm}
        onChange={handleOrderSearch}
        onFocus={(e) => { e.target.select() }}
      />
      <div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
      </div>
    </div>

    {/* Search Suggestions 
    <div className="relative">
      {orderSearchSuggestion.length > 0 && orderSearchTerm !== "" && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
          {orderSearchSuggestion.map((name, index) => (
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
  </div>*/}
</div> 
<div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto my-4 bg-white p-10 min-h-[60vh] rounded-lg shadow-md overflow-y-scroll">
      {/* Header Section */}
      {stageEdit && (
        <div className="w-full sm:w-fit bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-center shadow-md sm:mr-4">
          <button
            className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
            onClick={() => dispatch(resetStageItem())}
          >
            Exit Edit
          </button>
          <div className="flex flex-row text-left text-sm md:text-base pr-2">
            <p className="text-gray-600 font-semibold">{orderNumber}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="flex bg-blue-100 p-4 rounded-lg ml-auto mt-2 sm:mt-0">
          <h4 className="text-sm sm:text-lg font-semibold text-blue-700">
            Order Amount: ₹{orderAmount.toLocaleString('en-IN')}
          </h4>
          
        </div>
        
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <div className="flex bg-blue-100 p-4 rounded-lg ml-auto mt-2 sm:mt-0">
        <h4 className="text-sm sm:text-lg font-semibold text-blue-700">
          Order#: {maxOrderNumber}
          </h4>
          </div></div><div>
      <h4 className="text-xl sm:text-2xl font-bold text-blue-500">
          Total Milestones: {stages.length}
        </h4>
        <table className="min-w-full border-collapse block md:table border border-gray-300">
          <thead className="block md:table-header-group border border-gray-300">
            <tr className="border border-gray-300 md:border-none block md:table-row text-blue-500 text-md">
              <th className="block md:table-cell p-2 text-left border border-gray-300">Milestone</th>
              <th className="block md:table-cell p-2 text-left border border-gray-300">Amount</th>
              <th className="block md:table-cell p-2 text-left border border-gray-300">Description</th>
              <th className="block md:table-cell p-2 text-left border border-gray-300">Due Date</th>
              <th className="block md:table-cell p-2 text-left border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group border border-gray-300">
            {stages.map((field, index) => (
              <tr key={index} className="border border-gray-300 md:border-none block md:table-row">
                {/* Milestone */}
                <td className="block border border-gray-300 md:table-cell p-2">{index + 1}</td>

                {/* Milestone Amount */}
                <td className="block border border-gray-300 md:table-cell p-2" onClick={() => handleEdit(index, 'amount')}>
                  {editingField.row === index && editingField.field === 'amount' ? (
                    <input
                      type="number"
                      value={stages[index].amount}
                      onChange={(e) => handleFieldChange(index, e, 'amount')}
                      onBlur={handleSave}
                      className="border border-gray-300 p-2 w-full rounded-xl"
                      autoFocus
                      onKeyDown={(e) => handleKeyDown(e, index, 'amount')}
                      onFocus={e => e.target.select()}
                    />
                  ) : (
                    <span>
                      ₹ {Number(stages[index].amount || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </td>

                {/* Description */}
                <td className="block border border-gray-300 md:table-cell p-2" onClick={() => handleEdit(index, 'description')}>
                  {editingField.row === index && editingField.field === 'description' ? (
                    <input
                      type="text"
                      value={stages[index].description}
                      onChange={(e) => handleFieldChange(index, e, 'description')}
                      onBlur={handleSave}
                      className="border border-gray-300 p-2 w-full rounded-xl"
                      autoFocus
                      onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                    />
                  ) : (
                    <span>
                      {stages[index].description || 'No description'}
                    </span>
                  )}
                </td>

                {/* Due Date */}
                <td className="block border border-gray-300 md:table-cell p-2" onClick={() => handleEdit(index, 'dueDate')}>
                  {editingField.row === index && editingField.field === 'dueDate' ? (
                    <Calendar
                      value={stages[index].dueDate ? new Date(stages[index].dueDate) : null}
                      onChange={(e) => {handleFieldChange(index, { target: { value: e } }, 'dueDate'); setTimeout(() => handleSave(), 200)}}
                      dateFormat="dd/mm/yy"
                      className="border border-gray-300 p-2 rounded-xl"
                    
                      autoFocus
                    />
                  ) : (
                    <span>
                      {formatDate(stages[index].dueDate.value)}
                    </span>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="md:table-cell p-2 justify-center flex border border-gray-300">
                  <div className='flex justify-center flex-col'>
                  <button
                    type="button"
                    onClick={() => dispatch(removeItem(index))}
                    className="p-1 my-2 text-white rounded-md bg-red-500 flex justify-center text-center"
                  >
                    Remove
                  </button>
                    <button
                      type="button"
                      onClick={() => dispatch(addStage(index))}
                      className="p-1 text-white bg-green-500 rounded-md flex justify-center text-center"
                    >
                      Add
                    </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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