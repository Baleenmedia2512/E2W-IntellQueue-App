"use client";

import Image from "next/image";

export default function EnterNumber() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center">
                <Image src="/images/LockIcon.png" alt="Lock Icon" width={100} height={100} className="mb-6" />
                <h1 className="text-black font-bold text-2xl mb-4">OTP Verification</h1>
                <p className="text-gray-600 text-lg mb-6">
                    We will send a one-time password to your WhatsApp number.
                </p>
                <div className="w-full flex items-center border border-gray-300 rounded-lg px-4 py-3 mb-6">
                    <span className="text-gray-500 mr-2">+91</span>
                    <input
                        type="text"
                        placeholder="WhatsApp Number"
                        className="flex-1 outline-none text-gray-700"
                    />
                    <span className="text-green-500 font-bold">✔</span>
                </div>
                <button className="bg-blue-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow hover:bg-blue-700">
                    Get OTP
                </button>
            </div>
        </div>
    );
}
