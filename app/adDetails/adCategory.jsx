'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
//import { AdMediumPage } from './page';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';

const AdCategoryPage = () => {
  const username = useAppSelector(state => state.authSlice.userName);
  const dispatch = useDispatch();
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
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
  }, []);
  
  //filter using adMedium - also sorting and removing duplicates
  const filteredAdType = datas
  .filter(item => item.rateName === adMedium)
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adType === value.adType) === index
  )
  .sort((a, b) => a.adType.localeCompare(b.adType))
  ;

  //search Filter for adType
  const searchedAdType = filteredAdType.filter((optionn) =>
    optionn.adType.toLowerCase().includes(searchInput.toLowerCase())
  );

  //to move to Ad Medium page
  const moveToPreviousPage = () => {
      //To move to adType from adCategory
      dispatch(setQuotesData({selectedAdCategory: "", currentPage: "adType"}));
    }

const greater = '>>'
  return (
    <div className='bg-gray-100'>
      <div className='text-black bg-gray-100'>
        <div className="flex flex-row justify-between mx-[2%] bg-gray-100">
            
              <button 
               className="mr-8 hover:scale-110 text-blue-500 mt-4 hover:animate-pulse font-semibold border-blue-500 shadow-sm shadow-blue-500 border px-2 py-1  ml-2 rounded-lg "
              onClick={() => {moveToPreviousPage()}}
              > 
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md'/> Back 
              </button>
              <h1 className='font-semibold mt-6'> 
              {adMedium} {greater} {adType}
            </h1>
            <button aria-label="cart" className='rounded-full p-2 mt-4 text-center mr-2 shadow-sm border border-blue-500 shadow-blue-500' onClick={() => dispatch(setQuotesData({currentPage: "checkout"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </button>
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
        </div>
        {/* <div className="flex flex-row justify-center mx-[8%] mt-8">
        <h1 className='font-semibold'> 
              {adMedium} {greater} {adType}
            </h1>
            </div> */}
        {/* <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1> */}
        <br />
      <form className='bg-white rounded-t-2xl shadow-2xl h-[100vh] overflow-y-auto max-h-[100vh] shadow-black'>
            <br/>
        <h1 className='text-2xl font-bold text-center  mb-4'>Select Ad Category</h1>
        <div className='mx-[8%] relative'>
          <input
            className="w-full border border-gray-500 text-black p-2 rounded-lg mb-4 focus:outline-none focus:border-gray-700 focus:ring focus:ring-gray-200"
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search"
          />
          <div className="absolute top-0 right-0 mt-2 mr-3">
            <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
          </div>
        </div>
        <div>
          {/* Show page based on Ad Type selection. If adType selected move to adCategory Page*/}
                
          {/* Check if page has single value. If single value move to adCategory*/}
          <ul className="flex flex-col items-center mx-[8%]">
              {searchedAdType.filter(item => item.typeOfAd === adType).map((option) => (
                <button
                  key={option.adType}
                  className={`slide-in relative text-black items-center flex flex-row h-16 justify-start w-full bg-gradient-to-r from-gray-100 to-white border-l-8 border-l-blue-500 border-blue-500 shadow-md mt-2 border cursor-pointer transition duration-300 rounded-md hover:bg-gray-500 hover:opacity-15`}
                  onClick={() => {
                    dispatch(setQuotesData({selectedAdCategory: option.adType, currentPage: "edition"}))
                  }}
                >
                  <div className='flex flex-row items-center mx-4 justify-start'>
                    <div className='text-blue-500 text-xl font-bold'>•</div>
                  <div className="text-xl ml-4 font-bold items-center">{option.adType}</div>
                  </div>
                </button>
              ))}
          </ul>
        </div>
      </form>
      </div>
      </div>
  )
};

export default AdCategoryPage;