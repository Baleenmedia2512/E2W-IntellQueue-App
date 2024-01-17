'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
          {datasOptions.map((option) => (
            <label
              key={option.rateName}
              className={`relative  flex flex-col items-center justify-center px-10 w-full h-64 p-4 border m-4 cursor-pointer transition duration-300 rounded-lg  ${
                selectedOption === option ? 'border-lime-500 bg-stone-100' : 'border-gray-300 hover:bg-gray-100'
              }`}
          //    htmlFor={`option-${option.id}`}
          onClick={() =>{
            routers.push('../adType');
          }}
            >
              {/* <input
                type="radio"
                id={`option-${option.rateName}`}
                name="big-radio-selector"
                className="hidden"
                checked={selectedOption === option}
                onChange={() => handleOptionChange(option)}
              />
              {/* Radio button on the top right corner }
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 border border-gray-500 rounded-full flex items-center justify-center">
                  {selectedOption === option && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </div> */}
              <div className="text-lg font-bold mb-2 flex items-center justify-center">{option.rateName}</div>
              <div className='mb-2 flex items-center justify-center'>{icons(option.rateName)}</div>
            </label>
          ))
        }
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
