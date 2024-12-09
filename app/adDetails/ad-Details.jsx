'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import MuiAlert from '@mui/material/Alert';
import { InputTextarea } from 'primereact/inputtextarea';
import { Carousel } from 'primereact/carousel';
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
import CreatableSelect from 'react-select/creatable';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { FetchRateSeachTerm } from '../api/FetchAPI';
import './page.css';

export const formattedMargin = (number) => {
  const roundedNumber = (number / 1).toFixed(0);
  return Number((roundedNumber / 1).toFixed(0)); //roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 :
};

const AdDetailsPage = () => {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [rateSearchTerm,setRateSearchTerm] = useState("");
  const [ratesSearchSuggestion, setRatesSearchSuggestion] = useState([]);
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [slabData, setSlabData] = useState([])
  const [qtySlab, setQtySlab] = useState({
    Qty: 1,
    Width: 1
  })
  //const [unitPrice, setUnitPrice] = useState('')
  // const [minimumUnit, setMinimumUnit] = useState(qtySlab)
  //const [qty, setQty] = useState(qtySlab)
  const [selectedDayRange, setSelectedDayRange] = useState('Day');
  //const [unit, setUnit] = useState('')
  const [marginPercentage, setMarginPercentage] = useState(0)
  //const [extraDiscount, setExtraDiscount] = useState(0)
  //const [remarks, setRemarks] = useState('');
  const [remarksSuggestion, setRemarksSuggestion] = useState([]);

  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const [datas, setDatas] = useState([]);
  const marginAmountRef = useRef(null);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const username = useAppSelector(state => state.authSlice.userName);
  const clientDetails = useAppSelector(state => state.clientSlice);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const rateId = useAppSelector(state => state.quoteSlice.rateId)
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition)
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  const selectedVendor = useAppSelector(state => state.quoteSlice.selectedVendor);
  const qty = useAppSelector(state => state.quoteSlice.quantity);
  const unit = useAppSelector(state => state.quoteSlice.unit);
  const unitPrice = useAppSelector(state => state.quoteSlice.ratePerUnit);
  const campaignDuration = useAppSelector(state => state.quoteSlice.campaignDuration);
  const margin = useAppSelector(state => state.quoteSlice.marginAmount);
  // const extraDiscount = useAppSelector(state => state.quoteSlice.extraDiscount);
  const remarks = useAppSelector(state => state.quoteSlice.remarks);
  const currentPage = useAppSelector(state => state.quoteSlice.currentPage);
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage);
  const rateGST = useAppSelector(state => state.quoteSlice.rateGST);
  const width = useAppSelector(state => state.quoteSlice.width);
  const newData = datas.filter(item => Number(item.rateId) === Number(rateId));
  const leadDay = newData[0];
  const minimumCampaignDuration = (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1
  const routers = useRouter();
  const campaignDurationVisibility = (leadDay) ? leadDay.campaignDurationVisibility : 0;
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const isQuoteEditMode = useAppSelector(state => state.quoteSlice.isEditMode);
  const editIndex = useAppSelector(state => state.quoteSlice.editIndex);
  const editQuoteNumber = useAppSelector(state => state.quoteSlice.editQuoteNumber);
  const isNewCartOnEdit = useAppSelector(state => state.quoteSlice.isNewCartOnEdit);
  // console.log((leadDay) ? leadDay.campaignDurationVisibility : 50)
  //const [campaignDuration, setCampaignDuration] = useState((leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1);
  //const [margin, setMargin] = useState(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * 15) / 100).toFixed(2));
  const ValidityDate = (leadDay) ? leadDay.ValidityDate : Cookies.get('validitydate');
  const [changing, setChanging] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const inputDate = new Date(ValidityDate);
  const day = ('0' + inputDate.getDate()).slice(-2); // Ensure two digits for day
  const month = months[inputDate.getMonth()]; // Get month abbreviation from the array
  const year = inputDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  const handleRateSearch = async(e) =>{
    setRateSearchTerm(e.target.value);
    const searchSuggestions = await FetchRateSeachTerm(companyName, e.target.value);
    setRatesSearchSuggestion(searchSuggestions);
  }

  const fetchRate = async(rateId) => {
    try {
      const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchGivenRate.php/?JsonDBName=${companyName}&JsonRateId=${rateId}`);
      if(!response.ok){
        throw new Error(`HTTP error! Error In fetching Rates: ${response.status}`);
      }
      const data = await response.json();
      const firstData = data[0];
      dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedEdition: firstData.Location, selectedPosition: firstData.Package, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, ratePerUnit: firstData.ratePerUnit, minimumUnit: firstData.minimumUnit, unit: firstData.Units, isDetails: true, rateGST: firstData.rategst}))

      if(width === 1){
        dispatch(setQuotesData({width: firstData.width}))
      }

      if(qty === 1){
        dispatch(setQuotesData({quantity: firstData.minimumUnit}))
      }
      // console.log("Fetch Rate: " + firstData.minimumUnit)
    } catch (error) {
      console.error("Error while fetching rates: " + error)
    }
  }

  const handleRateSelection = (e) => {
    const selectedRate = e.target.value;
    const selectedRateId = selectedRate.split('-')[0];
    setRatesSearchSuggestion([]);
    setRateSearchTerm(selectedRate);

    fetchRate(selectedRateId);
    dispatch(setQuotesData({rateId: selectedRateId}));
    dispatch(updateCurrentPage("adDetails"));
  }
  // useEffect(() => {
  //   if (isQuoteEditMode) {

  //   const cost = parseInt((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));
  //   const newMarginPercentage = ((margin / (cost + margin)) * 100).toFixed(1);
    
  //   setMarginPercentage(newMarginPercentage);
  //   }
  // }, [isQuoteEditMode])


  useEffect(() => {
    // if (!isQuoteEditMode) {
    dispatch(setQuotesData({campaignDuration: (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1, validityDate: (leadDay) ? leadDay.ValidityDate : Cookies.get('validitydate'), leadDays: (leadDay) ? leadDay.LeadDays: ""}));
    // }
  }, [leadDay, minimumCampaignDuration])

  useEffect(() => {
    // if (!isQuoteEditMode) {
        if (selectedDayRange === "") {
          setSelectedDayRange(dayRange[1]);
        }
        if(!rateId && !isQuoteEditMode){
          //dispatch(setQuotesData({currentPage: "adMedium"}));
          dispatch(resetQuotesData())
        }
        dispatch(setQuotesData({
          selectedVendor: {
          label: selectedVendor,
          value: selectedVendor
        }}))
        // if (adMedium === '') {
        //   dispatch(setQuotesData({currentPage: 'adMedium'}));
        // } else if (adType === '') {
        //   dispatch(setQuotesData({currentPage: 'adType'}));
        // } else if (adCategory === '') {
        //   dispatch(setQuotesData({currentPage: 'adCategory'}));
        // } else if (edition === '') {
        //   dispatch(setQuotesData({currentPage: 'edition'}));
        // }
  // }
  },[])

  // useEffect(() => {
  //   if(extraDiscount > 0){
  //     dispatch(setQuotesData({marginAmount: (((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - marginPercentage)) * 100) * (marginPercentage/100)) - extraDiscount).toFixed(0)}))
  //   }
    
  // },[extraDiscount])

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 35,
      top: 5,
      border: `2px solid`,
      background: '#000000',
      padding: '0 4px',
    },
  }));

  // useEffect(() => {
  //   const changeMarginPercentage = () =>{
  //     dispatch(setQuotesData({marginAmount: formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100- marginPercentage)) * 100)  * (marginPercentage/100)}))
  //   }
  //   changeMarginPercentage()
  // },[marginPercentage])

  useEffect(() => {
    // if (!isQuoteEditMode) {
      const fetchData = async () => {
        try {
          // Clear existing slab data
          setSlabData([]);
      
          // Fetch new data
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}&JsonDBName=${companyName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json();
          // console.log(data)
          // Sort the data by StartQty
          const sortedData = [...data].sort((a, b) => Number(a.StartQty * a.Width) - Number(b.StartQty * b.Width));
          // console.log(sortedData)
          // Set sorted data in state
          setSlabData(sortedData);
      
          // Handle the first selected slab if data exists
          if (sortedData.length > 0) {
            const firstSelectedSlab = sortedData[0];
            // console.log(firstSelectedSlab)
            setQtySlab({
              Qty: firstSelectedSlab.StartQty,
              Width: firstSelectedSlab.Width
            });
            
            if(width === 1){
              dispatch(setQuotesData({width: firstSelectedSlab.Width}))
            }
  
            if(qty === 1){
              dispatch(setQuotesData({quantity: firstSelectedSlab.StartQty}))
            }
  
            setMarginPercentage(firstSelectedSlab.AgencyCommission || 0);
            dispatch(setQuotesData({
              ratePerUnit: firstSelectedSlab.UnitPrice,
              unit: firstSelectedSlab.Unit            
            }));
            // console.log("Fetch Slab: " + firstSelectedSlab.StartQty)
          } else {
            // Handle case where there's no data, set default values, etc.
          }
        } catch (error) {
          console.error('Error fetching and processing data:', error);
        }
      };    
  
      const fetchRate = async() => {
        try {
          const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchGivenRate.php/?JsonDBName=${companyName}&JsonRateId=${rateId}`);
          if(!response.ok){
            throw new Error(`HTTP error! Error In fetching Rates: ${response.status}`);
          }
          const data = await response.json();
          const firstData = data[0];
          dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, minimumUnit: firstData.minimumUnit, unit: firstData.Units, isDetails: true, rateGST: firstData.rategst}))
          if(width === 1){
            dispatch(setQuotesData({width: firstData.width}))
          }
          if(qty === 1){
            dispatch(setQuotesData({quantity: firstData.minimumUnit }))
          }
          //console.log("Fetch Rate UseEffect: " + firstData.minimumUnit)
        } catch (error) {
          console.error("Error while fetching rates: " + error)
        }
      }
  
      fetchRate();
      fetchData();
      
      fetchRateData();
    // }
  }, [rateId]);

  useEffect(() => {
    // if (!isQuoteEditMode) {
    fetchRateData();
    // }
  }, [adMedium, rateId])
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchRateId.php/?JsonRateName=${rateName}&JsonAdType=${adType}&JsonAdCategory=${adCategory}&JsonVendorName=${selectedVendor}&JsonDBName=${companyName}`);
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       const data = await response.json();
  //       dispatch(setQuotesData({rateId: data}));
  //     }
  //     catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, [selectedVendor]);

  const handleQtySlabChange = () => {
    // const qtySlabNumber = parseInt(qtySlab); // Convert the value to a number
    // Find the corresponding slabData for the selected QtySlab
    const selectedSlab = sortedSlabData.find(item => item.StartQty === qtySlab.Qty);
    const widthSelectedSlab = sortedSlabData.find(item => item.Width === qtySlab.Width);
  
    if (!selectedSlab) {
      console.error("No matching slab data found.");
      return;
    }

    if(selectedSlab.Unit === "SCM" && !widthSelectedSlab){
      console.error("No Matching Width and Height slab data found");
      return;
    }
  
    if (!changing) {
      dispatch(setQuotesData({ quantity: qtySlab.Qty, width: qtySlab.Width}));
      // console.log("Handle Qty Slab Change: " + qtySlab)
    } else {
      setChanging(false);
    }
  
    // const marginAmount = formattedMargin((((qty* width * selectedSlab.UnitPrice * (campaignDuration / minimumCampaignDuration)) /(100- marginPercentage)) * 100)  * (marginPercentage/100)).toFixed(0);
    const marginAmount = formattedMargin(qty* width * selectedSlab.UnitPrice / minimumCampaignDuration * campaignDuration / (100 - marginPercentage) * marginPercentage)
    dispatch(setQuotesData({ marginAmount }));
    
    // Update UnitPrice based on the selected QtySlab
    dispatch(setQuotesData({ ratePerUnit: selectedSlab.UnitPrice, unit: selectedSlab.Unit }));
  };

  // const handleQtySlabChange = () => {
  //   const qtySlabNumber = parseInt(qtySlab)
  //   // Find the corresponding slabData for the selected QtySlab
  //   const selectedSlab = sortedSlabData.filter(item => item.StartQty === qtySlabNumber);

  //   { !changing && dispatch(setQuotesData({quantity: qtySlab.value})); }
  //   { changing && setChanging(false) }
  //   dispatch(setQuotesData({marginAmount: formattedMargin((qtySlab.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100)}))
  //   //setMargin(formattedMargin((qtySlab * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
  //   // Update UnitPrice based on the selected QtySlab
  //   if (selectedSlab) {
  //     const firstSelectedSlab = selectedSlab[0];
  //     dispatch(setQuotesData({ratePerUnit: firstSelectedSlab.UnitPrice, unit: firstSelectedSlab.Unit}));
  //     // setUnitPrice(firstSelectedSlab.UnitPrice);
  //     // setUnit(firstSelectedSlab.Unit)
  //   }
  // };

  useEffect(() => {
    if (!isQuoteEditMode && qtySlab) {
      handleQtySlabChange();
    }
  }, [qtySlab]);  

  const fetchRateData = async () => {
    try {
      if (!username) {
        routers.push('/login');
      } else {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
        const data = await response.json();
       
       
        const filterdata = data.filter(item => (item.rateId === parseInt(rateId)))
          .filter((value, index, self) =>
            self.findIndex(obj => obj.VendorName === value.VendorName) === index
          )
          .sort((a, b) => a.VendorName.localeCompare(b.VendorName));
        setDatas(filterdata);
        //dispatch(setQuotesData({rateId: filterdata[0].rateId}));
        formattedMargin(qty* width * filterdata[0]?.UnitPrice / minimumCampaignDuration * campaignDuration / (100 - marginPercentage) * marginPercentage)
        // console.log("qty, unitPrice, campaignDuration, minimumCampaignDuration, filterdata[0].AgencyCommission", qty, unitPrice, campaignDuration, minimumCampaignDuration, filterdata[0].AgencyCommission)
        // console.log("(((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100- filterdata[0].AgencyCommission)) * 100).toFixed(2)", (((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100- filterdata[0].AgencyCommission)) * 100).toFixed(2))
        dispatch(setQuotesData({marginAmount: ((filterdata[0].Units === "SCM" ? qty * filterdata[0].width : qty) * unitPrice * campaignDuration / minimumCampaignDuration) * (filterdata[0].AgencyCommission / 100)}))
        // console.log(unit)
        setMarginPercentage(filterdata[0].AgencyCommission);
        
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validateFields = () => {
    let errors = {};
    if (margin === "0") errors.marginAmount = 'Margin Amount is required';
    // marginAmountRef.current.focus()
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
 
  const dispatch = useDispatch();
  const handleSubmit = () => {
    dispatch(updateCurrentPage("checkout"))
  //   const isValid = validateFields();
  //   if (isValid) {
  //     const isDuplicate = cartItems.some(item => item.rateId === rateId && item.qty === qty);
  //   if (isDuplicate) {
      
  //     let result = window.confirm("The item is already in the cart! Do you still want to Proceed?");
  //     // Display an error message or handle the duplicate case
  //     //dispatch(updateCurrentPage("checkout"));
  //     if(!result){
  //       return;
  //     }
  //   }

  //   if (qty === '' || campaignDuration === '' || margin === '') {
  //     setSeverity('warning');
  //     setToastMessage('Please fill all the Client Details!');
  //     setToast(true);
  //   }
  //   else if (qty < qtySlab) {
  //     setSeverity('warning');
  //     setToastMessage('Minimum Quantity should be ' + qtySlab);
  //     setToast(true);
  //   }
  //   else if(minimumCampaignDuration > campaignDuration){
  //     setSeverity('warning');
  //     setToastMessage('Minimum Duration should be ' + minimumCampaignDuration);
  //     setToast(true);
  //   }
  //   else {
  //     Cookies.set('isAdDetails', true);
  //     const index = cartItems.length
  //     console.log(index)
  //     dispatch(addItemsToCart([{index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "Day", leadDay: leadDay ? leadDay.LeadDays : 1, minimumCampaignDuration, formattedDate, campaignDurationVisibility, rateGST, width}]))
  //     dispatch(setQuotesData({isDetails: true}))
  //     dispatch(updateCurrentPage("checkout"))
  //     //dispatch(setQuotesData({currentPage: "checkout", previousPage: "adDetails"}))
  //   }
  // } else {
  //   setToastMessage('Please fill the necessary details in the form.');
  //   setSeverity('error');
  //   setToast(true);
  //   setTimeout(() => {
  //     setToast(false);
  //   }, 2000);
  // }
  };

  // const handleMarginChange = (event) => {
  //   const newValue = parseInt(event.target.value);
  //   //setMargin(event.target.value);
  //   dispatch(setQuotesData({marginAmount: event.target.value}))

  //   if (newValue > 0) {
  //     setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
  //   }
  // };

  // const marginLostFocus = () => {
  //   const cost = parseInt((unit === "SCM" ? (qty * width) : (qty)) * unitPrice * (campaignDuration / minimumCampaignDuration))
  //   const price = cost + parseInt(margin)
  //   setMarginPercentage(((margin/price)*100).toFixed(1))
  //   //dispatch(setQuotesData({marginAmount: event.target.value}))
  // }

  // const handleMarginPercentageChange = (event) => {
  //   const newPercentage = parseFloat(event.target.value);
  //   setMarginPercentage(event.target.value);
  //   dispatch(setQuotesData({marginAmount: formattedMargin(
  //     ((unit === "SCM" ? qty * width : qty) * unitPrice * campaignDuration / minimumCampaignDuration) * (newPercentage / 100)
  //   ).toFixed(0)}));
  //   //old margin formula formattedMargin(((((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - newPercentage)) * 100) * (newPercentage/100)).toFixed(0)})
  //   //setMargin(formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * event.target.value) / 100)));
  //   if (newPercentage > 0) {
  //     setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
  //   }
  // };

  const handleMarginChange = (event) => {
    const newMarginAmount = parseInt(event.target.value);
    // setMargin(newMarginAmount);

    const cost = parseInt((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));
    const newMarginPercentage = ((newMarginAmount / (cost + newMarginAmount)) * 100).toFixed(1);
    
    // Update both marginAmount and marginPercentage consistently
    dispatch(setQuotesData({ marginAmount: newMarginAmount, marginPercentage: newMarginPercentage }));
    setMarginPercentage(newMarginPercentage);

    if (newMarginAmount > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
};

const handleMarginPercentageChange = (event) => {
    const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(newPercentage);

    const cost = parseInt((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));
    const newMarginAmount = ((cost * newPercentage) / (100 - newPercentage)).toFixed(0);

    // Update both marginAmount and marginPercentage consistently
    dispatch(setQuotesData({ marginAmount: newMarginAmount, marginPercentage: newPercentage }));
    // setMargin(newMarginAmount);

    if (newPercentage > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
};

const marginLostFocus = () => {
    const cost = parseInt((unit === "SCM" ? qty * width : qty) * unitPrice * (campaignDuration / minimumCampaignDuration));
    const newMarginPercentage = ((margin / (cost + margin)) * 100).toFixed(1);

    // Ensure consistent update when margin field loses focus
    dispatch(setQuotesData({ marginPercentage: newMarginPercentage }));
    setMarginPercentage(newMarginPercentage);
};


  // const marginPercentageLostFocus = () => {
  //   dispatch(setQuotesData({marginAmount: formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - marginPercentage)) * 100) * (marginPercentage/100)}))
  // }

  const textAreaRef = useRef(null);

  const handleRemarks = (e) => {
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingRemarks.php/get?suggestion=${e.target.value}`)
      .then((response) => response.json())
      .then((data) => setRemarksSuggestion(data));
    dispatch(setQuotesData({remarks: e.target.value}))
    //setRemarks(e.target.value);
  } 

  const filteredData = datas

  const sortedSlabData = slabData
    .sort((a, b) => Number(a.StartQty * a.Width) - Number(b.StartQty * b.Width));

  const findMatchingQtySlab = (value, width) => {
    let matchingStartQty = sortedSlabData[0].StartQty;
    let matchingWidth = sortedSlabData[0].Width

    for (const slab of sortedSlabData) {
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

//   const minSlabData = sortedSlabData.reduce((min, current) => {
//     return unit === "SCM" ? current.StartQty * current.Width < min.StartQty * min.Width ? current : min : current.StartQty < min.StartQty ? current : min;
// }, sortedSlabData[0]);

  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(0);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };
  
  // const items = [
  //   content: {
  //     {
  //     label: 'Customer Price(incl. GST 18%)',
  //     value: `₹${formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * 1.18))}`
  //     },{      
  //     label: 'Customer Price(excl. GST)',
  //     value: `₹${formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)))}`
  //     }
  //   },
  //   {
  //     content: (
  //       <div className="mb-4 border-gray-300 rounded-lg p-2 w-full mx-4 border text-black">
  //         <p className="font-bold text-sm mb-1">
  //           *Vendor Cost(incl. GST 18%): ₹{formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)) * (1.18)))}
  //         </p>
  //         <p className="font-semibold text-sm mb-1">
  //           *Vendor Cost(excl. GST): ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)))}
  //         </p>
  //         {/* <p className="text-sm text-gray-300">
  //           ₹{formattedRupees(qty * (unitPrice) * (campaignDuration / minimumCampaignDuration))}({qty} {unit} x ₹{formattedRupees(unitPrice/ (campaignDuration === 0 ? 1 : campaignDuration))}{campaignDurationVisibility === 1 && (' x ' + ((campaignDuration === 0) ? 1 : campaignDuration) + ' ' + (leadDay && (leadDay.CampaignDurationUnit) ? leadDay.CampaignDurationUnit : 'Day'))})</p>
  //         <p className="text-sm text-gray-300 mb-1">- ₹{formattedRupees(extraDiscount / 1)} Discount</p>
  //         <p className="font-semibold text-sm">
  //           * GST Amount(net) : ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)) * (0.18))}
  //         </p> */}
  //       </div>
  //     )
  //   }
  // ];

  const items = [
    {
      content: [
        {
          label: 'Price',
          value: ` ₹${formattedRupees(((unit !== "SCM" ? qty : qty * width) * unitPrice * (campaignDuration / minimumCampaignDuration)) + parseInt(margin) )}`
        },
        {
          label: 'Cost',
          value: ` ₹${formattedRupees((((unit !== "SCM" ? qty : qty * width) * unitPrice * (campaignDuration / minimumCampaignDuration))))}`
        }
      ]
    },
    {
      content: [
        {
          label: 'Price',
          value: ` ₹${formattedRupees(((unit !== "SCM" ? qty : qty * width) * unitPrice * (campaignDuration / minimumCampaignDuration)+ parseInt(margin)) * ((rateGST/100) + 1)) }`
        },
        {
          label: 'Cost',
          value: ` ₹${formattedRupees(((((unit !== "SCM" ? qty : qty * width) * unitPrice * (campaignDuration / minimumCampaignDuration))) * ((rateGST/100) + 1)))}`
        }
      ]
    }
  ];  

  const itemTemplate = (item) => {
    return (
      <div className="p-2 justify-center flex">
        <div className="mb-4 border-gray-500 bg-gradient-to-br from-gray-100 to-white sm:w-full rounded-lg justify-center shadow-md shadow-gray-500 p-2 text-xl text-left mx-2 py-3 border text-black">
          {item.content.map((entry, i) => (
            <div key={i}  className='flex flex-row font-inter'>
            <p 
            className={`font-${i === 0 ? 'bold' : 'normal'} text-nowrap text-[16px] mb-2 text-gray-800`}
            //className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 "
            >
              {entry.label}: 
            </p>
            <p 
            className={`font-${i === 0 ? 'bold' : 'semibold'} text-[16px] mb-1`}
            //className="text-lg md:text-lg lg:text-xl font-bold text-blue-500 "
            >&nbsp;&nbsp;&nbsp;{entry.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const responsiveOptions = [
    {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '768px',
        numVisible: 1,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
];

  const vendorOptions = datas.map(option => ({
    value: option.VendorName,
    label: option.VendorName === '' && filteredData.length === 1 ? 'No Vendors' : option.VendorName,
  }));

  const slabOptions = sortedSlabData.map(opt => ({
    value: JSON.stringify({
      Qty: opt.StartQty,
      Width: unit !== "SCM" ? 1 : opt.Width
    }),
    label: `${unit !== "SCM" ? opt.StartQty + "+" : (opt.StartQty * opt.Width) + "+"} ${unit} : ₹${(Number(opt.UnitPrice))} per ${campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day' : "Campaign"}`
  }))
// console.log(adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, 
//   campaignDuration, margin, remarks, rateId, minimumCampaignDuration, formattedDate, rateGST, width, 
//   campaignDurationVisibility)

const handleCompleteEdit = () => {
  if (validateFields()) {
    // Prepare the updated item
    const updatedItem = {
      index: editIndex,
      adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, 
      campaignDuration, margin, remarks, rateId, 
      CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", 
      leadDay: leadDay ? leadDay.LeadDays : "", 
      minimumCampaignDuration, formattedDate, rateGST, width, 
      campaignDurationVisibility, editQuoteNumber, isEditMode: true
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
      setSuccessMessage("Item added to Cart");
    }

    // Dispatch only if there is a change
    if (isItemUpdated) {
      dispatch(addItemsToCart(updatedCartItems));

      // Reset messages after a delay
      setTimeout(() => {
        setSuccessMessage("");
        dispatch(resetQuotesData());
        dispatch(setQuotesData({ currentPage: "checkout", previousPage: "adDetails", isEditMode: true }));
      }, 2000);
    }
  } else {
    // Show error if validation fails
    setToastMessage("Please fill the necessary details in the form.");
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
          // className="p-2 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3 max-h-10"
          type="text"
          id="RateSearchInput"
          // name='RateSearchInput'
          placeholder="Ex: RateName Type"
          value={rateSearchTerm}
          onChange = {handleRateSearch}
          onFocus={(e) => {e.target.select()}}
        /><div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500 " />
      </div></div>
      {(ratesSearchSuggestion.length > 0 && rateSearchTerm !== "") && (
              <ul className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                {ratesSearchSuggestion.map((name, index) => (
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
            {/* <div class="relative flex flex-col w-fit h-fit  overflow-hidden font-sans text-base isolation-isolate before:absolute before:inset-[1px] before:rounded-lg before:bg-white after:absolute after:w-1 after:inset-y-[0.65rem] after:left-[0.5rem] after:rounded after:bg-gradient-to-b from-[#2eadff] via-[#3d83ff] to-[#7e61ff] after:transition-transform after:duration-300 hover:after:translate-x-[0.15rem]">
    
    <div class="notititle text-blue-500 px-5 pt-3 pb-1 pr-1 text-lg font-medium transition-transform duration-300 ease-out z-10">Customer Price(incl. GST 18%): ₹{formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18)))}</div>
    <div class="notibody text-blue-500 px-5 text-lg font-semibold transition-transform duration-300 ease-out z-10">Customer Price(excl. GST): ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)))}</div>
</div> */}
            {/* <Carousel value={items}  
                itemTemplate={itemTemplate} 
                responsiveOptions={responsiveOptions} 
                numVisible={2} 
                numScroll={1}
                circular 
                showIndicators={false} /> */}

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
              <div className="mb-3 overflow-y-auto h-full" > 
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
                dispatch(addItemsToCart([{ index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate, rateGST, width, campaignDurationVisibility, isNewCart: true, isSelected: false }]));
                setSuccessMessage("Item added to Cart");
                setTimeout(() => { setSuccessMessage(''); }, 2000);
              }
              return;
            }
            const index = cartItems.length;
            dispatch(addItemsToCart([{ index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate, rateGST, width, campaignDurationVisibility, isNewCart: true, isSelected: false }]));
            setSuccessMessage("Item added to Cart");
            setTimeout(() => { setSuccessMessage(''); }, 2000);
          } else {
            setToastMessage('Please fill the necessary details in the form.');
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

              {/* <span className='flex flex-row mb-2 justify-center'>
                <div className="flex flex-col mr-2 items-center justify-center">
                  <button
                    className={`${rateId > 0 ? 'Addtocartafter-button' : 'Addtocart-button'} text-white px-4 py-2 rounded-xl transition-all duration-300 ease-in-out shadow-md`}
                    //className="bg-blue-500 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out"
                    disabled = {rateId > 0 ? false : true}
                    // onClick={() => {dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, extraDiscount, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate}])); dispatch(resetQuotesData())}}
                    onClick={(e) => {
                      e.preventDefault();
                      if (validateFields()) {
                        const isDuplicate = cartItems.some(item => item.rateId === rateId && item.qty === qty);
                        if (isDuplicate) {
                          // Display an error message or handle the duplicate case
                          let result = window.confirm("This item is already in the cart. Do you want to still Proceed?");
                          if(result){
                            const index = cartItems.length
                            // console.log(index)
                            dispatch(addItemsToCart([{index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate, rateGST, width, campaignDurationVisibility}]));
                            setSuccessMessage("Item added to Cart");
                            setTimeout(() => {
                              setSuccessMessage('');
                            }, 2000);
                            // dispatch(updateCurrentPage("checkout"))
                          }
                          return;
                        }
                        const index = cartItems.length
                        dispatch(addItemsToCart([{index, adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate, rateGST, width, campaignDurationVisibility}]));
                        setSuccessMessage("Item added to Cart");
                        setTimeout(() => {
                          setSuccessMessage('');
                        }, 2000);
                      } else {
                        setToastMessage('Please fill the necessary details in the form.');
                        setSeverity('error');
                        setToast(true);
                        setTimeout(() => {
                          setToast(false);
                        }, 2000);
                      }
                  }}
                  >
                    <ShoppingCartIcon className='text-white mr-2'/>
                    Add to Cart
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
                </span> */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {/* <div name="QuoteVendorSelect">
                <label className="block mb-1 font-medium">Vendor</label>
                <Dropdown
                  className={`w-full border rounded-lg `} //${errors.clientSource ? 'border-red-400' : ''}
                  id="8"
                  name="ClientSourceSelect"
                  options={filteredData}
                  value={selectedVendor}
                  onChange={(e) => dispatch(setQuotesData({selectedVendor: e.target.value}))}
                />
              </div> */}
              {/* {errors.clientSource && <p className="text-red-500 text-xs">{errors.clientSource}</p>} */}
             

                
                 { unit !== 'SCM' ? (
                  <div className="mb-4 flex flex-col ">
                   <label className="font-bold mb-1 ml-2">Quantity</label>
                    <div className="flex w-[80%] border ml-2 border-gray-400 rounded-lg">
                    <input
                      className={`w-[70%] px-4 py-2 border-y-0 border-l-0 border border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Qty}
                      value={qty}
                      onChange={(e) => {
                        //setQty(e.target.value);
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin(e.target.value * unitPrice * campaignDuration / minimumCampaignDuration * (marginPercentage / 100)).toFixed(0)}))
                        //setMargin(formattedMargin((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
                        // setMarginPercentage(((margin * 100) / (e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2));
                        setQtySlab(findMatchingQtySlab(e.target.value, false));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <label className="justify-center mt-2 ml-2 ">{unit ? unit : 'Unit'}</label>
                  </div>
                  <p className="text-red-700">{qty < qtySlab.Qty ? 'Minimum Quantity should be ' + qtySlab.Qty : ''}</p>
                </div>
                   ) : (
                    <div className="mb-4 flex flex-row">
                    <div className="mb-4 flex flex-col">
                   <label className="font-bold mb-1 ml-2">Height (CM)</label>
                    <div className="flex w-full">
                    <input
                      className={`w-[80%] ml-2 px-4 py-2 border border-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Qty}
                      value={qty}
                      onChange={(e) => {
                        //setQty(e.target.value);
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin((e.target.value * width * unitPrice * campaignDuration / minimumCampaignDuration) * (marginPercentage / 100)).toFixed(0)}));
                        //setMargin(formattedMargin((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
                        // setMarginPercentage(((margin * 100) / (e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2));
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
                      //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab.Width}
                      value={width}
                      onChange={(e) => {
                        //setQty(e.target.value);
                        dispatch(setQuotesData({width: e.target.value, marginAmount: formattedMargin(((unit === "SCM" ? qty * e.target.value : qty) * unitPrice * campaignDuration / minimumCampaignDuration) * (marginPercentage / 100))}));
                        //setMargin(formattedMargin((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
                        // setMarginPercentage(((margin * 100) / (e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2));
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
                        //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                        type="number"
                        placeholder="Ex: 1000"
                        // defaultValue={campaignDuration}
                        value={campaignDuration}
                        onChange={(e) => {
                          dispatch(setQuotesData({campaignDuration: e.target.value, marginAmount: formattedMargin((unit === "SCM" ? qty * width : qty) * unitPrice * e.target.value ) * (marginPercentage / 100)})); 
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
                  {/* <div className="flex space-x-2 mb-4 mr-2 md:mr-20 sm:mr-24">
  <div className="flex flex-col w-1/2">
    <label className="font-bold ml-2 mb-1 text-nowrap">Margin Amount(₹)</label>
    <input
      className={`w-full ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginAmount ? 'border-red-400' : ''}`}
      type="number"
      placeholder="Ex: 4000"
      value={margin}
      onChange={handleMarginChange}
      onBlur={marginLostFocus}
      onFocus={(e) => e.target.select()}
    />
    {errors.marginAmount && <p className="text-red-500 text-xs ml-3">{errors.marginAmount}</p>}
  </div>

  <div className="flex flex-col w-1/2">
    <label className="font-bold ml-2 mb-1">Margin %</label>
    {/* <div className="flex items-center"> */}
      {/* <input
        className={`w-full ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
        type="number"
        placeholder="Ex: 15"
        value={formattedRupees(marginPercentage)}
        onChange={handleMarginPercentageChange}
        onFocus={(e) => e.target.select()}
      /> */}
    {/* </div> */}
  {/* </div>
</div> */}
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
                    onChange={handleMarginChange}
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
                      onChange={handleMarginPercentageChange}
                      //onBlur={marginPercentageLostFocus}
                      onFocus={(e) => e.target.select()}
                    />
                    <p className="mt-1 font-bold ml-2">%</p></span>
                  </div>
                  </div>
                {/* <div className="mb-4 flex flex-col">
                  <label className="font-bold ml-2 mb-1">Extra Discount(₹)</label>
                  <input
                  className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                    //className="w-full border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 1000"
                    value={extraDiscount}
                    onChange={(e) => dispatch(setQuotesData({extraDiscount: e.target.value}))}
                    onFocus={(e) => e.target.select()}
                  />
                </div> */}
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

                  {remarksSuggestion.length > 0 && (
                    <ul className="list-none">
                      {remarksSuggestion.map((name, index) => (
                        <li key={index}>
                          <button
                          className='text-purple-500 hover:text-purple-700'
                          value={name}
                          onClick={() => {
                             dispatch(setQuotesData({remarks: name}))
                             //setRemarks(name);
                             setRemarksSuggestion([]);
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
                  //className={`w-full px-4 py-2 border mb-2 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                  className={`w-[80%] mt-1 ml-2 border border-gray-400 rounded-lg text-black focus:outline-none focus:shadow-outline focus:border-blue-300`}  
                  //className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={selectedVendor}
                    onChange={(selectedOption) => dispatch(setQuotesData({ selectedVendor: selectedOption ? selectedOption.value : '' }))}
                    // onChange={(e) => dispatch(setQuotesData({selectedVendor: e.target.value}))}
                    options={vendorOptions}
                  />
                </div>
                <div className="mb-4 flex flex-col">
                  <label className="font-bold mb-1 ml-2">Quantity Slab Wise Cost</label>
                  <Dropdown
                   className={`w-[80%] ml-2 mt-1  border border-gray-400 rounded-lg  text-black focus:outline-none focus:shadow-outline focus:border-gray-300`}
                    //className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={JSON.stringify(qtySlab)}
                    onChange={(e) => {
                      const selectedValue = JSON.parse(e.target.value);
                      setQtySlab(selectedValue);
                      // console.log(qty, selectedValue.Qty, formattedMargin((( (unit === "SCM" ? (selectedValue.Qty * selectedValue.Width) : selectedValue.Qty) * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - marginPercentage)) * 100)  * (marginPercentage/100))
                      dispatch(setQuotesData({width: selectedValue.Width, quantity: selectedValue.Qty, marginAmount: formattedMargin((unit === "SCM" ? selectedValue.Qty * selectedValue.Width : selectedValue.Qty) * unitPrice * campaignDuration / minimumCampaignDuration) * (newPercentage / 100)}));
                    }}
                    options={slabOptions}
                  />
                    {/* {sortedSlabData.map((opt, index) => (
                      <option className="rounded-lg" key={index} value={opt.StartQty}>
                        {opt.StartQty}+ {unit} : ₹{formattedRupees(Number(opt.UnitPrice/ (campaignDuration === 0 ? 1 : campaignDuration)) * (Number(marginPercentage) + 100) / 100)} per {campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day': "Campaign"}
                      </option>
                    ))} */}
                </div>
                </div>
                
                {/* <div className="flex flex-col justify-center bg-gradient-to-br from-gray-100 to-white items-center mx-4 px-3 py-1 my-4 rounded-lg shadow-md shadow-gray-400 border border-gray-400">
                <p className="font-medium text-lg text-[#333333] mt-2">Quote Valid till {month ? formattedDate : "0000-00-00"}</p>
                  <p className="font-medium text-[#1A1A1A] text-lg mt-2  text-center">
                    Note: Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : 0} days from the date of payment received or the date of design approved, whichever is higher
                  </p>
                  
                </div> */}
                <div className="flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white items-center mx-4 px-4 py-3 mt-4 mb-8 rounded-xl shadow-lg shadow-gray-300 border border-gray-300">
  <p className="font-semibold text-lg text-gray-800 mt-1">
    Quote Valid till {month ? formattedDate : "0000-00-00"}
  </p>
  <p className="font-medium text-gray-600 text-base mt-2 text-center">
    Note: Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : 0} days from the date of payment received or the date of design approved, whichever is higher.
  </p>
</div>

              </div>
              
              </div>
            </div>
            {/* <div className="bg-surface-card p-8 rounded-2xl mb-4">
                <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
                  <MuiAlert severity={severity} onClose={() => setToast(false)}>
                    {toastMessage}
                  </MuiAlert>
                </Snackbar>
              </div> */}
              {/* ToastMessage component */}
  {successMessage && <SuccessToast message={successMessage} />}
  {toast && <ToastMessage message={toastMessage} type="error"/>}
          </div>
      )
}         

export default AdDetailsPage;