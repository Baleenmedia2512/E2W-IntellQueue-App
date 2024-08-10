'use client'
import {useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdTypePage from './adType';
import AdMediumPage from './adMedium';
import { useAppSelector } from '@/redux/store';
import AdCategoryPage from './adCategory';
import EditionPage from './Edition';
import RemarksPage from './Remarks';
import AdDetailsPage from './ad-Details';
import CheckoutPage from './checkout';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { goBack, resetQuotesData, setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';
import { useDispatch } from 'react-redux';
import { resetClientData } from '@/redux/features/client-slice';

export const AdDetails = () => {
  const routers = useRouter();
  const dispatch = useDispatch();
  const username = useAppSelector(state => state.authSlice.userName);
  const currentPage = useAppSelector(state => state.quoteSlice.currentPage);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const rateId = useAppSelector(state => state.quoteSlice.rateId);
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition);
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  //const previousPage = useAppSelector(state => state.quoteSlice.previousPage)

  useEffect(() => {
      if (!username) {
        routers.push('/login');
      }
  }, []);

  function showCurrentPage(){
    let showPage = '' 
    if(currentPage === "adType"){
      showPage = <AdTypePage />
    } else if(currentPage === "adCategory" ){
      showPage = <AdCategoryPage />
    } else if(currentPage === "edition"){
      showPage = <EditionPage />
    } else if(currentPage === "remarks"){
      showPage = <RemarksPage />
    } else if(currentPage === "adDetails"){
      showPage = <AdDetailsPage />
    } else if(currentPage === "checkout"){
      showPage = <CheckoutPage />
    } else{
      showPage = <AdMediumPage />
    }
    return showPage;
  }
  
  const greater = ">>";

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  return (
    <div className='bg-gray-100 w-full h-full'>
      <div className='text-black'>
        
        <div className="flex flex-row justify-between mx-[8%] bg-gray-100">
  
          {/* Back Button */}
          <button className="mr-4 mt-8 hover:scale-110 text-blue-500 text-nowrap max-h-10 font-semibold hover:animate-pulse border-blue-500 shadow-sm shadow-blue-500 border px-2 py-1 rounded-lg bg-white" onClick={() => {
              dispatch(goBack());
          }}>
            <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
          </button>
          {currentPage === "checkout" ?( 
            <h1 className='text-2xl mt-6 font-bold text-center mb-4'>Cart</h1>
          ): (
          <div className='mt-8'>
            <div className='flex flex-row items-center'>
              <h2 className='font-semibold mb-1 text-gray-800 text-[15px] mx-2'>{adMedium}
              {adType !== "" && greater} {adType}
              {adCategory !== "" && greater} {adCategory} {edition !==  "" && greater} {edition} {position !== "" && greater} {position}
              {rateId !== 0 && greater} {rateId !== 0 && rateId}</h2>
            </div>
          </div>
          )}
          {/* Shopping Cart Button */}
          {currentPage === "checkout" ?(
            <button className='border px-2 py-1 h-fit mt-6 max-h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-200 hover:text-black hover:animate-pulse' onClick={() => dispatch(resetCartItem())}>Clear All</button>
          ):(
            <button aria-label="cart" 
            className="relative text-center shadow-sm max-h-10  bg-white mt-8 border border-blue-500 shadow-blue-500 rounded-full p-2"
            onClick={() => dispatch(updateCurrentPage("checkout"))}>
              <StyledBadge badgeContent={cartItems.length} color="primary">
                <ShoppingCartIcon className='text-black' />
              </StyledBadge>
            </button>
          )
          }
        </div>
        <br />
  
        {/* Form and Current Page Content */}
        <form className='bg-white rounded-t-3xl shadow-2xl pb-8 h-[100vh] overflow-y-auto max-h-[100vh] mx-2 shadow-black'>
          <br />
          {showCurrentPage()}
        </form>
      </div>
    </div>
  );
};

export default AdDetails;