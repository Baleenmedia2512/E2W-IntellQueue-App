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
    <div>
      <div className='text-black'>
        <div className="flex flex-row justify-between mx-[2%] mt-4">
          <>
            
              <button 
               className="mr-8 hover:scale-110 text-blue-500 hover:animate-pulse font-semibold border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg "
              onClick={() => {moveToPreviousPage()}}
              > 
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md'/> Back 
              </button>
              <h1 className='font-semibold mt-2'> 
              {adMedium} {greater} {adType}
            </h1>
            <IconButton aria-label="cart" className='rounded-none text-center shadow-md' onClick={() => dispatch(setQuotesData({currentPage: "checkout"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </IconButton>
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
          </>
        </div>
        {/* <div className="flex flex-row justify-center mx-[8%] mt-8">
        <h1 className='font-semibold'> 
              {adMedium} {greater} {adType}
            </h1>
            </div> */}
        {/* <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1> */}
        <br />
        <h1 className='text-2xl font-bold text-center  mb-4'>Select Ad Category</h1>
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
          </div>
        </div>
        <div>
          {/* Show page based on Ad Type selection. If adType selected move to adCategory Page*/}
                
          {/* Check if page has single value. If single value move to adCategory*/}
          <ul className="flex flex-col items-center mx-[8%]">
              {searchedAdType.filter(item => item.typeOfAd === adType).map((option) => (
                <label
                  key={option.adType}
                  className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
                  onClick={() => {
                    dispatch(setQuotesData({selectedAdCategory: option.adType, currentPage: "edition"}))
                  }}
                >
                  <div className="text-lg font-bold flex items-center justify-center">{option.adType}</div>
                </label>
              ))}
          </ul>
        </div>
      
      </div>
      </div>
  )
};

export default AdCategoryPage;