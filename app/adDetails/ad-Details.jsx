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
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { addItemsToCart } from '@/redux/features/cart-slice';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

export const formattedMargin = (number) => {
  const roundedNumber = (number / 1).toFixed(2);
  return Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
};

const AdDetailsPage = () => {
  
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
  const [marginPercentage, setMarginPercentage] = useState(15)
  //const [extraDiscount, setExtraDiscount] = useState(0)
  //const [remarks, setRemarks] = useState('');
  const [remarksSuggestion, setRemarksSuggestion] = useState([]);

  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const [datas, setDatas] = useState([]);
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const companyName = 'Baleen Test'
  // const companyName = useAppSelector(state => state.authSlice.companyName);
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
  const extraDiscount = useAppSelector(state => state.quoteSlice.extraDiscount);
  const remarks = useAppSelector(state => state.quoteSlice.remarks);
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

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

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
        dispatch(setQuotesData({ratePerUnit: firstSelectedSlab.UnitPrice, unit: firstSelectedSlab.Unit, marginAmount: ((qty * firstSelectedSlab.UnitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100).toFixed(2)}))
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
        dispatch(setQuotesData({selectedAdMedium: firstData.rateName, selectedAdType: firstData.typeOfAd, selectedAdCategory: firstData.adType, selectedEdition: firstData.Location, selectedPosition: firstData.Package, selectedVendor: firstData.vendorName, validityDate: firstData.ValidityDate, leadDays: firstData.LeadDays, ratePerUnit: firstData.ratePerUnit, minimumUnit: firstData.minimumUnit, unit: firstData.Unit, quantity: firstData.minimumUnit, isDetails: true}))
        console.log(data)
      } catch (error) {
        console.error("Error while fetching rates: " + error)
      }
    }

    fetchRate();
    fetchData();
  }, [rateId]);

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
    const qtySlabNumber = parseInt(qtySlab)
    // Find the corresponding slabData for the selected QtySlab
    const selectedSlab = sortedSlabData.filter(item => item.StartQty === qtySlabNumber);

    { !changing && dispatch(setQuotesData({quantity: qtySlab})); }
    { changing && setChanging(false) }
    dispatch(setQuotesData({marginAmount: formattedMargin((qtySlab * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100)}))
    //setMargin(formattedMargin((qtySlab * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
    // Update UnitPrice based on the selected QtySlab
    if (selectedSlab) {
      const firstSelectedSlab = selectedSlab[0];
      dispatch(setQuotesData({ratePerUnit: firstSelectedSlab.UnitPrice, unit: firstSelectedSlab.Unit}));
      // setUnitPrice(firstSelectedSlab.UnitPrice);
      // setUnit(firstSelectedSlab.Unit)
    }
  };

  useEffect(() => {
    if (qtySlab) {
      handleQtySlabChange();
    }
  }, [qtySlab])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!username) {
          routers.push('/login');
        } else {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php/?JsonDBName=${companyName}`);
          const data = await response.json();

          //filter rates according to adMedium, adType and adCategory
          const filterdata = data.filter(item => (item.adCategory.includes(":") ? (edition + " : " + position) : edition) && item.adType === adCategory && item.rateName === adMedium)
            .filter((value, index, self) =>
              self.findIndex(obj => obj.VendorName === value.VendorName) === index
            )
            .sort((a, b) => a.VendorName.localeCompare(b.VendorName));
          setDatas(filterdata);
          //dispatch(setQuotesData({rateId: filterdata[0].rateId}));
          dispatch(setQuotesData({marginAmount: ((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * 15) / 100).toFixed(2)}))
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [adMedium]);

 
  const dispatch = useDispatch();
  const handleSubmit = () => {
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
      dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, extraDiscount, remarks, rateId, CampaignDurationUnit: leadDay.CampaignDurationUnit, leadDay: leadDay.LeadDays, minimumCampaignDuration, formattedDate}]))
      dispatch(setQuotesData({isDetails: true}))
      if(clientName){
        dispatch(setQuotesData({currentPage: "checkout"}))
      } else{
        routers.push('/');
      }
    }
  }

  const handleMarginChange = (event) => {
    //const newValue = parseFloat(event.target.value);
    //setMargin(event.target.value);
    dispatch(setQuotesData({marginAmount: event.target.value}))
    setMarginPercentage((event.target.value * 100) / (qty * unitPrice * (campaignDuration / minimumCampaignDuration)))
  };

  const handleMarginPercentageChange = (event) => {
    //const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(event.target.value);
    dispatch(setQuotesData({marginAmount: formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * event.target.value) / 100))}))
    //setMargin(formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * event.target.value) / 100)));
  };

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
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };
  
  const items = [
    {
      content: (
        <div class="mb-4 bg-blue-600 rounded-md p-4 text-white">
          <p className="font-bold text-sm mb-1">
            *Customer Price(incl. GST 18%): ₹{formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18)))}
          </p>
          <p className="font-semibold text-sm mb-1 ">
            *Customer Price(excl. GST): ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)))}
          </p>
          <p className="text-sm ">=
            ₹{formattedRupees(qty * (unitPrice * (Number(marginPercentage) + 100) / 100) * (campaignDuration / minimumCampaignDuration))}({qty} {unit} x ₹{formattedRupees((unitPrice / (campaignDuration === 0 ? 1 : campaignDuration)) * (Number(marginPercentage) + 100) /100)}{campaignDurationVisibility === 1 && (' x ' + ((campaignDuration === 0) ? 1 : campaignDuration) + ' ' + (leadDay && (leadDay.CampaignDurationUnit) ? leadDay.CampaignDurationUnit : 'Day'))})</p>
          <p className="text-sm  mb-1">- ₹{formattedRupees(extraDiscount / 1)} Discount</p>
          <p className="font-semibold text-sm">
            * GST Amount : ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (0.18))}
          </p>
        </div>
      )
    },
    {
      content: (
        <div className="mb-4 bg-green-600 rounded-md p-4 text-white">
          <p className="font-bold text-sm mb-1">
            *Vendor Cost(incl. GST 18%): ₹{formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)) * (1.18)))}
          </p>
          <p className="font-semibold text-sm mb-1">
            *Vendor Cost(excl. GST): ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)))}
          </p>
          <p className="text-sm text-gray-300">
            ₹{formattedRupees(qty * (unitPrice) * (campaignDuration / minimumCampaignDuration))}({qty} {unit} x ₹{formattedRupees(unitPrice/ (campaignDuration === 0 ? 1 : campaignDuration))}{campaignDurationVisibility === 1 && (' x ' + ((campaignDuration === 0) ? 1 : campaignDuration) + ' ' + (leadDay && (leadDay.CampaignDurationUnit) ? leadDay.CampaignDurationUnit : 'Day'))})</p>
          <p className="text-sm text-gray-300 mb-1">- ₹{formattedRupees(extraDiscount / 1)} Discount</p>
          <p className="font-semibold text-sm">
            * GST Amount(net) : ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) - (extraDiscount)) * (0.18))}
          </p>
        </div>
      )
    }
  ];

  const customTemplate = (item) => {
    return item.content; // Return the content of each item
  };

  const greater = ">>"

  return (
    
    <div className=" mt-8 text-black">    
      <div className="fixed left-[8%] right-[8%] overflow-hidden no-pull-to-refresh">
            {/* <button onClick={() => {Cookies.remove('adcategory');Cookies.remove('adMediumSelected'); setShowAdCategoryPage(true);}}>Back</button> */}
            <div className="mb-8 flex items-center justify-between">
              <button
                className="mr-8 hover:scale-110 hover:text-orange-900"
                onClick={() => {
                  position === "" ?
                  dispatch(setQuotesData({selectedEdition: "", currentPage: "edition"})) :
                  dispatch(setQuotesData({selectedPosition: "", currentPage: "remarks"}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>

              <h2 className="font-semibold text-wrap mb-1">
                {adMedium} {greater} {adType} {greater} {adCategory} {greater} {edition} {position === "" ? "" : greater} {position === "" ? "" : position} {greater} {rateId}
              </h2>
              <IconButton aria-label="cart" className='rounded-none text-center shadow-md right-[2%]' onClick={() => dispatch(setQuotesData({currentPage: "checkout"}))}> 
                <StyledBadge badgeContent={cartItems.length} color="primary">
                  <ShoppingCartIcon className='text-black' />
                </StyledBadge>
              </IconButton>
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
            </div>
            
              <div>
            {/* <div class="relative flex flex-col w-fit h-fit  overflow-hidden font-sans text-base isolation-isolate before:absolute before:inset-[1px] before:rounded-lg before:bg-white after:absolute after:w-1 after:inset-y-[0.65rem] after:left-[0.5rem] after:rounded after:bg-gradient-to-b from-[#2eadff] via-[#3d83ff] to-[#7e61ff] after:transition-transform after:duration-300 hover:after:translate-x-[0.15rem]">
    
    <div class="notititle text-blue-500 px-5 pt-3 pb-1 pr-1 text-lg font-medium transition-transform duration-300 ease-out z-10">Customer Price(incl. GST 18%): ₹{formattedRupees((((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18)))}</div>
    <div class="notibody text-blue-500 px-5 text-lg font-semibold transition-transform duration-300 ease-out z-10">Customer Price(excl. GST): ₹{formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)))}</div>
</div> */}

            <Carousel value={items} numVisible={1} numScroll={1} itemTemplate={customTemplate} />

              <div className="mb-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 27rem)' }}>
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
                <div className="mb-4">
                  <label className="font-bold">Vendor</label>
                  <select
                    className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={selectedVendor}
                    onChange={(e) => dispatch(setQuotesData({selectedVendor: e.target.value}))}
                  >
                    {datas.map((option, index) => (
                      <option className="rounded-lg" key={index} value={option.VendorName}>
                        {option.VendorName === '' && filteredData.length === 1
                          ? 'No Vendors'
                          :
                          // `₹${formattedRupees(qty * unitPrice * (campaignDuration / minimumCampaignDuration) + margin)} - ${(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : ''} days - 
                          `${option.VendorName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="font-bold">Quantity Slab wise rates</label>
                  <select
                    className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={qtySlab}
                    onChange={(e) => {
                      setQtySlab(e.target.value);
                      // {changing && setQty(e.target.value);}
                      dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin(((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100))}))
                      // setMargin(formattedMargin(((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100)))
                    }}
                  >
                    {sortedSlabData.map((opt, index) => (
                      <option className="rounded-lg" key={index} value={opt.StartQty}>
                        {opt.StartQty}+ {unit} : ₹{formattedRupees(Number(opt.UnitPrice/ (campaignDuration === 0 ? 1 : campaignDuration)) * (Number(marginPercentage) + 100) / 100)} per {campaignDurationVisibility === 1 ? (leadDay && (leadDay.CampaignDurationUnit)) ? leadDay.CampaignDurationUnit : 'Day': "Campaign"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="font-bold">Quantity</label>
                  <div className="flex w-full">
                    <input
                      className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      defaultValue={qtySlab}
                      value={qty}
                      onChange={(e) => {
                        //setQty(e.target.value);
                        dispatch(setQuotesData({quantity: e.target.value, marginAmount: formattedMargin((e.target.value * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100)}));
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
                        className=" w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                        type="number"
                        placeholder="Ex: 1000"
                        // defaultValue={campaignDuration}
                        value={campaignDuration}
                        onChange={(e) => {
                          dispatch(setQuotesData({campaignDuration: e.target.value, marginAmount: formattedMargin(((qty * unitPrice * e.target.value * marginPercentage) / 100))})); 
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
                <div className="mb-4">
                  <label className="font-bold">Margin Amount(₹)</label>
                  <input
                    className="w-full border border-gray-300 mb-4 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 4000"
                    value={margin}
                    onChange={handleMarginChange}
                    onFocus={(e) => e.target.select()}
                  />
                  <div className='flex items-center'>
                    <p className="mr-5">Margin Percentage :</p><br />
                    <input
                      className="w-20 border border-gray-300 bg-blue-300 text-black p-2 h-8 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 15"
                      defaultValue="15"
                      value={formattedRupees(marginPercentage)}
                      onChange={handleMarginPercentageChange}
                      onFocus={(e) => e.target.select()}
                    />
                    <p className="mt-1 text-sm">%</p><br />
                  </div>

                </div>
                <div className="mb-4">
                  <label className="font-bold">Extra Discount(₹)</label>
                  <input
                    className="w-full border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 1000"
                    value={extraDiscount}
                    onChange={(e) => dispatch(setQuotesData({extraDiscount: e.target.value}))}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div className="mb-4">
                  <label className="font-bold">Remarks</label>
                  <InputTextarea
                    autoResize
                    className="w-full border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
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
                <span className='flex flex-row justify-center'>
                <div className="flex flex-col mr-2 mt-4 items-center justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-200 text-white hover:text-black px-4 py-2 rounded-xl transition-all duration-300 ease-in-out"
                    //className="bg-blue-500 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out"
                    onClick={() => {dispatch(addItemsToCart([{adMedium, adType, adCategory, edition, position, selectedVendor, qty, unit, unitPrice, campaignDuration, margin, extraDiscount, remarks, rateId, CampaignDurationUnit: leadDay.CampaignDurationUnit, leadDay: leadDay.LeadDays, minimumCampaignDuration, formattedDate}])); dispatch(resetQuotesData())}}
                  >
                    Add to Cart
                  </button>
                </div>
                <div className="flex flex-col ml-2 mt-4 items-center justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-200 text-white hover:text-black px-4 py-2 rounded-xl transition-all duration-300 ease-in-out"
                    onClick={() => handleSubmit()}
                  >
                    Go to Cart
                  </button>
                </div>
                </span>
                <div className="flex flex-col justify-center items-center mt-4">
                  <p className="font-semibold text-red-500">
                    *Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : 0} days from the date of payment received or the date of design approved, whichever is higher
                  </p>
                  <p className="font-bold">Quote Valid till {formattedDate}</p>
                </div>
              </div>
              </div>
            </div>
            <div className="bg-surface-card p-8 rounded-2xl mb-4">
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