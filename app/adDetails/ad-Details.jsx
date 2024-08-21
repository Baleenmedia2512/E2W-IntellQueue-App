'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
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
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import { addItemsToCart } from '@/redux/features/cart-slice';
import CreatableSelect from 'react-select/creatable';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';

export const formattedMargin = (number) => {
  const roundedNumber = (number / 1).toFixed(0);
  return Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
};

const AdDetailsPage = () => {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [slabData, setSlabData] = useState([])
  const [qtySlab, setQtySlab] = useState()
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
  // const companyName = 'Baleen Test';
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const username = useAppSelector(state => state.authSlice.userName);
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
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage)
  const newData = datas.filter(item => Number(item.rateId) === Number(rateId));
  const leadDay = newData[0];
  const minimumCampaignDuration = (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1
  const routers = useRouter();
  const campaignDurationVisibility = (leadDay) ? leadDay.campaignDurationVisibility : 0;
  const cartItems = useAppSelector(state => state.cartSlice.cart);
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

  useEffect(() => {
    dispatch(setQuotesData({campaignDuration: (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1, validityDate: (leadDay) ? leadDay.ValidityDate : Cookies.get('validitydate'), leadDays: (leadDay) ? leadDay.LeadDays: ""}));
  }, [leadDay, minimumCampaignDuration])

  useEffect(() => {
    if (selectedDayRange === "") {
      setSelectedDayRange(dayRange[1]);
    }
    if(!rateId){
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
    
  },[])

  // useEffect(() => {
  //   if(extraDiscount > 0){
  //     dispatch(setQuotesData({marginAmount: (((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - marginPercentage)) * 100) * (marginPercentage/100)) - extraDiscount).toFixed(0)}))
  //   }
    
  // },[extraDiscount])

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
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
    const fetchData = async () => {
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}&JsonDBName=${companyName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSlabData(data);
        const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
        const firstSelectedSlab = sortedData[0];
        setQtySlab(firstSelectedSlab.StartQty);
        setMarginPercentage(firstSelectedSlab.AgencyCommission || 0)
        // console.log(firstSelectedSlab.AgencyCommission)
        dispatch(setQuotesData({ratePerUnit: firstSelectedSlab.UnitPrice, unit: firstSelectedSlab.Unit}))
        //, marginAmount: ((((qty * firstSelectedSlab.UnitPrice * (campaignDuration / minimumCampaignDuration))/(100- firstSelectedSlab.AgencyCommission)) * 100).toFixed(2)  * (firstSelectedSlab.AgencyCommission/100)).toFixed(0)
        //setUnitPrice(firstSelectedSlab.UnitPrice);
        //setUnit(firstSelectedSlab.Unit)
        //setMargin(((qty * firstSelectedSlab.UnitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100).toFixed(2))
      } catch (error) {
        console.error(error);
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
        dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, minimumUnit: firstData.minimumUnit, unit: firstData.Units, quantity: firstData.minimumUnit, isDetails: true}))

      } catch (error) {
        console.error("Error while fetching rates: " + error)
      }
    }

    fetchRate();
    fetchData();
    fetchRateData();
  }, [rateId]);

  useEffect(() => {fetchRateData();},[adMedium, rateId])
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
    const qtySlabNumber = parseInt(qtySlab); // Convert the value to a number
    // Find the corresponding slabData for the selected QtySlab
    const selectedSlab = sortedSlabData.find(item => item.StartQty === qtySlabNumber);
  
    if (!selectedSlab) {
      console.error("No matching slab data found.");
      return;
    }
  
    if (!changing) {
      dispatch(setQuotesData({ quantity: qtySlab}));
    } else {
      setChanging(false);
    }
  
    const marginAmount = formattedMargin((qtySlab * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100);
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
    if (qtySlab) {
      handleQtySlabChange();
    }
  }, [qtySlab])


  const fetchRateData = async () => {
    try {
      if (!username) {
        routers.push('/login');
      } else {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
        const data = await response.json();
       
        //filter rates according to adMedium, adType and adCategory
        const filterdata = data.filter(item => (item.rateId === parseInt(rateId)))
          .filter((value, index, self) =>
            self.findIndex(obj => obj.VendorName === value.VendorName) === index
          )
          .sort((a, b) => a.VendorName.localeCompare(b.VendorName));
        setDatas(filterdata);

        //dispatch(setQuotesData({rateId: filterdata[0].rateId}));
        // console.log("qty, unitPrice, campaignDuration, minimumCampaignDuration, filterdata[0].AgencyCommission", qty, unitPrice, campaignDuration, minimumCampaignDuration, filterdata[0].AgencyCommission)
        // console.log("(((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100- filterdata[0].AgencyCommission)) * 100).toFixed(2)", (((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100- filterdata[0].AgencyCommission)) * 100).toFixed(2))
        dispatch(setQuotesData({marginAmount: (((((qty * unitPrice * (campaignDuration / minimumCampaignDuration))/(100 - filterdata[0].AgencyCommission)) * 100).toFixed(2)  * (filterdata[0].AgencyCommission/100))).toFixed(0)}))
        setMarginPercentage(filterdata[0].AgencyCommission);
        
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validateFields = () => {
    let errors = {};
    if (!margin || margin === "0") errors.marginAmount = 'Margin Amount is required';
    marginAmountRef.current.focus()
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
 
  const dispatch = useDispatch();
  const handleSubmit = () => {
    const isValid = validateFields();
    if (isValid) {
    const isDuplicate = cartItems.some(item => item.rateId === rateId);
    if (isDuplicate) {
      // Display an error message or handle the duplicate case
      alert("This item is already in the cart.");
      return;
    }

    if (qty === '' || campaignDuration === '' || margin === '') {
      setSeverity('warning');
      setToastMessage('Please fill all the Client Details!');
      setToast(true);
    }
    else if (qty < qtySlab) {
      setSeverity('warning');
      setToastMessage('Minimum Quantity should be ' + qtySlab);
      setToast(true);
    }
    else if(minimumCampaignDuration > campaignDuration){
      setSeverity('warning');
      setToastMessage('Minimum Duration should be ' + minimumCampaignDuration);
      setToast(true);
    }
    else {
      Cookies.set('isAdDetails', true);
      dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "Day", leadDay: leadDay ? leadDay.LeadDays : 1, minimumCampaignDuration, formattedDate, campaignDurationVisibility}]))
      dispatch(setQuotesData({isDetails: true}))
      dispatch(updateCurrentPage("checkout"))
      //dispatch(setQuotesData({currentPage: "checkout", previousPage: "adDetails"}))
    }
  } else {
    setToastMessage('Please fill the necessary details in the form.');
    setSeverity('error');
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 2000);
  }
  };

  const handleMarginChange = (event) => {
    const newValue = parseInt(event.target.value);
    //setMargin(event.target.value);
    dispatch(setQuotesData({marginAmount: event.target.value}))

    if (newValue > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
  };

  const marginLostFocus = () => {
    setMarginPercentage((margin * 100) / (qty * unitPrice * (campaignDuration / minimumCampaignDuration)))
    //dispatch(setQuotesData({marginAmount: event.target.value}))
  }

  const handleMarginPercentageChange = (event) => {
    const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(event.target.value);
    dispatch(setQuotesData({marginAmount: formattedMargin((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - newPercentage)) * 100) * (newPercentage/100)).toFixed(0)}));
    //setMargin(formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * event.target.value) / 100)));
    if (newPercentage > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, marginAmount: undefined }));
    }
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
    .sort((a, b) => Number(a.StartQty) - Number(b.StartQty));

  const findMatchingQtySlab = (value) => {
    let matchingStartQty = sortedSlabData[0].StartQty;

    for (const slab of sortedSlabData) {
      if (value >= slab.StartQty) {
        matchingStartQty = slab.StartQty;      
      } else {
        break;
      }
    }
    return matchingStartQty;
  };

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
          value: ` ₹${formattedRupees((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + parseInt(margin) )}`
        },
        {
          label: 'Cost',
          value: ` ₹${formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration))))}`
        }
      ]
    },
    {
      content: [
        {
          label: 'Price',
          value: ` ₹${formattedRupees((qty * unitPrice * (campaignDuration / minimumCampaignDuration)+ parseInt(margin)) * 1.18) }`
        },
        {
          label: 'Cost',
          value: ` ₹${formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration))) * 1.18))}`
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
      value: opt.StartQty,
      label: `${opt.StartQty}+ ${unit} : ₹${(Number(opt.UnitPrice/ (campaignDuration === 0 ? 1 : campaignDuration)))} per ${campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day': "Campaign"}`
    }
  ))



  return (
    
    <div className="text-black overscroll-none">    
      <div className="p-4 pt-0 left-[2%] right-[2%] overscroll-none">
            {/* <button onClick={() => {Cookies.remove('adcategory');Cookies.remove('adMediumSelected'); setShowAdCategoryPage(true);}}>Back</button> */}
            {/* <div className="mb-8 flex items-center justify-between">
              <button
                 className="mr-4 hover:scale-110 text-blue-500 text-nowrap hover:animate-pulse font-semibold border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg "
                onClick={() => {
                  dispatch(setQuotesData({selectedEdition: "", currentPage: previousPage === "adDetails" ? position !== "" ? "remarks" : "edition" : previousPage}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>
                <span className='flex flex-row'>
              <h2 className="font-semibold text-wrap mb-1">
                {adMedium} 
              </h2>
              {adType !== "" ? <>&nbsp;{greater}&nbsp;</>  : ""}
              <h2 className='font-semibold text-wrap mb-1'>
                 {adType} 
              </h2>
              {adCategory !== "" ? <>&nbsp;{greater}&nbsp;</>  : ""} 
              <h2 className='font-semibold text-wrap mb-1'>
              {adCategory}
              </h2>
               {edition !== "" ? <>&nbsp;{greater}&nbsp;</>  : ""}
               <h2 className='font-semibold text-wrap mb-1'>
              {edition}
              </h2>  
              {position === "" ? "" : <>&nbsp;{greater}&nbsp;</>}
              <h2 className='font-semibold text-wrap mb-1'>
              {position}
              </h2> &nbsp;{greater}&nbsp;
              <h2 className='font-semibold text-wrap mb-1'>
              {rateId}
              </h2>
              </span>
              <IconButton aria-label="cart" className='rounded-none ml-4 text-center shadow-md ' onClick={() => dispatch(setQuotesData({currentPage: "checkout", previousPage: "adDetails"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </IconButton> */}
              {/* <button
            className=" px-2 py-1 rounded text-center"
            onClick={() => {
              dispatch(resetQuotesData());
              // routers.push('/');
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
            </svg>
          </button> */}
            {/* </div> */}
            
              <div>
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
<h1 className='text-2xl font-bold text-center text-blue-500'>Quote Details</h1>
<br/>
<div className="w-full flex sticky overflow-x-auto sm:overflow-x-hidden space-x-4 p-2 mb-3">
  {/* <!-- Customer Price Box --> */}
  <div className="flex-shrink-0 w-60 sm:w-[47%] bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="text-lg font-bold text-blue-500 mb-2">Excluding GST</div>
    {items[0].content.map((item, index) => (
      <div key={index} className="mb-2 flex items-center">
        <div className={`text-lg font-semibold ${item.label.includes("incl. GST") ? 'text-green-600' : 'text-blue-700'}`}>
          {item.label}:
        </div>
        <div 
          className={`text-xl ml-2 font-semibold mr-1 text-gray-800`}
        >
          {item.value}
        </div>
        
      </div>
    ))}
  </div>

  {/* <!-- Vendor Cost Box --> */}
  <div className="flex-shrink-0 w-60 sm:w-[47%] bg-orange-50 border border-orange-200 rounded-lg p-4">
    <div className="text-lg font-bold text-orange-500 mb-2">Including GST</div>
    {items[1].content.map((item, index) => (
      <div key={index} className="mb-2 flex items-center">
        <div className={`text-lg font-semibold text-red-600`}>
          {item.label}: 
        </div>
        <div 
          className={`text-xl ml-2 font-semibold mr-1 text-gray-800`}
        >
          {item.value}
        </div>
        
      </div>
    ))}
  </div>
</div>






              {/* <div className="mb-3 overflow-y-auto " style={{ maxHeight: 'calc(100vh - 27rem)' }}> */}
              <div className="mb-3 overflow-y-auto h-full" > 
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
                <div className="mb-4 flex flex-col">
                  <label className="font-bold ml-2">Vendor</label>
                  <Dropdown
                  //className={`w-full px-4 py-2 border mb-2 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300`}
                  className={`w-[80%] mt-1 ml-2 border border-1 bg-gradient-to-br from-gray-100 to-white border-gray-400 rounded-lg shadow-md shadow-gray-400  text-black focus:outline-none focus:shadow-outline focus:border-blue-300`}  
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
                   className={`w-[80%] ml-2 mt-1 bg-gradient-to-br from-gray-100 to-white border border-1 border-gray-400 rounded-lg shadow-md shadow-gray-400 text-black focus:outline-none focus:shadow-outline focus:border-gray-300`}
                    //className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={qtySlab}
                    onChange={(e) => {
                      setQtySlab({
                        value: e.target.value,
                        label: e.target.value
                      });
                      // {changing && setQty(e.target.value);}
                      dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin(((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100 - marginPercentage)) * 100)  * (marginPercentage/100)}))
                      // setMargin(formattedMargin(((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100)))
                    }}
                    options={slabOptions}
                  />
                    {/* {sortedSlabData.map((opt, index) => (
                      <option className="rounded-lg" key={index} value={opt.StartQty}>
                        {opt.StartQty}+ {unit} : ₹{formattedRupees(Number(opt.UnitPrice/ (campaignDuration === 0 ? 1 : campaignDuration)) * (Number(marginPercentage) + 100) / 100)} per {campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day': "Campaign"}
                      </option>
                    ))} */}
                </div>
                <div className="mb-4 flex flex-col">
                  <label className="font-bold mb-1 ml-2">Quantity</label>
                  <div className="flex w-full">
                    <input
                      className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      min={qtySlab}
                      value={qty}
                      onChange={(e) => {
                        //setQty(e.target.value);
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin((((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration)) /(100- marginPercentage)) * 100)  * (marginPercentage/100)).toFixed(0)}));
                        //setMargin(formattedMargin((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
                        // setMarginPercentage(((margin * 100) / (e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2));
                        setQtySlab(findMatchingQtySlab(e.target.value));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <label className="text-center mt-2 ml-5">{unit}</label>
                  </div>
                  <p className="text-red-700">{qty < qtySlab ? 'Minimum Quantity should be ' + qtySlab : ''}</p>
                </div>
                {campaignDurationVisibility === 1 &&
                  (<div className="mb-4">
                    <label className="font-bold">Campaign Duration</label>
                    <div className="flex w-full">
                      <input
                        className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                        //className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                        type="number"
                        placeholder="Ex: 1000"
                        // defaultValue={campaignDuration}
                        value={campaignDuration}
                        onChange={(e) => {
                          dispatch(setQuotesData({campaignDuration: e.target.value, marginAmount: formattedMargin(((qty * unitPrice * e.target.value )/(100 - marginPercentage)) * 100)  * (marginPercentage/100)})); 
                          //setMargin(formattedMargin(((qty * unitPrice * e.target.value * marginPercentage) / 100)))
                        }}
                        onFocus={(e) => e.target.select()}
                      />
                      {/* <div className="relative"> */}
                      <label className="text-center mt-2 ml-5">{(leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day'}</label>

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

                <div className="mb-4 flex flex-col">
                  <label className="font-bold ml-2 mb-1">Margin Amount(₹)</label>
                  <input
                    className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 ${errors.marginAmount ? 'border-red-400' : ''}`}
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
                <div className='mb-4 flex flex-col'>
                <label className="font-bold ml-2 mb-1">Margin Percentage :</label>
                <span className='flex flex-row'>
                    <input
                    className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
                      //className="w-20 border border-gray-300 bg-blue-300 text-black p-2 h-8 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      value={formattedRupees(marginPercentage)}
                      onChange={handleMarginPercentageChange}
                      //onBlur={marginPercentageLostFocus}
                      onFocus={(e) => e.target.select()}
                    />
                    <p className="mt-1 font-bold ml-2">%</p></span>
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
                    className={`w-[80%] ml-2 px-4 py-2 border bg-gradient-to-br from-gray-100 to-white border-gray-400 shadow-md shadow-gray-400 text-black rounded-lg focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring focus:ring-blue-300 `}
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
                </div>
                <span className='flex flex-row justify-center'>
                <div className="flex flex-col mr-2 items-center justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all duration-300 ease-in-out shadow-md"
                    //className="bg-blue-500 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out"
                    // onClick={() => {dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, extraDiscount, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate}])); dispatch(resetQuotesData())}}
                    onClick={(e) => {
                      e.preventDefault();
                      if (validateFields()) {
                        const isDuplicate = cartItems.some(item => item.rateId === rateId);
                        if (isDuplicate) {
                          // Display an error message or handle the duplicate case
                          alert("This item is already in the cart.");
                          return;
                        }
                        dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, remarks, rateId, CampaignDurationUnit: leadDay ? leadDay.CampaignDurationUnit : "", leadDay: leadDay ? leadDay.LeadDays : "", minimumCampaignDuration, formattedDate}])); dispatch(resetQuotesData());
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
                    Add to Cart
                  </button>
                </div>
                <div className="flex flex-col ml-2 items-center justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 ease-in-out shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                  }}
                  >
                    Go to Cart
                  </button>
                </div>
                </span>
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