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