'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/store';
import IconButton from '@mui/material/IconButton';
import { Padding, RemoveCircleOutline } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setOrderData, resetOrderData, setIsOrderExist  } from '@/redux/features/order-slice';

import Select from 'react-select';
import { setSelectedValues, setRateId, setSelectedUnit, setRateGST, setSlabData, setStartQty, resetRatesData} from '@/redux/features/rate-slice';
import { TextField } from '@mui/material';
import { formattedMargin } from '../adDetails/ad-Details';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './styles.css';
import { Calendar } from 'primereact/calendar';
import { format } from 'date-fns';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const CreateOrder = () => {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const clientDetails = useAppSelector(state => state.clientSlice)
    const {clientName: clientNameCR, consultantName: consultantNameCR, clientContact: clientNumberCR, clientID: clientIDCR} = clientDetails;
    const [clientName, setClientName] = useState(clientNameCR || "");
    const dbName = useAppSelector(state => state.authSlice.companyName);
    const companyName = "Baleen Test";
    // const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState(clientNumberCR || "");
    const [maxOrderNumber, setMaxOrderNumber] = useState("");
    const [nextRateWiseOrderNumber, setNextRateWiseOrderNumber] = useState("");
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
    const [consultantName, setConsultantName] = useState(consultantNameCR || '');
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
  const [units, setUnits] = useState([])
  const [isSlabAvailable, setIsSlabAvailable] = useState(false)
  const [showCampaignDuration, setShowCampaignDuration] = useState(false)
  const [leadDays, setLeadDays] = useState(0);
  const [campaignDuration, setCampaignDuration] = useState("");
  const [selectedCampaignUnits, setSelectedCampaignUnits] = useState("");
  const [campaignUnits, setCampaignUnits] = useState([]); 
  // const [validityDays, setValidityDays] = useState(0)
  // const [initialState, setInitialState] = useState({ validityDays: '', rateGST: "" });
    
    const dispatch = useDispatch();
    const router = useRouter();
    const selectedValues = useAppSelector(state => state.rateSlice.selectedValues);
    const rateId = useAppSelector(state => state.rateSlice.rateId);
    const selectedUnit = useAppSelector(state => state.rateSlice.selectedUnit); 
    const slabData = useAppSelector(state => state.rateSlice.slabData); 
    const rateGST = useAppSelector(state => state.rateSlice.rateGST);
    const startQty = useAppSelector(state => state.rateSlice.startQty);


    const [qty, setQty] = useState(startQty);
    const [unitPrice, setUnitPrice] = useState(0);
    // const receivable = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18));

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
    
// console.log(clientDetails)
     // Function to toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
    
    useEffect(() => {
      fetchMaxOrderNumber();
      elementsToHideList();
      fetchRates();
      fetchCampaignUnits();
      calculateReceivable();
    },[])

    useEffect(() => {
      setClientName(clientNameCR || '');
      setConsultantName(consultantNameCR || '');
      setClientID(clientIDCR || '');
      setClientNumber(clientNumberCR || '');
      dispatch(setOrderData({ clientName: clientNameCR, clientNumber: clientNumberCR, clientID: clientIDCR, consultantName: consultantNameCR }))
      fetchPreviousOrderDetails(clientNumberCR, clientNameCR);
    }, [clientNameCR, clientIDCR]);

    useEffect(() => {
      calculateReceivable();
    },[unitPrice, marginAmount])

    // MP-99    
//rate cards

useEffect(() => {
  if(rateId > 0){
    handleRateId()
    fetchQtySlab()
  } else {
    setUnitPrice(0);
  }
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
  try {
    const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}&JsonDBName=${companyName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    dispatch(setSlabData(data));
    // const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
    const sortedData = [...data].sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
    const firstSelectedSlab = sortedData[0];
    if(firstSelectedSlab){
      dispatch(setStartQty(firstSelectedSlab.StartQty));
      setQty(firstSelectedSlab.StartQty);
      setUnitPrice(firstSelectedSlab.UnitPrice);
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
  fetchMaxOrderNumber();
  fetchUnits();
  fetchAllVendor();
  fetchQtySlab()
},[selectedValues.adType, selectedValues.rateName])

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

      // dispatch(setRateId(data.RateID));
      dispatch(setSelectedUnit({label: data.Units, value: data.Units}));

    // setCampaignDuration(data['CampaignDuration(in Days)']);
    // if(data.campaignDurationVisibility === 1){
    //   setShowCampaignDuration(true)
    // } else{
    //   setShowCampaignDuration(false)
    // }
    // setSelectedCampaignUnits({label: data.CampaignDurationUnit, value: data.CampaignDurationUnit})
    // setRateGST({label: data.rategst, value: data.rategst})
    dispatch(setRateGST({label: data.rategst, value: data.rategst}));
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

// Function to handle dropdown selection
const handleSelectChange = (selectedOption, filterKey) => {
  dispatch(setRateId(""));
  // setIsNewRate(true);
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
    // // setRateGST({label: selectedRate.rategst, value: selectedRate.rategst})
    // dispatch(setRateGST({label: selectedRate.rategst, value: selectedRate.rategst}));
    setLeadDays(selectedRate.LeadDays);
    // setValidTill(selectedRate.ValidityDate)
    // setValidityDate(selectedRate.ValidityDate)
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
      const newUnitPrice = findUnitPrice();
      setUnitPrice(newUnitPrice);
    }, [qty])

    const handleSearchTermChange = (event) => {
        const newName = event.target.value
        fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
          .then((response) => response.json())
          .then((data) => setClientNameSuggestions(data));
        setClientName(newName);
        dispatch(setOrderData({ clientName: clientName }))
        if (errors.clientName) {
          setErrors((prevErrors) => ({ ...prevErrors, clientName: undefined }));
        }
      };

      const handleClientNameSelection = (event) => {
        const input = event.target.value;
        const name = input.substring(0, input.indexOf('(')).trim();
        const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
    
        setClientName(name);
        setClientNumber(number);
        dispatch(setOrderData({ clientName: name, clientNumber: number  }))
        fetchClientDetails(number);
        fetchPreviousOrderDetails(number, name);
        setClientNameSuggestions([]);
      };

      const fetchClientDetails = (clientNumber) => {
        axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientContact=${clientNumber}&JsonDBName=${companyName}`)
          .then((response) => {
            const data = response.data;
            if (data && data.length > 0) {
              const clientDetails = data[0];
              dispatch(setOrderData({ clientEmail: clientDetails.email }))
              dispatch(setOrderData({ clientSource: clientDetails.source }))
              dispatch(setOrderData({ address: clientDetails.address || "" }))
              dispatch(setOrderData({ consultantName: clientDetails.consname || "" }))
              dispatch(setOrderData({ clientGST: clientDetails.GST || "" }))
              dispatch(setOrderData({ clientContactPerson: clientDetails.ClientContactPerson || "" }))
   
              //MP-69-New Record are not fetching in GS
              setClientID(clientDetails.id);
              setClientEmail(clientDetails.email);
              setClientSource(clientDetails.source);
              setAddress(clientDetails.address || "");
              setConsultantName(clientDetails.consname || "");
              setClientGST(clientDetails.GST || "");
              setClientContactPerson(clientDetails.ClientContactPerson || "");
              
            if (clientDetails.GST && clientDetails.GST.length >= 15 && (!clientDetails.ClientPAN || clientDetails.ClientPAN === "")) {
              const pan = clientDetails.GST.slice(2, 12); // Correctly slice GST to get PAN
              setClientPAN(pan || "");
        dispatch(setOrderData({ clientPAN: pan || "" }))
            } else {
              setClientPAN(clientDetails.ClientPAN || "");
        dispatch(setOrderData({ clientPAN: clientDetails.ClientPAN || "" }))
            }
            } else {
              console.warn("No client details found for the given name and contact number.");
            }
          })
          .catch((error) => {
            console.error("Error fetching client details:", error);
          });
      };

      const fetchPreviousOrderDetails = (clientNumber, clientName) => {
        axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchPreviousOrderDetailsTest.php?ClientContact=${clientNumber}&ClientName=${clientName}&JsonDBName=${companyName}`)
          .then((response) => {
            const data = response.data;
            if (data.length > 0) {
              const clientDetails = data[0];
              const formattedDate = parseDateFromDB(clientDetails.orderDate);
              // dispatch(setRateId(""));
              // setOrderDate(clientDetails.orderDate);
              // setDisplayOrderDate(formattedDate);
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
              
              dispatch(setRateId(clientDetails.rateID));
              setHasPreviousOrder(true);
            } else {
              setHasPreviousOrder(false); // Set to false if there are no details
            }
          })
          
          .catch((error) => {
            console.error(error);
          });
      };


      const createNewOrder = async(event) => {
        event.preventDefault()
        var receivable = (unitPrice * qty) + marginAmount
        var payable = unitPrice * qty
        var orderOwner = companyName === 'Baleen Media' ? clientSource === '6.Own' ? loggedInUser : 'leenah_cse': loggedInUser;

        if (validateFields()) {
          const formattedOrderDate = formatDateToSave(orderDate);
        try {
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateNewOrderTest.php/?JsonUserName=${loggedInUser}&JsonUserName=${loggedInUser}&JsonOrderNumber=${maxOrderNumber}&JsonRateId=${rateId}&JsonClientName=${clientName}&JsonClientContact=${clientNumber}&JsonClientSource=${clientSource}&JsonOwner=${orderOwner}&JsonCSE=${loggedInUser}&JsonReceivable=${receivable}&JsonPayable=${payable}&JsonRatePerUnit=${unitPrice}&JsonConsultantName=${consultantName}&JsonMarginAmount=${marginAmount}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCategory=${selectedValues.Location.value + " : " + selectedValues.Package.value}&JsonType=${selectedValues.adType.value}&JsonHeight=${qty}&JsonWidth=1&JsonLocation=${selectedValues.Location.value}&JsonPackage=${selectedValues.Package.value}&JsonGST=${rateGST.value}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonClientAddress=${address}&JsonBookedStatus=Booked&JsonUnits=${selectedUnit.value}&JsonMinPrice=${unitPrice}&JsonRemarks=${remarks}&JsonContactPerson=${clientContactPerson}&JsonReleaseDates=${releaseDates}&JsonDBName=${companyName}&JsonClientAuthorizedPersons=${clientEmail}&JsonOrderDate=${formattedOrderDate}&JsonRateWiseOrderNumber=${nextRateWiseOrderNumber}`)
            const data = await response.json();
            if (data === "Values Inserted Successfully!") {
                // dispatch(setIsOrderExist(true));
                // window.alert('Work Order #'+ maxOrderNumber +' Created Successfully!')
                // MP-101
                setSuccessMessage('Work Order #'+ nextRateWiseOrderNumber +' Created Successfully!');
                dispatch(setIsOrderExist(true));
                
                setTimeout(() => {
                setSuccessMessage('');
                router.push('/FinanceEntry');
              }, 3000);
                
              //setMessage(data.message);
            } else {
              alert(`The following error occurred while inserting data: ${data}`);
            }
          } catch (error) {
            console.error('Error updating rate:', error);
          }
        } else {
          // MP-101
          setToastMessage('Please fill all necessary fields.');
    setSeverity('error');
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 2000);
      }
       }

      const fetchMaxOrderNumber = async () => {
        try {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumberTest.php/?JsonDBName=${companyName}&JsonRateName=${selectedValues.rateName.value}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setMaxOrderNumber(data.nextOrderNumber);
          setNextRateWiseOrderNumber(data.nextRateWiseOrderNumber);
        dispatch(setOrderData({ maxOrderNumber: data }))
        dispatch(setOrderData({ nextRateWiseOrderNumber: data }))
        } catch (error) {
          console.error(error);
        }
      };

      const elementsToHideList = () => {
        try{
          fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${dbName}`)
            .then((response) => response.json())
            .then((data) => setElementsToHide(data));
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
    // Ensure qty, unitPrice, marginAmount, and rateGST are accessible in the scope of this function
    const validQty = Number(qty);
    const validUnitPrice = Number(unitPrice);
    const validMarginAmount = marginAmount ? Number(marginAmount) : 0; // Default to 0 if marginAmount is empty or undefined
    const validRateGST = rateGST && !isNaN(rateGST.value) ? Number(rateGST.value) : 0; // Default to 0 if rateGST.value is not a number
  
  
    const subtotalWithoutGST = validQty * validUnitPrice + validMarginAmount;
    const gstAmount = subtotalWithoutGST * (validRateGST / 100);
    const amountInclGST = subtotalWithoutGST + gstAmount;
    // Set the state with amountInclGST
    setReceivable(amountInclGST);
    // Dispatch action to set order data with receivable amount
    dispatch(setOrderData({ receivable: amountInclGST }));
  };
  


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
  const validateFields = () => {
    let errors = {};

    if (!clientName) errors.clientName = 'Client Name is required';
    if (!selectedValues.rateName) errors.rateName = 'Rate Card Name is required';
    if (elementsToHide.includes("OrderMarginAmount") === false) {
    if (!selectedValues.typeOfAd) errors.typeOfAd = 'Category is required';
    }
    if (!selectedValues.adType) errors.adType = 'Type is required';

    if (elementsToHide.includes("OrderQuantityText") === false) {
      if (!qty || isNaN(qty)) errors.qty = 'Quantity is required';
    }
    if (elementsToHide.includes("OrderMarginAmount") === false) {
      if (!marginAmount || isNaN(marginAmount)) errors.marginAmount = 'Valid Margin Amount is required';
    }
    if (elementsToHide.includes("RatesVendorSelect") === false) {
      if (!selectedValues.vendorName) errors.vendorName = 'Vendor is required';
    }
    if (elementsToHide.includes("RatesPackageSelect") === false) {
      if (!selectedValues.Location) errors.Package = 'Package is required';
    }
    if (elementsToHide.includes("RatesLocationSelect") === false) {
      if (!selectedValues.Location) errors.Location = 'Location is required';
    }
    if (elementsToHide.includes("OrderMarginPercentage") === false) {
      if (!marginPercentage || isNaN(marginPercentage)) errors.marginPercentage = 'Valid Margin % is required';
    }
    

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
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day);
}

const formattedOrderDate = format(orderDate, 'dd-MMM-yyyy').toUpperCase();

const consultantDialog = () => {
  setConsultantDialogOpen(true); 
};


const handleCloseDialog = () => {
  setConsultantName('');
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

const handleConsultantNameSelection = (event) => {
  const input = event.target.value;
  const name = input.substring(0, input.indexOf('(')).trim();
  const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();

  setConsultantNameSuggestions([]);
  setConsultantName(name)
  // dispatch(setClientData({ consultantName: name || "" }));
  setConsultantNumber(number);
  // fetchConsultantDetails(name, number);
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
  <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-blue-500 mb-1">Order Generation</h2>
        <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-4">Place your orders here</p>
      </div>
      {/* <button className="expand-button" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide Client Details' : 'Show Client Details'}
        </button>*/}
      <button className="custom-button" onClick={createNewOrder}>Place Order</button> 
    </div>
    



    {/* Order Selection */}
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <form className="space-y-4">
      <h3 className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 ">Select Your Order</h3>
          {/* Client Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Client Name</label>
            <input 
              type='text' 
              className={`w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.clientName ? 'border-red-400' : ''}`}
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
            />
            {(clientNameSuggestions.length > 0 && clientName !== '') && (
              <ul className="list-none bg-white shadow-lg rounded-md mt-2">
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
            {errors.clientName && <span className="text-red-500 text-sm">{errors.clientName}</span>}
          {/* New Client */}
        <label className='text-gray-500 text-sm hover:cursor-pointer'>New Client? <span className='underline text-sky-500 hover:text-sky-600' onClick={() => router.push('/')}>Click Here</span></label>
          </div>
          <div>
                    <label className="block mb-1 font-medium">Order Date</label>
                    <div>
                  <div>
                    <Calendar
                      type="date"
                      value={displayOrderDate}
                      onChange={handleDateChange}
                      placeholder="dd-M-yyyy"
                      showIcon
                      dateFormat='dd-M-yy'
                      className={`w-full px-4 h-12 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderDate ? 'border-red-400' : ''}`}
                      inputClassName="p-inputtext-lg"
                    />
                  </div>
                   </div>
                  </div>
        </div>
        
        {/* Short Summary */}
        {/* <div className="bg-gradient-to-r from-green-300 via-green-300 to-green-500 p-4 rounded-md shadow-lg mt-6">
          <h3 className="font-bold text-black mb-2">Short Summary</h3>
          <p>Rate Card Name: {selectedValues.rateName.value}</p>
          <p>Type: {selectedValues.adType.value}</p>
          <p>Unit Price: Rs. {unitPrice} per {selectedUnit.value}</p>
          <p>Consultant: {consultantName}</p>
        </div> */}

        
        
        {/* Rate Card Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Rate Card Name</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.rateName ? 'border-red-400' : ''}`}
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
            />
            {errors.rateName && <span className="text-red-500 text-sm">{errors.rateName}</span>}
          </div>

          {/* Category */}
          <div name="RatesCategorySelect" id="17">
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Category</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.typeOfAd ? 'border-red-400' : ''}`}
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
          </div>
            {/* Type */}
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Type</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.adType ? 'border-red-400' : ''}`}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '50px',
                }),
              }}
              placeholder="Select Type"
              value={selectedValues.adType.value}
              onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
              options={getOptions('adType', 'typeOfAd')}
            />
            {errors.adType && <span className="text-red-500 text-sm">{errors.adType}</span>}
          </div>
          
        </div>

        <div id="19" name="RatesLocationSelect">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location */}
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Location</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.Location ? 'border-red-400' : ''}`}
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
          </div>
          {/* Package */}
          <div>
            <label className='block text-gray-700 font-semibold mb-2'>Package</label>
            <Dropdown
              className={`w-full border rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.Package ? 'border-red-400' : ''}`}
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
          </div>

          {/* Vendor */}
          <div>
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
              options={vendors}
              optionLabel="label"
              optionGroupLabel="label"
               optionGroupChildren="options"
            />
            {errors.vendorName && <span className="text-red-500 text-sm">{errors.vendorName}</span>}
          </div>
        </div>

        {/* Margin Amount and Margin Percentage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Margin Amount</label>
            <input 
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginAmount ? 'border-red-400' : ''}`}
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
              className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginPercentage ? 'border-red-400' : ''}`} 
              type="number"
              placeholder="Margin %"
              value={marginPercentage || ''}
              onChange={handleMarginPercentageChange}
              onFocus={e => e.target.select()}
            />
            {errors.marginPercentage && <span className="text-red-500 text-sm">{errors.marginPercentage}</span>}
          </div>
          <div id="25" name='OrderQuantityText'>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity</label>
                      <input 
                        // required = {elementsToHide.includes("OrderQuantityText") ? false : true}
                        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.qty ? 'border-red-400' : ''}`}
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
                        {errors.qty && <span className="text-red-500 text-sm">{errors.qty}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 mb-4">
        <div name="OrderRemarks">
                    <label className="block text-gray-700 font-semibold mb-2">Remarks</label>
                    <input 
                        type='text' 
                        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.remarks ? 'border-red-400' : ''}`}
                        placeholder='Remarks'    
                        value={remarks}
                        onChange={e => {setRemarks(e.target.value);
                          if (errors.orderNumber) {
                            setErrors((prevErrors) => ({ ...prevErrors, orderNumber: undefined }));
                          }
                        }}
                    />
                    </div>
                    <div name="OrderReleaseDate">
                    {/* <label className="block text-gray-700 font-semibold mb-2" name="OrderReleaseDate">Release Date</label>
                    <input 
                        type='date' 
                        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.releaseDates ? 'border-red-400' : ''}`}
                        value={releaseDates}
                        onChange={e => setReleaseDates([...releaseDates, e.target.value])}  
                      /> */}
                      <div>
                    <label className="block mb-1 font-medium">Release Dates</label>
                    <div>
                  <div>
                    <Calendar
                      type="date"
                      value={displayReleaseDate}
                      onChange={handleReleaseDatesChange}
                      // onChange={(e) => setReleaseDates(e.value)}
                      selectionMode="multiple"
                      placeholder="dd-M-yyyy"
                      showIcon
                      dateFormat='dd-M-yy'
                      className={`w-full px-4 h-12 border text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.orderDate ? 'border-red-400' : ''}`}
                      inputClassName="p-inputtext-lg"
                    />
                  </div>
                   </div>
                  </div>
                    </div>
                    {/* <div className='text-center justify-start' name="OrderReleaseDate">
                    {releaseDates.length > 0 ? <h2 className='mt-4 mb-4 font-bold'>Release-Dates</h2> : <></>}
                    <ul className='mb-4'>
                    {releaseDates.map((data, index) => (
                      <div key={index} className='flex'>
                        <option key={data} className="mt-1.5" 
                          >
                            {data}
                          </option>
                          <IconButton aria-label="Remove" className='align-top' onClick={() => removeQtySlab(data.StartQty, index)}>
                          <RemoveCircleOutline color='secondary' fontSize='small'/>
                        </IconButton>
                          </div>
))}
</ul>
                  </div> */}
                  </div>
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
        <p className="truncate text-black">{clientName}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
        <p className="text-gray-500 text-xs mb-1">Consultant</p>
        <p className="truncate text-black">{consultantName}</p>
      </div>
       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
       <p className="text-gray-500 text-xs mb-1">Previous Order#</p>
       <p className="text-black">{previousRateWiseOrderNumber}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
      <p className="text-gray-500 text-xs mb-1">Next Order#</p>
       <p className="text-black">{nextRateWiseOrderNumber}</p>
       </div>
    </div>
    <label className='text-gray-500 text-sm hover:cursor-pointer p-1'>Change Consultant? <span className='underline text-sky-500 hover:text-sky-600' onClick={consultantDialog}>Click Here</span></label>
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
</div>


);
};

export default CreateOrder;