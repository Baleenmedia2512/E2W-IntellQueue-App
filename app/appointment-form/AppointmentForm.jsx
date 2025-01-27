"use client";
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faCheck, faSearch, faSms, faTimes } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { FetchExistingAppointments, FetchSeachTerm } from '../api/getSearchTerm';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useAppSelector } from '@/redux/store';
import CustomAlert from '../components/CustomAlert';
import { setClientNumber } from '@/redux/features/order-slice';
import { set } from 'date-fns';
import { convertFieldResponseIntoMuiTextFieldProps } from '@mui/x-date-pickers/internals';
import { checkClientContact } from './Validation';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import axios from 'axios';

export default function AppointmentForm() {
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const periodRef = useRef(null);
  const userName = useAppSelector(state => state.authSlice.userName);
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [mobileNumber, setMobileNumber] = useState("");
  const [displayMobileNumber, setDisplayMobileNumber] = useState("");
  const [error, setError] = useState({
    name: "",
    number: "",
    period: ""
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientName, setClientName] = useState("");
  const [displayClientName, setDisplayClientName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [clientId, setClientId] = useState(0);
  const [displayClientId, setDisplayClientId] = useState("");
  const [hours, setHours] = useState(30);
  const [showAlert, setShowAlert] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [appointmentId, setAppointmentId] = useState(0);
  const [appDate, setAppDate] = useState(new Date());
  const [clientNumberExists, setClientNumberExists] = useState(false);
  const [elementsToHide, setElementsToHide] = useState([]);
  const [whatsappKeys, setWhatsappKeys] = useState([]);
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const appointmentTimePeriod = [
    { label: "Tomorrow", value: "Tomorrow", days: 1 },
    { label: "After 3 Days", value: "After 3 Days", days: 3 },
    { label: "After 1 Week", value: "After 1 Week", days: 7 },
    { label: "After 10 Days", value: "After 10 Days", days: 10 },
    { label: "After 2 Weeks", value: "After 2 Weeks", days: 14 },
    { label: "After 4 Weeks", value: "After 4 Weeks", days: 28 },
    { label: "After 1 Month", value: "After 1 Month", days: 30 },
    { label: "After 6 Weeks", value: "After 6 Weeks", days: 42 },
  ];

    // Function to calculate time period
    function calculateTimePeriod(appointmentDate) {
      const today = new Date();
      const appointment = new Date(appointmentDate);
      const diffInDays = Math.ceil((appointment - today) / (1000 * 60 * 60 * 24));
  
      // Match the closest period
      const matchedPeriod = appointmentTimePeriod.find(
        (period) => diffInDays <= period.days
      );
  
      return matchedPeriod ? matchedPeriod.value : "";
    }

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    searchRef?.current.focus();
    elementsToHideList();
    fetchWhatsappKeys(); 
  }, []);

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  const fetchWhatsappKeys= () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Hospital-Form/FetchKeys.php/get?JsonDBName=${dbName}`)
        .then((response) => response.json())
        .then((data) => setWhatsappKeys(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }


  useEffect(() => {
    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])

  async function getExistingAppointment(e){
    const inputData = e.target.value;
    setSearchTerm(inputData);
    const existingAppointmentData = await FetchExistingAppointments(inputData);
    setExistingAppointments(existingAppointmentData);
  }

  function handleAppointmentSearchSelection(e) {
    const selectedValue = e.target.value;
    const arrayValues = selectedValue.split(" - ").map((value) => value.trim());

    setSearchTerm(selectedValue);
    setAppointmentId(arrayValues[0]);
    setClientId(arrayValues[1]);
    setClientName(arrayValues[2]);
    setMobileWithoutString(arrayValues[3]);

    const formattedDate = new Date(arrayValues[4]).toISOString().slice(0, 10);
    setAppDate(formattedDate);
    setExistingAppointments([]);
    setDisplayClientId(arrayValues[1]);
    setDisplayClientName(arrayValues[2]);

    const cleanedMobile = arrayValues[3].replace(/\D/g, "");
    setDisplayMobileNumber(cleanedMobile);
    setEditMode(true);

    // Set the time period based on the date
    const period = calculateTimePeriod(arrayValues[4]);
    setSelectedPeriod(period);
  }

  
  // Handling Search suggestions fetch
  async function getSearchSuggestions(e) {
    const inputData = e.target.value;
    setClientName(inputData);
    setError({name: ""});
    const searchSuggestionsData = await FetchSeachTerm(inputData);
    setSearchSuggestions(searchSuggestionsData);
  };

  function handleSearchTermSelection(e) {
    const selectedValue = e.target.value;
    const arrayValues = selectedValue.split("-").map(value => value.trim());
    const seperatedNameContact = arrayValues[1].split("(");
    setSearchSuggestions([]);
    setClientId(arrayValues[0]);
    setClientName(seperatedNameContact[0]);
    setMobileWithoutString(seperatedNameContact[1]);

  };

  const handleInputChange = async (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    const validPattern = /^([0|\+[0-9]{1,5})?([0-9]{10})$/;
    if (value.length > 10 && !value.includes("+")) return;
    if (value.includes("+") && value.length > 13) return;

    var clientExists = false;
    try{
      clientExists = value.length === 10 && await checkClientContact(value);
    } catch(error){
      return false;
    }
    
    if(clientExists && !clientId){
      setError({number: "Client number already exists."});
      setClientNumberExists(clientExists);
    }else if(!validPattern.test(value)){
      setError({number: "Invalid Mobile Number Format."});
      setClientNumberExists(false);
    } else{
      setError({number: ""});
      setClientNumberExists(false);
    }

    setMobileNumber(value);
  };

  function setMobileWithoutString(contactNumber) {
    // Check if the string contains both letters and digits
    let value = contactNumber;
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    const validPattern = /^([0|\+[0-9]{1,5})?([0-9]{10})$/;
    if (value.length > 10 && !value.includes("+")) return;
    if (value.includes("+") && value.length > 13) return;

    if (validPattern.test(value)) {
      setError({number: ""});
    } else {
      setError({number: "Invalid Mobile Number Format"});
    }
    setMobileNumber(value);
    
  }

  const timeOptions = [];
  for (let i = 30; i <= 180; i += 30) {
    timeOptions.push(i);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0'); // Pad single digits
    const month = date.toLocaleString('default', { month: 'short' }); // Get short month name
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};

  const calculateFutureDate = () => {
    const today = new Date(); // Get today's date
    let daysToAdd = 0;
  
    // Parse the time period (e.g., "3 weeks" or "10 days")
    const [previous, amount, period] = selectedPeriod.split(" ");
  
    // Convert weeks or days to the equivalent number of days
    if (selectedPeriod === "Tomorrow") {
      daysToAdd = 1; // Directly set 1 day for "Tomorrow"
    } else if(period?.includes("Week")){
      daysToAdd = parseInt(amount) * 7;
    }else if (period?.includes("Weeks")) {
      daysToAdd = parseInt(amount) * 7; // 1 week = 7 days
    } else if (period?.includes("Days")) {
      daysToAdd = parseInt(amount); // Directly add days
    } else if(period?.includes("Month")){
      daysToAdd = parseInt(amount) * 30;
    }
  
    // Add the calculated days to today's date
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysToAdd);
  
    return futureDate.toISOString().slice(0, 10); // Format the date to a readable string
  };

  async function addNewClient(e) {
    e.preventDefault()
    try {
      const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/InsertNewClient.php",{
        method: "POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          JsonUserName: userName,
          JsonClientName: clientName,
          JsonClientContact: mobileNumber
        })
      });

      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error || "Unknown error"}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setClientId(data.ClientId); 
      setDisplayClientId(data.ClientId); 
      
      if(data.ClientId){
        addAppointment(data.ClientId)
      }
      setShowAlert(false)
    } catch (error) {
      // alert("Unable to add new Client!");
      setToastMessage("Unable to add new Client!");
      setSeverity('error');
      setToast(true);
      
      setTimeout(() => {
        setToast(false);
      }, 2000);
      setShowAlert(false);
    }
  }

  async function handleFormSubmit(e) {
    setIsButtonDisabled(true);
    e.preventDefault()
    if(clientName === ""){
      nameRef?.current.focus();
      setError({name: "Please Enter a client Name"})
      setIsButtonDisabled(false);
      return
    }

    if(mobileNumber === ""){
      mobileRef?.current.focus();
      setError({number: "Please Enter Client Contact"});
      setIsButtonDisabled(false);
      return;
    }else if(mobileNumber.length < 10){
      mobileRef?.current.focus();
      setError({number: "Please enter a 10 digit contact number!"});
      setIsButtonDisabled(false);
      return;
    }

    if(appDate === ""){
      periodRef?.current.focus();
      setError({period: "Select a valid Date!"});
      setIsButtonDisabled(false);
      return;
    }
    // if(containsInteger){
    //   nameRef?.current.focus();
    //   setClientNameError("Name should not contain numbers");
    //   return;
    // }
    if(clientId === 0){
      setShowAlert(true);
      setIsButtonDisabled(false);
      return;
    }

    if(clientId !== 0){
      addAppointment(clientId);
    }
  }

  const addAppointment = async(clientId) => {
    const appointmentDate = appDate;
    try {
      console.log("Appointment Date:", appointmentDate); // Debugging log
      console.log("Client ID:", clientId); // Debugging log
      console.log("UserName:", userName); // Debugging log
      
      const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/Insert.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          JsonDBName: companyName,
          JsonUserName: userName,
          JsonClientId: clientId,
          JsonDate: appointmentDate
        }),
      });
      
      const responseText = await response.text(); // Read the response as text
      console.log("Server response status:", response.status); // Debugging log
      console.log("Server response:", responseText); // Debugging log to see full response
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        const errorData = JSON.parse(responseText); // Parse the text response for error details
        errorMessage += ` - ${errorData.error || "Unknown error"}`;
        throw new Error(errorMessage);
      }

      // const weeks = parseInt(selectedPeriod.match(/\d+/)[0]);
      try {
        if (whatsappKeys) {
          const { LicenceNumber, APIKey } = whatsappKeys;
      
          const send = await fetch(
            `https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=${LicenceNumber}&APIKey=${APIKey}&Contact=91${mobileNumber}&Template=new_app_template&Param=${encodeURIComponent(clientName)},${encodeURIComponent(formatDate(appointmentDate))},${clientName},${encodeURIComponent(formatDate(appointmentDate))}`
          );
      
          console.log(send);
      
          if (send.ok) {
            setSuccessMessage("Appointment Created and Message Sent Successfully!");
      
            setTimeout(() => {
              setSuccessMessage("");
            }, 2000);
          } else {
            setToastMessage("Appointment Created Successfully, but Message Failed to Send.");
            setSeverity("warning");
            setToast(true);
      
            setTimeout(() => {
              setToast(false);
            }, 2000);
          }
        } else {
          console.log("No keys available to send message.");
        }
      } catch (error) {
        console.error(error);
        setIsButtonDisabled(false); // Add this here to ensure the button is re-enabled
      }
      
      setClientId(0);
      setClientName("");
      setMobileNumber("");
      setSelectedPeriod("");
  
      setDisplayClientId("");
      setDisplayClientName("");
      setDisplayMobileNumber("");
      setIsButtonDisabled(false);
      // alert("Appointment Created Successfully!");
    } catch (error) {
      // alert(error);
      setToastMessage(error);
      setSeverity('error');
      setToast(true);
      setIsButtonDisabled(false);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
  }

  

  async function handleUpdateAppointment() {
    setIsButtonDisabled(true); // Disable the button at the start
    const appointmentDate = appDate;
  
    try {
      const response = await fetch(
        `https://orders.baleenmedia.com/API/Hospital-Form/Update.php?JsonUserName=${encodeURIComponent(userName)}&JsonAppointmentId=${encodeURIComponent(appointmentId)}&JsonDate=${encodeURIComponent(appointmentDate)}`, 
        {
          method: "GET", // Use GET method
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      // const weeks = parseInt(selectedPeriod.match(/\d+/)[0]);
  
      try {
        if (whatsappKeys) {
          const { LicenceNumber, APIKey } = whatsappKeys;
          const send = await fetch(`https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=${LicenceNumber}&APIKey=${APIKey}&Contact=91${mobileNumber}&Template=reschedule_app_template&Param=${clientName},${formatDate(appointmentDate)},${clientName},${formatDate(appointmentDate)}`);
        } else {
          console.log("No keys available to send message.");
        }
      } catch (error) {
        console.error(error);
      }
  
      setSuccessMessage("Appointment Rescheduled Successfully!");
  
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
  
      handleEditMode();
    } catch (error) {
      setToastMessage(error);
      setSeverity('error');
      setToast(true);
  
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } finally {
      setIsButtonDisabled(false); // Enable the button after the process completes
    }
  }
  

  // async function handleCancelAppointment() {
  //   handleEditMode();
  // }
  async function handleCancelAppointment() {
    setIsButtonDisabled(true); // Disable the button at the start
    const appointmentDate = appDate;
  
    try {
      const response = await fetch(
        `https://orders.baleenmedia.com/API/Hospital-Form/Update.php?JsonUserName=${encodeURIComponent(userName)}&JsonAppointmentId=${encodeURIComponent(appointmentId)}&JsonReject=true`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
  
      // Send WhatsApp notification for appointment cancellation
      try {
        if (whatsappKeys) {
          const { LicenceNumber, APIKey } = whatsappKeys;
          const send = await fetch(
            `https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=${LicenceNumber}&APIKey=${APIKey}&Contact=91${mobileNumber}&Template=reject_app_template&Param=${clientName},${formatDate(appointmentDate)},${clientName},${formatDate(appointmentDate)}`
          );
  
          if (!send.ok) {
            console.error("Failed to send WhatsApp message:", await send.text());
          }
        } else {
          console.log("No keys available to send message.");
        }
      } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
      }
  
      setSuccessMessage("Appointment Cancelled Successfully!");
  
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
      handleEditMode();
    } catch (error) {
      setToastMessage(`Cancellation failed: ${error.message}`);
      setSeverity("error");
      setToast(true);
  
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } finally {
      setIsButtonDisabled(false); // Re-enable the button after the process completes
    }
  }
  

  // useEffect(() => {
  //   if(appointmentDate && appointmentTime && hours){
  //     setAppointmentMessage("Appointment fixed on " + appointmentDate + " @" + appointmentTime + " for " + hours)
  //   }
  // }, [appointmentDate, appointmentTime, hours]);

  useEffect(() => {
    const appointmentDate = calculateFutureDate()
    setAppDate(appointmentDate)
  },[selectedPeriod]);

  const handleTouchStart = () => {
    // Blur the input to remove the keyboard
    if (searchRef.current) {
      searchRef.current.blur();
    }
  };

  const nameError = (error && error.name);
  const numberError = (error && error.number);
  const periodError = (error && error.period);

  const handleEditMode = () => {

    setClientId(0);
    setSearchSuggestions([]);
    setSearchTerm("");
    setSelectedPeriod("");
    setClientName("");
    setMobileNumber("");
    setError("");
    setDisplayClientId("");
    setDisplayClientName("");
    setDisplayMobileNumber("");
    setEditMode(false);

    // setTimeout(() => {
    //   if (nameInputRef.current) {
    //     nameInputRef.current.focus();
    //   }
    // }, 0);  
  };

  return (
<form className="shadow-md shadow-blue-200 border p-8 my-6 text-black rounded-xl bg-white">
  <div className="flex flex-col md:flex-row items-center gap-8">
    {/* Image Section */}
    <div className="w-full max-w-[400px] h-auto">
      <Image
        src="/BG_Image.jpg"
        alt="Background Image"
        width={400}
        height={200}
        // layout="responsive"
        className="rounded-lg"
        priority
        // blurDataURL="data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=="
      />
    </div>
    {showAlert &&
          <CustomAlert 
          message={`You are adding appointment for a new client(${clientName}). Do you want to proceed?`}
          onOk={addNewClient}
          onCancel={(e) => {e.preventDefault(); setShowAlert(false);}}
          />
        }
        
    {/* Form Section */}
    <div className="w-full max-w-[400px]">
      <h1 className="text-blue-500 font-montserrat font-bold text-2xl mb-4">Appointment Manager</h1>
      <div className="flex flex-col space-y-4" onTouchStart={handleTouchStart}>
        {editMode && clientId !== 0 && (
          <div className="w-fit bg-blue-50 border border-blue-200 rounded-lg flex items-center shadow-md">
            <button
              className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2"
              onClick={handleEditMode}
            >
              Exit Edit
            </button>
            <div className="flex flex-row text-left text-sm md:text-base pr-2">
              <p className="text-gray-600 font-semibold">{displayClientId}</p>
              <p className="text-gray-600 font-semibold mx-1">-</p>
              <p className="text-gray-600 font-semibold">{displayClientName}</p>
              <p className="text-gray-600 font-semibold mx-1">-</p>
              <p className="text-gray-600 font-semibold">{displayMobileNumber}</p>
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
        <div className="flex flex-col">
          <label className="font-montserrat font-medium text-lg mb-1">Search</label>
          <div className="flex items-center border rounded-lg overflow-hidden border-gray-400 focus-within:ring focus-within:ring-blue-300">
            <input
              className="p-3 font-montserrat bg-white w-full rounded-md focus:border-blue-500 focus:outline-none"
              type="text"
              id="RateSearchInput"
              placeholder="Search Here.."
              ref={searchRef}
              value={searchTerm}
              onChange={getExistingAppointment}
              onFocus={(e) => e.target.select()}
            />
            <div className="px-3">
              <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
            </div>
          </div>
          <div>
          {existingAppointments.length > 0 && searchTerm !== "" && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48">
              {existingAppointments.map((name, index) => (
                <li key={index}>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                    onClick={handleAppointmentSearchSelection}
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

        {/* Name Input */}
        <div className="relative">
        <div className="flex flex-col">
          <label className="font-montserrat font-medium text-lg mb-1">Name <span className="text-red-500">*</span></label>
          <input
            placeholder="Name"
            required
            value={clientName}
            ref={nameRef}
            onChange={getSearchSuggestions}
            onFocus={(e) => e.target.select()}
            onBlur={() => setTimeout(() => setSearchSuggestions([]), 150)}
            className={`border p-3 font-montserrat bg-white w-full rounded-md focus:outline-none focus:shadow-outline ${nameError ? 'border-red-500' : 'border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300'}`}
          />
          {nameError && <p className="text-red-500 font-montserrat">{error.name}</p>}
          <div>
              {searchSuggestions.length > 0 && clientName !== "" && (
                <ul  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48" >
                  {searchSuggestions.map((name, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                        onClick={handleSearchTermSelection}
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

        {/* Contact Number Input */}
        <div className="flex flex-col">
          <label className="font-montserrat font-medium text-lg mb-1">Contact Number <span className="text-red-500">*</span></label>
          <input
            placeholder="Contact Number"
            value={mobileNumber}
            onChange={handleInputChange}
            required
            ref={mobileRef}
            onFocus={(e) => e.target.select()}
            className={`border p-3 font-montserrat w-full bg-white rounded-md focus:outline-none focus:shadow-outline ${numberError ? 'border-red-500' : 'border-gray-400  focus:border-blue-300 focus:ring focus:ring-blue-300'}`}
          />
          {numberError && mobileNumber !== "" && <p className="text-red-500 font-montserrat">{error.number}</p>}
        </div>

        {/* Appointment Period Dropdown */}
        <div className="flex flex-col justify-between">
          <label className="font-montserrat font-medium text-lg mb-1">Appointment Period</label>
          <Dropdown
            className={`border p-2 font-montserrat w-full bg-white rounded-md border-gray-400`}
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: '50px',
              }),
            }}
            placeholder="Select Time Period"
            options={appointmentTimePeriod}
            value={selectedPeriod}
            onChange={(selectedOption) => {
              setSelectedPeriod(selectedOption.target.value);
              setError({ period: "" });
            }}
          />
        </div>

        {/* Appointment Date Input */}
        {/* <div className="flex flex-col w-full mt-2">
          <label className="font-montserrat text-lg mb-1">Appointment Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            defaultValue={getFormattedDate()}
            ref={periodRef}
            value={appDate}
            min={getFormattedDate()}
            onChange={(selectedOption) => {
              setAppDate(selectedOption.target.value);
              setError({ period: "" });
            }}
            className={`border p-3 bg-white ${periodError ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'} font-montserrat w-full rounded-md`}
          />
          {periodError && <p className="text-red-500 font-montserrat mt-2">{error.period}</p>}
        </div> */}

        {/* Toast Messages */}
        {successMessage && <SuccessToast message={successMessage} />}
        {toast && <ToastMessage message={toastMessage} type="error" />}
        {toast && <ToastMessage message={toastMessage} type="warning" />}

        {/* Submit or Update Buttons */}
        <div className="flex flex-col gap-4 justify-end mt-6 w-full">
          {editMode ? (
            <>
              <button
                type="button"
                onClick={handleUpdateAppointment}
                disabled={isButtonDisabled}
                className={`w-full flex items-center justify-center font-montserrat py-3 px-6 
                  ${isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'} 
                  rounded-md mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg`}
              >
                <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
                Update Appointment
              </button>

              <button
                type="button"
                onClick={handleCancelAppointment}
                className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-red-500 rounded-md text-white transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl sm:text-2xl mr-2" />
                Cancel Appointment
              </button>

            </>
          ) : (
            <button
            type="button"
            onClick={handleFormSubmit}
            disabled={clientNumberExists || isButtonDisabled}
            className={`w-full flex items-center justify-center font-montserrat py-3 px-6 
              ${clientNumberExists || isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white'} 
              rounded-md mt-2 
              ${!clientNumberExists && !isButtonDisabled && 'transition-transform duration-200 ease-in-out active:scale-95 hover:bg-green-600'} 
              text-sm sm:text-lg`}
          >
            <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
            Book Appointment
          </button>

          )}
        </div>
      </div>
    </div>
  </div>
</form>

  );
}
