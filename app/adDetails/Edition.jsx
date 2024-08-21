'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { resetQuotesData, setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';
import { FetchRateSeachTerm } from '../api/FetchAPI';

const EditionPage = () => {
  const dispatch = useDispatch();
  const username = useAppSelector(state => state.authSlice.userName);
  const [datas, setDatas] = useState([]);
  const [rateSearchTerm,setRateSearchTerm] = useState("");
  const [ratesSearchSuggestion, setRatesSearchSuggestion] = useState([]);
  const routers = useRouter();
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage)
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const companyName = 'Baleen Test'
  const cartItems = useAppSelector(state => state.cartSlice.cart);

  // const companyName = useAppSelector(state => state.authSlice.companyName);

  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  //Choose data based on AdCategory - also sorting and removing duplicates
  const filteredData = datas
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  //Splitting the Edition and Position using :
  const splitNames = filteredData.map(item => {
    const [firstPart, secondPart] = item.adCategory.split(':');
    // const updatedFirstPart = (secondPart === undefined? adType : firstPart);
    return { ...item, Edition: firstPart.trim() , Position: secondPart || ''};
  });

  //Filter Edition using Filters - also removing duplicates
  const filteredEdition = splitNames
  .filter((value, index, self) => 
    self.findIndex(obj => obj.Edition === value.Edition) === index
  );

  //search filter for Edition
  const searchedEdition = filteredEdition.filter((option) =>
    option.Edition.toLowerCase().includes(searchInput.toLowerCase())
  );

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
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
          const data = await response.json();
          const filData = data.filter(item => item.adType === adCategory && item.rateName === adMedium);
          setDatas(filData);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
    dispatch(setQuotesData({selectedEdition: "", rateId: 0}));
  }, []);

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

  const greater = ">>"
  return (
    <div className=''>
      <div className='text-black'>
      {/* <div className="flex flex-row justify-between mx-[2%] bg-gray-100"> */}
        {/* <div className='flex flex-row'>
         
            <button 
               className="mr-8 hover:scale-110 mt-4 max-h-10 text-blue-500 hover:animate-pulse font-semibold border-blue-500 shadow-sm shadow-blue-500 border px-2 py-1 rounded-lg "
              onClick={() => {
              console.log(previousPage)
              dispatch(setQuotesData({adCategory: "", currentPage: (previousPage === "edition" ? "adCategory" : previousPage)}))
              }}
            > 
              <FontAwesomeIcon 
                icon={faArrowLeft}
              /> Back 
            </button>
             
          </div>
          <h1 className='font-semibold mt-6 text-wrap'>
            {adMedium} {greater} {adType} {greater} {adCategory}
          </h1> 
          <div >
          <button aria-label="cart" className='rounded-full mt-4 max-h-10 text-center shadow-sm shadow-blue-500 border border-blue-500 p-2' onClick={() => dispatch(setQuotesData({currentPage: "checkout", previousPage: "edition"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </button>
              </div> */}
          {/* <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
              dispatch(resetQuotesData());        
              routers.push('/adDetails');
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
      {/* <h1 className='mx-[8%] font-semibold mb-8'>Select any one</h1> */}
      {/* <br/>
      <form className='bg-white rounded-t-2xl shadow-2xl h-[100vh] overflow-y-auto max-h-[100vh] shadow-black'>
            <br/> */}
      <h1 className='text-2xl font-bold text-center text-blue-500 mb-4'>Select Edition</h1>
      {/* <h1 className='mx-[8%] mb-2 font-semibold'>Ad Type : {adType}</h1> */}
      <div className='mx-[8%] relative'>
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
        </div>
      </div>
      
      <div>
        {/* Check whether the edition is chosen. If chosen move to Position page*/}
        <ul className="flex flex-col mx-[8%]">
          {searchedEdition.map((option) => (
            <button
              key={option.Edition}
              className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
              //className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-r from-gray-100 to-white border-l-4 border-l-blue-500 border-blue-500 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
              onClick={(event)=> {
                event.preventDefault()
                const filteredPositions = searchedPosition.filter(item => item.Edition === option.Edition);
                if(filteredPositions.length > 0){
                  dispatch(setQuotesData({selectedEdition: option.Edition})) 
                  dispatch(updateCurrentPage("remarks"));
                  }else{
                dispatch(setQuotesData({selectedEdition: option.Edition, ratePerUnit: option.ratePerUnit, minimumUnit: option.minimumUnit, unit: option.Unit, rateId: option.rateId, validityDate: option.ValidityDate, selectedVendor: option.VendorName}))
                dispatch(updateCurrentPage("adDetails"));
                  }
            }}
            >
              {/* <div className="text-lg font-bold mt-8">{(option.adCategory.includes(":"))?(option.Edition):(categories.adType)}</div> */}
              <div className='flex flex-row items-center mx-4 justify-start'>
                    {/* <div className='text-blue-500 text-xl font-bold'>•</div> */}
              <div className="text-lg font-medium items-center text-wrap text-center ml-4 justify-center">{option.Edition === "" ? 'Skip' : option.Edition.split('|').join(' | ').split(",").join(", ")}</div>
              </div>
            </button>
          ))}
        </ul> 
      </div>
      {/* </form> */}
    </div>
  </div>
  )
};

export default EditionPage;