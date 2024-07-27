'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import MuiAlert from '@mui/material/Alert';
import { Padding, RemoveCircleOutline, plus } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { generatePdf } from '../generatePDF/generatePDF';
import { useAppSelector } from '@/redux/store';
import { Alert, Button, Box } from '@mui/material';
import { resetQuotesData, setQuotesData } from '@/redux/features/quote-slice';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, resetCartItem } from '@/redux/features/cart-slice';
import { setClientData } from '@/redux/features/client-slice';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

export const formattedMargin = (number) => {
  const roundedNumber = (number / 1).toFixed(2);
  return Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
};

const CheckoutPage = () => {
  const dispatch = useDispatch()
  const [toastMessage, setToastMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [datas, setDatas] = useState([]);
  const clientDetails = useAppSelector(state => state.clientSlice)
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const {clientName, clientContact, clientEmail, clientSource, clientTitle} = clientDetails;
  const username = useAppSelector(state => state.authSlice.userName);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const ratePerUnit = useAppSelector(state => state.quoteSlice.ratePerUnit);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition)
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  const rateId = useAppSelector(state => state.quoteSlice.rateId)
  // const qty = useAppSelector(state => state.quoteSlice.quantity);
  // const unit = useAppSelector(state => state.quoteSlice.unit);
  // const unitPrice = useAppSelector(state => state.quoteSlice.ratePerUnit);
  // const campaignDuration = useAppSelector(state => state.quoteSlice.campaignDuration);
  // const margin = useAppSelector(state => state.quoteSlice.marginAmount);
  // const extraDiscount = useAppSelector(state => state.quoteSlice.extraDiscount);
  // const remarks = useAppSelector(state => state.quoteSlice.remarks);
  const newData = datas.filter(item => Number(item.rateId) === Number(rateId));
  const leadDay = newData[0];
  const bmsources = ['1.JustDial', '2.IndiaMart', '3.Sulekha','4.LG','5.Consultant','6.Own','7.WebApp DB', '8.Online','9.Self', '10.Friends/Relatives'];
  const minimumCampaignDuration = (leadDay && leadDay['CampaignDuration(in Days)']) ? leadDay['CampaignDuration(in Days)'] : 1;
  const campaignDurationVisibility = (leadDay) ? leadDay.campaignDurationVisibility : 0;
  const ValidityDate = (leadDay) ? leadDay.ValidityDate : Cookies.get('validitydate');
  const [changing, setChanging] = useState(false);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const inputDate = new Date(ValidityDate);
  const day = ('0' + inputDate.getDate()).slice(-2); // Ensure two digits for day
  const month = months[inputDate.getMonth()]; // Get month abbreviation from the array
  const year = inputDate.getFullYear();

  // const formattedDate = `${day}-${month}-${year}`;

  const routers = useRouter();

  const pdfGeneration = async (item) => {
    const AmountExclGST = (((item.qty * item.unitPrice * ( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)) + (item.margin - item.extraDiscount)));
    const AmountInclGST = AmountExclGST * 1.18;
  
    return {
      adMedium: item.adMedium,
      adCategory: item.adCategory,
      edition: item.edition,
      position: item.position,
      qty: item.qty,
      campaignDuration: item.campaignDurationVisibility === 1 ? item.campaignDuration : 'NA',
      ratePerQty: formattedRupees(AmountExclGST / item.qty),
      amountExclGst: formattedRupees(AmountExclGST),
      gst: '18%',
      amountInclGst: formattedRupees(AmountInclGST),
      leadDays: item.leadDay,
      durationUnit: item.campaignDurationVisibility === 1 ? (item.leadDay.CampaignDurationUnit ? item.leadDay.CampaignDurationUnit : 'Day') : '',
      qtyUnit: item.unit,
      adType: item.adType,
      formattedDate: item.formattedDate
    };
  };
  
  const handlePdfGeneration = async () => {
    const cart = await Promise.all(cartItems.map(item => pdfGeneration(item)));
    await generatePdf(cart, clientName, clientEmail, clientTitle);
    dispatch(resetCartItem());
    dispatch(resetQuotesData());
  };
  // const pdfGeneration = async () => {
  //   const AmountExclGST = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)));
  //   const AmountInclGST = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18));
  //   const PDFArray = [adMedium, adCategory, edition, position, qty, campaignDurationVisibility === 1 ? campaignDuration : 'NA', (formattedRupees(AmountExclGST / qty)), formattedRupees(AmountExclGST), '18%', formattedRupees(AmountInclGST), leadDay.LeadDays, campaignDurationVisibility === 1 ? (leadDay.CampaignDurationUnit ? leadDay.CampaignDurationUnit : 'Day'): '' , unit, adType, formattedDate]
  //   const GSTPerc = 18

  //   generatePdf(PDFArray, clientName, clientEmail)

  //   try {
  //     const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertCartQuoteData.php/?JsonUserName=${username}&
  //   JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientContact}&JsonLeadDays=${leadDay.LeadDays}&JsonSource=${clientSource}&JsonAdMedium=${rateName}&JsonAdType=${adType}&JsonAdCategory=${adCategory}&JsonQuantity=${qty}&JsonUnits=${unit}&JsonAmountwithoutGst=${AmountExclGST}&JsonAmount=${AmountInclGST}&JsonGSTAmount=${AmountInclGST - AmountExclGST}&JsonGST=${GSTPerc}&JsonRatePerUnit=${ratePerUnit}&JsonDiscountAmount=${extraDiscount}&JsonRemarks=${remarks}`)
  //     const data = await response.json();
  //     if (data === "Values Inserted Successfully!") {
  //       alert("Quote Downloaded")
  //       dispatch(resetClientData())
  //       routers.push('/adMedium')
  //       //setMessage(data.message);
  //     } else {
  //       alert(`The following error occurred while inserting data: ${data}`);
  //       //setMessage("The following error occurred while inserting data: " + data);
  //       // Update ratesData and filteredRates locally

  //     }
  //   } catch (error) {
  //     console.error('Error updating rate:', error);
  //   }
  // }

  const   handleRemoveRateId = (rateId) => {
    dispatch(removeItem(rateId));
  };

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
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // console.log(cartItems[0].qty, cartItems[0].unitPrice, (cartItems[0].campaignDuration, cartItems[0].minimumCampaignDuration), (cartItems[0].margin, cartItems[0].extraDiscount), (1.18))
  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };

  return (
    <div className=" mt-8 text-black">

        <div className='mx-[8%]'>
        {cartItems.length >= 1 ? (
          <div>
          <div className="flex flex-row justify-between mt-8">
          
          <div className="mb-8 flex items-center">

              <button
                className="mr-8 hover:scale-110 hover:text-blue-500 hover:animate-bounce"
                onClick={() => {
                  rateId >= 1 ? dispatch(setQuotesData({currentPage: "adDetails"})) : dispatch(setQuotesData({currentPage: "adMedium"}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>
              </div>
              <> <h1 className='text-2xl font-bold text-center mb-4'>Cart</h1>
              <button className='border px-2 py-2 h-fit bg-blue-500 text-white rounded-xl hover:bg-blue-200 hover:text-black hover:animate-bounce' onClick={() => dispatch(resetCartItem())}>Clear All</button>
              </>
          </div>
          <h1 className="text-md md:text-md lg:text-lg font-bold text-blue-500 mb-4">Verify before sending Quote</h1>
          <div className='flex flex-col lg:items-center md:items-center justify-center w-full'>
            
            <div>
              
              <h1 className='mb-4 font-bold text-center'>AD Details</h1>
                <div className='overflow-x-auto'>
              <table className='mb-8 w-full border-collapse border border-gray-200 table-auto'>
        <thead>
          <tr>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Ad Medium</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Ad Type</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Ad Category</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Edition</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Quantity</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Campaign Duration</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Price</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index}>
              <td className='p-1.5 border border-gray-200'>{item.adMedium}</td>
              <td className='p-1.5 border border-gray-200'>{item.adType}</td>
              <td className='p-1.5 border border-gray-200'>{item.adCategory}</td>
              <td className='p-1.5 border border-gray-200'>{item.edition}</td>
              <td className='p-1.5 border border-gray-200'>{item.qty} {item.unit}</td>
              <td className='p-1.5 border border-gray-200'>{(item.campaignDuration && (item.CampaignDurationUnit)) ? item.campaignDuration + " " + item.CampaignDurationUnit : 'NA'}</td>
              <td className='p-1.5 border border-gray-200'>
                ₹ {formattedRupees(((item.qty * item.unitPrice *( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)+ (item.margin - item.extraDiscount)) * (1.18)))} (incl. GST)
              </td>
              <td className='p-1.5 border border-gray-200'>
                <IconButton aria-label="Remove" className='align-top self-center bg-blue-500 border-blue-500' 
                  onClick={() => handleRemoveRateId(item.rateId)}
                >
                  <RemoveCircleOutline color='primary' fontSize='small'/>
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>    
      </table>
      </div>
      <div className='flex justify-center mb-4'>
        <button className='rounded-xl border bg-blue-500 px-2 py-2 text-white' onClick={() => dispatch(setQuotesData({currentPage: 'adMedium'}))}><FontAwesomeIcon icon={faPlusCircle} className='text-white mr-1 text-lg'/> Add More</button>
      </div>
              <h1 className='mb-4 font-bold text-center'>Client Details</h1>

              <table className='mb-6'>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client Name</td>
                  <td>:</td><td> <input placeholder="Ex: Tony" className='w-full py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7' value = {clientName} onChange={(e) => dispatch(setClientData({clientName: e.target.value}))}></input></td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client Number</td>
                  <td>:</td><td>  <input placeholder="Ex: 0000000000" type="number" maxLength={10} className='w=full py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7' value={clientContact} onChange={(e) => dispatch(setClientData({clientContact: e.target.value}))}></input></td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Client E-Mail</td>
                  <td>:</td><td> <input placeholder="Ex: client@email.com" className='w-full py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7' value={clientEmail} onChange={(e) => dispatch(setClientData({clientEmail: e.target.value}))}></input></td>
                </tr>
                <tr>
                  <td className='py-1 text-blue-600 font-semibold'>Source</td>
                  <td>:</td><td> <select className='py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7 w-full' value={clientSource} onChange={(e) => dispatch(setClientData({clientSource: e.target.value}))}>{bmsources.map((item, index) => (
                    <option key={index}>{item}</option>
                  ))}</select></td>
                </tr>
              </table>
            </div>

</div>
          <div className='flex flex-col justify-center items-center'>

            <button
              className="bg-blue-500 text-white px-4 py-2 mb-4 rounded-xl transition-all duration-300 ease-in-out hover:bg-blue-200 hover:text-black"
              onClick={handlePdfGeneration}
            >
              Download Quote
            </button>
            
          </div>
          </div>
        ):(
          <div>
          <div className="flex flex-row justify-between mt-8">
          
          <div className="mb-8 flex items-center">

              <button
                className="mr-8 hover:scale-110 hover:text-blue-500 hover:animate-bounce"
                onClick={() => {
                  dispatch(setQuotesData({currentPage: "adDetails"}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>
              </div>
              <> <h1 className='text-2xl font-bold text-center mb-4'>Cart</h1>
              <button disabled className='border px-2 py-2 h-fit bg-gray-500 text-white rounded-xl cursor-not-allowed'>Clear All</button>
              </>
          </div>
          <div className='text-center justify-center'>
            <label className='font-800 text-xl'> Oops! No Items in Cart</label>
            <span className='flex flex-row justify-center mt-4'>
              <button className='text-blue-600 underline text-xl' onClick={() => dispatch(setQuotesData({currentPage: "adMedium"}))}>Add Items </button>
              <label className='ml-2 text-xl'> in cart to generate quote</label>
            </span>
          </div>
          
          </div>
        )}
        
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