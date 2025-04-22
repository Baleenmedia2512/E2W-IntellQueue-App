"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { fetchQueueData } from "@/app/api/FetchAPI";

export default function WaitingScreen() {
    const companyName = useAppSelector(state => state.authSlice.companyName);
    const phoneNumber = useAppSelector(state => state.queueSlice.phoneNumber);
    const router = useRouter();
    const [queuePosition, setQueuePosition] = useState(null);
    const [waitingTime, setWaitingTime] = useState(null);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        if (!companyName || !phoneNumber) {
            router.push('/QueueSystem/InvalidAccess');
            return;
        }

        const fetchQueue = async () => {
            try {
                const { position, total, remainingTime } = await fetchQueueData(companyName, phoneNumber);
                setQueuePosition(position);
                setTotalOrders(total);
                setWaitingTime(remainingTime);
                console.log("Queue Data:", { position, total, remainingTime });
            } catch (error) {
                console.error("Error fetching queue data:", error);
            }
        };

        fetchQueue();

        const fetchInterval = setInterval(fetchQueue, 5000); // Real-time updates every 5 seconds
        return () => clearInterval(fetchInterval);
    }, [companyName, phoneNumber, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md lg:bg-white lg:rounded-2xl lg:shadow lg:p-8 flex flex-col items-center text-center">
                <div className="border-2 border-blue-500 rounded-xl px-6 py-5 mb-6 bg-blue-50">
                    <p className="text-blue-600 font-semibold text-4xl">
                        {waitingTime === null || waitingTime === undefined ? "--" : waitingTime}
                    </p>
                    <p className="text-blue-500 text-xl">Mins</p>
                </div>
                <p className="text-gray-700 font-medium text-2xl mb-6">Approx. Waiting Time</p>
                <div className="my-8">
                    <img src="/images/WaitingImage.png" alt="Waiting" className="w-64 h-64 object-contain" />
                </div>
                <p className="text-black font-semibold text-2xl mb-4">You’re almost there!</p>
                <p className="text-gray-500 text-lg mb-6">Relax, we’ll notify you when it’s your turn.</p>
                <div className="w-full">
                    <p className="text-lg text-gray-500 mb-2">{queuePosition !== null ? `${queuePosition} more ahead of you` : "Loading..."}</p>
                    <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                            style={{ width: `${queuePosition !== null ? ((totalOrders - queuePosition) / totalOrders) * 100 : 0}%` }}
                        ></div>
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