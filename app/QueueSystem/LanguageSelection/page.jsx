"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/redux/features/queue-slice";
import { useAppSelector } from "@/redux/store";
import { CapacitorNavigation } from '../../utils/capacitorNavigation';

export default function LanguageSelection() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleLanguageSelect = (language) => {
        dispatch(setLanguage(language));
        CapacitorNavigation.navigate(router, '/QueueSystem/EnterDetails');
    };

    useEffect(() => {
        if (!companyName) {
            console.warn("Company name is missing, redirecting...");
            CapacitorNavigation.navigate(router, '/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    return (
        <div className="flex flex-col items-center min-h-screen w-screen bg-white px-6 py-12">
            {/* Logo at the top center */}
            <div className="absolute top-6">
                <img
                    src="/GS/GSTitleMidLogo600x200.png"
                    alt="Grace Scans Logo"
                    className="w-40 h-auto object-contain"
                />
            </div>

            {/* Centered content */}
            <div className="flex flex-col items-center justify-center flex-grow space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-xl md:text-2xl text-black font-bold">
                        Choose your language
                    </h1>
                    <p className="text-base md:text-lg text-gray-600">
                        உங்கள் மொழியை தேர்வு செய்யவும்
                    </p>
                </div>
                <div className="flex flex-col space-y-4 w-full max-w-xs">
                    <button
                        onClick={() => handleLanguageSelect("en")}
                        className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md flex items-center justify-center space-x-2"
                    >
                        <img src="/images/UKFlag.png" alt="English" className="w-6 h-6" />
                        <span>ENGLISH</span>
                    </button>
                    <button
                        onClick={() => handleLanguageSelect("ta")}
                        className="px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md flex items-center justify-center space-x-2"
                    >
                        <img src="/images/IndiaFlag.png" alt="Tamil" className="w-6 h-6" />
                        <span>தமிழ்</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
