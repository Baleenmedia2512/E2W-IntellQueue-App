'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, setCompanyName, setAppRights, setDBName } from '@/redux/features/auth-slice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetClientData } from '@/redux/features/client-slice';
import { resetOrderData } from '@/redux/features/order-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Dynamic imports to prevent SSR issues
let CapacitorStorage = null;
let CapacitorNavigation = null;

if (typeof window !== 'undefined') {
  import('../utils/capacitorStorage').then(module => {
    CapacitorStorage = module.CapacitorStorage;
  }).catch(error => {
    console.warn('CapacitorStorage import failed:', error);
  });
  
  import('../utils/capacitorNavigation').then(module => {
    CapacitorNavigation = module.CapacitorNavigation;
  }).catch(error => {
    console.warn('CapacitorNavigation import failed:', error);
  });
}

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
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    console.log('🔄 Login component initializing...');
    // Add error boundary for debugging
    try {
      console.log('📤 Dispatching logout to clear previous session');
      dispatch(logout());

      // Clear any persistent authentication data for testing using Capacitor storage
      const clearStorage = async () => {
        if (typeof window !== 'undefined') {
          try {
            console.log('🧹 Clearing storage data...');
            // Only use Capacitor storage if it's available
            if (typeof CapacitorStorage !== 'undefined') {
              console.log('📱 Using Capacitor storage for cleanup');
              await CapacitorStorage.clearSession();
              await CapacitorStorage.removeItem('persist:root');
            } else {
              console.log('💻 Using regular web storage for cleanup');
              // Fallback to regular web storage
              localStorage.clear();
              sessionStorage.clear();
            }
            console.log('✅ Storage cleared successfully');
          } catch (error) {
            console.error('❌ Capacitor storage cleanup failed:', error);
            // Fallback to localStorage if Capacitor storage fails
            try {
              localStorage.clear();
              sessionStorage.clear();
              console.log('✅ Fallback storage cleanup successful');
            } catch (fallbackError) {
              console.error('❌ Fallback storage cleanup failed:', fallbackError);
            }
          }
        }
      };
      clearStorage();

      // Set default company name to 'test'
      console.log('🏢 Setting default company name to "test"');
      dispatch(setCompanyName('test'));

      const host = window.location.hostname;
      const subdomain = host.split('.')[0];
      console.log('🌐 Current hostname:', host, 'subdomain:', subdomain);

      if (subdomain && subdomain !== 'localhost') {
          console.log('🔄 Overriding company name with subdomain:', subdomain);
          dispatch(setCompanyName(subdomain));
      }
      
      console.log('✅ Login component initialization complete');
    } catch (error) {
      console.error('❌ Error during login component initialization:', error);
    }
  }, [dispatch]);
  const toggleShowPassword = () => {
    console.log('👁️ Password visibility toggled:', !showPassword ? 'visible' : 'hidden');
    setShowPassword(!showPassword);
  };

  const handleSearchTermChange = (event) => {
    const newName = event.target.value;
    console.log('🔍 Company name search term changed:', newName);
    
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestCompanyNames.php/get?suggestion=${newName}`)
      .then((response) => {
        console.log('📡 Company suggestions API response status:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('📋 Received company suggestions:', data);
        setCompanyNameSuggestions(data);
      })
      .catch((error) => {
        console.error('❌ Error fetching company suggestions:', error);
      });
      
    dispatch(setCompanyName(newName));
  };

  const handleCompanyNameSelection = (event) => {
    const input = event.target.value;
    console.log('🏢 Company name selected from suggestions:', input);

    setCompanyNameSuggestions([]);
    dispatch(setCompanyName(input));
  };


  const validateFields = () => {
    console.log('✅ Validating login fields...');
    console.log('👤 Username:', userName ? '✓ provided' : '❌ empty');
    console.log('🔒 Password:', password ? '✓ provided' : '❌ empty');
    console.log('🏢 Company Name:', companyName || 'using default');
    
    let errors = {};
    if (!userName.trim()) {
        errors.username = 'Username is required';
    }
    if (!password.trim()) {
        errors.password = 'Password is required';
    }
    // Company name validation removed - using default 'test' value
    // if (!companyName.trim()) {
    //     errors.companyName = 'Company Name is required';
    // }
    
    setErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    console.log('📋 Validation result:', isValid ? '✅ Valid' : '❌ Invalid', errors);
    return isValid;
};

const handleLogin = async (event) => {
    event.preventDefault();
    console.log('🚀 Login attempt started');
    console.log('📋 Login data:', {
        username: userName,
        companyName: companyName,
        passwordProvided: !!password
    });

    if (validateFields()) {
        const encodedPassw = encodeURIComponent(password);
        const loginUrl = `https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${companyName}&JsonUserName=${userName}&JsonPassword=${encodedPassw}`;
        
        console.log('📡 Sending login request to API...');
        console.log('🌐 Login URL (password hidden):', loginUrl.replace(/JsonPassword=[^&]*/, 'JsonPassword=***'));

        fetch(loginUrl)
            .then(response => {
                console.log('📡 Login API response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    ok: response.ok
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(async data => {
                console.log('📊 Login API data received:', data);
                
                if (data.status === 'Login Successfully') {
                    console.log('✅ Login successful!');
                    console.log('🔑 App rights received:', data.appRights);
                    
                    setSuccessMessage('Login Successful!');
                    
                    // Dispatch all Redux actions first
                    console.log('📦 Dispatching Redux actions...');
                    dispatch(setDBName(companyName));
                    dispatch(setCompanyName(companyName))
                    dispatch(login(userName));
                    dispatch(setAppRights(data.appRights));
                    dispatch(resetClientData());
                    dispatch(resetOrderData());
                    dispatch({ type: 'queueDashboard/resetHistory' });
                    console.log('✅ Redux state updated successfully');
                    
                    // Clean up storage using Capacitor storage utilities
                    try {
                      console.log('🧹 Cleaning up session storage...');
                      if (typeof CapacitorStorage !== 'undefined') {
                        console.log('📱 Using Capacitor storage');
                        CapacitorStorage.removeSessionItem("unitPrices");
                        CapacitorStorage.setSessionItem("userName", userName);
                      } else {
                        console.log('💻 Using regular session storage');
                        // Fallback to regular storage
                        sessionStorage.removeItem("unitPrices");
                        sessionStorage.setItem("userName", userName);
                      }
                      console.log('✅ Session storage updated successfully');
                    } catch (storageError) {
                      console.error('⚠️ Storage update failed, but continuing:', storageError);
                      // Continue with navigation even if storage fails
                    }
                    
                    // For mobile, use proper navigation method after state is set
                    console.log('🧭 Preparing navigation to home page...');
                    setTimeout(() => {
                        try {
                            setSuccessMessage('');
                            
                            if (typeof CapacitorNavigation !== 'undefined') {
                              console.log('📱 Using Capacitor navigation');
                              CapacitorNavigation.navigate(router, "/", { replace: true });
                            } else {
                              console.log('💻 Using Next.js router navigation');
                              // Prefer SPA navigation to avoid early full reloads on native
                              try {
                                if (router && typeof router.replace === 'function') {
                                  router.replace('/');
                                } else if (router && typeof router.push === 'function') {
                                  router.push('/');
                                } else {
                                  window.location.replace('/');
                                }
                              } catch {
                                window.location.replace('/');
                              }
                            }
                            console.log('✅ Navigation initiated successfully');
                        } catch (navError) {
                            console.error('❌ Navigation failed, using fallback:', navError);
                            // Fallback navigation
                            window.location.href = '/';
                        }
                    }, 1000); // Reduced timeout for faster redirect
                } else {
                    console.log('❌ Login failed - Invalid credentials');
                    console.log('📊 Server response:', data);
                    
                    // Handle invalid credentials scenario
                    setToastMessage('Invalid credentials. Please check your User Name, Password and Company Name.');
                    setSeverity('error');
                    setToast(true);
                    setTimeout(() => {
                        setToast(false);
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('❌ Login request failed:', error);
                
                // Handle fetch or server errors
                setToastMessage('Error in login ' + error);
                setSeverity('error');
                setToast(true);
                setTimeout(() => {
                    setToast(false);
                }, 2000);
            });
    } else {
        console.log('❌ Login validation failed');
        setToastMessage('Please fill all necessary fields!');
        setSeverity('error');
        setToast(true);
        setTimeout(() => {
            setToast(false);
        }, 2000);
    }
};



    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 p-4 pb-16">
            <div className="max-w-screen-lg min-w-fit bg-white shadow-md rounded-lg overflow-hidden p-8 md:flex md:items-center md:justify-center md:space-x-8 w-full mx-4">
                {/* Sign-in form */}
                <div className="w-full md:w-1/2">
                <h2 className="text-2xl font-bold font-inter text-gray-800">WELCOME TO</h2>
                <h2 className="text-2xl font-bold font-inter text-blue-500 mb-3">INTELLQUEUE</h2>
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
                        {/* Company Name field commented out - using default 'test' value */}
                        {/* 
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
                        */}
                        
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            type="button"
                            onClick={handleLogin}
                            >
                             Sign In
                        </button>
                    </form>
                    <div className="text-gray-600 text-xs mt-4">
                        Version: 1.14.5 {/*Commenting for release */}
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