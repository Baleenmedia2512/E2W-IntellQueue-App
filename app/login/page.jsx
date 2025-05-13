'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, setCompanyName, setAppRights, setDBName } from '@/redux/features/auth-slice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetRatesData } from '@/redux/features/rate-slice';
import { resetQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';
import { resetOrderData } from '@/redux/features/order-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { resetDateRange } from "@/redux/features/report-slice";

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [companyNameSuggestions, setCompanyNameSuggestions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(logout());
    
  },[])

//   useEffect(()=>{
//     elementsToHideList();
//   },[companyName])

//   const elementsToHideList = async() => {
//     try{
//       const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
//         if(!response.ok){
//             return
//         }
//        const data = await response.json();
//        setElementsToHide(data);
//     } catch(error){
//       console.error("Error showing element names: " + error)
//     }
//   }

  const router = useRouter();
  const dispatch = useDispatch();
  const toggleShowPassword = () => {setShowPassword(!showPassword)};

  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestCompanyNames.php/get?suggestion=${newName}`)
      .then((response) => response.json())
      .then((data) => setCompanyNameSuggestions(data));
      dispatch(setCompanyName(newName));
  };

  const handleCompanyNameSelection = (event) => {
    const input = event.target.value;

    setCompanyNameSuggestions([]);
    dispatch(setCompanyName(input));
    
  };


  const validateFields = () => {
    let errors = {};
    if (!userName.trim()) {
        errors.username = 'Username is required';
    }
    if (!password.trim()) {
        errors.password = 'Password is required';
    }
    if (!companyName.trim()) {
        errors.companyName = 'Company Name is required';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
};

const handleLogin = (event) => {
    event.preventDefault();

    if (validateFields()) {
        const encodedPassw = encodeURIComponent(password);

        fetch(`https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${'Baleen Test'}&JsonUserName=${userName}&JsonPassword=${encodedPassw}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'Login Successfully') {
                    setSuccessMessage('Login Successful!');
                    // dispatch(setDBName(companyName));
                    dispatch(setCompanyName('Baleen Test'))
                    // dispatch(login(userName));
                    dispatch(setDBName(companyName));
                    setTimeout(() => {
                        setSuccessMessage('');
                        router.push("/")
                    }, 2000);

                    // Dispatch actions and navigate based on conditions
                    
                    // dispatch(setCompanyName(companyName))
                    dispatch(login(userName));
                    
                    dispatch(setAppRights(data.appRights));
                    dispatch(resetClientData());
                    dispatch(resetRatesData());
                    dispatch(resetQuotesData());
                    dispatch(resetOrderData());
                    dispatch(resetDateRange());
                    sessionStorage.removeItem("unitPrices");
                    sessionStorage.clear();
                    localStorage.clear();
                    // if(elementsToHide.includes("QuoteSenderNavigation")){
                        
                    // } else{
                    //     router.push("/adDetails")
                    // }
                    // if (companyName === 'Grace Scans') {
                    //     router.push("/"); // Navigate to the main screen
                    // } else {
                    //     router.push("/adDetails");
                    // }
                } else {
                    // Handle invalid credentials scenario
                    //setPassword(''); // Clear password field if needed
                    setToastMessage('Invalid credentials. Please check your User Name, Password and Company Name.');
                    setSeverity('error');
                    setToast(true);
                    setTimeout(() => {
                        setToast(false);
                    }, 2000);
                }
            })
            .catch(error => {
                // Handle fetch or server errors
                setToastMessage('Error in login ' + error);
                setSeverity('error');
                setToast(true);
                setTimeout(() => {
                    setToast(false);
                }, 2000);
            });
    } else {
        setToastMessage('Please fill all necessary fields!');
        setSeverity('error');
        setToast(true);
        setTimeout(() => {
            setToast(false);
        }, 2000);
    }
};



    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="max-w-screen-lg min-w-fit min-h-fit bg-white shadow-md rounded-lg overflow-hidden p-8 md:flex md:items-center md:justify-center md:space-x-8">
                {/* Sign-in form */}
                <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold font-inter text-gray-800">WELCOME TO</h2>
                <h2 className="text-2xl font-bold font-inter text-blue-500 mb-3">EASY2WORK IBMS</h2>
                   <div className="border-2 w-10 inline-block mb-4 border-blue-500 "></div>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                 className={`border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 w-full ${errors.username ? 'border-red-400' : ''}`}
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={userName}
                                onFocus={e => e.target.select()}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    className={`border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 w-full ${errors.password ? 'border-red-400' : ''}`}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onFocus={e => e.target.select()}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                    onClick={toggleShowPassword}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-700" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-700" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <div className="mb-6 relative">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                                Company Name
                            </label>
                            <input
                                className={`border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 w-full ${errors.companyName ? 'border-red-400' : ''}`}
                                id="company"
                                type="text"
                                placeholder="Enter your company name"
                                value={companyName}
                                onFocus={e => e.target.select()}
                                onChange={handleSearchTermChange}
                            />
                            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                            {/* Company Name Suggestions */}
                            {(companyNameSuggestions.length > 0 && companyName !== '') && (
                                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                                    {companyNameSuggestions.map((name, index) => (
                                        <li key={index}>
                                            <button
                                                type="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                                                onClick={handleCompanyNameSelection}
                                                value={name}
                                            >
                                                {name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="button"
                            onClick={handleLogin}
                            >
                             Sign In
                        </button>
                    </form>
                    <div className="text-gray-600 text-xs mt-4">
                        Version 1.12.0 {/*Commenting for release */}
                    </div>
                </div>
                <div className="hidden md:block bg-blue-500 rounded-lg w-full min-h-96 md:w-1/2 p-8">
                <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl text-center font-bold text-yellow-300 mb-4">Streamline Your Customer Relationships with Ease</h2>
                <div className="border-2 w-10 inline-block mb-4 border-yellow-300"></div>
                <img src="/images/login.png" alt="Login" className="w-72  h-auto rounded-br-lg" />
                </div>
                </div>
            </div>
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
        </div>
    );
};

export default Login;