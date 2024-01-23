'use client'
import { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdTypePage from './adType';

const AdMediumPage = () => {
  const [selectedAdMedium, setSelectedAdMedium] = useState('');
  const [datas, setDatas] = useState([]);
  const [type, setType] = useState(false);
  const routers = useRouter();

  // const handleOptionChange = (option) => {
  //   //setSelectedOption(option);
  //   setSelectedOption((prevSelectedOption) => 
  //   prevSelectedOption === option ? null : option
  // );
  // };

  const datasOptions = datas
    .filter((value, index, self) =>
      self.findIndex(obj => obj.rateName === value.rateName) === index
    )
    .sort((a, b) => a.rateName.localeCompare(b.rateName));
  //   .map((option) => ({
  //    // if(option.rateName === 'Automobile'){
  //     ...option,
  //     icon: `https://t3.ftcdn.net/jpg/01/71/13/24/360_F_171132449_uK0OO5XHrjjaqx5JUbJOIoCC3GZP84Mt.jpg`
  //  // }
  //   }));

  const icons = (iconValue) => {
    if (iconValue === 'Automobile') {
      return (<Image src="/images/school-bus.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Newspaper') {
      return (<Image src="/images/newspaper.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Print Services') {
      return (<Image src="/images/printer.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Production') {
      return (<Image src="/images/smart-tv.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Radio Ads') {
      return (<Image src="/images/radio.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Road Side') {
      return (<Image src="/images/road-map.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Screen Branding') {
      return (<Image src="/images/branding.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'Test') {
      return (<Image src="/images/test.png" alt="car Icon" width={60} height={60} />);
    } else if (iconValue === 'TV') {
      return (<Image src="/images/tv-monitor.png" alt="car Icon" width={60} height={60} />);
    }
  }

  useEffect(() => {
    const username = Cookies.get('username');

    if(selectedAdMedium !== ''){
      setType((type) => Cookies.get('typ'))
      }

    if (!username) {
      routers.push('/login');
    } else {
      fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php')
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, [routers]);

  return (
    <div>
      {type && (<AdTypePage data={selectedAdMedium} />)}
      {!type && (
        <div>
          <div className="flex flex-row justify-between mx-[8%] mt-8">

            <> <h1 className='text-2xl font-bold text-center  mb-4'>Select AD Medium</h1>
              <button
                className="px-2 py-1 rounded text-center"
                onClick={() => {
                  routers.push('../addenquiry')
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
          <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1>

          <button className='mx-[8%] mb-6 hover:scale-110 hover:text-orange-900' onClick={() => routers.push('../addenquiry')
    }> <FontAwesomeIcon icon={faArrowLeft} /> </button>
          <ul className="mx-[8%] mb-8 justify-stretch grid gap-1 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
            {datasOptions.map((option) => (<>
              { option.rateName !== 'Newspaper' && (
              <label
                key={option.rateName}
                className={`relative flex flex-col items-center justify-center px-[-10] hover:text-white w-full h-64 border cursor-pointer transition duration-300 rounded-lg  ${selectedAdMedium === option ? 'border-lime-500 bg-stone-100' : 'border-gray-300 bg-sky-400 hover:bg-violet-800'
                  }`}
                //    htmlFor={`option-${option.id}`}
                onClick={() => {
                  setSelectedAdMedium(option.rateName);
                  setType(true);
                }}
              >
                <div className="text-lg font-bold mb-2 flex items-center justify-center">{option.rateName}</div>
                <div className='mb-2 flex items-center justify-center'>{icons(option.rateName)}</div>
              </label>)}</>
            ))
            }
          </ul>
        </div>
      )}
      </div>
  );
};

const AdDetailsPage = () => {
  const [qtySlab, setQtySlab] = useState('')
  const [qty, setQty] = useState(1)
  const [selectedDayRange, setSelectedDayRange] = useState('');
  const [campaignDuration, setCampaignDuration] = useState(0);
  const [unit, setUnit] = useState('')
  const [margin, setMargin] = useState(0);
  const [marginPercentage, setMarginPercentage] = useState(0)
  const [extraDiscount, setExtraDiscount] = useState(0)
  const dayRange = ['Month(s)', 'Day(s)', 'Week(s)'];
  const units = ['Unit', 'Line', 'SCM', 'Sec', 'Spot', 'Million Views', 'Minutes', 'SQFT'];
  const [checkout, setCheckout] = useState(true);

  const clientName = Cookies.get('clientname');
  const clientNumber = Cookies.get('clientnumber');
  const clientEmail = Cookies.get('clientemail');
  const selectedSource = Cookies.get('selectedsource');

  const rateName =Cookies.get('ratename');
  const adType =Cookies.get('adtype');
  const adCategory =Cookies.get('adcategory');
  const VendorName =Cookies.get('vendorname');
  const ratePerUnit = Cookies.get('rateperunit')

  useEffect(() => setMarginPercentage((margin/qty)*100))

  const greater = ">"
  return (
    <div className=" mt-8 mx-[8%]">
      {checkout === true &&
        (
          <div className='mx-[8%]'>
            {/* <label className="font-bold">Quantity Slab ({greater})</label>
            <input
              className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
              type="number"
              placeholder="Ex: 1 (meaning quantity > 1)"
              value={qtySlab}
              onChange={e => setQtySlab(e.target.value)}
            /> */}
            
            <label className="font-bold">Quantity</label>
            <div className="flex w-full mb-4">
              <input
                className="w-full border border-gray-300 p-2 rounded-lg mb-4 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                type="number"
                placeholder="Ex: 15"
                value={qty}
                onChange={e => setQty(e.target.value)}
              />
              <div className="relative">
                <select
                  className="border-l border-gray-300 rounded-r-lg p-2"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  {units.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="font-bold">Campaign Duration</label>
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
              onChange={e => (setMargin(e.target.value))
              }
            />
            <label className="mt-1 text-sm mb-4">Margin Percentage: {marginPercentage}%</label>

            <br></br>
            <br></br>
            <label className="font-bold">Extra Discount(Rs)</label>
            <input className='w-full border border-gray-300 p-2 mb-4 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200'
              type='number'
              placeholder='Ex: 1000'
              value={extraDiscount}
              onChange={e => setExtraDiscount(e.target.value)}
            />
             <label className="font-bold">Price(Rs): {((qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration))+(margin - extraDiscount))*(1.18)} </label>
            <label className="mt-1 text-sm mb-4">({qty} x {ratePerUnit} x {campaignDuration === 0 ? 1 : campaignDuration} = {qty * ratePerUnit * (campaignDuration === 0 ? 1 : campaignDuration)} + Rs. {margin} Margin Amount - Rs. {extraDiscount} Discount Amount + 18% GST = Receivable (incl. GST))</label>
            
            <br /><br /><div className='flex flex-col items-center justify-center'>
            <button className=' bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full transition-all duration-300 ease-in-out text-white'
            onClick={() => setCheckout(false)}
           >
Checkout
            </button>
            <label className="text-sm mb-4">Ad Medium: {rateName}</label>
            <label className="mt-1 text-sm mb-4">Ad Type: {adType}</label>
            <label className="mt-1 text-sm mb-4">Ad Category: {adCategory}</label>
            <label className="mt-1 text-sm mb-4">Vendor Name: {VendorName}</label>
            <label className="font-bold mr-4">Rate Per Unit:</label>
            <label className="mt-1 text-sm mb-4">Rs. {ratePerUnit}</label>
            <br></br>
            <br></br>
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
          <h1 className='mb-2 text-red-400 font-semibold'>Vendor Name : {VendorName}</h1>
          {/* <h1 className='mb-2 text-red-400 font-semibold'>Quantity Slab : {qtySlab} Units</h1> */}
          <h1 className='mb-2 text-red-400 font-semibold'>Quantity : {qty} {units[1]}</h1>
          <h1 className='mb-2 text-red-400 font-semibold'>Campaign Duration : {campaignDuration} {selectedDayRange}</h1>
          <h1 className='mb-2 text-red-400 font-semibold'>Margin Amount : {margin}</h1>
          <h1 className='mb-2 text-red-400 font-semibold'>Margin Percentage : {marginPercentage}</h1>
          <h1 className='mb-2 text-red-400 font-semibold'>Extra Discount : {extraDiscount}</h1>
          <h1 className='mb-14 text-red-400 font-semibold'>Price : {((qty * ratePerUnit * campaignDuration === 0 ? 1 : campaignDuration)+(margin - extraDiscount))*(1.18)}</h1>


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
            <p className='font-semibold text-red-500'>*Lead time is 7 days from the date of payment received or the date of design approved whichever
            is higher
          </p>
          <p className='font-bold'>Quote Valid till 13/01/2024</p></div>
         </div>
      )}
    </div>
  )
}

const AdDetails = () => {
  const [adDetailsSelected, setAdDetailsSelected] = useState(false);

  useEffect(() => {
    setAdDetailsSelected(Cookies.get('adMediumSelected'))

  }, [])

  return (
    <div>
      {adDetailsSelected ? <AdDetailsPage/> : <AdMediumPage />}
    </div>
  )
}

export default AdDetails;
