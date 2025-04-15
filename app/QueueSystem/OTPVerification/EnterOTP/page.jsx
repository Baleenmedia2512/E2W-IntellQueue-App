"use client";

import Image from "next/image";

export default function EnterOTP() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center">
                <Image src="/images/LockIcon.png" alt="Lock Icon" width={100} height={100} className="mb-6" />
                <h1 className="text-black font-bold text-2xl mb-4">OTP Verification</h1>
                <p className="text-gray-600 text-lg mb-6">
                    Enter the OTP sent to your WhatsApp.
                </p>
                <div className="flex justify-between w-full mb-6">
                    {[...Array(4)].map((_, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg outline-none"
                        />
                    ))}
                </div>
                <p className="text-gray-500 text-sm mb-6">
                    Didn’t receive a code? <span className="text-blue-600 underline">Resend in 30s</span>
                </p>
                <button className="bg-blue-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow hover:bg-blue-700">
                    Verify
                </button>
            </div>
        </div>
    );
}
