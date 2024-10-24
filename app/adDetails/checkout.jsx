'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import MuiAlert from '@mui/material/Alert';
import { RemoveCircleOutline } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { useAppSelector } from '@/redux/store';
import { setQuotesData, resetQuotesData } from '@/redux/features/quote-slice';
import { useDispatch } from 'react-redux';
import { fetchNextQuoteNumber } from '../api/fetchNextQuoteNumber';
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
  const [nextQuoteNumber, setNextQuoteNumber] = useState([]);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  
  const clientDetails = useAppSelector(state => state.clientSlice)
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const {clientName, clientContact, clientEmail, clientSource, clientTitle, clientGST} = clientDetails;
  const username = useAppSelector(state => state.authSlice.userName);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const ratePerUnit = useAppSelector(state => state.quoteSlice.ratePerUnit);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition)
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  const previousPage = useAppSelector(state => state.quoteSlice.previousPage)
  const rateId = useAppSelector(state => state.quoteSlice.rateId);
  

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

  const handleRemoveRateId = (index) => {
    dispatch(removeItem(index));
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

          const quoteNumber = await fetchNextQuoteNumber(companyName);
          setNextQuoteNumber(quoteNumber)
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

  // const calculateGrandTotal = () => {
  //   let grandTotal = [];
  //   cartItems.map((item, index) => {
  //     const priceOfAd = (item.qty * item.unitPrice *( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)+ (item.margin - item.extraDiscount)) * ((rateGST/100) + 1)
  //     grandTotal.push(priceOfAd);
  // })
  // let grandTotalAmount = grandTotal.reduce((total, amount) => total + amount, 0);
  // grandTotalAmount = `₹ ${formattedRupees(Math.round(grandTotalAmount))}`
  // return grandTotalAmount;
  // }

  const hasRemarks = cartItems.some(item => item.remarks);
  const hasCampaignDuration = cartItems.some(item => item.campaignDurationVisibility);


  return (
    <div className=" mt-2 text-black w-screen">

        <div className='mx-[8%]'>
        {cartItems.length >= 1 ? (
          <div>
            <h1 className='text-2xl mt-6 font-bold text-center mb-4 text-blue-500'>Cart</h1>
          {/* <div className="flex flex-row justify-between mt-8">
          
          <div className="mb-8 flex items-center">

              <button
                className=" hover:scale-110 text-blue-500 hover:animate-pulse border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg "
                onClick={() => {
                   dispatch(setQuotesData({currentPage: previousPage}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>
              </div>
              <> <h1 className='text-2xl font-bold text-center mb-4'>Cart</h1>
              <button className='border px-2 py-1 h-fit bg-blue-500 text-white rounded-lg hover:bg-blue-200 hover:text-black hover:animate-pulse' onClick={() => dispatch(resetCartItem())}>Clear All</button>
              </>
          </div> */}
          {/* <h1 className="text-lg font-medium text-blue-500 mb-4">Verify before sending Quote</h1> */}
          <div className='flex flex-col lg:items-center md:items-center justify-center w-full'>
            
            <div>
              
              {/* <h1 className='mb-4 font-bold text-center'>AD Details</h1> */}
                <div className='overflow-x-auto'>
              <table className='mb-8 w-full border-collapse border border-gray-200 table-auto'>
        <thead>
          <tr>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Rate Card ID</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Quote No.</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Rate Medium</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Rate Type</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Rate Category</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Edition</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Package</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Quantity</th>
            {hasCampaignDuration && <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Campaign Duration</th>}
            {hasRemarks && <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Remarks</th>}
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Unit Price</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Price (excl. GST)</th>
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Remove</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr key={index}>
              <td className='p-1.5 border border-gray-200'>{item.rateId}</td>
              <td className='p-1.5 border border-gray-200'>{nextQuoteNumber}</td>
              <td className='p-1.5 border border-gray-200'>{item.adMedium}</td>
              <td className='p-1.5 border border-gray-200'>{item.adType}</td>
              <td className='p-1.5 border border-gray-200'>{item.adCategory}</td>
              <td className='p-1.5 border border-gray-200'>{item.edition}</td>
              <td className='p-1.5 border border-gray-200'>{item.position}</td>
              <td className='p-1.5 border border-gray-200'>{item.unit === "SCM" ? item.width + "W" + " x " + item.qty + "H" : item.qty} {item.unit}</td>
              {hasCampaignDuration && <td className='p-1.5 border border-gray-200'>{(item.campaignDuration && (item.CampaignDurationUnit)) ? item.campaignDuration + " " + item.CampaignDurationUnit : 'NA'}</td>}
              {hasRemarks && <td className='p-1.5 border border-gray-200 text-nowrap'>{item.remarks}</td>}
              <td className='p-1.5 border border-gray-200 w-fit text-nowrap'>₹ {formattedRupees(((item.unit === "SCM" ? item.qty * item.width : item.qty)* item.unitPrice *( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)+ parseInt(item.margin)) / item.qty)} per {item.unit}</td>
              <td className='p-1.5 border border-gray-200 text-nowrap'>
                ₹ {formattedRupees((((item.unit === "SCM" ? item.qty * item.width : item.qty)* item.unitPrice *( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)+ parseInt(item.margin))))}</td>
              <td className='p-1.5 border border-gray-200'>
                <IconButton aria-label="Remove" className='align-top self-center bg-blue-500 border-blue-500' 
                  onClick={() => handleRemoveRateId(item.index)}
                >
                  <RemoveCircleOutline color='primary' fontSize='small'/>
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>    
      </table>
      {/* <h1 className='mb-4 font-bold text-center'>Grand Total: {calculateGrandTotal()}</h1> */}
      </div>
      <div className='flex justify-center mt-4'>
        <button className='rounded-xl border bg-blue-500 px-2 py-2 text-white' onClick={() => dispatch(setQuotesData({currentPage: 'adDetails', previousPage: "checkout"}))}><FontAwesomeIcon icon={faPlusCircle} className='text-white mr-1 text-lg'/> Add More</button>
      </div>
              
            </div>

</div>
          
          </div>
        ):(
          <div>
          {/* <div className="flex flex-row justify-between mt-8"> */}
          
          {/* <div className="mb-8 flex items-center">

              <button
                 className="mr-8 hover:scale-110 text-blue-500 hover:animate-pulse font-semibold border-blue-500 shadow-md shadow-blue-500 border px-2 py-1 rounded-lg "
                onClick={() => {
                    dispatch(setQuotesData({currentPage: previousPage !== "checkout" ? previousPage : "adDetails"}))
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
              </button>
              </div>
              <> <h1 className='text-2xl font-bold text-center mb-4'>Cart</h1>
              <button disabled className='border px-2 py-2 h-fit bg-gray-500 text-white rounded-xl cursor-not-allowed'>Clear All</button>
              </>
          </div> */}
          <h1 className='text-2xl mt-2 font-bold text-center mb-4 text-blue-500'>Cart</h1>
          <div className='text-center justify-center'>
            <label className='font-800 text-xl'> Oops! No Items in Cart</label>
            <span className='flex flex-row justify-center mt-4'>
            <label className='ml-2 text-xl'>
              <button className='text-blue-600 underline text-xl' onClick={() => dispatch(setQuotesData({currentPage: "adDetails", previousPage: "checkout"}))}>Add Items </button>
              &nbsp; in cart to generate quote</label>
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