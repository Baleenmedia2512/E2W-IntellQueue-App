"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { FetchQueueClientData } from "@/app/api/FetchAPI";
import { useDispatch } from "react-redux";
import { setQueueStatus } from "@/redux/features/queue-slice";
import ReadyScreen from "../ReadyScreen/page";
import ThankYouScreen from "../ThankYouScreen/page";

export default function WaitingScreen() {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const phoneNumber = useAppSelector(state => state.queueSlice.phoneNumber);
    const language = useAppSelector(state => state.queueSlice.language);
    const router = useRouter();
    const dispatch = useDispatch();
    const queueStatus = useAppSelector(state => state.queueSlice.queueStatus);
    const [queuePosition, setQueuePosition] = useState(null);
    const [waitingTime, setWaitingTime] = useState(null);
    const [totalOrders, setTotalOrders] = useState(0);
    console.log("queueStatus", queueStatus);

    useEffect(() => {
        if (!companyName || !phoneNumber) {
            router.push('/QueueSystem/InvalidAccess');
            return;
        }

        const fetchQueue = async () => {
            try {
                const { position, total, estimatedTime, remainingTime, status } = await FetchQueueClientData(companyName, phoneNumber);
                setQueuePosition(position);
                setTotalOrders(total);
                setWaitingTime(estimatedTime);
                dispatch(setQueueStatus(status));
            } catch (error) {
                console.error("Error fetching queue data:", error);
            }
        };

        fetchQueue();

        const fetchInterval = setInterval(fetchQueue, 5000); // Real-time updates every 5 seconds
        return () => clearInterval(fetchInterval);
    }, [companyName, phoneNumber, router, dispatch]);

    if (queueStatus === "In-Progress") {
        router.push("/QueueSystem/ReadyScreen");
        return null;
    }
    if (queueStatus === "Completed") {
        router.push("/QueueSystem/ThankYouScreen");
        return null;
    }
    if (queueStatus === "Remote") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
                <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                  
                    <div className="border-2 border-blue-500 rounded-xl px-6 py-5 mb-6 bg-blue-50">
                    <p className="text-blue-600 font-semibold text-4xl">
                        {waitingTime === null || waitingTime === undefined ? "--" : waitingTime}
                    </p>
                    <p className="text-blue-500 text-xl">
                        {language === "en" ? "Mins" : "நிமிடங்கள்"}
                    </p>
                </div>
                <p className="text-gray-700 font-medium text-2xl mb-6">
                    {language === "en" ? "Approx. Waiting Time" : "தற்காலிக காத்திருப்பு நேரம்"}
                </p>
                    <div className="my-8">
                        <img src="/images/WaitingImage.png" alt="Waiting" className="w-48 h-48 object-contain opacity-80" />
                    </div>
                    <button
                        className="mt-4 flex items-center justify-center px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-lg gap-2"
                        onClick={() => window.open('tel:+91-7010198963', '_self')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15 .621 0 1.125-.504 1.125-1.125v-3.375a1.125 1.125 0 0 0-1.125-1.125c-1.636 0-3.21-.26-4.687-.75a1.125 1.125 0 0 0-1.125.27l-2.25 2.25a12.042 12.042 0 0 1-5.25-5.25l2.25-2.25a1.125 1.125 0 0 0 .27-1.125c-.49-1.477-.75-3.051-.75-4.687A1.125 1.125 0 0 0 5.25 2.25H1.875C1.254 2.25.75 2.754.75 3.375z" />
                        </svg>
                        {language === "en" ? "Call Reception" : "கவுண்டரை அழைக்கவும்"}
                    </button>
                    <p className="text-gray-500 text-sm mt-6">
                        {language === "en"
                            ? "You are a remote user. You can view your estimated waiting time, but you are not in the queue until you call the clinic."
                            : "நீங்கள் தற்காலிக பயனர். உங்கள் மதிப்பிடப்பட்ட காத்திருப்பு நேரத்தை காணலாம், ஆனால் வரிசையில் சேர கிளினிக்கிற்கு அழைக்க வேண்டும்."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <div className="border-2 border-blue-500 rounded-xl px-6 py-5 mb-6 bg-blue-50">
                    <p className="text-blue-600 font-semibold text-4xl">
                        {waitingTime === null || waitingTime === undefined ? "--" : waitingTime}
                    </p>
                    <p className="text-blue-500 text-xl">
                        {language === "en" ? "Mins" : "நிமிடங்கள்"}
                    </p>
                </div>
                <p className="text-gray-700 font-medium text-2xl mb-6">
                    {language === "en" ? "Approx. Waiting Time" : "தற்காலிக காத்திருப்பு நேரம்"}
                </p>
                <div className="my-8">
                    <img src="/images/WaitingImage.png" alt="Waiting" className="w-64 h-64 object-contain" />
                </div>
                <p className="text-black font-semibold text-2xl mb-4">
                    {language === "en" ? "You’re almost there!" : "நீங்கள் அருகில் இருக்கிறீர்கள்!"}
                </p>
                {/* <p className="text-gray-500 text-lg mb-6">
                    {language === "en" ? "Relax, we’ll notify you when it’s your turn." : "தயவுசெய்து அமைதியாக இருங்கள், உங்கள் முறை வந்தவுடன் நாங்கள் உங்களை அறிவிப்போம்."}
                </p> */}
                <div className="w-full">
                    {/* <p className="text-lg text-gray-500 mb-2">
                        {queuePosition !== null
                            ? `${queuePosition} ${language === "en" ? "more ahead of you" : "முன் உள்ளவர்கள்"}`
                            : language === "en" ? "Loading..." : "ஏற்றுகிறது..."}
                    </p> */}
                    <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                            style={{ width: `${queuePosition !== null ? ((totalOrders - queuePosition) / totalOrders) * 100 : 0}%` }}
                        ></div>
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