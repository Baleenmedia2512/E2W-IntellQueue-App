'use client'
import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { login, logout, setCompanyName } from '@/redux/features/auth-slice';
// import { useDispatch } from 'react-redux';
// import { useAppSelector } from '@/redux/store';
// import { resetRatesData } from '@/redux/features/rate-slice';
// import { resetQuotesData } from '@/redux/features/quote-slice';
// import { resetClientData } from '@/redux/features/client-slice';
// import ToastMessage from '../components/ToastMessage';
// import SuccessToast from '../components/SuccessToast';
// import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
// import { Dropdown } from 'primereact/dropdown';
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
        
      </div>
    </div>
    );
  };

export default ClientRegistration;
