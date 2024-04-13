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
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const sources = ['1.JustDial', '2.IndiaMart', '3.Sulekha', '4.LG', '5.Consultant', '6.Own', '7.WebApp DB', '8.Online'];

  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  
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
          resetQuotesData()
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

  const submitDetails = async() => {
    if(isDetails){
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


  return (
    <div className="flex flex-col justify-center mt-8 mx-[8%]">
      <div className='w-full mt-8 justify-center items-center text-black'>
        <h1 className="font-bold text-3xl text-center mb-4 mt-4">Enter client details</h1>
        {/* <h1 className='text-3xl'>Client Details</h1> */}
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
            router.push('/adDetails')
          Cookies.set('isSkipped',true) }}
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
      </div>
    </div>

  );
};

export default ClientsData;