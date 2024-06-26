'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, setCompanyName } from '@/redux/features/auth-slice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetRatesData } from '@/redux/features/rate-slice';
import { resetQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import '@mui/x-date-pickers/DatePicker';

const titleOptions = [
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Miss.', value: 'Miss.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Ms.', value: 'Ms.' },
    { label: 'B/o.', value: 'B/o.' },
    { label: 'Baby.', value: 'Baby.' },
    { label: 'Master.', value: 'Master.' },
  ];

const ClientRegistration = () => {
    const [selectedTitle, setSelectedTitle] = useState('');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

  const [additionalField1, setAdditionalField1] = useState('');
  const [additionalField2, setAdditionalField2] = useState('');
  const [additionalField3, setAdditionalField3] = useState('');
  
    const handleTitleChange = (e) => {
      setSelectedTitle(e.value);
    };
  
    const handleFirstNameChange = (e) => {
      setFirstName(e.target.value);
    };
  
    const handleLastNameChange = (e) => {
      setLastName(e.target.value);
    };
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };
  
    const handlePhoneChange = (e) => {
      setPhone(e.target.value);
    };
  
    const handleAddressChange = (e) => {
      setAddress(e.target.value);
    };
  
    const handleCityChange = (e) => {
      setCity(e.target.value);
    };
  
    const handleStateChange = (e) => {
      setState(e.target.value);
    };
  
    const handleZipCodeChange = (e) => {
      setZipCode(e.target.value);
    };
  

  const handleAdditionalField1Change = (e) => {
    setAdditionalField1(e.target.value);
  };

  const handleAdditionalField2Change = (e) => {
    setAdditionalField2(e.target.value);
  };

  const handleAdditionalField3Change = (e) => {
    setAdditionalField3(e.target.value);
  };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-blue-500 mb-1">Client Registration</h2>
        <p className="text-gray-400 text-sm mb-3">Please fill in the following details</p>
        <div className="border-2 w-10 inline-block mb-6 border-blue-500"></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restore client dialog */}
          <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
            <DialogTitle>Restore Client</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This client is invalid. Do you want to restore the client?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRestoreDialogOpen(false)} color="primary">
                No
              </Button>
              <Button onClick={handleRestoreClient} color="primary" autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left section */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Contact Number</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Contact Number*"
                  id="3"
                  name="ClientContactInput"
                  onChange={(e) => {
                    if (e.target.value.length <= 10) {
                      setClientContact(e.target.value);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setClientNameSuggestions([]);
                      setContactWarning('');
                      if (clientContact.length === 10 && isNewClient === false) {
                        fetchClientDetails(clientContact);
                      }
                    }, 200);
                  }}
                />
                {clientNameSuggestions.length > 0 && clientContact !== '' && (
                  <ul className="list-none border-green-300 border-1 ">
                    {clientNameSuggestions.map((name, index) => (
                      <li
                        key={index}
                        className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md"
                      >
                        <button
                          type="button"
                          className="text-black w-full h-full text-left"
                          onClick={handleClientNameSelection}
                          value={name}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {contactWarning && <p className="text-red-500">{contactWarning}</p>}
                {errors.clientContact && <p className="text-red-500">{errors.clientContact}</p>}
              </div>
              <div className="relative">
                <label className="block mb-1 font-medium">Name</label>
                <div className="flex space-x-2">
                  <Dropdown
                    value={selectedTitle}
                    options={titleOptions}
                    placeholder="Title"
                    className="w-1/4 border rounded-lg"
                    id="1"
                    name="TitleSelect"
                    onChange={(e) => {
                      const selectedOption = e.target.value;
                      setSelectedOption(selectedOption);
                      setDisplayDOBWarning(selectedOption === 'B/o.');
                    }}
                  />
                  <input
                    type="text"
                    className="w-3/4 px-4 py-2 border rounded-lg"
                    placeholder="Name*"
                    id="2"
                    name="ClientNameInput"
                    maxLength={32}
                    value={clientDetails.clientName}
                    onChange={handleSearchTermChange}
                    onBlur={() => {
                      setTimeout(() => {
                        setClientNameSuggestions([]);
                      }, 200); // Adjust the delay time according to your preference
                    }}
                    onKeyPress={(e) => {
                      // Allow only alphabetic characters
                      const regex = /^[a-zA-Z\s]*$/;
                      if (!regex.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                {clientNameSuggestions.length > 0 && clientName !== '' && clientContact === '' && (
                  <ul className="list-none border-green-300 border-1 ">
                    {clientNameSuggestions.map((name, index) => (
                      <li
                        key={index}
                        className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md"
                      >
                        <button
                          type="button"
                          className="text-black w-full h-full text-left"
                          onClick={handleClientNameSelection}
                          value={name}
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.clientName && <p className="text-red-500">{errors.clientName}</p>}
              </div>
              {selectedOption === 'Ms.' ? (
                <div>
                  <label className="block mb-1 font-medium">Contact Person Name</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg"
                    type="text"
                    placeholder="Contact Person Name*"
                    id="30"
                    name="ClientContactPersonInput"
                    value={clientContactPerson}
                    onChange={handleClientContactPersonChange}
                  />
                  {errors.clientContactPerson && <p className="text-red-500">{errors.clientContactPerson}</p>}
                </div>
              ) : (
                <></>
              )}
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  type="email"
                  placeholder="Email"
                  id="4"
                  name="ClientEmailInput"
                  value={clientEmail}
                  onChange={(e) => handleClientEmailChange(e.target.value)}
                />
                {emailWarning && <p className="text-red-500 ml-8">{emailWarning}</p>}
                {errors.clientEmail && <p className="text-red-500">{errors.clientEmail}</p>}
              </div>
            </div>
            {/* Middle section */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">Age</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block mb-1 font-medium">Birthdate</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={birthdate}
                      onChange={handleBirthdateChange}
                      renderInput={(params) => <input {...params} className="w-full px-4 py-2 border rounded-lg" />}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Address</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  id="7"
                    name="ClientAddressTextArea"
                    placeholder="Address"
                    // required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">GST Number</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="GST Number" 
                    id="31" 
                    name="ClientGSTInput" 
                    value={clientGST}
                    maxLength={15}
                    onChange={handleGSTChange}
                />
                {error && <p className="text-red-500">{error}</p>}
              </div>
              <div>
                <label className="block mb-1 font-medium">PAN Number</label>
                <input
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="PAN" 
                    id="32" 
                    name="ClientPANInput"
                    value={clientPAN}
                    maxLength={10}
                    onChange={(e) => setClientPAN(e.target.value)}
                />
              </div>
            </div>
            {/* Right section */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Source</label>
                <input
                  type="text"
                  value={additionalField1}
                  onChange={handleAdditionalField1Change}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Consultant Name</label>
                <input
                  type="text"
                  value={additionalField2}
                  onChange={handleAdditionalField2Change}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Consultant Number</label>
                <input
                  type="text"
                  value={additionalField3}
                  onChange={handleAdditionalField3Change}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Register</button>
          </div>
        </form>
      </div>
    </div>
    );
  };

export default ClientRegistration;
