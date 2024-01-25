'use client'
import { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

//const minimumUnit = Cookies.get('minimumunit');
const AdDetailsPage = () => {
    const [selectedVendor, setSelectedVendor] = useState("");
  const [slabData, setSlabData] = useState([])
  const [qtySlab, setQtySlab] = useState('')
  // const [minimumUnit, setMinimumUnit] = useState(qtySlab)
  const [qty, setQty] = useState(qtySlab)
  const [selectedDayRange, setSelectedDayRange] = useState('');
  const [campaignDuration, setCampaignDuration] = useState(0);
  const [unit, setUnit] = useState('')
  //const [datas, setDatas] = useState()

  const [marginPercentage, setMarginPercentage] = useState(15)
  const [extraDiscount, setExtraDiscount] = useState(0)
  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const units = ['Unit', 'Sec', 'Spot', 'Million Views', 'Minutes', 'SQFT'];
  const [checkout, setCheckout] = useState(true);
  const [datas, setDatas] = useState([]);

  const clientName = Cookies.get('clientname');
  const clientNumber = Cookies.get('clientnumber');
  const clientEmail = Cookies.get('clientemail');
  const selectedSource = Cookies.get('selectedsource');
  const rateId = Cookies.get('rateId');
  const rateName = Cookies.get('ratename');
  const adType = Cookies.get('adtype');
  const adCategory = Cookies.get('adcategory');
  //const VendorName = Cookies.get('vendorname');
  const ratePerUnit = Cookies.get('rateperunit');
  const [margin, setMargin] = useState((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration) * 15)/100);

  //const minimumUnit = 15;
  const defUnits = Cookies.get('defunit');

  useEffect(() => {
    const multipliedAmount = (qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration))
    //setMargin((margin/1).toFixed(2))
    //setMarginPercentage(((margin / (qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration))) * 100).toFixed(2))
  },[])
  useEffect(() => {
    if (selectedDayRange === "") {
      setSelectedDayRange(dayRange[0]);
    }
    if (unit === "") {
      setUnit(defUnits);
    }
    // if (margin === 0){
    //   setMargin((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration))*0.15);
    // }
  },
  [])

  useEffect(() =>{
    fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}`)
        .then((response) => {
          // if (!response.ok) {
          //   throw new Error(HTTP error! Status: ${response.status});
          // }
          return response.json();
        })
        .then((data) => setSlabData(data))
        //.then((data) => console.log)
        .catch((error) => console.error(error));
  }
  ,[rateId])

  const handleMarginChange = (event) => {
    //const newValue = parseFloat(event.target.value);
    setMargin(event.target.value);
    setMarginPercentage(((event.target.value * 100) / (qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration))))
  };

  const handleMarginPercentageChange = (event) => {
    //const newPercentage = parseFloat(event.target.value);
    setMarginPercentage(event.target.value);
    setMargin((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration) * event.target.value)/100);
  };

  const fetchAdQtySlab = () => {
    fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRatesId=${rateId}`)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error))
  }

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
  .sort((a, b) => a.VendorName.localeCompare(b.VendorName))
  ;

  const filteredData2 = slabData
  .filter(item => item.StartQty === qtySlab)

  const greater = ">"
  return (
    <div className=" mt-8 mx-[8%]">
      {checkout === true &&
        (
          <div className='mx-[8%]'>
            <label className="text-center mb-1">{rateName} - {adType} - {adCategory}</label><br/>
              {/* <label className="mt-1 text-sm mb-1">Vendor Name: {VendorName}</label>
              <label className="mt-1 text-sm mb-1">Rate Per Unit: Rs. {(ratePerUnit / 1).toFixed(2)}</label> */}
              <label className="mt-1 font-semibold mb-4">Amount(Rs): {((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration)) / 1).toFixed(2)} = ({qty} {defUnits} x {campaignDuration === 0 ? 1 : campaignDuration} {selectedDayRange})</label><br/>
            <label className="font-semibold">Price(Rs): {(((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount))).toFixed(2)} (excl. GST) = (Amount + {(margin / 1).toFixed(2)} Margin Amount - Rs. {(extraDiscount / 1).toFixed(2)} Discount Amount) </label><br/>
            <label className="font-bold">Price(Rs): {(((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount)) * (1.18)).toFixed(2)} (incl. GST) </label>
            <br/>
            <br></br>
            <label className="font-bold">Vendor</label>
            
            <select
                  className="border w-full border-gray-300 rounded-lg mb-4 p-2"
                 
                  value={selectedVendor}
                  onChange={e => setSelectedVendor(e.target.value)}
                >
                  {filteredData.map((option, index) => (
                    <option className='rounded-lg' key={index} value={option.VendorName}>
                     Rs.{(filteredData2.UnitPrice)} - 7 days - {option.VendorName}
                    </option>
                  ))}
                </select>
                <br/>
            <label className="font-bold">Quantity Slab ({greater})</label>
            <select
                  className="border w-full border-gray-300 rounded-lg mb-4 p-2"
                 
                  value={qtySlab}
                  onChange={e => {setQtySlab(e.target.value)
                  setQty(e.target.value)}}
                >
                  {slabData.map((option, index) => (
                    <option className='rounded-lg' key={index} value={option.StartQty}>
                     {option.StartQty}
                    </option>
                  ))}
                </select>
            {/*qty<minimumUnit ? 'Quantity is lesser than minimum' : ''*/}

            <label className="font-bold">Quantity </label>
            <div className="flex w-full">
              <input
                className="w-full border border-gray-300 p-2 rounded-lg mb-2 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                type="number"
                placeholder="Ex: 15"
                defaultValue={qtySlab}
                value={qty}
                //value={minimumUnit > qty ? minimumUnit : qty}
                onChange={e => { setQty(e.target.value) }}
                onFocus={(e) => e.target.select()}
              />

              <div className="relative">
                {/* <select
                  className="border-l border-gray-300 rounded-r-lg p-2"
                  defaultValue={defUnits}
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  {units.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select> */}
                <label className='border-1'>{defUnits}</label>
              </div>
            </div>
            <label className='text-red-300'>{qty < qtySlab ? 'Quantity is lesser than minimum' : ''}</label>
            <br />
            <label className="font-bold mt-12 mb-4">Campaign Duration</label>
            <div className="flex w-full mb-4">
              <input
                className="w-full border border-gray-300 p-2 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                type="number"
                placeholder="Ex: 3"
                value={campaignDuration}
                onChange={e => (setCampaignDuration(e.target.value))}
              />
              <div className="relative">
                <select
                  className="border-l border-gray-300 rounded-r-lg p-2"
                  value={selectedDayRange}
                  onChange={e => setSelectedDayRange(e.target.value)}
                >
                  {dayRange.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="font-bold">Margin Amount(Rs)</label>
            <input className='w-full border border-gray-300 p-2 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
              type='number'
              placeholder='Ex: 4000'
              value={margin}
              onChange={handleMarginChange}
              
            />
            <label className="mt-1 text-sm mb-4">Margin Percentage: {marginPercentage}%</label>
            <input className='w-full'
        type="range"
        id="marginPercentage"
        name="marginPercentage"
        min="0"
        max="100"
        step="1"
        value={marginPercentage}
        onChange={handleMarginPercentageChange}
      />
            <br></br>
            <br></br>
            <label className="font-bold">Extra Discount(Rs)</label>
            <input className='w-full border border-gray-300 p-2 mb-4 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
              type='number'
              placeholder='Ex: 1000'
              value={extraDiscount}
              onChange={e => setExtraDiscount(e.target.value)}
            />
            
            
            <br /><div className='flex flex-col items-center justify-center'>
              <button className=' bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full transition-all duration-300 ease-in-out text-white'
                onClick={() => setCheckout(false)}
              >
                Checkout
              </button>
            </div>
          </div>)
      }
      {checkout === false && (
        <div>
          <div className="flex flex-row justify-between mt-8">
            <> <h1 className='text-2xl font-bold text-center mb-4'>Checkout</h1>
              <button
                className="text-black px-2 py-1 rounded text-center"
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
          <div className='lg:mx-[40%]'>
            <h1 className='mb-4 font-semibold'>AD Details</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Ad Medium : {rateName}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Ad Type : {adType}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Ad Category : {adCategory}</h1>
            {/* <h1 className='mb-2 text-red-400 font-semibold'>Vendor Name : {VendorName}</h1> */}
            {/* <h1 className='mb-2 text-red-400 font-semibold'>Quantity Slab : {qtySlab} Units</h1> */}
            <h1 className='mb-2 text-red-400 font-semibold'>Quantity : {qty} {defUnits}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Campaign Duration : {campaignDuration} {selectedDayRange}</h1>
            {/* <h1 className='mb-2 text-red-400 font-semibold'>Margin Amount : {(margin / 1).toFixed(2)}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Margin Percentage : {marginPercentage}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Extra Discount : {(extraDiscount / 1).toFixed(2)}</h1> */}
            <h1 className='mb-14 text-red-400 font-semibold'>Price : {(((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration)) + (margin - extraDiscount)) * (1.18)).toFixed(2)}</h1>


            <h1 className='mb-4 font-semibold'>Client Details</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Client Name : {clientName}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Client Number : {clientNumber}</h1>
            <h1 className='mb-2 text-red-400 font-semibold'>Client E-Mail: {clientEmail}</h1>
            <h1 className='mb-4 text-red-400 font-semibold'>Source : {selectedSource}</h1>

          </div>
          <div className='flex flex-col justify-center items-center'>

            <button
              className="bg-green-500 text-white px-4 py-2 mb-4 rounded-full transition-all duration-300 ease-in-out hover:bg-green-600"
            >
              Send Quote
            </button>
            </div>
        </div>
      )}
      <div className='flex flex-col justify-center items-center'>
      <p className='font-semibold text-red-500'>*Lead time is 7 days from the date of payment received or the date of design approved whichever
              is higher
            </p>
            <p className='font-bold'>Quote Valid till 13/01/2024</p></div>
    </div>
  )
}
export default AdDetailsPage;