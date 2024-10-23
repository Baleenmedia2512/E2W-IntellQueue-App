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

export default function AppointmentForm() {
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const periodRef = useRef(null);
  const userName = useAppSelector(state => state.authSlice.userName);
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
  const [appointmentId, setAppointmentId] = useState(0)

  const appointmentTimePeriod = [
    { label: '1 Week', value: '1 Week' },
    { label: '10 Days', value: '10 Days' },
    { label: '2 Weeks', value: '2 Weeks' },
    { label: '4 Weeks', value: '4 Weeks' },
    { label: '6 Weeks', value: '6 Weeks' }
  ];


  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      // Close the dropdown if the click is outside of it
      setSearchSuggestions([]);
    }
  };
  useEffect(() => {
    // Add event listener to detect clicks outside the dropdown
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    searchRef?.current.focus();
  }, []);

  async function getExistingAppointment(e){
    const inputData = e.target.value;
    setSearchTerm(inputData);
    const existingAppointmentData = await FetchExistingAppointments(inputData);
    setExistingAppointments(existingAppointmentData);
  }

  function handleAppointmentSearchSelection(e) {
    const selectedValue = e.target.value;
    const arrayValues = selectedValue.split("-").map(value => value.trim());

    setSearchTerm(selectedValue)
    setClientId(arrayValues[0]);
    setClientName(arrayValues[1]);
    setMobileWithoutString(arrayValues[2]);
    setSelectedPeriod(arrayValues[3]);
    setAppointmentId(arrayValues[4]);
    setExistingAppointments([])

    setDisplayClientId(arrayValues[0]);
    setDisplayClientName(arrayValues[1]);
    const cleanedMobile = arrayValues[2].replace(/\D/g, "");
    setDisplayMobileNumber(cleanedMobile);
    setEditMode(true);
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

  const handleInputChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    const validPattern = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    if (value.length > 10 && !value.includes("+")) return;
    if (value.includes("+") && value.length > 13) return;

    if (validPattern.test(value)) {
      setError({number: ""});
    } else {
      setError({number: "Invalid Mobile Number Format"});
    }
    setMobileNumber(value);
  };

  function setMobileWithoutString(contactNumber) {
    // Check if the string contains both letters and digits
    let value = contactNumber;
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    const validPattern = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
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

  const calculateFutureDate = () => {
    const today = new Date(); // Get today's date
    let daysToAdd = 0;
  
    // Parse the time period (e.g., "3 weeks" or "10 days")
    const [amount, period] = selectedPeriod.split(" ");
  
    // Convert weeks or days to the equivalent number of days
    if (period.includes("Weeks")) {
      daysToAdd = parseInt(amount) * 7; // 1 week = 7 days
    } else if (period.includes("Days")) {
      daysToAdd = parseInt(amount); // Directly add days
    }
  
    // Add the calculated days to today's date
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysToAdd);
  
    return futureDate.toISOString().slice(0, 10); // Format the date to a readable string
  };

  async function addNewClient() {
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

    } catch (error) {
      //console.error(error);
      alert(error);
    }
  }

  async function handleFormSubmit() {
    if(clientName === ""){
      nameRef?.current.focus();
      setError({name: "Please Enter a client Name"})
      return
    }

    if(mobileNumber === ""){
      mobileRef?.current.focus();
      setError({number: "Please Enter Client Contact"});
      return;
    }

    if(selectedPeriod === ""){
      periodRef?.current.focus();
      setError({period: "Select a valid Date Range!"});
      return;
    }
    // if(containsInteger){
    //   nameRef?.current.focus();
    //   setClientNameError("Name should not contain numbers");
    //   return;
    // }
    if(clientId === 0){
      setShowAlert(true);
      return;
    }

    if(clientId !== 0){
      addAppointment(clientId);
    }
  }

  // const addAppointment = async(clientId) => {
  //   const appointmentDate = calculateFutureDate();
  //   try {
  //     const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/Insert.php", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         JsonUserName: userName,
  //         JsonClientId: clientId,
  //         JsonDate: appointmentDate,
  //       }),
  //     });

  //     if (!response.ok) {
  //       let errorMessage = `Error ${response.status}: ${response.statusText}`;
  //       const errorData = await response.json();
  //       errorMessage += ` - ${errorData.error || "Unknown error"}`;
  //       throw new Error(errorMessage);
  //     }

  //     const weeks = parseInt(selectedPeriod.match(/\d+/)[0]);
  //     const send = await fetch(`https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=95445308244&APIKey=duxby0porheW2IM798tNKCPYH&Contact=91${mobileNumber}&Template=appointment_reminder_tamil&Param=${clientName},${weeks}`)
  //     const data = await response.json();
  //     console.log(send)
  //     setClientId(0);
  //     setClientName("");
  //     setMobileNumber("");
  //     setSelectedPeriod("");

  //     setDisplayClientId("");
  //     setDisplayClientName("");
  //     setDisplayMobileNumber("");
  //     alert("Appoitment Created Successfully!");
  //   } catch (error) {
  //     console.error("Form submission failed:", error);
  //     alert(`Form submission failed: ${error.message}`);
  //   }
  // }


  const addAppointment = async (clientId) => {
    const appointmentDate = calculateFutureDate();
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
          JsonUserName: userName,
          JsonClientId: clientId,
          JsonDate: appointmentDate,
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
      
      // Extract weeks from the selectedPeriod
      const weeks = parseInt(selectedPeriod.match(/\d+/)[0]);
      
      // Log mobileNumber and clientName to verify if they are available and correct
      console.log("Mobile Number for WhatsApp:", mobileNumber); // Debugging log
      console.log("Client Name for WhatsApp:", clientName); // Debugging log
      
      // Call the WhatsApp API
      const sendResponse = await fetch(`https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=95445308244&APIKey=duxby0porheW2IM798tNKCPYH&Contact=91${mobileNumber}&Template=appointment_reminder_tamil&Param=${clientName},${weeks}`);
  
      // Check if WhatsApp message sent successfully
      if (sendResponse.ok) {
        console.log("WhatsApp message sent successfully."); // Debugging log
        
        const insertWhatsAppData = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/UpdateMessageHeader.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            JsonName: clientName,
            JsonContactNumber: mobileNumber,
            JsonTemplateName: "appointment_reminder_tamil",
            JsonStatus: 1,  // Status set to 1
            JsonSID: 2,     // SID set to 2
            JsonCreatedOn: new Date().toISOString(),  // Current date and time
          }),
        });
        
        
        if (!insertWhatsAppData.ok) {
          throw new Error("Failed to insert data into whatsapp_table.");
        } else {
          console.log("Data inserted into whatsapp_table successfully."); // Debugging log
        }
      } else {
        throw new Error("WhatsApp message not sent successfully.");
      }
  
      // Reset the form and show success message
      const data = await response.json();
      console.log(sendResponse);
      console.log("Success:", data);
      setClientId(0);
      setClientName("");
      setMobileNumber("");
      setSelectedPeriod("");
  
      setDisplayClientId("");
      setDisplayClientName("");
      setDisplayMobileNumber("");
      alert("Appointment Created and WhatsApp message sent successfully!");
    } catch (error) {
      console.error("Form submission failed:", error);
      alert(`Form submission failed: ${error.message}`);
    }
};


  async function handleUpdateAppointment() {
    const appointmentDate = calculateFutureDate();
    try {
      const response = await fetch(`https://orders.baleenmedia.com/API/Hospital-Form/Update.php?JsonUserName=${encodeURIComponent(userName)}&JsonAppointmentId=${encodeURIComponent(appointmentId)}&JsonDate=${encodeURIComponent(appointmentDate)}`, {
        method: "GET", // Use GET method
        headers: {
            "Content-Type": "application/json",
        }
    });    
    const weeks = parseInt(selectedPeriod.match(/\d+/)[0]);
    const send = await fetch(`https://app.tendigit.in/api/sendtemplate.php?LicenseNumber=95445308244&APIKey=duxby0porheW2IM798tNKCPYH&Contact=91${mobileNumber}&Template=reminder_reschedule_tamil&Param=${clientName},${weeks}`)
    console.log(send)    
    // console.log(response.text());
        // if (!response.ok) {
        //     let errorMessage = `Error ${response.status}: ${response.statusText}`;
        //     const errorData = await response.text();
        //     console.log(errorData)
        //     errorMessage += ` - ${errorData.error || "Unknown error"}`;
        //     throw new Error(errorMessage);
        // }

        alert("Appointment Rescheduled Successfully!");
    } catch (error) {
        console.error(error);
    }
}

  async function handleCancelAppointment() {
    handleEditMode();
  }
  // useEffect(() => {
  //   if(appointmentDate && appointmentTime && hours){
  //     setAppointmentMessage("Appointment fixed on " + appointmentDate + " @" + appointmentTime + " for " + hours)
  //   }
  // }, [appointmentDate, appointmentTime, hours]);

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
      <div className="flex flex-col md:flex-row flex-2">
        <div className="w-full m-auto max-w-[400px] h-auto">
          <Image
            src="/BG_Image.jpg"
            alt="Background Image"
            width={400}
            height={200}
            layout="responsive"
            className='w-4 h-4'
            priority
            blurDataURL='data:text/plain;base64,SGVsbG8sIFdvcmxkIQ=='
          />
        </div>
        {showAlert &&
          <CustomAlert 
          message="You are adding appointment for a new client. Do you want to proceed?"
          onOk={addNewClient}
          onCancel={() => {return}}
          />
        }
        
        <div className="w-full m-auto max-w-[400px] h-auto">
          <h1 className="text-blue-500 font-montserrat font-bold text-2xl mb-4">Appointment Manager</h1>
          <div className="flex flex-col space-y-4" onTouchStart={handleTouchStart}>
          {editMode && clientId !== 0 && (
            <div className="w-fit bg-blue-50 border border-blue-200 rounded-lg flex items-center shadow-md">
              <button 
                className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
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
            <div className="flex flex-col">
              <label className="font-montserrat text-lg mb-1">Search</label>
              <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
                <input
                  className="p-3 font-montserrat bg-white w-full rounded-md focus:border-blue-500 focus:outline-none"
                  type="text"
                  id="RateSearchInput"
                  placeholder="Search Here.."
                  ref={searchRef}
                  value={searchTerm}
                  onChange={getExistingAppointment}
                  onFocus={(e) => { e.target.select(); }}
                />
                <div className="px-3">
                  <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
                </div>
              </div>
              <div>
              {existingAppointments.length > 0 && searchTerm !== "" && (
                <ul  className="absolute z-10 mt-1 w-fit bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48" >
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

          <div className="flex flex-col">
      <label className="font-montserrat text-lg mb-1">
        Name <span className="text-red-500">*</span>
      </label>
      <div>
        <input
          placeholder="Your Name"
          required
          value={clientName}
          ref={nameRef}
          onChange={getSearchSuggestions}
          onFocus={(e) => e.target.select()}
          className={`border p-3 font-montserrat bg-white w-full rounded-md ${nameError ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'}`}
        />
        {nameError && <p className="text-red-500 font-montserrat">{error.name}</p>}
      </div>
      <div>
        {searchSuggestions.length > 0 && clientName !== '' && (
          <ul
            ref={dropdownRef} // Attach the dropdown ref here
            className="absolute z-10 mt-1 w-fit bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48"
          >
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

            <div className="flex flex-col">
              <label className="font-montserrat text-lg mb-1">Contact Number <span className="text-red-500">*</span></label>
              <div>
                <input
                  placeholder="Mobile Number"
                  value={mobileNumber}
                  onChange={handleInputChange}
                  required
                  ref={mobileRef}
                  onFocus={e => e.target.select()}
                  className={`border p-3 font-montserrat w-full bg-white rounded-md ${numberError ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'}`}
                />
                {numberError && <p className="text-red-500 font-montserrat">{error.number}</p>}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <label className="font-montserrat text-lg mb-1">Appointment Period <span className="text-red-500">*</span></label>
              <Dropdown
              className={`border p-2 --font-montserrat w-full bg-white rounded-md ${periodError ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'}`}
            //  className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline
            //   ${error ? 'border-red-400' : 'border-gray-300'}
            //   focus:border-blue-300 focus:ring focus:ring-blue-300`}
            
              
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Time Period"
              ref={periodRef}
              options={appointmentTimePeriod}
              value={selectedPeriod}
              onChange={(selectedOption) => {setSelectedPeriod(selectedOption.target.value); setError({period: ""})}}   
            />
            {periodError && <p className="text-red-500 font-montserrat mt-2">{error.period}</p>}
              {/* <div className="flex flex-col w-full">
                <label className="font-montserrat text-lg mb-1">Appt. Date <span className="text-red-500">*</span></label>
                <input
                  type='date'
                  defaultValue={getFormattedDate()}
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md'
                />
              </div>
              <div className="flex flex-col w-full ml-2">
                <label className="font-montserrat text-lg mb-1">Appt. Time <span className="text-red-500">*</span></label>
                <input
                  type='time'
                  defaultValue={getFormattedTime()}
                  className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md'
                  value={appointmentTime}
                  t
                  onChange={e => setAppointmentTime(e.target.value)}
                />
              </div> */}
            </div>

           {/* <div className="flex flex-col">
              <label className="font-montserrat text-lg mb-1">No. Of Hours <span className="text-red-500">*</span></label>
              <select id="timeSelect" className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md' value={hours} onChange={e => setHours(e.target.value)}>
                {timeOptions.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {`${Math.floor(minutes / 60)}h ${minutes % 60}m`}
                  </option>
                ))}
              </select>
                </div> */}
          </div>

          <div className="flex flex-col gap-4 justify-end mt-6 w-full">
          {editMode ? (
            <>
              {/* Update Appointment Button */}
              <button
                type="button"
                onClick={handleUpdateAppointment}
                className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-green-500 rounded-full text-white mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-green-600"
              >
                <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
                Update Appointment
              </button>

              {/* Cancel Appointment Button */}
              <button
                type="button"
                onClick={handleCancelAppointment}
                className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-red-500 rounded-full text-white transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-red-600"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl sm:text-2xl mr-2" />
                Cancel Appointment
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFormSubmit}
              className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-green-500 rounded-full text-white mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
              Book Appointment
            </button>
          )}
        </div>


        </div>
      </div>
    </form>
    
  );
}
