'use client'
import React, { useState } from 'react';
import Select from 'react-select';

const clientsData = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const [select1, setSelect1] = useState('');
  const [select2, setSelect2] = useState('');

  const handleSubmit = () => {

    console.log('Form submitted!');
  };

  return (
    <div className="container mx-auto mt-28">
      <div className="flex justify-center">
        <div className="w-1/3 p-4 flex flex-col items-center">
        <p className="font-bold text-black mb-4">Enter values in required field</p>
        <label className='flex flex-col items-left'>Client Name</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Name"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
          />
          <label>Client Contact</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Contact"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
          />
          <label>Client Email</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Client Email"
            value={input3}
            onChange={(e) => setInput3(e.target.value)}
          />
          <label>CSE</label>
          <Select
            className="w-full mb-4"
            value={select1}
            onChange={(selectedOption) => setSelect1(selectedOption)}
            options={options}
            placeholder="Select CSE"
            isClearable={true}
          />
          <label>Source</label>
          <Select
            className="w-full mb-4"
            value={select2}
            onChange={(selectedOption) => setSelect2(selectedOption)}
            options={options}
            placeholder="Select Source"
            isClearable={true}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full mt-4 transition-all duration-300 ease-in-out hover:bg-green-600"
            onClick={handleSubmit} >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default clientsData;
