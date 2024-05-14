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
import { KeyboardReturn } from '@mui/icons-material';

const ClientsData = () => {
  //const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const loggedInUser = 'GraceScans'
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const [title, setTitle] = useState('Mr.');
  // const sources = ['1.JustDial', '2.IndiaMart', '3.Sulekha', '4.Self', '5.Consultant', '6.Own', '7.WebApp DB', '8.Online', '9. Friends/Relatives'];
  const sources = ['Self', 'Consultant', 'Online', 'Friends/Relatives', 'Others'];
  const [toast, setToast] = useState(false);
  const [clientAge, setClientAge] = useState();
  const [gender, setGender] = useState();
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [address, setAddress] = useState();
  const [inputValue, setInputValue] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState();
  const [displayWarning, setDisplayWarning] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [displayDOBWarning, setDisplayDOBWarning] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter()

  const isDetails = useAppSelector(state => state.quoteSlice.isDetails);
  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    fetch(`https://orders.baleenmedia.com/API/SuggestingClientNames.php/get?suggestion=${newName}&dbname=${'gracescans'}`)
      .then((response) => response.json())
      .then((data) => setClientNameSuggestions(data));
    dispatch(setClientData({clientName: newName}));
  };

  const handleConsultantNameChange = (event) => {
    const newName = event.target.value;
    setConsultantName(newName)
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}&dbname=${'gracescans'}`)
      .then((response) => response.json())
      .then((data) => setConsultantNameSuggestions(data));
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
    setConsultantName(name)
    setConsultantNumber(number);
    // fetchConsultantDetails(name, number);
  };
  

  const fetchClientDetails = (clientName, clientNumber) => {
    axios
      .get(`https://orders.baleenmedia.com/API/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}&dbname=${'gracescans'}`)
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const clientDetails = data[0];
          dispatch(setClientData({clientEmail: clientDetails.email}));
          dispatch(setClientData({clientSource: clientDetails.source}));
          setClientAge(clientDetails.Age);
          setInputValue(clientDetails.DOB);
          setAddress(clientDetails.address);
          setTitle(clientDetails.gender);
          setConsultantName(clientDetails.consname);
          setConsultantNumber(clientDetails.consnumber);
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
    dispatch(setClientData({ clientSource: selectedOption.target.value }));
  };

  const handleVendorChange = (newValue) => {
    dispatch(setClientData({ vendorName: newValue }));
  };

  const submitDetails = async(event) => {
    event.preventDefault()
    if(!loggedInUser === 'GraceScans'){
      if(isDetails && clientName && clientContact && clientSource){
        dispatch(setQuotesData({currentPage: "checkout"}))
        router.push('/adDetails')
      }
    else{
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${inputValue}&JsonAddress=${address}&dbname=${'gracescans'}&JsonGender=${title}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}`)
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
  }} 
  else{
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${inputValue}&JsonAddress=${address}&dbname=${'gracescans'}&JsonGender=${title}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
        if (clientName !== '' && clientContact !== '' && clientSource !== '' && address !== '' && clientAge !== undefined && inputValue !== undefined) {
          window.alert('Client Details Entered Successfully!')
          window.location.reload();
        }
        else {
          showToastMessage('warning', 'Please fill all the Required Client Details!')
        }
        //setMessage(data.message);
      } else {
        (`The following error occurred while inserting data: ${data}`);
      }
  }catch (error) {
    console.error('Error updating rate:', error);
  }
  }
}
// Function to format the date as dd-MON-yyyy
function formatDate(inputValue) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(inputValue.getDate()).padStart(2, '0');
  const monthIndex = inputValue.getMonth();
  const year = inputValue.getFullYear();
  const month = months[monthIndex];
  return `${day}-${month}-${year}`;
}


const handleInputChange = (event) => {
  const inputDate = new Date(event.target.value);
  if (!isNaN(inputDate.getTime())) { // Check if valid date
    setInputValue(event.target.value); // Update the input value
    const age = calculateAge(inputDate); // Calculate age
    setClientAge(age); // Update client age in state
  }
};

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const handleInputAgeChange = (event) => {
  const dob = event.target.value;
  const age = calculateAge(dob);
  setInputValue(dob);
  // setInputValue(formatDate(new Date(dob)));
  setClientAge(age);
};

  return (
    <div className="flex flex-col justify-center mt-8 mx-[8%]">
      <form class="px-7 h-screen grid justify-center items-center " onSubmit={submitDetails}>
    <div class="grid gap-6" id="form">
    <h1 className="font-bold text-3xl text-center mb-4 ">Client Registration</h1>
      <div class="w-full flex gap-3">
      <select
        className="capitalize shadow-2xl p-3 ex w-24 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
        id="Title"
        name="Title"
        value={selectedOption}
        //onChange={e => setTitle(e.target.value)}
        required
        onChange={(e) => {
          const selectedOption = e.target.value;
          setSelectedOption(selectedOption);
          setClientAge(""); // Clear the age input field when the title changes

        // Display DOB warning when selected option is "B/o."
        if (selectedOption === "B/o.") {
          setDisplayDOBWarning(true);
        } else {
          setDisplayDOBWarning(false);
        }
      }}
      >
        <option value="Mr.">Mr.</option>
        <option value="Miss.">Miss.</option>
        <option value="Mrs.">Mrs.</option>
        <option value="Ms.">Ms.</option>
        <option value="B/o.">B/o.</option>
        <option value="Baby.">Baby.</option>
        <option value="Master.">Master.</option>
      </select>
        <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" type="text" placeholder="Name" id="Name" name="Name" required 
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // Find the next input field and focus on it
              const inputs = document.querySelectorAll('input, select, textarea');
              const index = Array.from(inputs).findIndex(input => input === e.target);
              if (index !== -1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
              }
            }
          }}
          />
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
        <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" type="number" placeholder="Contact Number" id="contact" name="contact" required value={clientContact}
        onChange={(e) => handleClientContactChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" type="Email" placeholder="Email" id="Email" name="email" value={clientEmail}
        onChange={(e) => handleClientEmailChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
      </div>
      <div class="w-full flex gap-3 ">
        <input className='capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center' type='number' placeholder="Age" value={clientAge} onChange={(e) => {
        const { value } = e.target;
        setClientAge(value);

        // Display warning based on the selected option and age input value
        if ((selectedOption === "Baby." && parseInt(value) > 3) || 
            (selectedOption === "Master." && (parseInt(value) < 4 || parseInt(value) > 12))) {
          setDisplayWarning(true);
        } else {
          setDisplayWarning(false);
        }
      }}  
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
        />
        <input class="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" type="date" value={inputValue} onChange={handleInputAgeChange} onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Find the next input field and focus on it
      const inputs = document.querySelectorAll('input, select, textarea');
      const index = Array.from(inputs).findIndex(input => input === e.target);
      if (index !== -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    }
  }}/>
      </div>
      {displayWarning && (
      <div className={`text-red-600 ${selectedOption === "Baby." ? "ml-12" : "ml-9"}`}>
        {selectedOption === "Baby." && "The age should be less than 3."}
        {selectedOption === "Master." && "The age should be between 4 and 12."}
      </div>
    )}

{displayDOBWarning && (
      <div className="text-red-600 ml-9">Note: The DOB should be the baby's</div>
    )}
      <div class="flex gap-3">
      <textarea
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="address"
        name="address"
        placeholder="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Find the next input field and focus on it
            const inputs = document.querySelectorAll('input, select, textarea');
            const index = Array.from(inputs).findIndex(input => input === e.target);
            if (index !== -1 && index < inputs.length - 1) {
              inputs[index + 1].focus();
            }
          }
        }}
      ></textarea>
        {/* <input class="p-3 glass shadow-2xl  w-full outline-none focus:border-solid focus:border-[1px] border-[#035ec5]" type="text" placeholder="Confirm password" required="" /> */}
      </div>
      <div className='grid gap-6 w-full'>
      <select
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="source"
        name="source"
        defaultValue='Consultant'
        value={clientSource}
        onChange={handleClientSourceChange}
      >
        <option defaultValue="Consultant">Select Source</option>
        {sources.map((source, index) => (
          <option key={index} value={source}>
            {source}
          </option>
        ))}
      </select>
      <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" type="text" placeholder="Consultant Name" id="consultantname" name="consultantname" required = {clientSource === '5.Consultant' ? true : false} onChange={handleConsultantNameChange} value={consultantName}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Find the next input field and focus on it
          const inputs = document.querySelectorAll('input, select, textarea');
          const index = Array.from(inputs).findIndex(input => input === e.target);
          if (index !== -1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
          }
        }
      }}
      />
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
      <input class="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="number" placeholder="Consultant Number" id="consultantnumber" name="consultantnumber" value={consultantNumber} onChange={e => setConsultantNumber(e.target.value)} required = {clientSource === '5.Consultant' ? true : false}/>
      </div>
      <button class="outline-none glass shadow-2xl  w-full p-3  bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:border-[1px]  hover:text-[#008000] font-bold rounded-md" type="submit">Submit</button>
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