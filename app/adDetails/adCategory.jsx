'use client'
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';
import AdDetailsPage from './ad-Details';
import AdTypePage from './adType';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';

const AdCategoryPage = () => {
  const dispatch = useDispatch();
  const username = useAppSelector(state => state.authSlice.userName);
  const [selectedAdCategory, setSelectedAdCategory] = useState(null);
  const [datas, setDatas] = useState([]);
  const [showAdDetailsPage, setShowAdDetailsPage] = useState(false);
  const routers = useRouter();
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const selectedAdType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition);
  // const typeOfAd = Cookies.get('typeofad');
  // const adType = Cookies.get('adtype')
  const [showAdTypePage, setShowAdTypePage] = useState(false)
  const [selectedEdition, setSelectedEdition] = useState(null)

  const [searchInput, setSearchInput] = useState('');

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  //Choose data based on AdCategory - also sorting and removing duplicates
  const filteredData = datas
  .filter((value, index, self) => 
    self.findIndex(obj => obj.adCategory === value.adCategory) === index
  )
  .sort((a, b) => a.adCategory.localeCompare(b.adCategory))
  ;

  //Splitting the Edition and Position using :
  const splitNames = filteredData.map(item => {
    console.log(item.adCategory)
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

  //search filter for Position 
  const searchedPosition = splitNames.filter((option) =>
    option.Position.toLowerCase().includes(searchInput.toLowerCase())
  );

  //fetch rates 
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // if (selectedAdCategory) {
        //   setShowAdDetailsPage(Cookies.get('vendo'));
        // }

        //if edition and position is chosen move to ad-details page
        if (edition) {
          setShowAdDetailsPage(true)
        } 

        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php');
          const data = await response.json();
          const filData = data.filter(item => item.adType === selectedAdType && item.rateName === adMedium);
          setDatas(filData);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, []);
  

  // useEffect(() => {
  //     if (!selectedEdition && filteredEdition.length === 1) {
  //       setSelectedEdition(filteredEdition[0]);
  //     }
  //   },[filteredEdition] );


  useEffect(() => {

      //to move to position page from adDetails
      if(Cookies.get('edition')){
        const selected = JSON.parse(Cookies.get('edition'))
        if(splitNames.filter(item => item.Edition === selected.Edition).length>1){
          setSelectedEdition(selected);
          dispatch(setQuotesData({selectedEdition: selected}))
        }
      }

      // if(Cookies.get('back1')){
      //   console.log(filteredEdition.length)
      //   if(filteredEdition.length === 1 && splitNames.filter(item => item.Edition === selectedEdition.Edition).length <=1){
      //       setShowAdTypePage(true);
      //       setShowAdDetailsPage(true);
      //     }
      //   Cookies.remove('back1')
      // }
  },[splitNames])

  const greater = ">>"
  return (
    <div>
      {showAdTypePage && (<AdTypePage />)}
      {(!showAdDetailsPage && showAdTypePage === false) && (<div className='text-black'>
      <div className="flex flex-row justify-between mx-[8%] mt-8">
        <>
      
    <h1 className='font-semibold'><button className='  hover:scale-110 hover:text-orange-900 mr-8' 
    onClick={() => {
    //  if(!selectedEdition || filteredEdition.length === 1){
      dispatch(resetQuotesData())
      // Cookies.remove('adtype'); 
      // Cookies.remove('edition')
      // Cookies.remove('adcategory');
      setShowAdTypePage(true);
      Cookies.set('backfromcategory',true);
    // }else{
    //   setSelectedEdition(null)
    //   dispatch(setQuotesData({selectedEdition: ""}))
    //   Cookies.remove('edition')
    // }
  }
    }> <FontAwesomeIcon icon={faArrowLeft} onSelect={() => {setQuotesData({selectedAdCategory: "", selectedAdType: ""}); setShowAdTypePage(true)}}/> </button>
    {adMedium} {!(selectedAdType === adCategory) ? greater : ''} {!(selectedAdType === adCategory) ? selectedAdType : ''} {greater} {selectedAdType} {selectedEdition ? greater : ''} {selectedEdition ? selectedEdition.Edition : ''}</h1>

        
    <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
              Cookies.remove('adtype'); 
      Cookies.remove('edition')
      Cookies.remove('adcategory');
      Cookies.remove('rateperunit')
      Cookies.remove('minimumunit');
      Cookies.remove('defunit');
      Cookies.remove('rateId');
      Cookies.remove('validitydate');
              routers.push('../addenquiry');
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
          </button></>
      </div>
      {/* <h1 className='mx-[8%] font-semibold mb-8'>Select any one</h1> */}
      <br />
<h1 className='text-2xl font-bold text-center  mb-4'>Select {!selectedEdition ? "Edition": "Package"}</h1>
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
        </div></div>
<div>{!selectedEdition ?
      {/* Check whether the edition is chosen. If chosen move to Position page*/}
      (
      <ul className="flex flex-col mx-[8%]">
        {searchedEdition.map((option) => (
          <label
            key={option.Edition}
            className='flex flex-col items-center justify-center w-full min-h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={()=> {setSelectedEdition(option);
              dispatch(setQuotesData({selectedEdition: option.Edition}))
            Cookies.set('edition',JSON.stringify(option));
          }}
          >
            {/* <div className="text-lg font-bold mt-8">{(option.adCategory.includes(":"))?(option.Edition):(categories.adType)}</div> */}
            <div className="text-lg font-bold items-center text-wrap text-center justify-center">{option.Edition === "" ? 'Skip' : option.Edition.split('|').join(' | ').split(",").join(", ")}</div>
            
          </label>
        ))}
      </ul>): 
      {/* check if only one item is available, if only one move to ad-details page*/}
      (splitNames.filter(item => item.Edition === selectedEdition.Edition).length>1) ?
      (
       <ul className="flex flex-col flex-wrap items-center list-disc list-inside mx-[8%]">
              {searchedPosition.filter(item => item.Edition === selectedEdition.Edition).map((options) => (
          <label
            key={options.adCategory}
            className='flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 '
            onClick={() => {
              //options contain Edition:Position values
              //the edition position is saved in adCategory Cookie
              setSelectedAdCategory(options);
              //Cookies.set('adMediumSelected', true);
              //Cookies.set('ratename', options.rateName);
              //Cookies.set('adtype', options.adType);
              //Cookies.set('typeofad', options.typeOfAd);
              //Cookies.set('adcategory', options.adCategory);
              dispatch(setQuotesData({selectedAdCategory: options.adCategory}))
              dispatch(setQuotesData({selectedEdition: options.Edition}))
              Cookies.set('rateperunit', options.ratePerUnit)
              Cookies.set('minimumunit', options.minimumUnit);
              Cookies.set('defunit', options.Units);
              Cookies.set('rateId', options.rateId)
              Cookies.set('validitydate', options.ValidityDate);
              Cookies.remove('isAdDetails');
              setShowAdDetailsPage(true)
            }}
          >
            <div className="text-sm font-bold items-center justify-center text-wrap flex-wrap whitespace-pre-wrap">{options.Position === "" ? 'Skip' : options.Position}</div>
</label>))
              }
            </ul> 
            ):(
            setShowAdDetailsPage(true),
            // Cookies.set('adcategory', selectedEdition.adCategory),
            // Cookies.set('typeofad', selectedEdition.typeOfAd),
              dispatch(setQuotesData({selectedAdCategory: selectedEdition.adCategory})),
              dispatch(setQuotesData({selectedEdition: selectedEdition.Edition})),
              console.log(selectedEdition.Edition),
              Cookies.set('rateperunit', selectedEdition.ratePerUnit),
              Cookies.set('minimumunit', selectedEdition.minimumUnit),
              Cookies.set('defunit', selectedEdition.Units),
              Cookies.set('rateId', selectedEdition.rateId),
              Cookies.set('validitydate', selectedEdition.ValidityDate)
            )
            }
            </div>
      
      </div>)}
      {/* {showAdDetailsPage && <VendorPage details ={selectedAdCategory}/>} */}
      {showAdDetailsPage && <AdDetailsPage />}

      </div>
  )
};

export default AdCategoryPage;