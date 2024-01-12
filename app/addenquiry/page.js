'use client'
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';

const clientsData = () => {
  const [datas, setDatas] = useState([]);
  const userName = location.state 
  const sources = ['1.JustDial', '2.IndiaMart', '3.Sulekha', '4.LG', '5.Consultant', '6.Own', '7.WebApp DB', '8.Online'];
  const [cses, setCses] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNumber, setClientNumber] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    fetch(`https://orders.baleenmedia.com/API/SuggestingClientNames.php/get?suggestion=${event.target.value}`)
      .then(response => response.json())
      .then(data => setClientNameSuggestions(data));
      setClientName(event.target.value)
  }

  const handleClientNameSelection = (event) => {
    const input = event.target.value;
    const name = input.substring(0, input.indexOf("(")).trim();
    const number = input.substring(input.indexOf("(") + 1, input.indexOf(")")).trim();
    
    setSearchTerm(name);
    setClientNameSuggestions([]);
    setClientName(name);
    setClientNumber(number);
    fetchClientDetails(name, number);
  }

  const router = useRouter();

  useEffect(() => {
    // Check if localStorage contains a username
    const username = localStorage.getItem('username');

    // If no username is found, redirect to the login page
    if (!username) {
      router.push('/login');
    } else{
      fetch('https://orders.baleenmedia.com/API/CSENamesAPI.php')
      .then(response => response.json())
      .then(data => setDatas(data))
      .catch(error => console.error(error));
    }
  }, [router]);
  
  const fetchClientDetails = (clientName, clientNumber) => {
    axios.get(`https://orders.baleenmedia.com/API/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}`)
      .then(response => {
        const data = response.data;
        if (data.length > 0) {
          const clientDetails = data[0];
          setClientEmail(clientDetails.email);
          setSelectedSource(clientDetails.source);
          
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  const SaveEntry = () => {
    clientNumber.toString();
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    {/* Explanation of the above regex code
    ^ - Matches the start of the string.
    \w+ - Matches one or more word characters (letters, digits, or underscore).
    ([\.-]?\w+)* - Matches zero or more groups of a dot or hyphen followed by one or more word characters.
    @ - Matches the "@" symbol.
    \w+ - Matches one or more word characters.
    ([\.-]?\w+)* - Matches zero or more groups of a dot or hyphen followed by one or more word characters.
    (\.\w\w+)+ - Matches one or more groups of a dot followed by two or more word characters (the top-level domain). */}
    var result = regex.test(clientEmail);
    var Check_Phone = clientNumber.match('[0-9]{10}');
    if (clientNumber === '' || cses === '' || selectedSource === '') {
      console.log('Please enter all the details!');
      setTimeout(() => {
        message.info('Please enter all the details!');
      });
    } else if (clientNumber.length !== 10 || !Check_Phone) {
      console.log('Please enter a 10 digit number');
      setTimeout(() => {
        message.info('Please enter a valid 10 digit number');
      });
    } else if (result === false) {
      message.info('Email is not correct');
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
          console.log(responseJson);
          setTimeout(() => {
            message.success('Details Entered Successfully!');
          });

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
          console.log(responseJson);
          setTimeout(() => {
            message.success('Email Sent Successfully!');
          });
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
          setTimeout(() => {
            message.error(error);
          });
        });
        setClientName('');
        setSearchTerm('');
    setClientEmail('');
    setClientNumber('');
    setCses('');
    setSelectedSource('');
    }
  }

  return (
    <div className="container mx-auto mt-28">
      <div className="flex justify-center">
        <div className="w-1/3 p-4 flex flex-col items-center">
        <p className="font-bold text-black mb-4">Enter values in required field</p>
        <label className='flex flex-col items-left'>Client Name</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Name"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          {clientNameSuggestions.length > 0 &&
            <ul>
              {clientNameSuggestions.map((name, index) => (
                <li key={index}>
                  <button type="button" onClick={handleClientNameSelection} value={name}>{name}</button>
                </li>
              ))}
            </ul>
          }
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
            placeholder="Client Email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <label>CSE</label>
          <Select
            className="w-full mb-4"
            value={cses}
            onChange={(selectedOption) => setCses(selectedOption)}
            options={datas}
            placeholder="Select CSE"
            isClearable={true}
          />
          <label>Source</label>
          <Select
            className="w-full mb-4"
            value={selectedSource}
            onChange={(selectedOption) => setSelectedSource(selectedOption)}
            options={sources}
            placeholder="Select Source"
            isClearable={true}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full mt-4 transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={SaveEntry} >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default clientsData;
