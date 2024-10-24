'use client'
import {useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdTypePage from './adType';
import axios from 'axios';
import AdMediumPage from './adMedium';
import { useAppSelector } from '@/redux/store';
import AdCategoryPage from './adCategory';
import EditionPage from './Edition';
import RemarksPage from './Remarks';
import AdDetailsPage from './ad-Details';
import CheckoutPage from './checkout';
import { faArrowLeft, faClose, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import { goBack, resetQuotesData, setQuotesData, updateCurrentPage } from '@/redux/features/quote-slice';
import { useDispatch } from 'react-redux';
import { fetchNextQuoteNumber } from '../api/fetchNextQuoteNumber';
import { generatePdf } from '../generatePDF/generatePDF';
import { resetClientData, setClientData } from '@/redux/features/client-slice';
import { resetCartItem } from '@/redux/features/cart-slice';

export const AdDetails = () => {
  const routers = useRouter();
  const dispatch = useDispatch();
  const clientNameRef = useRef(null);
  const clientContactRef = useRef(null);
  // const companyName = 'Baleen Test';
  const dbName = useAppSelector(state => state.authSlice.dbName);
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const clientDetails = useAppSelector(state => state.clientSlice);
  const [isClientNameFocus, setIsClientNameFocus] = useState(false);
  const [isClientContact, setIsClientContact] = useState(true);
  const [isClientName, setIsClientName] = useState(true)
  const [clientNameSuggestions, setClientNameSuggestions] = useState([]);
  const {clientName, clientContact, clientEmail, clientSource, clientTitle, clientGST} = clientDetails;
  const width = useAppSelector(state => state.quoteSlice.width);
  const username = useAppSelector(state => state.authSlice.userName);
  const currentPage = useAppSelector(state => state.quoteSlice.currentPage);
  const adMedium = useAppSelector(state => state.quoteSlice.selectedAdMedium);
  const adType = useAppSelector(state => state.quoteSlice.selectedAdType);
  const adCategory = useAppSelector(state => state.quoteSlice.selectedAdCategory);
  const rateId = useAppSelector(state => state.quoteSlice.rateId);
  const cartItems = useAppSelector(state => state.cartSlice.cart);
  const edition = useAppSelector(state => state.quoteSlice.selectedEdition);
  const position = useAppSelector(state => state.quoteSlice.selectedPosition);
  const bmsources = ['1.JustDial', '2.IndiaMart', '3.Sulekha','4.LG','5.Consultant','6.Own','7.WebApp DB', '8.Online','9.Self', '10.Friends/Relatives'];
  //const previousPage = useAppSelector(state => state.quoteSlice.previousPage)

  useEffect(() => {
    if (!username || dbName === "") {
      router.push('/login');
    }
      
  }, []);

  useEffect(()=>{
    if(clientName === ""){
      clientNameRef.current?.focus()
    }else if(clientContact === ""){
      clientContactRef.current?.focus()
    }
  },[isClientContact, isClientName])

  const fetchClientDetails = (clientID) => {
    axios
      .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientID=${clientID}&JsonDBName=${companyName}`)
      .then((response) => {
        const data = response.data;
        if (data && data.length > 0) {
          
          const clientDetails = data[0];
          dispatch(setClientData({ clientID: clientDetails.id || "" }));
          dispatch(setClientData({ clientName: clientDetails.name || "" }));
          //MP-69-New Record are not fetching in GS
          // Convert DOB to dd-M-yy for display
          dispatch(setClientData({ clientEmail: clientDetails.email }));
          dispatch(setClientData({ clientSource: clientDetails.source || "" }));
          dispatch(setClientData({clientTitle: clientDetails.gender}));   
        } else {
          console.warn("No client details found for the given name and contact number.");
        }
      })
      .catch((error) => {
        console.error("Error fetching client details:", error);
      });
  };

  const handleSearchTermChange = (event) => {
    const newName = event.target.value
    // setIsNewClient(true);
    
    if (newName !== '') {
      try{
        fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}&type=name`)
          .then((response) => response.json())
          .then((data) => setClientNameSuggestions(data));
        
      } catch(error){
        console.error("Error Suggesting Client Names: " + error)
      }
    } else {
      setClientNameSuggestions([]);
    }
      dispatch(setClientData({clientName: newName}));
      setIsClientName(true)
    //   if (errors.clientName) {
    //     setErrors((prevErrors) => ({ ...prevErrors, clientName: undefined }));
    // }
  };

  const handleClientNameSelection = (names) => {
    const input = names.target.value;
    const splitInput = input.split('-');
    const rest = splitInput[1];
    const ID = splitInput[0].trim();
    const name = rest.substring(0, rest.indexOf('(')).trim();
    const number = rest.substring(rest.indexOf('(') + 1, rest.indexOf(')')).trim();
    
    dispatch(setClientData({clientName: name}));
    dispatch(setClientData({clientContact: number}));
    fetchClientDetails(ID);
    setClientNameSuggestions([]);
  };

  const pdfGeneration = async (item) => {
    let AmountExclGST = Math.round(((((item.unit === "SCM" ? item.qty * item.width : item.qty) * item.unitPrice * ( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)) + parseInt(item.margin))));
    let AmountInclGST = Math.round(AmountExclGST * ((item.rateGST/100) + 1));
    // console.log(item.rateGST)
    const unitPrice = (AmountExclGST/item.qty).toFixed(2)
    return {
      adMedium: item.adMedium,
      adCategory: item.adCategory,
      edition: item.edition,
      position: item.position,
      qty: item.qty,
      campaignDuration: item.campaignDurationVisibility === 1 ? item.campaignDuration : 'NA',
      ratePerQty: formattedRupees(unitPrice),
      amountExclGst: formattedRupees(AmountExclGST),
      gst: item.rateGST + "%",
      amountInclGst: formattedRupees(AmountInclGST),
      leadDays: item.leadDay,
      // durationUnit: item.campaignDurationVisibility === 1 ? (item.leadDay.CampaignDurationUnit ? item.leadDay.CampaignDurationUnit : 'Day') : '',
      CampaignDurationUnit: item.campaignDurationVisibility === 1 ? item.CampaignDurationUnit : '',
      qtyUnit: item.unit ? item.unit : 'Unit',
      adType: item.adType,
      formattedDate: item.formattedDate,
      remarks: item.remarks,
      width: item.width,
      rateId: item.rateId,
    };
  };


  let isGeneratingPdf = false;

  const addQuoteToDB = async(item) => {
    let AmountExclGST = Math.round(((((item.unit === "SCM" ? item.qty * item.width : item.qty) * item.unitPrice * ( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)) + (item.margin - item.extraDiscount))));
    let AmountInclGST = Math.round(AmountExclGST * ((item.rateGST/100) + 1));
    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/AddItemToCartAndQuote.php/?JsonDBName=${companyName}&JsonEntryUser=${username}&JsonClientName=${clientName}&JsonClientContact=${clientContact}&JsonClientSource=${clientSource}&JsonClientGST=${clientGST}&JsonClientEmail=${clientEmail}&JsonLeadDays=${item.leadDay}&JsonRateName=${item.adMedium}&JsonAdType=${item.adCategory}&JsonAdCategory=${item.edition + (item.position ? (" : " + item.position) : "")}&JsonQuantity=${item.qty}&JsonWidth=1&JsonUnits=${item.unit ? item.unit : 'Unit '}&JsonRatePerUnit=${AmountExclGST / item.qty}&JsonAmountWithoutGST=${AmountExclGST}&JsonAmount=${AmountInclGST}&JsonGSTAmount=${AmountInclGST - AmountExclGST}&JsonGSTPercentage=${item.rateGST}&JsonRemarks=${item.remarks}&JsonCampaignDuration=${item.leadDay.CampaignDurationUnit === 'Day' ? item.campaignDuration : 1}&JsonMinPrice=${AmountExclGST / item.qty}&JsonSpotsPerDay=${item.leadDay.CampaignDurationUnit === 'Spot' ? item.campaignDuration : 1}&JsonSpotDuration=${item.leadDay.CampaignDurationUnit === 'Sec' ? item.campaignDuration : 0}&JsonDiscountAmount=${item.extraDiscount}&JsonMargin=${item.margin}&JsonVendor=${item.selectedVendor}`)
      const data = await response.json();
      if (!response.ok) {
        alert(`The following error occurred while inserting data: ${data}`);
      }
    } catch (error) {
      alert('An unexpected error occured while inserting Quote:', error);
      return;
    }
  }

  const getTnC = async() => {
    const response = await fetch(`https://orders.baleenmedia.com/API/Media/GetTnC.php/?JsonDBName=${companyName}`);
    const TnC = response.json();
    return TnC;
  }

  const handlePdfGeneration = async (e) => {
    e.preventDefault();
    if (isGeneratingPdf) {
      try{
        const promises = cartItems.map(item => addQuoteToDB(item));
        await Promise.all(promises);
        return; // Prevent further execution if PDF is already being generated
      } catch(error) {
        alert('An unexpected error occured while inserting Quote:', error);
        return;
      }
      
    }

    isGeneratingPdf = true; // Set flag to indicate PDF generation is in progress
    const quoteNumber = await fetchNextQuoteNumber(companyName);
    const TnC = await getTnC();
    let grandTotalAmount = calculateGrandTotal();
    grandTotalAmount = grandTotalAmount.replace('₹', '');
    if(clientName !== ""){
      try{
        const cart = await Promise.all(cartItems.map(item => pdfGeneration(item)));
        await generatePdf(cart, clientName, clientEmail, clientTitle, quoteNumber, TnC);
        const promises = cartItems.map(item => addQuoteToDB(item));
        await Promise.all(promises);
      //   setTimeout(() => {
      //   dispatch(resetCartItem());
      //   dispatch(resetQuotesData());
      //   dispatch(resetClientData());
      // },3000)
      } catch(error){
        alert('An unexpected error occured while inserting Quote:' + error);
        return;
      }
      
    } else{
      if(clientName === ""){
        setIsClientName(false)
      }else if(clientContact === ""){
        setIsClientContact(false)
      }
    }
  };
  

  function showCurrentPage(){
    let showPage = '' 
    if(currentPage === "checkout"){
      showPage = <CheckoutPage />
    } else{
      showPage = <AdDetailsPage />
    }
    return showPage;
  }
  
  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };
  
  const calculateGrandTotal = () => {
    let grandTotal = [];
    cartItems.map((item, index) => {
      const priceOfAd = (item.qty * item.unitPrice *( item.campaignDuration  ? (item.campaignDuration ? 1: item.campaignDuration / item.minimumCampaignDuration): 1)+ (item.margin - item.extraDiscount)) * ((item.rateGST/100) + 1)
      grandTotal.push(priceOfAd);
  })
  let grandTotalAmount = grandTotal.reduce((total, amount) => total + amount, 0);
  grandTotalAmount = `₹ ${formattedRupees(Math.round(grandTotalAmount))}`
  return grandTotalAmount;
  }


  const greater = ">>";

  

  return (
    <div className='bg-gray-100 w-full h-[100vh] overflow-hidden'>
      <div className={`text-black fixed top-0 left-0 right-0 bg-gray-100 sm:overflow-y-auto sm:h-[100vh] ${currentPage === 'checkout' ? 'h-[100vh]' : ''} ${currentPage === 'checkout' ? 'overflow-y-scroll' : 'overflow-hidden'}`}>
      <h1 className='text-2xl font-bold ml-3 text-start text-blue-500 pt-2'>Quote Sender</h1>
      <div className="border-2 ml-3 w-10 inline-block mb-6 border-blue-500"></div>
        <div className="flex flex-row items-center justify-between py-2 h-fit px-4 bg-gray-100 ">
        
       
        
          {/* Back Button */}
         { (currentPage !== "adDetails" && currentPage !== "") ?
         (<button className="mr-4 mt-2 hover:scale-110 text-blue-500 text-nowrap max-h-10 font-semibold hover:animate-pulse border-blue-500 border px-2 py-1 rounded-lg bg-white" onClick={() => {
              dispatch(goBack());
          }}>
            <FontAwesomeIcon icon={faArrowLeft} className=' text-md' /> Back
          </button>
         ) : 
         <button className={`mr-4 mt-2 ${rateId > 0 ? 'text-blue-500' : 'text-gray-500'} text-nowrap max-h-10 font-semibold ${rateId > 0 ?' border-blue-500' : 'border-gray-500'} border px-2 py-1 rounded-lg bg-white`} disabled = {!rateId} onClick={() => {
          dispatch(resetQuotesData());
          }}>
        <FontAwesomeIcon icon={faClose} className=' text-md' /> Clear
      </button>}
          {currentPage === "checkout" ?( 
            <></>
          ): (
          <div className='mt-2'>
            <div className='flex flex-row items-center'>
              <h2 className='font-semibold mb-1 text-gray-800 text-[15px] mx-2'>{adMedium}
              {adType !== "" && greater} {adType}
              {adCategory !== "" && greater} {adCategory} {edition !==  "" && greater} {edition} {position !== "" && greater} {position}
              {rateId !== 0 && greater} {rateId !== 0 && rateId}</h2>
            </div>
          </div>
          )}
          {/* Shopping Cart Button */}
          {currentPage === "checkout" ?(
            <div className='flex flex-row justify-center items-center'>
            <button
              className={cartItems.length > 0 ? 'Addtocartafter-button' : 'Addtocart-button'}
              disabled = {cartItems.length > 0 ? false : true}
              onClick={handlePdfGeneration}
            >
              Download Quote
            </button>
            <button className={`ml-2  ${cartItems.length > 0 ? 'Clearall-button':'Clearallafter-button'}`} disabled = {cartItems.length > 0 ? false : true} onClick={() => dispatch(resetCartItem())}>Clear All</button>
            </div>
          ):(
            // <button aria-label="cart" 
            // className="relative text-center shadow-sm max-h-10  bg-white mt-2 border border-blue-500 shadow-blue-500 rounded-full p-2"
            // onClick={() => dispatch(updateCurrentPage("checkout"))}>
              
            // </button>
            <div></div>
          )
          }
        </div>
        <br />
  
        {/* Form and Current Page Content */}
        <div className={`h-[100vh] bg-gray-100`}>
        <form className={`bg-white rounded-t-3xl shadow-2xl ${currentPage === 'checkout' ? 'pb-0' : 'pb-8'} ${currentPage === 'checkout' ? 'h-fit':'h-[100vh]'}  max-h-[100vh] overflow-x-hidden mx-2`}>
          {showCurrentPage()}
        </form>
        {currentPage === "checkout" && (
          <form className='bg-white rounded-t-3xl shadow-2xl pb-16 mt-4 h-fit  justify-center mx-2'>
          <h1 className='mb-4 font-semibold text-center text-blue-500 text-lg mt-4'>Client Details</h1>

          <table className='mb-6 ml-4'>
            <tr>
              <td className='py-1 text-blue-600 font-semibold'>Name</td>
              <td>:</td><td> <input placeholder="Ex: Tony" ref={clientNameRef} onFocus={() => setIsClientNameFocus(true)} onBlur={() => setTimeout(() => setIsClientNameFocus(false), 200)} className=' py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7 w-full' value = {clientName} onChange={handleSearchTermChange} ></input>
              {!isClientName && <label className='text-red-500'>Please enter client name</label>}
              {clientNameSuggestions.length > 0 && isClientNameFocus && (
                <ul className="absolute z-10 mt-1 w-auto bg-white border border-gray-200 rounded-md shadow-lg overflow-y-scroll max-h-48">
                {clientNameSuggestions.map((name, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className=" z-10  text-left px-2 py-1 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none ml-2"
                      onClick={handleClientNameSelection}
                      value={name}
                    >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              </td>
            </tr>
            <tr>
              <td className='py-1 text-blue-600 font-semibold'>Contact Number</td>
              <td>:</td><td>  <input placeholder="Ex: 0000000000" type="number" maxLength={10} className='w-full py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7' value={clientContact} onChange={(e) => {dispatch(setClientData({clientContact: e.target.value})); setIsClientContact(true)}}></input>
              {/* {!isClientContact && clientContact.length === 0 && <label className='text-red-500'>Please enter client contact</label>} */}
              </td>
            </tr>
            <tr>
              <td className='py-1 text-blue-600 font-semibold'>E-Mail</td>
              <td>:</td><td> <input type="email" placeholder="Ex: client@email.com" className='w-full py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7' value={clientEmail} onChange={(e) => dispatch(setClientData({clientEmail: e.target.value}))}></input></td>
            </tr>
            <tr>
              <td className='py-1 text-blue-600 font-semibold'>Source</td>
              <td>:</td><td> <select className='py-1 px-2 border-gray-500 shadow-md focus:border-blue-500 focus:drop-shadow-md border rounded-lg ml-2 h-7 w-full' value={clientSource} onChange={(e) => dispatch(setClientData({clientSource: e.target.value}))}>{bmsources.map((item, index) => (
                <option key={index}>{item}</option>
              ))}</select></td>
            </tr>
          </table>
          </form>
          
        )}
        </div>
      </div>
    </div>
    
  );
};

export default AdDetails;