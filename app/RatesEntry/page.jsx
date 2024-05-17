'use client'
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import {Button} from '@mui/material';
import { RemoveCircleOutline, Event, SignalCellularNullOutlined } from '@mui/icons-material';
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// import { Carousel } from 'primereact/carousel';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {

  // Check if localStorage contains a username
  // const username = "GraceScans"
  const username = useAppSelector(state => state.authSlice.userName)
  const [ratesData, setRatesData] = useState([]);
  const [validityDate, setValidityDate] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const [vendors, setVendors] = useState([])
  const [campaignDuration, setCampaignDuration] = useState("");
  const [leadDays, setLeadDays] = useState(0);
  const [validTill, setValidTill] = useState("");
  const [campaignUnits, setCampaignUnits] = useState([]) 
  const [selectedCampaignUnits, setSelectedCampaignUnits] = useState("")
  const [slabData, setSlabData] = useState([]);
  const [editModal, setEditModal] = useState();
  const [qty, setQty] = useState(0)
  const [validityDays, setValidityDays] = useState(0)
  const [units, setUnits] = useState([])
  const [newUnitPrice, setNewUnitPrice] = useState("")
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
  const [invalidRates, setInvalidRates] = useState(false)
  const [invalidRatesData, setInvalidRatesData] = useState([]);
  const [validRatesData, setValidRatesData] = useState([]);
  const [newRateModel, setNewRateModel] = useState(false);
  const [isNewRate, setIsNewRate] = useState(false);
  const [newRateType, setNewRateType] = useState("");
  const [newRateName, setNewRateName] = useState("");
  const [rateGST, setRateGST] = useState(null);

  const [filters, setFilters] = useState({
    rateName: [],
    typeOfAd: [],
    adType: [],
    location: [],
    vendorName: [],
    package: []
  });

  const [selectedValues, setSelectedValues] = useState({
    rateName: null,
    typeOfAd: null,
    adType: null,
    Location: null,
    vendorName: null,
    Package: null
  });

  // Function to toggle the modal
  const toggleModal = () => {
      setModal((prevState) => !prevState);
  }

  const GSTOptions = ['0','5', '18'].map(option => ({value: option, label: option}))

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
    if (isNewRate) {
      setIsSlabAvailable(true);
      toggleModal();
      return;
    }
    if(newUnitPrice > 0){
      try{
        if(!startQty.includes(Number(Qty))){
          await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${username}&JsonRateId=${rateId}&JsonQty=${Qty}&JsonUnitPrice=${UnitPrice}&JsonUnit=${selectedUnit.label}&DBName=${username}`)
          fetchQtySlab();
          setQty(0)
          toggleModal();
          setNewUnitPrice("");
        } else{
          updateQtySlab()
        }
      }catch(error){
        console.error(error)
      }
    } else {
      showToastMessage("error", "Enter valid Unit Price!")
    }
  }

  const updateQtySlab = async() => {
    if(newUnitPrice > 0 && qty > 0){
      if(selectedUnitId){
        await fetch(`https://orders.baleenmedia.com/API/Media/UpdateQtySlab.php/?JsonUnitId=${selectedUnitId}&JsonQty=${qty}&JsonUnitPrice=${newUnitPrice}&JsonUnit=${selectedUnit.label}&DBName=${username}`);
      } else{
        await fetch(`https://orders.baleenmedia.com/API/Media/UpdateQtySlab.php/?JsonRateId=${rateId}&JsonQty=${qty}&JsonUnitPrice=${newUnitPrice}&JsonUnit=${selectedUnit.label}&DBName=${username}`);
        toggleModal()
      }
      
      fetchQtySlab();
      setQty(0);
      setNewUnitPrice();
      setEditModal(false);
      setNewUnitPrice("");
      showToastMessage('success', 'Updated Successfully!')
    } else {
      showToastMessage("error", "Enter valid Unit Price or Quantity!")
    }
  }

  const removeQtySlab = async(Qty) => {
    if (isNewRate) {
      setIsSlabAvailable(false);
      setQty(0);
      setNewUnitPrice("");
      
    } else {
    await fetch(`https://orders.baleenmedia.com/API/Media/RemoveQtySlab.php/?JsonRateId=${rateId}&JsonQty=${Qty}&DBName=${username}`);
    fetchQtySlab();
  }}

  const fetchQtySlab = async () => {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}&DBName=${username}`);
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
    if(rateId > 0){
      fetchQtySlab();
      handleRateId()
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
    const res = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAllVendor.php/?JsonAdMedium=${adMed}&JsonAdType=${adTyp}&DBName=${username}`)
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
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchUnits.php/?JsonAdMedium=${selectedValues.rateName.label}&JsonAdType=${selectedValues.adType.label}&DBName=${username}`);
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

  // useEffect to update filters whenever selectedValues change
  // useEffect(() => {
  //   // Define getFilters function
  //   const getOptions = (filterKey, selectedValues) => {
  //     // Filter data based on all selected values except the current filterKey
  //     const filteredData = ratesData.filter(item => {
  //       return Object.entries(selectedValues).filter(([key]) => key !== filterKey).every(([key, value]) =>
  //         !value || item[key] === value.value
  //       );
  //     });

  //     // Get distinct values for the current filterKey
  //     const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  //     return distinctValues.sort().map(value => ({ value, label: value }));
  //   };

  //   // Update filters for each dropdown
  //   const updatedFilters = {};
  //   Object.keys(selectedValues).forEach(key => {
  //     updatedFilters[key] = getOptions(key, selectedValues);
  //   });
  //   setFilters(updatedFilters);
  // }, [selectedValues]); // Depend on selectedValues

  // Function to handle dropdown selection
  const handleSelectChange = (selectedOption, filterKey) => {
    if (filterKey === 'rateName'){
      setSelectedValues({
        [filterKey]: selectedOption,
        adType: null,
        adCategory: null,
        vendorName: null,
        Package: null,
        Location: null,
        typeOfAd:null
      })
    } else if(filterKey === 'typeOfAd'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        adType: null,
        adCategory: null,
        vendorName: null,
        Package: null,
        Location: null
      })
    } else if(filterKey === 'adType'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        vendorName: null,
        Package: null,
        Location: null
      })
    } else if(filterKey === 'Location'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        Package: null,
        vendorName: null,
        
      })
    } else if(filterKey === 'Package'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
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
  if (filterKey === 'adType' && selectedOption) {
    const selectedRate = ratesData.find(item =>
      item.rateName === selectedValues.rateName.value &&
      item.typeOfAd === selectedValues.typeOfAd.value && 
      item.adType === selectedOption.value 

    );

    if (selectedRate) {
      setRateId(selectedRate.RateID);
      setCampaignDuration(selectedRate['CampaignDuration(in Days)']);
      if(selectedRate.campaignDurationVisibility === 1){
        setShowCampaignDuration(true)
      }
      setSelectedCampaignUnits({label: selectedRate.CampaignDurationUnit, value: selectedRate.CampaignDurationUnit})
      setRateGST({label: selectedRate.rategst, value: selectedRate.rategst})
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
      const res = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAllRates.php/?DBName=${username}`);
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
    if(rateId > 0){
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAdMediumTypeCategoryVendor.php/?JsonRateId=${rateId}&DBName=${username}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if(data === "Rate is rejected" || data === "No rates found for the provided Rate ID"){
        return null
      } else{
        const validityDate = new Date(data.ValidityDate);
      const currentDate = new Date()
        if (validityDate < currentDate){
          return
        }
        // var locationValues = data.location;
        // var packageValues = data.package;
        // const colonIndex = data.adCategory.indexOf(':');
        // if (colonIndex !== -1) {
        //   locationValues = data.location.split(':')[0].trim()
        //   packageValues = data.packages.split(':')[1].trim()
        // } 
        setSelectedValues({
          rateName: {
            label:  data.rateName ,
            value:  data.rateName 
          },
          adType: {
            label:  data.adType ,
            value:  data.adType 
          },
          typeOfAd: {
            label:  data.typeOfAd ,
            value:  data.typeOfAd 
          },
          Location: {
            label: data.Location,
            value: data.Location
          },
          Package: {
            label: data.Package,
            value: data.Package
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
      } else{
        setShowCampaignDuration(false)
      }
      setSelectedCampaignUnits({label: data.CampaignDurationUnit, value: data.CampaignDurationUnit})
      setRateGST({label: data.rategst, value: data.rategst})
      setLeadDays(data.LeadDays);
      setValidTill(data.ValidityDate)
      setValidityDate(data.ValidityDate)
      // const validityDate = new Date(data.ValidityDate);
      // const currentDate = new Date()
      // if (validityDate < currentDate){
        
      //   setInvalidRates(true);
      // } else{
      //   setInvalidRates(false)
      // }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else{
    showToastMessage("error", "Rate ID is either 0 or empty. Please check and type again properly.")
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
    await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateRatesData.php/?JsonRateId=${rateId}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonValidityDate=${validTill}&JsonCampaignDurationVisibility=${showCampaignDuration === true ? 1 : 0}&JsonRateGST=${rateGST.value}&DBName=${username}&JsonUnit=${selectedUnit.label}`)
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
      case 'Rate Card Name':
        updatedOptions = [
          ...getDistinctValues('ratename').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "rateName";
        break;
      case 'Type':
        updatedOptions = [
          ...getDistinctValues('adType').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "adType";
      break;
      case 'Category':
        updatedOptions = [
          ...getDistinctValues('typeOfAd').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "typeOfAd";
        break;
      case 'Location':
        updatedOptions = [
          ...getDistinctValues('Location').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "Location";
        break;
        case 'Package':
        updatedOptions = [
          ...getDistinctValues('Package').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "Package";
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
    setRateId("");
    setNewRateName("");
    setNewRateModel(false);
  };  

  const insertNewRate = async() => {
    try{
      if(selectedValues.rateName === null || selectedValues.adType === null || selectedValues.vendorName === null){
        showToastMessage('warning', "Please fill all the fields!");
      } else if(validTill <= 0){
        showToastMessage('warning', "Validity date should 1 or more!")
      } 
      // else if(leadDays <= 0){
      //   showToastMessage('warning', "Lead Days should be more than 0!")
      // } 
      else {
        try{
        await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewRates.php/?JsonRateGST=${rateGST.value}&JsonEntryUser=${username}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignDurationUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonUnits=${selectedUnit.value}&JsonValidityDate=${validTill}&JsonAdType=${selectedValues.adType.value}&JsonAdCategory=&JsonCampaignDurationVisibility=${showCampaignDuration ? 1 : 0}&DBName=${username}&JsonTypeOfAd=${selectedValues.typeOfAd.value}&JsonQuantity=${qty}&JsonLocation=${selectedValues.Location.value}&JsonPackage=${selectedValues.Package.value}&JsonRatePerUnit=${newUnitPrice}`)
        showToastMessage('success', 'Inserted Successfully!')
      
        window.location.reload()
        }catch(error){
          console.error(error)
        }
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

  const handleClearRateId = () => {
    setRateId("");
    setSelectedValues({
      rateName: null,
      adType: null,
      vendorName: null,
      typeOfAd: null,
      Location: null,
      Package: null
    });
    setValidityDays(0);
    setValidityDate(new Date());
    setValidTill("");
    setRateGST(null);
    setLeadDays(0);
    setCampaignDuration("");
    setSelectedCampaignUnits("");
    setShowCampaignDuration(false);
    setStartQty(0);
    setSlabData([]);
    setIsSlabAvailable(false);
    setSelectedUnit(null);
  }
  const packageOptions = getOptions('Package', selectedValues);
  
  return (
    <div className=" mt-8 justify-center">
      
      {/* { modal && (
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
            <div> */}
            <h1 className="font-bold text-3xl text-center mb-8 mr-12 " style={{fontFamily: 'Poppins, sans-serif'}}>Rates Entry</h1>


            {/* text-blue-500 */}
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
                  
                {/* { !isNewRate && (
                    <ToggleButtonGroup
                    color="primary"
                    value={invalidRates ? "invalid" : "valid"}
                    exclusive
                    aria-label="Validity"
                    className={'mb-4'}
                    onChange={(event, newValidity) => setInvalidRates(newValidity === "invalid")}
                  >
                    <ToggleButton value="valid" size='small'
                      className={`capitalize drop-shadow-md ${
                        !invalidRates ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : ""
                      }`}
                      style={!invalidRates ? { color: 'white' }: {color: 'black'}}
                      >Valid Rates</ToggleButton>
                    <ToggleButton value="invalid" size='small'
                      className={`capitalize drop-shadow-md ${
                        invalidRates ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : ""
                      }`}
                      style={invalidRates ? { color: 'white' }: {color: 'black'}}
                      >Invalid Rates</ToggleButton>
                  </ToggleButtonGroup>
                )} */}

                <div>
                <label className='mb-4 text-gray-700 font-semibold'>Search Rate Card</label><br/>
                <input
                  className="p-2 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3"
                  type="number"
                  id="11"
                  name='RateSearchInput'
                  placeholder="Ex. 4000"
                  value={rateId}
                  onChange = {(e) => setRateId(e.target.value)}
                  onFocus={(e) => {e.target.select()}}
                  // oange = {(e) => setSearchingRateId(e.target.value)}
                />
                <Button 
                  className='border' 
                  id='12'
                  name='RatesClearButton'
                  onClick={handleClearRateId}>
                <FontAwesomeIcon icon={faTimesCircle} className='mr-1 w-6 h-6'/>
              </Button>
              </div>

                  {/* Ad Medium of the rate */}
                  {/* <div>
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
                  </div> */}

                    <div>
                      <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Rate Card Name</label>
                      <div className='flex mr-4'>
                        <Select
                          className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          id="13"
                          name="RateCardNameSelect"
                          placeholder="Select Rate Card Name"
                          defaultValue={selectedValues.rateName}
                          value={selectedValues.rateName}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                          options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                        />
                        <button 
                          className='justify-center text-blue-400 ml-7' 
                          onClick={() => {setNewRateModel(true); setNewRateType("Rate Card Name");}}
                          id='14'
                          name='AddRateNameButton'
                        >
                          <MdAddCircle size={28}/>
                        </button>
                      </div>
                    </div>


                  {/* Ad Type of the Rate  */}
                  {/* <div>
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
                  </div> */}

{/* Ad Type of the Rate for GS */}
{/* <div>
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Type</label>
                    <div className='flex mr-4'>
                      <Select
                        className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-6"
                        id="15"
                        name="AdTypeSelect"
                        placeholder="Select Type"
                        defaultValue={selectedValues.adType}
                        value={selectedValues.adType}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                        options={getOptions('adType', selectedValues)}
                      />
                      <button className='justify-center text-blue-400 ml-1' 
                      id='16'
                      name='AddAdTypeButton'
                      onClick={() => {setNewRateModel(true); setNewRateType("Type");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div> */}

                  {/* Ad Category of the rate  */}
                  {/* <div>
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
                  </div> */}

                  <div>
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Category</label>
                    <div className='flex mr-4'>
                      <Select
                        className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-1"
                        id="17"
                        name="AdCategorySelect"
                        placeholder="Select Category"
                        defaultValue={selectedValues.typeOfAd}
                        value={selectedValues.typeOfAd}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'typeOfAd')}
                        options={getOptions('typeOfAd', selectedValues)}
                        // options={filters.typeOfAd}
                      />
                      <button className='justify-center text-blue-400 ml-6' onClick={() => {setNewRateModel(true); setNewRateType("Category");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Type</label>
                    <div className='flex mr-4'>
                      <Select
                        className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-6"
                        id="adTypeSelect"
                        name="adTypeSelect"
                        placeholder="Select Type"
                        defaultValue={selectedValues.adType}
                        value={selectedValues.adType}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                        options={getOptions('adType', selectedValues)}
                      />
                      <button className='justify-center text-blue-400 ml-1' 
                      id='18'
                      name='AddAdCategoryButton'
                      onClick={() => {setNewRateModel(true); setNewRateType("Type");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>

                  

                  {/* Location of the Rate for GS */}
                  <div>
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Location</label>
                    <div className='flex mr-4'>
                      <Select
                        className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-6"
                        id="19"
                        name="LocationSelect"
                        placeholder="Select Location"
                        defaultValue={selectedValues.Location}
                        value={selectedValues.Location}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'Location')}
                        options={getOptions('Location', selectedValues)}
                      />
                      <button className='justify-center text-blue-400 ml-1' 
                      id='20'
                      name='AddLocationButton'
                      onClick={() => {setNewRateModel(true); setNewRateType("Location");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>
                  {/* {filters.package.length > 0 ?  */}
                  
                  {(packageOptions.length > 1 || isNewRate) && (
                  <div>
                  <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Package</label>
                  <div className='flex mr-4'>
                    <Select
                      className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-6"
                      id="21"
                      name="PackageSelect"
                      placeholder="Select Package"
                      defaultValue={selectedValues.Package}
                      value={selectedValues.Package}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'Package')}
                      options={getOptions('Package', selectedValues)}
                    />
                    <button className='justify-center text-blue-400 ml-1' 
                    id='22'
                    name='AddPackageButton'
                    onClick={() => {setNewRateModel(true); setNewRateType("Package");}}>
                      <MdAddCircle size={28}/>
                    </button>
                  </div>
                </div>
                  )}
                <></>
                
                  
                  {/* Choosing the vendor of the rate  */}
                  {/* <div>
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
                  </div> */}

                <div className="mb-6 mt-4 mr-14">
                  <label className="block mb-2 text-gray-700 font-semibold">Vendor</label>
                  <Select
                    className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-5"
                    id="23"
                    name="VendorSelect"
                    placeholder="Select Vendor"
                    value={selectedValues.vendorName}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, 'vendorName')}
                    options={vendors}
                  />
                </div>                  

                  {/* Units of the rate. Ex: Bus, Auto */}
                  {/* <div className='bg-white'>
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
                  </div> */}

                  <div className="mb-8 mr-14">
                  <label className="block mb-2 text-gray-700 font-semibold">Units</label>
                    <Select
                      className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-5"
                      id="24"
                      name="UnitsSelect"
                      placeholder="Select Units"
                      value={selectedUnit}
                      onChange={(selectedOption) => setSelectedUnit(selectedOption)}
                      options={units}
                    />
                  </div>

                    {/* Qty Slab of the rate  */}
                    {/* <div>
                    <label>Quantity Slab</label>
                    <div className='flex mb-4'>
                    
                      <TextField id="qtySlab" variant="outlined" size='small' className='w-52' type='number' defaultValue={qty} onChange={e => setQty(e.target.value)} helperText="Ex: 3 | Means this rate is applicable for Units > 3" onFocus={(e) => {e.target.select()}}/>
                      <button className='justify-center mb-10 ml-3 text-blue-400' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? selectedUnit === "" ? showToastMessage("error", "Select a valid Unit!z") :toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <MdAddCircle size={28}/>
                      </button> */}
                      {/* <IconButton aria-label="Add" className='mb-10' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <AddCircleOutline color='primary'/>
                      </IconButton> */}
                    {/* </div>
                  </div> */}

                    <div>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity Slab</label>
                    <div className='flex mb-4 mr-7'>
                      <TextField 
                        id="25" 
                        name='QuantityText'
                        variant="outlined" 
                        size='small' 
                        className='p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md' 
                        type='number' 
                        defaultValue={qty} 
                        onChange={e => setQty(e.target.value)} 
                        helperText="Ex: 3 | Means this rate is applicable for Units > 3" 
                        onFocus={(e) => {e.target.select()}}/>
                      <button 
                        className='justify-center mb-10 ml-6 text-blue-400' 
                        onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? selectedUnit === "" ? showToastMessage("error", "Select a valid Unit!z") :toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}
                        id='26'
                        name='AddQuantityButton'  
                      >
                        <MdAddCircle size={28}/>
                      </button> 
                      {/* <IconButton aria-label="Add" className='mb-10' onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}>
                        <AddCircleOutline color='primary'/>
                      </IconButton> */}
                    </div>
                  </div> 

                  {/* Slab List Here  */}
                  <div>
                  {(isSlabAvailable && !isNewRate) && (
                    <div className='text-left justify-start'>
                    <h2 className='mb-4 font-bold'>Rate-Slab</h2>
                    <ul className='mb-4'  >
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

                  {/* Campaign Duration Text with Units */}
                  {/* <div>
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
                  </div> */}

<div>
                    <div className='flex mr-16 mt-2'>
                      <input type='checkbox' checked={showCampaignDuration} value={showCampaignDuration} onChange={() => {
                        setShowCampaignDuration(!showCampaignDuration);
                      }}/>
                      <label className='justify-left ml-2 text-gray-700 font-semibold'>Service Duration</label>
                    </div>
                    <div className='mb-8'>
                    {showCampaignDuration && (
                    
                      <div className='flex mr-10'>
                      <TextField id="qtySlab" defaultValue={campaignDuration} variant="outlined" size='small' className='p-0 glass shadow-2xl w-40 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md' type='number' onChange={(e) => {setCampaignDuration(e.target.value)}} onFocus={(e) => e.target.select()}/>
                      <Select
                        className='p-0 glass shadow-2xl w-30 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md '
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
                  {/* <div>
                    <label>Lead Days</label>
                    <div className='flex mb-4'>
                      <TextField id="leadDays" value={leadDays} defaultValue="1" variant="outlined" size='small' className='w-44' type='number' onChange={e => setLeadDays(e.target.value)} onFocus={(e) => {e.target.select()}}/>
                      <p className='ml-4 mt-2'>Day (s)</p>
                    </div>
                  </div> */}

                    <div>
                    <div className='mr-5'>
                    <label className="block mb-2 text-gray-700 font-semibold">Lead Days</label>
                    <div className='flex mb-4 p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-14'>
                      <TextField id="27" name='LeadDaysTextField' value={leadDays} defaultValue="1" variant="outlined" size='small' className='w-44' type='number' onChange={e => setLeadDays(e.target.value)} onFocus={(e) => {e.target.select()}}/>
                      <p className='ml-4 mt-2 '>Day (s)</p>
                    </div>
                    </div>
                  </div>
                  
                  {/* Valid Till Text*/}
                  {/* <div>
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
                    
                </div> */}

              <div className='mr-9 mt-4'>
                  <label className="block mb-2 text-gray-700 font-semibold">Valid Till</label>
                  <div className='flex mb-4 p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-10'>
                    <TextField 
                      id="28"
                      name="ValidTillTextField" 
                      value={validityDays} 
                      onChange={handleValidityChange} 
                      variant="outlined" 
                      size='small' 
                      className='w-36' 
                      type='number' 
                      onFocus={(e) => {e.target.select()}}/>
                    <IconButton aria-label="Add" onClick={() => setShowDatePicker(!showDatePicker)}>
                        <Event color='primary'/>
                      </IconButton>
                    <p className='ml-1 mt-2'>Day (s)</p>
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

                  {/* <div>
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
                  </div> */}

<div className='mr-6 mt-4'>
  <label className="block mb-2 text-gray-700 font-semibold">Rate GST%</label>
  <Select
    className="p-0 glass shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-14"
    id="29"
    name="RateGSTSelect"
    instanceId="RateGST"
    placeholder="Select Rate GST%"
    value={rateGST}
    onChange={(selectedOption) => setRateGST(selectedOption)}
    options={GSTOptions}
  />
</div>
                </div>
                
                <div className="flex items-center justify-center mb-8 mt-11 mr-14">
                  <button className = "bg-red-400 text-white p-2 rounded-full w-24 justify-center" onClick={rejectRates}>
                    <span className='flex flex-row justify-center'><MdDeleteOutline className='mt-1 mr-1'/> Delete</span>
                    </button>
                    {isNewRate ? (
                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center" onClick={insertNewRate}>
                      <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Add</span>
                      </button>
                    ) : (
                      <button className = "bg-green-400 text-white p-2 rounded-full ml-4 w-24 justify-center mr-4" onClick={updateRates}>
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