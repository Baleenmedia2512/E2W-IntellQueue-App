'use client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/store';
import AdTypePage from '../adDetails/adType';

const CreateOrder = () => {
    const loggedInUser = 'GraceScans';
    const [clientName, setClientName] = useState("");
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const [clientNameSuggestions, setClientNameSuggestions] = useState([])
    const [clientNumber, setClientNumber] = useState();
    const [maxOrderNumber, setMaxOrderNumber] = useState();
    const router = useRouter();
    const searchParams = useSearchParams();
    const rateId = searchParams.get('rateId');
    const qty = searchParams.get('qty');
    const rateName = searchParams.get('rateName');
    const type = searchParams.get('type');
    const unitPrice = searchParams.get('unitPrice')
    const unit = searchParams.get('unit');

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

      const fetchMaxRateID = async () => {
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

      useEffect(() => {
        fetchMaxRateID()
      },[])

    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
            <form className="px-7 h-screen grid justify-center items-center" onSubmit={createNewOrder}>
                <div className="grid gap-6" id="form">
                    <h1 className="font-bold text-3xl text-center mb-4">Order Generation</h1>
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

                        <ul className="list-none">
                            <li className="text-black border bg-gradient-to-r from-green-300 via-green-300 to-green-500 hover:cursor-pointer transition
                            duration-300">
                                <option className='font-bold '>Short Summary</option>
                                <option>Rate Card Name: {rateName}</option>
                                <option>Type: {type}</option>
                                <option>{unit}: {qty}</option>
                                <option>Unit Price: Rs. {unitPrice}</option>
                            </li>
                        </ul>
                    {/* <label className='text-black hover:cursor-pointer' onClick={() => router.push('/')}>New Client? Click Here</label> */}
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
                    /> */}
                    {/* <div class="w-full flex gap-3 ">
                        <input className="p-3 capitalize shadow-2xl glass w-52 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin Amount" 
                            name="MarginText" 
                            required
                        />
                        <input className="p-3 capitalize shadow-2xl glass w-28 outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md" 
                            type="number"
                            placeholder="Margin %" 
                            name="MarginText" 
                            required
                        />
                    </div>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Remarks'    
                    />
                    <input 
                        type='date' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"/>
                     */}
                     <button class="outline-none glass shadow-2xl  w-64 p-3  bg-[#ffffff] hover:border-[#b7e0a5] border-[1px] hover:border-solid hover:border-[1px]  hover:text-[#008000] font-bold rounded-md" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default CreateOrder;
