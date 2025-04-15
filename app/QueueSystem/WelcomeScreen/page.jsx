"use client";

import Image from "next/image";

export default function WelcomeScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-[#FFFFFF] to-[#005EFF] p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <div className="mb-12 flex flex-col items-center">
                    <div className="mb-6">
                        <Image src="/GS/GSTitleMidLogo600x200.png" alt="Grace Scans Logo" width={200} height={70} />
                    </div>    
                    <h1 className="text-black font-bold text-4xl mb-6">Your health made simple</h1>
                    <p className="text-gray-600 text-lg mb-8">
                        1000+ Successful Scans Every Month <br /> Trusted by top doctors
                    </p>
                </div>
                <div className="my-10">
                    <Image src="/images/ScanMachine3D.png" alt="Scan Machine" width={500} height={500} className="object-contain" />
                </div>
                <button className="bg-blue-600 text-white font-semibold text-xl py-4 px-20 rounded-full shadow hover:bg-blue-700">
                    Join the Queue!
                </button>
            </div>
        </div>
    );
}
