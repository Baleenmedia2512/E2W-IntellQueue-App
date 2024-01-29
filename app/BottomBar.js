'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const BottomBar = () => {
    const routers = useRouter();
    const pathname = routers;

  const isActive = (path) =>
   {path === pathname};

   useEffect(()=>{
    console.log(pathname,"h" );
   })

  return (
    // <div className="">
      <nav className="flex justify-around bg-gray-800 text-white p-4 fixed bottom-0 left-0 w-full">
        <button className={`flex-grow hover:bg-gray-600 w-1/3 rounded-lg border ${
            isActive('/') ? 'bg-lime-200' : 'bg-sky-700'
          }`}
        onClick={() => routers.push('/')}
        >Rates Validation</button>
        <button
        className={`flex-grow hover:bg-gray-600 w-1/3 rounded-lg border ${
            isActive('/addenquiry') ? 'bg-lime-200' : 'bg-sky-700'
          }`}
        onClick={() => routers.push('/addenquiry')}
        >Add Enquiry</button>
        <button
        className={`flex-grow hover:bg-gray-600 w-1/3 py-3 rounded-lg border ${
            isActive('/adDetails') ? 'bg-lime-200' : 'bg-sky-700'
          }`}
        onClick={() => routers.push('/adDetails')}
        >Quote Sender</button>
      </nav>
    // </div>
  );
};

export default BottomBar;