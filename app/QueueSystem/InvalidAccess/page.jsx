"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";

export default function InvalidAccess() {
    const router = useRouter();

    const handleGoBack = () => {
        router.push('/QueueSystem/AutoLogin');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow-lg lg:p-8 flex flex-col items-center text-center">
                <Image src="/images/InvalidAccess.png" alt="Invalid Access" width={150} height={150} className="mb-6" />
                <h1 className="text-red-600 font-bold text-3xl mb-4">Invalid Access</h1>
                <p className="text-gray-600 text-lg mb-6">
                    It seems like you don't have the proper access to view this page. Please log in again.
                </p>
                <button
                    onClick={handleGoBack}
                    className="bg-blue-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow hover:bg-blue-700"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
}
