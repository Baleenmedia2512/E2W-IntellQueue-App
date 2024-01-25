'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import AdDetailsPage from './ad-Details';
import AdTypePage from './adType';

const categoryOptions = [
  { id: 1, label: 'Category 1', description: 'Description for Option 1' },
  { id: 4, label: 'Category 4', description: 'Description for Option 4' },
  { id: 5, label: 'Category 5', description: 'Description for Option 5' },
  { id: 6, label: 'Category 6', description: 'Description for Option 6' },
];

const AdCategoryPage = () => {
  const [selectedAdCategory, setSelectedAdCategory] = useState(null);
  const [datas, setDatas] = useState([]);
  const [vend, setVend] = useState(false);
  const routers = useRouter();
  const [showAdTypePage, setShowAdTypePage] = useState(false)

  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filteredData = datas
  .filter(item => item.adType === Cookies.get('adtype'))
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  const splitNames = filteredData.map(item => {
    const [firstPart, secondPart] = item.adCategory.split(':');
    const updatedFirstPart = (secondPart === undefined? Cookies.get('adtype') : firstPart);
    // console.log(updatedFirstPart)
    // console.log(secondPart)
    // console.log(firstPart)
    return { ...item, firstName: updatedFirstPart, lastName: secondPart || firstPart};
  });

  const filteredDataone = splitNames
  .filter((value, index, self) => 
    self.findIndex(obj => obj.firstName === value.firstName) === index
  )
  ;

  const searchedType = splitNames.filter((option) =>
  option.lastName.toLowerCase().includes(searchInput.toLowerCase())
);

  useEffect(() => {
    const username = Cookies.get('username');
    if(selectedAdCategory){
    setVend(Cookies.get('vendo'))
    }
    if (!username) {
      routers.push('../login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  return (
    <div>
      {showAdTypePage && (<AdTypePage />)}
      {(!vend && showAdTypePage === false) && (<div>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <> <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Edition-Remarks</h1>
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

      <button className='mx-[8%] mb-6  hover:scale-110 hover:text-orange-900' onClick={() => {Cookies.remove('adtype'); setShowAdTypePage(true)}
    }> <FontAwesomeIcon icon={faArrowLeft} /> </button>
    <h1 className='mx-[8%] mb-2 font-semibold'>Ad Medium : {Cookies.get('ratename')}</h1>
      <h1 className='mx-[8%] mb-2 font-semibold'>Ad Type : {Cookies.get('adtype')}</h1>
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

      <ul className="flex flex-col mx-[8%]">
        {filteredDataone.map((option) => (
          <label
            key={option.firstName}
          >
            {/* <div className="text-lg font-bold mt-8">{(option.adCategory.includes(":"))?(option.firstName):(categories.adType)}</div> */}
            <div className="text-lg font-bold mt-8">{searchedType.filter(item => item.firstName === option.firstName).length>0 && option.firstName}</div>
            <ul className="flex flex-col items-center">
              {searchedType.filter(item => item.firstName === option.firstName).map((options) => (
          <label
            key={options.adCategory}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 bg-sky-400 hover:text-white hover:bg-violet-800'
            onClick={() => {
              setSelectedAdCategory(options);
              Cookies.set('adMediumSelected', true);
              //Cookies.set('ratename', options.rateName);
              //Cookies.set('adtype', options.adType);
              Cookies.set('adcategory', options.adCategory);
              Cookies.set('rateperunit', options.ratePerUnit)
              Cookies.set('minimumunit', options.minimumUnit);
              Cookies.set('defunit', options.Units);
              setVend(true)
            }}
          >
            <div className="text-lg font-bold flex items-center justify-center">{options.lastName}</div>
</label>))
              }
            </ul>
          </label>
        ))}
      </ul></div>)}
      {/* {vend && <VendorPage details ={selectedAdCategory}/>} */}
      {vend && <AdDetailsPage />}

      </div>
  )
};

export default AdCategoryPage;