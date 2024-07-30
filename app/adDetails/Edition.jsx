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
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import { resetClientData } from '@/redux/features/client-slice';

const EditionPage = () => {
  const dispatch = useDispatch();
  const username = useAppSelector(state => state.authSlice.userName);
  const [datas, setDatas] = useState([]);
  const routers = useRouter();
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
  }, []);

  const greater = ">>"
  return (
    <div>
      <div className='text-black'>
      <div className="flex flex-row justify-between mx-[2%] mt-4">
        <div className='flex flex-row'>
         
            <button 
               className="mr-8 hover:scale-110 text-blue-500 hover:animate-pulse font-semibold border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg "
              onClick={() => {
              dispatch(setQuotesData({adCategory: "", currentPage: "adCategory"}))
              }}
            > 
              <FontAwesomeIcon 
                icon={faArrowLeft}
              /> Back 
            </button>
            <h1 className='font-semibold mt-2 text-wrap'>
            {adMedium} {greater} {adType} {greater} {adCategory}
          </h1>  
          </div>
          <div >
          <IconButton aria-label="cart" className='rounded-none text-center shadow-md' onClick={() => dispatch(setQuotesData({currentPage: "checkout"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </IconButton>
              </div>
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
        
      </div>
      {/* <h1 className='mx-[8%] font-semibold mb-8'>Select any one</h1> */}
      <br />
      <h1 className='text-2xl font-bold text-center  mb-4'>Select Edition</h1>
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
        </div>
      </div>
      <div>
        {/* Check whether the edition is chosen. If chosen move to Position page*/}
        <ul className="flex flex-col mx-[8%]">
          {searchedEdition.map((option) => (
            <label
              key={option.Edition}
              className='flex flex-col items-center justify-center w-full min-h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
              onClick={()=> {
                const filteredPositions = searchedPosition.filter(item => item.Edition === option.Edition);
                filteredPositions.length > 0 ?
                dispatch(setQuotesData({selectedEdition: option.Edition, currentPage: "remarks"})) :
                dispatch(setQuotesData({selectedEdition: option.Edition, ratePerUnit: option.ratePerUnit, minimumUnit: option.minimumUnit, unit: option.Unit, rateId: option.rateId, validityDate: option.ValidityDate, selectedVendor: option.VendorName, currentPage: "adDetails"}))
            }}
            >
              {/* <div className="text-lg font-bold mt-8">{(option.adCategory.includes(":"))?(option.Edition):(categories.adType)}</div> */}
              <div className="text-lg font-bold items-center text-wrap text-center justify-center">{option.Edition === "" ? 'Skip' : option.Edition.split('|').join(' | ').split(",").join(", ")}</div>
              
            </label>
          ))}
        </ul> 
      </div>
    </div>
  </div>
  )
};

export default EditionPage;