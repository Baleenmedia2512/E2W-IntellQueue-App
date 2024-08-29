// // MP-101
// import React from 'react';
// import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

// const ToastMessage = ({ message, type }) => {
//   if (!message) return null;

//   return (
//     <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md p-4 rounded-md flex items-center ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
//       {type === 'error' ? <MdErrorOutline className="mr-2 text-red-600" /> : <MdCheckCircle className="mr-2 text-green-600" />}
//       {message}
//     </div>
//   );
// };

// export default ToastMessage;

import React from 'react';
import { MdErrorOutline, MdCheckCircle, MdWarningAmber } from 'react-icons/md';

const ToastMessage = ({ message, type }) => {
  if (!message) return null;

  let bgColor = 'bg-green-100 text-green-800';
  let icon = <MdCheckCircle className="mr-2 text-green-600" />;

  if (type === 'error') {
    bgColor = 'bg-red-100 text-red-800';
    icon = <MdErrorOutline className="mr-2 text-red-600" />;
  } else if (type === 'warning') {
    bgColor = 'bg-yellow-100 text-yellow-800';
    icon = <MdWarningAmber className="mr-2 text-yellow-600" />;
  }

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md p-4 rounded-md flex items-center ${bgColor}`}>
      {icon}
      {message}
    </div>
  );
};

export default ToastMessage;

