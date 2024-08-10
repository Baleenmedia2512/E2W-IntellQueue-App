'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';
import { useAppSelector } from '@/redux/store';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { FetchRateSeachTerm } from '../api/FetchAPI';

export const AdMediumPage = () => {
  const dispatch = useDispatch();
  //const [selectedAdMedium, setSelectedAdMedium] = useState('');
  const [datas, setDatas] = useState([]);
  const [rateSearchTerm,setRateSearchTerm] = useState("");
  const [ratesSearchSuggestion, setRatesSearchSuggestion] = useState([]);
  //const [showAdTypePage, setShowAdTypePage] = useState(false);
  const routers = useRouter();
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage)
  const [searchInput, setSearchInput] = useState('');
  // const companyName = 'Baleen Test';
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const username = useAppSelector(state => state.authSlice.userName);
  // const datas = useAppSelector(state => state.quoteSlice.validRates);
  
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
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

  // Filtered options based on the search input
  const searchedOptions = datasOptions.filter((option) =>
    option.rateName.toLowerCase().includes(searchInput.toLowerCase())
  );

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  const icons = (iconValue) => {
    if (iconValue === 'Automobile') {
      return (<Image src="/images/bus (1).png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Newspaper') {
      return (<Image src="/images/newspaper.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Print Services') {
      return (<Image src="/images/brochure.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Production') {
      return (<Image src="/images/marketing.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Radio Ads') {
      return (<Image src="/images/radio-rounded.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Road Side') {
      return (<Image src="/images/boarding.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Screen Branding') {
      return (<Image src="/images/branding.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Test') {
      return (<Image src="/images/testing.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'TV') {
      return (<Image src="/images/tv-monitor.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Digital Platform') {
      return (<Image src="/images/social-media.png" alt="car Icon" width={60} height={60} />);
    }
  }

  const handleRateSearch = async(e) =>{
    setRateSearchTerm(e.target.value);
    const searchSuggestions = await FetchRateSeachTerm(companyName, e.target.value);
    setRatesSearchSuggestion(searchSuggestions);
  }

  const fetchRate = async(rateId) => {
    try {
      const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchGivenRate.php/?JsonDBName=${companyName}&JsonRateId=${rateId}`);
      if(!response.ok){
        throw new Error(`HTTP error! Error In fetching Rates: ${response.status}`);
      }
      const data = await response.json();
      const firstData = data[0];
      dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedEdition: firstData.Location, selectedPosition: firstData.Package, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, ratePerUnit: firstData.ratePerUnit, minimumUnit: firstData.minimumUnit, unit: firstData.Unit, quantity: firstData.minimumUnit, isDetails: true}))
    } catch (error) {
      console.error("Error while fetching rates: " + error)
    }
  }

  const handleRateSelection = (e) => {
    const selectedRate = e.target.value;
    const selectedRateId = selectedRate.split('-')[0];
    setRatesSearchSuggestion([]);
    setRateSearchTerm(selectedRate);

    fetchRate(selectedRateId);
    dispatch(setQuotesData({rateId: selectedRateId}));
    dispatch(updateCurrentPage("adDetails"));
  }

  useEffect(() => {
    const FetchValidRates = async() => {
      if (!username) {
          routers.push('/login');
      } else{
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
          const data = await response.json();
          setDatas(data)
      }
    }

    FetchValidRates()
    dispatch(setQuotesData({selectedAdMedium: ""}));
    //dispatch(setQuotesData({currentPage: "adMedium"}))
  }, []);

  return (
    <div className='w-full h-full'>
        <div className='text-black '>
          {/* <div className="flex flex-row justify-between mx-[8%] bg-gray-100">

            <button  className="mr-8 mt-8 hover:scale-110 text-blue-500 font-semibold hover:animate-pulse border-blue-500 shadow-sm shadow-blue-500 border px-2 py-1 rounded-lg bg-white" onClick={() => {
              if(previousPage === "adMedium" || previousPage === "" ){
                routers.push('/');
                dispatch(resetClientData()); 
              }else{
                dispatch(setQuotesData({currentPage: previousPage}));
              }
            }}
            > 
          <FontAwesomeIcon icon={faArrowLeft} className=' text-md'/> Back </button>
          <button
            aria-label="cart"
            className="relative text-center shadow-sm bg-white mt-8 left-[2%] border border-blue-500 shadow-blue-500 rounded-full p-1"
            onClick={() => dispatch(setQuotesData({ currentPage: "checkout", previousPage: "adMedium" }))}
          >
            <StyledBadge badgeContent={cartItems.length} color="error">
              <ShoppingCartIcon className="text-blue-500 " />
            </StyledBadge>
          </button> */}
          
            {/* <button
              className="px-2 py-1 rounded text-center"
              onClick={() => {
                routers.push('/');
                dispatch(resetClientData());
                dispatch(resetQuotesData());              
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
              </button> */}
          {/* </div> */}
          {/* <br/> */}
          {/* <form className='bg-white rounded-t-2xl shadow-2xl pb-8 h-[100vh] overflow-y-auto max-h-[100vh] shadow-black'> */}
            {/* <br/> */}
          <h1 className='text-2xl font-bold text-center text-blue-500'>Select AD Medium</h1>

          <div className='mx-[8%] relative mt-4'>
          
          {/* <input
          className="w-full border border-purple-500 text-black p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-700 focus:ring focus:ring-purple-200"
        type="text"
        value={searchInput}
        onChange={handleSearchInputChange}
        placeholder="Search"
      /> */}
       <input
          className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:shadow-outline border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300 `}
          // className="p-2 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3 max-h-10"
          type="text"
          id="RateSearchInput"
          // name='RateSearchInput'
          placeholder="Ex: RateName Type"
          value={rateSearchTerm}
          onChange = {handleRateSearch}
          onFocus={(e) => {e.target.select()}}
        />
      {(ratesSearchSuggestion.length > 0 && rateSearchTerm !== "") && (
              <ul className="z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                {ratesSearchSuggestion.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleRateSelection}
                      value={name}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
      <div className="absolute top-0 right-0 mt-2 mr-3">
          <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
        </div></div>
            <ul className="mx-[8%] mb-8 justify-stretch mt-4">
              {searchedOptions.map((option,index) => (<>
                {option.rateName !== 'Newspaper' && (
                  <button
                    key={option.rateName}
                    className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
                    onClick={(event) => {
                      //setSelectedAdMedium(option.rateName);
                      event.preventDefault();
                      dispatch(setQuotesData({selectedAdMedium: option.rateName}));
                      dispatch(updateCurrentPage("adType"));
                      //Cookies.set('ratename', option.rateName);
                      //setShowAdTypePage(true);
                    }}
                  >
                    <div className='flex flex-row items-center mx-4 justify-start'>
                      {/* <div className='text-blue-500 text-xl font-bold'>•</div> */}
                    <div className='mb-2 h-10 w-10'>{icons(option.rateName)}</div>
                    {/* <FontAwesomeIcon icon={faBus} /> */}
                    <div className="text-lg font-medium mb-2 items-center ml-4"> {option.rateName}</div>
                    </div>
                    
                  </button>)}</>
              ))
            }
          </ul>
          {/* </form> */}
        </div>
        
    </div>
  );
};

export default AdMediumPage;