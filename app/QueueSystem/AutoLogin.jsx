'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AutoLogin } from '../api/FetchAPI';
import { useDispatch } from 'react-redux';
import { login, logout, setCompanyName, setAppRights, setDBName } from '@/redux/features/auth-slice';
import { useAppSelector } from '@/redux/store';
import { resetRatesData } from '@/redux/features/rate-slice';
import { resetQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';
import { resetOrderData } from '@/redux/features/order-slice';
import { resetDateRange } from "@/redux/features/report-slice";


const QueueSystemAutoLogin = () => {
  const [error, setError] = useState('');
  const companyName = useAppSelector(state => state.authSlice.companyName);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const ref = searchParams.get('ref');

    if (!ref) {
      setError('Missing encrypted token in URL');
      return;
    }

    const getCompanyName = async () => {
      try {
        const res = await fetch('/api/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: ref }),
        });

        const companyResult = await res.json();
        console.log('Decrypted company result:', companyResult);

        if (companyResult.companyName) {          
          dispatch(setCompanyName(companyResult.companyName))

          const loginResult = await AutoLogin(companyResult.companyName);
          console.log('Login result:', loginResult);

          if (loginResult.status === 'Login Successfully') {
            dispatch(setDBName(companyName));
            dispatch(login(loginResult.userName));
            dispatch(setAppRights(loginResult.appRights));
            dispatch(resetClientData());
            dispatch(resetRatesData());
            dispatch(resetQuotesData());
            dispatch(resetOrderData());
            dispatch(resetDateRange());
            sessionStorage.removeItem("unitPrices");
            sessionStorage.clear();
        } else {
            setError('Invalid credentials. Please check your User Name, Password and Company Name.');
            dispatch(logout());
        }

          // 🔒 Now proceed with login using this companyName...
          router.push('/QueueSystem/WaitingScreen');
        } else {
          setError('Invalid encrypted token');
          dispatch(logout());
        }
      } catch (err) {
        setError('Something went wrong: ' + err.message);
      }
    };

    getCompanyName();
  }, [searchParams]);

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {companyName && <p style={{ color: 'green' }}>Welcome '{companyName}'</p>}
    </div>
  );
};

export default QueueSystemAutoLogin;
