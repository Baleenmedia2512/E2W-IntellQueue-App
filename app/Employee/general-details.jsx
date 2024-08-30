// pages/Employee/general-details.jsx
'use client';
import React, { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';          // Core styles
import 'primeicons/primeicons.css';   
import { useAppSelector } from '@/redux/store';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { format } from 'date-fns';

const GeneralDetailsPage = () => {
  const [severity, setSeverity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const loggedInUser = useAppSelector(state => state.authSlice.userName);
  const companyName = "Baleen Test";
    // const companyName = useAppSelector(state => state.authSlice.companyName);
  const sexOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];
  const options = [
    { label: 'Administrate', value: 'Admin' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Management', value: 'Management' },
    { label: 'General', value: 'General' },
  ];
  const [generalDetails, setGeneralDetails] = useState({
    name: '',
    sex: '',
    appRights: '',
    dob: '',
    phone: '',
    email: '',
    username: '',
    password: ''
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const handlePhoneChange = (event) => {
    const { name, value } = event.target;

    // Filter out non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');

    // Set the phone number in state
    setGeneralDetails(prevDetails => ({
        ...prevDetails,
        [name]: numericValue
    }));

    // Validate the phone number
    let error = '';
    if (numericValue.length === 0) {
        error = 'Please fill the required field';
    } else if (numericValue.length !== 10) {
        error = 'Phone number must be exactly 10 digits';
    }

    // Update errors state
    setErrors(prevErrors => ({
        ...prevErrors,
        phone: error
    }));
};

  const handleResetGeneralDetails = () => {
    setGeneralDetails({
        name: '',
        sex: '',
        appRights: '',
        dob: '',
        phone: '',
        email: '',
        username: '',
        password: ''
    });

    // Clear the username status
    setUsernameStatus('', '');
};
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const onDateChange = (e) => {
    handleInputChange({ target: { name: 'dob', value: e.value } }); // Custom event for handleInputChange
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Update the state based on the input type
    setGeneralDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  
    // Validate the field as user types
    validateField(name, value);
  };
  // Function to validate a specific field
const validateField = async (name, value) => {
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
            } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{3,}$/.test(value)) {
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
              setUsernameStatus('', ''); // Clear status if input is empty
          } else if (value.length < 3) {
              error = 'Username must be at least 3 characters long';
              setUsernameStatus('', ''); // Clear status if input is too short
          } else {
              // Perform the async availability check only if the field is not empty and long enough
              try {
                  const result = await checkUsernameAvailability(value);
                  if (result.available) {
                      setUsernameStatus('green', 'Username is available');
                  } else {
                      setUsernameStatus('red', 'Username is not available');
                  }
              } catch (e) {
                  error = 'Error checking username availability';
                  setUsernameStatus('', ''); // Clear status if there's an error
              }
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
  return error; // Return the error for this specific field
};

// Function to update the username status UI
const setUsernameStatus = (color, message) => {
  const statusElement = document.getElementById('username-status');
  if (statusElement) {
      statusElement.style.color = color;
      statusElement.innerText = message;
  }
};
// Helper function to check if the username is available
const checkUsernameAvailability = async (username) => {
  try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/EmployeeUsernameExist.php?JsonDBName=${companyName}&JsonUsername=${username}`);
      const result = await response.json();

      if (result.status === "success") {
          return { available: true, message: result.message };
      } else {
          return { available: false, message: result.message };
      }
  } catch (error) {
      console.error("Error checking username availability", error);
      return { available: false, message: "Error checking username availability" }; // Default to not available if an error occurs
  }
};
const validateFields = () => {
  const errors = {};

  // Check if each field is empty or has specific validation errors
  if (!generalDetails.name) {
      errors.name = 'Name is required';
  } else if (generalDetails.name.length < 3) {
      errors.name = 'Name must be at least 3 characters long';
  } else if (generalDetails.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
  }

  if (!generalDetails.sex) {
      errors.sex = 'Sex is required';
  }

  if (!generalDetails.dob) {
      errors.dob = 'Date of Birth is required';
  } else if (new Date(generalDetails.dob) > new Date()) {
      errors.dob = 'Date of birth cannot be in the future';
  }

  if (!generalDetails.phone) {
      errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(generalDetails.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
  }

  if (!generalDetails.email) {
    errors.email = 'Email is required';
} else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{3,}$/.test(generalDetails.email)) {
    errors.email = 'Email must be a valid format (e.g., example@gmail.com)';
}

  if (!generalDetails.username) {
      errors.username = 'Username is required';
  } else if (generalDetails.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
  }

  if (!generalDetails.password) {
      errors.password = 'Password is required';
  } else if (generalDetails.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
  }

  if (!generalDetails.appRights) {
      errors.appRights = 'App Rights selection is required';
  }

  return errors;
};
// This function will be called on form submission
const handleSubmit = async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Validate fields
  const fieldErrors = validateFields();
  setErrors(fieldErrors); // Set general errors

  // Check if there are any errors
  if (Object.keys(fieldErrors).length > 0) {
      // Display the errors if any
      setErrors(fieldErrors);
  } else {
      // Proceed with form submission
      //console.log('Form is valid, submitting:', generalDetails);
      // Perform the submission logic here, e.g., API call
  }
};
  
  const postGeneralDetails = async (event) => {
    event.preventDefault();
    const validationErrors = validateFields();
    
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }
    
    try {
        // Format the dob to Y-m-d before sending it
        const formattedDOB = format(new Date(generalDetails.dob), 'yyyy-MM-dd');

        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/EmployeeUserManager.php?JsonDBName=${companyName}&JsonName=${generalDetails.name}&JsonSex=${generalDetails.sex}&JsonAppRights=${generalDetails.appRights}&JsonDOB=${formattedDOB}&JsonPhone=${generalDetails.phone}&JsonEmail=${generalDetails.email}&JsonUsername=${generalDetails.username}&JsonPassword=${generalDetails.password}&JsonEntryUser=${loggedInUser}`);
        
        const data = await response.json();

        if (data === "Employee Data Inserted Successfully!") {
            setSuccessMessage('User Created Successfully!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

            // Reset the form fields and clear username status
            handleResetGeneralDetails();

        } else if (data === "This Username not available") {
            setToastMessage('This Username not available');
            setSeverity('warning');
            setToast(true);
            setTimeout(() => {
                setToast(false);
            }, 2000);
        } else {
            alert(`The following error occurred while inserting data: ${data}`);
        }
        
    } catch (error) {
        console.error('Error creating user:', error);
        // alert('There was an unexpected error while creating the user.');
    }
};


 

  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10 sm:mb-0">
     <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl"> {/* Reduced max-width on larger screens */}
      
       <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold text-left text-blue-600">User Manager</h2>
          <p className="text-gray-400 text-sm text-left">Please fill in the following details</p>
        </div>
        {/* Button container */}
        <div>
          <button
            type="submit"
            onClick={postGeneralDetails}
            className="px-6 py-3 text-xs uppercase tracking-wider font-medium text-white bg-[#23c483] rounded-full shadow-md transition-transform duration-300 ease-in-out hover:bg-[#2376c4] hover:shadow-lg hover:translate-y-[-7px] active:translate-y-[-1px] focus:outline-none"
          >
            Create
          </button>
        </div>
      </div>
      {/* Decorative Border */}
      <div className="border-2 w-10 border-blue-500 mb-6"></div>
      <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0">
          
          {/* General Details Section */}
          <div className="flex flex-col w-full lg:w-1/2 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-500 mb-2 text-left">General Details</h3>
            
            <div className="border-2 w-10 border-blue-500 mb-6"></div>
  
            <form className="space-y-6">
              {/* Name, Sex */}
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                  <label htmlFor="name" className="block mb-1 text-black font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Eg: John"
                    value={generalDetails.name}
                    onChange={handleInputChange}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
  
                <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                  <label htmlFor="sex" className="block mb-1 text-black font-medium">Sex</label>
                  <Dropdown
                    id="sex"
                    name="sex"
                    value={generalDetails.sex}
                    options={sexOptions}
                    onChange={handleInputChange}
                    placeholder="Select your sex"
                    className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.sex ? 'border-red-500' : ''}`} 
                  />
                  {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                </div>
              </div>
  
              {/* Date of Birth, Phone Number, Email */}
              <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="dob" className="block mb-1 text-black font-medium">Date of Birth</label>
                  <Calendar
                    id="dob"
                    name="dob"
                    value={generalDetails.dob}
                    onChange={onDateChange}
                    dateFormat="dd/mm/yy"
                    placeholder="dd/mm/yyyy"
                    className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 ${errors.dob ? 'p-invalid border-red-500' : ''}`} 
                    inputClassName="w-full px-3 py-2 text-gray-700 placeholder-gray-400" 
                    showIcon 
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>
  
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                  <label htmlFor="phone" className="block mb-1 text-black font-medium">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="Eg: 1234567890"
                    value={generalDetails.phone}
                    onChange={handlePhoneChange}
                    maxLength="10"
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
                    placeholder="Eg: john@gmail.com"
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
            <h3 className="text-2xl font-bold text-blue-500 mb-2 text-left">Login Credentials</h3>
            {/* <p className="text-gray-400 text-sm mb-4 text-left">Please enter your login credentials</p> */}
            <div className="border-2 w-10 border-blue-500 mb-6"></div>

  
            <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-wrap -mx-4 mb-4">
            <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
              <label htmlFor="username" className="block mb-1 text-black font-medium">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                onblur="validateField('username', this.value)"
                autoComplete="off"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Eg:John"
                value={generalDetails.username}
                onChange={handleInputChange}
                onFocus={(e) => e.target.setAttribute('autocomplete', 'new-username')} // Trick to avoid autofill
              />
              <span id="username-status"></span>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div className="w-full md:w-1/2 px-4 mb-4 md:mb-0">
            <label htmlFor="password" className="block mb-1 text-black font-medium">Password</label>
            <input
              type="text" // Set the type to text
              id="password"
              name="password"
              onBlur={() => validateField('password', generalDetails.password)}
              autoComplete="new-password"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${
                errors.password ? 'border-red-500' : ''
              }`}
              placeholder="Eg: John123"
              value={generalDetails.password}
              onChange={handleInputChange}
              onFocus={(e) => e.target.setAttribute('autocomplete', 'new-password')} // Trick to avoid autofill
            />
            <span id="password-status"></span>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          </div>

            
          <div className="flex flex-wrap -mx-4 mb-4">
                <div className="w-full px-4">
                  <label htmlFor="appRights" className="block mb-1 text-black font-medium">App Rights</label>
                  <Dropdown
                    id="appRights"
                    name="appRights"
                    value={generalDetails.appRights}
                    options={options}
                    onChange={handleInputChange}
                    placeholder="Select app rights"
                    className={`w-full border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300 ${errors.appRights ? 'border-red-500' : ''}`}
                  />
                  {errors.appRights && <p className="text-red-500 text-xs mt-1">{errors.appRights}</p>}
                </div>
              </div>
  
              {/* <div className="flex justify-end mt-6">
              <button
                type="submit"
                onClick={postGeneralDetails}
                className="px-6 py-3 text-xs uppercase tracking-wider font-medium text-white bg-[#23c483] rounded-full shadow-md transition-transform duration-300 ease-in-out hover:bg-[#2376c4] hover:shadow-lg hover:translate-y-[-7px] active:translate-y-[-1px] focus:outline-none"
              >
                Create
              </button>
            </div> */}

            </form>
          </div>
        </div>
      </div>
    </div>
      {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
  </div>
  

  );
}

export default GeneralDetailsPage;
