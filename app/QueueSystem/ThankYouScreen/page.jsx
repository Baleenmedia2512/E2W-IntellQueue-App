"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setQueueStatus } from "@/redux/features/queue-slice";
import { FetchQueueClientData } from "@/app/api/FetchAPI";

export default function ThankYouScreen() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const language = useAppSelector((state) => state.queueSlice.language);
    const phoneNumber = useAppSelector(state => state.queueSlice.phoneNumber);
    const queueStatus = useAppSelector(state => state.queueSlice.queueStatus);
    const router = useRouter();
    const dispatch = useDispatch();
    const pathname = usePathname();

    useEffect(() => {
        if (!companyName && phoneNumber) {
            console.warn("Company name is missing, redirecting...");
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router, phoneNumber]);

    useEffect(() => {
        if (!phoneNumber) {
            router.push('/QueueSystem/EnterDetails');
        }
    }, [phoneNumber, router]);

    useEffect(() => {
        if (!companyName) return;
        const fetchQueue = async () => {
            try {
                const { status } = await FetchQueueClientData(companyName, phoneNumber);
                dispatch(setQueueStatus(status));
            } catch (error) {
                // ignore
            }
        };
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [companyName, phoneNumber, dispatch]);

    useEffect(() => {
        // Detect browser back/forward navigation
        if (typeof window !== "undefined") {
            if (window.history.state && window.history.state.idx !== undefined && window.history.state.idx < 1) {
                if (phoneNumber) {
                    router.replace('/QueueSystem/EnterDetails');
                } else {
                    router.replace('/QueueSystem/LanguageSelection');
                }
                return;
            }
        }
    }, [phoneNumber, router]);

    useEffect(() => {
        if ((queueStatus === "Waiting" || queueStatus === "On-Hold") && pathname !== "/QueueSystem/WaitingScreen") {
            router.replace("/QueueSystem/WaitingScreen");
        } else if (queueStatus === "In-Progress" && pathname !== "/QueueSystem/ReadyScreen") {
            router.replace("/QueueSystem/ReadyScreen");
        } else if (queueStatus === "Completed" && pathname !== "/QueueSystem/ThankYouScreen") {
            router.replace("/QueueSystem/ThankYouScreen");
        }
    }, [queueStatus, router, pathname]);

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