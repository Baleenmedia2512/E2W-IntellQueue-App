'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import AdDetailsPage from './ad-Details';
import AdTypePage from './adType';


const AdCategoryPage = () => {
  const [selectedAdCategory, setSelectedAdCategory] = useState(null);
  const [datas, setDatas] = useState([]);
  const [vend, setVend] = useState(false);
  const routers = useRouter();
  const adType = Cookies.get('adtype')
  const [showAdTypePage, setShowAdTypePage] = useState(false)
  const [selectedFirstName, setSelectedFirstName] = useState(null)

  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filteredData = datas
  .filter(item => item.adType === adType)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  const splitNames = filteredData.map(item => {
    const [firstPart, secondPart] = item.adCategory.split(':');
    const updatedFirstPart = (secondPart === undefined? adType : firstPart);
    return { ...item, firstName: firstPart, lastName: secondPart || ''};
  });

  const filteredDataone = splitNames
  .filter((value, index, self) => 
    self.findIndex(obj => obj.firstName === value.firstName) === index
  )
  ;

  const searchedEdition = filteredDataone.filter((option) =>
  option.firstName.toLowerCase().includes(searchInput.toLowerCase())
);

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
  const greater = ">>"
  return (
    <div className='text-gray-200'>
      {showAdTypePage && (<AdTypePage />)}
      {(!vend && showAdTypePage === false) && (<div>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <>
      
    <h1 className='font-semibold'><button className='  hover:scale-110 hover:text-orange-900' onClick={() => {Cookies.remove('adtype'); setShowAdTypePage(true)}
    }> <FontAwesomeIcon icon={faArrowLeft} /> </button> {Cookies.get('ratename')} {greater} {adType} {selectedFirstName ? greater : ''} {selectedFirstName ? selectedFirstName.firstName : ''}</h1>

        
          <button
            className=" px-2 py-1 rounded text-center"
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
      {/* <h1 className='mx-[8%] font-semibold mb-8'>Select any one</h1> */}
      <br />
<h1 className='text-2xl font-bold text-center  mb-4'>Select {!selectedFirstName ? "Edition": "position"}</h1>
      {/* <h1 className='mx-[8%] mb-2 font-semibold'>Ad Type : {adType}</h1> */}
      <div className='mx-[8%] relative'>
          <input
          className="w-full border border-purple-500 text-black p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-700 focus:ring focus:ring-purple-200"
        type="text"
        value={searchInput}
        onChange={handleSearchInputChange}
        placeholder="Search"
      />
      <div className="absolute top-0 right-0 mt-2 mr-3">
          <FontAwesomeIcon icon={faSearch} className="text-purple-500" />
        </div></div>
<div>{!selectedFirstName ?(
      <ul className="flex flex-col mx-[8%]">
        {searchedEdition.map((option) => (
          <label
            key={option.firstName}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-purple-400  to-lime-400 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={()=> setSelectedFirstName(option)}
          >
            {/* <div className="text-lg font-bold mt-8">{(option.adCategory.includes(":"))?(option.firstName):(categories.adType)}</div> */}
            <div className="text-lg font-bold items-center justify-center">{option.firstName}</div>
            
          </label>
        ))}
      </ul>): splitNames.filter(item => item.firstName === selectedFirstName.firstName).length>1 ?
      (
       <ul className="flex flex-col flex-wrap items-center list-disc list-inside mx-[8%]">
              {searchedType.filter(item => item.firstName === selectedFirstName.firstName).map((options) => (
          <label
            key={options.adCategory}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-purple-400  to-lime-400 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={() => {
              setSelectedAdCategory(options);
              Cookies.set('adMediumSelected', true);
              //Cookies.set('ratename', options.rateName);
              //Cookies.set('adtype', options.adType);
              Cookies.set('typeofad', options.typeOfAd);
              Cookies.set('adcategory', options.adCategory);
              Cookies.set('rateperunit', options.ratePerUnit)
              Cookies.set('minimumunit', options.minimumUnit);
              Cookies.set('defunit', options.Units);
              Cookies.set('rateId', options.rateId)
              setVend(true)
            }}
          >
            <div className="text-sm font-bold items-center justify-center text-wrap flex-wrap whitespace-pre-wrap">{options.lastName}</div>
</label>))
              }
            </ul> 
            ):(
            setVend(true),
            Cookies.set('adcategory', selectedFirstName.adCategory))
            }
            </div>
      
      </div>)}
      {/* {vend && <VendorPage details ={selectedAdCategory}/>} */}
      {vend && <AdDetailsPage />}

      </div>
  )
};

export default AdCategoryPage;