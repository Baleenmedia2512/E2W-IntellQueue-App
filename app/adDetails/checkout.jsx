'use client'
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlusCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import { useRouter } from 'next/navigation';
import MuiAlert from '@mui/material/Alert';
import { RemoveCircleOutline } from '@mui/icons-material';
import UndoIcon from '@mui/icons-material/Undo';
import IconButton from '@mui/material/IconButton';
import { useAppSelector } from '@/redux/store';
import { setQuotesData, resetQuotesData } from '@/redux/features/quote-slice';
import { useDispatch } from 'react-redux';
import { fetchNextQuoteNumber } from '../api/fetchNextQuoteNumber';
import { removeItem, resetCartItem, removeEditItem } from '@/redux/features/cart-slice';
import { setClientData, resetClientData } from '@/redux/features/client-slice';
import { FetchQuoteSearchTerm, FetchQuoteData } from '../api/FetchAPI';
import EditIcon from '@mui/icons-material/Edit';
import { addItemsToCart } from '@/redux/features/cart-slice';

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
  const [quoteSearchSuggestion, setQuoteSearchSuggestion] = useState([]);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState("")
  const [isEditMode, setIsEditMode] = useState(false);
  

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

  const handleRemoveRateId = (index, editMode, newCartOnEdit) => {

    if (editMode) {
      if(newCartOnEdit) {
        dispatch(removeItem(index));
      } else {
        dispatch(removeEditItem(index));
      }
    } else {
      dispatch(removeItem(index));
    }
    
  };
  const handleEditRow = (item) => {
    dispatch(setQuotesData({ 
    selectedAdMedium: item.adMedium,
    selectedAdType: item.adType,
    selectedAdCategory: item.adCategory,
    selectedEdition: item.edition,
    selectedPosition: item.position,
    selectedVendor: {label: item.selectedVendor, value: item.selectedVendor},
    // selectedSlab: "",
    quantity: item.qty,
    width: item.width,
    ratePerUnit: item.unitPrice,
    unit: item.unit,
    rateId: item.rateId,
    validityDate: item.formattedDate,
    leadDays: item.leadDay,
    minimumUnit: item.minimumCampaignDuration,
    campaignDuration: item.campaignDuration,
    marginAmount: item.margin,
    // extraDiscount: 0,
    remarks: item.remarks,
    currentPage: "adDetails",
    // validRates: [],
    isDetails: true,
    previousPage: 'checkout',
    // history: [],
    rateGST: item.rateGST,
    // qtySlab: {
    //   Qty: 1,
    //   Width: 1
    // }
    isEditMode: true,
    editIndex: item.index,
    editQuoteNumber: item.editQuoteNumber
  }));
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

  const handleQuoteSearch = async(e) =>{
    setQuoteSearchTerm(e.target.value);
    if (e.target.value !== ''){
      const searchSuggestions = await FetchQuoteSearchTerm(companyName, e.target.value);
      setQuoteSearchSuggestion(searchSuggestions);
    }
  }
  console.log(cartItems)

  const handleQuoteSelection = async (e) => {
    try {
      const selectedResult = e.target.value;
      setQuoteSearchTerm(selectedResult);
      const selectedQuoteId = selectedResult.split(' - ')[0];
      setQuoteSearchSuggestion([]);
      const data = await FetchQuoteData(companyName, selectedQuoteId);
      
      if (!Array.isArray(data)) {
        console.error("Data fetched is not an array:", data);
        return;
      }
      setIsEditMode(true)

      // Update existing items in cart to isEditMode: true
      const updatedCartItems = cartItems.map(item => ({
        ...item,
        isEditMode: true,
        editQuoteNumber: data[0].QuoteID || ''
      }));

      // Update the cart with the modified existing items
      dispatch(addItemsToCart(updatedCartItems));
      
      data.forEach((item, index) => {
        // Use cartItems.length + index to calculate unique index for each item
        const newIndex = cartItems.length + index + 1;
        
        dispatch(addItemsToCart([{
          index: newIndex,
          adMedium: item.rateName || '',
          adType: item.typeOfAd || '',
          adCategory: item.adType || '',
          edition: item.Location || '',
          position: item.Package || '',
          selectedVendor: item.Vendor || '',
          qty: item.Quantity || 0,
          unit: item.Units || '',
          unitPrice: item.ratePerUnit || 0,
          campaignDuration: item.CampaignDays || 0,
          margin: item.Margin || 0,
          remarks: item.Remarks || '',
          rateId: item.RateID || null,
          CampaignDurationUnit: item.CampaignDurationUnits || '',
          leadDay: item.LeadDays || 0,
          minimumCampaignDuration: item.MinimumCampaignDuration === 0 ? 1 : item.MinimumCampaignDuration || 1,
          formattedDate: item.ValidityDate || '',
          rateGST: item.GSTPercentage || 0,
          width: item.width || 0,
          campaignDurationVisibility: item.campaignDurationVisibility || 0,
          editQuoteNumber: item.QuoteID || '',
          isEditMode: true,
          cartId: item.CartId
        }]));
        {dispatch(setClientData({
          clientName: item.ClientName ,
          clientContact: item.ClientContact,
          clientEmail: item.ClientEmail,
          clientSource: item.Source,
        }))};
      });
    } catch (error) {
      console.error("Error in handleQuoteSelection:", error);
    }
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

  const ratesSearchSuggestion = [];

  const handleUndoRemove = (index) => {
    const updatedCartItems = cartItems.map(item =>
      item.index === index ? { ...item, isCartRemoved: false } : item
    );
    dispatch(addItemsToCart(updatedCartItems)); 
  };
  
  return (
    <div className="text-black w-screen items-center px-3">
      <h1 className='text-2xl font-bold text-center mb-4 text-blue-500'>Cart</h1>
    <div className='justify-center relative mb-4'>
    
                <div className="flex items-center w-full border rounded-lg border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
              <input
          className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0`}
          // className="p-2 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3 max-h-10"
          type="text"
          id="QuoteSearchInput"
          name='QuoteSearchInput'
          placeholder="Ex: 2540 Tony Bus"
          value={quoteSearchTerm}
          onChange = {handleQuoteSearch}
          onFocus={(e) => {e.target.select()}}
        /><div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500 " />
      </div></div>
      {(quoteSearchSuggestion.length > 0 && quoteSearchTerm !== "") && (
              <ul className="absolute mt-1 w-full bg-white border text-black border-gray-200 rounded-md shadow-lg overflow-y-auto max-h-48">
                {quoteSearchSuggestion.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none"
                      onClick={handleQuoteSelection}
                      value={name}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            </div>
        <div>
        {cartItems.length >= 1 ? (
          <div>
            
            {cartItems[0].isEditMode && cartItems[0].editQuoteNumber ? (
            <div className='mb-4'>
            <div className="w-fit sm:w-fit bg-blue-50 border border-blue-200 rounded-lg mb-1 flex items-center shadow-md sm:mr-4">
              <button
                className="bg-blue-500 text-white font-medium text-sm md:text-base px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 mr-2 text-nowrap"
                onClick={() => {
                  dispatch(resetCartItem());
                  dispatch(resetClientData());
                  dispatch(resetQuotesData());
                  dispatch(setQuotesData({currentPage: 'checkout', previousPage: 'adDetails'}));
                }}
              >
                Exit Edit
              </button>
              <div className="flex flex-row text-left text-sm md:text-base pr-2">
                <p className="text-gray-600 font-semibold">#{cartItems[0].editQuoteNumber}</p>
                <p className="text-gray-600 font-semibold mx-1">-</p>
                <p className="text-gray-600 font-semibold">{clientName}</p>
                {/* <p className="text-gray-600 font-semibold mx-1">-</p>
                <p className="text-gray-600 font-semibold">₹{cartItems[0].unitPrice}</p> */}
              </div>
            </div>
            <p className="text-xs text-gray-400 italic mt-1">Q.No - Client Name</p>
            </div> 
          ) : ''}
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
          <div className='flex flex-col justify-center w-full'>
            
            <div>
              
              {/* <h1 className='mb-4 font-bold text-center'>AD Details</h1> */}
                <div className='overflow-x-auto max-h-[40vh]'>
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
            {/* <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Remove</th> */}
            <th className='p-2 border border-gray-200 text-blue-600 font-semibold'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item, index) => (
            <tr 
            key={index}
            className={item.isCartRemoved ? 'opacity-50 bg-gray-100' : ''}
            >
              <td className='p-1.5 border border-gray-200'>{item.rateId}</td>
              <td className='p-1.5 border border-gray-200'>{!item.editQuoteNumber ? nextQuoteNumber : item.editQuoteNumber}</td>
              <td className='p-1.5 border border-gray-200'>{item.adMedium}</td>
              <td className='p-1.5 border border-gray-200'>{item.adType}</td>
              <td className='p-1.5 border border-gray-200'>{item.adCategory}</td>
              <td className='p-1.5 border border-gray-200'>{item.edition}</td>
              <td className='p-1.5 border border-gray-200'>{item.position}</td>
              <td className='p-1.5 border border-gray-200'>{item.unit === "SCM" ? item.width + "W" + " x " + item.qty + "H" : item.qty} {item.unit}</td>
              {hasCampaignDuration && <td className='p-1.5 border border-gray-200'>{(item.campaignDuration && (item.CampaignDurationUnit)) ? item.campaignDuration + " " + item.CampaignDurationUnit : 'NA'}</td>}
              {hasRemarks && <td className='p-1.5 border border-gray-200 text-nowrap'>{item.remarks}</td>}
              <td className='p-1.5 border border-gray-200 w-fit text-nowrap'>
                ₹ {formattedRupees(
                  Math.round(
                    (
                      (item.unit === "SCM" ? item.qty * item.width : item.qty) *
                      item.unitPrice *
                      (item.minimumCampaignDuration > 0 ? item.campaignDuration / item.minimumCampaignDuration : 1) +
                      parseInt(item.margin)
                    ) / item.qty
                  )
                )} per {item.unit}
              </td>
              <td className='p-1.5 border border-gray-200 text-nowrap'>
                ₹ {formattedRupees(
                  Math.round(
                    (item.unit === "SCM" ? item.qty * item.width : item.qty) *
                    item.unitPrice *
                    (item.minimumCampaignDuration > 0 ? item.campaignDuration / item.minimumCampaignDuration : 1) +
                    parseInt(item.margin)
                  )
                )}
              </td>

              <td className='p-1.5 border border-gray-200'>
              <div className="flex space-x-3 items-center">
                <IconButton 
                  aria-label="Edit" 
                  className='m-0 h-full'
                  onClick={() => handleEditRow(item)}
                  disabled={item.isCartRemoved}
                  // style={{ height: '100%', width: 'auto', padding: '4px' }} // Adjust padding as needed
                >
                  <EditIcon className='text-blue-500 hover:text-blue-700' fontSize='small'/>
                </IconButton>
                {/* Remove or Undo Button */}
                {item.isCartRemoved ? (
                  <IconButton
                    aria-label="Undo"
                    className='m-0 h-full'
                    onClick={() => handleUndoRemove(item.index)}
                  >
                    <UndoIcon className='text-green-500 hover:text-green-700 opacity-100' fontSize='small' />
                  </IconButton>
                ) : (
                  <IconButton
                    aria-label="Remove"
                    className='m-0 h-full'
                    onClick={() => handleRemoveRateId(item.index, item.isEditMode, item.isNewCart)}
                  >
                    <RemoveCircleOutline className='text-red-500 hover:text-red-700' fontSize='small' />
                  </IconButton>
                )}
              </div>
            </td>


              {/* <td className='p-1.5 border border-gray-200'>
                <IconButton aria-label="Remove" className='align-top self-center bg-blue-500 border-blue-500' 
                  onClick={() => handleRemoveRateId(item.index)}
                >
                  <RemoveCircleOutline color='primary' fontSize='small'/>
                </IconButton>
              </td> */}
            </tr>
          ))}
        </tbody>    
      </table>
      {/* <h1 className='mb-4 font-bold text-center'>Grand Total: {calculateGrandTotal()}</h1> */}
      </div>
      <div className='flex justify-center mt-4'>
        <button className='rounded-xl border bg-blue-500 px-2 py-2 text-white'
        onClick={() => {
          // Reset quotes data
          dispatch(resetQuotesData());
      
          // Set quotes data
          dispatch(setQuotesData({
              currentPage: 'adDetails',
              previousPage: "checkout",
              isEditMode: cartItems.length > 0 ? cartItems[0].isEditMode : false,
              editQuoteNumber: cartItems.length > 0 ? cartItems[0].editQuoteNumber : 0,
              isNewCartOnEdit: cartItems.length > 0 && cartItems[0].isEditMode ? true : false
          }));
      }}
      ><FontAwesomeIcon icon={faPlusCircle} className='text-white mr-1 text-lg'/> Add More</button>
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
          {/* <h1 className='text-2xl mt-2 font-bold text-center mb-4 text-blue-500'>Cart</h1> */}
          <div className="flex flex-col items-center justify-center space-y-1 py-12 px-4 sm:px-6 md:px-8">
            <label className="text-xl sm:text-2xl font-semibold text-gray-800">
              Looks like your cart is empty.
            </label>
            
            <span className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
              <label className="text-lg sm:text-xl">
                <button 
                  className="text-blue-600 font-semibold underline hover:text-blue-800 transition duration-300 ease-in-out"
                  onClick={() => dispatch(setQuotesData({currentPage: "adDetails", previousPage: "checkout"}))}
                >
                  Add Items
                </button>
                &nbsp;in cart to generate quote
              </label>
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