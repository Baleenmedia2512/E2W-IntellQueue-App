"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";

export default function ReadyScreen() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const router = useRouter();

    useEffect(() => {
        if (!companyName) {
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <p className="text-green-600 font-bold text-3xl mb-4">Doctor is ready to see you.</p>
                <p className="text-gray-500 text-lg mb-6">Please proceed to the counter.</p>
                <div className="my-8">
                    <img src="/images/ReadyImage.png" alt="Ready" className="w-64 h-64 object-contain" />
                </div>
                <div className="w-full">
                <p className="text-green-600 font-semibold text-lg mb-2">It’s your turn! 💚</p>
                  <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                  </div>
                  <p className="text-sm text-right text-gray-400 mt-2">Your turn</p>
                </div>
                <p className="text-sm text-gray-500 mt-6">Want to learn more about our services?</p>
                <p className="text-sm text-blue-600 underline">
                    <a href="https://gracescans.com/" target="_blank" rel="noopener noreferrer">Visit our site</a>
                </p>
            </div>
        </div>
    );
}
