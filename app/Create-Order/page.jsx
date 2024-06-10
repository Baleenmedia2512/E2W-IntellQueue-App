'use client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/store';

const CreateOrder = () => {
    const loggedInUser = 'GraceScans';
    const [clientName, setClientName] = useState("");
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState();
    const [maxOrderNumber, setMaxOrderNumber] = useState();
    const [marginAmount, setMarginAmount] = useState(0);
    const [marginPercentage, setMarginPercentage] = useState(0);
    const [releaseDates, setReleaseDates] = useState([]);
    const [remarks, setRemarks] = useState();
    const [elementsToHide, setElementsToHide] = useState([])

    const router = useRouter();
    const selectedValues = useAppSelector(state => state.rateSlice.selectedValues);
    const rateId = useAppSelector(state => state.rateSlice.rateId)
    const selectedUnit = useAppSelector(state => state.rateSlice.selectedUnit);  
    const qty = useAppSelector(state => state.rateSlice.qty);
    const unitPrice = useAppSelector(state => state.rateSlice.unitPrice);

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
    
        setClientNameSuggestions([]);
        setClientName(name);
        setClientNumber(number);
      };

      const createNewOrder = async(event) => {
        event.preventDefault()
        try {
            const response = await fetch(`https://www.orders.baleenmedia.com/API/Media/CreateNewOrder.php/?JsonUserName=${loggedInUser}&JsonClientName=${clientName}&JsonClientContact=${clientNumber}&JsonRateId=${rateId}&JsonDBName=${companyName}`)
            const data = await response.json();
            if (data === "Values Inserted Successfully!") {
                window.alert('Work Order #'+ maxOrderNumber +' Created Successfully!')
                router.push('/FinanceEntry');
              //setMessage(data.message);
            } else {
              alert(`The following error occurred while inserting data: ${data}`);
            }
          } catch (error) {
            console.error('Error updating rate:', error);
          }
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
        fetchMaxOrderNumber();
        elementsToHideList();
      },[])

      useEffect(() => {
        //searching elements to Hide from database
    
        elementsToHide.forEach((name) => {
          const elements = document.getElementsByName(name);
          elements.forEach((element) => {
            element.style.display = 'none'; // Hide the element
          });
        });
      }, [elementsToHide])
      
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
                            <li key={index} className="text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition
                            duration-300">
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
                            <li className="text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition
                            duration-300">
                                <option className='font-bold '>Short Summary</option>
                                <option>Rate Card Name: {selectedValues.rateName.value}</option>
                                <option>Type: {selectedValues.adType.value}</option>
                                <option>Unit Price: Rs. {unitPrice} per {selectedUnit.value}</option>
                            </li>
                        </ul>
                        
                    <label className='text-black hover:cursor-pointer' onClick={() => router.push('/')}>New Client? Click Here</label> 
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
                    <div>
                    <label className="block text-gray-700 font-semibold mb-2">Margin Amount</label>
                        <input className="p-3 capitalize shadow-2xl glass w-52 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin Amount" 
                            name="MarginText" 
                            required
                            value={marginAmount}
                            onChange={e => setMarginAmount(e.target.value)}
                        />
                        </div>
                        <div>
                    <label className="block text-gray-700 font-semibold mb-2">Margin %</label>
                        <input className="p-3 capitalize shadow-2xl glass w-28 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin %" 
                            name="MarginText" 
                            value={marginPercentage}
                            required
                            onChange={e => setMarginPercentage(e.target.value)}
                        />
                        </div>
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
                    <div>
                    <label className="block text-gray-700 font-semibold mb-2">Release Date</label>
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
                     <button className="outline-none glass shadow-2xl w-full p-3  bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:border-[1px]  hover:text-[#008000] font-bold rounded-md" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default CreateOrder;
