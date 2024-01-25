'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { useRouter } from 'next/navigation';
import { AdMediumPage } from './page';

const AdTypePage = () => {
  const [selectedAdType, setSelectedAdType] = useState(null);
  const [datas, setDatas] = useState([]);
  const [cat, setCat] = useState(false);
  const routers = useRouter();
  const [showAdMedium, setShowAdMedium] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    const username = Cookies.get('username');

    if(Cookies.get('adtype')){
      setCat(true)
      } else{
        setCat(false)
      }
    if (!username) {
      routers.push('/login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  const filteredTypeofAd = datas
  .filter(item => item.rateName === Cookies.get('ratename'))
  .filter((value, index, self) => 
    self.findIndex(obj => obj.typeOfAd === value.typeOfAd) === index
  )
  .sort((a, b) => a.typeOfAd.localeCompare(b.typeOfAd))
  ;

  const filteredData = datas
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adType === value.adType) === index
  )
  .sort((a, b) => a.adType.localeCompare(b.adType))
  ;

  const searchedType = filteredData.filter((optionn) =>
    optionn.adType.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div>
      {cat && (<AdCategoryPage />)}
      {showAdMedium && (<AdMediumPage />)}
      {(!cat && !showAdMedium) && (
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
      

      <button className='mx-[8%] mb-6 hover:transform hover:scale-110 transition-transform duration-300 ease-in-out' onClick={() => {Cookies.remove('ratename'); setShowAdMedium(true)}
    }> <FontAwesomeIcon icon={faArrowLeft} /> </button>
    <h1 className='mx-[8%] mb-2 font-semibold'>Ad Medium : {Cookies.get('ratename')}</h1>
    <div className='mx-[8%] relative'>
          <input
          className="w-full border border-purple-500 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-700 focus:ring focus:ring-purple-200"
        type="text"
        value={searchInput}
        onChange={handleSearchInputChange}
        placeholder="Search"
      />
      <div className="absolute top-0 right-0 mt-2 mr-3">
          <FontAwesomeIcon icon={faSearch} className="text-purple-500" />
        </div></div>
        <div className="flex flex-col mx-[8%]">
        {filteredTypeofAd.map((optionss) => (
          <label
            key={optionss.typeOfAd}
          >
            <div className="text-lg font-bold mt-8">{searchedType.filter(item => item.typeOfAd === optionss.typeOfAd).length>0 && (optionss.typeOfAd)}</div>

            <ul className="flex flex-col items-center">
        {searchedType.filter(item => item.typeOfAd === optionss.typeOfAd).map((option) => (
          <label
            key={option.adType}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 bg-sky-400 hover:text-white hover:bg-violet-800'
            onClick={() => {
              Cookies.set('adtype', option.adType);
              setSelectedAdType(option);
              setCat(true);
            }}
          >
            <div className="text-lg font-bold flex items-center justify-center">{option.adType}</div>
          </label>
        ))}
      </ul>
          </label>
        ))}
      </div>
      </div>
       )} 
      </div>
  )
};

export default AdTypePage;