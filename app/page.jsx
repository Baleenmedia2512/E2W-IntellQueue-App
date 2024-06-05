'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
    
const ClientsData = () => {
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  //const companyName = "Grace Scans"
  const companyName = useAppSelector(state => state.authSlice.companyName);
  // const loggedInUser = 'GraceScans'
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const [title, setTitle] = useState('Mr.');
  const [clientContactPerson, setClientContactPerson] = useState("")
  const bmsources = ['1.JustDial', '2.IndiaMart', '3.Sulekha','4.LG','5.Consultant','6.Own','7.WebApp DB', '8.Online','9.Self', '10.Friends/Relatives'];
  const gssources = ['Self', 'Consultant', 'Online', 'Friends/Relatives', 'Others'];
  const [toast, setToast] = useState(false);
  const [clientAge, setClientAge] = useState('');
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
  const [address, setAddress] = useState('');
  const [DOB, setDOB] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [consultantNumber, setConsultantNumber] = useState('');
  const [displayWarning, setDisplayWarning] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Mrs.");
  const [displayDOBWarning, setDisplayDOBWarning] = useState(false);
  const [clientGST, setClientGST] = useState("");
  const [clientPAN, setClientPAN] = useState("");
  const [months, setMonths] = useState('');
  const [days, setDays] = useState('');
  const [elementsToHide, setElementsToHide] = useState([])
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState('');
  const [isNewClient, setIsNewClient] = useState('true');
  const sources = companyName === 'Grace Scans' ? gssources : bmsources;
  const [contactWarning, setContactWarning] = useState('');
  const [consulantWarning, setConsulantWarning] = useState('');
  const [clientID, setClientID] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter()

  // useEffect(() => {
  //   if (!clientSource && sources.length > 0) {
  //     dispatch(setClientData({ clientSource: sources[0] }));
  //   }
  // }, [clientSource, dispatch]);
  console.log(clientSource)

  useEffect(() => {
    // Check if age input violates constraints for selected option
    if ((selectedOption === "Baby." && parseInt(clientAge) > 3) || 
        (selectedOption === "Master." && (parseInt(clientAge) < 3 || parseInt(clientAge) > 12))) {
      setDisplayWarning(true);
    } else {
      setDisplayWarning(false);
    }
  }, [clientAge, selectedOption]); 

  const isDetails = useAppSelector(state => state.quoteSlice.isDetails);

  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    setIsNewClient(true);
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setClientNameSuggestions(data));
      dispatch(setClientData({clientName: newName}));
    } catch(error){
      console.error("Error Suggesting Client Names: " + error)
    }
  };

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  const handleConsultantNameChange = (event) => {
    const newName = event.target.value;
    setConsultantName(newName)
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
      .then((response) => response.json())
      .then((data) => {setConsultantNameSuggestions(data)});
      
  };

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  const handleClientNameSelection = (names) => {
    const input = names.target.value;
    const name = input.substring(0, input.indexOf('(')).trim();
    const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

    
    dispatch(setClientData({clientName: name}));
    dispatch(setClientData({clientContact: number}));
    fetchClientDetails(name, number);
    setClientNameSuggestions([]);
    setIsNewClient('false');
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
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data && data.length > 0) {
          const clientDetails = data[0];
          setClientID(clientDetails.id);
          setDOB(clientDetails.DOB);
          dispatch(setClientData({ clientEmail: clientDetails.email || "" }));
          dispatch(setClientData({ clientSource: clientDetails.source || "" }));
          //setClientAge(clientDetails.Age || "");
          
          setAddress(clientDetails.address || "");
          setTitle(clientDetails.gender || "");
          setSelectedOption(clientDetails.gender || "");
          setConsultantName(clientDetails.consname || "");
          setConsultantNumber(clientDetails.consnumber || "");
          // setClientPAN(clientDetails.PAN || "");
          setClientGST(clientDetails.GST || "");
          
          const age = calculateAge(clientDetails.DOB);
          setClientAge(age);
          // Extract PAN from GST if necessary
        if (clientDetails.GST && clientDetails.GST.length >= 15 && (!clientDetails.ClientPAN || clientDetails.ClientPAN === "")) {
          const pan = clientDetails.GST.slice(2, 12); // Correctly slice GST to get PAN
          setClientPAN(pan);
        } else {
          setClientPAN(clientDetails.ClientPAN);
        }
      
        } else {
          // Handle case where no data is returned
          // dispatch(setClientData({ clientEmail: "" }));
          // dispatch(setClientData({ clientSource: "" }));
          // setClientAge("");
          // // setDOB("");
          // setAddress("");
          // setTitle("");
          // setSelectedOption("");
          // setConsultantName("");
          // setConsultantNumber("");
          // setClientPAN("");
          // setClientGST("");
          console.warn("No client details found for the given name and contact number.");
        }
      })
      .catch((error) => {
        console.error("Error fetching client details:", error);
        // Optionally, you can reset the fields or show an error message to the user
        // dispatch(setClientData({ clientEmail: "" }));
        // dispatch(setClientData({ clientSource: "" }));
        // setClientAge("");
        // setDOB("");
        // setAddress("");
        // setTitle("");
        // setSelectedOption("");
        // setConsultantName("");
        // setConsultantNumber("");
        // setClientPAN("");
        // setClientGST("");
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
        companyName === 'Grace Scans' ? dispatch(setClientData({clientSource: sources[1]})) : dispatch(setClientData({clientSource: sources[0]}))
        elementsToHideList()
  }, []);

  useEffect(() => {
    //searching elements to Hide from database

    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])
  
  const handleClientContactChange = (newValue) => {
    if (newValue.length < 10) {
      setContactWarning('Contact number should contain at least 10 digits.');
    } else {
      setContactWarning('');
    }
    dispatch(setClientData({ clientContact: newValue }));
  };

  const handleClientEmailChange = (newValue) => {
    dispatch(setClientData({ clientEmail: newValue }));
  };

  const handleClientSourceChange = (selectedOption) => {
    dispatch(setClientData({ clientSource: selectedOption.target.value }));
  };

  const submitDetails = async(event) => {
    event.preventDefault()
    
    if(companyName !== 'Grace Scans'){
      if (isEmpty === true){
      router.push('/adDetails')
    }
    //   if(clientName && clientContact && clientSource){
    //     dispatch(setQuotesData({currentPage: "checkout"}))
    //     router.push('/adDetails')
    //   }
    // else{
    try {

      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonGender=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
          window.alert('Client Details Entered Successfully!')
          // window.location.reload();
          dispatch(resetQuotesData())
          dispatch(setQuotesData({currentPage: "checkout"}))
          router.push('/adDetails')
          //router.push('../adDetails');
        // setMessage(data.message);
      } else if (data === "Contact Number Already Exists!"){
        window.alert('Contact Number Already Exists!')
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
      }

    } catch (error) {
      console.error('Error updating rate:', error);
    }
  } 
  else{
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiry.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonSource=${clientSource}&JsonAge=${clientAge}&JsonDOB=${DOB}&JsonAddress=${address}&JsonDBName=${companyName}&JsonGender=${selectedOption}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonIsNewClient=${isNewClient}&JsonClientID=${clientID}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
          window.alert('Client Details Entered Successfully!')
          window.location.reload();
        
        //setMessage(data.message);
      } else if (data === "Contact Number Already Exists!"){
        window.alert('Contact Number Already Exists!')
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
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
    // setDOB(event.target.value); // Update the input value
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

const calculateDateFromAge = (age) => {
  const today = new Date();
  const birthDate = new Date(today.setFullYear(today.getFullYear() - age));
  return birthDate.toISOString().split('T')[0];
};

// const handleInputAgeChange = (event) => {
//   const dob = event.target.value;
//   const age = calculateAge(dob);
//   setInputValue(dob);
//   // setInputValue(formatDate(new Date(dob)));
//   setClientAge(age);
// };

const handleInputAgeChange = (event) => {
  const age = event.target.value;
  setClientAge(age);

  if ((selectedOption === 'Baby.' && parseInt(age) > 3) || 
      (selectedOption === 'Master.' && (parseInt(age) < 4 || parseInt(age) > 12))) {
    setDisplayWarning(true);
  } else {
    setDisplayWarning(false);
  }

  if (age) {
    const dob = calculateDateFromAge(age);
    setDOB(dob);
  }
};

const handleDateChange = (e) => {
  const dateValue = e.target.value;
  setDOB(dateValue);
  const age = calculateAge(dateValue);
  setClientAge(age);

  if (selectedOption === 'B/o.' || selectedOption === 'Baby.') {
  // if (selectedOption === 'B/o.') {
    const selectedDate = new Date(dateValue);
    const today = new Date();
    const diffTime = Math.abs(today - selectedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const calculatedMonths = Math.floor(diffDays / 30);
    const calculatedDays = diffDays % 30;

    setMonths(calculatedMonths);
  }
};


useEffect(() => {
  // if (selectedOption !== 'B/o.' && selectedOption !== 'Baby.') {
  if (selectedOption !== 'B/o.' && selectedOption !== 'Baby.') {
    setMonths('');
    setDays('');
  }
}, [selectedOption]);

// Function to check if any of the fields are empty
const checkEmptyFields = () => {
  if (
    clientName !== '' &&
    clientContact !== '' &&
    selectedOption !== '' 
    
  ) {
    setIsEmpty(false); // Set isEmpty to false if all fields are filled
  } else {
    setIsEmpty(true); // Set isEmpty to true if any field is empty
  }
};

// useEffect to check empty fields whenever any relevant state changes
useEffect(() => {
  checkEmptyFields();
}, [clientName, clientContact, clientEmail, address, clientAge, DOB]);


const handleGSTChange = (e) => {
  const { value } = e.target;
  setClientGST(value);
  if (value.length < 15) {
    setError('GST Number must be at least 15 characters long');
    setClientPAN('');
  } else {
    const pan = value.slice(2, -3);
    setClientPAN(pan);
    setError('');
    
  }

};

const handleConsultantNumberChange = (e) => {
  const { value } = e.target;
  setConsultantNumber(value);
  if (value.length < 10) {
    setConsulantWarning('Contact number should contain at least 10 digits.');
  } else {
    setConsulantWarning('');

  }

};
  return (
    <div className="flex flex-col justify-center mt-8  mx-[8%]">
      <form className="px-7 h-screen grid justify-center items-center" onSubmit={submitDetails}>
    <div className="grid gap-6" id="form">
    <h1 className="font-bold text-3xl text-center mb-4">Client Registration</h1>
      <div className="w-full flex gap-3">
      <select
        className="capitalize shadow-2xl p-3 ex w-24 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
        id='1'
        name="TitleSelect"
        value={selectedOption}
        //onChange={e => setTitle(e.target.value)}
       // defaultValue="Mrs."
        required
        onChange={(e) => {
          const selectedOption = e.target.value;
          setSelectedOption(selectedOption);
          // setClientAge(""); // Clear the age input field when the title changes

        // Display DOB warning when selected option is "B/o."
          setDisplayDOBWarning(selectedOption === "B/o.");
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
        <input className="p-3 capitalize shadow-2xl  glass w-full  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
          type="text"
          placeholder="Name*" 
          id='2'
          name="ClientNameInput" 
          required
          value={clientDetails.clientName}
          onChange={handleSearchTermChange}
          onBlur={() => {
            setTimeout(() => {
              setClientNameSuggestions([]);
            }, 200); // Adjust the delay time according to your preference
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
      </div>
      {/* {clientNameSuggestions.length > 0 && <VirtualizedList clientNameSuggestions={clientNameSuggestions} onClientNameSelection={handleClientNameSelection}/> } */}
      {(clientNameSuggestions.length > 0 && clientName !== '') && (
          <ul className="list-none border-green-300 border-1 ">
            {clientNameSuggestions.map((name, index) => (
              <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
                <button
                  type="button"
                  className="text-black"
                  onClick={handleClientNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      <div className="grid gap-6 w-full">
      {selectedOption === 'Ms.' ? (
        <input className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
          type="text" 
          placeholder="Contact Person Name*" 
          id="30"
          name="ClientContactPersonInput"
          value={clientContactPerson}
          onChange={(e) => setClientContactPerson(e.target.value)}
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
        ) : (<></>)}
        <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="number" 
        placeholder="Contact Number*" 
        id="3" 
        name="ClientContactInput" 
        required
        value={clientContact}
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
        {contactWarning && <p className="text-red-500">{contactWarning}</p>}
        <input className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="email" 
        placeholder="Email"
        id="4" 
        name="ClientEmailInput" 
        value={clientEmail}
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
      {/* <div class="w-full flex gap-3 ">
        <input className='capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center' 
        type='number' 
        id='5'
        name='ClientAgeInput'
        placeholder="Age" 
        value={clientAge} 
        onChange={(e) => {
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
        <input class="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
        type="date" 
        name='AgeDatePicker'
        id='6'
        value={inputValue} 
        onChange={handleInputAgeChange} 
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
        }}/>
      </div> */}
      {/* {(selectedOption !== 'B/o.' && selectedOption !== 'Baby.') ? ( */}
      {(selectedOption !== 'B/o.' && selectedOption !== 'Baby.') ? (
        <div className="w-full flex gap-3" name='AgeDatePicker'>
          <input
            className="capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
            type="number"
            id="5"
            name="ClientAgeInput"
            placeholder="Age*"
            value={clientAge}
            onChange={handleInputAgeChange}
            // onChange={(e) => {
            //   const { value } = e.target;
            //   setClientAge(value);

            //   if (
            //     (selectedOption === 'Baby.' && parseInt(value) > 3) ||
         
            //     (selectedOption === 'Master.' && (parseInt(value) < 4 || parseInt(value) > 12))
            //   ) {
            //     setDisplayWarning(true);
            //   } else {
            //     setDisplayWarning(false);
            //   }
            // }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
          <input
            className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="date"
            name="AgeDatePicker"
            id="6"
            defaultValue={DOB}
            value={DOB}
            onChange={handleDateChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
        </div>
      ) : (
        <div className="w-full flex gap-3">
          <input
            className="capitalize shadow-2xl p-3 ex w-40 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md justify-center"
            type="number"
            name="MonthsInput"
            placeholder="Months*"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
          <input
            className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="date"
            name="AgeDatePicker"
            id="7"
            value={DOB}
            onChange={handleDateChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = document.querySelectorAll('input, select, textarea');
                const index = Array.from(inputs).findIndex(input => input === e.target);
                if (index !== -1 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
                }
              }
            }}
          />
        </div>
      )}

      {displayWarning && (
      <div className={`text-red-600 ${selectedOption === "Baby." ? "ml-12" : "ml-9"}`}>
        {selectedOption === "Baby." && "The age should be less than 3."}
        {selectedOption === "Master." && "The age should be between 4 and 12."}
      </div>
    )}

{/* {displayDOBWarning && (
      <div className="text-red-600 ml-9">Note: The DOB should be the baby's</div>
    )} */}
      <div className="flex gap-3">
      <textarea
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="7"
        name="ClientAddressTextArea"
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
      <div className='grid gap-6 w-full' name="ClientGSTInput" >
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        placeholder="GST Number*" 
        id="31" 
        name="ClientGSTInput" 
        value={clientGST}
        // onChange={(e) => setClientGST(e.target.value)}
        onChange={handleGSTChange}
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
        {error && <p className="text-red-500">{error}</p>}
        <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        placeholder="PAN*" 
        id="32" 
        name="ClientPANInput" 
        value={clientPAN}
        onChange={(e) => setClientPAN(e.target.value)}
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
        <div className='grid gap-6 w-full'>
      <select
        className="p-3 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
        id="8"
        name="ClientSourceSelect"
        value={clientSource}
        required
        defaultValue={sources[0]}
        onChange={handleClientSourceChange}
      >
        {/* <option >Select Source</option> */}
        {sources.map((source, index) => (
          <option key={index} value={source}>
            {source}
          </option>
        ))}
      </select>
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#b7e0a5] border-[1px] focus:border-[1px] rounded-md" 
        type="text" 
        placeholder="Consultant Name" 
        id="9" 
        name="ConsultantNameInput" 
        required = {clientSource === '5.Consultant' || clientSource === 'Consultant' ? true : false} 
        onChange={handleConsultantNameChange} 
        value={consultantName}
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
      <li key={index} className="text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition
      duration-300">
        <button
          type="button"
          className="text-black"
          onClick={handleConsultantNameSelection}
          value={name}
          
        >
          {name}
          
        </button>
      </li>
    ))}
  </ul>
)}
      <input 
        className="p-3 shadow-2xl  glass w-full outline-none focus:border-solid border-[#035ec5] focus:border-[1px]" type="number" placeholder="Consultant Number" 
        id="10" 
        name="ConsultantNumberInput" 
        value={consultantNumber} 
        onChange={handleConsultantNumberChange} 
        required = {clientSource === '5.Consultant' || clientSource === 'Consultant' ? true : false}/>
      </div>
      {consulantWarning && <p className="text-red-500">{consulantWarning}</p>}  
      <div>
      {isNewClient == true ? (
        <button 
          className="outline-none glass shadow-2xl w-full p-3 bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:text-[#008000] font-bold rounded-md mb-28" 
          type="submit">
          Add
        </button>
      ) : (
        <button 
          className="outline-none glass shadow-2xl w-full p-3 bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:text-[#008000] font-bold rounded-md mb-28" 
          type="submit">
          Update
        </button>
      )}
    </div>
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
      </div>*/}

      <div className="bg-surface-card p-8 rounded-2xl mb-4">
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div> 
    </div>

  );
};

export default ClientsData;