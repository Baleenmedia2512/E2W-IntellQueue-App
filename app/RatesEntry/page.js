'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import {Button} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline, SaveOutlined, DeleteOutline, Event } from '@mui/icons-material';
import { TextField, InputAdornment } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import { Carousel } from 'primereact/carousel';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {
  const [ratesData, setRatesData] = useState([]);
  const [validityDate, setValidityDate] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const [vendors, setVendors] = useState([])
  const [campaignDuration, setCampaignDuration] = useState();
  const [leadDays, setLeadDays] = useState();
  const [validTill, setValidTill] = useState();
  const [campaignUnits, setCampaignUnits] = useState([]) 
  const [selectedCampaignUnits, setSelectedCampaignUnits] = useState()
  const [slabData, setSlabData] = useState([]);
  const [editModal, setEditModal] = useState();
  const [qty, setQty] = useState(0)
  const [validityDays, setValidityDays] = useState(0)
  const [units, setUnits] = useState([])
  const [newUnitPrice, setNewUnitPrice] = useState()
  const [isSlabAvailable, setIsSlabAvailable] = useState(false)
  const [modal, setModal] = useState(false);
  const [startQty, setStartQty] = useState([])
  const [unitPrice, setUnitPrice] = useState(0);
  const [showCampaignDuration, setShowCampaignDuration] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState()
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [rateId, setRateId] = useState(null);

  const [filters, setFilters] = useState({
    rateName: [],
    adType: [],
    adCategory: [],
    vendorName: []
  });

  const [selectedValues, setSelectedValues] = useState({
    rateName: null,
    adType: null,
    adCategory: null,
    vendorName: null
  });

  // Function to toggle the modal
  const toggleModal = () => {
      setModal((prevState) => !prevState);
  }

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  useEffect(() => {
     // Check if localStorage contains a username
     const username = Cookies.get('username');
     // If no username is found, redirect to the login page
     if (!username) {
       router.push('/login');
     } else{
      fetchRates();
      fetchCampaignUnits();
    }
  }, []);

  const insertQtySlab = async(Qty, UnitPrice) => {
    try{
      if(!startQty.includes(Number(Qty))){
        console.log(qty)
        await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${Cookies.get("username")}&JsonRateId=${rateId}&JsonQty=${Qty}&JsonUnitPrice=${UnitPrice}&JsonUnit=${selectedUnit.label}`)
        fetchQtySlab();
        setQty(0)
        toggleModal();
      } else{
        console.log(qty)
        updateQtySlab()
      }
    }catch(error){
      console.error(error)
    }
  }

  const updateQtySlab = async() => {
    if(selectedUnitId){
    await fetch(`https://orders.baleenmedia.com/API/Media/UpdateQtySlab.php/?JsonUnitId=${selectedUnitId}&JsonQty=${qty}&JsonUnitPrice=${newUnitPrice}&JsonUnit=${selectedUnit.label}`);
    } else{
      await fetch(`https://orders.baleenmedia.com/API/Media/UpdateQtySlab.php/?JsonRateId=${rateId}&JsonQty=${qty}&JsonUnitPrice=${newUnitPrice}&JsonUnit=${selectedUnit.label}`);
      toggleModal()
    }
    fetchQtySlab();
    setQty(0);
    setNewUnitPrice();
    setEditModal(false);
  }

  const removeQtySlab = async(Qty) => {
    await fetch(`https://orders.baleenmedia.com/API/Media/RemoveQtySlab.php/?JsonRateId=${rateId}&JsonQty=${Qty}`);
    fetchQtySlab();
  }
  
  const fetchQtySlab = async () => {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSlabData(data);
      const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
      const firstSelectedSlab = sortedData[0];
      if(firstSelectedSlab){
        setIsSlabAvailable(true)
      }
      setUnitPrice(firstSelectedSlab.UnitPrice);
      setSelectedUnit({label: firstSelectedSlab.Unit, value: firstSelectedSlab.Unit});
      setStartQty(sortedData.map((slab) => Number(slab.StartQty)));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if(rateId !== null){
      fetchQtySlab();
    }
  }, [rateId]);

  const fetchCampaignUnits = async() => {
    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchCampaignUnits.php/`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const options = data.map(item => ({
      value: item, 
      label: item,  
    }));
    
    // Update the state campaignUnits with the new options
    setCampaignUnits(options);
  }

  const fetchAllVendor = async() => {
    const adMed = selectedValues.rateName ? selectedValues.rateName.label : null;
    const adTyp = selectedValues.adType ? selectedValues.adType.label : null;
    const res = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAllVendor.php/?JsonAdMedium=${adMed}&JsonAdType=${adTyp}`)
    if(!res.ok){
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    const data = await res.json();
    setVendors(data);
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
          if (selectedValues.rateName && selectedValues.adType) {
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchUnits.php/?JsonAdMedium=${selectedValues.rateName.label}&JsonAdType=${selectedValues.adType.label}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setUnits(data);
        }
        } catch (error) {
          console.error(error);
        }
    }

    fetchData();
    fetchAllVendor();
  },[selectedValues.adType, selectedValues.rateName])

  const getDistinctValues = (key) => {
    const distinctValues = [...new Set(ratesData.map(item => item[key]))];
    return distinctValues.sort();
  };

  const transformQtySlabData = () => {
    return slabData.map(item => {
      return {
        value: item.StartQty,  // Using StartQty as the unique identifier
        label: `Per Unit: ${item.UnitPrice} for ${item.StartQty} ${item.Unit}`,
      };
    });
  };

  const qtySlabOptions = transformQtySlabData();

  // Function to get options based on the selected values
  const getOptions = (filterKey, selectedValues) => {
    const filteredData = ratesData.filter(item => {
      return Object.entries(selectedValues).every(([key, value]) =>
        key === filterKey || !value || item[key] === value.value
      );
    });

    const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
    return distinctValues.sort().map(value => ({ value, label: value }));
  };

  // Function to handle dropdown selection
  const handleSelectChange = (selectedOption, filterKey) => {
    if (filterKey === 'rateName'){
      setSelectedValues({
        [filterKey]: selectedOption,
        adType: null,
        adCategory: null,
        vendorName: null
      })
    } else if(filterKey === 'adType'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        adCategory: null,
        vendorName: null
      })
    } else {
      // Update the selected values
    setSelectedValues({
      ...selectedValues,
      [filterKey]: selectedOption
    });
    }
    

    // Update the filters
    setFilters({
      ...filters,
      [filterKey]: selectedOption.value
    });

    // Add logic to fetch rateId after selecting Vendor
  if (filterKey === 'vendorName' && selectedOption) {
    const selectedRate = ratesData.find(item =>
      item.rateName === selectedValues.rateName.value &&
      item.adType === selectedValues.adType.value &&
      item.adCategory === selectedValues.adCategory.value &&
      item.vendorName === selectedOption.value
    );

    if (selectedRate) {
      setRateId(selectedRate.RateID);
      setCampaignDuration(selectedRate['CampaignDuration(in Days)']);
      if(selectedRate['CampaignDuration(in Days)'] > 0){
        setShowCampaignDuration(true)
      }
      setSelectedCampaignUnits({label: selectedRate.CampaignDurationUnit, value: selectedRate.CampaignDurationUnit})
      setLeadDays(selectedRate.LeadDays);
      setValidTill(selectedRate.ValidityDate)
      setValidityDate(selectedRate.ValidityDate)
    }
  }
  }

  const fetchRates = async () => {
    const storedETag = localStorage.getItem('ratesETag');
    const headers = {};
    
    if (storedETag) {
      headers['If-None-Match'] = storedETag;
    }
  
    try {
      const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchAllRates.php', {
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

  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };

  const calculateDifference = () => {
  
    const parsedDate1 = new Date(validTill);
    parsedDate1.setHours(0,0,0,0);

    // Set time part of parsedDate2 to midnight
    const parsedDate2 = new Date();
    parsedDate2.setHours(0, 0, 0, 0);
  
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = parsedDate1 - parsedDate2;
  
    // Convert the difference to days
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  
    // Update state with the calculated difference
    setValidityDays(differenceInDays);
  };
  
  const updateRates = async() => {
    try{
    await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateRates.php/?JsonRateId=${rateId}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonValidityDate=${validTill}`)
    showToastMessage('success', 'Updated Successfully!')
    window.location.reload()
    } catch(error){
      console.log(error);
    }
  }

  const calculateDateFromDays = (days) => {
    const day = days.target.value
    setValidityDays(day)
    const currentDate = new Date();
    const targetDate = new Date(currentDate);
    targetDate.setDate(currentDate.getDate() + day);
    setValidityDate(target)
    let formattedValidityDate = targetDate.toISOString().split('T')[0];
    setValidTill(formattedValidityDate);
  };

  const handleDateChange = (event) => {
    // Set current date to midnight
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  
    // Extract the selected date from the event
    let validityDay = new Date(event);
  
    // Set the selected date to midnight
    validityDay.setHours(0, 0, 0, 0);
  
    // Update the state with the selected date
    setValidityDate(validityDay);
  
    // Format the selected date for display
    let formattedValidityDate = validityDay.toISOString().split('T')[0];
    setValidTill(formattedValidityDate);
  
    // Calculate the difference in days
    const differenceInMilliseconds = validityDay - currentDate;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  
    // Update the state with the difference in days
    setValidityDays(differenceInDays);
  };
  

  useEffect(() => {
    if(validTill){
      calculateDifference()
    }
  },[validTill])

  return (
    <div className=" mt-8 justify-center">
      { modal && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={toggleModal} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
            <h3 className='normal-label mb-4 text-black'>Enter the Slab Rate of the provided Quantity Slab</h3>
            <TextField id="ratePerUnit" defaultValue={newUnitPrice} label="Slab Rate" variant="outlined" size='small' className='w-36' type='number' onChange={(e) => {setNewUnitPrice(e.target.value)}}/>
            <Button className='bg-blue-400 ml-4 text-white' onClick={() => insertQtySlab(qty, newUnitPrice)}>Submit</Button>
            </div>
          </div>
      )}
      { editModal && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={() => {setEditModal(false); setQty(0); setNewUnitPrice()}} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
            <h3 className='normal-label mb-4 text-black'>Enter the Slab Rate of the provided Quantity Slab</h3>
            <TextField id="ratePerUnit" defaultValue={qty} label="Slab Rate" variant="outlined" size='small' className='w-36' type='number' onChange={(e) => {setQty(e.target.value)}}  onFocus={event => event.target.select()}/>
            <TextField id="ratePerUnit" defaultValue={newUnitPrice} label="Slab Rate" variant="outlined" size='small' className='w-36' type='number' onChange={(e) => {setNewUnitPrice(e.target.value)}} onFocus={event => event.target.select()}/>
            <Button className='bg-blue-400 ml-4 text-white' onClick={updateQtySlab}>Submit</Button>
            </div>
          </div>
      )}
            <div>
                <div className="mb-4 flex flex-col items-center justify-center">

                  {/* Ad Medium of the rate */}
                  <div>
                    <label className=''>Ad Medium</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='AdMedium'
                      instanceId="AdMedium"
                      placeholder="Select Ad Medium"
                      defaultValue={selectedValues.rateName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                      options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                    />
                  </div>

                  {/* Ad Type of the Rate  */}
                  <div>
                    <label className=''>Ad Type</label><br />
                    <Select
                      className='mb-8 text-black w-64 '
                      id='AdType'
                      instanceId="AdType"
                      placeholder="Select Ad Type"
                      defaultValue={selectedValues.adType}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                      options={getOptions('adType', selectedValues)}
                    />
                  </div>

                  {/* Ad Category of the rate  */}
                  <div>
                    <label className=''>Ad Category</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='AdCategory'
                      instanceId="AdCategory"
                      placeholder="Select Ad Category"
                      defaultValue={selectedValues.adCategory}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'adCategory')}
                      options={getOptions('adCategory', selectedValues)}
                    />
                  </div>

                  {/* Choosing the vendor of the rate  */}
                  <div>
                    <label className=''>Vendor</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='Vendor'
                      instanceId="Vendor"
                      placeholder="Select Vendor"
                      defaultValue={selectedValues.vendorName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'vendorName')}
                      options={vendors}
                    />
                  </div>

                  {/* Qty Slab of the rate  */}
                  <div>
                    <label>Quantity Slab</label>
                    <div className='flex mb-4'>
                    
                      <TextField id="qtySlab" variant="outlined" size='small' className='w-52' type='number' defaultValue={qty} onChange={e => setQty(e.target.value)} helperText="Ex: 3 | Means this rate is applicable for Units > 3"/>
                      <IconButton aria-label="Add" className='mb-10' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <AddCircleOutline color='primary'/>
                      </IconButton>
                    </div>
                  </div>
                  {/* Slab List Here  */}
                  <div>
                  {isSlabAvailable && (
                    <div className='text-left justify-start'>
                    <h2 className='mb-4 font-bold'>Rate-Slab</h2>
                    <ul className='mb-4'>
                      {slabData.map(data => (
                        <div className='flex' key={data.StartQty}>
                          <option key={data.StartQty} className=" mt-1.5" onClick={() => {setEditModal(true); setQty(data.StartQty); setNewUnitPrice(data.UnitPrice); setSelectedUnitId(data.Id)}}>{data.StartQty} {data.Unit} - ₹{data.UnitPrice}</option>
                          <IconButton aria-label="Remove" className='align-top' onClick={() => removeQtySlab(data.StartQty)}>
                            <RemoveCircleOutline color='secondary' fontSize='small'/>
                          </IconButton>
                        </div>
                      ))}
                    </ul>
                    </div>
                  )}
                </div>
                  {/* Units of the rate. Ex: Bus, Auto */}
                  <div className='bg-white'>
                    <label className=''>Units</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='Units'
                      instanceId="Units"
                      placeholder="Select Units"
                      //defaultValue={selectedUnit}
                      value={selectedUnit}
                      onChange={(selectedOption) => setSelectedUnit(selectedOption)}
                      options={units}
                    />
                  </div>

                  {/* Campaign Duration Text with Units */}
                  <div>
                    <div className='flex'>
                      <input type='checkbox' checked={showCampaignDuration} value={showCampaignDuration} onChange={() => {setShowCampaignDuration(!showCampaignDuration)}}/>
                      <label className='justify-left ml-2' onClick={() => setShowCampaignDuration(!showCampaignDuration)}>Campaign Duration</label>
                    </div>
                    <div className='mb-8'>
                    {showCampaignDuration && (
                    
                      <div className='flex'>
                      <TextField id="qtySlab" defaultValue={campaignDuration} variant="outlined" size='small' className='w-36 ' type='number' onChange={(e) => {setCampaignDuration(e.target.value)}}/>
                      <Select
                        className='text-black w-24 ml-2 mt-0.5 '
                        id='CUnits'
                        instanceId="CUnits"
                        placeholder="Units"
                        defaultValue={selectedCampaignUnits}
                        onChange={(selectedOption) => setSelectedCampaignUnits(selectedOption)}
                        options={campaignUnits}
                      />
                    </div>
                    )}
                    </div>
                  </div>
                  {/* Lead Days Text  */}
                  <div>
                    <label>Lead Days</label>
                    <div className='flex mb-4'>
                      <TextField id="leadDays" value={leadDays} defaultValue="1" variant="outlined" size='small' className='w-44' type='number' onChange={e => setLeadDays(e.target.value)}/>
                      <p className='ml-4 mt-2'>Day (s)</p>
                    </div>
                  </div>
                  {/* Valid Till Text*/}
                  <div>
                  <label>Valid Till</label>
                  <div className='flex mb-4'>
                    <TextField id="validTill" defaultValue={validityDays} variant="outlined" size='small' className='w-36' type='number'/>
                    <IconButton aria-label="Add" onClick={() => setShowDatePicker(!showDatePicker)}>
                        <Event color='primary'/>
                      </IconButton>
                    <p className='ml-2 mt-2'>Day (s)</p>
                  </div>
                  {showDatePicker && (
                    <div>
                    <p>Select Date:</p>
                      <DatePicker
                        selected={validityDate}
                        onChange={handleDateChange}
                        dateFormat="dd-MMM-yyyy"
                        dateFormatCalendar='dd-MMM-yyyy'
                        showYearDropdown
                        showMonthDropdown
                        className="border rounded-md p-2"
                        minDate={new Date()}
                        calendarClassName="bg-white shadow-md rounded-md mt-2"
                      />
                      </div>
                    )}
                    
                </div>
                </div>
                <p className=' text-center'>Rate Id: {rateId}</p>
                <div className="flex items-center justify-center mb-8">
                <Button variant="outlined" startIcon={<DeleteOutline />} className='border-red-400 text-red-400'>
                  Delete
                </Button>
                <Button variant="contained" endIcon={<SaveOutlined />} className='ml-4 bg-green-400' onClick={updateRates}>
                  Save
                </Button>
                </div>
                
                {/* <div className="flex flex-col justify-center items-center ">
                  
                  <p className="font-semibold text-red-500">
                    {/* *Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : ''} days from the date of payment received or the date of design approved, whichever is higher 
                    
                  </p>
                  {/* <p className="font-bold">Quote Valid till {formattedDate}</p> 
                </div> */}
                
              </div>
      <div className='bg-surface-card p-8 rounded-2xl mb-4'>
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </div>
  )

}
export default AdDetailsPage;