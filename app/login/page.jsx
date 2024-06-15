'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { login, logout, setCompanyName } from '@/redux/features/auth-slice';
import MuiAlert from '@mui/material/Alert';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetRatesData } from '@/redux/features/rate-slice';
import { resetQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';

const Login = () => {
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [companyNameSuggestions, setCompanyNameSuggestions] = useState([]);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  useEffect(() => {
    dispatch(logout())

  },[])


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

  const toggleShowPassword = () => {setShowPassword(!showPassword)};

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = (event) => {
        event.preventDefault();
        if (userName === 'GraceScans') {
          // showToastMessage('success', 'Logged in as GraceScans');
          setSuccessMessage('Logged in as GraceScans');
        setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
          dispatch(login(userName));
          router.push("/");
          return;
        }
        const encodedPassw = encodeURIComponent(password)
        if(userName === '' || password === ''){
          // showToastMessage('warning', "Please Enter User Name and Password")
          setToastMessage('Please Enter User Name and Password');
              setSeverity('error');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
        }else{
        fetch(`https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${companyName}&JsonUserName=${userName}&JsonPassword=${encodedPassw}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("response.statusText");
          }
          return response.json();
        })
          .then(data => {
            if(data === 'Login Successfully'){
              // showToastMessage('success', data)
              setSuccessMessage(data);
                setTimeout(() => {
              setSuccessMessage('');
            }, 2000);
              //Cookies.set('username', userName, { expires: 7 });
              dispatch(login(userName));
              dispatch(resetClientData());
              dispatch(resetRatesData());
              dispatch(resetQuotesData());
              dispatch(resetClientData());
              if(companyName === 'Grace Scans'){
                router.push("/") //navigating to the enquiry Screen
              } else{
                router.push("/adDetails")
              }
            }else{
              // showToastMessage('error', "Invalid user name or password!")
              setToastMessage('Invalid user name or password!');
              setSeverity('error');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
            }
        })
          .catch(error => {
            // showToastMessage('error', "Error in login " + error)
            setToastMessage('Error in login ' + error);
              setSeverity('error');
              setToast(true);
              setTimeout(() => {
                setToast(false);
              }, 2000);
          });
      };
  }
      
  return (
    <div className="bg-white h-screen flex items-center justify-center content-center self-center justify-self-center">
      <div className="bg-white p-8 rounded-3xl shadow-md flex items-center justify-center ml-16 mb-10 self-center">
        <form className='flex flex-col items-center justify-self-center'> 
          {/* <div className='pt-0 justify-center flex'>
            <div className='bg-gray-300 rounded-full items-center flex justify-center h-12 w-12'>
              <img src="/images/WHITE PNG.png" className='h-10 w-10 rounded-full' alt='profile' />
            </div>
          </div> */}
          
          <h1 className="text-3xl font-bold mb-8 text-black font-poppins">Login</h1>
          <input
            className="p-3 shadow-2xl  glass w-80 justify-self-center outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="text"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)} />
          <div className="relative">
            <input
             className="p-3 shadow-2xl  glass w-80  outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mt-4 mb-4"
              type={ showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute top-2 right-4 cursor-pointer mt-5 mb-4"
              onClick={toggleShowPassword}
            >
              {showPassword ? (
                <FontAwesomeIcon
                className="far fa-eye"
                icon={faEye}
                style={{ color: 'black', fontSize: '14px' }}
                alt="Show Password"
              />
              ) : (
                <FontAwesomeIcon
                  className="far fa-eye-slash"
                  icon={faEyeSlash}
                  style={{ color: 'black', fontSize: '14px' }}
                  alt="Hide Password"
                />
              )}
            </span>
            </div>
            <input className="p-3 shadow-2xl  glass w-80 justify-self-center outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
            type="text" placeholder='Company Name' value={companyName} onChange={handleSearchTermChange}/>
            {(companyNameSuggestions.length > 0 && companyName !== '') && (
          <ul className="list-none border-green-300 w-80 ">
            {companyNameSuggestions.map((name, index) => (
              <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
                <button
                  type="button"
                  className="text-black w-full h-full text-left"
                  onClick={handleCompanyNameSelection}
                  value={name}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
          <button
            type="button"
            className="mt-4 outline-none glass shadow-2xl  w-full p-3  bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:border-[1px]  hover:text-[#008000] font-bold rounded-md mb-4"
            //className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 font-poppins transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={handleLogin}
          >
            Login
          </button>
          <><br /></>
          <p className='text-black'>V: 1.0.16</p>
        </form>
      </div>
      {/* <div className='bg-surface-card p-8 rounded-2xl mb-4'>
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div> */}
      {successMessage && <SuccessToast message={successMessage} />}
      {toast && <ToastMessage message={toastMessage} type="error"/>}
    </div>

  );
};

export default Login;