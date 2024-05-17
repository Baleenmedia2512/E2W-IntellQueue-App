'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const CreateOrder = () => {
    const [clientName, setClientName] = useState();
    const [clientNumber, setClientNumber] = useState();
    const [releaseDate, setReleaseDate] = useState([]);
    const [marginAmount, setMarginAmount] = useState();
    const [marginPercentage, setMarginPercentage] = useState();
    const [remarks, setRemarks] = useState();
    const router = useRouter()

    return (
        <div className="flex flex-col justify-center mt-8 mx-[8%]">
            <form className="px-7 h-screen grid justify-center items-center">
                <div className="grid gap-6" id="form">
                    <h1 className="font-bold text-3xl text-center mb-4">Order Generation</h1>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Client Name'    
                    />
                    <label className='text-black hover:cursor-pointer' onClick={() => router.push('/')}>New Client? Click Here</label>
                    <input 
                        type='text' 
                        className="p-3 shadow-2xl glass w-full text-black outline-none focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md"
                        placeholder='Client Number'    
                    />
                    <div class="w-full flex gap-3 ">
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
                    
                </div>
            </form>
        </div>
    );
}

export default CreateOrder;
