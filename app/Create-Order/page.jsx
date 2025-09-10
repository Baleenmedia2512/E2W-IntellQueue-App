'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { setOrderData, resetOrderData, setIsOrderExist, setIsOrderUpdate} from '@/redux/features/order-slice';
import { resetClientData } from '@/redux/features/client-slice';
// import { TextField } from '@mui/material';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './styles.css';
import { Calendar } from 'primereact/calendar';
import { isValid, format } from 'date-fns';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CapacitorNavigation } from '../utils/capacitorNavigation';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FetchOrderSeachTerm, FetchCommissionData } from '../api/FetchAPI';
import { CircularProgress } from '@mui/material';

const CreateOrder = () => {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const clientDetails = useAppSelector(state => state.clientSlice);
    const orderDetails = useAppSelector(state => state.orderSlice);
    const isOrderUpdate = useAppSelector(state => state.orderSlice.isOrderUpdate);
    const {clientName: clientNameCR, consultantName: consultantNameCR, clientContact: clientNumberCR, clientID: clientIDCR, consultantId: consultantIdCR} = clientDetails;
    const {orderNumber: orderNumberRP, receivable: receivableRP, clientName: clientNameRP, clientContact: clientNumberRP} = orderDetails;
    const [clientName, setClientName] = useState(clientNameCR || "");
    const dbName = useAppSelector(state => state.authSlice.dbName);
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState(clientNumberCR || "");
    const [maxOrderNumber, setMaxOrderNumber] = useState("");
    const [nextRateWiseOrderNumber, setNextRateWiseOrderNumber] = useState("");
    const [UpdateRateWiseOrderNumber, setUpdateRateWiseOrderNumber] = useState("");
    const [marginAmount, setMarginAmount] = useState(0);
    const [marginPercentage, setMarginPercentage] = useState("");
    const [releaseDates, setReleaseDates] = useState([]);
    const [displayReleaseDate, setDisplayReleaseDate] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [elementsToHide, setElementsToHide] = useState([])
    const [clientEmail, setClientEmail] = useState("");
    const [clientSource, setClientSource] = useState("")
    const [receivable, setReceivable] = useState("");
    const [address, setAddress] = useState('');
    const [clientID, setClientID] = useState(clientIDCR || '');
    const [consultantID, setConsultantID] = useState(consultantIdCR || '');
    const [consultantName, setConsultantName] = useState(consultantNameCR || '');
    const [initialConsultantName, setInitialConsultantName] = useState(consultantNameCR || '');
    const [consultantNumber, setConsultantNumber] = useState('');
    const [consultantNameSuggestions, setConsultantNameSuggestions] = useState([]);
    const [clientContactPerson, setClientContactPerson] = useState("");
    const [clientGST, setClientGST] = useState("");
    const [clientPAN, setClientPAN] = useState("");
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(false);
    const [severity, setSeverity] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const isOrderExist = useAppSelector(state => state.orderSlice.isOrderExist);
    const [vendors, setVendors] = useState([]);
    const [ratesData, setRatesData] = useState([]);
    // const [units, setUnits] = useState([])
    const [isSlabAvailable, setIsSlabAvailable] = useState(false)
    const [showCampaignDuration, setShowCampaignDuration] = useState(false)
    const [leadDays, setLeadDays] = useState(0);
    const [campaignDuration, setCampaignDuration] = useState("");
    const [selectedCampaignUnits, setSelectedCampaignUnits] = useState("");
    const [campaignUnits, setCampaignUnits] = useState([]); 
    // const [validityDays, setValidityDays] = useState(0)
    // const [initialState, setInitialState] = useState({ validityDays: '', rateGST: "" });
    const [discountAmount, setDiscountAmount] = useState(0);
    // const [isConsultantWaiverChecked, setIsConsultantWaiverChecked] = useState(false);
    // const [waiverAmount, setWaiverAmount] = useState(0);
    const [commissionAmount, setCommissionAmount] = useState(0);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isCommissionSingleUse, setIsCommissionSingleUse] = useState(false);
    
    const dispatch = useDispatch();
    const router = useRouter();
    
    // Local state to replace removed rate slice
    const [selectedValues, setSelectedValues] = useState({
        rateName: '',
        adType: '',
        typeOfAd: '',
        Location: '',
        Package: '',
        vendorName: ''
    });
    const [rateId, setRateId] = useState('');
    const [selectedUnit, setSelectedUnit] = useState(''); 
    const [slabData, setSlabData] = useState([]); 
    const [rateGST, setRateGST] = useState({label: '', value: ''});
    const [startQty, setStartQty] = useState(1);
    const lastFetchedRateId = useRef(null);
    const lastCalculatedValues = useRef({ unitPrice: 0, rateGST: '' });

    
    const [qty, setQty] = useState(startQty);
    const [unitPrice, setUnitPrice] = useState(0);
    const [displayUnitPrice, setDisplayUnitPrice] = useState(0);
    const [originalUnitPrice , setOriginalUnitPrice] = useState(unitPrice);
    // const receivable = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18));
    const [units, setUnits]=useState("");
    const [previousOrderNumber, setPreviousOrderNumber] = useState('');
    const [previousRateWiseOrderNumber, setPreviousRateWiseOrderNumber] = useState('');
    const [previousOrderDate, setPreviousOrderDate] = useState('');
    const [previousRateName, setPreviousRateName] = useState('');
    const [previousAdType, setPreviousAdType] = useState('');
    const [previousOrderAmount, setPreviousOrderAmount] = useState('');
    const [previousConsultantName, setPreviousConsultantName] = useState('');

    const [orderDate, setOrderDate] = useState(new Date());
    const [displayOrderDate, setDisplayOrderDate] = useState(new Date());
    const [hasPreviousOrder, setHasPreviousOrder] = useState(false);

    const [isExpanded, setIsExpanded] = useState(false);
    const [consultantDialogOpen, setConsultantDialogOpen] = useState(false);
    const [hasOrderDetails, setHasOrderDetails] = useState(false);
    const [orderSearchSuggestion, setOrderSearchSuggestion] = useState([]);
    const [orderSearchTerm,setOrderSearchTerm] = useState("");
    const [displayClientName, setDisplayClientName] = useState(clientName);
    const [orderNumber, setOrderNumber] = useState(orderNumberRP || "");
    const [orderAmount, setorderAmount] = useState('');
    const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [updateReason, setUpdateReason] = useState('');
    const [prevData, setPrevData] = useState({});
   
    
    useEffect(() => {
      if (!loggedInUser || dbName === "" ) {
        CapacitorNavigation.navigate(router, '/login');
      }
      fetchMaxOrderNumber();
      elementsToHideList(); 
      fetchRates();
      fetchCampaignUnits();
      // calculateReceivable(); // Removed - will be called when unitPrice and rateGST are set
    },[])

    useEffect(() => {
      setConsultantID(consultantIdCR || '');
      setConsultantName(consultantNameCR || '');
      setInitialConsultantName(consultantNameCR || '');
      setClientID(clientIDCR || '');
      setClientName(clientNameCR || '');
      setDisplayClientName(clientNameCR || '');
      setClientNumber(clientNumberCR || '');
      dispatch(setOrderData({ clientName: clientNameCR, clientNumber: clientNumberCR, clientID: clientIDCR, consultantName: consultantNameCR }))
      fetchPreviousOrderDetails(clientNumberCR, clientNameCR);
    }, [clientIDCR]);

    useEffect(() => {
      if ( orderNumberRP > 0 ) {
        setClientName(clientNameRP || '');
        setDisplayClientName(clientNameRP || '');
        setClientNumber(clientNumberRP|| '');
        fetchOrderDetailsByOrderNumber(orderNumberRP);
        setIsOrderUpdate(true);
        setDisplayUnitPrice(receivableRP);
      }
    }, [orderNumberRP]);

    useEffect(() => {
      // calculateReceivable(); // Removed - redundant with unitPrice/rateGST useEffect
    },[unitPrice, marginAmount])

    // MP-99    
//rate cards
useEffect(() => {
  // if(!isOrderUpdate) {
  if(rateId > 0){
    // Prevent duplicate API calls for the same rateId
    if (lastFetchedRateId.current !== rateId) {
      lastFetchedRateId.current = rateId;
      handleRateId()
      fetchQtySlab()
    } else {
      console.log('Same rateId as last fetch, skipping API calls');
    }
  } else {
    lastFetchedRateId.current = null;
    setUnitPrice(0);
    setOriginalUnitPrice(0);
    setDisplayUnitPrice(0);
  }
// }
}, [rateId]);


const [filters, setFilters] = useState({
  rateName: [],
  typeOfAd: [],
  adType: [],
  location: [],
  vendorName: [],
  package: []
});

