'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import {Button} from '@mui/material';
import { RemoveCircleOutline, Event } from '@mui/icons-material';
import { TextField } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdDeleteOutline , MdOutlineSave, MdAddCircle} from "react-icons/md";
import { formattedMargin } from '../adDetails/ad-Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/store';
import "./page.css"
// import { Carousel } from 'primereact/carousel';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {

  // Check if localStorage contains a username
  const username = useAppSelector(state => state.authSlice.userName)
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
  const [searchingRateId, setSearchingRateId] = useState('');
  const [invalidRates, setInvalidRates] = useState(false)
  const [invalidRatesData, setInvalidRatesData] = useState([]);
  const [validRatesData, setValidRatesData] = useState([]);
  const [newRateModel, setNewRateModel] = useState(false);
  const [isNewRate, setIsNewRate] = useState(false);
  const [newRateType, setNewRateType] = useState("");
  const [newRateName, setNewRateName] = useState("");
  const [rateGST, setRateGST] = useState("");

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

  const GSTOptions = ['5', '18'].map(option => ({value: option, label: option}))

  const showToastMessage = (severityStatus, toastMessageContent) => {
    setSeverity(severityStatus)
    setToastMessage(toastMessageContent)
    setToast(true)
  }

  useEffect(() => {
     
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
        await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${Cookies.get("username")}&JsonRateId=${rateId}&JsonQty=${Qty}&JsonUnitPrice=${UnitPrice}&JsonUnit=${selectedUnit.label}`)
        fetchQtySlab();
        setQty(0)
        toggleModal();
      } else{
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
      if(selectedRate.campaignDurationVisibility === 1){
        setShowCampaignDuration(true)
      }
      setSelectedCampaignUnits({label: selectedRate.CampaignDurationUnit, value: selectedRate.CampaignDurationUnit})
      setLeadDays(selectedRate.LeadDays);
      setValidTill(selectedRate.ValidityDate)
      setValidityDate(selectedRate.ValidityDate)
    }
  }
  if (filterKey !== 'vendorName'){
    setIsNewRate(false)
  }
  
  }
  useEffect(() => {
    invalidRates ? setRatesData(invalidRatesData) : setRatesData(validRatesData)
  },[invalidRates])

  const fetchRates = async () => {
  
    try {
      const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchAllRates.php');
      const data = await res.json();
      const today = new Date();
      const valid = data.filter(item => {
        const validityDate = new Date(item.ValidityDate);
        return validityDate >= today;
    });
      const invalid = data.filter(item => {
        const validityDate = new Date(item.ValidityDate);
        return validityDate < today;
    });
      setValidRatesData(valid);
      setInvalidRatesData(invalid);
      setRatesData(valid);
      // console.log(data,'Rates',ratesData,'Invalid',invalid,'valid ', valid)
      // Cache the new rates data
      // localStorage.setItem('cachedRates', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const handleRateId = async () => {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAdMediumTypeCategoryVendor.php/?JsonRateId=${searchingRateId}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setSelectedValues({
    rateName: {
      label:  data.rateName ,
      value:  data.rateName 
    },
    adType: {
      label:  data.adType ,
      value:  data.adType 
    },
    adCategory: {
      label:  data.adCategory ,
      value:  data.adCategory 
    },
    vendorName: {
      label:  data.vendorName ,
      value:  data.vendorName 
    }
      })

      setRateId(data.RateID);
      setCampaignDuration(data['CampaignDuration(in Days)']);
      if(data.campaignDurationVisibility === 1){
        setShowCampaignDuration(true)
      }
      setSelectedCampaignUnits({label: data.CampaignDurationUnit, value: data.CampaignDurationUnit})
      setLeadDays(data.LeadDays);
      setValidTill(data.ValidityDate)
      setValidityDate(data.ValidityDate)

    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
    await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateRatesData.php/?JsonRateId=${rateId}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonValidityDate=${validTill}&JsonCampaignDurationVisibility=${showCampaignDuration === true ? 1 : 0}`)
    showToastMessage('success', 'Updated Successfully!')
    window.location.reload()
    } catch(error){
      console.error(error);
    }
  }

  const rejectRates = async() => {
    try{
    await fetch(`https://www.orders.baleenmedia.com/API/Media/DeleteRates.php/?JsonRateId=${rateId}`)
    showToastMessage('success', 'Rejected Successfully!')
    window.location.reload()
    } catch(error){
      console.error(error);
    }
  }

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
  
  const handleSetNewRateName = () => {
    // Add the new rate name to the options based on the newRateType
    let updatedOptions = [];
    let changedRate = "";
  
    switch (newRateType) {
      case 'Ad Medium':
        updatedOptions = [
          ...getDistinctValues('ratename').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "rateName";
        break;
      case 'Ad Type':
        updatedOptions = [
          ...getDistinctValues('adType').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "adType";
        break;
      case 'Ad Category':
        updatedOptions = [
          ...getDistinctValues('adCategory').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "adCategory";
        break;
      default:
        return;
    }
  
    // Update the filters and selected values with the new rate name
    setFilters({
      ...filters,
      [changedRate]: newRateName,
    });
  
    setSelectedValues({
      ...selectedValues,
      [changedRate]: {
        label: newRateName,
        value: newRateName,
      },
    });
  
    // Close the newRateModel modal
    setIsNewRate(true);
    setNewRateName("");
    setNewRateModel(false);
  };  

  const insertNewRate = async() => {

    try{
      if(selectedValues.rateName === null || selectedValues.adType === null || selectedValues.adCategory === null || selectedValues.vendorName === null){
        showToastMessage('warning', "Please fill all the fields!");
      } else if(validTill <= 0){
        showToastMessage('warning', "Validity date should 1 or more!")
      } else if(leadDays <= 0){
        showToastMessage('warning', "Lead Days should be more than 0!")
      } else {
        await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewRates.php/?JsonRateGST=${rateGST.value}&JsonEntryUser=${username}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignDurationUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonValidityDate=${validTill}&JsonAdType=${selectedValues.adType.value}&JsonAdCategory=${selectedValues.adCategory.value}&JsonCampaignDurationVisibility=${showCampaignDuration ? 1 : 0}`)
        showToastMessage('success', 'Inserted Successfully!')
        window.location.reload()
      }
    } catch(error){
        console.error(error);
    }
  }

  const handleValidityChange = (e) => {
    const daysToAdd = parseInt(e.target.value);
    if (!isNaN(daysToAdd)) {
      const currentDate = new Date();
      const newValidityDate = new Date(currentDate.setDate(currentDate.getDate() + daysToAdd));
      const formattedDate = newValidityDate.toISOString().split('T')[0];
      setValidityDate(formattedDate)
      setValidTill(formattedDate);
    }
    setValidityDays(e.target.value);
  };

  useEffect(() => {
    if(validTill){
      calculateDifference()
    }
  },[validTill])
  
  useEffect(() => {
    console.log(showCampaignDuration)
  },[showCampaignDuration])

  return (
    <div className=" mt-8 justify-center">
      { modal && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={toggleModal} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
            <h3 className='normal-label mb-4 text-black'>Enter Slab Rates for {qty}+ Quantities</h3>
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
      { newRateModel && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={() => setNewRateModel(!newRateModel)} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
            <h3 className='normal-label mb-4 text-black'>Enter new {newRateType}</h3>
            <TextField id="newRateType" defaultValue={newRateName} value={newRateName} label={newRateType} variant="outlined" size='small' className='w-36' onChange={(e) => {setNewRateName(e.target.value)}}/>
            <Button className='bg-blue-400 ml-4 text-white' onClick={() => handleSetNewRateName()}>Submit</Button>
            </div>
          </div>
      )}
            <div>
            
                <div className="mb-4 flex flex-col items-center justify-center">
                { !isNewRate && (
                    <div className='checkbox-wrapper-8'>
                      <input type='checkbox' id="cb3-8" class="tgl tgl-skewed" checked={invalidRates} value={invalidRates} onChange={() => {setInvalidRates(!invalidRates)}}/>
                      <label for="cb3-8" data-tg-on="Invalid" data-tg-off="Valid" class="tgl-btn"></label>
                    </div>
                )}

                <div>
                <label>Rate Id</label><br/>
                <input
                  className="mb-8 text-black w-60 border h-9 p-2 border-gray-300"
                  type="number"
                  placeholder="Ex. 4000"
                  value={searchingRateId}
                  onChange = {(e) => setSearchingRateId(e.target.value)}
                  // oange = {(e) => setSearchingRateId(e.target.value)}
                />
                <Button className='border' onClick={() => handleRateId()}>
                <FontAwesomeIcon icon={faSearch} className='mr-1' />
              </Button>
              </div>

                  {/* Ad Medium of the rate */}
                  <div>
                    <label className=''>Ad Medium</label><br />
                    <div className='flex'>
                      <Select
                        className='mb-8 text-black w-64'
                        id='AdMedium'
                        instanceId="AdMedium"
                        placeholder="Select Ad Medium"
                        defaultValue={selectedValues.rateName}
                        value={selectedValues.rateName}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                        options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                      />
                      <button className='justify-center mb-8 ml-3 text-blue-400' onClick={() => {setNewRateModel(true); setNewRateType("Ad Medium");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>

                  {/* Ad Type of the Rate  */}
                  <div>
                    <label className=''>Ad Type</label><br />
                    <div className='flex'>
                      <Select
                        className='mb-8 text-black w-64 '
                        id='AdType'
                        instanceId="AdType"
                        placeholder="Select Ad Type"
                        defaultValue={selectedValues.adType}
                        value={selectedValues.adType}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                        options={getOptions('adType', selectedValues)}
                      />
                      <button className='justify-center mb-8 ml-3 text-blue-400' onClick={() => {setNewRateModel(true); setNewRateType("Ad Type");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>

                  {/* Ad Category of the rate  */}
                  <div>
                    <label className=''>Ad Category</label><br />
                    <div className='flex'>
                      <Select
                        className='mb-8 text-black w-64'
                        id='AdCategory'
                        instanceId="AdCategory"
                        placeholder="Select Ad Category"
                        defaultValue={selectedValues.adCategory}
                        value={selectedValues.adCategory}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adCategory')}
                        options={getOptions('adCategory', selectedValues)}
                      />
                      <button className='justify-center mb-8 ml-3 text-blue-400' onClick={() => {setNewRateModel(true); setNewRateType("Ad Category");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
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
                      value={selectedValues.vendorName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'vendorName')}
                      options={vendors}
                    />
                  </div>

                  {/* Qty Slab of the rate  */}
                  <div>
                    <label>Quantity Slab</label>
                    <div className='flex mb-4'>
                    
                      <TextField id="qtySlab" variant="outlined" size='small' className='w-52' type='number' defaultValue={qty} onChange={e => setQty(e.target.value)} helperText="Ex: 3 | Means this rate is applicable for Units > 3" onFocus={(e) => {e.target.select()}}/>
                      <button className='justify-center mb-10 ml-3 text-blue-400' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? selectedUnit === "" ? showToastMessage("error", "Select a valid Unit!z") :toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <MdAddCircle size={28}/>
                      </button>
                      {/* <IconButton aria-label="Add" className='mb-10' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <AddCircleOutline color='primary'/>
                      </IconButton> */}
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
                          <option key={data.StartQty} className=" mt-1.5" onClick={() => {setEditModal(true); setQty(data.StartQty); setNewUnitPrice(data.UnitPrice); setSelectedUnitId(data.Id)}}>{data.StartQty} {selectedUnit.value} - ₹{formattedMargin(data.UnitPrice)} per {selectedUnit.value}</option>
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
                      <input type='checkbox' checked={showCampaignDuration} value={showCampaignDuration} onChange={() => {
                        setShowCampaignDuration(!showCampaignDuration);
                      }}/>
                      <label className='justify-left ml-2'>Campaign Duration</label>
                    </div>
                    <div className='mb-8'>
                    {showCampaignDuration && (
                    
                      <div className='flex'>
                      <TextField id="qtySlab" defaultValue={campaignDuration} variant="outlined" size='small' className='w-36 ' type='number' onChange={(e) => {setCampaignDuration(e.target.value)}} onFocus={(e) => e.target.select()}/>
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
                      <TextField id="leadDays" value={leadDays} defaultValue="1" variant="outlined" size='small' className='w-44' type='number' onChange={e => setLeadDays(e.target.value)} onFocus={(e) => {e.target.select()}}/>
                      <p className='ml-4 mt-2'>Day (s)</p>
                    </div>
                  </div>
                  {/* Valid Till Text*/}
                  <div>
                  <label>Valid Till</label>
                  <div className='flex mb-4'>
                    <TextField id="validTill" value={validityDays} onChange={handleValidityChange} variant="outlined" size='small' className='w-36' type='number' onFocus={(e) => {e.target.select()}}/>
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
                {isNewRate ? (
                  <div>
                    <label className=''>Rate GST%</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='Rate GST'
                      instanceId="Rate GST"
                      placeholder="Select Rate GST%"
                      //defaultValue={selectedUnit}
                      value={rateGST}
                      onChange={(selectedOption) => setRateGST(selectedOption)}
                      options={GSTOptions}
                    />
                  </div>
                ) : 
                <p className=' text-center'>Rate Id: {rateId}</p>
                } 
                </div>
                
                <div className="flex items-center justify-center mb-8">
                  <button className = "bg-red-400 text-white p-2 rounded-full w-24 justify-center" onClick={rejectRates}>
                    <span className='flex flex-row justify-center'><MdDeleteOutline className='mt-1 mr-1'/> Delete</span>
                    </button>
                    {isNewRate ? (
                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center" onClick={insertNewRate}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Add</span>
                      </button>
                    ) : (
                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center" onClick={updateRates}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Save</span>
                    </button>
                    )}
                    
                {/* <Button variant="outlined" startIcon={<DeleteOutline />} className='border-red-400 text-red-400'>
                  Delete
                </Button>
                <Button variant="contained" endIcon={<SaveOutlined />} className='ml-4 bg-green-400' onClick={updateRates}>
                  Save
                </Button> */}
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