// components/CustomAlert.js
import React from 'react';

const CustomAlert = ({ message, onOk, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <p className="text-gray-800 text-lg mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            No
          </button>
          <button
            onClick={onOk}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;