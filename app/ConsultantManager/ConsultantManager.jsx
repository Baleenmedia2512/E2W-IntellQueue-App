'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import '@mui/x-date-pickers/DatePicker';
import { Calendar } from 'primereact/calendar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';


    
const ConsultantManager = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [consultantID, setConsultantNameID] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState('');
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [consulantWarning, setConsulantWarning] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [displayClientName, setDisplayClientName] = useState(consultantName);
  const [displayClientNumber, setDisplayClientNumber] = useState(consultantNumber);
  const [displayClientID, setDisplayClientID] = useState(consultantID);
  const [icRequired, setIcRequired] = useState(false);
  const [smsRequired, setSmsRequired] = useState(false);
  const nameInputRef = useRef(null);
  
  const dispatch = useDispatch();
  const router = useRouter()

  

const validateFields = () => {
  let errors = {};

  if (!consultantName) {
    errors.consultantName = 'Consultant Name is required';
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleEditMode = () => {

    setConsultantName("");
    setConsultantNumber("");

    setDisplayClientID("");
    setDisplayClientName("");
    setDisplayClientNumber("");

    // Set edit mode and any other necessary state changes
    setEditMode(true);
    setIsNewClient(true);

    // Focus on the name input field
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);  
  };

  const handleConsultantNameChange = (e) => {
    const newName = event.target.value;
    setConsultantName(newName)
    dispatch(setClientData({ consultantName: newName || "" }));
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {setConsultantNameSuggestions(data)});
      if (errors.consultantName) {
        setErrors((prevErrors) => ({ ...prevErrors, consultantName: undefined }));
      }
  }

  const handleConsultantNumberChange = (e) => {
    const number = e.target.value;
    setConsultantNumber(number);
  }

  const insertConsultant = () => {

  }

  const updateConsultant = () => {

  }

  const handleRemoveConsultant = () => {

  }

  const handleConsultantNameSelection = () => {
    const input = event.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
  
    setConsultantNameSuggestions([]);
    setConsultantName(name)
    dispatch(setClientData({ consultantName: name || "" }));
    setConsultantNumber(number);
  }

    return (
<div className='min-h-screen bg-gray-100 mb-14 p-2'>
  <div className="flex items-center justify-center">
    <div className="w-full max-w-6xl">
      {/* Flex container for heading, buttons, and search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Heading and buttons in a row on mobile and desktop */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl mt-3 sm:mt-20 font-bold text-blue-500 mb-1">
            Consultant Manager
          </h2>
          <div className="flex space-x-2 sm:ml-4 sm:mt-0">
            {consultantID === '' ? (
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={insertConsultant}>
                Add
              </button>
            ) : (
              <>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg" onClick={updateConsultant}>
                  Update
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg" onClick={handleRemoveConsultant}>
                  Remove
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search bar below heading and buttons on mobile */}
        <div className="w-full mt-4 sm:mt-0 sm:w-1/2">
          <div className="flex items-center border rounded-lg overflow-hidden border-gray-400 focus-within:border-blue-300">
            <input
              className="w-full px-4 py-2 text-black focus:outline-none"
              type="text"
              id="RateSearchInput"
              placeholder="Search Transaction for Update.."
              onFocus={(e) => { e.target.select(); }}
            />
            <div className="px-3">
              <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center mt-6">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl">
          <form className="space-y-6">
            {/* Flexbox for Name/Number and Radio buttons */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Section: Name and Number */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="relative">
                  <label className="block mb-1 text-black font-medium">
                    Consultant Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.consultantName ? 'border-red-400' : ''}`}
                    type="text"
                    placeholder="Consultant Name"
                    onChange={handleConsultantNameChange}
                    value={consultantName}
                    onBlur={() => {
                      setTimeout(() => {
                        setConsultantNameSuggestions([]);
                      }, 200);
                    }}
                    onKeyPress={(e) => {
                      const regex = /^[a-zA-Z\s]*$/;
                      if (!regex.test(e.key)) e.preventDefault();
                    }}
                  />
                  {consultantNameSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                      {consultantNameSuggestions.map((name, index) => (
                        <li key={index}>
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                            onClick={handleConsultantNameSelection}
                            value={name}
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {errors.consultantName && <p className="text-red-500 text-xs">{errors.consultantName}</p>}
                </div>

                <div>
                  <label className="block mb-1 text-black font-medium">Consultant Number</label>
                  <input
                    className={`w-full text-black px-4 py-2 border rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.consultantNumber ? 'border-red-400' : ''}`}
                    type="number"
                    placeholder="Consultant Number"
                    value={consultantNumber}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) handleConsultantNumberChange(e.target.value);
                    }}
                  />
                  {consulantWarning && <p className="text-red-500">{consulantWarning}</p>}
                  {errors.consultantNumber && <p className="text-red-500 text-xs">{errors.consultantNumber}</p>}
                </div>
              </div>

              {/* Right Section: SMS and IC Radio Buttons */}
              <div className="w-full md:w-1/2 space-y-4">
                {/* Consultant SMS Requirement Section */}
                <div>
                  <h3 className="text-base font-medium text-black">Does the consultant require SMS?</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center text-gray-700 text-base">
                      <input
                        type="radio"
                        name="smsRequirement"
                        value="yes"
                        className="form-radio h-5 w-5 text-blue-600"
                        onChange={() => setSmsRequired(true)}
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center text-gray-700 text-base">
                      <input
                        type="radio"
                        name="smsRequirement"
                        value="no"
                        className="form-radio h-5 w-5 text-red-600"
                        defaultChecked
                        onChange={() => setSmsRequired(false)}
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {/* Consultant IC Requirement Section */}
                <div>
                  <h3 className="text-base font-medium text-black">Does the consultant require IC?</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center text-gray-700 text-base">
                      <input
                        type="radio"
                        name="icRequirement"
                        value="yes"
                        className="form-radio h-5 w-5 text-blue-600"
                        onChange={() => setIcRequired(true)}
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center text-gray-700 text-base">
                      <input
                        type="radio"
                        name="icRequirement"
                        value="no"
                        className="form-radio h-5 w-5 text-red-600"
                        defaultChecked
                        onChange={() => setIcRequired(false)}
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="text-center mt-6">
              {consultantID === '' ? (
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg" onClick={insertConsultant}>
                  Add
                </button>
              ) : (
                <div className="relative">
                  <button className="px-6 py-2 mr-3 bg-blue-500 text-white rounded-lg" onClick={updateConsultant}>
                    Update
                  </button>
                  <button className="px-6 py-2 bg-red-500 text-white rounded-lg" onClick={handleRemoveConsultant}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error" />}
</div>




  );
};

export default ConsultantManager;
