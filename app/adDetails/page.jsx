'use client'
import {useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdTypePage from './adType';
import AdMediumPage from './adMedium';
import { useAppSelector } from '@/redux/store';
import AdCategoryPage from './adCategory';
import EditionPage from './Edition';
import RemarksPage from './Remarks';
// import { useDispatch } from 'react-redux';
// import { setQuotesData } from '@/redux/features/quote-slice';

export const AdDetails = () => {
  //const [selectedAdMedium, setSelectedAdMedium] = useState('');
  const routers = useRouter();
  // const dispatch = useDispatch
  const username = useAppSelector(state => state.authSlice.userName);
  const currentPage = useAppSelector(state => state.quoteSlice.currentPage);
  // const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);

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
    } else {
      showPage = <AdMediumPage />
    }
    return showPage;
  }
  
  return (
    <div>
      {showCurrentPage()}
    </div>
  );
};

export default AdDetails;
