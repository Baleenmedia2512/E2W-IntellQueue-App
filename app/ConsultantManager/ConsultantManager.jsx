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
import { FetchConsultantSearchTerm } from '../api/FetchAPI';

    
const ConsultantManager = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [severity, setSeverity] = useState('');
  const [consultantID, setConsultantID] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState('');
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [consulantWarning, setConsulantWarning] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [displayConsultantName, setDisplayConsultantName] = useState(consultantName);
  const [displayConsultantNumber, setDisplayConsultantNumber] = useState(consultantNumber);
  const [displayConsultantID, setDisplayConsultantID] = useState(consultantID);
  const [icRequired, setIcRequired] = useState(true);
  const [smsRequired, setSmsRequired] = useState(true);
  const consultantNameRef = useRef(null);
  const consultantNumberRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [consultantValidity, setConsultantValidity] = useState(true);
  const [originalConsultantData, setOriginalConsultantData] = useState({
    consultantName: '',
    consultantContact: '',
    smsRequired: false,
    icRequired: false,
    validity: true,
  });
  

  const dispatch = useDispatch();
  const router = useRouter()


  

const validateFields = () => {
  let errors = {};

  if (!consultantName) {
    errors.consultantName = 'Consultant Name is required';
  }

  if (consultantNumber && consultantNumber.length < 10) {
    errors.consultantNumber = 'Consultant Number should be 10 digits';
}

  setErrors(errors);
  return Object.keys(errors).length === 0;
};


  const handleEditMode = () => {

    setConsultantID("");
    setConsultantName("");
    setConsultantNumber("");

    setDisplayConsultantID("");
    setDisplayConsultantName("");
    setDisplayConsultantName("");

    setConsultantValidity(true);

    setSearchSuggestions([]);
    setSearchTerm("");

    setIcRequired(true);
    setSmsRequired(true);

    setErrors({});

    // Set edit mode and any other necessary state changes
    setEditMode(true);

    // Focus on the name input field
    setTimeout(() => {
      if (consultantNameRef.current) {
        consultantNameRef.current.focus();
      }
    }, 150);  
  };


  const handleConsultantNameChange = (e) => {
    const newName = e.target.value;
    setConsultantName(newName)
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNamesTest.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {setConsultantNameSuggestions(data)});
      if (errors.consultantName) {
        setErrors((prevErrors) => ({ ...prevErrors, consultantName: undefined }));
      }
  }


  const handleConsultantNumberChange = (e) => {
    const number = e;
    setConsultantNumber(number);
  }

  const insertConsultant = async(event) => {
    event.preventDefault();
    const isValid = validateFields();
    if (isValid) {
      const consultantContact = consultantNumber ? consultantNumber : '';
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddOrUpdateConsultant.php/?JsonUserName=${loggedInUser}&JsonConsultantId=${consultantID}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantContact}&JsonSmsRequired=${smsRequired ? 1 : 0}&JsonIcRequired=${icRequired ? 1 : 0}&JsonDBName=${companyName}`)
        const data = await response.json();

        if (data.message === "Inserted Successfully!") {
                  handleEditMode();
                  setSuccessMessage('Consultant Details Are Added!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
        } else if (data.error === "Consultant name already exists!"){
          setToastMessage(data.error);
          setSeverity('error');
          setToast(true);
          consultantNameRef.current.focus();
          setTimeout(() => {
            setToast(false);
          }, 2000);

        } else if (data.error === "Consultant number already exists!"){
          setToastMessage(data.error);
          setSeverity('error');
          setToast(true);
          consultantNumberRef.current.focus();
          setTimeout(() => {
            setToast(false);
          }, 2000);     
        } else {
          setToastMessage(`The following error occurred while adding consulant: ${data}`);
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
          
        }
  
      } catch (error) {
        console.error('Error while data BM:', error);
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

  const updateConsultant = async(event) => {
    event.preventDefault();

    const dataChanged = (
      consultantName !== originalConsultantData.consultantName ||
      consultantNumber !== originalConsultantData.consultantContact ||
      smsRequired !== originalConsultantData.smsRequired ||
      icRequired !== originalConsultantData.icRequired
    );

    if (!dataChanged) {
      setToastMessage('No Changes Detected!');
      setSeverity('warning');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
      return; 
    }

    const isValid = validateFields();
    if (isValid) {
      const consultantContact = consultantNumber ? consultantNumber : '';
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddOrUpdateConsultant.php/?JsonUserName=${loggedInUser}&JsonConsultantId=${consultantID}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantContact}&JsonSmsRequired=${smsRequired ? 1 : 0}&JsonIcRequired=${icRequired ? 1 : 0}&JsonDBName=${companyName}`)
        const data = await response.json();
        if (data.message === "Updated Successfully!") {
                  handleEditMode();
                  setSuccessMessage('Consultant Details Are Updated!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
                
        } else {
          setToastMessage(`The following error occurred while updating data: ${data}`);
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
          
        }
  
      } catch (error) {
        console.error('Error while data BM:', error);
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

  const handleRemoveConsultant = () => {
    setIsRemoveDialogOpen(true);
  };

  const handleRestoreConsultant = async(event) => {
    event.preventDefault();
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/RemoveOrRestoreConsultant.php/?JsonConsultantId=${consultantID}&JsonDBName=${companyName}&JsonActivity=Restore`)
        const data = await response.json();
        if (data.message === "Consultant restored successfully!") {
                  fetchConsultantDetails(consultantID);
                  setSuccessMessage('Consultant restored successfully!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
                
        } else {
          setToastMessage(`The following error occurred while updating data: ${data}`);
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
          
        }
  
      } catch (error) {
        console.error('Error while data BM:', error);
    
      }
  };

  const confirmRemoveConsultant = async(event) => {
    event.preventDefault();
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/RemoveOrRestoreConsultant.php/?JsonConsultantId=${consultantID}&JsonDBName=${companyName}&JsonActivity=Remove`)
        const data = await response.json();
        if (data.message === "Consultant removed successfully!") {
                  fetchConsultantDetails(consultantID);
                  setSuccessMessage('Consultant removed successfully!');
                  setTimeout(() => {
                  setSuccessMessage('');
                }, 2000);
                
        } else {
          setToastMessage(`The following error occurred while updating data: ${data}`);
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
          
        }
  
      } catch (error) {
        console.error('Error while data BM:', error);
    
      }
    setIsRemoveDialogOpen(false);
  };

  const cancelRemoveConsultant = () => {
    setIsRemoveDialogOpen(false);
  };

  const handleConsultantNameSelection = (event) => {
    const input = event.target.value;
    const id = input.split('-')[0].trim();
    const valid = input.split('-')[2].trim();
    const name = input.substring(input.indexOf('-') + 1, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
    
    setConsultantNameSuggestions([]);
    setConsultantID(id);
    setDisplayConsultantID(id);
    fetchConsultantDetails(id);
    // setIsConsultantValid(valid === 'Valid')
  };

  const fetchConsultantDetails = (Id) => {
    fetch(`https://orders.baleenmedia.com/API/Media/FetchConsultantDetails.php?JsonConsultantID=${Id}&JsonDBName=${companyName}`)
    .then((response) => response.json())
    .then((data) => {
        setConsultantName(data.ConsultantName);
        setConsultantNumber( data.ConsultantNumber ? data.ConsultantNumber : '');
        setDisplayConsultantName(data.ConsultantName);
        setDisplayConsultantNumber(data.ConsultantNumber);
        setSmsRequired(data.IsSMSRequired === 1);
        setIcRequired(data.IsIncentiveRequired === 1);
        setConsultantValidity(data.Validity === 1);

        setOriginalConsultantData({
          consultantName: data.ConsultantName,
          consultantContact: data.ConsultantNumber ? data.ConsultantNumber : '',
          smsRequired: data.IsSMSRequired === 1,
          icRequired: data.IsIncentiveRequired === 1,
          validity: data.Validity === 1,
        });

    })
    .catch((error) => {

    });
  }


  const handleConsultantSearchTermChange = async (event) => {
    const input = event.target.value
    setSearchTerm(input);
    const searchSuggestions = await FetchConsultantSearchTerm(companyName, input);
    setSearchSuggestions(searchSuggestions);
  };

  const handleConsultantSearchTermSelection = async (event) => {
    const input = event.target.value
    const id = input.split('-')[0].trim();

    setSearchTerm(input);
    setSearchSuggestions([]);
    fetchConsultantDetails(id);
    setConsultantID(id);
    setDisplayConsultantID(id);
  };
  
    return (
<div className='min-h-screen bg-gray-100 mb-14 p-2'>
  <div className="flex items-center justify-center">
    <div className="w-full max-w-6xl relative">
      {/* Flex container for heading and buttons */}
      <div className="flex justify-between items-center relative z-10 px-2">
        {/* Heading on the far left */}
        <div>
        <h2 className="text-xl w-24 sm:w-full sm:text-2xl mt-3 sm:mt-20 font-bold text-blue-500 mb-1">
          Consultant Manager
        </h2>
        <div className="border-2 w-10 mt-1 pl-2 border-blue-500"></div>
        </div>
        {/* Buttons on the far right */}
        <div className="flex space-x-2 sm:mt-20">

{consultantID === '' ? (
  <button 
    className="px-8 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-[0_4px_10px_0_rgba(34,197,94,0.5)] hover:-translate-y-1 transform transition duration-300"
    onClick={insertConsultant}
  >
    Add
  </button>
) : (
  consultantValidity ? (
    // If consultantValidity is true, show Update and Remove buttons
    <>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-[0_4px_10px_0_rgba(34,197,94,0.5)] hover:-translate-y-1 transform transition duration-300"
        onClick={updateConsultant}
      >
        Update
      </button>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-[0_4px_10px_0_rgba(239,68,68,0.5)] hover:-translate-y-1 transform transition duration-300"
        onClick={handleRemoveConsultant}
      >
        Remove
      </button>
    </>
  ) : (
    // If consultantValidity is false, show only the Restore button
    <button 
      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-[0_4px_10px_0_rgba(34,197,94,0.5)] hover:-translate-y-1 transform transition duration-300"
      onClick={handleRestoreConsultant}
    >
      Restore
    </button>
  )
)}

{/* Confirmation Dialog */}
<Dialog open={isRemoveDialogOpen} onClose={cancelRemoveConsultant}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this consultant?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveConsultant} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveConsultant} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

        </div>
      </div>

      {/* Search bar positioned on top of heading and buttons section */}
      <div className="absolute top-6 sm:top-0 w-full left-0 md:left-72 sm:left-72 sm:w-1/2 mt-[70px] sm:mt-20 z-20">
        <div className="flex items-center border rounded-lg overflow-hidden border-gray-400 focus-within:border-blue-400">
          <input
            className="w-full px-4 py-2 text-black focus:outline-none"
            type="text"
            placeholder="Search Consultant for Update.."
            value={searchTerm}
            onFocus={(e) => { e.target.select(); }}
            onChange={handleConsultantSearchTermChange}
          />
          <div className="px-3">
            <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
          </div>
        </div>
        {/* Search Suggestions */}
    <div className="relative">
      {searchSuggestions.length > 0  && searchTerm !== '' && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
          {searchSuggestions.map((name, index) => (
            <li key={index}>
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={handleConsultantSearchTermSelection}
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
  </div>

  {/* Form Section */}
  <div className="flex items-center justify-center mt-20 sm:mt-6">
  
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl">
    {consultantID && (
  <div className="w-fit bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-center shadow-md -ml-2 sm:ml-0">
    <button 
      className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
      onClick={handleEditMode}
    >
      Exit Edit
    </button>
    <div className="flex flex-row text-left text-sm md:text-base pr-2">
      <p className="text-gray-600 font-semibold">{displayConsultantID}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayConsultantName}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayConsultantNumber}</p>
    </div>
  </div>
)}
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
                ref={consultantNameRef}
                disabled={!consultantValidity}
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
                ref={consultantNumberRef}
                disabled={!consultantValidity}
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
              <h3 className="text-base font-medium text-black">Does the consultant require SMS?<span className="text-red-500">*</span></h3>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center text-gray-700 text-base">
                  <input
                    type="radio"
                    name="smsRequirement"
                    value="yes"
                    className="form-radio h-5 w-5"
                    checked={smsRequired === true}
                    onChange={() => setSmsRequired(true)}
                    disabled={!consultantValidity}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center text-gray-700 text-base">
                  <input
                    type="radio"
                    name="smsRequirement"
                    value="no"
                    className="form-radio h-5 w-5"
                    checked={smsRequired === false}
                    defaultChecked
                    onChange={() => setSmsRequired(false)}
                    disabled={!consultantValidity}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Consultant IC Requirement Section */}
            <div>
              <h3 className="text-base font-medium text-black">Does the consultant require IC?<span className="text-red-500">*</span></h3>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center text-gray-700 text-base">
                  <input
                    type="radio"
                    name="icRequirement"
                    value="yes"
                    checked={icRequired === true}
                    className="form-radio h-5 w-5 text-blue-600"
                    onChange={() => setIcRequired(true)}
                    disabled={!consultantValidity}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center text-gray-700 text-base">
                  <input
                    type="radio"
                    name="icRequirement"
                    value="no"
                    className="form-radio h-5 w-5 text-red-600"
                    checked={icRequired === false}
                    defaultChecked
                    onChange={() => setIcRequired(false)}
                    disabled={!consultantValidity}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        {/* <div className="text-center mt-6">
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
        </div> */}
      </form>
    </div>
  </div>

  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error" />}
</div>


  );
};

export default ConsultantManager;
