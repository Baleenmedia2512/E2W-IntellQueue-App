'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdTypePage from './adType';
import { useDispatch } from 'react-redux';
import AdMediumPage from './adMedium';
import { resetClientData } from '@/redux/features/client-slice';
import { setQuotesData, addValidRates, resetQuotesData } from '@/redux/features/quote-slice';
import { useAppSelector } from '@/redux/store';
import RatesListPage from '../rate-validation/page';

export const AdDetails = () => {
  const dispatch = useDispatch();
  //const [selectedAdMedium, setSelectedAdMedium] = useState('');
  const [datas, setDatas] = useState([]);
  const [showAdTypePage, setShowAdTypePage] = useState(false);
  const routers = useRouter();

  const [searchInput, setSearchInput] = useState('');
  const username = useAppSelector(state => state.authSlice.userName);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const currentPage = useAppSelector(state => state.quoteSlice.currentPage);
  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  // const handleOptionChange = (option) => {
  //   //setSelectedOption(option);
  //   setSelectedOption((prevSelectedOption) => 
  //   prevSelectedOption === option ? null : option
  // );
  // };

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

  useEffect(() => {

    const fetchData = async () => {
      try {
        if (adMedium) {
          setShowAdTypePage(true)
        }
        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php');
          const data = await response.json();
          dispatch(addValidRates(data));
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
    dispatch(setQuotesData({currentPage: "adMedium"}))
  }, []);

  return (
    <div>
      <AdMediumPage/>
    </div>
  );
};

export default AdDetails;
