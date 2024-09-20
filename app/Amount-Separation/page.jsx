"use client";  // Mark as client-side component

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';

const Stages = () => {
  const [inputCount, setInputCount] = useState(1); // For user input
  const [fields, setFields] = useState([{ title: "", description: "", dueDate: "" }]);
  const dbName = useAppSelector(state => state.authSlice.dbName);

  const handleInputCountChange = (event) => {
    const newCount = parseInt(event.target.value, 10) || 0;
    setInputCount(newCount);
  };

  const createFields = () => {
    const newFields = [...fields];
    while (newFields.length < inputCount) {
      newFields.push({ title: "", description: "", dueDate: "" });
    }
    while (newFields.length > inputCount) {
      newFields.pop();
    }
    setFields(newFields);
  };

  const handleFieldChange = (index, event, field) => {
    const newFields = [...fields];
    newFields[index][field] = event.target.value;
    setFields(newFields);
  };

  useEffect(() => {
    console.log('Stages component rendered');
  }, [fields]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mb-10">
  <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto my-4 bg-white p-8 rounded-lg shadow-md">
    <h3 className="text-2xl font-bold text-blue-500 text-left">Create Your Stages</h3>
    <div className="border-2 w-10 border-blue-500 mb-6"></div>
    <div className="space-y-6">
      {/* Number of Fields */}
      <div className="w-full">
  <label htmlFor="count" className="block mb-1 text-black font-medium">Number of Fields:</label>
  <div className="flex items-center space-x-4">
    <input
      type="number"
      id="count"
      className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
      value={inputCount}
      onChange={handleInputCountChange}
      min="0"
    />
    <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600" onClick={createFields}>
      Create Stages
    </button>
  </div>
</div>


      {fields.map((field, index) => (
        <div key={index} className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          {/* Field Title */}
          <div className="w-full md:w-1/3">
            <label htmlFor={`title-${index}`} className="block mb-1 text-black font-medium">Field {index + 1} :</label>
            <input
              type="text"
              id={`title-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              value={field.title}
              onChange={(event) => handleFieldChange(index, event, 'title')}
              placeholder={`Enter title for field ${index + 1}`}
            />
          </div>

          {/* Field Description */}
          <div className="w-full md:w-1/3">
            <label htmlFor={`description-${index}`} className="block mb-1 text-black font-medium">Description:</label>
            <textarea
                id={`description-${index}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none h-10"  // Set height similar to input fields
                value={field.description}
                onChange={(event) => handleFieldChange(index, event, 'description')}
                placeholder={`Enter description for field ${index + 1}`}
            />
          </div>


          {/* Due Date */}
          <div className="w-full md:w-1/3">
            <label htmlFor={`dueDate-${index}`} className="block mb-1 text-black font-medium">Due Date:</label>
            <input
              type="date"
              id={`dueDate-${index}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              value={field.dueDate}
              onChange={(event) => handleFieldChange(index, event, 'dueDate')}
            />
          </div>
        </div>
      ))}

      <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">
        Submit
      </button>
    </div>
  </div>
</div>

  );
};

export default Stages;
