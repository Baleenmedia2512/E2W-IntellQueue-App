'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const categoryOptions = [
  { id: 1, label: 'Category 1', description: 'Description for Option 1' },
  { id: 4, label: 'Category 4', description: 'Description for Option 4' },
  { id: 5, label: 'Category 5', description: 'Description for Option 5' },
  { id: 6, label: 'Category 6', description: 'Description for Option 6' },
];

const AdCategoryPage = ({categories}) => {
  const [selectedAdCategory, setSelectedAdCategory] = useState(null);
  const [datas, setDatas] = useState([]);
//  const [cat, set] = useState(false);
  const routers = useRouter();

  const filteredData = datas
  .filter(item => item.adType === categories)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  useEffect(() => {
    const username = Cookies.get('username');

    if (!username) {
      routers.push('/login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  return (
    <div>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <> <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Category</h1>
          <button
            className="text-black px-2 py-1 rounded text-center"
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
          </button></>
      </div>
      <h1 className='mx-[8%] font-semibold mb-8'>Select any one</h1>
      <ul className="flex flex-wrap items-center justify-center mx-[8%]">
        {filteredData.map((option) => (
          <label
            key={option.adCategory}
            className='relative flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 hover:bg-gray-100'
            onClick={() => {
              setSelectedAdCategory(option.adCategory);
            }}
          >
            <div className="text-lg font-bold flex items-center justify-center">{option.adCategory}</div>
          </label>
        ))}
      </ul></div>
  )
};

export default AdCategoryPage;