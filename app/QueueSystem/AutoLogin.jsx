'use client';
import './styles.css';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login, setCompanyName, setDBName, setAppRights } from '@/redux/features/auth-slice';
import { resetRatesData } from '@/redux/features/rate-slice';
import { resetQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';
import { resetOrderData } from '@/redux/features/order-slice';
import { resetDateRange } from '@/redux/features/report-slice';

const QueueSystemAutoLogin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const autoLogin = async () => {
      const userName = searchParams.get('username');
      const password = searchParams.get('password');
      const companyName = searchParams.get('companyName');

      if (!userName || !password || !companyName) {
        setError('Missing login parameters in the URL.');
        setLoading(false);
        return;
      }

      try {
        const encodedPassw = encodeURIComponent(password);
        const response = await fetch(
          `https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${companyName}&JsonUserName=${userName}&JsonPassword=${encodedPassw}`
        );

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();

        if (data.status === 'Login Successfully') {
          // Dispatch Redux actions
          dispatch(setDBName(companyName));
          dispatch(setCompanyName(companyName));
          dispatch(login(userName));
          dispatch(setAppRights(data.appRights));
          dispatch(resetClientData());
          dispatch(resetRatesData());
          dispatch(resetQuotesData());
          dispatch(resetOrderData());
          dispatch(resetDateRange());
          sessionStorage.removeItem('unitPrices');
          sessionStorage.clear();

          // Navigate to the waiting screen
          router.push('/QueueSystem/WaitingScreen');
        } else {
          setError('Invalid credentials. Please check the URL parameters.');
        }
      } catch (err) {
        setError('Error during login: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [searchParams, dispatch, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16 mb-4 animate-spin"></div>
          <p className="text-gray-700 text-lg">Logging in, please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default QueueSystemAutoLogin;