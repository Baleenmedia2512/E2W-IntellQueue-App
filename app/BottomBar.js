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
      <div className="flex justify-around bg-white border p-2 fixed bottom-0 left-0 w-full">
        <div className={`flex flex-grow hover:bg-gray-600 w-1/3 rounded-lg items-center justify-center ${
            isActive('/') ? 'bg-lime-200' : ''
          }`}
        onClick={() => routers.push('/')}
        >Rates Validation</div>
        <div
        className={`flex items-center justify-center flex-grow hover:bg-gray-600 w-1/3 rounded-lg ${
            isActive('/addenquiry') ? 'bg-lime-200' : ''
          }`}
        onClick={() => routers.push('/addenquiry')}
        >Add Enquiry</div>
        <div
        className={` flex items-center justify-center flex-grow hover:bg-gray-600 w-1/3 py-3 rounded-lg ${
            isActive('/adDetails') ? 'bg-lime-200' : ''
          }`}
        onClick={() => routers.push('/adDetails')}
        >Quote Sender</div>
      </div>
    // </div>
  );
};

export default BottomBar;