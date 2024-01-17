'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const radioOptions = [
  { id: 1, label: 'Option 1', description: 'Description for Option 1' },
  { id: 2, label: 'Option 2', description: 'Description for Option 2' },
  { id: 3, label: 'Option 3', description: 'Description for Option 3' },
  { id: 4, label: 'Option 4', description: 'Description for Option 4' },
  { id: 5, label: 'Option 5', description: 'Description for Option 5' },
  { id: 6, label: 'Option 6', description: 'Description for Option 6' },
];


const AdMediumPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [datas, setDatas] = useState([]);
  const routers = useRouter();

  const handleOptionChange = (option) => {
    //setSelectedOption(option);
    setSelectedOption((prevSelectedOption) => 
    prevSelectedOption === option ? null : option
  );
  };

  const handleNextButtonClick = () => {
    // Handle the logic for the "Next" button click
    console.log("Next button clicked. Selected option:", selectedOption);
  };

  useEffect(() => {
    const username = Cookies.get('username');

    if (!username) {
      routers.push('/login');
    } else {
      fetch('')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center">
      <h1 className='text-2xl font-bold text-center mt-8 mb-4'>Select AD Medium</h1>
      <button
          className="text-black px-2 py-1 rounded"
          onClick={() => {
            routers.push('../addenquiry');
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        </div>
      <div><h1 className='font-semibold text-center mb-4'>Select any one</h1></div>
      <div className="flex flex-wrap justify-center">
        <ul className="grid gap-1 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
          {radioOptions.map((option) => (
            <label
              key={option.id}
              className={`relative px-10 w-full h-64 p-4 border m-4 cursor-pointer transition duration-300 rounded-lg ${
                selectedOption === option ? 'border-lime-500 bg-stone-100' : 'border-gray-300 hover:bg-gray-100'
              }`}
          //    htmlFor={`option-${option.id}`}
            >
              <input
                type="radio"
                id={`option-${option.id}`}
                name="big-radio-selector"
                className="hidden"
                checked={selectedOption === option}
                onChange={() => handleOptionChange(option)}
              />
              {/* Radio button on the top right corner */}
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 border border-gray-500 rounded-full flex items-center justify-center">
                  {selectedOption === option && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="text-lg font-bold mb-2">{option.label}</div>
              <div className="text-gray-700">{option.description}</div>
            </label>
          ))}
        </ul>
      </div>
      {selectedOption && (
        <div className="fixed bottom-8 mt-8 mx-auto">
          <button
            className="bg-lime-500 text-black font-bold py-2 px-16 rounded-lg cursor-pointer"
            onClick={handleNextButtonClick}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdMediumPage;
