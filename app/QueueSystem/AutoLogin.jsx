'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { decryptCompanyName } from '@/lib/encryption';
import { useDispatch } from 'react-redux';
import {
  login,
  setDBName,
  setCompanyName,
  setAppRights,
  resetClientData,
  resetQuotesData,
  resetOrderData,
  resetRatesData,
  resetDateRange
} from '@/redux/actions';

export default function QueueSystemAutoLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const autoLogin = async () => {
      const ref = searchParams.get('ref');
      if (!ref) {
        setError('Missing login token.');
        setLoading(false);
        return;
      }

      let companyName;
      try {
        companyName = decryptCompanyName(ref);
      } catch (err) {
        setError('Invalid or tampered token.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://orders.baleenmedia.com/API/Media/Login.php/get?JsonDBName=${companyName}&JsonUserName=admin_user&JsonPassword=super_secure_pass`
        );

        if (!res.ok) throw new Error('Login failed');

        const data = await res.json();

        if (data.status === 'Login Successfully') {
          dispatch(setDBName(companyName));
          dispatch(setCompanyName(companyName));
          dispatch(setAppRights(data.appRights));
          dispatch(resetClientData());
          dispatch(resetRatesData());
          dispatch(resetQuotesData());
          dispatch(resetOrderData());
          dispatch(resetDateRange());
          sessionStorage.clear();

          router.push('/QueueSystem/WaitingScreen');
        } else {
          setError('Invalid credentials.');
        }
      } catch (err) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [searchParams, dispatch, router]);

  return (
    <div className="p-4 text-center">
      {loading ? 'Logging you in securely...' : error || 'Redirecting...'}
    </div>
  );
}
