"use client";  // Mark as client-side component

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import SuccessToast from '../components/SuccessToast';
import ToastMessage from '../components/ToastMessage';

const Stages = () => {
  const [inputCount, setInputCount] = useState(1); // For user input
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const [errors, setErrors] = useState([]); // Array to store field-specific errors
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Helper function to get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize fields with a single field and current due date
  const [fields, setFields] = useState([{ title: "", description: "", dueDate: getCurrentDate() }]);

  const handleInputCountChange = (event) => {
    const value = event.target.value;

    // Check if the value is empty; if so, set inputCount to an empty string
    if (value === '') {
      setInputCount('');
    } else {
      const newCount = parseInt(value, 10) || 1; // Default to 1 if not a valid number
      setInputCount(newCount);
    }
  };

  const validateAllFields = () => {
    const newErrors = [];
    let hasError = false;
  
    fields.forEach((field, index) => {
      const error = { title: "", description: "", dueDate: "" };
  
      if (!field.title) {
        error.title = 'Title is required';
        hasError = true;
      } else if (field.title.length < 3) {
        error.title = 'Title must be at least 3 characters long';
        hasError = true;
      } else if (field.title.length > 50) {
        error.title = 'Title cannot exceed 50 characters';
        hasError = true;
      }
  
      if (!field.description) {
        error.description = 'Description is required';
        hasError = true;
      }
  
      if (!field.dueDate) {
        error.dueDate = 'Due date is required';
        hasError = true;
      } else {
        const selectedDate = new Date(field.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00 for accurate comparison
  
        if (selectedDate < today) {
          error.dueDate = 'Due date cannot be in the past';
          hasError = true;
        }
      }
  
      newErrors[index] = error;
    });
  
    setErrors(newErrors);
    return hasError;
  };
  
  const postStages = () => {
    const hasError = validateAllFields();

    if (!hasError) {
      setSuccessMessage('Stages Created');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      // Additional submission logic goes here
    } else {
      setToast(true);
      setToastMessage('Please fill all necessary fields before submitting.');
      setTimeout(() => {
        setToastMessage('');
      }, 3000);
    }
  };

  const createFields = () => {
    const newFields = [];

    // Create new fields based on the inputCount
    for (let i = 0; i < inputCount; i++) {
      newFields.push({
        title: "",
        description: "",
        dueDate: getCurrentDate(), // Set dueDate to today's date for each field
      });
    }

    setFields(newFields);
    setErrors(new Array(newFields.length).fill({ title: "", description: "", dueDate: "" })); // Ensure error array matches the fields array
  };

  const handleFieldChange = (index, event, field) => {
    const newFields = [...fields];
    newFields[index][field] = event.target.value;
    setFields(newFields);

    validateField(index, field, event.target.value); // Validate the specific field
  };

  const validateField = (index, fieldName, value) => {
    const error = { ...errors[index] }; // Copy the errors for the specific field

    switch (fieldName) {
      case 'title':
        if (!value) {
          error.title = 'Title is required';
        } else if (value.length < 3) {
          error.title = 'Title must be at least 3 characters long';
        } else if (value.length > 50) {
          error.title = 'Title cannot exceed 50 characters';
        } else {
          error.title = ''; // Clear error if valid
        }
        break;

      case 'description':
        if (!value) {
          error.description = 'Description is required';
        } else {
          error.description = ''; // Clear error if valid
        }
        break;

      case 'dueDate':
        if (!value) {
          error.dueDate = 'Due date is required';
        } else if (new Date(value) < new Date()) {
          error.dueDate = 'Due date cannot be in the past'; // Error if past date is selected
        } else {
          error.dueDate = ''; // Clear error if valid
        }
        break;

      default:
        break;
    }

    const newErrors = [...errors];
    newErrors[index] = error; // Update the error for the specific field
    setErrors(newErrors);
  };

  useEffect(() => {
    console.log('Stages component rendered');
  }, [fields]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10">
      <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto my-4 bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-blue-500 text-left">Create Your Stages</h3>
        <div className="border-2 w-10 border-blue-500 mb-6"></div>
        <div className="space-y-6">
          {/* Number of Fields */}
          <div className="w-full">
            <label htmlFor="count" className="block mb-1 text-black font-medium">Number of Fields:</label>
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <input
                type="number"
                id="count"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black" // Set text color to black
                value={inputCount}
                onChange={handleInputCountChange}
                min="1"
              />
              <button className="w-full md:w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600" onClick={createFields}>
                Create Stages
              </button>
            </div>
          </div>

          {fields.map((field, index) => (
            <div key={index} className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              {/* Field Title */}
              <div className="w-full md:w-1/3">
                <label htmlFor={`title-${index}`} className="block mb-1 text-black font-medium">Field {index + 1} :</label>
                <input
                  type="text"
                  id={`title-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black" // Set text color to black
                  value={field.title}
                  onChange={(event) => handleFieldChange(index, event, 'title')}
                  placeholder={`Enter title for field ${index + 1}`}
                />
                {errors[index]?.title && <p className="text-red-500 text-sm">{errors[index].title}</p>}
              </div>

              {/* Field Description */}
              <div className="w-full md:w-1/3">
                <label htmlFor={`description-${index}`} className="block mb-1 text-black font-medium">Description:</label>
                <textarea
                  id={`description-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none h-10 text-black" // Set text color to black
                  value={field.description}
                  onChange={(event) => handleFieldChange(index, event, 'description')}
                  placeholder={`Enter description for field ${index + 1}`}
                />
                {errors[index]?.description && <p className="text-red-500 text-sm">{errors[index].description}</p>}
              </div>

              {/* Due Date */}
              <div className="w-full md:w-1/3">
                <label htmlFor={`dueDate-${index}`} className="block mb-1 text-black font-medium">Due Date:</label>
                <input
                  type="date"
                  id={`dueDate-${index}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-black" // Set text color to black
                  value={field.dueDate}
                  onChange={(event) => handleFieldChange(index, event, 'dueDate')}
                />
                {errors[index]?.dueDate && <p className="text-red-500 text-sm">{errors[index].dueDate}</p>}
              </div>
            </div>
          ))}

          <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600" onClick={postStages}>
            Submit
          </button>
        </div>
      </div>
      {/* ToastMessage component */}
      {successMessage && <SuccessToast message={successMessage} />}
      {toast && <ToastMessage message={toastMessage} type="error" />}
    </div>
  );
};

export default Stages;
