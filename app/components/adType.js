'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import AdCategoryPage from './adCategory';

const radioOptions = [
  { id: 1, label: 'Option 1', description: 'Description for Option 1' },
  { id: 4, label: 'Option 4', description: 'Description for Option 4' },
  { id: 5, label: 'Option 5', description: 'Description for Option 5' },
  { id: 6, label: 'Option 6', description: 'Description for Option 6' },
];

const AdTypePage = ({data}) => {
  const [selectedAdType, setSelectedAdType] = useState('');
  const [datas, setDatas] = useState([]);
  const [cat, setCat] = useState(false);
  const routers = useRouter();

  useEffect(() => {
    const username = Cookies.get('username');
    console.log(data);
    if (!username) {
      routers.push('/login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  const filteredData = datas
  .filter(item => item.rateName === data)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adType === value.adType) === index
  )
  .sort((a, b) => a.adType.localeCompare(b.adType))
  ;

  return (
    <div>
      {cat && (<AdCategoryPage categories={selectedAdType} />)}
      {!cat && (
      <div>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <> <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Type</h1>
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
      <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1>
      <ul className="flex flex-wrap items-center justify-center mx-[8%]">
        {filteredData.map((option) => (
          <label
            key={option.adType}
            className='relative flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 hover:bg-gray-100'
            onClick={() => {
              setSelectedAdType(option.adType);
              setCat(true);
            }}
          >
            <div className="text-lg font-bold flex items-center justify-center">{option.adType}</div>
          </label>
        ))}
      </ul>
      </div>)}
      </div>
  )
};

export default AdTypePage;