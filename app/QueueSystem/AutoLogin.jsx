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
import { CircularProgress, Box, Typography } from '@mui/material'; // Import Material-UI components
import { resetPhoneNumber, resetLanguage } from "@/redux/features/queue-slice";

const QueueSystemAutoLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const companyName = useAppSelector(state => state.authSlice.companyName);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const ref = searchParams.get('ref');

    if (!ref) {
      setError('Missing encrypted token in URL');
      console.error('Missing encrypted token in URL');
      return;
    }

    const getCompanyName = async () => {
      try {
        setLoading(true); // Set loading to true at the start
        const decodedRef = decodeURIComponent(ref); // Decode the encrypted token

        const res = await fetch('/api/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedData: decodedRef }), // Pass the decoded token
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `API responded with status ${res.status}`);
        }

        const { companyName } = await res.json(); // Extract companyName directly

        if (companyName) {
          dispatch(setCompanyName(companyName));

          const loginResult = await AutoLogin(companyName); // Pass the companyName directly

          if (loginResult.status === 'Login Successfully') {
            dispatch(setDBName(companyName));
            dispatch(login(loginResult.userName));
            dispatch(setAppRights(loginResult.appRights));
            dispatch(resetClientData());
            dispatch(resetRatesData());
            dispatch(resetQuotesData());
            dispatch(resetOrderData());
            dispatch(resetDateRange());
            dispatch(resetPhoneNumber());
            dispatch(resetLanguage());
            sessionStorage.removeItem("unitPrices");
            sessionStorage.clear();
            router.push('/QueueSystem/LanguageSelection'); // Redirect to the welcome screen
          } else {
            throw new Error('Invalid credentials. Please check your User Name, Password and Company Name.');
          }
        } else {
          throw new Error('Invalid encrypted token');
        }
      } catch (err) {
        console.error('Error during auto-login:', err.message);
        setError('Something went wrong: ' + err.message);
        dispatch(logout());
      } finally {
        setLoading(false); // Set loading to false after processing
      }
    };

    getCompanyName();
  }, [searchParams]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="h6" mt={2} color="textSecondary">
            Did you know? Medical scans like CTs help diagnose conditions early. Please wait...
          </Typography>
        </Box>
      ) : (
        error && (
          <Typography variant="body1" color="error" textAlign="center">
            {error}
          </Typography>
        )
      )}
    </Box>
  );
};

export default QueueSystemAutoLogin;
