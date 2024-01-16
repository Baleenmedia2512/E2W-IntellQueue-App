'use client'
import { useState } from 'react';

const radioOptions = [
  { id: 1, label: 'Option 1', description: 'Description for Option 1' },
  { id: 2, label: 'Option 2', description: 'Description for Option 2' },
  { id: 3, label: 'Option 3', description: 'Description for Option 3' },
  { id: 4, label: 'Option 4', description: 'Description for Option 4' },
  { id: 5, label: 'Option 5', description: 'Description for Option 5' },
  { id: 6, label: 'Option 6', description: 'Description for Option 6' },
  // Add more options as needed
];

const AdMediumPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextButtonClick = () => {
    // Handle the logic for the "Next" button click
    console.log("Next button clicked. Selected option:", selectedOption);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className='text-2xl font-bold text-center mt-8 mb-4'>Select AD Medium</h1>
      <h1 className='font-semibold text-center mb-4'>Select any one</h1>
      <div className="flex flex-wrap justify-center">
        <ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
          {radioOptions.map((option) => (
            <label
              key={option.id}
              className={`relative w-32 h-64 p-4 border m-4 cursor-pointer transition duration-300 rounded-lg ${
                selectedOption === option ? 'border-green-500 bg-green-200' : 'border-gray-300 hover:bg-gray-100'
              }`}
              htmlFor={`option-${option.id}`}
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
            className="bg-green-500 text-black font-bold py-2 px-16 rounded-lg cursor-pointer"
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
