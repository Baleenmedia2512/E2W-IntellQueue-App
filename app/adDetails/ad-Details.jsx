'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import MuiAlert from '@mui/material/Alert';
import { InputTextarea } from 'primereact/inputtextarea';
import { useAppSelector } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { resetQuotesData, setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AddShoppingCart, AddShoppingCartOutlined, ShoppingCartCheckout } from '@mui/icons-material';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { addItemsToCart } from '@/redux/features/cart-slice';
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { FetchAllValidRates, FetchQtySlab, FetchQuoteRemarks, FetchRateSeachTerm, FetchSpecificRateData } from '../api/FetchAPI';
import './page.css';
import { calculateMarginAmount, calculateMarginPercentage } from '../utils/commonFunctions';
import useClickTracker from './Dashboard/useClickTracker'; 

export const formattedMargin = (number) => {
 
  if(isNaN(number)){
    return 0;
  }

  const roundedNumber = (number / 1).toFixed(0);
  return Number((roundedNumber / 1).toFixed(0)); //roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 :
};

const AdDetailsPage = () => {
  useClickTracker();
  const { userName } = useAppSelector((state) => state.authSlice);
  const companyName = "Baleen Media"
  const {
    selectedAdMedium: adMedium,
    selectedAdType: adType,
    selectedAdCategory: adCategory,
    rateId,
    selectedEdition: edition,
    selectedPosition: position,
    selectedVendor,
    quantity: qty,
    unit,
    ratePerUnit: unitPrice,
    campaignDuration,
    marginAmount: margin,
    marginPercentage,
    remarks,
    rateGST,
    width,
    isEditMode: isQuoteEditMode,
    editIndex,
    editQuoteNumber,
    isNewCartOnEdit,
    checked: isChecked
  } = useAppSelector((state) => state.quoteSlice);
  const cartItems = useAppSelector((state) => state.cartSlice.cart);

  // Local state variables
  const [errors, setErrors] = useState({});
  const [datas, setDatas] = useState({
    slabData: [],
    ratesData: [],
    ratesSearchSuggestion: [],
    remarksSuggestion: [],
  });
  const [qtySlab, setQtySlab] = useState({ Qty: 1, Width: 1 });
  const [rateSearchTerm, setRateSearchTerm] = useState("");
  const [selectedDayRange, setSelectedDayRange] = useState("Day");
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [changing, setChanging] = useState(false);
  const [checked, setChecked] = useState({
    bold: false,
    semibold: false,
    color: false,
    tick: false,
    boldPercentage: -1,
    semiboldPercentage: -1,
    colorPercentage: -1,
    tickPercentage: -1
  })

  // Refs
  const marginAmountRef = useRef(null);
  const textAreaRef = useRef(null);

  // Constants
  const routers = useRouter();
  const dispatch = useDispatch();
  const dayRange = ["Month(s)", "Day(s)", "Week(s)"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
   // Filter data and extract relevant item
   const leadDay = datas.ratesData?.find(item => Number(item.rateId) === Number(rateId)) || {};

   // Extract or default values from leadDay
   const minimumCampaignDuration = leadDay['CampaignDuration(in Days)'] || 1;
   const campaignDurationVisibility = leadDay.campaignDurationVisibility || 0;
   const ValidityDate = leadDay.ValidityDate || 0;

   // Calculate base cost
let baseCost = (unit !== "SCM" ? qty : qty * width) * unitPrice * (campaignDuration / minimumCampaignDuration);

// Add additional feature costs to base cost
if (checked.bold) {
  baseCost += baseCost * (checked.boldPercentage / 100);
}
if (checked.semibold) {
  baseCost += baseCost * (checked.semiboldPercentage / 100);
}
if (checked.color) {
  baseCost += baseCost * (checked.colorPercentage / 100);
}
if (checked.tick) {
  baseCost += baseCost * (checked.tickPercentage / 100);
}

// Calculate base price by adding margin to base cost
const basePrice = baseCost + parseInt(margin);

  // Helper to format dates
  const formattedDate = (date) => {
    const inputDate = new Date(date);
    return `${("0" + inputDate.getDate()).slice(-2)}-${months[inputDate.getMonth()]}-${inputDate.getFullYear()}`;
  };

  // Helper to format rupees
  const formattedRupees = (number) => {
    const roundedNumber = Math.round(number);
    return roundedNumber.toLocaleString("en-IN");
  };

  // Fetch data for a specific rate
  const fetchRate = async (rateId) => {
    try {
      const rateData = await FetchSpecificRateData("Baleen Media", rateId);
      const firstRate = rateData[0];

      // Update quote data in Redux
      dispatch(
        setQuotesData({
          selectedAdMedium: firstRate.rateName,
          selectedAdType: firstRate.typeOfAd,
          selectedAdCategory: firstRate.adType,
          selectedEdition: firstRate.Location,
          selectedPosition: firstRate.Package,
          selectedVendor: firstRate.vendorName,
          validityDate: firstRate.ValidityDate,
          leadDays: firstRate.LeadDays,
          ratePerUnit: firstRate.ratePerUnit,
          minimumUnit: firstRate.minimumUnit,
          unit: firstRate.Units,
          isDetails: true,
          rateGST: firstRate.rategst,
          campaignDuration: campaignDuration ? campaignDuration : firstRate['CampaignDuration(in Days)'] || 1
        })
      );

      //set Margin Percentage and Margin
      if (
        isNaN(parseInt(margin)) || parseInt(margin) === 0) {
        handleMarginPercentageChange(firstRate.AgencyCommission);
      }

      // Set width and quantity defaults if necessary
      if (width === 1) dispatch(setQuotesData({ width: firstRate.width }));
      if (qty === 1) dispatch(setQuotesData({ quantity: firstRate.minimumUnit }));
      setQtySlab({Qty: firstRate.minimumUnit, Width: firstRate.width})

    } catch (error) {
      console.error("Error fetching rate data:", error);
    }
  };

  useEffect(() => {
    handleMarginPercentageChange(marginPercentage);
  },[unitPrice])

  // Handle rate search input
  const handleRateSearch = async (e) => {
    setRateSearchTerm(e.target.value);
    const searchSuggestions = await FetchRateSeachTerm("Baleen Media", e.target.value);
    setDatas((prev) => ({
      ...prev,
      ratesSearchSuggestion: searchSuggestions,
    }));
  };

  // Handle rate selection
  const handleRateSelection = async (e) => {
    const selectedRate = e.target.value;
    const selectedRateId = selectedRate.split('-')[0];
    setDatas((prev) => ({ ...prev, ratesSearchSuggestion: [] }));
    setRateSearchTerm(selectedRate);
  
    try {
      // Reuse fetchRate and ensure data is properly set
      dispatch(setQuotesData({ rateId: selectedRateId}));
      dispatch(updateCurrentPage("adDetails"));
    } catch (error) {
      console.error("Error during rate selection:", error);
    }
  };

  // Load form data (slab and rates)
  const LoadFormData = async () => {
    try {
      // Reuse fetchRate for fetching rate data
      await fetchRate(rateId);
  
      // Fetch slab data
      const slabData = await FetchQtySlab("Baleen Media", rateId);
      const sortedSlabData = [...slabData].sort(
        (a, b) => Number(a.StartQty * a.Width) - Number(b.StartQty * b.Width)
      );
  
      const firstSelectedSlab = sortedSlabData[0];
  
      // Fetch all valid rates
      const validRates = await FetchAllValidRates(companyName);
      const filterdata = validRates
        .filter((item) => item.rateId === parseInt(rateId))
        .filter(
          (value, index, self) =>
            self.findIndex((obj) => obj.VendorName === value.VendorName) === index
        )
        .sort((a, b) => a.VendorName.localeCompare(b.VendorName));
  
      // Update datas with fetched data
      setDatas({
        slabData: sortedSlabData,
        ratesData: filterdata,
      });
  
      // Set initial values for slabs
      setQtySlab({ Qty: firstSelectedSlab.StartQty, Width: firstSelectedSlab.Width });
  
      // Update width and quantity if they are default
      if (width === 1) {
        dispatch(setQuotesData({ width: firstSelectedSlab.Width }));
      }
      if (qty === 1) {
        dispatch(setQuotesData({ quantity: firstSelectedSlab.StartQty }));
      }
      
      const hasChecked =
        isChecked.bold === true ||
        isChecked.semibold === true ||
        isChecked.tick === true ||  
        isChecked.color === true;
      
      if(hasChecked){
        setChecked(isChecked)
      }

      if(adMedium !== "Newspaper"){
        setChecked({
          bold: false,
          semibold: false,
          color: false,
          tick: false,
          boldPercentage: -1,
          semiboldPercentage: -1,
          colorPercentage: -1,
          tickPercentage: -1
        })
      }

    } catch (error) {
      console.error("Error in Loding form data: ", error);
    }
  };

  const handleQtySlabChange = () => {
    const selectedSlab = datas.slabData?.find(item => item.StartQty === qtySlab.Qty);
    const widthSelectedSlab = datas.slabData?.find(item => item.Width === qtySlab.Width);
    console.log(datas.slabData, qtySlab, selectedSlab)

    if (!selectedSlab) {
      console.error("No matching slab data found.");
      return;
    }

    if(selectedSlab.Unit === "SCM" && !widthSelectedSlab){
      console.error("No Matching Width and Height slab data found");
      return;
    }

    dispatch(setQuotesData({ ratePerUnit: selectedSlab.UnitPrice, unit: selectedSlab.Unit }));

    if (!changing) {
      if (qty <= qtySlab.Qty && width <= qtySlab.Width) {
        dispatch(
          setQuotesData({ quantity: qtySlab.Qty, width: qtySlab.Width })
        );
        // handleMarginPercentageChange(marginPercentage)
      }
    } else {
      setChanging(false);
    }
    // Update UnitPrice based on the selected QtySlab
    
  };

  useEffect(() => {
        if (selectedDayRange === "") {
          setSelectedDayRange(dayRange[1]);
        }
        if(!rateId && !isQuoteEditMode){
          dispatch(resetQuotesData())
        }
        LoadFormData();
        dispatch(setQuotesData({
          selectedVendor: {
          label: selectedVendor,
          value: selectedVendor
        }}))
  },[])

  useEffect(() => {
    // dispatch(setQuotesData({marginAmount: 0}));
    if (rateId) {
      LoadFormData();
    }
  }, [rateId, adMedium]);

  useEffect(() => {
    if((isNaN(margin) || parseFloat(margin) === 0) && marginPercentage > 0){
      handleMarginPercentageChange(marginPercentage); //setting margin amount if there is no margin amount
    };

    if((isNaN(marginPercentage) || parseFloat(marginPercentage) === 0) && margin > 0){
      handleMarginChange(margin) // setting margin percent if there is no margin percent
    }
  },[margin, marginPercentage]);

  useEffect(() => {
    if (!isQuoteEditMode && qtySlab) {
      handleQtySlabChange();
    }
  }, [qtySlab]);

  // Validate fields
  const validateFields = () => {
    const validationErrors = {};
    if (qty < qtySlab.Qty) return false;
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    dispatch(updateCurrentPage("checkout"));
  };

  const handleMarginChange = (marginValue) => {
    const newMarginAmount = parseInt(marginValue);

    // calculate margin percentage
    const newMarginPercentage = calculateMarginPercentage(qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, newMarginAmount, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0);
    
    // Update both marginAmount and marginPercentage
    dispatch(setQuotesData({marginAmount: newMarginAmount, marginPercentage: newMarginPercentage}));

    if (newMarginAmount > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
  };

  const handleMarginPercentageChange = (marginPercent) => {
    const newPercentage = parseFloat(marginPercent);
  
    // calculate margin amount
    const newMarginAmount = calculateMarginAmount(qty, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, newPercentage, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0);
  
    // Update both marginAmount and marginPercentage
    dispatch(setQuotesData({ marginAmount: newMarginAmount, marginPercentage: newPercentage }));
  
    if (newPercentage > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
  };

  const marginLostFocus = () => {
    let cost = parseInt((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));

    if (checked.color) {
      cost += cost * (checked.colorPercentage / 100);
    }
    if (checked.tick) {
      cost += cost * (checked.tickPercentage / 100);
    }
    if (checked.bold) {
      cost += cost * (checked.boldPercentage / 100);
    }
    if (checked.semibold) {
      cost += cost * (checked.semiboldPercentage / 100);
    }

    const newMarginPercentage = ((margin / (cost + margin)) * 100).toFixed(1);

    // Ensure consistent update when margin field loses focus
    dispatch(setQuotesData({ marginPercentage: newMarginPercentage }));
  };

  const handleRemarks = async(e) => {
    dispatch(setQuotesData({remarks: e.target.value}));
    const suggestions = await FetchQuoteRemarks(e.target.value);
    setDatas({...datas, remarksSuggestion: suggestions});
  } 

  const vendorOptions = datas.ratesData?.map(option => ({
    value: option.VendorName,
    label: option.VendorName === '' && filteredData.length === 1 ? 'No Vendors' : option.VendorName,
  }));

  const slabOptions = datas.slabData?.map(opt => ({
    value: JSON.stringify({
      Qty: opt.StartQty,
      Width: unit !== "SCM" ? 1 : opt.Width
    }),
    label: `${unit !== "SCM" ? opt.StartQty + "+" : (opt.StartQty * opt.Width) + "+"} ${unit} : ₹${(Number(opt.UnitPrice))} per ${campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day' : "Campaign"}`
  }))

  const findMatchingQtySlab = (value, width) => {
    let matchingStartQty = datas.slabData[0].StartQty;
    let matchingWidth = datas.slabData[0].Width

    for (const slab of datas.slabData) {
      if(width === true){
        if (value >= slab.Width) {
          matchingWidth = slab.Width;   
        } else {
          break;
        }
      }else{
        if (value >= slab.StartQty) {
          matchingStartQty = slab.StartQty;   
        } else {
          break;
        }
      }
      
    }

    const matchingValue = {Qty: matchingStartQty, Width: matchingWidth}
    return matchingValue;
  };

// Apply GST to both price and cost
const items = [
  {
    content: [
      {
        label: 'Price',
        value: ` ₹${formattedRupees(basePrice)}`
      },
      {
        label: 'Cost',
        value: ` ₹${formattedRupees(baseCost)}`
      }
    ]
  },
  {
    content: [
      {
        label: 'Price',
        value: ` ₹${formattedRupees(parseFloat(basePrice) * parseFloat(1 + rateGST / 100))}`
      },
      {
        label: 'Cost',
        value: ` ₹${formattedRupees(parseFloat(baseCost) * parseFloat(1 + rateGST / 100))}`
      }
    ]
  }
];

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 35,
      top: 5,
      border: `2px solid`,
      background: '#000000',
      padding: '0 4px',
    },
  }));

  const handleCompleteEdit = () => {
    if (validateFields()) {
      // Prepare the updated item
      const updatedItem = {
        index: editIndex,
        adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, 
        campaignDuration, margin, remarks, rateId, 
        CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", 
        leadDay: leadDay ? leadDay.LeadDays : "", 
        minimumCampaignDuration, formattedDate: formattedDate(ValidityDate), rateGST, width, 
        campaignDurationVisibility, editQuoteNumber, isEditMode: editQuoteNumber ? true : false,
        bold: checked.bold, boldPercentage: checked.boldPercentage, semibold: checked.semibold, 
        semiboldPercentage: checked.semiboldPercentage, color: checked.color, 
        colorPercentage: checked.colorPercentage, tick: checked.tick, 
        tickPercentage: checked.tickPercentage, price: basePrice, cost: baseCost
      };
  
      // Find the existing item with the same editIndex
      const existingItem = cartItems.find(item => item.index === editIndex);
  
      let updatedCartItems = [...cartItems]; // Default to the current cartItems
      let isItemUpdated = false; // Track whether an update occurred
  
      if (existingItem) {
        // Compare existing item with the updated item
        isItemUpdated = Object.keys(updatedItem).some(key =>
          isValueChanged(updatedItem[key], existingItem[key])
        );
  
        if (isItemUpdated) {
          updatedCartItems = cartItems.map(item =>
            item.index === editIndex ? { ...item, ...updatedItem } : item
          );
          setSuccessMessage("Item edited successfully.");
        } else {
          setToastMessage("No Changes Detected.");
          setSeverity("error");
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
        }
      } else {
        // Add new item if not existing
        const newItem = { ...updatedItem, index: cartItems.length, isNewCart: true}; // Ensure unique index
        updatedCartItems = [...cartItems, newItem];
        isItemUpdated = true; // Treat as updated since it's a new addition
        // setSuccessMessage("Item added to Cart");
      }
  
      // Dispatch only if there is a change
      if (isItemUpdated) {
        dispatch(addItemsToCart(updatedCartItems));
  
        // Reset messages after a delay
        dispatch(resetQuotesData());
        dispatch(setQuotesData({ currentPage: "checkout", previousPage: "adDetails" }));
      }
    } else {
      // Show error if validation fails
      setToastMessage("Quantity should not be less than " + qtySlab.Qty);
      setSeverity("error");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    }
  };
  
  // Function to compare values and detect changes
  const isValueChanged = (newValue, oldValue) => {
  
    if (Array.isArray(newValue) && Array.isArray(oldValue)) {
      // Compare arrays element by element
      return newValue.some((val, index) => {
        return isValueChanged(val, oldValue[index]);
      });
    } else if (
      typeof newValue === 'object' &&
      newValue !== null &&
      typeof oldValue === 'object' &&
      oldValue !== null
    ) {
      // Compare objects by keys in newValue only
      return Object.keys(newValue).some(key => {
        return isValueChanged(newValue[key], oldValue[key]);
      });
    } else {
      // Direct comparison for primitive types
      const isDifferent = newValue !== oldValue;
      return isDifferent;
    }
  };

  return (
    
    <div className="text-black justify-center flex w-full">    
      <div className="justify-center w-full">
           
            {/* </div> */}
            
              <div className='justify-center relative'>
                <div className='mx-[8%] pt-7 mt-4'>
                <div className="flex items-center w-full border rounded-lg border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
              <input
          className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0`}
          type="text"
          id="RateSearchInput"
          placeholder="Ex: Full Bus Chennai"
          value={rateSearchTerm}
          onChange = {handleRateSearch}
          onFocus={(e) => {e.target.select()}}
        /><div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500 " />
      </div></div>
      {(datas.ratesSearchSuggestion?.length > 0 && rateSearchTerm !== "") && (
              <ul className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                {datas.ratesSearchSuggestion.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleRateSelection}
                      value={name.SearchTerm}
                    >
                      {name.SearchTerm}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>

<br/>
<div className="w-full flex overflow-hidden h-auto space-x-2 p-2 mb-2">
  {/* <!-- Customer Price Box --> */}
  <div className="flex-shrink-0 w-[50%] bg-blue-50 border  border-blue-200 h-fit rounded-lg p-2">
    <div className="sm:text-lg text-md font-bold text-blue-500 mb-2">Excluding GST</div>
    {items[0].content.map((item, index) => (
      <div key={index} className="mb-2 flex items-center">
        <div className={`sm:text-lg text-[16px] font-semibold sm:font-bold text-start text-blue-500`}>
          {item.label}:
        </div>
        <div 
          className={`sm:text-xl text-[16px] ml-2 break-words text-start font-semibold sm:font-bold w-1/2 mr-1 text-gray-800`}
        >
          {item.value}
        </div>
        
      </div>
    ))}
  </div>

  {/* <!-- Vendor Cost Box --> */}
  <div className="flex-shrink-0 w-[50%] bg-green-50 border border-green-200 h-fit rounded-lg p-2">
    <div className="sm:text-lg text-md font-bold text-green-500 mb-2">Including GST{rateGST && '@' + rateGST + '%'}</div>
    {items[1].content.map((item, index) => (
      <div key={index} className="mb-2 flex items-center">
        <div className={`sm:text-lg text-[16px] break-words font-semibold sm:font-bold text-green-600`}>
          {item.label}: 
        </div>
        <div 
          className={`sm:text-xl text-[16px] break-words w-[50%] ml-2 font-semibold sm:font-bold mr-1 text-gray-800`}
        >
         {item.value}
        </div>
        
      </div>
    ))}
  </div>
</div>

              {/* <div className="mb-3 overflow-y-auto " style={{ maxHeight: 'calc(100vh - 27rem)' }}> */}
              <div className="mb-4 overflow-y-auto h-full" > 
              <span className='flex flex-row mb-2 justify-center'>
  <div className="flex flex-col mr-2 items-center justify-center">
    <button
      className={`${rateId > 0 ? 'Addtocartafter-button' : 'Addtocart-button'} text-white px-4 py-2 rounded-xl transition-all duration-300 ease-in-out shadow-md`}
      disabled={rateId > 0 ? false : true}
      onClick={(e) => {
        e.preventDefault();
        if (isQuoteEditMode) {
          // Complete Edit functionality
          handleCompleteEdit();
          
        } else {
          // Add to Cart functionality
          if (validateFields()) {
            const isDuplicate = cartItems.some(item => item.rateId === rateId && item.qty === qty);
            if (isDuplicate) {
              let result = window.confirm("This item is already in the cart. Do you want to still Proceed?");
              if (result) {
                const index = cartItems.length;
                dispatch(addItemsToCart([{ index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, ValidityDate, rateGST, width, campaignDurationVisibility, isNewCart: true, isSelected: false, bold: checked.bold, boldPercentage: checked.boldPercentage, semibold: checked.semibold, semiboldPercentage: checked.semiboldPercentage, color: checked.color, colorPercentage: checked.colorPercentage, tick: checked.tick, tickPercentage: checked.tickPercentage, price: basePrice, cost: baseCost, formattedDate: formattedDate(ValidityDate)}]));
                // setSuccessMessage("Item added to Cart");
                setTimeout(() => { setSuccessMessage(''); }, 2000);
              }
              return;
            }
            const index = cartItems.length;
            dispatch(addItemsToCart([{ index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, ValidityDate, rateGST, width, campaignDurationVisibility, isNewCart: true, isSelected: false, bold: checked.bold, boldPercentage: checked.boldPercentage, semibold: checked.semibold, semiboldPercentage: checked.semiboldPercentage, color: checked.color, colorPercentage: checked.colorPercentage, tick: checked.tick, tickPercentage: checked.tickPercentage, price: basePrice, cost: baseCost, formattedDate: formattedDate(ValidityDate)}]));
            setSuccessMessage("Item added to Cart");
            setTimeout(() => { setSuccessMessage(''); }, 2000);
          } else {
            setToastMessage("Quantity should not be less than " + qtySlab.Qty);
            setSeverity('error');
            setToast(true);
            setTimeout(() => { setToast(false); }, 2000);
          }
        }
      }}
    >
      <ShoppingCartIcon className='text-white mr-2'/>
      {isQuoteEditMode && !isNewCartOnEdit ? "Complete Edit" : "Add to Cart"}
    </button>
  </div>

                <div className="flex flex-col ml-2 items-center justify-center">
                  <button
                    className="Gotocart-button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <StyledBadge badgeContent={cartItems.length} color="primary">
                      <ShoppingCartCheckout className='text-white mr-2' />
                    </StyledBadge>
                    Go to Cart
                  </button>
              </div>
              </span>
              {adMedium === "Newspaper" &&
              <div className='grid grid-cols-4 gap-3 my-6'>
              <div className="flex flex-col items-center justify-center text-black">
        <label className="flex items-center cursor-pointer">
          <input
            // ref={checkboxRef}
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={checked.bold}
            onChange={() => setChecked({...checked, bold: !checked.bold})}
          />
          <span className="ml-2 text-sm font-medium">Bold</span>
        </label>
        {checked.bold && <div className='flex mt-2'>
          <input disabled={!checked.bold} className='ml-2 max-w-14 max-h-7 rounded-sm border border-blue-500 p-1 ' onFocus={(e) => e.target.select()} placeholder='Ex: 15' value={checked.boldPercentage} onChange={(e) => setChecked({...checked, boldPercentage: e.target.value})}/> 
          <p className='text-black ml-1 font-bold'>%</p>
        </div>
        }
      </div>
      <div className="flex items-center flex-col justify-center text-black">
        <label className="flex items-center cursor-pointer">
          <input
            // ref={checkboxRef}
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={checked.semibold}
            onChange={() => setChecked({...checked, semibold: !checked.semibold})}
          />
          <span className="ml-2 text-sm font-medium">Semi Bold</span>
        </label>
        {checked.semibold && <div className='flex mt-2'>
          <input disabled={!checked.semibold} className='ml-2 max-w-14 max-h-7 rounded-sm border border-blue-500 p-1' onFocus={(e) => e.target.select()} placeholder='Ex: 15' value={checked.semiboldPercentage} onChange={(e) => setChecked({...checked, semiboldPercentage: e.target.value})}/> 
          <p className='text-black ml-1 font-bold'>%</p>
        </div>
        }
      </div>
      <div className="flex flex-col items-center justify-center text-black">
        <label className="flex items-center cursor-pointer">
          <input
            // ref={checkboxRef}
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={checked.color}
            onChange={() => setChecked({...checked, color: !checked.color})}
          />
          <span className="ml-2 text-sm font-medium">Color</span>
        </label>
        {checked.color && <div className='flex mt-2'>
          <input disabled={!checked.color} className='ml-2 max-w-14 max-h-7 rounded-sm border border-blue-500 p-1' onFocus={(e) => e.target.select()} placeholder='Ex: 15' value={checked.colorPercentage} onChange={(e) => setChecked({...checked, colorPercentage: e.target.value})}/> 
          <p className='text-black ml-1 font-bold'>%</p>
        </div>
        }
      </div>
      <div className="flex items-center flex-col justify-center text-black">
        <label className="flex items-center cursor-pointer">
          <input
            // ref={checkboxRef}
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={checked.tick}
            onChange={() => setChecked({...checked, tick: !checked.tick})}
          />
          <span className="ml-2 text-sm font-medium">Tick</span>
        </label>
        {checked.tick && <div className='flex mt-2'>
          <input disabled={!checked.tick} className='ml-2 max-w-14 max-h-7 rounded-sm border border-blue-500 p-1' onFocus={(e) => e.target.select()} placeholder='Ex: 15' value={checked.tickPercentage} onChange={(e) => setChecked({...checked, tickPercentage: e.target.value})}/> 
          <p className='text-black ml-1 font-bold'>%</p>
        </div>
        }
      </div>
      </div>}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                
                 { unit !== 'SCM' ? (
                  <div className="mb-4 flex flex-col ">
                   <label className="font-bold mb-1 ml-2">Quantity</label>
                    <div className="flex w-[80%] border ml-2 border-gray-400 rounded-lg">
                    <input
                      className={`w-[70%] px-4 py-2 border-y-0 border-l-0 border border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Qty}
                      value={qty}
                      onChange={(e) => {
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: calculateMarginAmount(e.target.value, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, marginPercentage, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0)}));
                        setQtySlab(findMatchingQtySlab(e.target.value, false));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <label className="justify-center mt-2 ml-2 ">{unit ? unit : 'Unit'}</label>
                  </div>
                  <p className="text-red-700">{(rateId > 0 && qty < qtySlab.Qty) ? 'Minimum Quantity should be ' + qtySlab.Qty : ''}</p>
                </div>
                   ) : (
                    <div className="mb-4 flex flex-row">
                    <div className="mb-4 flex flex-col">
                   <label className="font-bold mb-1 ml-2">Height (CM)</label>
                    <div className="flex w-full">
                    <input
                      className={`w-[80%] ml-2 px-4 py-2 border border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Qty}
                      value={qty}
                      onChange={(e) => {
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: calculateMarginAmount(e.target.value, width, unit, unitPrice, campaignDuration, minimumCampaignDuration, marginPercentage, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0)}));
                        setQtySlab(findMatchingQtySlab(e.target.value, false));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <p className="text-red-700">{qty < qtySlab.Qty ? 'Minimum Quantity should be ' + qtySlab.Qty : ''}</p>
                  </div>
                  
                  <div className="mb-4 flex flex-col">
                  <label className="font-bold mb-1 ml-2">Width (CM)</label>
                    <div className="flex w-full">
                    <input
                      className={`w-[80%] ml-2 px-4 py-2 border border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Width}
                      value={width}
                      onChange={(e) => {
                        dispatch(setQuotesData({width: e.target.value, marginAmount: calculateMarginAmount(qty, e.target.value  , unit, unitPrice, campaignDuration, minimumCampaignDuration, marginPercentage, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0)}));
                        setQtySlab(findMatchingQtySlab(e.target.value, true));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <p className="text-red-700">{width < qtySlab.Width ? 'Minimum Quantity should be ' + qtySlab.Width : ''}</p>
                  </div>
                 
                  
                </div>
                   )}
                {campaignDurationVisibility === 1 &&
                  (<div className="mb-4">
                    <label className="font-bold">Campaign Duration</label>
                    <div className="flex w-[80%] border ml-2 border-gray-400 rounded-lg mt-2">
                      <input
                        className={`w-[70%] px-4 py-2 border border-y-0 border-l-0 border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                        type="number"
                        placeholder="Ex: 1000"
                        // defaultValue={campaignDuration}
                        value={campaignDuration}
                        onChange={(e) => {
                          dispatch(setQuotesData({campaignDuration: e.target.value, marginAmount: calculateMarginAmount(qty, width, unit, unitPrice, e.target.value, minimumCampaignDuration, marginPercentage, checked.color ? checked.colorPercentage : 0, checked.tick ? checked.tickPercentage : 0, checked.bold ? checked.boldPercentage : 0, checked.semibold ? checked.semiboldPercentage : 0)})); 
                          //setMargin(formattedMargin(((qty * unitPrice * e.target.value * marginPercentage) / 100)))
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                      {/* <div className="relative"> */}
                      <label className="text-center mt-2 ml-2">{(leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day'}</label>

                      {/* </div> */}
                    </div>
                    <p className="text-red-700">{campaignDuration < minimumCampaignDuration ? 'Minimum Duration should be ' + minimumCampaignDuration : ''}</p>
                  </div>)}
              <div className='flex flex-row mb-4'>
                <div className="flex flex-col">
                  <label className="font-bold ml-2 mb-1">Margin(₹)</label>
                  <input
                    className={`w-[80%] ml-2 px-4 py-2 border  border-gray-400  text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginAmount ? 'border-red-400' : ''}`}
                    //className="w-full border border-gray-300 mb-4 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 4000"
                    value={margin}
                    ref={marginAmountRef}
                    onChange={e => handleMarginChange(e.target.value)}
                    onBlur={marginLostFocus}
                    onFocus={(e) => e.target.select()}
                  />
                  {errors.marginAmount && <p className="text-red-500 text-xs ml-3">{errors.marginAmount}</p>}
            
                </div>
                <div className='flex flex-col'>
                <label className="font-bold ml-2 mb-1">Margin %</label>
                <span className='flex flex-row'>
                    <input
                    className={`w-[80%] ml-2 px-4 py-2 border  border-gray-400  text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      //className="w-20 border border-gray-300 bg-blue-300 text-black p-2 h-8 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      value={marginPercentage}
                      onChange={ e => handleMarginPercentageChange(e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                    <p className="mt-1 font-bold ml-2">%</p></span>
                  </div>
                  </div>
                <div className="mb-4 flex flex-col">
                  <label className="font-bold ml-2 mb-1">Remarks</label>
                  <InputTextarea
                    autoResize
                    className={`w-[80%] ml-2 px-4 py-2 border border-gray-400  text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                    //className="w-full border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    placeholder="Remarks"
                    value={remarks}
                    onChange={handleRemarks}
                    rows="2"
                    ref={textAreaRef}
                  />

                  {datas.remarksSuggestion?.length > 0 && (
                    <ul className="mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                      {datas.remarksSuggestion.map((name, index) => (
                        <li key={index} >
                          <button
                           className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                          value={name}
                          onClick={() => {
                             dispatch(setQuotesData({remarks: name}))
                             //setRemarks(name);
                             setDatas({remarksSuggestion: []});
                             textAreaRef.current.focus();
                            }}
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mb-4 flex flex-col">
                  <label className="font-bold mb-1 ml-2">Vendor</label>
                  <Dropdown
                  className={`w-[80%] mt-1 ml-2 border border-gray-400 rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300`}  
                    value={selectedVendor}
                    onChange={(selectedOption) => dispatch(setQuotesData({ selectedVendor: selectedOption ? selectedOption.value : '' }))}
                    options={vendorOptions}
                  />
                </div>
                <div className="mb-4 flex flex-col">
                  <label className="font-bold mb-1 ml-2">Quantity Slab Wise Cost</label>
                  <Dropdown
                   className={`w-[80%] ml-2 mt-1  border border-gray-400 rounded-lg  text-black focus:outline-none focus:shadow-outline focus:border-gray-300`}
                    value={JSON.stringify(qtySlab)}
                    onChange={(e) => {
                      const selectedValue = JSON.parse(e.target.value);
                      dispatch(setQuotesData({width: selectedValue.Width, quantity: selectedValue.Qty}));
                      setQtySlab(selectedValue)
                    }}
                    options={slabOptions}
                  />
                </div>
                </div>
                <div className="flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white items-center   mx-4 px-4 py-3 mt-4 mb-8 rounded-xl shadow-lg shadow-gray-300 border border-gray-300">
                  <p className="font-semibold text-lg text-gray-800 mt-1">
                    Quote Valid till {ValidityDate ? formattedDate(ValidityDate) : "0000-00-00"}
                  </p>
                  <p className="font-medium text-gray-600 text-base mt-2 text-center">
                    Note: Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : 0} days from the date of payment received or the date of design approved, whichever is higher.
                  </p>
                </div>

              </div>
              {successMessage && <SuccessToast message={successMessage} />}
              {toast && <ToastMessage message={toastMessage} type="error"/>}
              {toast && <ToastMessage message={toastMessage} type="warning"/>}
              </div>
            </div>
          </div>
      )
}         

export default AdDetailsPage;