'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import AdCategoryPage from './adCategory';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { generatePdf } from '../generatePDF/generatePDF';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [slabData, setSlabData] = useState([])
  const [qtySlab, setQtySlab] = useState()
  const [unitPrice, setUnitPrice] = useState('')
  // const [minimumUnit, setMinimumUnit] = useState(qtySlab)
  const [qty, setQty] = useState(qtySlab)
  const [selectedDayRange, setSelectedDayRange] = useState('');
  const [campaignDuration, setCampaignDuration] = useState(1);
  const [unit, setUnit] = useState('')
  

  const [showAdCategoryPage, setShowAdCategoryPage] = useState(false);
  const [marginPercentage, setMarginPercentage] = useState(15)
  const [extraDiscount, setExtraDiscount] = useState(0)
  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const [checkout, setCheckout] = useState(true);
  const [datas, setDatas] = useState([]);
  const [amt, setAmt] = useState();

  const clientName = Cookies.get('clientname');
  const clientNumber = Cookies.get('clientnumber');
  const clientEmail = Cookies.get('clientemail');
  const selectedSource = Cookies.get('selectedsource');
  const rateId = Cookies.get('rateId');
  const rateName = Cookies.get('ratename');
  const adType = Cookies.get('adtype');
  const adCategory = Cookies.get('adcategory');
  const typeOfAd = Cookies.get('typeofad');
  //const VendorName = Cookies.get('vendorname');
  const ratePerUnit = Cookies.get('rateperunit');
  const [margin, setMargin] = useState(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration) * 15) / 100).toFixed(2));
  const ValidityDate = Cookies.get('validitydate')
  const [ changing , setChanging ] = useState(false);
  //const minimumUnit = 15;
  // const defUnits = (rateName ==='Radio Ads')  ? 'spot(s)' : (rateName === 'Automobile') ? typeOfAd : Cookies.get('defunit');


  const parts = ValidityDate.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Months are zero-based in JavaScript
  const day = parseInt(parts[2]);

  // Create a new Date object with the parsed components
  const dateObject = new Date(year, month, day);

  // Format the date using the "MMM dd, yyyy" format
  const formattedDate = dateObject.toLocaleDateString('en-US', {
    month: 'short', // Three-letter month name
    day: 'numeric', // Day of the month
    year: 'numeric', // Four-digit year
  });

  const filteredData2 = slabData.filter(item => item.StartQty === qtySlab)

  // useEffect(() => {
  //   const multipliedAmount = (qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))
  //   //setMargin((margin/1).toFixed(2))
  //   //setMarginPercentage(((margin / (qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))) * 100).toFixed(2))
  // }, [])

  useEffect(() => {
    if (selectedDayRange === "") {
      setSelectedDayRange(dayRange[1]);
    }
    // setMargin(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration) * 15) / 100).toFixed(2))
    // if (margin === undefined){
    //   setMargin((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))*0.15);
    // }
  },
    [])

  useEffect(() => {
    fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}`)
      .then((response) => {
        // if (!response.ok) {
        //   throw new Error(HTTP error! Status: ${response.status});
        // }
        return response.json();
      })
      .then((data) => {
        setSlabData(data);
        const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty))
        const firstSelectedSlab = sortedData[0];
        setQtySlab(firstSelectedSlab.StartQty);
        setUnitPrice(firstSelectedSlab.UnitPrice);
      })
      //.then((data) => console.log)
      .catch((error) => console.error(error));
  }
    , [rateId])


  const handleQtySlabChange = () => {
    const qtySlabNumber = parseInt(qtySlab)
    // Find the corresponding slabData for the selected QtySlab
    const selectedSlab = sortedSlabData.filter(item => item.StartQty === qtySlabNumber);

    {!changing && setQty(qtySlab);}
    {changing && setChanging(false)}
    setMargin(((qtySlab * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration) * marginPercentage) / 100).toFixed(2));
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
  const [toastMessage, setToastMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
const handleSubmit = () => {
    if (qty === '' || campaignDuration === '' || margin === '' || extraDiscount === '') {
      setSeverity('warning');
      setToastMessage('Please fill all the Client Details!');
      setToast(true);
    }
    else if (qty < qtySlab) {
      setSeverity('warning');
      setToastMessage('Quantity should not be lesser than the slab!');
      setToast(true);
    }
    else {
      setCheckout(false);
    }
  }

  const handleMarginChange = (event) => {
    //const newValue = parseFloat(event.target.value);
    setMargin(event.target.value);
    setMarginPercentage(((event.target.value * 100) / (qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2))
  };

  const handleMarginPercentageChange = (event) => {
    //const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(event.target.value);
    setMargin(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration) * event.target.value) / 100).toFixed(2));
  };

  useEffect(() => {
    const username = Cookies.get('username');
    //console.log(data);
    if (!username) {
      routers.push('/login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php') //FetchQtySlab.php
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
      //fetchAdQtySlab()
     
    }
  }, []);
  
  const filteredData = datas
    .filter(item => item.adCategory === adCategory && item.adType === adType)
    .filter((value, index, self) =>
      self.findIndex(obj => obj.VendorName === value.VendorName) === index
    )
    .sort((a, b) => a.VendorName.localeCompare(b.VendorName));

  const newData =datas.filter(item => Number(item.rateId) === Number(rateId));
   const leadDay = newData[0];

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
    
const pdfGeneration = () => {
  const AmountExclGST = (((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount))).toFixed(2);
  const AmountInclGST = (((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount)) * (1.18)).toFixed(2);
  const PDFArray = [rateName, adType, adCategory, '', qty, unitPrice, AmountExclGST, '18%', AmountInclGST, leadDay.LeadDays]

  generatePdf(PDFArray)
}

  const greater = ">>"
  return (
    <div className=" mt-8 ">
      {showAdCategoryPage && (<AdCategoryPage />)}
      {(checkout === true && showAdCategoryPage === false) &&
        (
          <div className="mx-[8%]">
            {/* <button onClick={() => {Cookies.remove('adcategory');Cookies.remove('adMediumSelected'); setShowAdCategoryPage(true);}}>Back</button> */}
            <div className="mb-8 flex items-center">
              <button
                className="mr-8 hover:scale-110 hover:text-orange-900"
                onClick={() => {
                  Cookies.remove('adcategory');
                  Cookies.remove('adMediumSelected');
                  setShowAdCategoryPage(true);
                  Cookies.set('back1',true);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <h2 className="font-semibold text-wrap mb-1">
                {rateName} {greater} {typeOfAd} {greater} {adType} {greater} {adCategory.split('|').join(' | ').split(",").join(", ")}
              </h2>
            </div><div>
              <div className="mb-4">
                <p className="font-semibold text-sm">
                  * Price: Rs. {(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount))).toFixed(2)} (excl. GST) =
                  (Rs.{qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)}({qty} {unit} X Rs.{(unitPrice / 1).toFixed(2)} x {campaignDuration === 0 ? 1 : campaignDuration} {selectedDayRange}) + Rs.{margin} Margin - Rs.{(extraDiscount / 1).toFixed(2)} Discount)
                </p>
                <p className="font-bold text-sm">
                  * Price: Rs.{(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount)) * (1.18)).toFixed(2)} (incl. GST 18%)
                </p>
              </div>
              <div className="mb-8 overflow-y-auto h-[calc(100vh-300px)]">
                <div className="mb-4">
                  <label className="font-bold">Vendor</label>
                  <select
                    className="border w-full border-gray-300 bg-blue-300 text-black rounded-lg p-2"
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                  >
                    {filteredData.map((option, index) => (
                      <option className="rounded-lg" key={index} value={option.VendorName}>
                        {option.VendorName === '' && filteredData.length === 1
        ? 'No Vendors'
        : `Rs.${qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)} - 7 days - ${option.VendorName}`}
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
                     setQty(e.target.value)
                    }}
                  >
                    {sortedSlabData.map((opt, index) => (
                      <option className="rounded-lg" key={index} value={opt.StartQty}>
                        {opt.StartQty}+ {unit} Rs.{opt.UnitPrice} per {selectedDayRange}
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
                        setQty(e.target.value);
                        setMargin(((e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration) * marginPercentage) / 100).toFixed(2));
                        // setMarginPercentage(((margin * 100) / (e.target.value * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration))).toFixed(2));
                        setQtySlab(findMatchingQtySlab(e.target.value));
                        setChanging(true);
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                    <label className="text-center mt-2 ml-5">{unit}</label>
                  </div>
                  <p className="text-red-700">{qty < qtySlab ? 'Quantity should not be lesser than the slab' : ''}</p>
                </div>
                <div className="mb-4">
                  <label className="font-bold">Campaign Duration</label>
                  <div className="flex w-full">
                    <input
                      className="w-4/5 border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                      type="number"
                      placeholder="Ex: 3"
                      value={campaignDuration}
                      onChange={(e) => {
                        setCampaignDuration(e.target.value);
                        setMargin(((qtySlab * unitPrice * (e.target.value === 0 || e.target.value === '' ? 1 : e.target.value) * marginPercentage) / 100).toFixed(2));
                        // setMarginPercentage(((margin * 100) / (qty * unitPrice * (e.target.value === 0 ? 1 : e.target.value))).toFixed(2));
                      }}
                    />
                    <div className="relative">
                      <select
                        className="border border-gray-300 bg-blue-300 text-black rounded-lg p-2 ml-4"
                        value={selectedDayRange}
                        onChange={(e) => setSelectedDayRange(e.target.value)}
                      >
                        {dayRange.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-bold">Margin Amount(Rs)</label>
                  <input
                    className="w-full border border-gray-300 bg-blue-300 text-black p-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 4000"
                    value={margin}
                    onChange={handleMarginChange}
                  />
                  <p className="mt-1 text-sm">Margin Percentage: {marginPercentage}%</p>
                  <input
                    className="w-full"
                    type="range"
                    id="marginPercentage"
                    name="marginPercentage"
                    min="0"
                    max="100"
                    step="1"
                    value={marginPercentage}
                    onChange={handleMarginPercentageChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="font-bold">Extra Discount(Rs)</label>
                  <input
                    className="w-full border border-gray-300 bg-blue-300 text-black p-2 mb-4 rounded-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    type="number"
                    placeholder="Ex: 1000"
                    value={extraDiscount}
                    onChange={(e) => setExtraDiscount(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <button
                    className="bg-blue-500 hover:bg-purple-500 text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out"
                    onClick={() => handleSubmit()}
                  >
                    Checkout
                  </button>
                </div>
                <div className="flex flex-col justify-center items-center mt-4">
                  <p className="font-semibold text-red-500">
                    *Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays: ''} days from the date of payment received or the date of design approved, whichever is higher
                  </p>
                  <p className="font-bold">Quote Valid till {formattedDate}</p>
                </div>
              </div>
              <div className="bg-surface-card p-8 rounded-2xl mb-16">
                <Snackbar open={toast} autoHideDuration={6000} onClose={() => setToast(false)}>
                  <MuiAlert severity={severity} onClose={() => setToast(false)}>
                    {toastMessage}
                  </MuiAlert>
                </Snackbar>
              </div>
            </div>
          </div>
        )
      }
      {checkout === false && (
        <div className='mx-[8%]'>
          <div className="flex flex-row justify-between mt-8">
            <> <h1 className='text-2xl font-bold text-center mb-4'>Checkout</h1>
              <button
                className=" px-2 py-1 rounded text-center"
                onClick={() => {
                  //routers.push('../addenquiry');
                  setCheckout(true);
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
                <td>:</td><td>  {rateName}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Ad Type</td>
                <td>:</td><td>  {adType}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Edition</td>
                <td>:</td><td>  {adCategory}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Quantity</td>
                <td>:</td><td>  {qty} {unit}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Campaign Duration</td>
                <td>:</td><td>  {campaignDuration} {selectedDayRange}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Price</td>
                <td>:</td><td>  {(((qty * unitPrice * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount)) * (1.18)).toFixed(2)}</td>
              </tr>
            </table>
            
            <h1 className='mb-4 font-bold text-center'>Client Details</h1>
            {/* <span className='flex flex-row'><h1 className='mb-2 text-blue-600 font-semibold'>Client Name : </h1><div className=''>{clientName}</div></span>
            
            <span className='flex flex-row'>
            <h1 className='mb-2 text-blue-600 font-semibold'>Client Number : </h1><div className=''>{clientNumber}</div>
            </span>
            
            <span className='flex flex-row'>
            <h1 className='mb-2 text-blue-600 font-semibold'>Client E-Mail: </h1><div className=''>{clientEmail}</div>
            </span>
            
            <span className='flex flex-row'>
            <h1 className='mb-4 text-blue-600 font-semibold'>Source : </h1><div className=''>{selectedSource}</div>
            </span> */}

            <table className='mb-6'>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Client Name</td>
                <td>:</td><td>  {clientName}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Client Number</td>
                <td>:</td><td>  {clientNumber}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Client E-Mail</td>
                <td>:</td><td>  {clientEmail}</td>
              </tr>
              <tr>
                <td className='py-1 text-blue-600 font-semibold'>Source</td>
                <td>:</td><td>  {selectedSource}</td>
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
      )}
    </div>
  )

}
export default AdDetailsPage;