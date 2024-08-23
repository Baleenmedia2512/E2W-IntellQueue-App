// pages/Employee/general-details.jsx
'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setGeneralDetails, setCurrentPage } from '@/redux/features/emp-slice'; // Import your actions
import TabNavigation from './components/TabNavigation';
import React, { useState } from 'react';

const GeneralDetailsPage = () => {
  //not need this code SK-----end-----------------
  const [generalDetails, setGeneralDetails] = useState({
    name: '',
    sex: '',
    dob: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
//VALIDATION 1--------------------------------SK-----START------
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  
  //   // Allow only numeric input for the phone number
  //   if (name === 'phone') {
  //     const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
  //     setGeneralDetails((prevDetails) => ({ ...prevDetails, [name]: numericValue }));
  //   } else {
  //     setGeneralDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  //   }
  // };
  // const validateGeneralDetails = () => {
  //   const newErrors = {};
  
  //   // Validate Name
  //   if (!generalDetails.name) newErrors.name = 'Please fill the required field';
  //   if (generalDetails.name.length > 50) newErrors.name = 'Name cannot exceed 50 characters';
  
  //   // Validate Email
  //   if (!generalDetails.email) newErrors.email = 'Please fill the required field';
  //   if (!/\S+@\S+\.\S+/.test(generalDetails.email)) newErrors.email = 'Email must be a valid format (e.g., example@gmail.com)';
  
  //  // Validate Phone Number
  //   if (!generalDetails.phone) {
  //     newErrors.phone = 'Please fill the required field';
  //   } else if (!/^\d{10}$/.test(generalDetails.phone)) {
  //     newErrors.phone = 'Phone number must be exactly 10 digits';
  //   }

  //   // Validate Date of Birth
  //   if (!generalDetails.dob) newErrors.dob = 'Please select your date of birth';
  //   else if (new Date(generalDetails.dob) > new Date()) newErrors.dob = 'Date of birth cannot be in the future';
  
  //   // Validate Sex
  //   if (!generalDetails.sex) newErrors.sex = 'Please select your sex';
  
  //   // Validate Username
  //   if (!generalDetails.username) newErrors.username = 'Please fill the required field';
  //   if (generalDetails.username.length < 3) newErrors.username = 'Username must be at least 3 characters long';
  
  //   // Validate Password
  //   if (!generalDetails.password) newErrors.password = 'Please fill the required field';
  //   if (generalDetails.password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
  
  //   // Validate App Rights
  //   if (!generalDetails.appRights) newErrors.appRights = 'Please select app rights';
  
  //   return newErrors;
  // };
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  
  //   // Validate the form
  //   const validationErrors = validateGeneralDetails();
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }
  //   console.log(generalDetails.name)
  //   console.log(generalDetails.sex)
  //   console.log(generalDetails.dob)
  //   console.log(generalDetails.phone)
  //   console.log(generalDetails.email)
  // };
  //VALIDATION 1--------------------------------SK-----END------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update the state with the new value
    setGeneralDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
    
    // Validate the field
    validateField(name, value);
  };
  
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
      if (!value) {
        error = 'Please fill the required field';
      } else if (value.length < 3) {
        error = 'Name must be at least 3 characters long';
      } else if (value.length > 50) {
        error = 'Name cannot exceed 50 characters';
      }
      break;
      
      case 'email':
        if (!value) {
          error = 'Please fill the required field';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Email must be a valid format (e.g., example@gmail.com)';
        }
        break;
      
      case 'phone':
        if (!value) {
          error = 'Please fill the required field';
        } else if (!/^\d{10}$/.test(value)) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;
      
      case 'dob':
        if (!value) {
          error = 'Please select your date of birth';
        } else if (new Date(value) > new Date()) {
          error = 'Date of birth cannot be in the future';
        }
        break;
  
      case 'sex':
        if (!value) {
          error = 'Please select your sex';
        }
        break;
  
      case 'username':
        if (!value) {
          error = 'Please fill the required field';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters long';
        }
        break;
  
      case 'password':
        if (!value) {
          error = 'Please fill the required field';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        }
        break;
  
      case 'appRights':
        if (!value) {
          error = 'Please select app rights';
        }
        break;
  
      default:
        break;
    }
  
    // Set the error message for the specific field
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Perform a full validation
    const validationErrors = validateGeneralDetails();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    // Submit the form if no errors
    // Your form submission logic here
  };
  const validateGeneralDetails = () => {
    const newErrors = {};
  
    validateField('name', generalDetails.name);
    validateField('email', generalDetails.email);
    validateField('phone', generalDetails.phone);
    validateField('dob', generalDetails.dob);
    validateField('sex', generalDetails.sex);
    validateField('username', generalDetails.username);
    validateField('password', generalDetails.password);
    validateField('appRights', generalDetails.appRights);
  
    return newErrors;
  };
      
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10 sm:mb-0">
    <div className="w-full max-w-7xl">
    <h1 className="text-3xl font-bold text-left text-blue-600 mb-4">User Manager</h1>
      {/* Decorative Border */}
    <div className="border-2 w-10 border-blue-500 mb-6"></div>
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          
          {/* General Details Section */}
          <div className="flex flex-col w-full lg:w-1/2 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-500 mb-2 text-left">General Details</h2>
            <p className="text-gray-400 text-sm mb-4 text-left">Please fill in the following details</p>
            <div className="border-2 w-10 border-blue-500 mb-6"></div>

  
            <form className="space-y-6">
              {/* Name, Sex, Date of Birth */}
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="name" className="block mb-1 text-black font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your name"
                    value={generalDetails.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
  
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="sex" className="block mb-1 text-black font-medium">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.sex ? 'border-red-500' : ''}`}
                    value={generalDetails.sex}
                    onChange={handleInputChange}
                  >
                    <option value="">Select your sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                </div>
  
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="dob" className="block mb-1 text-black font-medium">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.dob ? 'border-red-500' : ''}`}
                    value={generalDetails.dob}
                    onChange={handleInputChange}
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>
              </div>
  
              {/* Phone Number, Email */}
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="phone" className="block mb-1 text-black font-medium">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                    value={generalDetails.phone}
                    onChange={handleInputChange}
                    maxLength="10" // Optional: Prevents entering more than 10 digits
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
  
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="email" className="block mb-1 text-black font-medium">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                    value={generalDetails.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </form>
          </div>
  
          {/* Login Credentials Section */}
          <div className="flex flex-col w-full lg:w-1/2 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-500 mb-2 text-left">Login Credentials</h2>
            <p className="text-gray-400 text-sm mb-4 text-left">Please enter your login credentials</p>
            <div className="border-2 w-10 border-blue-500 mb-6"></div>

  
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                  <label htmlFor="username" className="block mb-1 text-black font-medium">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="Enter your username"
                    value={generalDetails.username}
                    onChange={handleInputChange}
                  />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>
  
                <div className="w-full md:w-1/2 px-4">
                  <label htmlFor="password" className="block mb-1 text-black font-medium">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    value={generalDetails.password}
                    onChange={handleInputChange}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>
  
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full px-4">
                  <label htmlFor="appRights" className="block mb-1 text-black font-medium">App Rights</label>
                  <select
                    id="appRights"
                    name="appRights"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.appRights ? 'border-red-500' : ''}`}
                    value={generalDetails.appRights}
                    onChange={handleInputChange}
                  >
                    <option value="">Select app rights</option>
                    <option value="Admin">Admin</option>
                    <option value="Finance">Finance</option>
                    <option value="Management">Management</option>
                    <option value="General">General</option>
                  </select>
                  {errors.appRights && <p className="text-red-500 text-xs mt-1">{errors.appRights}</p>}
                </div>
              </div>
  
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  

  );
}

export default GeneralDetailsPage;
