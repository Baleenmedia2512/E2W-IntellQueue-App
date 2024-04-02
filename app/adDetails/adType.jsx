'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { useRouter } from 'next/navigation';
import { AdMediumPage } from './page';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';

const AdTypePage = () => {
  const username = useAppSelector(state => state.authSlice.userName);
  const dispatch = useDispatch();
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);

  const [selectedAdType, setSelectedAdType] = useState(null);
  const [datas, setDatas] = useState([]);
  const [showAdCategoryPage, setShowAdCategoryPage] = useState(false);
  const [selectedTypeofAd, setSelectedTypeofAd] = useState(null);
  const routers = useRouter();
  const [showAdMediumPage, setShowAdMediumPage] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  //fetch all the valid rates at the loading of the page
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        //check if adtype is already selected. If selected move to adCategory page
        if (adType) {
          setShowAdCategoryPage(true);
        } else {
          setShowAdCategoryPage(false);
        }

        // if ((!Cookies.get('clientname') || !Cookies.get('clientnumber') || !Cookies.get('selectedsource')) && !Cookies.get('isSkipped')){
        //   routers.push('/addenquiry');
        // }
  
        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php');
          const data = await response.json();
          setDatas(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, []);
  
  //filter using adMedium - also sorting and removing duplicates
  const filteredTypeofAd = datas
  .filter(item => item.rateName === adMedium)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.typeOfAd === value.typeOfAd) === index
  )
  .sort((a, b) => a.typeOfAd.localeCompare(b.typeOfAd))
  ;

  //filter using adtype - also sorting and removing duplicates
  const filteredAdType = datas
  .filter(item => item.rateName === adMedium)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adType === value.adType) === index
  )
  .sort((a, b) => a.adType.localeCompare(b.adType))
  ;

  //search Filter for adType
  const searchedTypeofAd = filteredTypeofAd.filter((optionn) =>
    optionn.typeOfAd.toLowerCase().includes(searchInput.toLowerCase())
  );

  //to move to Ad Medium page
  const moveToPreviousPage = (adMedium) => {
    //To move to adMedium from AdType
    if(adMedium || filteredTypeofAd.length === 1){
      dispatch(resetQuotesData());
      setShowAdMediumPage(true);
    } else { //To move to adType from adCategory
      //Cookies.remove('selecteds');
      dispatch(setQuotesData({selectedAdType: ""}));
      setSelectedTypeofAd(null);
    }
  }

  //search filter for adCategory
  const searchedAdType = filteredAdType.filter((optionn) =>
    optionn.adType.toLowerCase().includes(searchInput.toLowerCase())
  );

  useEffect(() => {
      //To move to adCategory page from Edition page
      if(Cookies.get('selecteds')){ 
        const selected = JSON.parse(Cookies.get('selecteds'))
        if(filteredAdType.filter(item => item.typeOfAd === selected.typeOfAd).length>1){
          setSelectedTypeofAd(Cookies.get('selecteds'));
        }
      }

    //to move to adType from adCategory page
    if (!selectedTypeofAd && filteredTypeofAd.length === 1 && !Cookies.get('backfromcategory')) {
      setSelectedTypeofAd(filteredTypeofAd[0]);
      //dispatch(setQuotesData({adType: filteredTypeofAd[0]}))
      Cookies.set('selecteds' ,JSON.stringify(filteredTypeofAd[0]));
    }
  },[filteredTypeofAd] );

const greater = '>>'
  return (
    <div>
      {showAdCategoryPage && (<AdCategoryPage />)}
      {showAdMediumPage && (<AdMediumPage />)}
      {(!showAdCategoryPage && !showAdMediumPage) && (
      <div className='text-black'>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <>
        <h1 className='font-semibold'><button className='hover:transform hover:scale-110 transition-transform duration-300 ease-in-out mr-8' onClick={() => {moveToPreviousPage(!selectedTypeofAd)}
    }> <FontAwesomeIcon icon={faArrowLeft} className=' text-xl'/> </button> 
    {adMedium} {selectedTypeofAd ? greater : ''} {selectedTypeofAd ? selectedTypeofAd.typeOfAd : ''}</h1>
          <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
              dispatch(resetQuotesData())
              routers.push('/');
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
      {/* <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1> */}
      <br />

      <h1 className='text-2xl font-bold text-center  mb-4'>Select AD {!selectedTypeofAd ? 'Type' : 'Category'}</h1>
    
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
          {/* Show page based on Ad Type selection. If adType selected move to adCategory Page*/}
          {!selectedTypeofAd ? (
        <div className="flex flex-col mx-[8%]">
        {searchedTypeofAd.map((optionss) => (
          <label
            key={optionss.typeOfAd}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={() => {
            {
              dispatch(setQuotesData({selectedAdType: optionss.typeOfAd, selectedAdCategory: optionss.adType}))
              setSelectedTypeofAd(optionss);
              Cookies.set('selecteds' ,JSON.stringify(optionss));
          }}}
          >
            <div className="text-lg font-bold flex items-center justify-center">{optionss.typeOfAd}</div>

          </label>
        ))}
      </div>):  
      {/* Check if page has single value. If single value move to adCategory*/}
      (filteredAdType.filter(item => item.typeOfAd === selectedTypeofAd.typeOfAd).length>1)? ( 
      <ul className="flex flex-col items-center mx-[8%]">
        
          {searchedAdType.filter(item => item.typeOfAd === selectedTypeofAd.typeOfAd).map((option) => (
            <label
              key={option.adType}
              className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
              onClick={() => {
                dispatch(setQuotesData({selectedAdType: option.typeOfAd, selectedAdCategory: option.adType}))
                setSelectedAdType(option);
                 setShowAdCategoryPage(true);
              }}
            >
              <div className="text-lg font-bold flex items-center justify-center">{option.adType}</div>
            </label>
          ))}
        </ul>):(setShowAdCategoryPage(true),
        dispatch(setQuotesData({selectedAdType: selectedTypeofAd.typeOfAd, selectedAdCategory: selectedTypeofAd.adType}))
        )}
</div>
      
      </div>)}
      </div>
  )
};

export default AdTypePage;