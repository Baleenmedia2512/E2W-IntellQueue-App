'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';

const BottomBar = () => {
  const routers = useRouter();
  const currentPath = usePathname();
  const username = Cookies.get('username')
  const [isHovered, setIsHovered] = useState('')
  const clientName = Cookies.get('clientname');
  const clientNumber = Cookies.get('clientnumber');
  const selectedSource = Cookies.get('selectedsource');

  if (currentPath === '/login') {
    return null;
  }

  const moveToQuoteSender = () => {
    if ((clientName !== '' && clientNumber !== '' && selectedSource !== '') || Cookies.get('isSkipped')) {
      routers.push('../adDetails');
    }
    else {
      routers.push('/')
    }
  }

  return (
    <nav className="flex justify-around bg-white border p-2 fixed bottom-0 left-0 w-full">
      <button className={` flex flex-col items-center justify-center h-16 w-1/4 py-2 rounded-lg ${
        '/' === currentPath ? 'bg-white' : ''
        }`}
        onClick={() => { routers.push('/rate-validation'); }}
        onMouseEnter={() => setIsHovered('Rates')}
        onMouseLeave={() => setIsHovered(null)}
      >
        <div className={` ${'/rate-validation' === currentPath ? 'rounded-full border p-2 px-10 border-gray-500 bg-gray-500':''}`}>
        <Image src="/images/approval.png" alt="Validation Icon" width={30} height={30} />
        </div>
        <label>{isHovered==='Rates'  ? 'Rates Validation' : ''}</label>
      
      </button>
      <button
        className={`flex flex-col items-center justify-center transition duration-500 py-2 h-16 w-1/4 rounded-lg ${(currentPath === '/' || currentPath === '/adDetails') ? 'bg-white' : ''
          }`}
        onClick={() => moveToQuoteSender()}
        onMouseEnter={() => setIsHovered('Quotes')}
        onMouseLeave={() => setIsHovered(null)}
      >
        <div className={` ${(currentPath === '/' || currentPath === '/adDetails') ? 'rounded-full border p-2 px-10 border-gray-500 bg-gray-500':''}`}>
        <Image src="/images/profiles.png" alt="Quote Sender Icon" width={30} height={30} />
        </div>
      <label>{isHovered==='Quotes' ? 'Quote Sender' : ''}</label>
      </button>
      <button
        className={`flex flex-col items-center justify-center transition duration-500 py-2 h-16 w-1/4 rounded-lg ${(currentPath === '/' || currentPath === '/adDetails') ? 'bg-white' : ''
          }`}
        onClick={() => routers.push('/RatesEntry')}
        onMouseEnter={() => setIsHovered('RatesEntry')}
        onMouseLeave={() => setIsHovered(null)}
      >
        <div className={` ${(currentPath === '/RatesEntry' ) ? 'rounded-full border p-2 px-8 border-gray-500 bg-gray-500':''}`}>
        <Image src="/images/package.png" alt="Rates Entry Icon" width={30} height={30} />
        </div>
      <label className=' text-xs'>{isHovered==='RatesEntry' || (currentPath === '/RatesEntry' ) ? 'Rates Entry' : ''}</label>
      </button>

      <button
        className='flex flex-col items-center justify-center py-2 h-16 w-1/4 rounded-lg'
        onClick={() => {
          routers.push('/login')
          Cookies.remove('username')
          Cookies.remove('clientname');
          Cookies.remove('clientnumber');
          Cookies.remove('selectedsource');
          Cookies.remove('clientemail');
        }}
        onMouseEnter={() => setIsHovered('log')}
        onMouseLeave={() => setIsHovered(null)}
      ><Image src="/images/exit.png" alt="Logout Icon" width={30} height={30} />
      <label>{isHovered==='log' ? 'Logout' : ''}</label>
      </button>
    </nav>
  );
};

export default BottomBar;