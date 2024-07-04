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

const CreateOrder = () => {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const [clientName, setClientName] = useState("");
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState("");
    const [maxOrderNumber, setMaxOrderNumber] = useState("");
    const [marginAmount, setMarginAmount] = useState(0);
    const [marginPercentage, setMarginPercentage] = useState("");
    const [releaseDates, setReleaseDates] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [elementsToHide, setElementsToHide] = useState([])
    const [clientEmail, setClientEmail] = useState("");
    const [clientSource, setClientSource] = useState("")
    const [receivable, setReceivable] = useState("");
    const [address, setAddress] = useState('');
    const [DOB, setDOB] = useState('');
    const [consultantName, setConsultantName] = useState('');
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
    
    useEffect(() => {
      fetchMaxOrderNumber();
      elementsToHideList();
      fetchRates();
      fetchCampaignUnits();
      calculateReceivable();
    },[])

    

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

      dispatch(setRateId(data.RateID));
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
        dispatch(setOrderData({ clientName: name }))
        dispatch(setOrderData({ clientNumber: number }))
        fetchClientDetails(number);
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

      const createNewOrder = async(event) => {
        event.preventDefault()
        var receivable = (unitPrice * qty) + marginAmount
        var payable = unitPrice * qty
        var orderOwner = companyName === 'Baleen Media' ? clientSource === '6.Own' ? loggedInUser : 'leenah_cse': loggedInUser;

        if (validateFields()) {
        
        try {
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateNewOrder.php/?JsonUserName=${loggedInUser}&JsonUserName=${loggedInUser}&JsonOrderNumber=${maxOrderNumber}&JsonRateId=${rateId}&JsonClientName=${clientName}&JsonClientContact=${clientNumber}&JsonClientSource=${clientSource}&JsonOwner=${orderOwner}&JsonCSE=${loggedInUser}&JsonReceivable=${receivable}&JsonPayable=${payable}&JsonRatePerUnit=${unitPrice}&JsonConsultantName=${consultantName}&JsonMarginAmount=${marginAmount}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCategory=${selectedValues.Location.value + " : " + selectedValues.Package.value}&JsonType=${selectedValues.adType.value}&JsonHeight=${qty}&JsonWidth=1&JsonLocation=${selectedValues.Location.value}&JsonPackage=${selectedValues.Package.value}&JsonGST=${rateGST.value}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonClientAddress=${address}&JsonBookedStatus=Booked&JsonUnits=${selectedUnit.value}&JsonMinPrice=${unitPrice}&JsonRemarks=${remarks}&JsonContactPerson=${clientContactPerson}&JsonReleaseDates=${releaseDates}&JsonDBName=${companyName}&JsonClientAuthorizedPersons=${clientEmail}`)
            const data = await response.json();
            if (data === "Values Inserted Successfully!") {
                // dispatch(setIsOrderExist(true));
                // window.alert('Work Order #'+ maxOrderNumber +' Created Successfully!')
                // MP-101
                setSuccessMessage('Work Order #'+ maxOrderNumber +' Created Successfully!');
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
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumber.php/?JsonDBName=${companyName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setMaxOrderNumber(data);
        dispatch(setOrderData({ maxOrderNumber: data }))
        } catch (error) {
          console.error(error);
        }
      };

      const elementsToHideList = () => {
        try{
          fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
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
    if (!selectedValues.typeOfAd) errors.typeOfAd = 'Category is required';
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
  
    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
            <form className="px-7 h-screen grid justify-center items-center" onSubmit={createNewOrder}>
                <div className="grid gap-6" id="form">
                    <h1 className="font-bold text-3xl text-center mb-4">Order Generation</h1>
                    <div>
                    <label className="block text-gray-700 font-semibold mb-2">Client Name</label>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Client Name'    
                        // required 
                        value={clientName}
                        onChange={handleSearchTermChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            e.preventDefault();
                            // Find the next input field and focus on it
                            const inputs = document.querySelectorAll('input, select, textarea');
                            const index = Array.from(inputs).findIndex(input => input === e.target);
                            if (index !== -1 && index < inputs.length - 1) {
                                inputs[index + 1].focus();
                            }
                            }
                        }}
                    />
                    {(clientNameSuggestions.length > 0 && clientName !== '') && (
                        <ul className="list-none">
                            {clientNameSuggestions.map((name, index) => (
                            <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
                                <button
                                type="button"
                                className="text-black"
                                onClick={handleClientNameSelection}
                                value={name}
                                >
                                {name}
                                </button>
                            </li>
                            ))}
                        </ul>
                        )}
 </div>   
 {errors.clientName && <span className="text-red-500 text-sm">{errors.clientName}</span>}
                        <ul className="list-none">
                            <li className="p-2 text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition rounded-md
                            duration-300">
                                <option className='font-bold '>Short Summary</option>
                                <option>Rate Card Name: {selectedValues.rateName.value}</option>
                                <option>Type: {selectedValues.adType.value}</option>
                                <option>Unit Price: Rs. {unitPrice} per {selectedUnit.value}</option>
                                <option>Consultant: {consultantName}</option>
                            </li>
                        </ul>
                        
                    {/* <label className='text-black hover:cursor-pointer' onClick={() => router.push('/')}>New Client? Click Here</label>  */}
                    <label className='text-black hover:cursor-pointer'>New Client? <span 
                      className='underline text-green-500 hover:text-green-600' 
                      onClick={() => router.push('/')}
                      >
                    Click Here
                   </span>
                  </label>
                   {/* MP-99 */}
                  <div>
                      <label className='block mb-2 mt-4 text-gray-700 font-semibold'>Rate Card Name</label>
                      <div className='flex w-full'>
                        <Select
                          className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              width: 'auto', // adjust the width as needed
                              minHeight: '50px', // adjust the height as needed
                            }),
                          }}
                          id="13"
                          name="RateCardNameSelect"
                          // required
                          placeholder="Select Rate Card Name"
                          value={selectedValues.rateName}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                          options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                        />
                      </div>
                    </div>
                    {errors.rateName && <span className="text-red-500 text-sm">{errors.rateName}</span>}
                    <div name="RatesCategorySelect" id="17">
                    <label className='block mb-2 text-gray-700 font-semibold'>Category</label>
                    <div className='flex w-full'>
                      <Select
                        className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            width: 'auto', // adjust the width as needed
                            minHeight: '50px', // adjust the height as needed
                          }),
                        }}
                        placeholder="Select Category"
                        value={selectedValues.typeOfAd}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'typeOfAd')}
                        options={getOptions('typeOfAd', 'rateName')}
                        // options={filters.typeOfAd}
                        // required
                      />
                    </div>
                  </div>
                  {errors.typeOfAd && <span className="text-red-500 text-sm">{errors.typeOfAd}</span>}
                  <div>
                    <label className='block mb-2 text-gray-700 font-semibold'>Type</label>
                    <div className='flex w-full'>
                      <Select
                        className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            width: 'auto', // adjust the width as needed
                            minHeight: '50px', // adjust the height as needed
                          }),
                        }}
                        id="adTypeSelect"
                        name="adTypeSelect"
                        placeholder="Select Type"
                        // required
                        value={selectedValues.adType}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                        options={getOptions('adType', 'typeOfAd')}
                      />
                    </div>
                  </div>
                  {errors.adType && <span className="text-red-500 text-sm">{errors.adType}</span>}
                  

                  {/* Location of the Rate for GS */}
                  <div id="19" name="RatesLocationSelect">
                    <label className='block mb-2 text-gray-700 font-semibold'>Location</label>
                    <div className='flex w-full'>
                      <Select
                        className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            width: 'auto', // adjust the width as needed
                            minHeight: '50px', // adjust the height as needed
                          }),
                        }}
                        placeholder="Select Location"
                        value={selectedValues.Location}
                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'Location')}
                        options={getOptions('Location', 'adType')}
                        // required
                      />
                    </div>
                  </div>
                  {errors.Location && <span className="text-red-500 text-sm">{errors.Location}</span>}
                  {/* {filters.package.length > 0 ?  */}
                  
                  {/* {(packageOptions.length > 1 || isNewRate) && ( */}
                  <div name="RatesPackageSelect">
                  <label className='block mb-2 text-gray-700 font-semibold' name="RatesPackageSelect">Package</label>
                  <div className='flex w-full'>
                    <Select
                      className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          width: 'auto', // adjust the width as needed
                          minHeight: '50px', // adjust the height as needed
                        }),
                      }}
                      id="21"
                      name="RatesPackageSelect"
                      placeholder="Select Package"
                      value={selectedValues.Package}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'Package')}
                      options={getOptions('Package', 'Location')}
                      // required = {isNewRate ? true : false}
                    />
                  </div>
                </div>
                {errors.Package && <span className="text-red-500 text-sm">{errors.Package}</span>}
                  {/* )} */}
                <></>

                <div id="23" name="RatesVendorSelect">
                  <label className="block mb-2 text-gray-700 font-semibold">Vendor</label>
                  <div className='flex w-full'>
                  <Select
                    className="p-0 glass shadow-2xl w-full focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        width: 'auto', // adjust the width as needed
                        minHeight: '50px', // adjust the height as needed
                      }),
                    }}
                    placeholder="Select Vendor"
                    value={selectedValues.vendorName}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, 'vendorName')}
                    options={vendors}
                    // required
                  />
                  </div>
                </div>
                {/* MP-99 */}
                {errors.vendorName && <span className="text-red-500 text-sm">{errors.vendorName}</span>}
                    <div class="w-full gap-3 flex">
                    <div name="OrderMarginAmount">
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderMarginAmount">Margin Amount</label>
                        <input className="p-3 capitalize shadow-2xl glass w-52 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin Amount" 
                            name="MarginText" 
                            // required = {elementsToHide.includes('OrderMarginAmount') ? false : true}
                            value={marginAmount || ''}
                            onChange={handleMarginAmountChange }
                            onFocus={e => e.target.select()}
                        />
                        </div>
                        <div name="OrderMarginPercentage">
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderMarginPercentage">Margin %</label>
                        <input className="p-3 capitalize shadow-2xl glass w-28 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin %" 
                            name="MarginText" 
                            value={marginPercentage || ''}
                            // required = {elementsToHide.includes("OrderMarginPercentage") ? false : true}
                            onChange={handleMarginPercentageChange}
                            onFocus={e => e.target.select()}
                        />
                        </div>
                    </div>
                    
                    {errors.marginAmount && <span className="text-red-500 text-sm">{errors.marginAmount}</span>}
                        {errors.marginPercentage && <span className="text-red-500 text-sm">{errors.marginPercentage}</span>}
                    <div id="25" name='OrderQuantityText'>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity</label>
                      <input 
                        // required = {elementsToHide.includes("OrderQuantityText") ? false : true}
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
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
                    <div name="OrderRemarks">
                    <label className="block text-gray-700 font-semibold mb-2">Remarks</label>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
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
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderReleaseDate">Release Date</label>
                    <input 
                        type='date' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        value={new Date()}
                        onChange={e => setReleaseDates([...releaseDates, e.target.value])}  
                      />
                    </div>
                    <div className='text-center justify-start' name="OrderReleaseDate">
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
                  </div>
                     <button className="outline-none glass shadow-2xl w-full p-3 mb-24 bg-[#ffffff] hover:border-[#b7e0a5] border-[2px] hover:border-solid hover:border-[3px]  hover:text-[#008000] font-bold rounded-md" type="submit">Submit</button>
                </div>
            </form>
            {/* MP-101 */}
  {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
        </div>
    );
}

export default CreateOrder;
