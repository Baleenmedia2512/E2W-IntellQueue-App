"use client";

import Image from "next/image";

export default function Verified() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center">
                <Image src="/images/VerifiedIcon.png" alt="Verified Icon" width={100} height={100} className="mb-6" />
                <h1 className="text-black font-bold text-2xl mb-4">Verified!</h1>
                <p className="text-gray-600 text-lg mb-6">
                    Your mobile number is now verified!
                </p>
                <p className="text-blue-600 font-bold text-lg mb-2">You’re now in the queue!</p>
                <p className="text-gray-500 text-sm">Please wait for your turn.</p>
            </div>
        </div>
    );
}
