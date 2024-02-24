'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { useRouter } from 'next/navigation';
import IconButton from '@mui/material/IconButton';
import {Button} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline, SaveOutlined, DeleteOutline } from '@mui/icons-material';
import { generatePdf } from '../generatePDF/generatePDF';
import { TextField } from '@mui/material';
// import { Carousel } from 'primereact/carousel';
// import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
//const minimumUnit = Cookies.get('minimumunit');

const AdDetailsPage = () => {
  const [ratesData, setRatesData] = useState([]);
  const [checkout, setCheckout] = useState(true);
  const router = useRouter();
  const sampleSlabs = ['Slab1', 'Slab2', 'Slab3']
  const sampleUnits = [{label: 'Unit 1', Key: 'Unit 1'}, {label: 'Unit 2', Key: 'Unit 2'}, {label: 'Unit 3', Key: 'Unit 3'}, {label: 'Unit 4', Key: 'Unit 4'}]
  const [slabData, setSlabData] = useState([]);
  const [qtySlab, setQtySlab] = useState()
  const [isSlabAvailable, setIsSlabAvailable] = useState(true)
  const [selectedSlabData, setSelectedSlabData] = useState(null)
  const [unitPrice, setUnitPrice] = useState();
  const [rateId, setRateId] = useState(null);

  const [filters, setFilters] = useState({
    rateName: [],
    adType: [],
    adCategory: [],
    VendorName: []
  });

  const [selectedValues, setSelectedValues] = useState({
    rateName: null,
    adType: null,
    adCategory: null,
    VendorName: null
  });

  useEffect(() => {
    if(rateId !== null){
      const fetchData = async () => {
        try {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchQtySlab.php/?JsonRateId=${rateId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setSlabData(data);
          console.log(data)
          const sortedData = data.sort((a, b) => Number(a.StartQty) - Number(b.StartQty));
          const firstSelectedSlab = sortedData[0];
          setQtySlab(firstSelectedSlab.StartQty);
          setUnitPrice(firstSelectedSlab.UnitPrice);
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    }
  }, [rateId]);

  useEffect(() => {
     // Check if localStorage contains a username
     const username = Cookies.get('username');
     // If no username is found, redirect to the login page
     if (!username) {
       router.push('/login');
     } else{
      fetchRates();
    }
  }, []);

  const getDistinctValues = (key) => {
    const distinctValues = [...new Set(ratesData.map(item => item[key]))];
    return distinctValues.sort();
  };

  const transformQtySlabData = () => {
    return slabData.map(item => {
      return {
        value: item.StartQty,  // Using StartQty as the unique identifier
        label: `Per Unit: ${item.UnitPrice} for ${item.StartQty} ${item.Unit}`,
      };
    });
  };

  const qtySlabOptions = transformQtySlabData();

  // Function to get options based on the selected values
  const getOptions = (filterKey, selectedValues) => {
    const filteredData = ratesData.filter(item => {
      return Object.entries(selectedValues).every(([key, value]) =>
        key === filterKey || !value || item[key] === value.value
      );
    });

    const distinctValues = [...new Set(filteredData.map(item => item[filterKey]))];
    return distinctValues.sort().map(value => ({ value, label: value }));
  };

  // Function to handle dropdown selection
  const handleSelectChange = (selectedOption, filterKey) => {
    if (filterKey === 'rateName'){
      setSelectedValues({
        [filterKey]: selectedOption,
        adType: null,
        adCategory: null,
        VendorName: null
      })
    } else if(filterKey === 'adType'){
      setSelectedValues({
        ...selectedValues,
        [filterKey]: selectedOption,
        adCategory: null,
        VendorName: null
      })
    } else {
      // Update the selected values
    setSelectedValues({
      ...selectedValues,
      [filterKey]: selectedOption
    });
    }
    

    // Update the filters
    setFilters({
      ...filters,
      [filterKey]: selectedOption.value
    });

    // Add logic to fetch rateId after selecting Vendor
  if (filterKey === 'VendorName' && selectedOption) {
    const selectedRate = ratesData.find(item =>
      item.rateName === selectedValues.rateName.value &&
      item.adType === selectedValues.adType.value &&
      item.adCategory === selectedValues.adCategory.value &&
      item.VendorName === selectedOption.value
    );

    if (selectedRate) {
      setRateId(selectedRate.rateId);
    }
  }
  }

  const fetchRates = async () => {
    const storedETag = localStorage.getItem('ratesETag');
    const headers = {};
    
    if (storedETag) {
      headers['If-None-Match'] = storedETag;
    }
  
    try {
      const res = await fetch('https://www.orders.baleenmedia.com/API/Media/FetchRates.php', {
        headers,
      });
  
      if (res.status === 304) {
        // No changes since last request, use cached data
        const cachedRates = JSON.parse(localStorage.getItem('cachedRates'));
        setRatesData(cachedRates);
        return;
      }
  
      const newETag = res.headers.get('ETag');
      localStorage.setItem('ratesETag', newETag);
  
      const data = await res.json();
      setRatesData(data);
      // Cache the new rates data
      localStorage.setItem('cachedRates', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  };

  const pdfGeneration = async () => {
    const AmountExclGST = (((qty * unitPrice * campaignDuration) + (margin - extraDiscount)));
    const AmountInclGST = (((qty * unitPrice * campaignDuration) + (margin - extraDiscount)) * (1.18));
    const [firstPart, secondPart] = adCategory.split(':');
    const PDFArray = [rateName, adType, firstPart, secondPart, qty, campaignDuration , (formattedRupees(AmountExclGST / qty)), formattedRupees(AmountExclGST), '18%', formattedRupees(AmountInclGST), leadDay.LeadDays, leadDay.CampaignDurationUnit]
    const GSTPerc = 18

    generatePdf(PDFArray)

    try {
      const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/InsertCartQuoteData.php/?JsonUserName=${Cookies.get('username')}&
    JsonClientName=${clientName}&JsonClientEmail=${clientEmail}&JsonClientContact=${clientNumber}&JsonLeadDays=${leadDay.LeadDays}&JsonSource=${selectedSource}&JsonAdMedium=${rateName}&JsonAdType=${adType}&JsonAdCategory=${adCategory}&JsonQuantity=${qty}&JsonUnits=${unit}&JsonAmountwithoutGst=${AmountExclGST}&JsonAmount=${AmountInclGST}&JsonGSTAmount=${AmountInclGST - AmountExclGST}&JsonGST=${GSTPerc}&JsonRatePerUnit=${ratePerUnit}&JsonDiscountAmount=${extraDiscount}`)
      const data = await response.json();
      if (data === "Values Inserted Successfully!") {
        alert("Quote Downloaded")
      } else {
        alert(`The following error occurred while inserting data: ${data}`);

      }
    } catch (error) {
      console.error('Error updating rate:', error);
    }
  }

  const formattedRupees = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    const totalAmount = Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
    return totalAmount.toLocaleString('en-IN');
  };

  const formattedMargin = (number) => {
    const roundedNumber = (number / 1).toFixed(2);
    return Number((roundedNumber / 1).toFixed(roundedNumber % 1 === 0.0 ? 0 : roundedNumber % 1 === 0.1 ? 1 : 2));
  };

  const greater = ">>"
  return (
    <div className=" mt-8 justify-center">
      {checkout === true &&
        (
            <div>
                <div className="mb-4 flex flex-col items-center justify-center">

                  {/* Ad Medium of the rate */}
                  <div>
                    <label className=''>Ad Medium</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='AdMedium'
                      instanceId="AdMedium"
                      placeholder="Select Ad Medium"
                      value={selectedValues.rateName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'rateName')}
                      options={getDistinctValues('rateName').map(value => ({ value, label: value }))}
                    />
                  </div>

                  {/* Ad Type of the Rate  */}
                  <div>
                    <label className=''>Ad Type</label><br />
                    <Select
                      className='mb-8 text-black w-64 '
                      id='AdType'
                      instanceId="AdType"
                      placeholder="Select Ad Type"
                      value={selectedValues.adType}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'adType')}
                      options={getOptions('adType', selectedValues)}
                    />
                  </div>

                  {/* Ad Category of the rate  */}
                  <div>
                    <label className=''>Ad Category</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='AdCategory'
                      instanceId="AdCategory"
                      placeholder="Select Ad Category"
                      value={selectedValues.adCategory}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'adCategory')}
                      options={getOptions('adCategory', selectedValues)}
                    />
                  </div>

                  {/* Choosing the vendor of the rate  */}
                  <div>
                    <label className=''>Vendor</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='Vendor'
                      instanceId="Vendor"
                      placeholder="Select Vendor"
                      value={selectedValues.VendorName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'VendorName')}
                      options={getOptions('VendorName', selectedValues)}
                    />
                  </div>

                  {/* Qty Slab of the rate  */}
                  <div className='flex mb-4'>
                    <TextField id="qtySlab" label="Quantity Slab" variant="outlined" size='small' className='w-44' type='number' helperText="Ex: 3 | Means this rate is applicable for Units > 3"/>
                    <IconButton aria-label="Add" className='mb-10'>
                      <AddCircleOutline color='primary'/>
                    </IconButton>
                    <IconButton aria-label="Remove">
                      <RemoveCircleOutline color='secondary' className='mb-10'/>
                    </IconButton>
                  </div>

                  {/* Slab List Here  */}
                  {isSlabAvailable && (
                    <div>
                    <h2 className='mb-4 font-bold'>Available Slab Quantities</h2>
                    <ul className='mb-4'>
                      {sampleSlabs.map(data => (
                        <option key={data}>{data}</option>
                      ))}
                    </ul>
                    </div>
                  )}

                  {/* Units of the rate. Ex: Bus, Auto */}
                  <div>
                    <label className=''>Units</label><br />
                    <Select
                      className='mb-8 text-black w-64'
                      id='Units'
                      instanceId="Units"
                      placeholder="Select Units"
                      value={selectedValues.VendorName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'VendorName')}
                      options={sampleUnits}
                    />
                  </div>

                  {/* Campaign Duration Text with Units */}
                  <div className='flex'>
                    <TextField id="qtySlab" defaultValue={1} label="Campaign Duration" variant="outlined" size='small' className='w-36' type='number'/>
                    <Select
                      className='mb-8 text-black w-28 ml-2 mt-0.5'
                      id='CUnits'
                      instanceId="CUnits"
                      placeholder="Units"
                      value={selectedValues.VendorName}
                      onChange={(selectedOption) => handleSelectChange(selectedOption, 'VendorName')}
                      options={sampleUnits}
                    />
                  </div>

                  {/* Lead Days Text  */}
                  <div className='flex mb-4'>
                    <TextField id="leadDays" defaultValue={7} label="Lead Days" variant="outlined" size='small' className='w-48' type='number'/>
                    <p className='ml-4 mt-2'>Day (s)</p>
                  </div>

                  {/* Valid Till Text*/}
                  <div className='flex mb-4'>
                    <TextField id="validTill" defaultValue={7} label="Valid Till" variant="outlined" size='small' className='w-48' type='number'/>
                    <p className='ml-4 mt-2'>Day (s)</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mb-8">
                <Button variant="outlined" startIcon={<DeleteOutline />} className='border-red-400 text-red-400'>
                  Delete
                </Button>
                <Button variant="contained" endIcon={<SaveOutlined />} className='ml-4 bg-green-400'>
                  Save
                </Button>
                </div>
                <div className="flex flex-col justify-center items-center mt-4">
                  <p className="font-semibold text-red-500">
                    {/* *Lead time is {(leadDay && leadDay.LeadDays) ? leadDay.LeadDays : ''} days from the date of payment received or the date of design approved, whichever is higher */}
                  </p>
                  {/* <p className="font-bold">Quote Valid till {formattedDate}</p> */}
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
                  <td>:</td><td> Rs. {formattedRupees(((qty * unitPrice * campaignDuration) + (margin - extraDiscount)) * (1.18))} (incl. GST)</td>
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