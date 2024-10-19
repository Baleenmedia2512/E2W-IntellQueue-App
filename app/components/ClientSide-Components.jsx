"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faCheck, faSearch, faSms } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef, useEffect } from 'react';

export function SubmitButton() {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center font-montserrat py-3 px-6 bg-green-500 rounded-full text-white mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-green-600"
    >
      <FontAwesomeIcon icon={faCheck} className="text-xl sm:text-2xl mr-2" />
      Submit
    </button>
  );
}

export function SendSMSButton() {
  return (
    <button
      type="button"
      //type="submit"
      className="flex items-center justify-center font-montserrat py-3 px-6 bg-blue-500 rounded-full text-white mt-2 transition-transform duration-200 ease-in-out active:scale-95 text-sm sm:text-lg hover:bg-blue-600"
    >
      <FontAwesomeIcon icon={faSms} className="text-xl sm:text-2xl mr-2" />
      Send SMS
    </button>
  );
}

export function MessageTextArea() {
  return (
    <textarea
      rows={3}
      placeholder="Enter your message here"
      className="p-3 font-montserrat border bg-white border-gray-400 rounded-md focus:border-blue-500 focus:outline-none w-full"
      disabled
    />
  );
}

export function ClientContactText() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    let value = e.target.value;

    if (!value) {
      setMobileNumber(value);
      setError("");
      return;
    }

    // Regular expression to match mobile numbers with +91 or 0 at the start
    const validPattern = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;

    // Remove spaces or non-digit characters from input
    value = value.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    if (value.length > 10 && !value.includes("+")) {
      return;
    }

    if (value.includes("+") && value.length > 13) {
      return;
    }

    // Validate the number based on the pattern
    if (validPattern.test(value)) {
      setError("");
    } else {
      setError("Invalid Mobile Number Format");
    }
    setMobileNumber(value);
  };

  return (
    <div>
      <input
        placeholder="Mobile Number"
        value={mobileNumber}
        onChange={handleInputChange}
        required
        onFocus={e => e.target.select()}
        className={`border p-3 font-montserrat w-full bg-white rounded-md ${error ? 'border-red-500' : 'border-gray-400 focus:border-blue-500'} focus:outline-none`}
      />
      {error && <p className="text-red-500 font-montserrat">{error}</p>}
    </div>
  );
}

export function ClientNameText() {
    return (
        <input
        placeholder="Your Name"
        required
        onFocus={e => e.target.select()}
        className="border p-3 border-gray-400 font-montserrat bg-white w-full rounded-md focus:border-blue-500 focus:outline-none"
        />
    );
}

export function SearchText() {
  const inputRef = useRef(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // const searchSuggestions = ["HI"]
  const handleUserClick = () => {
      inputRef?.current.focus();
  };
  
  async function getSearchSuggestions(e){
    setSearchTerm(e.target.value);

    const requestData = {
      JsonSearchTerm: searchTerm
    }
    try{
      const response = await fetch("https://orders.baleenmedia.com/API/Hospital-Form/Search.php",{
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if(!response.ok){
        throw new Error(`HTTP error! Status: ${response.data}`)
      }

      const data = await response.json();
      setSearchSuggestions(data)
    } catch(error){
      console.error(error);
    }
}

  function handleSearchTermSelection(e){
    var selectedValue = ""
    selectedValue = e.target.value;
    var arrayValues = selectedValue.split("-");
    console.log(arrayValues)
  }
  useEffect(() => {
      handleUserClick()
  }, []);

  return (
    <div>
    <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
      <input
        className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0"
        type="text"
        id="RateSearchInput"
        placeholder="Search Here.."
        ref={inputRef}
        value={searchTerm}
        onChange={getSearchSuggestions}
        onFocus={(e) => { e.target.select() }}
      />
      <div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500 " />
      </div>
     
    </div>
     <div className="relative">
     {searchSuggestions.length > 0 && (
       <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
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
  );
}

export function FormDatePicker(){

    const getFormattedDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return(
        <input type='date' defaultValue={getFormattedDate()} className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md '/>
    )
}

export function FormTimePicker(){

    const getFormattedTime = () => {
        const date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

    return(
        <input type='time' defaultValue={getFormattedTime()} className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md '/>
    )
}

import React from 'react';

export const TimeDropdown = () => {
  // Generate an array of time intervals (in minutes) from 30 to 180 (3 hours)
  const timeOptions = [];
  for (let i = 30; i <= 180; i += 30) {
    timeOptions.push(i);
  }

  return (
    <div>
      <label className="font-montserrat text-lg mb-1">No. Of Hours <span className="text-red-500">*</span></label>
      <select id="timeSelect" className='border p-3 bg-white border-gray-400 font-montserrat w-full rounded-md '>
        {timeOptions.map((minutes) => (
          <option key={minutes} value={minutes}>
            {`${Math.floor(minutes / 60)}h ${minutes % 60}m`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeDropdown;
