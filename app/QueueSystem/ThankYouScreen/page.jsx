"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";

export default function ThankYouScreen() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const language = useAppSelector((state) => state.queueSlice.language);
    const router = useRouter();

    useEffect(() => {
        if (!companyName) {
            console.warn("Company name is missing, redirecting...");
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    if (!companyName) {
        return null; // Prevent rendering if companyName is missing
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <div className="mb-4">
                    <img src="/GS/GSTitleMidLogo600x200.png" alt="Grace Scans Logo" className="w-40 h-auto object-contain" />
                </div>
                <div className="mb-4">
                    <img src="/images/ThankYou.png" alt="Thank you" className="w-64 h-auto object-contain" />
                </div>
                <p className="text-gray-600 text-base mb-6">
                    {language === "en"
                        ? "We’d love to hear your thoughts! Kindly share your feedback on our services."
                        : "உங்கள் கருத்துகளை பகிர விரும்புகிறோம்! எங்கள் சேவைகள் குறித்த உங்கள் கருத்துகளை பகிரவும்."}
                </p>
                <button className="px-8 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md">
                    {language === "en" ? "Share your review!" : "உங்கள் மதிப்பீட்டை பகிரவும்!"}
                </button>
            </div>
        </div>
    );
}