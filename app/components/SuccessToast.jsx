import React from 'react';
import { MdCheckCircle } from 'react-icons/md';

const SuccessToast = ({ message }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-800 shadow-md p-4 rounded-md flex items-center">
      <MdCheckCircle className="mr-2 text-green-600" /> 
      {message}
    </div>
  );
};

export default SuccessToast;
