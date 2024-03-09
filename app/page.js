'use client';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// import Snackbar from '@mui/material/Snackbar';
// import MuiAlert from '@mui/material/Alert'
// pages/_app.js or a specific component

const today = new Date();
const twoDaysFromNow = new Date();
twoDaysFromNow.setDate(today.getDate() + 2);
var intRegex = /^\d+$/;

const PAGE_SIZE = 10;
const NEIGHBOR_PAGES = 1;

const RatesListPage = () => {
  const [ratesData, setRatesData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [showInputError, setShowInputError] = useState(false);
  const [validityDays, setValidityDays] = useState();
  const [showFilter , setShowFilter] = useState(false);
  const [visible, setVisible] =useState(false);
  const [filters, setFilters] = useState({
    rateName: [],
    adType: [],
    adCategory: [],
    edition: [],
    remarks: [],
    VendorName: [],
    ValidityDate: ''
  });
  // const [toast, setToast] = useState(false);
  //const [severity, setSeverity] = useState('');
  // const [toastMessage, setToastMessage] = useState('');

  const router = useRouter();

  // const showToastMessage = (severityStatus, toastMessageContent) => {
  //   setSeverity(severityStatus)
  //   setToastMessage(toastMessageContent)
  //   setToast(true)
  // }

  // Filtered rates based on selected options
  const filteredRates = ratesData.filter((item) => {
    return (
      (filters.rateName.length === 0 || filters.rateName.includes(item.rateName)) &&
      (filters.adType.length === 0 || filters.adType.includes(item.adType)) &&
      (filters.adCategory.length === 0 || filters.adCategory.includes(item.adCategory)) &&
      (filters.VendorName.length === 0 || filters.VendorName.includes(item.VendorName)) 
      //&&(filters.LastUsedUser === '' || item.LastUsedUser === filters.LastUsedUser)
    );
  });

  const createSelectOptions = (data) => {
    return data
    .filter((item) => item)  // Filter out undefined or null values
    .sort((a, b) => a.localeCompare(b))
    .map((item) => ({
      value: item,
      label: item
    }));
  };

  const handleSelectChange = (selectedOption, filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: selectedOption.map((option) => option.label)
    }));
  };

  const fetchRates = async () => {
    const storedETag = localStorage.getItem('ratesETag');
    const headers = {};
    
    if (storedETag) {
      headers['If-None-Match'] = storedETag;
    }
  
    try {
      const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php', {
        headers,
      });
  
      if (res.status === 304) {
        // No changes since last request, use cached data
        const cachedRates = JSON.parse(localStorage.getItem('cachedRates'));
        setRatesData(cachedRates);
        return;
      }
  
      const newETag = res.headers.get('ETag');
      localStorage.setItem('ratesETag', newETag);
  
      const data = await res.json();
      setRatesData(data);
  
      // Cache the new rates data
      localStorage.setItem('cachedRates', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };
  

  // const fetchRates = async () => {
  //   const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php', {
  //     next: { revalidate: 10 },
  //   });
  //   const data = await res.json();
  //   setRatesData(data);
  // };

  useEffect(() => {
     // Check if localStorage contains a username
     const username = Cookies.get('username');
     // If no username is found, redirect to the login page
     if (!username) {
       router.push('/login');
     } else{
      fetchRates();
    }
  }, []);

  const handleCheckboxChange = (item) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(item)) {
        // Deselect if already selected
        return prevSelected.filter((selectedItem) => selectedItem !== item);
      } else {
        // Select if not selected
        return [...prevSelected, item];
      }
    });
  };

  const handleSelectAllClick = () => {
    // Select all items
    if (selectedItems.length === filteredRates.length) {
      setSelectedItems([]);
    } else {
      const allItems = filteredRates.map((item) => item);
      setSelectedItems(allItems);
    }
  };

  const handleFilter = () => {
    setShowFilter((showFilter) => !showFilter
    );
  };

  // const handleFilter2 = () => {
  //   setShowFilter2((showFilter2) => !showFilter2);
  // };

  const updateRateValidation = async () => {
    if (!intRegex.test(validityDays)) {
      setShowInputError(true);
    } else {
      setModal(false);
      const validityDate = addDaysToDate(validityDays); // Parse as an integer
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateRates.php/?JsonUserName=Siva&
        JsonRateId=${selectedItems.map(item => item.rateId)}&JsonValidity=${validityDate}`)
        const data = await response.json();
        setVisible(true);
        if (data.success === true) {
          alert(data.message)
          setValidityDays()
          fetchRates()
          //setMessage(data.message);
        } else {
          alert(`The following error occurred while inserting data: ${data}`);
          //setMessage("The following error occurred while inserting data: " + data);
          // Update ratesData and filteredRates locally
        
        }
      } catch (error) {
        console.error('Error updating rate:', error);
      }
    }
    if(setSelectedItems.length === 1){
      setSelectedItems([])
    }
  };


  function addDaysToDate(days) {
    const today = new Date();
    const futureDate = new Date(new Date(today).setDate(today.getDate()+ parseInt(days)));
    //Formatted Date
    const formattedDate = futureDate.toISOString().split('T')[0];
    return formattedDate;
  }

  const toggleModal = () => {
    setModal((prevState) => !prevState);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredRates.length / PAGE_SIZE);
  const paginatedRates = filteredRates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const generatePageNumbers = () => {
    const pageNumbers = [];

    // Always show the first page number
    pageNumbers.push(1);

    // Calculate start and end page numbers based on current page
    let startPage = Math.max(2, currentPage - NEIGHBOR_PAGES);
    let endPage = Math.min(totalPages - 1, currentPage + NEIGHBOR_PAGES);

    // Add ellipsis if there are hidden pages before the first page number
    if (startPage > 2) {
      pageNumbers.push('...');
    }

    // Generate page numbers within the range
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis if there are hidden pages after the last page number
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }

    if(totalPages !== 1){
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="container mx-auto p-4">
      {modal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center modal">
          <div onClick={toggleModal} className="fixed top-0 left-0 right-0 bottom-0 bg-gray-800 opacity-75 overlay"></div>
          <div className="absolute top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 line-clamp-4 bg-gradient-to-r from-gray-200 to-gray-300 p-4 rounded-lg w-auto min-w-80 z-50 modal-content">
            <h3 className="text-xl font-semibold">Enter the validity in Days</h3>
            <input
              className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:border-blue-500 my-4"
              type='number'
              defaultValue={validityDays}
              onChange={e => setValidityDays(e.target.value)}
              placeholder="Ex: 5"
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded mx-4" onClick={() => { updateRateValidation() }}>Submit</button>
            {showInputError && (<p className="error-message">Please enter a valid Input!</p>)}
            {/* <Dialog className='border rounded-lg' visible={visible} position='bottom' style={{ width: '50vw' }} onHide={()=>setVisible(false)}>
        <p>{message}</p>
      </Dialog> */}

          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 ">Rates Validity</h1>
      {showFilter &&
      <button onClick={() => { handleFilter()
        }}> <FontAwesomeIcon icon={faArrowLeft} /> </button>}

{showFilter === false &&
      <button
        className="bg-transparent border px-4 py-2 absolute top-4 right-4 "
        onClick={() => { handleFilter()
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
          />
        </svg>
        
      </button>
}
      
      {showFilter &&
      <div class="filtering" className="d-flex px-20 justify-content-center">
        {/* Add your filter inputs using react-select */}
        <label className=''>Ad Medium</label><br/>
        <Select className='mb-8 text-black'
          id='AdMedium'
          instanceId="AdMedium"
          placeholder="Select Ad Medium"
          isMulti
          value={createSelectOptions(filters.rateName)}
          options={createSelectOptions([...new Set(ratesData.flatMap((item) => item.rateName))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
        />
        <label className=''>Ad Type</label><br/>
        <Select className='mb-8 text-black'
          id='AdType'
          instanceId="AdType"
          isMulti
          options={createSelectOptions([...new Set(ratesData.filter((item) => filters.rateName.includes(item.rateName)).map((item) => item.adType))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
          value={createSelectOptions(filters.adType)}
          placeholder = 'Select Ad Type' 
        />
        <label className=''>Ad Category</label><br/>
        <Select className='mb-8 text-black'
          id='AdCategory'
          instanceId="AdCategory"
          isMulti
          options={createSelectOptions([...new Set(ratesData.filter((item) => filters.rateName.includes(item.rateName) && filters.adType.includes(item.adType)).map((item) => item.adCategory))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'adCategory')}
          value={createSelectOptions(filters.adCategory)}
          placeholder = 'Select Ad Category' 
        />
        {/* <label>Edition</label><br/>
        <Select className='mb-8'
          id='Edition'
          instanceId="Edition"
          isMulti
          options={createSelectOptions([...new Set(ratesData.map((item) => item.edition))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'edition')}
          value={{ label: filters.LastUsedUser, value: filters.edition }}
          placeholder="Select Edition"
        />
        <label>Remarks</label><br/>
        <Select className='mb-8'
          id='Remarks'
          instanceId="Remarks"
          isMulti
          options={createSelectOptions([...new Set(ratesData.filter((item) => item.rateName === filters.rateName && item.adType === filters.adType && item.adCategory === filters.adCategory && item.VendorName === filters.VendorName).map((item) => item.remarks))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'remarks')}
          value={{ label: filters.LastUsedUser, value: filters.remarks }}
          placeholder="Select Remarks"
        /> */}
        <label className=''>Vendor</label><br/>
        <Select
          className='mb-8 text-black bg-purple-400'
          id='Vendor'
          instanceId="Vendor"
          isMulti
          options={createSelectOptions([...new Set(ratesData.filter((item) => filters.rateName.includes(item.rateName) && filters.adType.includes(item.adType) && filters.adCategory.includes(item.adCategory)).map((item) => item.VendorName))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'VendorName')}
          value={createSelectOptions(filters.VendorName)}
          placeholder="Select Vendor"
        />
        <div class="flex space-x-4 ...">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded align-item-center mb-4"
          onClick={() => { 
            handleFilter() 
          //  console.log(showFilter2)
          }}>
          Filter
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded align-item-center mb-4"
          onClick={() => { 
            handleFilter() 
            {showFilter === true &&
              (filters.rateName = [],
              filters.adType = [],
              filters.adCategory = [],
              filters.VendorName = [])}
          }}>
          Clear
        </button></div>
      </div>
    }
    {/* <div className="flex justify-between items-center" >
        {showFilter === false 
        // || (showFilter2 && ( filters.rateName !== '' ||
        // filters.adType !== '' || 
        // filters.adCategory !== '' ||
        // filters.VendorName !== '' ||
        // filters.LastUsedUser !== '')))  
        &&
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => router.push('/addenquiry')}
        >
          Go to Enquiry
        </button>
        }
        {showFilter === false  && (
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => {Cookies.remove('username'); router.push('/login')}}>
            Logout
          </button>
        )}
      </div> */}

      <div className="flex justify-between items-center" >
        {/* Select All Button (Left) */}
        {showFilter === false 
        &&
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleSelectAllClick}
        >
          {selectedItems.length === filteredRates.length ? 'Unselect All' : 'Select All'}
        </button>
        }
        {/* Validate Selected Button (Right) */}
        {selectedItems.length > 1 && (
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg" onClick={() => setModal(true)}>
            Validate Selected
          </button>
        )}
      </div>
      <br/>
      {showFilter === false && filteredRates.length === 0 &&
      <p>No Details Available</p>

      }
    {showFilter === false 
    // || (showFilter2 && ( filters.rateName !== '' ||
    //   filters.adType !== '' || 
    //   filters.adCategory !== '' ||
    //   filters.VendorName !== '' ||
    //   filters.LastUsedUser !== '')))  
    &&
    //sm:grid-cols-2 lg:grid-cols-3
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 ">
        <div className="flex justify-center my-4">
        {/* Render page numbers */}
        {generatePageNumbers().map((pageNumber) => (
          <button
            key={pageNumber}
            className={`mx-2 px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
        {paginatedRates.map((item) => (
          <li
            key={item.rateId}
            className={`border p-4 rounded-lg shadow-md bg-purple-200 ${
              selectedItems.includes(item) ? 'border-blue-500' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => handleCheckboxChange(item)}
            />
            <div
              className={`${
                new Date(item.ValidityDate) <= today || item.ValidityDate === '0000-00-00'
                  ? 'mb-2 font-bold text-red-600'
                  : new Date(item.ValidityDate) > today && new Date(item.ValidityDate) <= twoDaysFromNow
                  ? 'mb-2 font-bold text-orange-500'
                  : 'mb-2 font-bold text-black'
              }`}
            >
              {item.rateName}
            </div>
            <div className="mb-2 text-black">{item.adType}</div>
            <div className="mb-2 text-black text-wrap">{item.adCategory.split("|").join(" | ").split(",").join(", ")}</div>
            <div className={`${
                new Date(item.ValidityDate) <= today || item.ValidityDate === '0000-00-00'
                  ? 'mb-2 font-bold text-red-600'
                  : new Date(item.ValidityDate) > today && new Date(item.ValidityDate) <= twoDaysFromNow
                  ? 'mb-2 font-bold text-orange-500'
                  : 'mb-2 font-bold text-black'
              }`}>Valid Till: {item.ValidityDate}</div>
            <div className="mb-2 text-black">
            <div className="mb-2 text-black"> Rate ID: {item.rateId}</div>
              Vendor: {item.VendorName}
              {selectedItems.length < 2 && (
                <button
                className="bg-green-500 text-white px-4 py-2 rounded mx-4"
                onClick={() => {
                  setModal(true, item.rateId);
                  setSelectedItems([item]);
                }}
              >
                Validate
              </button>
              )}
              
            </div>
          </li>
        ))}
      </ul>}
      {/* <div className='bg-surface-card p-8 rounded-2xl mb-4'>
          <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
            <MuiAlert severity={severity} onClose={() => setToast(false)}>
              {toastMessage}
            </MuiAlert>
          </Snackbar>
          </div> */}
    </div>
  );
};

export default RatesListPage;