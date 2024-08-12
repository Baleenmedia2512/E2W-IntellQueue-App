'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { useRouter } from 'next/navigation';
//import { AdMediumPage } from './page';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { resetQuotesData, setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';

const AdTypePage = () => {
  const username = useAppSelector(state => state.authSlice.userName);
  const dispatch = useDispatch();
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage)
  // const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  // const companyName = 'Baleen Test'
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  // const [selectedAdType, setSelectedAdType] = useState(null);
  const [datas, setDatas] = useState([]);
  const routers = useRouter();
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

  //fetch all the valid rates at the loading of the page
  useEffect(() => {
    const fetchData = async () => {
      try {
  
        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
          const data = await response.json();
          setDatas(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
    dispatch(setQuotesData({selectedAdType: ""}));
  }, []);
  
  //filter using adMedium - also sorting and removing duplicates
  const filteredTypeofAd = datas
  .filter(item => item.rateName === adMedium)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.typeOfAd === value.typeOfAd) === index
  )
  .sort((a, b) => a.typeOfAd.localeCompare(b.typeOfAd))
  ;

  //search Filter for adType
  const searchedTypeofAd = filteredTypeofAd.filter((optionn) =>
    optionn.typeOfAd.toLowerCase().includes(searchInput.toLowerCase())
  );

  //to move to Ad Medium page
  // const moveToPreviousPage = () => {
  //   //To move to adMedium from AdType
  //     dispatch(resetQuotesData());
  //     dispatch(setQuotesData({currentPage: previousPage === "adType" ? "adMedium" : previousPage}));
  // }

  return (
    <div className=''>
      <div className='text-black'>
      {/* <div className="flex flex-row justify-between mx-[2%] bg-gray-100">
            <button 
              className="mr-8 mt-4 hover:scale-110 text-blue-500 hover:animate-pulse font-semibold border-blue-500 shadow-sm shadow-blue-500 border px-2 py-1 rounded-lg bg-white"
              onClick={() => {moveToPreviousPage()}}
            > 
              <FontAwesomeIcon icon={faArrowLeft} className=' text-md'/> Back
            </button>
             
            <h1 className='font-semibold mt-4 text-center self-center'>
            {adMedium}
          </h1>
          <button aria-label="cart" className='rounded-full mr-4 mt-4 p-1 bg-white border border-blue-500 shadow-blue-500 text-center shadow-md ' onClick={() => dispatch(setQuotesData({currentPage: "checkout", previousPage: "adType"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="error">
                  <ShoppingCartIcon className='text-blue-500' />
                </StyledBadge>
              </button> */}
          {/* <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
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
      {/* </div>
      <br />
      <form className='bg-white rounded-t-2xl shadow-2xl h-[100vh] overflow-y-auto max-h-[100vh] shadow-black'>
            <br/> */}
      <h1 className='text-2xl font-bold text-center text-blue-500 mb-4'>Select Ad Type</h1>
    
      <div className='mx-[8%] relative'>
        <input
          className="w-full border border-gray-500 text-black p-2 rounded-lg focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200"
          type="text"
          value={searchInput}
          onChange={handleSearchInputChange}
          placeholder="Search"
        />
      
        <div className="absolute top-0 right-0 mt-2 mr-3">
          <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
        </div>
      </div>

        <div className="flex flex-col mx-[8%] mt-4 justify-stretch">
        {searchedTypeofAd.map((optionss) => (
          <button
            key={optionss.typeOfAd}
            className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
            //className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-r from-gray-100 to-white border-l-4 border-l-blue-500 border-blue-500 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
            onClick={(event) => {
            {
              event.preventDefault()
              dispatch(setQuotesData({selectedAdType: optionss.typeOfAd}))
              dispatch(updateCurrentPage("adCategory"));
              // dispatch(setQuotesData({currentPage: "adCategory", previousPage: "adType"}))
          }}}
          >
            <div className='flex flex-row items-center mx-4 justify-start'>
                    {/* <div className='text-blue-500 text-xl font-bold'>•</div> */}
            <div className="text-lg font-medium mb-2 items-center ml-4">{optionss.typeOfAd !== "" ? optionss.typeOfAd : 'Others'}</div>
            </div>
          </button>
        ))}
        </div>
      {/* </form> */}
    </div>
  </div>
  )
}

export default AdTypePage;