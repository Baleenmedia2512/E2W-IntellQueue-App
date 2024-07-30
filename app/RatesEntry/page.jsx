'use client'
import { useState, useEffect, useRef  } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import { RemoveCircleOutline, Event } from '@mui/icons-material';
import { TextField } from '@mui/material';
// import Snackbar from '@mui/material/Snackbar';
// import MuiAlert from '@mui/material/Alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FetchRateSeachTerm } from '../api/FetchAPI';
import { MdDeleteOutline , MdOutlineSave, MdAddCircle, MdOutlineClearAll} from "react-icons/md";
import { formattedMargin } from '../adDetails/ad-Details';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./page.css"
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/store';
import { setSelectedValues, setRateId, setSelectedUnit, setRateGST, setSlabData, setStartQty, resetRatesData} from '@/redux/features/rate-slice';
import { useDispatch } from 'react-redux';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import { Carousel } from 'primereact/carousel';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {

  // Check if localStorage contains a username
  // const username = "GraceScans"
  const dispatch = useDispatch()
  const validityRef = useRef();
  const unitRef = useRef();
  const qtyRef = useRef();
  const ldRef = useRef();
  const dbName = useAppSelector(state => state.authSlice.companyName);
  const companyName = "Baleen Test";
  // const companyName = useAppSelector(state => state.authSlice.companyName);
  const username = useAppSelector(state => state.authSlice.userName);
  const selectedValues = useAppSelector(state => state.rateSlice.selectedValues);
  const rateId = useAppSelector(state => state.rateSlice.rateId)
  const selectedUnit = useAppSelector(state => state.rateSlice.selectedUnit);  
  const rateGST = useAppSelector(state => state.rateSlice.rateGST);
  const slabData = useAppSelector(state => state.rateSlice.slabData);
  const [ratesData, setRatesData] = useState([]);
  const [validityDate, setValidityDate] = useState(new Date());
  //const [selectedUnit, setSelectedUnit] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [qty, setQty] = useState("")
  const [campaignDuration, setCampaignDuration] = useState("");
  const [leadDays, setLeadDays] = useState(0);
  const [validTill, setValidTill] = useState("");
  const [campaignUnits, setCampaignUnits] = useState([]) 
  const [selectedCampaignUnits, setSelectedCampaignUnits] = useState("")
  //const [slabData, setSlabData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  //const [qty, setQty] = useState(0)
  const [validityDays, setValidityDays] = useState(0);
  const [ratesSearchSuggestion, setRatesSearchSuggestion] = useState([]);
  const [units, setUnits] = useState([])
  const [newUnitPrice, setNewUnitPrice] = useState("")
  const [isSlabAvailable, setIsSlabAvailable] = useState(false)
  const [modal, setModal] = useState(false);
  //const [startQty, setStartQty] = useState([])
  const [unitPrice, setUnitPrice] = useState(0);
  const [showCampaignDuration, setShowCampaignDuration] = useState(false)
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [toast, setToast] = useState(false); //toast
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isQtySlab, setIsQtySlab] = useState(false)
  //const [rateId, setRateId] = useState("");
  const [invalidRates, setInvalidRates] = useState(false);
  const [isValidityDays, setIsValidityDays] = useState(false);
  const [isLeadDays, setIsLeadDays] = useState(false)
  const [invalidRatesData, setInvalidRatesData] = useState([]);
  const [validRatesData, setValidRatesData] = useState([]);
  const [newRateModel, setNewRateModel] = useState(false);
  const [isNewRate, setIsNewRate] = useState(false);
  const [newRateType, setNewRateType] = useState("");
  const [newRateName, setNewRateName] = useState("");
  // const [rateGST, setRateGST] = useState("");
  const [tempSlabData, setTempSlabData] = useState([]);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [initialState, setInitialState] = useState({ validityDays: '', rateGST: "" });
  const [maxRateID, setMaxRateID] = useState("");
  const [elementsToHide, setElementsToHide] = useState([])
  const [elementsToShow, setElementsToShow] = useState([]);
  const [isUnitsSelected, setIsUnitsSelected] = useState(false);
  const [isQty, setIsQty] = useState(false);
  const [combinedSlabData, setCombinedSlabData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [rateSearchTerm,setRateSearchTerm] = useState("");
  const elementsNeeded = [""];
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  

  const [filters, setFilters] = useState({
    rateName: [],
    typeOfAd: [],
    adType: [],
    location: [],
    vendorName: [],
    package: []
  });

  // const [selectedValues, setSelectedValues] = useState({
  //   rateName: "",
  //   typeOfAd: "",
  //   adType: "",
  //   Location: "",
  //   vendorName: "",
  //   Package: ""
  // });

  // Function to toggle the modal
  const toggleModal = () => {
      setModal((prevState) => !prevState);
  }

  useEffect(() => {
    setInitialState({ validityDays, rateGST });
  }, []);

  useEffect(() => {
    const isChanged = 
      validityDays !== initialState.validityDays || 
      rateGST !== initialState.rateGST;
    setIsFormChanged(isChanged);
    
   
  }, [validityDays, rateGST, initialState]);
  
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
      fetchMaxRateID();
      elementsToHideList()
    }
  }, []);

  const handleItemClick = (data) => {
    setEditModal(true);
    setQty(data.StartQty)
    setNewUnitPrice(data.UnitPrice);
    setSelectedUnitId(data.Id);
  };

  useEffect(() => {
    //searching elements to Hide from database

    elementsToHide.forEach((name) => {
      const elements = document.getElementsByName(name);
      elements.forEach((element) => {
        element.style.display = 'none'; // Hide the element
      });
    });
  }, [elementsToHide])

  useEffect(() => {
    // Show elements from the database
    if(elementsToShow.length > 0){
          elementsToShow.forEach((name) => {
            const elements = document.getElementsByName(name);
            elements.forEach((element) => {
              element.style.display = ''; // Reset the display property to show the element
            });
          })
    }
  }, [elementsToShow]);

  const insertQtySlab = async(Qty, UnitPrice) => {
    setEditMode(true)
    const price = parseFloat(UnitPrice);
    if (!isNaN(price)) {
      setTempSlabData((prevSlabData) => {
        // Check if a slab with the same StartQty already exists
        const existingSlabIndex = prevSlabData.findIndex((slab) => slab.StartQty === Qty);
    
        if (existingSlabIndex !== -1) {
          // Update the existing slab with the new UnitPrice
          const updatedSlabData = [...prevSlabData];
          updatedSlabData[existingSlabIndex].UnitPrice = price;
          return updatedSlabData;
        } else {
          // Add the new slab
          return [...prevSlabData, { StartQty: Qty, UnitPrice: price }];
        }
      });
      toggleModal();
      setIsSlabAvailable(true);
    // if (isNewRate) {
     
    //   setIsSlabAvailable(true);
    // }
    
    // if(newUnitPrice > 0){
    //   console.log(tempSlabData.Qty, tempSlabData.newUnitPrice)
    //   try{
    //     if(!startQty.includes(Number(Qty))){
    //       await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${username}&JsonRateId=${rateId}&JsonQty=${tempSlabData.Qty}&JsonUnitPrice=${tempSlabData.newUnitPrice}&JsonUnit=${selectedUnit.label}&DBName=${username}`)
    //       fetchQtySlab();
    //       setQty(0)
    //       toggleModal();
    //       setNewUnitPrice("");
    //     } else{
    //       updateQtySlab()
    //     }
    //   }catch(error){
    //     console.error(error)
    //   }
    } else {
      // showToastMessage("error", "Enter valid Unit Price!")
      setToastMessage('Enter valid Unit Price!');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
   
  }

  useEffect(() => {
    if(combinedSlabData.length === 0){
      elementsToShowList("Show");
    }
  },[combinedSlabData])
//   const insertQtySlab = async() => {
//   if (isNewRate) {
//     const price = parseFloat(newUnitPrice);
//     if (!isNaN(price)) {
//       setTempSlabData([...tempSlabData, { qty, newUnitPrice: price }]);
//     }
//     setIsSlabAvailable(true);
//     toggleModal();
//   }

//   if (newUnitPrice > 0) {
//     try {
//       const slabsData = tempSlabData.map(({ qty, newUnitPrice }) => ({
//         Qty: qty,
//         UnitPrice: newUnitPrice
//       }));

//       const response = await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           slabs: slabsData,
//           JsonEntryUser: username,
//           DBName: username,
//           JsonUnit: selectedUnit.label
//         })
//       });

//       const { message, RateId } = await response.json(); // Assuming the PHP script returns the message and RateId

//       fetchQtySlab();
//       setQty(0);
//       toggleModal();
//       setNewUnitPrice("");

//       console.log(message); // Log the success message
//       console.log("RateId:", RateId); // Log the returned RateId
//     } catch (error) {
//       console.error(error);
//     }
//   } else {
//     showToastMessage("error", "Enter valid Unit Price!");
//   }
// }
  
  const addQtySlab = async() => {

    if (newUnitPrice > 0 && qty > 0) {
    try{
      await Promise.all(combinedSlabData.map(async(item) => {
        try{
          const response = await fetch(`https://orders.baleenmedia.com/API/Media/AddQtySlab.php/?JsonEntryUser=${username}&JsonRateId=${rateId === "" ? maxRateID : rateId}&JsonQty=${item.StartQty}&JsonUnitPrice=${item.UnitPrice}&JsonUnit=${selectedUnit.label}&JsonDBName=${companyName}`);
          const result = await response.json();
          if(result === "Failed to Insert" || result === "Failed to Update"){
            // showToastMessage("Error", "Error while updating data")
            setToastMessage('Error while updating data.');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
              setToast(false);
            }, 2000);
          }else{
            // showToastMessage('success', result);
          //   setSuccessMessage(result);
          //   setTimeout(() => {
          //   setSuccessMessage('');
          // }, 2000);
            fetchQtySlab();
            setNewUnitPrice("");  
            setTempSlabData([]);
          }
          
        }catch(insertError){
          console.error("Error while inserting slab: " + insertError);
        }
      }))
    }catch(error){
      console.error(error);
    }
  }else{
    return
  }
  }

  const updateQtySlab = async() => {
   
    if (newUnitPrice > 0 && qty > 0) {
      try {
        await Promise.all(combinedSlabData.map(async (item) => {
          try {
            const response = await fetch(`https://orders.baleenmedia.com/API/Media/UpdateQtySlab.php/?JsonEntryUser=${username}&JsonRateId=${rateId}&JsonQty=${item.StartQty}&JsonUnitPrice=${item.UnitPrice}&JsonUnit=${selectedUnit.label}&JsonDBName=${companyName}`);
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            const responseData = await response.json();
            fetchQtySlab();
            setEditModal(false);
            setNewUnitPrice("");
            setTempSlabData([]);
            // showToastMessage('success', responseData.message)
          //   setSuccessMessage(responseData.message);
          //     setTimeout(() => {
          //   setSuccessMessage('');
          // }, 2000);
          } catch (updateError) {
            console.error(`Failed to update quantity slab`, updateError);
          }
        }));
      } catch (error) {
        console.error('An error occurred while processing combined slab data:', error);
      }
    } else {
      return
    }
   }

  const removeQtySlab = async(Qty, index) => {
    if (isNewRate) {
      //setIsSlabAvailable(false);
      //setNewUnitPrice("");
      setCombinedSlabData(combinedSlabData.filter((_, i) => i !== index));
      if(combinedSlabData.length === 0){
        setTempSlabData([])
        dispatch(setSlabData([]));
      }
    } else {
      const response = await fetch(`https://orders.baleenmedia.com/API/Media/RemoveQtySlab.php/?JsonRateId=${rateId}&JsonQty=${Qty}&JsonDBName=${companyName}`);
      const data = await response.json();
      if(data === 'No rows updated'){
        setCombinedSlabData(combinedSlabData.filter((_, i) => i !== index));
        if(slabData.length > 0 ){
          setSlabData(slabData.filter((_, i) => i !== index))
        } else if(tempSlabData.length > 0){
          setTempSlabData(tempSlabData.filter((_, i) => i !== index))
        }

      } else{
        //setTempSlabData(tempSlabData.filter((_, i) => i !== index));
        fetchQtySlab();
      }
  }
  if(combinedSlabData.length === 0 && tempSlabData.length === 0 && slabData.length === 0){
    elementsToShowList("Show")
  }
}

  const fetchMaxRateID = async () => {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxRateID.php/?JsonDBName=${companyName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMaxRateID(data);
      
    } catch (error) {
      console.error(error);
    }
  };

  const fetchQtySlab = async () => {
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId === "" ? maxRateID : rateId}&JsonDBName=${companyName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      dispatch(setSlabData(data));
      if(data){
        setIsSlabAvailable(true);
      }
      const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
      const firstSelectedSlab = sortedData[0];
      if(firstSelectedSlab){
        setUnitPrice(firstSelectedSlab.UnitPrice);
        dispatch(setSelectedUnit({label: firstSelectedSlab.Unit, value: firstSelectedSlab.Unit}));
        dispatch(setStartQty(firstSelectedSlab.StartQty));
        //setStartQty(sortedData.map((slab) => Number(slab.StartQty)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if(rateId > 0){
      handleRateId(rateId)    
    }
    fetchQtySlab();
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
    const res = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAllVendor.php/?JsonAdMedium=${adMed}&JsonAdType=${adTyp}&JsonDBName=${companyName}`)
    if(!res.ok){
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    const data = await res.json();
    setVendors(data);
  };

  const fetchUnits = async () => {
    try {
      if (selectedValues.rateName && selectedValues.adType) {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchUnits.php/?JsonAdMedium=${selectedValues.rateName.label}&JsonAdType=${selectedValues.adType.label}&JsonDBName=${companyName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUnits(data);
    }else{
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchUnits.php/?JsonDBName=${companyName}`);
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

  useEffect(() => {
    fetchUnits();
    fetchAllVendor();
    setTempSlabData([])
    fetchQtySlab()
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
  // const getOptions = (filterKey, selectedValues) => {
  //   const filteredData = ratesData.filter(item => {
  //     return Object.entries(selectedValues).every(([key, value]) =>
  //       key === filterKey || !value || item[key] === value.value
  //     );
  //   });

  //   const distinctValues = [...new Set(ratesData.map(item => item[filterKey]))];
  //   return distinctValues.sort().map(value => ({ value, label: value }));
  // };

  // const getOptions = (filterKey, selectedValues) => {
  //   const filteredData = ratesData.filter(item => {
  //     return Object.entries(selectedValues).every(([key, value]) =>
  //       !value || item[key] === value
  //     );
  //   });
  
  //   const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  //   return distinctValues.sort().map(value => ({ value, label: value }));
  // };

  //filtering the options based on previous values
  const getOptions = (filterKey, previousKey) => {
    var filteredData = []; 
    if(selectedValues["rateName"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "typeOfAd"){ //Check whether the selected key is valid or not
      filteredData = ratesData.filter(item => 
        !selectedValues["rateName"]['value'] || item["rateName"] === selectedValues["rateName"]['value']
        );
      
      // Extract distinct values of the specified filterKey from the filtered data
      const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
    
      // Return the distinct values sorted and mapped to objects with value and label properties
      return distinctValues.sort().map(value => ({ value, label: value }));
    } else if(selectedValues["typeOfAd"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "adType"){ //Check whether the selected key is valid or not
      filteredData = ratesData.filter(item => 
        (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
        (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value)
      );
    
      // Extract distinct values of the specified filterKey from the filtered data
      const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  
      // Return the distinct values sorted and mapped to objects with value and label properties
      return distinctValues.sort().map(value => ({ value, label: value }));
    } else if(selectedValues["adType"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "Location"){ //Check whether the selected key is valid or not
      filteredData = ratesData.filter(item => 
        (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
        (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value) &&
        (!selectedValues.adType.value || item.adType === selectedValues.adType.value) 
      );
    
      // Extract distinct values of the specified filterKey from the filtered data
      const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  
      // Return the distinct values sorted and mapped to objects with value and label properties
      return distinctValues.sort().map(value => ({ value, label: value }));
    } else if(selectedValues["Location"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "Package"){ //Check whether the selected key is valid or not
      filteredData = ratesData.filter(item => 
        (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
        (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value) &&
        (!selectedValues.adType.value || item.adType === selectedValues.adType.value) &&
        (!selectedValues.Location.value || item.Location === selectedValues.Location.value) 
      );
    
      // Extract distinct values of the specified filterKey from the filtered data
      const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
  
      // Return the distinct values sorted and mapped to objects with value and label properties
      return distinctValues.sort().map(value => ({ value, label: value }));
    } else if(elementsToHide.includes("RatesCategorySelect")){
      
      const filteredData = ratesData.filter(item => 
        !selectedValues.rateName.value || item.rateName === selectedValues.rateName.value //filter based on the previous key value
        );
         // Extract distinct values of the specified filterKey from the filtered data
      const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
    
      // Return the distinct values sorted and mapped to objects with value and label properties
      return distinctValues.sort().map(value => ({ value, label: value }));
    }else{
      return;
    }
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
    dispatch(setRateId(""));
    setIsNewRate(true);
    if (filterKey === 'rateName'){
      dispatch(setSelectedValues({
        [filterKey]: selectedOption,
        adType: "",
        adCategory: "",
        vendorName: "",
        Package: "",
        Location: "",
        typeOfAd:""
      }));
    } else if(filterKey === 'typeOfAd'){
      dispatch(setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        adType: "",
        adCategory: "",
        vendorName: "",
        Package: "",
        Location: ""
      }))
    } else if(filterKey === 'adType'){
      dispatch(setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        vendorName: "",
        Package: "",
        Location: ""
      }))
    } else if(filterKey === 'Location'){
      dispatch(setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        Package: "",
        vendorName: "",
        
      }))
    } else if(filterKey === 'Package'){
      dispatch(setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        vendorName: ""
      }))
    } else {
      // Update the selected values
      dispatch(setSelectedValues({
      ...selectedValues,
      [filterKey]: selectedOption
    }));
    }
    
    // Update the filters
    setFilters({
      ...filters,
      [filterKey]: selectedOption.value
    });

var selectedRate = '';
    // Add logic to fetch rateId after selecting Vendor
  if (filterKey === 'adType' && selectedOption) {
    if(elementsToHide.includes("RatesCategorySelect")){
      selectedRate = ratesData.find(item =>
        item.rateName === selectedValues.rateName.value &&
        item.adType === selectedOption.value 
    )}else{
      selectedRate = ratesData.find(item =>
      item.rateName === selectedValues.rateName.value &&
      item.typeOfAd === selectedValues.typeOfAd.value && 
      item.adType === selectedOption.value 
    );
  }
  }

  if (filterKey === 'Location' && selectedOption) {
    selectedRate = ratesData.find(item =>
    item.rateName === selectedValues.rateName.value &&
    item.typeOfAd === selectedValues.typeOfAd.value && 
    item.adType === selectedValues.adType.value &&
    item.Location === selectedOption.value 
  );

}
    // if (filterKey === 'Location' && selectedOption) {
    //     selectedRate = ratesData.find(item =>
    //     item.rateName === selectedValues.rateName.value &&
    //     item.Location === selectedOption.value 
  
    //   );}
      if (filterKey === 'Package' && selectedOption) {
          selectedRate = ratesData.find(item =>
          item.rateName === selectedValues.rateName.value &&
          item.typeOfAd === selectedValues.typeOfAd.value && 
          item.adType === selectedValues.adType.value &&
          item.Location === selectedValues.Location.value &&
          item.Package === selectedOption.value 
        );}

    if (selectedRate) {
      dispatch(setRateId(selectedRate.RateID));
      setCampaignDuration(selectedRate['CampaignDuration(in Days)']);
      if(selectedRate.campaignDurationVisibility === 1){
        setShowCampaignDuration(true)
      }
      setSelectedCampaignUnits({label: selectedRate.CampaignDurationUnit, value: selectedRate.CampaignDurationUnit})
      // setRateGST({label: selectedRate.rategst, value: selectedRate.rategst})
      dispatch(setRateGST({label: selectedRate.rategst, value: selectedRate.rategst}));
      setLeadDays(selectedRate.LeadDays);
      setValidTill(selectedRate.ValidityDate)
      setValidityDate(selectedRate.ValidityDate)
    }
  
  if (filterKey !== 'vendorName'){
    setIsNewRate(false)
  }
  }
  useEffect(() => {
    invalidRates ? setRatesData(invalidRatesData) : setRatesData(validRatesData)
  },[invalidRates])

  // const packageOptions = getOptions('Package', selectedValues);

  // Merge slabData and tempSlabData
  useEffect(() => {
    setCombinedSlabData(slabData.concat(tempSlabData));
  }, [slabData, tempSlabData]);

  useEffect(() => {
    if(isNewRate){
      elementsToShowList("Show");
    }
    if(!isNewRate){
      if(slabData.length < 1 && selectedValues.adType !== ""){
        elementsToShowList("Show");
      } else{
        elementsToShowList()
      }
    }
  },[slabData, tempSlabData, isNewRate])

  const fetchRates = async () => {
  
    try {
      const res = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAllRates.php/?JsonDBName=${companyName}`);
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

  const handleRateId = async (selectedRateId) => {
    if(selectedRateId > 0){
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAdMediumTypeCategoryVendor.php/?JsonRateId=${selectedRateId}&JsonDBName=${companyName}`);
      
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
        dispatch(setSelectedValues({
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
        }))

      dispatch(setRateId(data.RateID));
      setCampaignDuration(data['CampaignDuration(in Days)']);
      if(data.campaignDurationVisibility === 1){
        setShowCampaignDuration(true)
      } else{
        setShowCampaignDuration(false)
      }
      setSelectedCampaignUnits({label: data.CampaignDurationUnit, value: data.CampaignDurationUnit})
      // setRateGST({label: data.rategst, value: data.rategst})
      dispatch(setRateGST({label: data.rategst, value: data.rategst}));
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
    // showToastMessage("error", "Rate ID is either 0 or empty. Please check and type again properly.")
    setToastMessage('Rate ID is either 0 or empty. Please check and type again properly.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
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
  
  const updateRates = async (e) => {
    e.preventDefault()
    if(editMode){
      {elementsToShow.length > 0  ? addQtySlab() : updateQtySlab();}
      if(!elementsToHide.includes("RatesLeadDaysTextField") && leadDays <= 0){
        setIsLeadDays(true)
      } else if(selectedUnit === ""){
        setIsUnitsSelected(true)
      } else if(combinedSlabData.length === 0){
        setIsQtySlab(true)
      }else if(validityDays <= 0) {
        setIsValidityDays(true);
      }else{
      if(selectedValues.rateName && selectedValues.adType && validityDays > 0){
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateRatesData.php/?JsonRateId=${rateId}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignUnit=${selectedCampaignUnits.value}&JsonLeadDays=${leadDays}&JsonValidityDate=${validTill}&JsonCampaignDurationVisibility=${showCampaignDuration === true ? 1 : 0}&JsonRateGST=${rateGST.value}&JsonDBName=${companyName}&JsonUnit=${selectedUnit.label}`);
    
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setEditMode(false);
        // showToastMessage('success', 'Updated Successfully!');
        setSuccessMessage('Updated Successfully! ' + data.message);
          setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
      // window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      // showToastMessage('error', error.message);
      setToastMessage(error.message);
      setSeverity('error');
      setToast(true);
      
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
  } else{
    if(validityDays < 1){
      setIsValidityDays(true)
    }else{
      // showToastMessage('warning', 'Please fill all the necessary fields to Update!')
      setToastMessage('Please fill the necessary fields to Update!.');
      setSeverity('error');
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
  }}}else{
      setToastMessage("No changes to update!")
      setSeverity('warning')
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
  }
  };
  

  const rejectRates = async(e) => {
    e.preventDefault()
    try{
    await fetch(`https://www.orders.baleenmedia.com/API/Media/DeleteRates.php/?JsonRateId=${rateId}&JsonDBName=${companyName  }`)
    // showToastMessage('success', 'Rejected Successfully!')
    setSuccessMessage('Rejected Successfully!');
        setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
    handleClearRateId();
    fetchRates();
    } catch(error){
      console.error(error);
    }
  }

  const handleDateChange = (event) => {
    const parsedDate1 = new Date(event);
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

    setValidityDate(parsedDate1);
  };
  
  const handleSetNewRateName = () => {
    // Add the new rate name to the options based on the newRateType
    let updatedOptions = [];
    let changedRate = "";
  
    switch (newRateType) {
      case 'Rate Card Name':
        if (getDistinctValues('rateName').map(value => value.toLowerCase()).includes(newRateName.toLowerCase())) {
          setNewRateName("");
          setNewRateModel(false);
          setToastMessage('Rate Name already exists');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          },3000);
          return
        };
        updatedOptions = [
          ...getDistinctValues('rateName').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "rateName";
        break;
      case 'Type':
        if(selectedValues.rateName === ""){
          setNewRateName("");
          setNewRateModel(false);
          setToastMessage('Select a valid Rate Name or add a new Rate Name');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          },3000);
          return
        }
        if (getOptions('adType').map(value => value.value.toLowerCase()).includes(newRateName.toLowerCase())) {
          setNewRateName("");
          setNewRateModel(false);
          setToastMessage('Ad Type already exists');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          },3000);
          return
        };
        updatedOptions = [
          ...getDistinctValues('adType').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "adType";
      break;
      case 'Category':
        if (getOptions('typeOfAd').map(value => value.value.toLowerCase()).includes(newRateName.toLowerCase())) {
          setNewRateName("");
          setNewRateModel(false);
          setToastMessage('Ad Category already exists');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          },3000);
          return
        };;
        updatedOptions = [
          ...getDistinctValues('typeOfAd').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "typeOfAd";
        break;
      case 'Location':
        if (getOptions('Location').map(value => value.value.toLowerCase()).includes(newRateName.toLowerCase())) {
          setNewRateName("");
          setNewRateModel(false);
          setToastMessage('Location already exists');
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          },3000);
          return
        };;
        updatedOptions = [
          ...getDistinctValues('Location').map((value) => ({ value, label: value })),
          { value: newRateName, label: newRateName },
        ];
        changedRate = "Location";
        break;
        case 'Package':
          if (getOptions('Package').map(value => value.value.toLowerCase()).includes(newRateName.toLowerCase())) {
            setNewRateName("");
            setNewRateModel(false);
            setToastMessage('Package already exists');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
              setToast(false);
            },3000);
            return
          };;
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
  
    dispatch(setSelectedValues({
      ...selectedValues,
      [changedRate]: {
        label: newRateName,
        value: newRateName
      }
    }));
    // Close the newRateModel modal
    setIsNewRate(true);
    dispatch(setRateId(""));
    setNewRateName("");
    setIsQtySlab(false);
    elementsToShowList("Show")
    setNewRateModel(false);
  };  

  useEffect(() => {
    const setVendor = () => {
      if(elementsToHide.includes("RatesVendorSelect") && selectedValues.vendorName === ""){
        dispatch(setSelectedValues({
          ...selectedValues,
          vendorName: {
            label: 'Self',
            value: 'Self'
          }
        }))
      }
    }
    setVendor()
  }, [selectedValues])

  // const insertNewRate = async() => {
  //   try{
  //     if(selectedValues.rateName === null || selectedValues.adType === null || selectedValues.vendorName === null){
  //       showToastMessage('warning', "Please fill all the fields!");
  //     } else if(validTill <= 0){
  //       showToastMessage('warning', "Validity date should 1 or more!")
  //     } 
  //     // else if(leadDays <= 0){
  //     //   showToastMessage('warning', "Lead Days should be more than 0!")
  //     // } 
  //     else {
  //       try{
  //       const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewRates.php/?JsonRateGST=${rateGST ? rateGST.value : ''}&JsonEntryUser=${username}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignDurationUnit=${selectedCampaignUnits ? selectedCampaignUnits.value : ''}&JsonLeadDays=${leadDays}&JsonUnits=${selectedUnit ? selectedUnit.value : ''}&JsonValidityDate=${validTill}&JsonAdType=${selectedValues.adType.value}&JsonAdCategory=${selectedValues.Location ? selectedValues.Location.value : ''}:${selectedValues.Package ? selectedValues.Package.value : ''}&JsonCampaignDurationVisibility=${showCampaignDuration ? 1 : 0}&DBName=${username}&JsonTypeOfAd=${selectedValues.typeOfAd ? selectedValues.typeOfAd.value : ''}&JsonQuantity=${qty}&JsonLocation=${selectedValues.Location ? selectedValues.Location.value : ''}&JsonPackage=${selectedValues.Package ? selectedValues.Package.value : ''}&JsonRatePerUnit=${newUnitPrice}`)
  //       const data = await response.json();

  //       showToastMessage('success', 'Inserted Successfully!' + data)
  //       console.log(data)
  //       // window.location.reload()
  //       }catch(error){
  //         console.error(error)
  //       }
  //     }
  //   } catch(error){
      
  //       console.error(error);
  //   }
  // }

  const elementsToHideList = () => {
    try{
      fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
        .then((response) => response.json())
        .then((data) => setElementsToHide(data));
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  const elementsToShowList = (status) => {
    if(status === "Show"){
      setElementsToShow(["RatesUnitsSelect", "RatesQuantityText"]);
    }else{
      setElementsToShow([]);
      elementsToHideList();
    }
  }

  useEffect(() => {
    if (isValidityDays) {
      validityRef.current.focus();
    }
    if(isUnitsSelected){
      unitRef.current.focus();
    }
    if(isQty || isQtySlab){
      qtyRef.current.focus()
    }
    if(isLeadDays) {
      ldRef.current.focus()
    }
  }, [isValidityDays, isUnitsSelected, isQty, isLeadDays, isQtySlab]);

  const insertNewRate = async (e) => {
    e.preventDefault();
    try {
        if (selectedValues.rateName === null || selectedValues.adType === null || selectedValues.vendorName === null) {
            // showToastMessage('warning', "Please fill all the fields!");
            setToastMessage('Please fill all the fields!');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
              setToast(false);
            }, 2000);
        } else if(selectedUnit === ""){
          setIsUnitsSelected(true)
        } else if(combinedSlabData.length === 0){
          setIsQtySlab(true);
        }else if (validityDays <= 0) {
            setIsValidityDays(true);
          } else if(!elementsToHide.includes("RatesLeadDaysTextField") && leadDays <= 0){
            setIsLeadDays(true)
        }else { 
            try {
              const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddNewRates.php/?JsonRateGST=${rateGST ? rateGST.value : ''}&JsonEntryUser=${username}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCampaignDuration=${campaignDuration}&JsonCampaignDurationUnit=${selectedCampaignUnits ? selectedCampaignUnits.value : ''}&JsonLeadDays=${leadDays}&JsonUnits=${selectedUnit ? selectedUnit.value : ''}&JsonValidityDate=${validTill}&JsonAdType=${selectedValues.adType.value}&JsonAdCategory=${selectedValues.Location ? selectedValues.Location.value : ''}${selectedValues.Package ? ':' + selectedValues.Package.value : ''}&JsonCampaignDurationVisibility=${showCampaignDuration ? 1 : 0}&JsonDBName=${companyName}&JsonTypeOfAd=${selectedValues.typeOfAd ? selectedValues.typeOfAd.value : ''}&JsonQuantity=${combinedSlabData[0].StartQty}&JsonLocation=${selectedValues.Location ? selectedValues.Location.value : ''}&JsonPackage=${selectedValues.Package ? selectedValues.Package.value : ''}&JsonRatePerUnit=${combinedSlabData[0].UnitPrice}`)
                const data = await response.json();
                // showToastMessage('success', 'Inserted Successfully!');
                setSuccessMessage('Rate Card Added Successfully!');
                setTimeout(() => {
                setSuccessMessage('');
              }, 2000);
                // Setting the new Rate into Old Rate
                setIsNewRate(false);
                fetchMaxRateID()
                fetchRates()
                fetchQtySlab()
                setTempSlabData([])
                setEditMode(false)
            } catch (error) {
                console.error(error);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

const handleRateSearch = async(e) =>{
  setRateSearchTerm(e.target.value);
  const searchSuggestions = await FetchRateSeachTerm(companyName, e.target.value);
  setRatesSearchSuggestion(searchSuggestions);
}

const updateSlabData = (qty, newUnitPrice) => {
  
  if(tempSlabData.length > 0){
  const updatedData = tempSlabData.map((data) => {
    if (data.StartQty === qty) {
      return { ...data, newUnitPrice };
    }
    
    return data;
  });

  setTempSlabData(updatedData);
} else {
  const updatedData = slabData.map((data) => {
    if (data.StartQty === qty) {
      return { ...data, UnitPrice: newUnitPrice };
    }
    return data;
  });
  setIsQtySlab(false)
  dispatch(setSlabData(updatedData));
}
  setEditMode(true);
  setEditModal(false);
};

  const handleValidityChange = (e) => {
    setIsValidityDays(false)
    setEditMode(true)
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
    setEditMode(false)
    setRateSearchTerm("")
    dispatch(setRateId(""));
    dispatch(setSelectedValues({
      rateName: "",
      adType: "",
      vendorName: "",
      typeOfAd: "",
      Location: "",
      Package: ""
    }));
    setValidityDays(0);
    setValidityDate(new Date());
    setValidTill("");
    dispatch(setRateGST(null));
    // setRateGST(null);
    setLeadDays(0);
    setCampaignDuration("");
    setSelectedCampaignUnits("");
    setShowCampaignDuration(false);
    dispatch(setStartQty(0));
    dispatch(setSlabData([]));
    setIsSlabAvailable(false);
    dispatch(setSelectedUnit(null));
    setQty(0);
    setUnitPrice(0);
    setNewUnitPrice(0);
    setTempSlabData([]);
  }

  const handleKeyDown = (event) => {
    if (
      !/[0-9]/.test(event.key) && // Allow numbers
      event.key !== 'Backspace' && // Allow backspace
      event.key !== 'Delete' && // Allow delete
      event.key !== 'ArrowLeft' && // Allow left arrow
      event.key !== 'ArrowRight' && // Allow right arrow
      event.key !== 'Tab' // Allow tab
    ) {
      event.preventDefault();
    }
  }

  const handleRateSelection = (e) => {
    const selectedRate = e.target.value;
    const selectedRateId = selectedRate.split('-')[0];
    setRatesSearchSuggestion([]);
    setRateSearchTerm(e.target.value);
    handleRateId(selectedRateId)
    setRateId(selectedRateId)
  }

  return (
    
    <div className="flex items-center justify-center min-h-screen bg-gray-100 mb-14 p-4">
            {/* text-blue-500 */}
      <Dialog open={modal} onClose={toggleModal} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Add Price</DialogTitle>
        <DialogContent>
          <div className="relative">
            <h3 className="block mb-1 font-medium">Enter Slab Rates for {qty}+ Quantities</h3>
            <TextField 
              id="ratePerUnit" 
              defaultValue={newUnitPrice} 
              label="Slab Rate" 
              variant="outlined" 
              size='small' 
              className={`w-full px-4 py-2 border mb-2 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
              type='number' 
              onChange={(e) => {setNewUnitPrice(e.target.value)}}
            />
            <DialogActions className='mt-2'>
              <Button variant="contained" color='primary' onClick={() => insertQtySlab(qty, newUnitPrice)}>Submit</Button>
            </DialogActions>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={editModal} onClose={toggleModal} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Update Price</DialogTitle>
        <DialogContent>
          <div className="relative p-2">
            <h3 className="mb-4 font-medium">Enter the Slab Rate of the provided Quantity Slab</h3>
            <div className='mb-4'>
              <TextField 
                id="ratePerUnit" 
                defaultValue={qty} 
                label="Slab Quantity" 
                variant="outlined" 
                size='small' 
                className='block w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 mb-4'
                type='number' 
                onChange={(e) => {dispatch(setQty(e.target.value))}} 
                disabled  
                onFocus={event => event.target.select()}
              />
            </div>
            <TextField 
              id="ratePerUnit" 
              defaultValue={newUnitPrice} 
              label="Slab Rate" 
              variant="outlined" 
              size='small'  
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`} 
              type='number' 
              onChange={(e) => {setNewUnitPrice(e.target.value)}} 
              onFocus={event => event.target.select()}
            />
            </div>
          </DialogContent>
          <DialogActions className='mb-4'>
            <Button variant="contained" color='primary' onClick={() => updateSlabData(qty, newUnitPrice)}>Submit</Button>
          </DialogActions>
      </Dialog>
      <Dialog open={newRateModel} onClose={() => setNewRateModel(!newRateModel)} fullWidth={true} maxWidth='sm'>
        <DialogTitle>Add New Rate</DialogTitle>
        <DialogContent>
          <div className="relative">
            <h3 className='normal-label mb-4 text-black'>Enter new {newRateType}</h3>
            <TextField 
              id="newRateType" 
              defaultValue={newRateName} 
              label={newRateType} 
              variant="outlined" 
              size='small' 
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`} 
              onChange={(e) => {setNewRateName(e.target.value)}}
              onFocus={event => event.target.select()}
            />
            </div>
            </DialogContent>
            <DialogActions className='mb-4'>
              <Button color = 'primary' variant="contained" onClick={() => handleSetNewRateName()}>Submit</Button>
            </DialogActions>
      </Dialog>
            <div className="w-full ">
  <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-500 mb-1">Rates Entry</h2>
        <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4">Add your rates here</p>
      </div>
      </div>

      {/* { editModal && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={() => {}} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
            
            
            </div>
          </div>
      )} */}
      {/* { newRateModel && (
      <div className="flex justify-center items-center fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50">
          <div onClick={() => setNewRateModel(!newRateModel)} className="bg-opacity-80 bg-gray-800 w-full h-full"></div>
          <div className="absolute text-black top-40 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-100 to-gray-300 p-14 rounded-2xl w-auto min-w-80% z-50">
           
            
            </div>
          </div>
      )} */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
      <form className="space-y-4">
      <h3 className="text-lg md:text-lg lg:text-xl font-bold text-blue-500">Add or Edit your Rates here</h3>
            
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className='mt-4' > {/*name="RateSearchInput"*/}
                <label className='mt-4 mb-2 text-gray-700 font-semibold' >Search Rate Card</label>
                <span className='flex flex-row mt-2'>
                <input
                  className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:shadow-outline border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                  // className="p-2 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3 max-h-10"
                  type="text"
                  id="RateSearchInput"
                 // name='RateSearchInput'
                  placeholder="Ex: RateName Type"
                  value={rateSearchTerm}
                  onChange = {handleRateSearch}
                  onFocus={(e) => {e.target.select()}}
                />
                <Button 
                  className='border' 
                  id='RatesClearButton'
                  //name='RatesClearButton'
                  onClick={handleClearRateId}>
                <FontAwesomeIcon icon={faTimesCircle} className=' w-6 h-6'/>
              </Button>
              </span>
              {ratesSearchSuggestion && (
              <ul className="z-10 mt-1 w-full  bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                {ratesSearchSuggestion.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleRateSelection}
                      value={name}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
              </div>


                    <div>
                      <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Rate Card Name</label>
                      <div className='flex mr-4'>
                        <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                          name="RateCardNameSelect"
                          required
                          placeholder="Select Rate Card Name"
                          value={selectedValues.rateName}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                          options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                        />
                        <button 
                          className='justify-center text-blue-500 ml-1' 
                          onClick={(e) => {e.preventDefault(); setNewRateModel(true); setNewRateType("Rate Card Name");}}
                          id='14'
                          name='AddRateNameButton'
                        >
                          <MdAddCircle size={28}/>
                        </button>
                      </div>
                    </div>

                  <div name="RatesCategorySelect" id="17">
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'> Category</label>
                    <div className='flex mr-4'>
                    <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                        placeholder="Select Category"
                        value={selectedValues.typeOfAd}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'typeOfAd')}
                        options={getOptions('typeOfAd', 'rateName')}
                        // options={filters.typeOfAd}
                        required
                      />
                      <button className='justify-center text-blue-500 ml-6' onClick={(e) => {e.preventDefault(); setNewRateModel(true); setNewRateType("Category");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Type</label>
                    <div className='flex mr-4'>
                    <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                        id="adTypeSelect"
                        name="adTypeSelect"
                        placeholder="Select Type"
                        required
                        value={selectedValues.adType}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                        options={getOptions('adType', 'typeOfAd')}
                      />
                      <button className='justify-center text-blue-500 ml-1' 
                      id='18'
                      name='AddAdCategoryButton'
                      onClick={(e) => {e.preventDefault(); setNewRateModel(true); setNewRateType("Type");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>

                  

                  {/* Location of the Rate for GS */}
                  <div id="19" name="RatesLocationSelect">
                    <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Location</label>
                    <div className='flex mr-4'>
                    <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                        placeholder="Select Location"
                        value={selectedValues.Location}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'Location')}
                        options={getOptions('Location', 'adType')}
                        required
                      />
                      <button className='justify-center text-blue-500 ml-1' 
                      id='20'
                      name='AddLocationButton'
                      onClick={(e) => {e.preventDefault(); setNewRateModel(true); setNewRateType("Location");}}>
                        <MdAddCircle size={28}/>
                      </button>
                    </div>
                  </div>
                  {/* {filters.package.length > 0 ?  */}
                  
                  {/* {(packageOptions.length > 1 || isNewRate) && ( */}
                  <div name="RatesPackageSelect">
                  <label className='block mb-2 mt-4 text-gray-700 font-semibold' name="RatesPackageSelect">Package</label>
                  <div className='flex mr-4'>
                  <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                      id="21"
                      name="RatesPackageSelect"
                      placeholder="Select Package"
                      value={selectedValues.Package}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'Package')}
                      options={getOptions('Package', 'Location')}
                      required = {isNewRate ? true : false}
                    />
                    <button className='justify-center text-blue-500 ml-1' 
                    id='22'
                    name='AddPackageButton'
                    onClick={(e) => {e.preventDefault(); setNewRateModel(true); setNewRateType("Package");}}>
                      <MdAddCircle size={28}/>
                    </button>
                  </div>
                </div>
                  {/* )} */}
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

                <div className="mb-6 mt-4 mr-14" id="23" name="RatesVendorSelect">
                  <label className="block mb-2 text-gray-700 font-semibold">Vendor</label>
                  <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                    placeholder="Select Vendor"
                    value={selectedValues.vendorName}
                    onChange={(selectedOption) => {handleSelectChange(selectedOption, 'vendorName'); setEditMode(true)}}
                    options={vendors}
                    required
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="options"
                  />
                </div>                  

                {/* {isNewRate || (rateId > 0 && slabData.length < 1) ? '': ''} */}
                  <div className='mt-4' id="24" name="RatesUnitsSelect"> 
                  <label className="block text-gray-700 font-semibold mb-2">Units</label>
                  <CreatableSelect
                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                      required = {isNewRate ? true : false}
                      ref={unitRef}
                      placeholder="Select Units"
                      value={selectedUnit}
                      onChange={(selectedOption) => {dispatch(setSelectedUnit(selectedOption)); setIsUnitsSelected(false); setEditMode(true)}}
                      options={units}
                      optionLabel="label"
                      optionGroupLabel="label"
                      optionGroupChildren="options"
                    />
                    {isUnitsSelected && <p className='text-red-500 mt-2 font-medium'>Please select a valid Unit</p>}
                  </div>

                    {/* {isNewRate || (rateId > 0 && slabData.length < 1) ? ( */}
                    <div className='mt-4' id="25" name='RatesQuantityText'>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity Slab</label>
                    <div className='flex mb-4'>
                      <TextField 
                        size='small' 
                        inputRef={qtyRef}
                        className={`w-full px-4 border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                        type='number' 
                        defaultValue={qty} 
                        onChange={e => {setQty(e.target.value); setIsQty(false); setIsQtySlab(false)}} 
                        helperText="Ex: 3 | Means this rate is applicable for Units > 3"
                        onFocus={(e) => {
                          e.target.select()
                        }}
                        />
                        
                      <button 
                        className='justify-center mb-10 ml-2 text-blue-500' 
                        onClick={(e) => {
                          e.preventDefault();
                          (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? !selectedUnit ? setIsUnitsSelected(true) : toggleModal(): setIsQty(true)
                        )}}
                        //onClick={() => (Number.isInteger(parseFloat(qty)) && parseInt(qty) !== 0 ? selectedUnit === "" ? showToastMessage("error", "Select a valid Unit!") :toggleModal() : showToastMessage('warning', 'Please enter a valid Quantity!'))}
                        id='26'
                        name='AddQuantityButton'  
                      >
                        <MdAddCircle size={28}/>
                      </button> 
                    </div>
                    {isQty && <p className='text-red-500 mt-2 font-medium'>Please select a valid Quantity</p>}
                    {isQtySlab && <p className='text-red-500 mt-2 font-medium'>Please enter a valid Slab Rate</p>}
                  </div> 
                  
                  <div>
                  {(isSlabAvailable) ? (
                    <div className='w-3/4 text-center justify-center mt-4'>
                    {combinedSlabData.length > 0 ? <h2 className='block mb-4 text-black font-bold'>Rate-Slab</h2> : <p className='block mb-4 mt-16 text-black font-bold'>No Rate-Slab currently available</p>}
                    <ul className='mb-4 text-black'>
                    {combinedSlabData.map((data, index) => (
                      <div key={data.StartQty || index} className='flex justify-center'>
                        {data.isTemp ? (
                          <span onClick={() => handleItemClick(data)}>{data.StartQty} {selectedUnit.value} - ₹{formattedMargin(data.UnitPrice)} per {selectedUnit.value}</span>
                        ) : (
                          <option key={data.StartQty} className="mt-1.5" 
                            onClick={() => handleItemClick(data)}
                          >
                            {data.StartQty} {selectedUnit ? selectedUnit.value : ''} - ₹{formattedMargin(data.UnitPrice)} per {selectedUnit ? selectedUnit.value : ''}
                          </option>
                        )}
                        <IconButton aria-label="Remove" className='align-top' onClick={() => removeQtySlab(data.StartQty, index)}>
                          <RemoveCircleOutline color='secondary' fontSize='small'/>
                        </IconButton>
                      </div>
                    ))}
                  </ul>
                     </div>
                  ) : <></>}
                </div>

              <div name="RatesServiceDurationCheckbox">
                    <div className='flex mr-16 mt-2'>
                      <input type='checkbox' checked={showCampaignDuration} value={showCampaignDuration} onChange={() => {
                        setShowCampaignDuration(!showCampaignDuration);
                      }}/>
                      <label className='justify-left ml-2 text-gray-700 font-semibold'>Service Duration</label>
                    </div>
                    <div className='mb-8'>
                    {showCampaignDuration && (
                    
                      <div className='flex flex-row'>
                        <div >
                      <TextField id="qtySlab" defaultValue={campaignDuration} variant="outlined" size='small' className='p-3 text-black glass shadow-2xl w-3/4 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md' type='number' onChange={(e) => {setCampaignDuration(e.target.value); setEditMode(true)}} 
                      onKeyDown = {handleKeyDown}
                      onFocus={(e) => e.target.select()}/>
                      </div>
                      <CreatableSelect
                        className={`w-3/4 border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              minHeight: '40px',
                            }),
                          }}
                        id='CUnits'
                        instanceId="CUnits"
                        placeholder="Units"
                        value={selectedCampaignUnits}
                        onChange={(selectedOption) => {setSelectedCampaignUnits(selectedOption); setEditMode(true)}}
                        options={campaignUnits}
                      />
                    </div>
                    )}
                    </div>
                  </div>
                    <div name="RatesLeadDaysTextField">
                    <div className='mr-5' id="27">
                    <label className="block mb-2 text-gray-700 font-semibold">Lead Days</label>
                    <div>
                      <span className='flex flex-row border rounded-lg border-gray-400'>
                        <TextField
                          value={leadDays}
                          variant="outlined" 
                          size='small'
                          className={`w-full px-4 border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                          inputRef={ldRef}
                          type='text'
                          onChange={e => {setLeadDays(e.target.value); setIsLeadDays(false); setEditMode(true)}} onFocus={(e) => {e.target.select()}}
                          onKeyDown ={handleKeyDown}
                        />
                        <p className='ml-2 mt-2 w-1/3'>Day (s)</p>
                      </span>
                    </div>
                    </div>
                    {isLeadDays && <p className='text-red-500 font-medium'>Lead Days should be more than 0</p>}
                  </div>

              <div className='mr-9' name="RatesValidTillTextField">
                  <label className="block mb-2 text-gray-700 font-semibold">Valid Till</label>
                  <div >
                  <span className='flex flex-row border rounded-lg border-gray-400'>
                    <TextField 
                      id="28"
                      name="RatesValidTillTextField" 
                      inputRef={validityRef}
                      value={validityDays} 
                      onChange={handleValidityChange} 
                      variant="outlined" 
                      size='small' 
                      className={`w-1/2 px-4 border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                      required
                      onKeyDown ={handleKeyDown}
                      type='number' 
                      onFocus={(e) => {e.target.select()}}/>
                    <IconButton aria-label="Add" onClick={() => setShowDatePicker(!showDatePicker)}>
                        <Event color='primary'/>
                      </IconButton>
                    <p className='ml-1 mt-2'>Day (s)</p>
                    </span>
                  </div>
                  {showDatePicker && (
                    <div>
                    <p>Select Date:</p>
                      <DatePicker
                        selected={validityDate}
                        //onChange={handleDateChange}
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
                    {isValidityDays && <p className='text-red-500 font-medium'>Validity Days should be more than 0</p>}
                </div>

                <div className='mr-9 mt-4' name="RateGSTSelect">
                  <label className="block mb-2 text-gray-700 font-semibold">Rate GST%</label>
                  <CreatableSelect
                                        className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                                          // className="p-0 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md "
                                          styles={{
                                            control: (provided) => ({
                                              ...provided,
                                              minHeight: '40px',
                                            }),
                                          }}
                    id="29"
                    instanceId="RateGST"
                    placeholder="Select Rate GST%"
                    value={rateGST}
                    onChange={(selectedOption) => {dispatch(setRateGST(selectedOption)); setEditMode(true)}}
                    options={GSTOptions}
                    required
                  />
</div>
                </div>
                {!(selectedValues.rateName === "" || selectedValues.adType === "" || selectedValues.vendorName === "") ? 
                <div className="flex items-center justify-center mb-8 mt-11 mr-14">
                  <button 
                   className="px-6 py-2 mr-3 bg-blue-500 text-white rounded-lg w-fit" 
                  onClick={() => {dispatch(resetRatesData()); }}>Clear
                          {/* <span className='flex flex-row justify-center'><MdOutlineClearAll className='mt-1 mr-1'/> Clear</span> */}
                        </button> 
                  {!isNewRate && (<button 
                   className="px-6 py-2 mr-3 bg-red-500 text-white rounded-lg w-fit" 
                  onClick={rejectRates}>Delete
                    {/* <span className='flex flex-row justify-center'><MdDeleteOutline className='mt-1 mr-1'/> Delete</span> */}
                    </button> 
                  )}
                    {isNewRate ? (
                      <button 
                      className="px-6 py-2 mr-3 bg-green-500 text-white rounded-lg w-fit" 
                      onClick={insertNewRate}>Add
                      {/* <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Add</span> */}
                      </button>
                    ) : ( 
                        <button 
                        className="px-6 py-2 mr-3 bg-green-500 text-white rounded-lg w-fit" 
                        onClick={(e) => {updateRates(e); }} disabled={!isFormChanged}> Update
                          {/* <span className='flex flex-row justify-center'><MdOutlineSave className='mt-1 mr-1'/> Update</span> */}
                        </button> 
                    )}
                    
                </div>
                :<></>}
                <div className="flex items-center justify-center mb-8 mt-11 mr-14">
                 <button 
                  className="outline-none text-[#008000] shadow-2xl p-2 flex flex-row bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] ring-[#008000] border-gray-300 hover:border-solid hover:border-[1px] w-44 hover:text-[#008000] font-semibold rounded-2xl justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    if(rateId){
                    //const params = new URLSearchParams({ rateId, rateName: selectedValues.rateName.value, type: selectedValues.adType.value, unitPrice: unitPrice, qty: startQty, unit: selectedUnit.value }).toString();
                    if(editMode){
                      const userConfirmed = window.confirm("You have pending changes. Is it ok to proceed?");
                      if (userConfirmed) {
                        // Your function on clicking 'Yes'
                        router.push(`/Create-Order`);
                        // Perform actions here...
                      } else {
                        // Your function on clicking 'No'
                        return
                        // Perform actions here...
                      }
                    }else{
                      router.push(`/Create-Order`);
                    }  
                    
                    }else{
                      // showToastMessage('warning', 'Choose a valid rate or save the existing rate!')
                      setToastMessage('Choose a valid rate or save the existing rate!');
                      setSeverity('warning');
                      setToast(true);
                      setTimeout(() => {
                        setToast(false);
                      }, 2000);
                    }
                    
                  }}>
                 <img src='/images/add.png' className='w-7 h-7 mr-2'/>Create Order</button>
                 </div> 
                </form>
              </div>
              </div>
      {/* <div className='bg-surface-card p-8 rounded-2xl mb-4'>
        <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
          <MuiAlert severity={severity} onClose={() => setToast(false)}>
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div> */}
      {successMessage && <SuccessToast message={successMessage} />}
      {toast && <ToastMessage message={toastMessage} type="error"/>}
    </div>
    
  )

}
export default AdDetailsPage;