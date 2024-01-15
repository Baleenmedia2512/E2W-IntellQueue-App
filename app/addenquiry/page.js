'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';

const ClientsData = () => {
  const [datas, setDatas] = useState([]);
  const userName = Cookies.get('username');
  const sources = [
    '1.JustDial',
    '2.IndiaMart',
    '3.Sulekha',
    '4.LG',
    '5.Consultant',
    '6.Own',
    '7.WebApp DB',
    '8.Online'
  ];
  const [cses, setCses] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const router = useRouter()

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    fetch(`https://orders.baleenmedia.com/API/SuggestingClientNames.php/get?suggestion=${event.target.value}`)
      .then((response) => response.json())
      .then((data) => setClientNameSuggestions(data));
    setClientName(event.target.value);
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

    setSearchTerm(name);
    setClientNameSuggestions([]);
    setClientName(name);
    setClientNumber(number);
    fetchClientDetails(name, number);
  };

  const fetchClientDetails = (clientName, clientNumber) => {
    axios
      .get(`https://orders.baleenmedia.com/API/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}`)
      .then((response) => {
        const data = response.data;
        if (data.length > 0) {
          const clientDetails = data[0];
          setClientEmail(clientDetails.email);
          setSelectedSource(clientDetails.source);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const SaveEntry = () => {
    clientNumber.toString();
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    var result = regex.test(clientEmail);
    var Check_Phone = clientNumber.match('[0-9]{10}');
  
    if (clientName === '' || clientNumber === '' || cses === '' || selectedSource === '') {
      showToastMessage('warning', 'Please enter the required details!')
    } else if (clientNumber.length !== 10 || !Check_Phone) {
      showToastMessage('warning', 'Enter valid 10 digit mobile number!')
    } else if (result === false) {
      showToastMessage('warning', 'Check the email address!')
    } else {
      fetch('https://orders.baleenmedia.com/API/InsertTestEnquiryAPI.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          JsonUserName: userName,
          JsonClientContact: clientNumber,
          JsonCSE: cses,
          JsonSource: selectedSource,
          JsonClientName: clientName,
          JsonClientEmail: clientEmail
        })
      })
      .then((response) => response.json())
        .then((responseJson) => {
          showToastMessage('success', 'Details Entered Successfully!')

          // Send email
          fetch('https://orders.baleenmedia.com/API/PwaEnquiryEmail.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          JsonClientContact: clientNumber,
          JsonCSE: cses,
          JsonSource: selectedSource,
          JsonClientName: clientName,
         // JsonClientEmail: clientEmail
        })
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson === 'Email sent successfully!'){
            showToastMessage('success', responseJson)
          } else{
            showToastMessage('warning', responseJson)
          }
            })
            .catch((error) => {
              showToastMessage('error', 'Error in sending email. ' + error)
            });
        })
        .catch((error) => {
          showToastMessage('error', 'Error is saving data. ' + error)
        });
  
      setClientName('');
      setSearchTerm('');
      setClientEmail('');
      setClientNumber('');
      setCses('');
      setSelectedSource('');
    }
  };  

  useEffect(() => {
    // Check if localStorage contains a username
    const username = Cookies.get('username');

    // If no username is found, redirect to the login page
    if (!username) {
      router.push('/login');
    } else {
      fetch('https://orders.baleenmedia.com/API/CSENamesAPI.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [router]);

  return (
    <div className="container mx-auto mt-28">
      
      <div className="flex justify-center">
        
        <div className="w-1/1 p-4 flex flex-col items-center">
          <div className='flex-row space-x-4 justify-between mb-4'>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded top-2 justify-self-start"
              onClick={() => router.push('/')}
            >
              Move to Rates Validation
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => {Cookies.remove('username'); router.push('/login')}}>
              Logout
            </button>
          </div>
          <h1 className="font-bold text-black mb-4">BME - Enquiry. Enter enquiry details!</h1>
          <label className="flex flex-col items-left">Client Name</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Name"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          {clientNameSuggestions.length > 0 && (
            <ul>
              {clientNameSuggestions.map((name, index) => (
                <li key={index}>
                  <button type="button" onClick={handleClientNameSelection} value={name}>
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <label>Client Contact</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Contact"
            value={clientNumber}
            onChange={(e) => setClientNumber(e.target.value)}
          />
          <label>Client Email</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="email"
            placeholder="Client Email (optional)"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <label>CSE</label>
          <Select
            className="w-full mb-4"
            value={{ label: cses, value: cses }}
            onChange={(selectedOption) => setCses(selectedOption.value)}
            options={datas.map((cse) => ({ label: cse, value: cse }))}
            placeholder="Select CSE"
          />
          <label>Source</label>
          <Select
            className="w-full mb-4"
            value={{ label: selectedSource, value: selectedSource }}
            onChange={(selectedOption) => setSelectedSource(selectedOption.value)}
            options={sources.map((source) => ({ label: source, value: source }))}
            placeholder="Select Source"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full mt-4 transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={SaveEntry}
          >
            Submit
          </button>
        </div>
      </div>
      <div className='bg-surface-card p-8 rounded-2xl mb-4'>
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