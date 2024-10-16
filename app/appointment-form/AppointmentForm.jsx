"use client";
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faCheck, faSearch, faSms } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import { FetchSeachTerm } from '../api/getSearchTerm';
import { Dropdown } from 'primereact/dropdown';

export default function AppointmentForm() {
  const inputRef = useRef(null);
  const nameRef = useRef(null);
  const mobileRef = useRef(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [clientNameError, setClientNameError] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientName, setClientName] = useState("");
  const [appointmentTime, setAppointmentTime] = useState();
  const [appointmentDate, setAppointmentDate] = useState();
  const [appointmentMessage, setAppointmentMessage] = useState("");
  const [hours, setHours] = useState(30)
  const appointmentTimePeriod = [
    { label: 'Week 1', value: 'Week 1' },
    { label: '10 Days', value: '10 Days' },
    { label: '2 Weeks', value: '2 Weeks' },
    { label: '4 Weeks', value: '4 Weeks' },
    { label: '6 Weeks', value: '6 Weeks' }
  ];

  useEffect(() => {
    inputRef?.current.focus();
  }, []);

  // Handling Search suggestions fetch
  async function getSearchSuggestions(e) {
    const inputData = e.target.value;
    setSearchTerm(inputData);
    const searchSuggestionsData = await FetchSeachTerm(inputData);
    setSearchSuggestions(searchSuggestionsData);
  };

  function handleSearchTermSelection(e) {
    const selectedValue = e.target.value;
    const arrayValues = selectedValue.split("-");
    setSearchTerm(selectedValue);
    setSearchSuggestions([]);
    setClientName(arrayValues[1]);
    setMobileNumber(arrayValues[2]);
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    const validPattern = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
    if (value.length > 10 && !value.includes("+")) return;
    if (value.includes("+") && value.length > 13) return;

    if (validPattern.test(value)) {
      setError("");
    } else {
      setError("Invalid Mobile Number Format");
    }
    setMobileNumber(value);
  };

  const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedTime = () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  function containsInteger() {
    // Check if the string contains both letters and digits
    const regex = /\d/.test(clientName);
    return regex;
  }

  const timeOptions = [];
  for (let i = 30; i <= 180; i += 30) {
    timeOptions.push(i);
  }

  async function handleFormSubmit() {
    if(clientName === ""){
      nameRef?.current.focus();
      setClientNameError("Please Enter a client Name")
      return
    }

    if(mobileNumber === ""){
      mobileRef?.current.focus();
      setError("Please Enter Client Contact");
      return;
    }

    // if(containsInteger){
    //   nameRef?.current.focus();
    //   setClientNameError("Name should not contain numbers");
    //   return;
    // }
    try {
      const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/Insert.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          JsonName: clientName,
          JsonContact: mobileNumber,
          JsonMessage: "Appointment fixed on " + (appointmentDate ? appointmentDate : getFormattedDate()) + " @" + (appointmentTime ?  appointmentTime :  getFormattedTime()) + " for " + hours + " mins.",
          JsonUser: "Siva",
        }),
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        const errorData = await response.json();
        errorMessage += ` - ${errorData.error || "Unknown error"}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      alert("Client Added Successfully!");
    } catch (error) {
      console.error("Form submission failed:", error);
      alert(`Form submission failed: ${error.message}`);
    }
  }

  // useEffect(() => {
  //   if(appointmentDate && appointmentTime && hours){
  //     setAppointmentMessage("Appointment fixed on " + appointmentDate + " @" + appointmentTime + " for " + hours)
  //   }
  // }, [appointmentDate, appointmentTime, hours]);

  const handleTouchStart = () => {
    // Blur the input to remove the keyboard
    if (inputRef.current) {
      inputRef.current.blur();
    }
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
        <div className="w-full m-auto max-w-[400px] h-auto">
          <h1 className="text-blue-500 font-montserrat font-bold text-2xl mb-4">Get In Touch</h1>
          <div className="flex flex-col space-y-4" onTouchStart={handleTouchStart}>
            <div className="flex flex-col">
              <label className="font-montserrat text-lg mb-1">Search</label>
              <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
                <input
                  className="p-3 font-montserrat bg-white w-full rounded-md focus:border-blue-500 focus:outline-none"
                  type="text"
                  id="RateSearchInput"
                  placeholder="Search Here.."
                  ref={inputRef}
                  value={searchTerm}
                  onChange={getSearchSuggestions}
                  onFocus={(e) => { e.target.select(); }}
                />
                <div className="px-3">
                  <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
                </div>
              </div>
              <div>
              {searchSuggestions.length > 0 && searchTerm !== "" && (
                <ul  className="absolute z-10 mt-1 w-fit bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48" >
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
              <label className="font-montserrat text-lg mb-1">Name <span className="text-red-500">*</span></label>
              <div>
                <input
                  placeholder="Your Name"
                  required
                  value={clientName}
                  ref={nameRef}
                  onChange={e => {setClientName(e.target.value); setClientNameError("")}}
                  onFocus={e => e.target.select()}
                  className="border p-3 border-gray-400 font-montserrat bg-white w-full rounded-md focus:border-blue-500 focus:outline-none"
                />
                {clientNameError && <p className="text-red-500 font-montserrat">{clientNameError}</p>}
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
                  className={`border p-3 font-montserrat w-full bg-white rounded-md ${error ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'} focus:outline-none`}
                />
                {error && <p className="text-red-500 font-montserrat">{error}</p>}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <label className="font-montserrat text-lg mb-1">Appointment Period <span className="text-red-500">*</span></label>
              <Dropdown
              className={`border p-3 font-montserrat w-full bg-white rounded-md ${error ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'} focus:outline-none`}
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
              options={appointmentTimePeriod}
              // value={selectedValues.rateName.value}
              // onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
              // options={{label: '1 Week', value: '1 Week'}}
              
            />
            {error && <p className="text-red-500 font-montserrat">{error}</p>}
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

          <div className="flex gap-4 justify-end mt-6 w-full">
            <button
              type="button"
              onClick={handleFormSubmit}
              className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-green-500 rounded-full text-white mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </form>
    
  );
}
