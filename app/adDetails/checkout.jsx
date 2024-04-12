'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import MuiAlert from '@mui/material/Alert';
import { generatePdf } from '../generatePDF/generatePDF';
import { InputTextarea } from 'primereact/inputtextarea';
import { Carousel } from 'primereact/carousel';
import { useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { resetClientData } from '@/redux/features/client-slice';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

export const formattedMargin = (number) => {
  const roundedNumber = (number / 1).toFixed(2);
  return Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
};

const CheckoutPage = () => {
  
  const [slabData, setSlabData] = useState([])
  const [qtySlab, setQtySlab] = useState()
  const [unitPrice, setUnitPrice] = useState('')
  // const [minimumUnit, setMinimumUnit] = useState(qtySlab)
  const [qty, setQty] = useState(qtySlab)
  const [selectedDayRange, setSelectedDayRange] = useState('Day');
  // const [campaignDuration, setCampaignDuration] = useState(1);
  const [unit, setUnit] = useState('')

  const [marginPercentage, setMarginPercentage] = useState(15)
  const [extraDiscount, setExtraDiscount] = useState(0)
  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const [checkout, setCheckout] = useState(true);
  const [datas, setDatas] = useState([]);
  const clientDetails = useAppSelector(state => state.clientSlice)
  const {clientName, clientContact, clientEmail, clientSource} = clientDetails;
  const username = useAppSelector(state => state.authSlice.userName);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const ratePerUnit = useAppSelector(state => state.quoteSlice.ratePerUnit);
  const rateId = useAppSelector(state => state.quoteSlice.rateId)
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition)
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  const selectedVendor = useAppSelector(state => state.quoteSlice.selectedVendor);
  const isAdDetails = Cookies.get('isAdDetails');
  const newData = datas.filter(item => Number(item.rateId) === Number(rateId));
  const leadDay = newData[0];
  const minimumCampaignDuration = (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1
  const routers = useRouter();
  const campaignDurationVisibility = (leadDay) ? leadDay.campaignDurationVisibility : 0
  // console.log((leadDay) ? leadDay.campaignDurationVisibility : 50)
  const [campaignDuration, setCampaignDuration] = useState((leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1);
  const [margin, setMargin] = useState(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * 15) / 100).toFixed(2));
  const ValidityDate = (leadDay) ? leadDay.ValidityDate : Cookies.get('validitydate');
  const [changing, setChanging] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const inputDate = new Date(ValidityDate);
const day = ('0' + inputDate.getDate()).slice(-2); // Ensure two digits for day
const month = months[inputDate.getMonth()]; // Get month abbreviation from the array
const year = inputDate.getFullYear();

const formattedDate = `${day}-${month}-${year}`;

  useEffect(() => { setCampaignDuration(minimumCampaignDuration) }, [leadDay, minimumCampaignDuration])

  useEffect(() => {
    if (selectedDayRange === "") {
      setSelectedDayRange(dayRange[1]);
    }
  },[])

  useEffect(() => {
    if(isAdDetails){
      setCheckout(false)
    }
    else{
    const fetchData = async () => {
      try {
        const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSlabData(data);
        const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
        const firstSelectedSlab = sortedData[0];
        setQtySlab(firstSelectedSlab.StartQty);
        setUnitPrice(firstSelectedSlab.UnitPrice);
        setUnit(firstSelectedSlab.Unit)
        setMargin(((qty * firstSelectedSlab.UnitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100).toFixed(2))
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }
  }, [rateId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://orders.baleenmedia.com/API/Media/FetchRateId.php/?JsonRateName=${rateName}&JsonAdType=${adType}&JsonAdCategory=${adCategory}&JsonVendorName=${selectedVendor}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        dispatch(setQuotesData({rateId: data}));
      }
      catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [selectedVendor]);

  const handleQtySlabChange = () => {
    const qtySlabNumber = parseInt(qtySlab)
    // Find the corresponding slabData for the selected QtySlab
    const selectedSlab = sortedSlabData.filter(item => item.StartQty === qtySlabNumber);

    { !changing && setQty(qtySlab); }
    { changing && setChanging(false) }
    setMargin(formattedMargin((qtySlab * unitPrice * (campaignDuration / minimumCampaignDuration) * marginPercentage) / 100));
    // Update UnitPrice based on the selected QtySlab
    if (selectedSlab) {
      const firstSelectedSlab = selectedSlab[0];
      setUnitPrice(firstSelectedSlab.UnitPrice);
      setUnit(firstSelectedSlab.Unit)
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
          const response = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchValidRates.php');
          const data = await response.json();

          //filter rates according to adMedium, adType and adCategory
          const filterdata = data.filter(item => (item.adCategory.includes(":") ? (edition + " : " + position) : edition) && item.adType === adCategory && item.rateName === adMedium)
            .filter((value, index, self) =>
              self.findIndex(obj => obj.VendorName === value.VendorName) === index
            )
            .sort((a, b) => a.VendorName.localeCompare(b.VendorName));
          setDatas(filterdata);
          dispatch(setQuotesData({rateId: filterdata[0].rateId}));
          // setMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * 15) / 100).toFixed(2))
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const [toastMessage, setToastMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
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
      if(clientName){
        setCheckout(false);
      } else{
        routers.push('/addenquiry');
      }
    }
  }

  const handleMarginChange = (event) => {
    //const newValue = parseFloat(event.target.value);
    setMargin(event.target.value);
    setMarginPercentage((event.target.value * 100) / (qty * unitPrice * (campaignDuration / minimumCampaignDuration)))
  };

  const handleMarginPercentageChange = (event) => {
    //const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(event.target.value);
    setMargin(formattedMargin(((qty * unitPrice * (campaignDuration / minimumCampaignDuration) * event.target.value) / 100)));
  };

  const [remarks, setRemarks] = useState('');

  const [remarksSuggestion, setRemarksSuggestion] = useState([]);
  const textAreaRef = useRef(null);

  const handleRemarks = (e) => {
    fetch(`https://orders.baleenmedia.com/API/Media/SuggestingRemarks.php/get?suggestion=${e.target.value}`)
      .then((response) => response.json())
      .then((data) => setRemarksSuggestion(data));
    setRemarks(e.target.value);
  } 

  const filteredData = datas

  const sortedSlabData = slabData
    .sort((a, b) => Number(a.StartQty) - Number(b.StartQty));

  const findMatchingQtySlab = (value) => {
    let matchingStartQty = sortedSlabData[0].StartQty;

    for (const slab of sortedSlabData) {
      if (value >= slab.StartQty) {
        matchingStartQty = slab.StartQty;      } else {
        break;
      }
    }
    return matchingStartQty;
  };

  const pdfGeneration = async () => {
    const AmountExclGST = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)));
    const AmountInclGST = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18));
    const [firstPart, secondPart] = adCategory.split(':');
    const PDFArray = [adMedium, adCategory, edition, position, qty, campaignDurationVisibility === 1 ? campaignDuration : 'NA', (formattedRupees(AmountExclGST / qty)), formattedRupees(AmountExclGST), '18%', formattedRupees(AmountInclGST), leadDay.LeadDays, campaignDurationVisibility === 1 ? (leadDay.CampaignDurationUnit ? leadDay.CampaignDurationUnit : 'Day'): '' , unit, typeOfAd, formattedDate]
    const GSTPerc = 18

    generatePdf(PDFArray, clientName, clientEmail)

    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertCartQuoteData.php/?JsonUserName=${username}&
    JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonLeadDays=${leadDay.LeadDays}&JsonSource=${clientSource}&JsonAdMedium=${rateName}&JsonAdType=${adType}&JsonAdCategory=${adCategory}&JsonQuantity=${qty}&JsonUnits=${unit}&JsonAmountwithoutGst=${AmountExclGST}&JsonAmount=${AmountInclGST}&JsonGSTAmount=${AmountInclGST - AmountExclGST}&JsonGST=${GSTPerc}&JsonRatePerUnit=${ratePerUnit}&JsonDiscountAmount=${extraDiscount}&JsonRemarks=${remarks}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
        alert("Quote Downloaded")
        dispatch(resetClientData())
        //setMessage(data.message);
      } else {
        alert(`The following error occurred while inserting data: ${data}`);
        //setMessage("The following error occurred while inserting data: " + data);
        // Update ratesData and filteredRates locally

      }
    } catch (error) {
      console.error('Error updating rate:', error);
    }

    dispatch(resetClientData())
  }

  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };

  return (
    <div className=" mt-8 text-black">

        <div className='mx-[8%]'>
          <div className="flex flex-row justify-between mt-8">
          <div className="mb-8 flex items-center">
              <button
                className="mr-8 hover:scale-110 hover:text-orange-900"
                onClick={() => {
                  dispatch(setQuotesData({currentPage: "adDetails"}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-xl' />
              </button>
              </div>
              <> <h1 className='text-2xl font-bold text-center mb-4'>Checkout</h1>
              <button
                className=" px-2 py-1 rounded text-center"
                onClick={() => {
                  routers.push('/');
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
              </button></>
          </div>
          <h1 className='mb-14 font-semibold'>Verify before sending quote</h1>
          <div className='flex flex-col lg:items-center md:items-center justify-center w-full'>
            <div>
              <h1 className='mb-4 font-bold text-center'>AD Details</h1>

              <table className='mb-8'>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Ad Medium</td>
                  <td>:</td><td>  {adMedium}</td>
                </tr>
                {adType !== "" && (<tr>
                  <td className='py-1 text-blue-600 font-semibold'>Ad Type</td>
                  <td>:</td><td>  {adType}</td>
                </tr>)}
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Ad Category</td>
                  <td>:</td><td>  {adCategory}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Edition</td>
                  <td>:</td><td>  {edition}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Quantity</td>
                  <td>:</td><td>  {qty} {unit}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Campaign Duration</td>
                  <td>:</td><td>  {(leadDay && (leadDay.CampaignDurationUnit)) ? campaignDuration + " " + leadDay.CampaignDurationUnit : 'NA'}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Price</td>
                  <td>:</td><td> ₹ {formattedRupees(((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18))} (incl. GST)</td>
                </tr>
              </table>

              <h1 className='mb-4 font-bold text-center'>Client Details</h1>

              <table className='mb-6'>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client Name</td>
                  <td>:</td><td>  {clientName}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client Number</td>
                  <td>:</td><td>  {clientContact}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client E-Mail</td>
                  <td>:</td><td>  {clientEmail}</td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Source</td>
                  <td>:</td><td>  {clientSource}</td>
                </tr>
              </table>
            </div></div>
          <div className='flex flex-col justify-center items-center'>

            <button
              className="bg-green-500 text-white px-4 py-2 mb-4 rounded-full transition-all duration-300 ease-in-out hover:bg-green-600"
              onClick={pdfGeneration}
            >
              Download Quote
            </button>
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
export default CheckoutPage;