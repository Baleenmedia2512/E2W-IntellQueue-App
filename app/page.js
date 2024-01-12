'use client';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Dialog } from 'primereact/dialog';


const today = new Date();
const twoDaysFromNow = new Date();
twoDaysFromNow.setDate(today.getDate() + 2);
var intRegex = /^\d+$/;

const RatesListPage = () => {
  const [ratesData, setRatesData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [showInputError, setShowInputError] = useState(false);
  const [validityDays, setValidityDays] = useState();
  const [showFilter , setShowFilter] = useState(false);
  const [message , setMessage] = useState('');
  const [visible, setVisible] =useState(false);
  const [filters, setFilters] = useState({
    rateName: '',
    adType: '',
    adCategory: '',
    edition: '',
    remarks: '',
    VendorName: '',
    //LastUsedUser: '',
    ValidityDate: ''
  });

  // Filtered rates based on selected options
  const filteredRates = ratesData.filter((item) => {
    return (
      (filters.rateName === '' || item.rateName === filters.rateName) &&
      (filters.adType === '' || item.adType === filters.adType) &&
      (filters.adCategory === '' || item.adCategory === filters.adCategory) &&
      (filters.VendorName === '' || item.VendorName === filters.VendorName) 
      //&&(filters.LastUsedUser === '' || item.LastUsedUser === filters.LastUsedUser)
    );
  });

  const createSelectOptions = (data) => {
    return data.map((item) => ({
      value: item,
      label: item,
    }));
  };

  const handleSelectChange = (selectedOption, filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: selectedOption.label
    }));
  };

  useEffect(() => {
    const fetchRates = async () => {
      const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php', {
        next: { revalidate: 10 },
      });
      const data = await res.json();
      setRatesData(data);
    };

    fetchRates();
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
        console.log(validityDate)
        const data = await response.json();
        setVisible(true);
        if (data.success === true) {
          alert(data.message)
          //setMessage(data.message);
        } else {
          alert("The following error occurred while inserting data: " + data);
          //setMessage("The following error occurred while inserting data: " + data);
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
    console.log(futureDate)
    //Formatted Date
    const formattedDate = futureDate.toISOString().split('T')[0];
    console.log(formattedDate)
    return formattedDate;
  }

  const toggleModal = () => {
    setModal((prevState) => !prevState);
  };

  return (
    <div className="container mx-auto p-4">
      {modal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center modal">
          <div onClick={toggleModal} className="fixed top-0 left-0 right-0 bottom-0 bg-gray-800 opacity-75 overlay"></div>
          <div className="absolute top-2/5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 line-clamp-4 bg-gradient-to-r from-gray-200 to-gray-300 p-4 rounded-lg w-auto min-w-80 z-50 modal-content">
            <h3 className="text-xl font-semibold">Fill in the necessary details</h3>
            <input
              className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:border-blue-500 my-4"
              type='number'
              defaultValue={validityDays}
              onChange={e => setValidityDays(e.target.value)}
              placeholder="Validity Date"
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded mx-4" onClick={() => { updateRateValidation() }}>Submit</button>
            {showInputError && (<p className="error-message">Please enter a valid Input!</p>)}
            {/* <Dialog className='border rounded-lg' visible={visible} position='bottom' style={{ width: '50vw' }} onHide={()=>setVisible(false)}>
        <p>{message}</p>
      </Dialog> */}

          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-black">Rates List</h1>
      {showFilter &&
      <button onClick={() => { handleFilter()
        }}> <FontAwesomeIcon icon={faArrowLeft} /> </button>}

{showFilter === false &&
      <button
        className="bg-transparent border border-black px-4 py-2 rounded-full absolute top-4 right-4 text-black"
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
        <label>Ad Medium</label><br/>
        <Select className='mb-8'
          id='AdMedium'
          instanceId="AdMedium"
          placeholder="Ad Medium"
          value={{ placeholder:"Ad Medium", label: filters.rateName, value: filters.rateName}}
          options={createSelectOptions([...new Set(ratesData.flatMap((item) => item.rateName))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
        />
        <label>Ad Type</label><br/>
        <Select className='mb-8'
          id='AdType'
          instanceId="AdType"
          options={createSelectOptions([...new Set(ratesData.filter((item) => item.rateName === filters.rateName).map((item) => item.adType))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
          value={{ label: filters.adType, value: filters.adType }}
          placeholder = 'Ad Type' 
        />
        <label>Ad Category</label><br/>
        <Select className='mb-8'
          id='AdCategory'
          instanceId="AdCategory"
          options={createSelectOptions([...new Set(ratesData.filter((item) => item.rateName === filters.rateName && item.adType === filters.adType).map((item) => item.adCategory))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'adCategory')}
          value={{ label: filters.adCategory, value: filters.adCategory }}
          placeholder = 'Ad Category' 
        />
        <label>Edition</label><br/>
        <Select className='mb-8'
          id='Edition'
          instanceId="Edition"
          options={createSelectOptions([...new Set(ratesData.map((item) => item.edition))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'edition')}
          value={{ label: filters.LastUsedUser, value: filters.edition }}
          placeholder="Edition"
        />
        <label>Remarks</label><br/>
        <Select className='mb-8'
          id='Remarks'
          instanceId="Remarks"
          options={createSelectOptions([...new Set(ratesData.filter((item) => item.rateName === filters.rateName && item.adType === filters.adType && item.adCategory === filters.adCategory && item.VendorName === filters.VendorName).map((item) => item.remarks))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'remarks')}
          value={{ label: filters.LastUsedUser, value: filters.remarks }}
          placeholder="Remarks"
        />
        <label>Vendor</label><br/>
        <Select className='mb-8'
          id='Vendor'
          instanceId="Vendor"
          options={createSelectOptions([...new Set(ratesData.filter((item) => item.rateName === filters.rateName && item.adType === filters.adType && item.adCategory === filters.adCategory).map((item) => item.VendorName))])}
          onChange={(selectedOption) => handleSelectChange(selectedOption, 'VendorName')}
          value={{ label: filters.VendorName, value: filters.VendorName }}
          placeholder="Vendor" />
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
              (filters.rateName = '',
              filters.adType = '',
              filters.adCategory = '',
              filters.VendorName = '',
              filters.LastUsedUser = '')}
          }}>
          Clear
        </button></div>
      </div>
    }
    <div className="flex justify-between items-center" >
        {/* Select All Button (Left) */}
        {showFilter === false 
        // || (showFilter2 && ( filters.rateName !== '' ||
        // filters.adType !== '' || 
        // filters.adCategory !== '' ||
        // filters.VendorName !== '' ||
        // filters.LastUsedUser !== '')))  
        &&
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSelectAllClick}
        >
          {selectedItems.length === filteredRates.length ? 'Unselect All' : 'Select All'}
        </button>
        }
        {/* Validate Selected Button (Right) */}
        {selectedItems.length > 0 && (
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setModal(true)}>
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
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
        {filteredRates.map((item) => (
          <li
            key={item.rateId}
            className={`border p-4 rounded-lg shadow-md ${
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
            <div className="mb-2 text-black">{item.adCategory}</div>
            <div className={`${
                new Date(item.ValidityDate) <= today || item.ValidityDate === '0000-00-00'
                  ? 'mb-2 font-bold text-red-600'
                  : new Date(item.ValidityDate) > today && new Date(item.ValidityDate) <= twoDaysFromNow
                  ? 'mb-2 font-bold text-orange-500'
                  : 'mb-2 font-bold text-black'
              }`}>Validity: {item.ValidityDate}</div>
            <div className="mb-2 text-black">
              Vendor: {item.VendorName}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded mx-4"
                onClick={() => {
                  setModal(true, item.rateId);
                  setSelectedItems([item]);
                }}
              >
                Validate
              </button>
            </div>
          </li>
        ))}
      </ul>}
    </div>
  );
};

export default RatesListPage;