const fetchQtySlab = async () => {
  if (!rateId || rateId <= 0) {
    return;
  }
  
  try {
    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}&JsonDBName=${companyName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    setSlabData(data);
    // const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
    const sortedData = [...data].sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
    const firstSelectedSlab = sortedData[0];
    if(firstSelectedSlab){
      setStartQty(firstSelectedSlab.StartQty);
      setQty(firstSelectedSlab.StartQty);
      setUnitPrice(firstSelectedSlab.UnitPrice);
      setOriginalUnitPrice(firstSelectedSlab.UnitPrice);
      setDisplayUnitPrice(firstSelectedSlab.UnitPrice);
      // Remove setTimeout and let useEffect handle the calculation
    }
  }  catch (error) {
    console.error(error);
  }
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

useEffect(() => {
  // Fetch necessary data when the component loads or dependencies change
  const fetchInitialData = async () => {
    try {
      // Initial data fetching
      fetchMaxOrderNumber();
      fetchUnits();
      fetchQtySlab();

      // Fetch commission only if consultantName exists
      if (consultantName && !isOrderUpdate) {
        const commission = await FetchCommissionData(
          companyName,
          consultantName,
          selectedValues.rateName.value,
          selectedValues.adType.value
        );
        setCommissionAmount(commission);
        setPrevData(prevData => ({
          ...prevData, // Keep existing data
          commissionAmount: commission // Update only commissionAmount
      }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchInitialData();
}, [selectedValues.adType, selectedValues.rateName]);


const handleRateId = async () => {
  if(rateId > 0){
  try {
    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchAdMediumTypeCategoryVendor.php/?JsonRateId=${rateId}&JsonDBName=${companyName}`);
    
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

      // dispatch(setRateId(data.RateID));
      setSelectedUnit({label: data.Units, value: data.Units});

    // setCampaignDuration(data['CampaignDuration(in Days)']);
    // if(data.campaignDurationVisibility === 1){
    //   setShowCampaignDuration(true)
    // } else{
    //   setShowCampaignDuration(false)
    // }
    // setSelectedCampaignUnits({label: data.CampaignDurationUnit, value: data.CampaignDurationUnit})
    // setRateGST({label: data.rategst, value: data.rategst})
    setRateGST({label: data.rategst, value: data.rategst});
    // setLeadDays(data.LeadDays);
    // setValidTill(data.ValidityDate)
    // setValidityDate(data.ValidityDate)
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

const getDistinctValues = (key) => {
  const distinctValues = [...new Set(ratesData.map(item => item[key]))];
  return distinctValues.sort();
};

//filtering the options based on previous values
const getOptions = (filterKey, previousKey) => {
  var filteredData = []; 

  if (selectedValues["rateName"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "typeOfAd") {
    filteredData = ratesData.filter(item => 
      !selectedValues["rateName"]['value'] || item["rateName"] === selectedValues["rateName"]['value']
    );
  } else if (selectedValues["rateName"] !== '' && filterKey === "adType" && previousKey === "rateName") {
    // Allow adType to be selected directly after rateName (skip typeOfAd for mobile)
    filteredData = ratesData.filter(item => 
      !selectedValues["rateName"]['value'] || item["rateName"] === selectedValues["rateName"]['value']
    );
  } else if (selectedValues["typeOfAd"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "adType") {
    filteredData = ratesData.filter(item => 
      (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
      (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value)
    );
  } else if (selectedValues["adType"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "Location") {
    filteredData = ratesData.filter(item => 
      (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
      (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value) &&
      (!selectedValues.adType.value || item.adType === selectedValues.adType.value) 
    );
  } else if (selectedValues["Location"] !== '' && !elementsToHide.includes("RatesCategorySelect") && filterKey === "Package") {
    filteredData = ratesData.filter(item => 
      (!selectedValues.rateName.value || item.rateName === selectedValues.rateName.value) && 
      (!selectedValues.typeOfAd.value || item.typeOfAd === selectedValues.typeOfAd.value) &&
      (!selectedValues.adType.value || item.adType === selectedValues.adType.value) &&
      (!selectedValues.Location.value || item.Location === selectedValues.Location.value) 
    );
  } else if (filterKey === "vendorName") {
    // Vendor-specific logic
    filteredData = ratesData.filter(item => 
      (!selectedValues.rateName?.value || item.rateName === selectedValues.rateName.value) &&
      (!selectedValues.typeOfAd?.value || item.typeOfAd === selectedValues.typeOfAd.value) &&
      (!selectedValues.adType?.value || item.adType === selectedValues.adType.value) &&
      (!selectedValues.Location?.value || item.Location === selectedValues.Location.value)
    );
  } else if (elementsToHide.includes("RatesCategorySelect")) {
    filteredData = ratesData.filter(item => 
      !selectedValues.rateName.value || item.rateName === selectedValues.rateName.value
    );
  } else {
    return [];
  }

  // Extract distinct values of the specified filterKey from the filtered data
  const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];

  // Return the distinct values sorted and mapped to objects with value and label properties
  return distinctValues.sort().map(value => ({ value, label: value }));
};


// Function to handle dropdown selection
const handleSelectChange = (selectedOption, filterKey) => {
  setRateId("");
  // setIsNewRate(true);
  
  // Clear the error for this field when a value is selected
  if (selectedOption && selectedOption.value) {
    setErrors(prev => ({
      ...prev,
      [filterKey]: undefined
    }));
  }
  
  if (filterKey === 'rateName'){
    setSelectedValues({
      [filterKey]: selectedOption,
      adType: "",
      adCategory: "",
      vendorName: "",
      Package: "",
      Location: "",
      typeOfAd:""
    });
    // Clear rateName error specifically
    setErrors(prev => ({
      ...prev,
      rateName: undefined
    }));
  } else if(filterKey === 'adType'){
    // Allow adType to be selected directly after rateName (skip typeOfAd)
    setSelectedValues(prev => ({
      ...prev,
      [filterKey]: selectedOption,
      vendorName: "",
      Package: "",
      Location: ""
    }))
  } else if(filterKey === 'typeOfAd'){
    setSelectedValues(prev => ({
      ...prev,
      [filterKey]: selectedOption,
      adType: "",
      adCategory: "",
      vendorName: "",
      Package: "",
      Location: ""
    }))
  } else if(filterKey === 'Location'){
    setSelectedValues(prev => ({
      ...prev,
      [filterKey]: selectedOption,
      Package: "",
      vendorName: "",
      
    }))
  } else if(filterKey === 'Package'){
    setSelectedValues(prev => ({
      ...prev,
      [filterKey]: selectedOption,
      vendorName: ""
    }))
  } else {
    // Update the selected values
    setSelectedValues(prev => ({
    ...prev,
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
  
  // Force simplified lookup for mobile app since Category field is commented out
  // Check if we're in mobile mode by looking for hidden elements or use simplified logic
  const isMobileMode = elementsToHide.includes("RatesCategorySelect") || 
                       selectedValues.typeOfAd === '' || 
                       selectedValues.typeOfAd === undefined;
  
  if(isMobileMode){
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
    setRateId(selectedRate.RateID);
    setCampaignDuration(selectedRate['CampaignDuration(in Days)']);
    if(selectedRate.campaignDurationVisibility === 1){
      setShowCampaignDuration(true)
    }
    setSelectedCampaignUnits({label: selectedRate.CampaignDurationUnit, value: selectedRate.CampaignDurationUnit})
    setRateGST({label: selectedRate.rategst, value: selectedRate.rategst})
    // dispatch(setRateGST({label: selectedRate.rategst, value: selectedRate.rategst}));
    setLeadDays(selectedRate.LeadDays);
    // setValidTill(selectedRate.ValidityDate)
    // setValidityDate(selectedRate.ValidityDate)
  } else {
    // Reset all rate-related values when no rate is found
    setRateId('');
    setUnitPrice(0);
    setOriginalUnitPrice(0);
    setDisplayUnitPrice(0);
    setReceivable(0);
    setRateGST({label: '', value: ''});
  }

if (filterKey !== 'vendorName'){
  // setIsNewRate(false)
}
}

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
    // setValidRatesData(valid);
    // setInvalidRatesData(invalid);
    setRatesData(valid);
    // Cache the new rates data
    // localStorage.setItem('cachedRates', JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching rates:', error);
  }
};
// MP-99


    const findUnitPrice = () => {
      // Sort slabData by startQty in descending order
      const sortedSlabData = [...slabData].sort((a, b) => b.StartQty - a.StartQty);
      // Find the appropriate slab
      const slab = sortedSlabData.find((slab) => qty >= slab.StartQty);
      return slab ? Math.round(slab.UnitPrice) : 0;
    };

    useEffect(() => {
      // if(!isOrderUpdate) {
      const newUnitPrice = findUnitPrice();
      setUnitPrice(newUnitPrice);
      setOriginalUnitPrice(newUnitPrice);
      setDisplayUnitPrice(newUnitPrice);
      // }
    }, [qty])

    // Calculate receivable when unitPrice or rateGST changes
    useEffect(() => {
      const currentValues = {
        unitPrice: unitPrice,
        rateGST: rateGST?.value || ''
      };
      
      // Check if values have changed
      const valuesChanged = 
        lastCalculatedValues.current.unitPrice !== currentValues.unitPrice ||
        lastCalculatedValues.current.rateGST !== currentValues.rateGST;
      
      if (valuesChanged) {
        lastCalculatedValues.current = currentValues;
        
        // If unitPrice is 0 or rateGST is empty, reset receivable to 0
        if (unitPrice <= 0 || !rateGST || rateGST.value === '') {
          setReceivable(0);
          dispatch(setOrderData({ receivable: 0 }));
        } else {
          // Valid values - calculate receivable
          calculateReceivable();
        }
      } else {
        console.log('Skipping calculation - values unchanged:', currentValues);
      }
    }, [unitPrice, rateGST]);

    const handleSearchTermChange = (event) => {
        const newName = event.target.value;
        setClientName(newName);
        fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
          .then((response) => response.json())
          .then((data) => setClientNameSuggestions(data));
        // dispatch(setOrderData({ clientName: clientName }))
        if (errors.clientName) {
          setErrors((prevErrors) => ({ ...prevErrors, clientName: undefined }));
        }
      };

      const handleClientNameSelection = (event) => {
        const input = event.target.value;
        const splitInput = input.split('-');
        const ID = splitInput[0].trim();
        const rest = splitInput[1];
        const name = rest.substring(0, rest.indexOf('(')).trim();
        const number = rest.substring(rest.indexOf('(') + 1, rest.indexOf(')')).trim();
    
        setClientName(name);
        setDisplayClientName(name);
        setClientNumber(number);
        dispatch(setOrderData({ clientName: name, clientNumber: number }))
        fetchClientDetails(ID);
        fetchPreviousOrderDetails(number, name);
        setClientNameSuggestions([]);
      };

      const fetchClientDetails = async (clientID) => {
        try {
          const response = await axios.get(
            `https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientID=${clientID}&JsonDBName=${companyName}`
          );
      
          const data = response.data;
          if (data && data.length > 0) {
            const clientDetails = data[0];
      
            // Batch dispatch calls
            dispatch(
              setOrderData({
                clientEmail: clientDetails.email || "",
                clientSource: clientDetails.source || "",
                address: clientDetails.address || "",
                consultantName: clientDetails.consname || "",
                clientGST: clientDetails.GST || "",
                clientContactPerson: clientDetails.ClientContactPerson || "",
              })
            );
      
            // Update local states
            setClientID(clientDetails.id);
            setClientEmail(clientDetails.email || "");
            setClientSource(clientDetails.source || "");
            setAddress(clientDetails.address || "");
            setConsultantID(clientDetails.consid || "");
            setConsultantName(clientDetails.consname || "");
            setInitialConsultantName(clientDetails.consname || "");
            setClientGST(clientDetails.GST || "");
            setClientContactPerson(clientDetails.ClientContactPerson || "");
      
            // Handle PAN extraction from GST
            if (
              clientDetails.GST &&
              clientDetails.GST.length >= 15 &&
              (!clientDetails.ClientPAN || clientDetails.ClientPAN === "")
            ) {
              const pan = clientDetails.GST.slice(2, 12);
              setClientPAN(pan || "");
              dispatch(setOrderData({ clientPAN: pan || "" }));
            } else {
              setClientPAN(clientDetails.ClientPAN || "");
              dispatch(setOrderData({ clientPAN: clientDetails.ClientPAN || "" }));
            }
            
            if (clientDetails.consname) {

              // Fetch commission data
              const commission = await FetchCommissionData(
                companyName,
                clientDetails.consname,
                selectedValues.rateName.value,
                selectedValues.adType.value
              );
              setCommissionAmount(commission);
              setPrevData(prevData => ({
                ...prevData, // Keep existing data
                commissionAmount: commission // Update only commissionAmount
            }));
            }
          } else {
            console.warn("No client details found for the given ID.");
          }
        } catch (error) {
          console.error("Error fetching client details:", error);
        }
      };
      



      const fetchPreviousOrderDetails = (clientNumber, clientName) => {
        axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchPreviousOrderDetails.php?ClientContact=${clientNumber}&ClientName=${clientName}&JsonDBName=${companyName}`)
          .then((response) => {
            const data = response.data;
            if (data.length > 0) {
              const clientDetails = data[0];
              const formattedOrderDate = format(clientDetails.orderDate, 'dd-MMM-yyyy').toUpperCase();
              setPreviousOrderDate(formattedOrderDate);
              setPreviousOrderNumber(clientDetails.orderNumber);
              setPreviousRateWiseOrderNumber(clientDetails.rateWiseOrderNumber);
              setPreviousRateName(clientDetails.rateName);
              setPreviousAdType(clientDetails.adType);
              setPreviousOrderAmount(clientDetails.orderAmount);
              setPreviousConsultantName(clientDetails.consultantName);
              // handleSelectChange(clientDetails.rateName, "rateName");
              // handleSelectChange(clientDetails.adType, "adType");
              
              setRateId(clientDetails.rateID);
              setHasPreviousOrder(true);
            } else {
              setHasPreviousOrder(false); // Set to false if there are no details
            }
          })
          
          .catch((error) => {
            console.error(error);
          });
      };

    const fetchOrderDetailsByOrderNumber = async (orderNum) => {
      try {
        const response = await axios.get(
          `https://orders.baleenmedia.com/API/Media/FetchOrderData.php?OrderNumber=${orderNum}&JsonDBName=${companyName}`
        );
    
        const data = response.data;
        if (data) {
          // Parse the date
          const formattedDate = parseDateFromDB(data.orderDate);
    
          // Set all the necessary states
          setClientName(data.clientName);
          setClientNumber(data.clientContact);
          setOrderDate(data.orderDate);
          setDisplayOrderDate(formattedDate);
          setUnitPrice(data.receivable);
          setUpdateRateWiseOrderNumber(data.rateWiseOrderNumber);
          setRateId(data.rateId);
          setHasOrderDetails(true);
          setClientID(data.clientID);
          setConsultantID(data.consultantId);
          setConsultantName(data.consultantName);
          setInitialConsultantName(data.consultantName);
          setDiscountAmount(data.adjustedOrderAmount);
          setDisplayClientName(data.clientName);
          setorderAmount(data.receivable);
          setMarginAmount(data.margin);
          setIsCommissionSingleUse(data.isCommissionAmountSingleUse === 1);
          if(data.consultantName) {
            setCommissionAmount(data.commission);
            // setPrevData({commissionAmount: commission});
          }

          // Store the fetched data in a state to compare later
          setPrevData({
            clientName: data.clientName,
            orderDate: data.orderDate,
            receivable: data.receivable,
            rateWiseOrderNumber: data.rateWiseOrderNumber,
            rateId: data.rateId,
            clientID: data.clientID,
            consultantName: data.consultantName,
            discountAmount: data.adjustedOrderAmount,
            marginAmount: data.margin,
            commissionAmount: data.commission,
            isCommissionAmountSingleUse: data.isCommissionAmountSingleUse
          });
        } else {
          setHasOrderDetails(false); // Set to false if no details
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
    

  // useEffect(() => {
  //   fetchOrderDetailsByOrderNumber();
  //   setDisplayUnitPrice(receivableRP);
  // }, [orderNumber]); // Re-fetch when orderNumber changes
  // useEffect(() => {
  //   if (orderNumber) {
  //     fetchOrderDetailsByOrderNumber(orderNumber);
  //     setIsOrderUpdate(true); // Set the update flag if orderNumber exists
  //     setDisplayUnitPrice(receivableRP);
  //   }
  // }, [orderNumber]);
  

      const createNewOrder = async() => {
        setIsButtonDisabled(true);
        // If the discount amount has changed and remarks are not filled
        if (discountAmount !== 0 && discountAmount !== '0' && discountAmount !== '' && !remarks.trim()) {
          setToastMessage('For adjusting the amount, please provide remarks.');
          setSeverity('warning');
          setToast(true);
          setIsButtonDisabled(false);
          setTimeout(() => {
            setToast(false);
          }, 2000);
          return;
        }
        
        //event.preventDefault()
        var receivable = (unitPrice * qty) + marginAmount
        var payable = unitPrice * qty
        var orderOwner = companyName === 'Baleen Media' ? clientSource === '6.Own' ? loggedInUser : 'leenah_cse': loggedInUser;
        const IsCommissionForSingleUse = isCommissionSingleUse ? 1 : 0;

        if (validateFields()) {
          setToastMessage(
            <span>
                <CircularProgress size={20} style={{ marginRight: "8px" }} />
                {`Processing`}
            </span>
        );
        setSeverity('warning');
        setToast(true);
          const formattedOrderDate = formatDateToSave(orderDate);
          const { nextOrderNumber, nextRateWiseOrderNumber } = await fetchMaxOrderNumber();

        if (!nextOrderNumber || !nextRateWiseOrderNumber) {
            setToastMessage('Order Number not Found!');
            setSeverity('error');
            setToast(true);
            setIsButtonDisabled(false);
            setTimeout(() => {
              setToast(false);
            }, 2000);
        }
        try {
          const params = new URLSearchParams({
            JsonUserName: loggedInUser,
            JsonOrderNumber: nextOrderNumber,
            JsonRateId: rateId,
            JsonClientName: clientName,
            JsonClientContact: clientNumber,
            JsonClientSource: clientSource,
            JsonOwner: orderOwner,
            JsonCSE: loggedInUser,
            JsonReceivable: receivable,
            JsonPayable: payable,
            JsonRatePerUnit: unitPrice,
            JsonConsultantName: consultantName,
            JsonMarginAmount: marginAmount || 0, // Default to 0 for hidden field
            JsonRateName: selectedValues.rateName.value,
            JsonVendorName: selectedValues.vendorName?.value || 'N/A', // Default for hidden field
            JsonCategory: `${selectedValues.Location?.value || 'N/A'} : ${selectedValues.Package?.value || 'N/A'}`, // Default for hidden fields
            JsonType: selectedValues.adType.value,
            JsonHeight: qty || 1, // Default quantity to 1 for hidden field
            JsonWidth: 1,
            JsonLocation: selectedValues.Location?.value || 'N/A', // Default for hidden field
            JsonPackage: selectedValues.Package?.value || 'N/A', // Default for hidden field
            JsonGST: rateGST.value,
            JsonClientGST: clientGST,
            JsonClientPAN: clientPAN,
            JsonClientAddress: address,
            JsonBookedStatus: 'Booked',
            JsonUnits: selectedUnit.value,
            JsonMinPrice: unitPrice,
            JsonRemarks: remarks,
            JsonContactPerson: clientContactPerson,
            JsonReleaseDates: releaseDates.length > 0 ? releaseDates : [], // Default empty array for hidden field
            JsonDBName: companyName,
            JsonClientAuthorizedPersons: clientEmail,
            JsonOrderDate: formattedOrderDate,
            JsonRateWiseOrderNumber: nextRateWiseOrderNumber,
            JsonAdjustedOrderAmount: discountAmount,
            JsonCommission: commissionAmount,
            JsonIsCommissionSingleUse: IsCommissionForSingleUse,
            JsonConsultantId: consultantID
          });
          
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateNewOrder.php?${params.toString()}`);
          
          const data = await response.json();
          
            if (data === "Values Inserted Successfully!") {
                setToast(false);
                // dispatch(setIsOrderExist(true));
                // window.alert('Work Order #'+ maxOrderNumber +' Created Successfully!')
                // MP-101
                if (elementsToHide.includes('OrderNumberText')) {
                setSuccessMessage('Work Order #'+ nextRateWiseOrderNumber +' Created Successfully!');

                // Notify order adjustment via WhatsApp
                if (![null, undefined, 0, "0"].includes(discountAmount)) {
                notifyOrderAdjustment(clientName, discountAmount, remarks, nextRateWiseOrderNumber, selectedValues.rateName.value, selectedValues.adType.value, commissionAmount, prevData.commissionAmount);
                }

                } else if(elementsToHide.includes('RateWiseOrderNumberText')) {
                  setSuccessMessage('Work Order #'+ nextOrderNumber +' Created Successfully!');
                }
                dispatch(setIsOrderExist(true));
                
                setTimeout(() => {
                setSuccessMessage('');
                setIsButtonDisabled(false);
                // router.push('/FinanceEntry');
              }, 2000);
                
            } else {
              alert(`The following error occurred while inserting data: ${data}`);
              setIsButtonDisabled(false);
            }
          } catch (error) {
            console.error('Error updating rate:', error);
            setIsButtonDisabled(false);
          }
        } else {
          // MP-101
          setToastMessage('Please fill all necessary fields.');
          setSeverity('error');
          setToast(true);
          setIsButtonDisabled(false);
          setTimeout(() => {
            setToast(false);
          }, 2000);
      }
       }

const handlePlaceOrder = () => {
  if ((!commissionAmount || commissionAmount === 0) && consultantName) {
    setCommissionDialogOpen(true); // Open the confirmation dialog
  } else {
    createNewOrder(); // Directly create the order if commission is valid
  }
};

//update order-SK (02-08-2024)------------------------------------
const updateNewOrder = async (event) => {
  if (event) event.preventDefault();
  const receivable = (unitPrice * qty) + marginAmount;
  const payable = unitPrice * qty;
  const orderOwner = companyName === 'Baleen Media' ? (clientSource === '6.Own' ? loggedInUser : 'leenah_cse') : loggedInUser;
  const IsCommissionForSingleUse = isCommissionSingleUse ? 1 : 0;

  if (validateFields()) {
    const formattedOrderDate = formatDateToSave(orderDate);

    const params = new URLSearchParams({
      JsonUserName: loggedInUser,
      JsonOrderNumber: orderNumber, // Assuming orderNumber is the order number to update
      JsonRateId: rateId,
      JsonClientName: clientName,
      JsonClientContact: clientNumber,
      JsonClientSource: clientSource,
      JsonOwner: orderOwner,
      JsonCSE: loggedInUser,
      JsonReceivable: receivable.toString(), // Ensure numerical values are converted to strings
      JsonPayable: payable.toString(),
      JsonRatePerUnit: unitPrice.toString(),
      JsonConsultantName: consultantName,
      JsonMarginAmount: (marginAmount || 0).toString(), // Default to 0 for hidden field
      JsonRateName: selectedValues.rateName.value,
      JsonVendorName: selectedValues.vendorName?.value || 'N/A', // Default for hidden field
      JsonCategory: `${selectedValues.Location?.value || 'N/A'} : ${selectedValues.Package?.value || 'N/A'}`, // Default for hidden fields
      JsonType: selectedValues.adType.value,
      JsonHeight: (qty || 1).toString(), // Default quantity to 1 for hidden field
      JsonWidth: '1',
      JsonLocation: selectedValues.Location?.value || 'N/A', // Default for hidden field
      JsonPackage: selectedValues.Package?.value || 'N/A', // Default for hidden field
      JsonGST: rateGST.value.toString(),
      JsonClientGST: clientGST,
      JsonClientPAN: clientPAN,
      JsonClientAddress: address,
      JsonBookedStatus: 'Booked',
      JsonUnits: selectedUnit.value,
      JsonMinPrice: unitPrice.toString(),
      JsonRemarks: updateReason,
      JsonContactPerson: clientContactPerson,
      JsonReleaseDates: releaseDates.length > 0 ? releaseDates : [], // Default empty array for hidden field
      JsonDBName: companyName,
      JsonClientAuthorizedPersons: clientEmail,
      JsonOrderDate: formattedOrderDate,
      JsonRateWiseOrderNumber: UpdateRateWiseOrderNumber,
      JsonAdjustedOrderAmount: discountAmount,
      JsonCommission: commissionAmount,
      JsonIsCommissionSingleUse: IsCommissionForSingleUse,
      JsonConsultantId: consultantID
    });
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/UpdateNewOrder.php?${params.toString()}`, {
        method: 'GET', // Or 'PUT' depending on your API design
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data === "Values Updated Successfully!") {
        setSuccessMessage('Work Order #' + UpdateRateWiseOrderNumber + ' Updated Successfully!');
        if (discountAmount !== prevData.discountAmount) {
        // Call notifyOrderAdjustment after order update
        notifyOrderAdjustment(
          clientName,                      // Client Name
          discountAmount,                  // Adjusted Amount (can be +ve or -ve)
          updateReason,                    // Adjustment Remarks
          UpdateRateWiseOrderNumber,       // Order Number
          selectedValues.rateName.value,   // Rate Card
          selectedValues.adType.value,      // Rate Type
          commissionAmount,
          prevData.commissionAmount
      );
    }
        dispatch(setIsOrderExist(true));
        // dispatch(setIsOrderUpdate(false));
        // dispatch(resetOrderData());
        // setClientName('');
        // setOrderDate(new Date());
        // setDisplayOrderDate(new Date())
        // setUpdateRateWiseOrderNumber('');
        // dispatch(setRateId(''));
        // setClientID('');
        // setConsultantName('');
        // setInitialConsultantName('');
        // setDiscountAmount(0);
        // setOrderSearchTerm('');
        // setMarginAmount('');
        // setMarginPercentage('');
        // setQty('');
        handleCancelUpdate();
        setTimeout(() => {
          setSuccessMessage('');
          // Only navigate if orderNumberRP satisfies the condition
          // if (orderNumberRP) { // Replace this condition with your actual logic
          //   router.push('/Report');
          // }
        }, 3000);
      } else {
        alert(`The following error occurred while updating data: ${data}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  } else {
    setToastMessage('Please fill all necessary fields.');
    setSeverity('error');
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 2000);
  }
};

//end update order-sk(02-08-2024)-----------------------------------
      const fetchMaxOrderNumber = async () => {
        try {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumber.php/?JsonDBName=${companyName}&JsonRateName=${selectedValues.rateName.value}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setMaxOrderNumber(data.nextOrderNumber);
          setNextRateWiseOrderNumber(data.nextRateWiseOrderNumber);
          return data;
        } catch (error) {
          console.error(error);
        }
      };

      const elementsToHideList = () => {
        try{
          fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
            .then((response) => response.json())
            .then((data) => {
              setElementsToHide(data);
            });
        } catch(error){
          console.error("Error showing element names: " + error)
        }
      }


      useEffect(() => {
        //searching elements to Hide from database
    
        elementsToHide.forEach((name) => {
          const elements = document.getElementsByName(name);
          elements.forEach((element) => {
            element.style.display = 'none'; // Hide the element
          });
        });
      }, [elementsToHide])
  const calculateReceivable = () => {
    // Simplified calculation for mobile app - margin and quantity fields are hidden
    // const validQty = Number(qty);
    const validUnitPrice = Number(unitPrice);
    // const validMarginAmount = marginAmount ? Number(marginAmount) : 0; // Default to 0 if marginAmount is empty or undefined
    const validRateGST = rateGST && !isNaN(rateGST.value) ? Number(rateGST.value) : 0; // Default to 0 if rateGST.value is not a number
  
    // Simplified calculation: just unit price with GST (no margin, qty defaults to 1)
    const subtotalWithoutGST = validUnitPrice; // + validMarginAmount;
    const gstAmount = subtotalWithoutGST * (validRateGST / 100);
    const amountInclGST = subtotalWithoutGST + gstAmount;
    
    // Set the state with amountInclGST
    setReceivable(amountInclGST);
    // Dispatch action to set order data with receivable amount
    dispatch(setOrderData({ receivable: amountInclGST }));
  };
  


  // Margin handlers commented out since margin fields are hidden in mobile app
  /*
  const handleMarginPercentageChange = (e) => {
    const newMarginPercent = parseFloat(e.target.value) || 0;
    setMarginPercentage(newMarginPercent);
    dispatch(setOrderData({ marginPercentage: newMarginPercent })) 

    // Assuming you have a total amount to calculate percentage against
    const newMarginAmount = (newMarginPercent / 100) * unitPrice;
    setMarginAmount(newMarginAmount.toFixed(2)); // Adjust toFixed for precision as needed
    dispatch(setOrderData({ marginAmount: newMarginAmount.toFixed(2) })) 
    // calculateReceivable(); // Recalculate receivable with new margin
    if (errors.marginPercentage) {
      setErrors((prevErrors) => ({ ...prevErrors, marginPercentage: undefined }));
    }
  };
  const handleMarginAmountChange = (e) => {
    const newMarginAmount = parseFloat(e.target.value) || 0;
    setMarginAmount(newMarginAmount);
    dispatch(setOrderData({ marginAmount: newMarginAmount })) 

    // Assuming you have a total amount to calculate percentage against
    const newMarginPercentage = (newMarginAmount / (unitPrice)) * 100;
    setMarginPercentage(newMarginPercentage.toFixed(2)); // Adjust toFixed for precision as needed
    dispatch(setOrderData({ marginPercentage: newMarginPercentage.toFixed(2) })) 
    if (errors.marginAmount) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
  };
  */
  const validateFields = () => {
    let errors = {};

    if (!clientName) errors.clientName = 'Client Name is required';
    if (!selectedValues.rateName) errors.rateName = 'Rate Card Name is required';
    // Hidden fields validations commented out
    // if (elementsToHide.includes("OrderMarginAmount") === false) {
    // if (!selectedValues.typeOfAd) errors.typeOfAd = 'Category is required';
    // }
    if (!selectedValues.adType) errors.adType = 'Type is required';

    // if (elementsToHide.includes("OrderQuantityText") === false) {
    //   if (!qty || isNaN(qty)) errors.qty = 'Quantity is required';
    // }
    // if (elementsToHide.includes("OrderMarginAmount") === false) {
    //   if (!marginAmount || isNaN(marginAmount)) errors.marginAmount = 'Valid Margin Amount is required';
    // }
    // if (!isOrderUpdate && !elementsToHide.includes("RatesVendorSelect")) {
    //   if (!selectedValues.vendorName) {
    //       errors.vendorName = 'Vendor is required';
    //   }
    // }
  
    // if (elementsToHide.includes("RatesPackageSelect") === false) {
    //   if (!selectedValues.Location) errors.Package = 'Package is required';
    // }
    // if (elementsToHide.includes("RatesLocationSelect") === false) {
    //   if (!selectedValues.Location) errors.Location = 'Location is required';
    // }
    // if (elementsToHide.includes("OrderMarginPercentage") === false) {
    //   if (!marginPercentage || isNaN(marginPercentage)) errors.marginPercentage = 'Valid Margin % is required';
    // }

    // if (isConsultantWaiverChecked) {
    //   if (!waiverAmount) {
    //     errors.waiverAmount = 'Consultant Waiver value is required';
    //   }
    // }
    

    setErrors(errors);
    return Object.keys(errors).length === 0;
};

const handleDateChange = (e) => {
  const dateValue = e.target.value;
  setDisplayOrderDate(dateValue);
  const formattedDate = formatDateToSave(e.value);
  setOrderDate(formattedDate);
  if (errors.ageAndDOB) {
    setErrors((prevErrors) => ({ ...prevErrors, ageAndDOB: undefined }));
  }
};

const handleReleaseDatesChange = (e) => {
  const dateValue = e.target.value;
  setDisplayReleaseDate(dateValue);
  const formattedDate = formatReleaseDatesToSave(e.value);
  setReleaseDates(formattedDate);
  if (errors.ageAndDOB) {
    setErrors((prevErrors) => ({ ...prevErrors, ageAndDOB: undefined }));
  }
};

function formatDateToSave(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReleaseDatesToSave(dates) {
  return dates.map(date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
}


function parseDateFromDB(dateString) {
  if (!dateString) {
    // Handle cases where the dateString is undefined, null, or an empty string
    return null; // or return a default date, like new Date()
  }
  
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}


// const formattedOrderDate = format(new Date(orderDate), 'dd-MMM-yyyy').toUpperCase();
const formattedOrderDate = orderDate && isValid(new Date(orderDate))
  ? format(new Date(orderDate), 'dd-M-yyyy').toUpperCase()
  : format(new Date(),'dd-M-yyyy'); // or handle as per your needs

const consultantDialog = () => {
  setConsultantDialogOpen(true); 
};


const handleCloseDialog = () => {
  setConsultantName(initialConsultantName);
  setConsultantDialogOpen(false);
};

const handleConsultantUpdate = async(event) => {
  event.preventDefault()

  if (!consultantName) {
    setErrors({ consultantName: 'Consultant Name is required' });
    return;
  }

  if (!clientID) {
    
    setConsultantDialogOpen(false);
          setToastMessage("Select a client!");
          setSeverity('error');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
    setErrors({ clientName: 'Client Name is required' });
    return;
  }
  
  try {
  const response = await fetch(`https://orders.baleenmedia.com/API/Media/ChangeConsultant.php/?JsonUserName=${loggedInUser}&JsonConsultantName=${consultantName}&JsonConsultantContact=${consultantNumber}&JsonClientID=${clientID}&JsonDBName=${companyName}`);
  const data = await response.json();
  
  if (data.message === "Updated Successfully!") {
    setSuccessMessage('Consultant Updated Successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  } else {
    alert(`The following error occurred while updating consultant: ${data.error || data}`);
  }
} catch (error) {
  console.error('Error updating consultant:', error);
}
  setErrors({});
  setConsultantDialogOpen(false);
};

const handleConsultantNameChange = (event) => {
  const newName = event.target.value;
  setConsultantName(newName)
  // dispatch(setClientData({ consultantName: newName || "" }));
  fetch(`https://orders.baleenmedia.com/API/Media/SuggestingVendorNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
    .then((response) => response.json())
    .then((data) => {setConsultantNameSuggestions(data)});
    if (errors.consultantName) {
      setErrors((prevErrors) => ({ ...prevErrors, consultantName: undefined }));
    }
};

// const handleConsultantNameSelection = (event) => {
//   const input = event.target.value;
//   const name = input.substring(0, input.indexOf('(')).trim();
//   const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

//   setConsultantNameSuggestions([]);
//   setConsultantName(name)
//   // dispatch(setClientData({ consultantName: name || "" }));
//   setConsultantNumber(number);
//   // fetchConsultantDetails(name, number);
// };

const handleConsultantNameSelection = (event) => {
  const input = event.target.value;
  const id = input.split('-')[0].trim();
  
  setConsultantNameSuggestions([]);
  fetchConsultantDetails(id);
};

const fetchConsultantDetails = async (Id) => {
  try {
    // Fetch consultant details
    const response = await fetch(
      `https://orders.baleenmedia.com/API/Media/FetchConsultantDetails.php?JsonConsultantID=${Id}&JsonDBName=${companyName}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    setConsultantID(Id);
    setConsultantName(data.ConsultantName);
    setInitialConsultantName(data.ConsultantName);
    setConsultantNumber(data.ConsultantNumber || '');

    if (data.ConsultantName) {
    const commission = await FetchCommissionData(
      companyName,
      data.ConsultantName,
      selectedValues.rateName.value,
      selectedValues.adType.value
    );
    setCommissionAmount(commission);
    setPrevData(prevData => ({
      ...prevData, // Keep existing data
      commissionAmount: commission // Update only commissionAmount
  }));
    }
  } catch (error) {
    console.error('Error fetching consultant details:', error);
  }
};


const handleDiscountChange = (e) => {
  const value = e.target.value;

  // Handle the case where the input is cleared
  if (value === '') {
    // Reset the discount amount and unit price to the original values
    setDiscountAmount(0);
    // setDisplayUnitPrice(originalUnitPrice);
    setErrors((prevErrors) => ({ ...prevErrors, remarks: undefined })); // Clear any existing error on Remarks
    return;
  }

  const parsedUnitPrice = parseFloat(unitPrice);
  const parsedValue = parseFloat(value);
  const newDiscountAmount = parsedValue;
  setDiscountAmount(newDiscountAmount);
  // setDisplayUnitPrice(prevPrice => prevPrice - discountAmount + newDiscountAmount);
  // setDisplayUnitPrice(parsedUnitPrice + newDiscountAmount);  

  // Check if Remarks is filled; if not, set an error
  // if (newDiscountAmount !== 0 && newDiscountAmount !== '0' && !remarks) {
  //   setErrors((prevErrors) => ({ ...prevErrors, remarks: 'Remarks are required when adjusting the amount' }));
  // } else {
  //   setErrors((prevErrors) => ({ ...prevErrors, remarks: undefined }));
  // }
};

const handleCommissionChange = (e) => {
  const value = e.target.value;

  if (value === '') {
    setCommissionAmount(0);
    setErrors((prevErrors) => ({ ...prevErrors, commissionAmount: undefined })); // Clear any existing error on Remarks
    return;
  }

  const parsedValue = parseFloat(value);
  const newCommissionAmount = parsedValue;
  setCommissionAmount(newCommissionAmount);
};


const handleOpenDialog = () => {
  // Check if remarks are filled
  const isDiscountChanged = discountAmount !== prevData.discountAmount;

  // If the discount amount has changed and remarks are not filled
  // if (discountAmount !== '0' && discountAmount !== 0 && discountAmount !== '' && !remarks.trim()) {
  //   setToastMessage('Please provide a reason in the Remarks field.');
  //   setSeverity('warning');
  //   setToast(true);
  //   setTimeout(() => {
  //     setToast(false);
  //   }, 2000);
  //   return;
  // }
  // Compare current data with previous data to check if any field has changed
  const isDataChanged = (
    clientName.trim() !== (prevData.clientName || '').trim() ||
    orderDate !== prevData.orderDate || // Ensure orderDate comparison works (check format)
    parseFloat(unitPrice) !== parseFloat(prevData.receivable) || // Handle potential string/number issues
    rateId !== prevData.rateId ||
    consultantName.trim() !== (prevData.consultantName || '').trim() ||
    parseFloat(discountAmount) !== parseFloat(prevData.discountAmount) ||
    parseFloat(marginAmount) !== parseFloat(prevData.marginAmount) ||
    parseFloat(commissionAmount) !== parseFloat(prevData.commissionAmount) ||
    Boolean(isCommissionSingleUse) !== Boolean(prevData.isCommissionSingleUse) // Ensure boolean comparison
  );
  
  // If any data has changed, open the dialog; otherwise, show the "No changes have been made" toast
  if (isDataChanged) {
    setDialogOpen(true);
  } else {
    setToastMessage('No changes detected.');
    setSeverity('warning');
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 2000);
  }
};


  // const handleOpenDialog = () => {
  //   setDialogOpen(true);
  // };

  const handleCancelUpdate = () => {
    setClientName('');
    setDisplayClientName('');
    setOrderDate(new Date());
    setDisplayOrderDate(new Date());

    setHasPreviousOrder(false);
    setPreviousAdType("");
    setPreviousConsultantName("");
    setPreviousOrderAmount("");
    setPreviousOrderNumber("");
    setPreviousRateName("");
    setPreviousRateWiseOrderNumber("");
    setPreviousOrderDate("");

    setUpdateRateWiseOrderNumber('');
    dispatch(setRateId(''));
    setClientID('');
    setConsultantID('');
    setConsultantName('');
    setInitialConsultantName('');
    setDiscountAmount(0);
    dispatch(resetOrderData());
    setOrderSearchTerm('');
    dispatch(setIsOrderUpdate(false));
    setCommissionAmount(0);
    setIsCommissionSingleUse(false);
    setRemarks('');
    setUpdateReason('');
    // setWaiverAmount(0);
    // setIsConsultantWaiverChecked(false);
    setClientNumber('');
    setPrevData({});
    //window.location.reload(); // Reload the page
  };

  const handleUpdateCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleUpdateConfirm = () => {
    // Execute the update operation here with the provided reason
    updateNewOrder();
    handleUpdateCloseDialog();
  };

  const handleReasonChange = (event) => {
    setUpdateReason(event.target.value);
  };

 

//search bar to update orders
const handleOrderSearch = async (e) => {
  const searchTerm = e.target.value;
  setOrderSearchTerm(searchTerm);

  // If search term is cleared, reset the update mode
  if (searchTerm.trim() === "") {
    handleCancelUpdate();
    setOrderSearchSuggestion([]); // Clear suggestions
    return; // Exit early
  }

  const searchSuggestions = await FetchOrderSeachTerm(companyName, searchTerm);
  setOrderSearchSuggestion(searchSuggestions);
};

const handleOrderSelection = (e) => {
  const selectedOrder = e.target.value;

  const selectedOrderId = selectedOrder.split('-')[0];

  // Clear finance suggestions and set the search term
  setOrderSearchSuggestion([]);
  setOrderSearchTerm(selectedOrder);

  // Call the handleFinanceId function with the selected ID
  fetchOrderDetailsByOrderNumber(selectedOrderId);

  // Set the finance ID state
  setOrderNumber(selectedOrderId);
  
  dispatch(setIsOrderUpdate(true));
  setHasPreviousOrder(false);
  // Set the mode to "Update"
  //setIsUpdateMode(true);
  dispatch(resetClientData());
};

const handleCommissionCloseDialog = () => {
  setCommissionDialogOpen(false);
};

const handleCommissionConfirm = () => {
  handleCommissionCloseDialog();
  createNewOrder();
};

const notifyOrderAdjustment = async (clientNam, adjustedOrderAmt, remarks, rateWiseOrderNum, rateCard, rateType, commission, prevCommission) => {

  // Prepare JSON payload with properly formatted parameters
  const payload = {
      clientNam: String(clientNam),
      adjustedOrderAmt: String(adjustedOrderAmt),
      remarks: remarks,
      rateWiseOrderNum: String(rateWiseOrderNum),
      rateCard: rateCard,
      rateType: rateType,
      newCommissionAmount: String(commission),
      prevCommissionAmount: (prevCommission != null ? String(prevCommission) : "0") === String(commission) ? "0" : String(prevCommission || "0")
  };


  try {
      const response = await axios.post(
          `https://orders.baleenmedia.com/API/Media/NotifyOrderAdjustmentViaWhatsapp.php?JsonDBName=${companyName}`,
          payload, // Send data as JSON
          { headers: { 'Content-Type': 'application/json' } }
      );

      const resultData = response.data;
      if (resultData[0]?.success) {
          console.log('✅ Message sent successfully!');
      } else {
          setToastMessage(resultData.message || "An error occurred.");
          setIsButtonDisabled(false);
          setSeverity("warning");
          setToast(true);

          setTimeout(() => {
              setToast(false);
          }, 3000);
      }
  } catch (error) {
      console.error("❌ Error sending message:", error);
      setIsButtonDisabled(false);
  }
};


return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 mb-14 p-4">
<Dialog open={consultantDialogOpen} onClose={handleCloseDialog} fullWidth={true} maxWidth='sm'>
<DialogTitle>Change Consultant</DialogTitle>
        <DialogContent>
          {/* Consultant Name Input */}
          <div className="relative">
            <label className="block mb-1 font-medium">Consultant Name</label>
            <input
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.consultantName ? 'border-red-400' : ''}`}
              type="text"
              placeholder="Consultant Name*"
              name="ConsultantNameInput"
              value={consultantName}
              onChange={handleConsultantNameChange}
              onBlur={() => {
                setTimeout(() => {
                  setConsultantNameSuggestions([]);
                }, 200);
              }}
              onKeyPress={(e) => {
                // Allow only alphabetic characters
                const regex = /^[a-zA-Z\s]*$/;
                if (!regex.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {consultantNameSuggestions.length > 0 && (
              <ul className="z-10 mt-1 w-full  bg-white border border-gray-200 rounded-md shadow-lg">
                {consultantNameSuggestions.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleConsultantNameSelection}
                      value={name}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.consultantName && <p className="text-red-500 text-xs">{errors.consultantName}</p>}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConsultantUpdate} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <div className="w-full max-w-6xl">
    <div className="flex items-center justify-between top-0 z-10 sticky bg-gray-100">
    <div>
      <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-500 mb-0">Order Manager</h2>
      <div className="border-2 w-10 inline-block mb-0 border-blue-500"></div>
      {/* Conditional text based on isOrderUpdate */}
      <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4">
      {isOrderUpdate ? (
          <>Updating order number: <strong>{orderNumber}</strong></>
        ) : (
          <div></div>
        )}
      </p>
    </div>
    
    {/* Conditional rendering based on isOrderUpdate */}
    {isOrderUpdate ? (
  <div className="button-container">
    <button className="update-button" onClick={handleOpenDialog}>Update Order</button>
    {/* <button className="cancel-button" onClick={handleCancelUpdate}>Cancel Update</button> */}
  </div>
) : (
  <button className="custom-button" onClick={handlePlaceOrder} disabled={isButtonDisabled}>Place Order</button>
)}
    
    <Dialog
      open={commissionDialogOpen}
      onClose={handleCommissionCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Are you sure want to continue?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The Commission amount is empty. Are you sure want to continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCommissionCloseDialog} color="primary">
          No
        </Button>
        <Button
          onClick={handleCommissionConfirm}
          color="primary"
        >Yes
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={dialogOpen}
      onClose={handleUpdateCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Provide a Reason for Update"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="update-reason"
          label="Reason"
          type="text"
          fullWidth
          variant="outlined"
          value={updateReason}
          onChange={handleReasonChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUpdateCloseDialog} color="primary">
          Cancel
        </Button>
        <Button
          onClick={handleUpdateConfirm}
          color="primary"
          disabled={!updateReason} // Disable if updateReason is empty
        >Confirm
        </Button>
      </DialogActions>
    </Dialog>


  </div>

  <div className="flex flex-col sm:flex-row justify-center mx-auto mb-4 pt-3 sm:pt-7 mt-4">
  
  {/* Search Input Section */}
  <div className="w-full sm:w-1/2">
    <div className="flex items-center w-full border rounded-lg overflow-hidden border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
      <input
        className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0"
        type="text"
        id="RateSearchInput"
        placeholder="Search Order for Update.."
        value={orderSearchTerm}
        onChange={handleOrderSearch}
        onFocus={(e) => { e.target.select() }}
      />
      <div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
      </div>
    </div>

    {/* Search Suggestions */}
    <div className="relative">
      {orderSearchSuggestion.length > 0 && orderSearchTerm !== "" && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
          {orderSearchSuggestion.map((name, index) => (
            <li key={index}>
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                onClick={handleOrderSelection}
                value={name}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>



    {/* Order Selection */}
    <div className="bg-white p-4 mt-2 rounded-lg shadow-lg">

    {isOrderUpdate  ? (
  <div className="w-full sm:w-fit bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-center shadow-md sm:mr-4">
    <button
      className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
       onClick={handleCancelUpdate}
    >
      Exit Edit
    </button>
    <div className="flex flex-row text-left text-sm md:text-base pr-2">
      <p className="text-gray-600 font-semibold">{orderNumber}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">{displayClientName}</p>
      <p className="text-gray-600 font-semibold mx-1">-</p>
      <p className="text-gray-600 font-semibold">₹{orderAmount}</p>
    </div>
  </div>
) : ''}

      <form className="space-y-4">
      <h3 className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 ">Select Your Order</h3>
          {/* Client Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Client Name</label>
            <input 
              type='text' 
              className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:shadow-outline 
                ${errors.clientName ? 'border-red-400' : 'border-gray-300'} 
                focus:border-blue-300 focus:ring focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
              placeholder='Client Name'
              value={clientName}
              onChange={handleSearchTermChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const inputs = document.querySelectorAll('input, select, textarea');
                  const index = Array.from(inputs).findIndex(input => input === e.target);
                  if (index !== -1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                  }
                }
              }}
              disabled={isOrderUpdate}
              //&& !elementsToHide.includes("ClientAgeInput")
            />
            {(clientNameSuggestions.length > 0 && clientName !== '' && !isOrderUpdate) && (
            <ul className={`list-none bg-white shadow-lg rounded-md mt-2 overflow-y-scroll ${
              clientNameSuggestions.length > 5 ? 'h-40' : 'h-fit'
            }`}>
              {clientNameSuggestions.map((name, index) => (
                <li key={index} className="relative z-10 mt-0 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                    onClick={handleClientNameSelection}
                    value={name}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}

            {errors.clientName && <span className="text-red-500 text-sm">{errors.clientName}<br/></span>}
            {/* New Client */}
            {/* <label className='text-gray-500 text-sm hover:cursor-pointer'>New Client? <span className='underline text-sky-500 hover:text-sky-600' onClick={() => router.push('/')}>Click Here</span></label> */}
            {!isOrderUpdate && (
    <label className='text-gray-500 text-sm hover:cursor-pointer'>
        New Client? 
        <span 
            className='underline text-sky-500 hover:text-sky-600 p-1' 
            onClick={() => CapacitorNavigation.navigate(router, '/')}
        >
            Click Here
        </span>
    </label>
)}

          </div>

          <div>
                    <label className="block mb-1 text-gray-700 font-medium">Order Date</label>
                    <div>
                  <div>
                    <Calendar
                      type="date"
                      value={displayOrderDate}
                      onChange={handleDateChange}
                      placeholder="dd-M-yyyy"
                      showIcon
                      dateFormat='dd-M-yy'
                      className={`w-full px-4 h-12 border rounded-lg text-black focus:outline-none focus:shadow-outline ${isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'} ${errors.orderDate ? 'border-red-400' : ''} focus:border-blue-300 focus:ring focus:ring-blue-300`}
                      inputClassName="p-inputtext-lg"
                    />
                  </div>
                   </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className='block text-gray-700 font-semibold mb-2'>Order Amount</label>
      <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 relative">
        <p className="text-gray-700">₹ {Math.floor(receivable || 0)}</p>
      </div>

    </div>
    <div>
      <label className="block text-gray-700 font-semibold mb-2">Adjustment (+/-)</label>
      <input 
        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline ${isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'} ${errors.marginAmount ? 'border-red-400' : ''} focus:border-blue-300 focus:ring focus:ring-blue-300`}
        type="number"
        placeholder="Amount Adjustment"
        value={discountAmount || ''}
        onChange={handleDiscountChange}
        onFocus={e => e.target.select()}
      />
      
      {/* {consultantName && (
      <div className="flex items-center space-x-1 mt-1">
        <input
          type="checkbox"
          id="consultantWaiver"
          className={`h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 ${isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'} rounded`}
          checked={isConsultantWaiverChecked}
          onChange={(e) => setIsConsultantWaiverChecked(e.target.checked)}
        />
        <label htmlFor="consultantWaiver" className={`text-gray-500 font-medium text-sm ${isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'}`}>
          Consultant Waiver
        </label>
      </div>
       )} */}
    </div>
    
  
  </div>
  {/* Consultant Waiver */}
  {/* {isConsultantWaiverChecked && (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">Waiver Amount (+/-)</label>
      <input
        type="number"
        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline ${
          isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'
        } focus:border-blue-300 focus:ring focus:ring-blue-300`}
        placeholder="Enter Waiver Amount"
        value={waiverAmount || ''}
        onChange={handleWaiverChange}
        onFocus={(e) => e.target.select()}
      />
      {errors.waiverAmount && <p className="text-red-500 text-sm mt-2">{errors.waiverAmount}</p>}
    </div>
  )} */}
  {consultantName && (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">Commission Amount</label>
      <input
        type="number"
        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline ${
          isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'
        } focus:border-blue-300 focus:ring focus:ring-blue-300`}
        placeholder="Enter Commission Amount"
        value={commissionAmount || ''}
        min={0}
        onChange={(e) => {
          const value = e.target.value;
          if (value === '' || Number(value) >= 0) {
            handleCommissionChange(e); // Call your handler only for valid positive numbers
          }
        }}
        onFocus={(e) => e.target.select()}
      />
      <div className="flex items-center space-x-1 mt-1">
      <input
        type="checkbox"
        id="forOneTimeOnly"
        className={`h-4 w-4 text-blue-500 focus:ring focus:ring-blue-300 ${
          isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'
        } rounded`}
        checked={isCommissionSingleUse}
        onChange={(e) => setIsCommissionSingleUse(e.target.checked)}
      />
      <label
        htmlFor="forOneTimeOnly"
        className={`text-gray-500 font-medium text-sm ${
          isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'
        }`}
      >
        For One Time Only
      </label>
    </div>

      
      {errors.commissionAmount && <p className="text-red-500 text-sm mt-2">{errors.commissionAmount}</p>}
    </div>
    )}
{ (discountAmount !== '0' && discountAmount !== 0 && discountAmount !== '' && !isOrderUpdate) && (
  <div>
    <label className="block text-gray-700 font-semibold mb-2">Remarks</label>
    <input
      type='text'
      className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:shadow-outline
        ${errors.remarks ? 'border-red-400' : isOrderUpdate  ? 'border-yellow-500' : 'border-gray-300'}
        focus:border-blue-300 focus:ring focus:ring-blue-300`}
      placeholder='Remarks'
      value={remarks}
      onChange={e => {
        setRemarks(e.target.value);
        if (e.target.value === '' && discountAmount !== '0' && discountAmount !== 0) {
          setErrors((prevErrors) => ({ ...prevErrors, remarks: 'Remarks are required when adjusting the amount' }));
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, remarks: undefined }));
        }
      }}
    />
    {errors.remarks && <p className="text-red-500 text-sm mt-2">{errors.remarks}</p>}
  </div>
)}
  
        </div>

        {/* Rate Card Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Rate Card Name</label>
            <Dropdown
             className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline
              ${errors.rateName ? 'border-red-400' : isOrderUpdate && elementsToHide.includes("ClientAgeInput") ? 'border-yellow-500' : 'border-gray-300'}
              focus:border-blue-300 focus:ring focus:ring-blue-300`}
            
              
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Rate Card Name"
              value={selectedValues.rateName.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
              options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
              disabled={isOrderUpdate && !elementsToHide.includes("ClientAgeInput")}
            />
            {errors.rateName && <span className="text-red-500 text-sm">{errors.rateName}</span>}
          </div>

          {/* Category */}
          {/* <div name="RatesCategorySelect" id="17">
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Category</label>
            <Dropdown
             className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 
              ${errors.typeOfAd ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' : ''}`}
            
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Category"
              value={selectedValues.typeOfAd.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'typeOfAd')}
              options={getOptions('typeOfAd', 'rateName')}
            />
            {errors.typeOfAd && <span className="text-red-500 text-sm">{errors.typeOfAd}</span>}
          </div>
          </div> */}
            {/* Type */}
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Type</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline
                ${errors.adType ? 'border-red-400' : isOrderUpdate && elementsToHide.includes("ClientAgeInput") ? 'border-yellow-500' : 'border-gray-300'}
                focus:border-blue-300 focus:ring focus:ring-blue-300 ${isOrderUpdate ? 'border-yellow-500' : 'border-gray-300'}`}
              
              
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Type"
              value={selectedValues.adType.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
              options={getOptions('adType', 'rateName')}
              //disabled={isOrderUpdate && !elementsToHide.includes("ClientAgeInput")}
            />
            {errors.adType && <span className="text-red-500 text-sm">{errors.adType}</span>}
          </div>

          
        </div>

        <div id="19" name="RatesLocationSelect">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location */}
          {/* <div>
            <label className='block text-gray-700 font-semibold mb-2'>Location</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.Location ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' :''}`}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Location"
              value={selectedValues.Location.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'Location')}
              options={getOptions('Location', 'adType')}
            />
            {errors.Location && <span className="text-red-500 text-sm">{errors.Location}</span>}
          </div> */}
          {/* Package */}
          {/* <div>
            <label className='block text-gray-700 font-semibold mb-2'>Package</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.Package ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' :''}`}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Package"
              value={selectedValues.Package.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'Package')}
              options={getOptions('Package', 'Location')}
            />
            {errors.Package && <span className="text-red-500 text-sm">{errors.Package}</span>}
          </div> */}

          {/* Vendor */}
          {/* <div>
            <label className='block text-gray-700 font-semibold mb-2'>Vendor</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.Vendor ? 'border-red-400' : ''}`}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Vendor"
              value={selectedValues.vendorName.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'vendorName')}
              options={getOptions('vendorName','Location')}
              // options={vendors}
              // optionLabel="label"
              // optionGroupLabel="label"
              // optionGroupChildren="options"
              disabled={isOrderUpdate} 
            />
            {errors.vendorName && <span className="text-red-500 text-sm">{errors.vendorName}</span>}
          </div> */}
        </div>

        {/* Margin Amount and Margin Percentage */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Margin Amount</label>
            <input 
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginAmount ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' :''}`}
              type="number"
              placeholder="Margin Amount"
              value={marginAmount || ''}
              onChange={handleMarginAmountChange}
              onFocus={e => e.target.select()}
            />
            {errors.marginAmount && <span className="text-red-500 text-sm">{errors.marginAmount}</span>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Margin %</label>
            <input 
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginPercentage ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' :''}`} 
              type="number"
              placeholder="Margin %"
              value={marginPercentage || ''}
              onChange={handleMarginPercentageChange}
              onFocus={e => e.target.select()}
            />
            {errors.marginPercentage && <span className="text-red-500 text-sm">{errors.marginPercentage}</span>}
          </div> */}
          {/* Quantity */}
          {/* <div id="25" name='OrderQuantityText'>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity</label>
                      <input 
                        // required = {elementsToHide.includes("OrderQuantityText") ? false : true}
                        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.qty ? 'border-red-400' : isOrderUpdate ? 'border-yellow-500' :''}`}
                        type='number' 
                        value={qty} 
                        //onWheel={ event => event.currentTarget.blur() } 
                        onChange={e => {setQty(e.target.value); 
                          if (errors.orderNumber) {
                          setErrors((prevErrors) => ({ ...prevErrors, orderNumber: undefined }));
                        }
                      }}  
                        onFocus={(e) => {e.target.select()}}/>
                        </div>
                        {errors.qty && <span className="text-red-500 text-sm">{errors.qty}</span>} */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-4">
          {/* All fields commented out for mobile app - Category, Location, Package, Vendor, Margin Amount, Margin %, Quantity, Release Dates */}
        </div>
        
      </form>
    </div>
    {/* Order Details */}
<div className="bg-white rounded-lg shadow-lg mt-2">
<div className="p-4 md:p-8" >
    <div className="flex justify-between items-center rounded-lg text-blue-500">
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-2">Client Details</h3>
      </div>
      
      <span className="cursor-pointer text-sm mb-2" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Show less' : 'Show more'}</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-1">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
        <p className="text-gray-500 text-xs mb-1">Name</p>
        <p className="truncate text-black">{displayClientName}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
        <p className="text-gray-500 text-xs mb-1">Consultant</p>
        <p className="truncate text-black">{consultantName}</p>
      </div>
       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative" id="4" name="RateWiseOrderNumberText">
       <p className="text-gray-500 text-xs mb-1">Previous Order#</p>
       <p className="text-black">{previousRateWiseOrderNumber}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative" id="4" name="RateWiseOrderNumberText">
      <p className="text-gray-500 text-xs mb-1">Next Order#</p>
       {/* <p className="text-black">{nextRateWiseOrderNumber}</p> */}
       {!isOrderUpdate && <p className="text-black">{nextRateWiseOrderNumber}</p>}

       </div>
       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative" id="21" name="OrderNumberText">
       <p className="text-gray-500 text-xs mb-1">Previous Order#</p>
       <p className="text-black">{previousOrderNumber}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative" id="21" name="OrderNumberText">
      <p className="text-gray-500 text-xs mb-1">Next Order#</p>
       {/* <p className="text-black">{maxOrderNumber}</p> */}
       {!isOrderUpdate && <p className="text-black">{maxOrderNumber}</p>}

       </div>
    </div>
    <label className={`text-gray-500 text-sm hover:cursor-pointer p-1 ${isOrderUpdate ? 'text-yellow-500' : ''}`}>Change Consultant? <span className='underline text-sky-500 hover:text-sky-600' onClick={consultantDialog}>Click Here</span></label>
  </div>
  {isExpanded && (
    <form className="space-y-6 p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {/* Left section */}
        <div className="md:col-span-1">
          <h3 className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 mb-4">Previous Order Details</h3>
          {hasPreviousOrder ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Order#</p>
                <p className="text-black">{previousRateWiseOrderNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Order Date</p>
                <p className="text-black">{previousOrderDate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Rate Card</p>
                <p className="text-black">{previousRateName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Type</p>
                <p className="text-black">{previousAdType}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Order Amount</p>
                <p className="text-black">₹{previousOrderAmount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                <p className="text-gray-500 text-xs mb-1">Consultant</p>
                <p className="text-black">{previousConsultantName}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No previous order details found.</p>
          )}
        </div>
        {/* Right section */}
        <div className="md:col-span-1">
          <h3 className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 mb-4">Current Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Order#</p>
              <p className="text-black">{nextRateWiseOrderNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Order Date</p>
              <p className="text-black">{formattedOrderDate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Rate Card</p>
              <p className="text-black">{selectedValues.rateName.value}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Type</p>
              <p className="text-black">{selectedValues.adType.value}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Order Amount</p>
              <p className="text-black">₹{Math.floor(unitPrice)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
              <p className="text-gray-500 text-xs mb-1">Consultant</p>
              <p className="text-black">{consultantName}</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )}
</div>
  </div>
  {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
  {toast && <ToastMessage message={toastMessage} type="warning"/>}
</div>


);
};

export default CreateOrder;