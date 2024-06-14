import React from 'react';
import { MdErrorOutline } from 'react-icons/md';

const ToastMessage = ({ message }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-800 shadow-md p-4 rounded-md flex items-center">
      <MdErrorOutline className="mr-2 text-red-600" /> 
      {message}
    </div>
  );
};

export default ToastMessage;
