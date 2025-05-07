"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";

export default function Verified() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const router = useRouter();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!companyName) {
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    useEffect(() => {
        let interval;
        const timer = setTimeout(() => {
            router.push("/QueueSystem/WaitingScreen");
        }, 3000);

        // Simulate progress bar
        interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1.67; // Increment progress to reach 100% in 3 seconds
            });
        }, 50);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [router]);

    return (
        <div className="flex flex-col items-center min-h-screen w-screen bg-white px-6 py-12">
            <div className="w-full flex justify-center">
                <Image src="/images/Verified.png" alt="Verified Icon" width={200} height={200} className="mt-14" />
            </div>
            <div className="flex-grow flex flex-col items-center justify-center w-full max-w-sm md:max-w-md text-center pb-24">
                <h1 className="text-black font-bold text-2xl pb-2">Verified!</h1>
                <p className="text-gray-600 text-base">
                    Your mobile number is now verified!
                </p>
                <p className="text-blue-600 font-bold text-lg pt-48">You’re now in the queue!</p>
                <p className="text-gray-500 text-sm">Please wait for your turn.</p>
            </div>
            <div
                className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-50"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
}
