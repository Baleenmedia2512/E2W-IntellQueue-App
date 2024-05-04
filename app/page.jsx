'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';

const ClientsData = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource, vendorName, vendorContact, clientAge} = clientDetails;
  const sources = ['1.JustDial', '2.IndiaMart', '3.Sulekha', '4.Self', '5.Consultant', '6.Own', '7.WebApp DB', '8.Online', '9. Friends/Relatives'];

  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);

  const [inputValue, setInputValue] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter()

  const isDetails = useAppSelector(state => state.quoteSlice.isDetails);
  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    fetch(`https://orders.baleenmedia.com/API/SuggestingClientNames.php/get?suggestion=${newName}`)
      .then((response) => response.json())
      .then((data) => setClientNameSuggestions(data));
    dispatch(setClientData({clientName: newName}));
  };

  const handleConsultantNameChange = (event) => {
    const newName = event.target.value;
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}`)
      .then((response) => response.json())
      .then((data) => setConsultantNameSuggestions(data));
    dispatch(setClientData({ consultantName: newName }));
  };

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  const handleClientNameSelection = (event) => {
    const input = event.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

    setClientNameSuggestions([]);
    dispatch(setClientData({clientName: name}));
    dispatch(setClientData({clientContact: number}));
    fetchClientDetails(name, number);
  };

  const handleConsultantNameSelection = (event) => {
    const input = event.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
  
    setConsultantNameSuggestions([]);
    dispatch(setClientData({ consultantName: name }));
    dispatch(setClientData({ consultantContact: number })); 
    // fetchConsultantDetails(name, number);
  };
  

  const fetchClientDetails = (clientName, clientNumber) => {
    axios
      .get(`https://orders.baleenmedia.com/API/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}`)
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const clientDetails = data[0];
          dispatch(setClientData({clientEmail: clientDetails.email}));
          dispatch(setClientData({clientSource: clientDetails.source}));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }; 

  useEffect(() => {    
        if (!loggedInUser) {
          router.push('/login');
        }
        
        if(clientName){
          dispatch(resetClientData());
          dispatch(resetQuotesData());
        }
  }, []);

  const handleClientContactChange = (newValue) => {
    dispatch(setClientData({ clientContact: newValue }));
  };

  const handleClientEmailChange = (newValue) => {
    dispatch(setClientData({ clientEmail: newValue }));
  };

  const handleClientSourceChange = (selectedOption) => {
    dispatch(setClientData({ clientSource: selectedOption.value }));
  };

  const handleVendorChange = (newValue) => {
    dispatch(setClientData({ vendorName: newValue }));
  };

  const submitDetails = async() => {
    if(isDetails && clientName && clientContact && clientSource){
      dispatch(setQuotesData({currentPage: "checkout"}))
      router.push('/adDetails')
    }
    else{
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&
      JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
        if (clientName !== '' && clientContact !== '' && clientSource !== '') {
          dispatch(resetQuotesData())
          router.push('../adDetails');
        }
        else {
          showToastMessage('warning', 'Please fill all the Required Client Details!')
        }
        //setMessage(data.message);
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
      }
      
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  }
  }
// Function to format the date as dd-MON-yyyy
function formatDate(date) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(date.getDate()).padStart(2, '0');
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const month = months[monthIndex];
  return `${day}-${month}-${year}`;
}

// Handle input change
// const handleInputChange = (event) => {
//   const inputDate = new Date(event.target.value);
//   if (!isNaN(inputDate.getTime())) { // Check if valid date
//       setInputValue(formatDate(inputDate));
//   }
// };

const handleInputChange = (event) => {
  const inputDate = new Date(event.target.value);
  if (!isNaN(inputDate.getTime())) {
    setInputValue(formatDate(inputDate));
    const today = new Date();
    const age = today.getFullYear() - inputDate.getFullYear();
    if (
      today.getMonth() < inputDate.getMonth() ||
      (today.getMonth() === inputDate.getMonth() && today.getDate() < inputDate.getDate())
    ) {
      dispatch(setClientData({ age: age - 1 }));
    } else {
      dispatch(setClientData({ age: age }));
    }
  } else {
    // If the entered date is invalid, clear both age and DOB fields
    dispatch(setClientData({ age: '' }));
    dispatch(setClientData({ dob: '' }));
  }
};


const handleInputAgeChange = (event) => {
  const inputDate = new Date(event.target.value);
  if (!isNaN(inputDate.getTime())) { // Check if valid date
    setInputValue(formatDate(inputDate)); // Update the input value
    const age = calculateAge(inputDate); // Calculate age
    dispatch(setClientData({ clientAge: age })); // Update client age in state
  }
};

