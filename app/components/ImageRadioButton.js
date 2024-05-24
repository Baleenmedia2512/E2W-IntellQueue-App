import { setCompanyName } from '@/redux/features/auth-slice';
import { useAppSelector } from '@/redux/store';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const options = [
  { id: 1, title: 'Baleen Media', image: '/images/WHITE PNG.png' },
  { id: 2, title: 'Grace Scans', image: '/images/Grace Scans.jpg' },
];

function ImageRadioButton() {
  const [selectedOption, setSelectedOption] = useState(null);
  const dispatch = useDispatch()
  const companyName = useAppSelector(state => state.authSlice.companyName);

  const handleSelect = (id, companyName) => {
    setSelectedOption(id);
    dispatch(setCompanyName(companyName))
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => handleSelect(option.id, option.title)}
          className={`flex items-center w-full p-3 border rounded transition duration-150 ${
            (selectedOption === option.id || companyName === option.title)
              ? 'border-blue-500 bg-blue-100'
              : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700'
          }`}
          data-checked={selectedOption === option.id}
        >
          <img src={option.image} alt={option.title} className="w-5 h-5" />
          <div className="flex ml-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{option.title}</p>
          </div>
          <input
            type="radio"
            checked={selectedOption === option.id}
            onChange={() => {}}
            className="hidden"
          />
        </button>
      ))}
    </div>
  );
}

export default ImageRadioButton;