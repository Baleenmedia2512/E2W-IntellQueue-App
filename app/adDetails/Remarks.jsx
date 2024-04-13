'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';

const RemarksPage = () => {
  const dispatch = useDispatch();
  const username = useAppSelector(state => state.authSlice.userName);
  const [datas, setDatas] = useState([]);
  const routers = useRouter();
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const selectedAdType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition);

  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  //Choose data based on AdCategory - also sorting and removing duplicates
  const filteredData = datas
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  //Splitting the Edition and Position using :
  const splitNames = filteredData.map(item => {
    console.log(item.adCategory)
    const [firstPart, secondPart] = item.adCategory.split(':');
    return { ...item, Edition: firstPart.trim() , Position: secondPart || ''};
  });

  //search filter for Position 
  const searchedPosition = splitNames.filter((option) =>
    option.Position.toLowerCase().includes(searchInput.toLowerCase())
  );

  //fetch rates 
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php');
          const data = await response.json();
          const filData = data.filter(item => item.adType === adCategory && item.rateName === adMedium);
          setDatas(filData);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, []);

  const greater = ">>"
  return (
    <div>
        <div className='text-black'>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <>
      
    <h1 className='font-semibold'><button className='  hover:scale-110 hover:text-orange-900 mr-8' 
    onClick={() => {
      dispatch(setQuotesData({currentPage: 'edition', selectedEdition: ''}))
  }
    }> <FontAwesomeIcon icon={faArrowLeft} onSelect={() => {setQuotesData({selectedAdCategory: "", selectedAdType: ""}); setShowAdTypePage(true)}}/> </button>
    {adMedium} {greater} { selectedAdType} {greater} {adCategory} {greater} {edition}</h1>

        
    <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
              dispatch(resetQuotesData());
              dispatch(resetClientData());
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
<h1 className='text-2xl font-bold text-center  mb-4'>Select Package</h1>
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
      <div>
      {/* check if only one item is available, if only one move to ad-details page*/}
      
       <ul className="flex flex-col flex-wrap items-center list-disc list-inside mx-[8%]">
              {searchedPosition.filter(item => item.Edition === edition).map((options) => (
          <label
            key={options.adCategory}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={() => {
              //options contain Edition:Position values
              //the edition position is saved in adCategory Cookie\
              dispatch(setQuotesData({selectedPosition: options.adCategory, ratePerUnit: options.ratePerUnit, minimumUnit: options.minimumUnit, unit: options.Unit, rateId: options.rateId, validityDate: options.ValidityDate, selectedVendor: options.VendorName, currentPage: "adDetails"}))
              Cookies.remove('isAdDetails');
            }}
          >
            <div className="text-sm font-bold items-center justify-center text-wrap flex-wrap whitespace-pre-wrap">{options.Position === "" ? 'Skip' : options.Position}</div>
</label>))
              }
            </ul> 
      </div>
      </div>
      </div>
  )
};

export default RemarksPage;