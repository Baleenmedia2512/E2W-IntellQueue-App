'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdTypePage from './adType';

const AdMediumPage = () => {
  const [selectedAdMedium, setSelectedAdMedium] = useState('');
  const [datas, setDatas] = useState([]);
  const [type, setType] = useState(false);
  const routers = useRouter();

  // const handleOptionChange = (option) => {
  //   //setSelectedOption(option);
  //   setSelectedOption((prevSelectedOption) => 
  //   prevSelectedOption === option ? null : option
  // );
  // };

  const datasOptions = datas
  .filter((value, index, self) => 
    self.findIndex(obj => obj.rateName === value.rateName) === index
  )
  .sort((a, b) => a.rateName.localeCompare(b.rateName));
//   .map((option) => ({
//    // if(option.rateName === 'Automobile'){
//     ...option,
//     icon: `https://t3.ftcdn.net/jpg/01/71/13/24/360_F_171132449_uK0OO5XHrjjaqx5JUbJOIoCC3GZP84Mt.jpg`
//  // }
//   }));

  const icons = (iconValue) =>{
    if (iconValue === 'Automobile') {
      return (<Image  src="/images/school-bus.png" alt="car Icon" width={60} height={60} />);
    } else if(iconValue === 'Newspaper'){
      return (<Image  src="/images/newspaper.png" alt="car Icon" width={60} height={60} />);
    } else if(iconValue === 'Print Services'){
      return (<Image  src="/images/printer.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'Production'){
      return (<Image  src="/images/smart-tv.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'Radio Ads'){
      return (<Image  src="/images/radio.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'Road Side'){
      return (<Image  src="/images/road-map.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'Screen Branding'){
      return (<Image  src="/images/branding.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'Test'){
      return (<Image  src="/images/test.png" alt="car Icon" width={60} height={60} />);
    }else if(iconValue === 'TV'){
      return (<Image  src="/images/tv-monitor.png" alt="car Icon" width={60} height={60} />);
    }
  }

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
        {type && (<AdTypePage data={selectedAdMedium}/>)}
       {!type && (
        <div>
       <div className="flex flex-row justify-between mx-[8%] mt-8">
        
         <> <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Medium</h1>
          <button
          className="text-black px-2 py-1 rounded text-center"
          onClick={() => {
            routers.push('../addenquiry')
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
        <ul className="mx-[8%] mb-8 flex flex-wrap justify-stretch grid gap-1 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
        {datasOptions.map((option) => (
            <label
              key={option.rateName}
              className={`relative flex flex-col items-center justify-center px-[-10] w-full h-64 border cursor-pointer transition duration-300 rounded-lg  ${
                selectedAdMedium === option ? 'border-lime-500 bg-stone-100' : 'border-gray-300 hover:bg-gray-100'
              }`}
          //    htmlFor={`option-${option.id}`}
          onClick={() =>{
            setSelectedAdMedium(option.rateName);
            setType(true);
          }}
            >
              <div className="text-lg font-bold mb-2 flex items-center justify-center">{option.rateName}</div>
              <div className='mb-2 flex items-center justify-center'>{icons(option.rateName)}</div>
            </label>
          ))
        }
        </ul>
        </div>
)}</div>
  );
};

export default AdMediumPage;
