"use client";

import { useAppSelector } from "@/redux/store";
import Image from "next/image";

export default function InvalidAccess() {
    const language = useAppSelector(state => state.queueSlice.language);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow-lg lg:p-8 flex flex-col items-center text-center">
                <Image src="/images/InvalidAccess.png" alt="Invalid Access" width={150} height={150} className="mb-6" />
                <h1 className="text-red-600 font-bold text-3xl mb-4">
                    {language === "en" ? "Invalid Access" : "தவறான அணுகல்"}
                </h1>
                <p className="text-gray-600 text-lg mb-6">
                    {language === "en"
                        ? "It seems like you don't have the proper access to view this page. Please scan the QR Code again."
                        : "இந்தப் பக்கத்தை பார்க்க உங்களுக்கு தேவையான அணுகல் இல்லை போலிருக்கிறது. தயவுசெய்து QR குறியீட்டை மீண்டும் ஸ்கேன் செய்யவும்."}
                </p>
            </div>
        </div>
    );
}
