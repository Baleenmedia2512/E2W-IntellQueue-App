'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import Cookies from 'js-cookie';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/navigation';

const ClientsData = () => {
  //const [datas, setDatas] = useState([]);
  //const [adDatas, setAdDatas] = useState([]);
  //const userName = Cookies.get('username');
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
  //const [cses, setCses] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  //const [showAd, setShowAd] = useState(false);
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

  // const SaveEntry = () => {
  //   clientNumber.toString();
  //   var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
  //   var result = regex.test(clientEmail);
  //   var Check_Phone = clientNumber.match('[0-9]{10}');


  //   if (clientName === '' || clientNumber === '' || cses === '' || selectedSource === '') {
  //     showToastMessage('warning', 'Please enter the required details!')
  //   } else if (clientNumber.length !== 10 || !Check_Phone) {
  //     showToastMessage('warning', 'Enter valid 10 digit mobile number!')
  //   } else if (result === false) {
  //     showToastMessage('warning', 'Check the email address!')
  //   } else {
  //     fetch('https://orders.baleenmedia.com/API/InsertTestEnquiryAPI.php', {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         JsonUserName: userName,
  //         JsonClientContact: clientNumber,
  //         JsonCSE: cses,
  //         JsonSource: selectedSource,
  //         JsonClientName: clientName,
  //         JsonClientEmail: clientEmail
  //       })
  //     })
  //     .then((response) => response.json())
  //       .then((responseJson) => {
  //         showToastMessage('success', 'Details Entered Successfully!')

  //         // Send email
  //         fetch('https://orders.baleenmedia.com/API/PwaEnquiryEmail.php', {
  //       method: 'POST',
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-type': 'application/json'
  //       },
  //       body: JSON.stringify({
  //         JsonClientContact: clientNumber,
  //         JsonCSE: cses,
  //         JsonSource: selectedSource,
  //         JsonClientName: clientName,
  //        // JsonClientEmail: clientEmail
  //       })
  //     })
  //       .then((response) => response.json())
  //       .then((responseJson) => {
  //         if(responseJson === 'Email sent successfully!'){
  //           showToastMessage('success', responseJson)
  //         } else{
  //           showToastMessage('warning', responseJson)
  //         }
  //           })
  //           .catch((error) => {
  //             showToastMessage('error', 'Error in sending email. ' + error)
  //           });
  //       })
  //       .catch((error) => {
  //         showToastMessage('error', 'Error is saving data. ' + error)
  //       });

  //     setClientName('');
  //     setSearchTerm('');
  //     setClientEmail('');
  //     setClientNumber('');
  //     setCses('');
  //     setSelectedSource('');
  //   }
  // };  

  useEffect(() => {
    // Check if localStorage contains a username
    const username = Cookies.get('username');

    // If no username is found, redirect to the login page
    if (!username) {
      router.push('/login');
    }
    // else {
    //   fetch('https://orders.baleenmedia.com/API/CSENamesAPI.php')
    //     .then((response) => response.json())
    //     .then((data) => setDatas(data))
    //     .catch((error) => console.error(error));
    // }
  }, [router]);

  useEffect(() => { Cookies.set('clientname', clientName); }, [clientName]);
  useEffect(() => { Cookies.set('clientnumber', clientNumber); }, [clientNumber])
  useEffect(() => { Cookies.set('clientemail', clientEmail); }, [clientEmail])
  useEffect(() => { Cookies.set('selectedsource', selectedSource); }, [selectedSource])

  const moveToAdDetails = () => {
    if (clientName !== '' && clientEmail !== '' && clientNumber !== '' && selectedSource !== '') {
      router.push('../adDetails');
      Cookies.remove('adMediumSelected')
    }
    else {
      showToastMessage('warning', 'Please fill all the Client Details!')
    }
  }


  return (
    <div className="flex flex-col justify-center mt-8 mx-[8%]">
      {/* <div className="mb-8 mt-8 cursor-pointer w-fit hover:transform hover:scale-110 transition-transform duration-300 ease-in-out" onClick={() => { moveToAdDetails() }}>
      <h1 className='text-3x1'>Ad Details</h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3498db"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="1" width="22" height="22" stroke="#3498db" strokeWidth="2" fill="transparent" />

          // Horizontal line of the plus symbol 
          <line x1="7" y1="12" x2="17" y2="12" />

          // Vertical line of the plus symbol 
          <line x1="12" y1="7" x2="12" y2="17" />
        </svg>
      </div>

      <div className="flex justify-between mb-4 w-full space-x-8">
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded transition-all duration-300 ease-in-out hover:bg-purple-600"
          onClick={() => router.push('/')}
        >
          Rates Validation
        </button>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded transition-all duration-300 ease-in-out hover:bg-red-600"
          onClick={() => {
            Cookies.remove('username');
            router.push('/login');
          }}
        >
          Logout
        </button>
      </div> */}

      <div className='w-full mt-8 justify-center items-center'>
        <h1 className="font-bold text-3xl text-center mb-4 mt-4">BME - Enquiry. Enter enquiry details!</h1>
        {/* <h1 className='text-3xl'>Client Details</h1> */}
        <label className="flex flex-col items-left text-lg mb-2">Client Name</label>
        <input
          className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
          type="text"
          placeholder="Client Name"
          value={searchTerm}
          onChange={handleSearchTermChange}
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
    value={clientNumber}
    onChange={(e) => setClientNumber(e.target.value)}
  />

  <label>Client Email</label>
  <input
    className="w-full border border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
    type="email"
    placeholder="Client Email (optional)"
    value={clientEmail}
    onChange={(e) => setClientEmail(e.target.value)}
  />

  <label>Source</label>
  <Select
    className="w-full mb-4 text-black bg-gray-500"
    value={{ label: selectedSource, value: selectedSource }}
    onChange={(selectedOption) => setSelectedSource(selectedOption.value)}
    options={sources.map((source) => ({ label: source, value: source }))}
    placeholder="Select Source"
  />
      </div>
      <div className='flex flex-col items-center justify-center'>
      <button
          className="bg-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-purple-600"
          onClick={() => { moveToAdDetails() }}
        >
          Submit
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