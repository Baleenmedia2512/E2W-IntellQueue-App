"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setQueueStatus } from "@/redux/features/queue-slice";
import { FetchQueueClientData } from "@/app/api/FetchAPI";

export default function ReadyScreen() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const language = useAppSelector((state) => state.queueSlice.language);
    const phoneNumber = useAppSelector(state => state.queueSlice.phoneNumber);
    const router = useRouter();
    const dispatch = useDispatch();
    const queueStatus = useAppSelector(state => state.queueSlice.queueStatus);
    const pathname = usePathname();
    
    useEffect(() => {
        // Only check for companyName if phoneNumber is present (to avoid redirecting to InvalidAccess when phoneNumber is missing)
        if (!companyName && phoneNumber) {
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, phoneNumber, router]);

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
            // If the navigation is not a new entry (idx < 1), treat as back/forward
            if (window.history.state && window.history.state.idx !== undefined && window.history.state.idx < 1) {
                if (phoneNumber) {
                    router.replace('/QueueSystem/EnterDetails');
                } else {
                    router.replace('/QueueSystem/LanguageSelection');
                }
                return;
            }
        }
    }, []);

    useEffect(() => {
        if ((queueStatus === "Waiting" || queueStatus === "On-Hold") && pathname !== "/QueueSystem/WaitingScreen") {
            router.replace("/QueueSystem/WaitingScreen");
        } else if (queueStatus === "Completed" && pathname !== "/QueueSystem/ThankYouScreen") {
            router.replace("/QueueSystem/ThankYouScreen");
        } else if ((queueStatus === "Deleted" || queueStatus === undefined) && pathname !== "/QueueSystem/InvalidAccess") {
            router.replace("/QueueSystem/InvalidAccess");
        }
    }, [queueStatus, router, pathname]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <p className="text-green-600 font-bold text-3xl mb-4">
                    {language === "en" ? "Doctor is ready to see you." : "டாக்டர் உங்களை பார்க்க தயாராக உள்ளார்."}
                </p>
                <p className="text-gray-500 text-lg mb-6">
                    {language === "en" ? "Please proceed to the counter." : "தயவுசெய்து கவுண்டருக்கு செல்லவும்."}
                </p>
                <div className="my-8">
                    <img src="/images/ReadyImage.png" alt="Ready" className="w-64 h-64 object-contain" />
                </div>
                <div className="w-full">
                    <p className="text-green-600 font-semibold text-lg mb-2">
                        {language === "en" ? "It’s your turn! 💚" : "இது உங்கள் முறை! 💚"}
                    </p>
                    <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-full"></div>
                    </div>
                    <p className="text-sm text-right text-gray-400 mt-2">
                        {language === "en" ? "Your turn" : "உங்கள் முறை"}
                    </p>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                    {language === "en" ? "Want to learn more about our services?" : "எங்கள் சேவைகள் பற்றி மேலும் அறிய விரும்புகிறீர்களா?"}
                </p>
                <p className="text-sm text-blue-600 underline">
                    <a href="https://gracescans.com/" target="_blank" rel="noopener noreferrer">
                        {language === "en" ? "Visit our site" : "எங்கள் தளத்தை பார்வையிடவும்"}
                    </a>
                </p>
            </div>
        </div>
    );
}
