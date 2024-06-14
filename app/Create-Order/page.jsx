'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/store';
import IconButton from '@mui/material/IconButton';
import { RemoveCircleOutline } from '@mui/icons-material';


const CreateOrder = () => {
    const loggedInUser = useAppSelector(state => state.authSlice.userName);
    const [clientName, setClientName] = useState("");
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState("");
    const [maxOrderNumber, setMaxOrderNumber] = useState("");
    const [marginAmount, setMarginAmount] = useState("");
    const [marginPercentage, setMarginPercentage] = useState("");
    const [releaseDates, setReleaseDates] = useState([]);
    const [remarks, setRemarks] = useState("");
    const [elementsToHide, setElementsToHide] = useState([])
    const [clientEmail, setClientEmail] = useState("");
    const [clientSource, setClientSource] = useState("")
    const [receivable, setReceivable] = useState("");
    const [clientAge, setClientAge] = useState('');
    const [address, setAddress] = useState('');
    const [DOB, setDOB] = useState('');
    const [consultantName, setConsultantName] = useState('');
    const [consultantNumber, setConsultantNumber] = useState('');
    const [clientContactPerson, setClientContactPerson] = useState("");
    const [clientGST, setClientGST] = useState("");
    const [clientPAN, setClientPAN] = useState("");

    const router = useRouter();
    const selectedValues = useAppSelector(state => state.rateSlice.selectedValues);
    const rateId = useAppSelector(state => state.rateSlice.rateId);
    const selectedUnit = useAppSelector(state => state.rateSlice.selectedUnit); 
    const slabData = useAppSelector(state => state.rateSlice.slabData); 
    const rateGST = useAppSelector(state => state.rateSlice.rateGST);
    const startQty = useAppSelector(state => state.rateSlice.startQty);

    const [qty, setQty] = useState(startQty);
    const [unitPrice, setUnitPrice] = useState(0);
    // const receivable = (((qty * unitPrice * (campaignDuration / minimumCampaignDuration)) + (margin - extraDiscount)) * (1.18));
    
    useEffect(() => {
      fetchMaxOrderNumber();
      elementsToHideList();
      // calculateReceivable();
    },[])

    const findUnitPrice = () => {
      // Sort slabData by startQty in descending order
      const sortedSlabData = [...slabData].sort((a, b) => b.StartQty - a.StartQty);
      // Find the appropriate slab
      const slab = sortedSlabData.find((slab) => qty >= slab.StartQty);
      return slab ? slab.UnitPrice : 0;
    };

    useEffect(() => {
      const newUnitPrice = findUnitPrice();
      setUnitPrice(newUnitPrice);
    }, [qty])
    

    const handleSearchTermChange = (event) => {
        const newName = event.target.value
        fetch(`https://orders.baleenmedia.com/API/Media/SuggestingClientNames.php/get?suggestion=${newName}&JsonDBName=${companyName}`)
          .then((response) => response.json())
          .then((data) => setClientNameSuggestions(data));
        setClientName(newName);
      };

      const handleClientNameSelection = (event) => {
        const input = event.target.value;
        const name = input.substring(0, input.indexOf('(')).trim();
        const number = input.substring(input.indexOf('(') + 1, input.indexOf(')')).trim();
    
        setClientName(name);
        setClientNumber(number);
        fetchClientDetails(name, number);
        setClientNameSuggestions([]);
      };

      const fetchClientDetails = (clientName, clientNumber) => {
        axios
          .get(`https://orders.baleenmedia.com/API/Media/FetchClientDetails.php?ClientName=${clientName}&ClientContact=${clientNumber}&JsonDBName=${companyName}`)
          .then((response) => {
            const data = response.data;
            if (data && data.length > 0) {
              const clientDetails = data[0];
              setClientID(clientDetails.id);
    
              //MP-69-New Record are not fetching in GS
              setDOB(clientDetails.DOB);
              setClientEmail(clientDetails.email);
              setClientSource(clientDetails.source);
              //setClientAge(clientDetails.Age || "");
              setAddress(clientDetails.address || "");
              setTitle(clientDetails.gender || "");
              setSelectedOption(clientDetails.gender || "");
              setConsultantName(clientDetails.consname || "");
              setConsultantNumber(clientDetails.consnumber || "");
              // setClientPAN(clientDetails.PAN || "");
              setClientGST(clientDetails.GST || "");
              setClientContactPerson(clientDetails.ClientContactPerson);
              
              const age = calculateAge(clientDetails.DOB);
              setClientAge(age);
            if (clientDetails.GST && clientDetails.GST.length >= 15 && (!clientDetails.ClientPAN || clientDetails.ClientPAN === "")) {
              const pan = clientDetails.GST.slice(2, 12); // Correctly slice GST to get PAN
              setClientPAN(pan);
            } else {
              setClientPAN(clientDetails.ClientPAN);
            }
          
            } else {
              console.warn("No client details found for the given name and contact number.");
            }
          })
          .catch((error) => {
            console.error("Error fetching client details:", error);
          });
      };

      const createNewOrder = async(event) => {
        event.preventDefault()
        var receivable = (unitPrice * qty)
        var payable = unitPrice * qty
        var orderOwner = companyName === 'Baleen Media' ? clientSource === '6.Own' ? loggedInUser : 'leenah_cse': loggedInUser;  
        alert(qty + orderOwner + receivable + payable)
        
      //   try {
      //       const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateNewOrder.php/?JsonUserName=${username}&JsonUserName=${loggedInUser}&JsonOrderNumber=${maxOrderNumber}&JsonRateId=${rateId}&JsonClientName=${clientName}&JsonClientContact=${clientNumber}&JsonClientSource=${clientSource}&JsonOwner=${orderOwner}&JsonCSE=${username}&JsonReceivable=${receivable}&JsonPayable=${payable}&JsonRatePerUnit=${unitPrice}&JsonConsultantName=${consultantName}&JsonMarginAmount=${marginAmount}&JsonRateName=${selectedValues.rateName.value}&JsonVendorName=${selectedValues.vendorName.value}&JsonCategory=${selectedValues.Location.value + " : " + selectedValues.Package.value}&JsonType=${selectedValues.adType.value}&JsonHeight=${qty}&JsonWidth=1&JsonLocation=${selectedValues.Location.value}&JsonPackage=${selectedValues.Package.value}&JsonGST=${rateGST}&JsonClientGST=${clientGST}&JsonClientPAN=${clientPAN}&JsonClientAddress=${address}&JsonBookedStatus=Booked&JsonUnits=${selectedUnit.value}&JsonMinPrice=${unitPrice}&JsonRemarks=${remarks}&JsonContactPerson=${clientContactPerson}JsonReleaseDates=${releaseDates}&JsonDBName=${companyName}`)
      //       const data = await response.json();
      //       if (data === "Values Inserted Successfully!") {
      //           window.alert('Work Order #'+ maxOrderNumber +' Created Successfully!')
      //           router.push('/FinanceEntry');
      //         //setMessage(data.message);
      //       } else {
      //         alert(`The following error occurred while inserting data: ${data}`);
      //       }
      //     } catch (error) {
      //       console.error('Error updating rate:', error);
      //     }
       }

      const fetchMaxOrderNumber = async () => {
        try {
          const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/FetchMaxOrderNumber.php/?JsonDBName=${companyName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setMaxOrderNumber(data);
          
        } catch (error) {
          console.error(error);
        }
      };

      const elementsToHideList = () => {
        try{
          fetch(`https://orders.baleenmedia.com/API/Media/FetchNotVisibleElementName.php/get?JsonDBName=${companyName}`)
            .then((response) => response.json())
            .then((data) => setElementsToHide(data));
        } catch(error){
          console.error("Error showing element names: " + error)
        }
      }


      useEffect(() => {
        //searching elements to Hide from database
    
        elementsToHide.forEach((name) => {
          const elements = document.getElementsByName(name);
          elements.forEach((element) => {
            element.style.display = 'none'; // Hide the element
          });
        });
      }, [elementsToHide])

  // Function to calculate receivable amount
  const calculateReceivable = () => {
    const amountInclGST = ((qty * unitPrice) + marginAmount) + ((qty * unitPrice + marginAmount) * (rateGST.value / 100));
    setReceivable(amountInclGST);
  };

  const handleMarginPercentageChange = (e) => {
    const newMarginPercent = parseFloat(e.target.value) || 0;
    setMarginPercentage(newMarginPercent);

    // Assuming you have a total amount to calculate percentage against
    const newMarginAmount = (newMarginPercent / 100) * unitPrice;
    setMarginAmount(newMarginAmount.toFixed(2)); // Adjust toFixed for precision as needed
    calculateReceivable(); // Recalculate receivable with new margin
  };
  
  const handleMarginAmountChange = (e) => {
    const newMarginAmount = parseFloat(e.target.value) || 0;
    setMarginAmount(newMarginAmount);

    // Assuming you have a total amount to calculate percentage against
    const newMarginPercentage = (newMarginAmount / (unitPrice)) * 100;
    setMarginPercentage(newMarginPercentage.toFixed(2)); // Adjust toFixed for precision as needed
  };
  

    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
            <form className="px-7 h-screen grid justify-center items-center" onSubmit={createNewOrder}>
                <div className="grid gap-6" id="form">
                    <h1 className="font-bold text-3xl text-center mb-4">Order Generation</h1>
                    <div>
                    <label className="block text-gray-700 font-semibold mb-2">Order Number</label>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Client Name'    
                        required 
                        value={clientName}
                        onChange={handleSearchTermChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                            e.preventDefault();
                            // Find the next input field and focus on it
                            const inputs = document.querySelectorAll('input, select, textarea');
                            const index = Array.from(inputs).findIndex(input => input === e.target);
                            if (index !== -1 && index < inputs.length - 1) {
                                inputs[index + 1].focus();
                            }
                            }
                        }}
                    />
                    {(clientNameSuggestions.length > 0 && clientName !== '') && (
                        <ul className="list-none">
                            {clientNameSuggestions.map((name, index) => (
                            <li key={index} className="text-black text-left pl-3 pt-1 pb-1 border w-full bg-[#9ae5c2] hover:cursor-pointer transition duration-300 rounded-md">
                                <button
                                type="button"
                                className="text-black"
                                onClick={handleClientNameSelection}
                                value={name}
                                >
                                {name}
                                </button>
                            </li>
                            ))}
                        </ul>
                        )}
 </div>   
                        <ul className="list-none">
                            <li className="p-2 text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition rounded-md
                            duration-300">
                                <option className='font-bold '>Short Summary</option>
                                <option>Rate Card Name: {selectedValues.rateName.value}</option>
                                <option>Type: {selectedValues.adType.value}</option>
                                <option>Unit Price: Rs. {unitPrice} per {selectedUnit.value}</option>
                            </li>
                        </ul>
                        
                    {/* <label className='text-black hover:cursor-pointer' onClick={() => router.push('/')}>New Client? Click Here</label>  */}
                    <label className='text-black hover:cursor-pointer'>New Client? <span 
                      className='underline text-green-500 hover:text-green-600' 
                      onClick={() => router.push('/')}
                      >
                    Click Here
                   </span>
                  </label>
                   {/* <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Client Number'  
                        required 
                        value={clientNumber}
                        onChange={(e) => setClientNumber(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            // Find the next input field and focus on it
                            const inputs = document.querySelectorAll('input, select, textarea');
                            const index = Array.from(inputs).findIndex(input => input === e.target);
                            if (index !== -1 && index < inputs.length - 1) {
                            inputs[index + 1].focus();
                            }
                        }
                        }}
                    />  */}
                    <div class="w-full flex gap-3 ">
                    <div name="OrderMarginAmount">
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderMarginAmount">Margin Amount</label>
                        <input className="p-3 capitalize shadow-2xl glass w-52 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin Amount" 
                            name="MarginText" 
                            required
                            value={marginAmount || ''}
                            onChange={handleMarginAmountChange }
                            onFocus={e => e.target.select()}
                        />
                        </div>
                        <div name="OrderMarginPercentage">
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderMarginPercentage">Margin %</label>
                        <input className="p-3 capitalize shadow-2xl glass w-28 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin %" 
                            name="MarginText" 
                            value={marginPercentage || ''}
                            required
                            onChange={handleMarginPercentageChange}
                            onFocus={e => e.target.select()}
                        />
                        </div>
                    </div>
                    <div id="25" name='OrderQuantityText'>
                    <label className="block mb-2 text-gray-700 font-semibold">Quantity Slab</label>
                      <input 
                        required
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        type='number' 
                        defaultValue={qty} 
                        //onWheel={ event => event.currentTarget.blur() } 
                        onChange={e => {setQty(e.target.value)}}  
                        onFocus={(e) => {e.target.select()}}/>
                        </div>
                    <div>
                    <label className="block text-gray-700 font-semibold mb-2">Remarks</label>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Remarks'    
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                    />
                    </div>
                    <div name="OrderReleaseDate">
                    <label className="block text-gray-700 font-semibold mb-2" name="OrderReleaseDate">Release Date</label>
                    <input 
                        type='date' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        value={new Date()}
                        onChange={e => setReleaseDates([...releaseDates, e.target.value])}  
                      />
                    </div>
                    <div className='text-center justify-start mt-4'>
                    {releaseDates.length > 0 ? <h2 className='mb-4 font-bold'>Release-Dates</h2> : <></>}
                    <ul className='mb-4 mr-4'>
                    {releaseDates.map((data, index) => (
                      <div key={index} className='flex'>
                        <option key={data} className="mt-1.5" 
                          >
                            {data}
                          </option>
                          <IconButton aria-label="Remove" className='align-top' onClick={() => removeQtySlab(data.StartQty, index)}>
                          <RemoveCircleOutline color='secondary' fontSize='small'/>
                        </IconButton>
                          </div>
))}
</ul>
 </div>
                     <button className="outline-none glass shadow-2xl w-full p-3 mb-24 bg-[#ffffff] hover:border-[#b7e0a5] border-[2px] hover:border-solid hover:border-[3px]  hover:text-[#008000] font-bold rounded-md" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default CreateOrder;
