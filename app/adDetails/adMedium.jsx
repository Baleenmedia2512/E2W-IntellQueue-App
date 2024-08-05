'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { resetClientData } from '@/redux/features/client-slice';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import { useAppSelector } from '@/redux/store';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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
      return (<Image src="/images/school-bus.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Newspaper') {
      return (<Image src="/images/newspaper.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Print Services') {
      return (<Image src="/images/printer.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Production') {
      return (<Image src="/images/smart-tv.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Radio Ads') {
      return (<Image src="/images/radio.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Road Side') {
      return (<Image src="/images/road-map.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Screen Branding') {
      return (<Image src="/images/branding.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Test') {
      return (<Image src="/images/test.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'TV') {
      return (<Image src="/images/tv-monitor.png" alt="car Icon" width={60} height={60} />);
    }
  }

  const handleRateSearch = async(e) =>{
    setRateSearchTerm(e.target.value);
    const searchSuggestions = await FetchRateSeachTerm(companyName, e.target.value);
    setRatesSearchSuggestion(searchSuggestions);
  }

  const fetchRate = async() => {
    try {
      const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchGivenRate.php/?JsonDBName=${companyName}&JsonRateId=${rateId}`);
      if(!response.ok){
        throw new Error(`HTTP error! Error In fetching Rates: ${response.status}`);
      }
      const data = await response.json();
      const firstData = data[0];
      dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedEdition: firstData.Location, selectedPosition: firstData.Package, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, ratePerUnit: firstData.ratePerUnit, minimumUnit: firstData.minimumUnit, unit: firstData.Unit, quantity: firstData.minimumUnit, isDetails: true}))
      console.log(data)
    } catch (error) {
      console.error("Error while fetching rates: " + error)
    }
  }

  const handleRateSelection = (e) => {
    const selectedRate = e.target.value;
    const selectedRateId = selectedRate.split('-')[0];
    setRatesSearchSuggestion([]);
    setRateSearchTerm(selectedRate);

    fetchRate();
    dispatch(setQuotesData({currentPage: "adDetails", rateId: selectedRateId}))
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
    
    //dispatch(setQuotesData({currentPage: "adMedium"}))
  }, []);

  return (
    <div>
        <div className='text-black'>
          <div className="flex flex-row justify-between mx-[8%] mt-8">

            <> 
            <button  className="mr-8 hover:scale-110 text-blue-500 font-semibold hover:animate-pulse border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg " onClick={() => {
              routers.push('/');
              dispatch(resetClientData()); }}
            > 
          <FontAwesomeIcon icon={faArrowLeft} className=' text-md'/> Back </button>
          <IconButton aria-label="cart" className='rounded-none text-center shadow-md left-[2%]' onClick={() => dispatch(setQuotesData({currentPage: "checkout"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </IconButton>
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
              </button> */}</>
          </div>
          <br/>
          <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Medium</h1>
          <div className='mx-[8%] relative'>
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
      {ratesSearchSuggestion && (
              <ul className="z-10 mt-1 w-full  bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
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
          <FontAwesomeIcon icon={faSearch} className="text-purple-500" />
        </div></div>
          <ul className="mx-[8%] mb-8 justify-stretch grid gap-1 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
            {searchedOptions.map((option,index) => (<>
              {option.rateName !== 'Newspaper' && (
                <label
                  key={option.rateName}
                  className={`relative flex flex-col items-center justify-center px-[-10] hover:text-white w-full h-64 border cursor-pointer transition duration-300 rounded-lg hover:bg-purple-500 ${(index)%4==0 || (index)%4==1 ? ' bg-blue-300' : ' bg-gray-500 '
                    }`}
                  onClick={() => {
                    //setSelectedAdMedium(option.rateName);
                    dispatch(setQuotesData({selectedAdMedium: option.rateName, currentPage: "adType"}))
                    //Cookies.set('ratename', option.rateName);
                    //setShowAdTypePage(true);
                  }}
                >
                  <div className="text-lg font-bold mb-2 text-black flex items-center justify-center">{option.rateName}</div>
                  <div className='mb-2 flex items-center justify-center'>{icons(option.rateName)}</div>
                </label>)}</>
            ))
            }
          </ul>
        </div>
    </div>
  );
};

export default AdMediumPage;