"use client";  // Mark as client-side component
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { addStage, setSuccessMessage, setErrorMessage, resetStages } from '@/redux/features/stage-slice'; 
import { useAppSelector } from '@/redux/store';
import SuccessToast from '../components/SuccessToast';
import ToastMessage from '../components/ToastMessage';
import { Calendar } from 'primereact/calendar';
import { format } from 'date-fns';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';          // Core styles
import { addItemsToStage, updateStage, removeItem, addStage } from '@/redux/features/stage-slice';
import { FaPlus, FaMinus } from 'react-icons/fa'; // Import icons

const Stages = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const orderDetails = useAppSelector(state => state.orderSlice);
  const stages = useAppSelector(state => state.stageSlice.stages);
  const {orderNumber: orderNumberRP, nextRateWiseOrderNumber : orderNumberRW ,receivable: receivableRP, clientName: clientNameCR, clientNumber: clientNumberCR} = orderDetails;
  console.log(orderDetails)
  console.log(receivableRP)
  
  const [clientName, setClientName] = useState(clientNameCR || "");
  const [clientNumber, setClientNumber] = useState(clientNumberCR || "");
  const [orderNumber, setOrderNumber] = useState(orderNumberRW);
  const [orderAmount, setOrderAmount] = useState(receivableRP);
  const [inputCount, setInputCount] = useState(1); // For user input
  const dbName = useAppSelector(state => state.authSlice.dbName);
  //const [errors, setErrors] = useState([]); // Array to store field-specific errors
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [stage, setStage] = useState("");
  const [stageAmount, setStageAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  
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

// const postStages = () => {
    
//   const hasError = validateAllFields(); // Validate all fields before submission

//   if (!hasError) {
//     setSuccessMessage('Stages Created');
//     setTimeout(() => {
//       setSuccessMessage('');
//     }, 3000);
//     router.push('/Create-Order');
//   } else {
//     // setToast(true);
//     // setToastMessage('Please fill all necessary fields before submitting.');
//     // setTimeout(() => {
//     //   setToastMessage('');
//     // }, 3000);
//   }
// };

// const validateAllFields = () => {
//   const newErrors = [];
//   let hasError = false;

//   stages.forEach((field, index) => {
//     const error = { stageAmount: "", description: "", dueDate: "" };

//     if (!field.stageAmount) {
//       error.stageAmount = 'Stage Amount is required';
//       hasError = true;
//     } else if (isNaN(field.stageAmount) || Number(field.stageAmount) <= 0) {
//       error.stageAmount = 'Stage Amount must be a positive number';
//       hasError = true;
//     }

//     if (!field.description) {
//       error.description = 'Description is required';
//       hasError = true;
//     }

//     if (!field.dueDate) {
//       error.dueDate = 'Due date is required';
//       hasError = true;
//     }

//     newErrors[index] = error;
//   });

//   setErrors(newErrors);
//   return hasError;
// };

  
  // const postStages = () => {
  //   const hasError = validateAllFields();
  
  //   if (!hasError) {
  //     // If no error, create stages and show success message
  //     CreateStages(); // Call CreateStages after validation is successful
  //     setSuccessMessage('Stages Created');
  //     setTimeout(() => {
  //       setSuccessMessage('');
  //     }, 3000);
  //     // Additional submission logic can go here if needed
  //   } else {
  //     // If there is an error, show toast message
  //     setToast(true);
  //     setToastMessage('Please fill all necessary fields before submitting.');
  //     setTimeout(() => {
  //       setToastMessage('');
  //     }, 3000);
  //   }
  // };
 
  

  // const createFields = () => {
  //   const newFields = [];

  //   // Create new fields based on the inputCount
  //   for (let i = 0; i < inputCount; i++) {
  //     newFields.push({
  //       title: "",
  //       description: "",
  //       dueDate: getCurrentDate(),
  //       stageAmount: ""  
  //     });
  //   }

  //   dispatch(addItemsToStage(newFields));
  //   setErrors(new Array(newFields.length).fill({ title: "", description: "", dueDate: "" })); // Ensure error array matches the fields array
  // };
   // Function to add a new stage
  //  const addStage = () => {
  //   dispatch(addItemsToStage([
  //     ...stages,
  //     {
  //       title: '',
  //       description: '',
  //       dueDate: getCurrentDate(),
  //       stageAmount: '',
  //     },
  //   ]));
  // };


  // Function to remove a stage
  // const removeStage = (index) => {
  //   if (stages.length > 1) {
  //     const newFields = stages.filter((_, i) => i !== index);
  //     dispatch(addItemsToStage(newFields));
  //   }
  // };

  // const handleFieldChange = (index, event, field) => {
  //   const value = event.target.value;
  //   dispatch(updateStage({ index, field, value }));
  
  //   // Validate field after update
  //   validateField(index, field, value);
  // };
  

  // const validateField = (index, fieldName, value) => {
  //   const error = { ...errors[index] }; // Copy the current error object for that stage
  
  //   switch (fieldName) {
  //     case 'stageAmount':
  //       if (!value) {
  //         error.stageAmount = 'Stage Amount is required';
  //       } else if (isNaN(value) || Number(value) <= 0) {
  //         error.stageAmount = 'Stage Amount must be a positive number';
  //       } else {
  //         error.stageAmount = ''; // Clear error if valid
  //       }
  //       break;
  
  //     case 'description':
  //       if (!value) {
  //         error.description = 'Description is required';
  //       } else {
  //         error.description = ''; // Clear error if valid
  //       }
  //       break;
  
  //     case 'dueDate':
  //       if (!value) {
  //         error.dueDate = 'Due date is required';
  //       } else {
  //         error.dueDate = ''; // Clear error if valid
  //       }
  //       break;
  
  //     default:
  //       break;
  //   }
  
  //   const newErrors = [...errors];
  //   newErrors[index] = error; // Update the error for the specific stage
  //   setErrors(newErrors);
  // };
  


  
  // const CreateStages = async (event) => {
  //   event.preventDefault();
  
  //   // Check if all required fields are filled
  //   if (validateAllFields()) {
  //     try {
  //       // Create API promises for each field, dynamically passing the stage count
  //       const apiPromises = stages.map(async (field, index) => {
  //         const formattedDueDate = format(new Date(field.dueDate), 'yyyy-MM-dd');
  
  //         // Dynamically set the stage count for each stage
  //         // const stageCount = `Stage ${index + 1}`;
  
  //         // Send API request with the dynamic stage count
  //         const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateStages.php/?JsonEntryUser=${loggedInUser}&JsonOrderNumber=${orderNumber}&JsonClientName=${clientNameCR}&JsonClientNumber=${clientNumberCR}&JsonStage=${index + 1}&JsonStageAmount=${field.stageAmount}&JsonOrderAmount=${orderAmount}&JsonDescription=${field.description}&JsonDueDate=${formattedDueDate}&JsonDBName=${companyName}`);
  
  //         return await response.json();
  //       });
  
  //       // Wait for all API promises to resolve
  //       const results = await Promise.all(apiPromises);
  
  //       // Handle results of API calls
  //       results.forEach((data, index) => {
  //         if (data === "Stage Created Successfully!") {
  //           // Dispatch action to add created stages
  //           //dispatch(addItemsToStage( fields ));
  
  //           // Show success message
  //           setSuccessMessage('Stages Created Successfully!');
  //           setTimeout(() => {
  //             setSuccessMessage('');
  //           }, 3000);
  //         } else {
  //           console.error('Error creating stage:', data);
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error creating stages:', error);
  //     }
  //   } else {
  //     // Show error message if fields are not valid
  //     setToastMessage('Please fill all necessary fields.');
  //   }
  // };

  // useEffect(() => {
  //   console.log('Stages component rendered');
  // }, [fields]);

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
  
    stages.forEach((field, index) => {
      const error = { stageAmount: "", description: "", dueDate: "" };
  
      // Validate stageAmount
      if (!field.stageAmount) {
        error.stageAmount = "Stage Amount is required";
        hasError = true;
      } else if (isNaN(field.stageAmount) || Number(field.stageAmount) <= 0) {
        error.stageAmount = "Stage Amount must be a positive number";
        hasError = true;
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
  
      newErrors[index] = error; // Store the errors for each field
    });
  
    setErrors(newErrors); // Update errors state
    return hasError; // If there's any error, return true
  };
  
  const handleFieldChange = (index, event, field) => {
    const value = event.target.value;
    dispatch(updateStage({ index, field, value }));
  
    // Validate the field after update
    validateField(index, field, value);
  };
  
  const validateField = (index, fieldName, value) => {
    // Create a copy of the current errors state
    const error = { ...errors[index] };
  
    // Validate based on the field name
    switch (fieldName) {
      case "stageAmount":
        if (!value) {
          error.stageAmount = "Stage Amount is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          error.stageAmount = "Stage Amount must be a positive number";
        } else {
          error.stageAmount = ""; // Clear error if valid
        }
        break;
  
      case "description":
        if (!value) {
          error.description = "Description is required";
        } else {
          error.description = ""; // Clear error if valid
        }
        break;
  
      case "dueDate":
        if (!value) {
          error.dueDate = "Due date is required";
        } else {
          error.dueDate = ""; // Clear error if valid
        }
        break;
  
      default:
        break;
    }
  
    // Update the errors array with the new error object for this stage
    const newErrors = [...errors];
    newErrors[index] = error; // Update specific stage errors
  
    setErrors(newErrors); // Update the state
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10 sm:mb-0">
     <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl"> {/* Reduced max-width on larger screens */}
      
       <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold text-left text-blue-600 mb-4">Create Your Stages</h2>
          <div className="border-2 w-10 border-blue-500 "></div>

        </div>
        {/* Button container */}
        <div className="flex flex-wrap justify-between items-center space-x-4 md:space-x-6">
          <button
            type="button"
            onClick={() => dispatch(removeItem())}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <FaMinus />
          </button>

          <button
            className="w-full md:w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
            onClick={postStages}
          >
            Submit
          </button>

          <button
            type="button"
            onClick={() => dispatch(addStage())}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            <FaPlus />
          </button>
        </div>

      </div>
    <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto my-4 bg-white p-10 rounded-lg shadow-md"> {/* Increased padding */}
  {/* Header Section */}
  <div className="flex flex-col sm:flex-row justify-between items-center mb-4"> {/* Use flex-col for mobile view */}
  <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Total Stages: {stages.length}</h4> {/* Adjusted font size for responsiveness */}
  <div className="bg-blue-100 p-4 rounded-lg ml-auto mt-2 sm:mt-0"> {/* Added margin-top for mobile spacing */}
    <h4 className="text-sm sm:text-lg font-semibold text-blue-700">Order Amount: ₹{orderAmount}</h4>
  </div>
</div>


  <div className="space-y-6">
    {/* Dynamic Fields for Stages */}
    {stages.map((field, index) => (
      <div key={index} className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-500">Stage {index + 1}</h3>

        <div className="flex flex-col md:flex-row md:space-x-4 md:space-y-0 items-center">

          {/* Stage Amount */}
          <div className="w-full md:w-1/3 px-4">
            <label htmlFor={`stageAmount-${index}`} className="block mb-1 text-black font-medium">
              Stage Amount
            </label>
            <input
              type="text"
              id={`stageAmount-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black"
              value={field.stageAmount}
              onChange={(e) => handleFieldChange(index, e, 'stageAmount')}
              placeholder={`Stage Amount ${index + 1}`}
            />
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
            />
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
              />
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