'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const QueueSystemAutoLogin = () => {
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

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

        const data = await res.json();

        if (data.companyName) {
          setCompanyName(data.companyName);
          console.log('Decrypted company:', data.companyName);

          // 🔒 Now proceed with login using this companyName...
          // router.push('/QueueSystem/WaitingScreen'); // Or wherever
        } else {
          setError('Invalid encrypted token');
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