// Function to calculate age
const calculateAge = (birthDate) => {
  const today = new Date();
  const diff = today - birthDate; // Difference in milliseconds
  const ageDate = new Date(diff); // Unix epoch date
  return Math.abs(ageDate.getUTCFullYear() - 1970); // Return the age
};


  return (
    <div className="flex flex-col justify-center mt-8 mx-[8%]">
      <form class="px-7 h-screen grid justify-center items-center ">
    <div class="grid gap-6" id="form">
    <h1 className="font-bold text-3xl text-center mb-4 ">Client Registration</h1>
      <div class="w-full flex gap-3">
      <select
        className="capitalize shadow-2xl p-3 ex w-24 outline-none focus:border-solid focus:border-[1px] border-[#035ec5] justify-center"
        id="Title"
        name="Title"
        required
      >
        <option value="Mr.">Mr.</option>
        <option value="Miss.">Miss.</option>
        <option value="Mrs.">Mrs.</option>
        <option value="Ms.">Ms.</option>
      </select>
        <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#035ec5]" type="text" placeholder="Name" id="Name" name="Name" required 
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}/>
      </div>
      {clientNameSuggestions.length > 0 && (
          <ul className="list-none">
            {clientNameSuggestions.map((name, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="text-purple-500 hover:text-purple-700"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      <div class="grid gap-6 w-full">
        <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="number" placeholder="Contact Number" id="contact" name="contact" required value={clientContact}
        onChange={(e) => handleClientContactChange(e.target.value)}/>
        <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="Email" placeholder="Email" id="Email" name="email" value={clientEmail}
        onChange={(e) => handleClientEmailChange(e.target.value)}/>
      </div>
      <div class="w-full flex gap-3">
        <input className='capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#035ec5] justify-center' type='number' placeholder="Age" value={clientDetails.clientAge} />

        <input class="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px]border-[#035ec5]" type="date" onChange={handleInputAgeChange}/>
      </div>
      <div class="flex gap-3">
      <textarea
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#035ec5]"
        id="address"
        name="address"
        placeholder="Address"
      ></textarea>
        {/* <input class="p-3 glass shadow-2xl  w-full outline-none focus:border-solid focus:border-[1px] border-[#035ec5]" type="text" placeholder="Confirm password" required="" /> */}
      </div>
      <div className='grid gap-6 w-full'>
      <select
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#035ec5]"
        id="source"
        name="source"
      >
        <option value="">Select Source</option>
        {sources.map((source, index) => (
          <option key={index} value={source}>
            {source}
          </option>
        ))}
      </select>
      <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="text" placeholder="Consultant Name" id="consultantname" name="consultantname" required = {clientSource === '5.Consultant' ? true : false} onChange={handleConsultantNameChange} value={clientDetails.consultantName}/>
      {consultantNameSuggestions.length > 0 && (
  <ul className="list-none">
    {consultantNameSuggestions.map((name, index) => (
      <li key={index}>
        <button
          type="button"
          className="text-purple-500 hover:text-purple-700"
          onClick={handleConsultantNameSelection}
          value={name}
        >
          {name}
        </button>
      </li>
    ))}
  </ul>
)}
      <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="number" placeholder="Consultant Number" id="consultantnumber" name="consultantnumber" required = {clientSource === '5.Consultant' ? true : false}/>
      </div>
      <button class="outline-none glass shadow-2xl  w-full p-3  bg-[#ffffff] hover:border-[#035ec5] hover:border-solid hover:border-[1px]  hover:text-[#035ec5] font-bold" type="submit">Submit</button>
    </div>
  </form>
      {/* <div className='w-full mt-8 justify-center items-center text-black'>
        <h1 className="font-bold text-3xl text-center mb-4 mt-4">Enter client details</h1>
        {/* <h1 className='text-3xl'>Client Details</h1>
        <label className="flex flex-col items-left text-lg mb-2">Client Name</label>
        <input
          className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
          type="text"
          placeholder="Client Name"
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}
          onFocus={(e) => e.target.select()}
        />
        {clientNameSuggestions.length > 0 && (
          <ul className="list-none">
            {clientNameSuggestions.map((name, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="text-purple-500 hover:text-purple-700"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}

      <label className='mt-4'>Client Contact</label>
      <input
        className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
        type="text"
        placeholder="Client Contact"
        value={clientContact}
        onChange={(e) => handleClientContactChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <label>Client Email</label>
      <input
        className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
        type="email"
        placeholder="Client Email"
        value={clientEmail}
        onChange={(e) => handleClientEmailChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />

      <label>Source</label>
      <Select
        value={{ label: clientSource, value: clientSource }}
        onChange={handleClientSourceChange}
        options={sources.map((source) => ({ label: source, value: source }))}
      />
      </div>
      <div className='flex flex-row items-center justify-center'>
      <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-600 mt-4"
          onClick={() => { submitDetails() }}
        >
          Submit
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-600 mt-4 ml-4"
          onClick={() => {
            if(clientName && clientContact && clientSource){ 
            router.push('/adDetails')
            Cookies.set('isSkipped',true)
            } else{
              dispatch(setQuotesData({currentPage: 'adDetails'}));
              router.push('/adDetails');
            }
          }}
        >
          Skip
        </button>
      </div>

      <div className="bg-surface-card p-8 rounded-2xl mb-4">
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div> */}
    </div>

  );
};

export default ClientsData;