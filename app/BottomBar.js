'use client'
import React, { useState , useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

const BottomBar = () => {
    const routers = useRouter();
    const [buttonPressed, setButtonPressed] = useState();
    const currentPath = usePathname();
    const username = Cookies.get('username')

    if (currentPath === '/login') {
      return null;
    }

  return (
      <nav className="flex justify-around bg-white border p-2 fixed bottom-0 left-0 w-full">
        <button className={` flex-grow hover:bg-gray-600 w-1/3 rounded-lg ${
            // buttonPressed === "Rates Validation" ? 'bg-lime-200' : ''
            '/' === currentPath ? 'bg-lime-200' : ''
          }`}
        onClick={() => {routers.push('/'); setButtonPressed("Rates Validation")}}
        >Rates Validation</button>
        <button
        className={`flex-grow hover:bg-gray-600 w-1/3 rounded-lg ${
            (currentPath === '/addenquiry' || currentPath === '/adDetails') ? 'bg-lime-200' : ''
          }`}
        onClick={() => routers.push('/addenquiry')}
        >Quote Sender</button>
        <button
        className='flex-grow hover:bg-gray-600 w-1/3 py-3 rounded-lg'
        onClick={() => {routers.push('/login')
      Cookies.remove('username')}}
        >Logout</button>
      </nav>
  );
};

export default BottomBar;