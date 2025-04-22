"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setPhoneNumber } from "@/redux/features/queue-slice";
import { sendOTP } from "@/app/api/FetchAPI";
import SuccessToast from "@/app/components/SuccessToast";
import ToastMessage from "@/app/components/ToastMessage";

export default function EnterNumber() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [isSending, setIsSending] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState(null);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
        }, 2000); // Hide after 2 seconds
    };

    useEffect(() => {
        if (!companyName) {
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    useEffect(() => {
        // Auto-focus the input field on initial render
        const inputField = document.getElementById("phone-input");
        inputField?.focus();

        // Recalculate validity on mount
        setIsValid(phoneNumber.length === 10);
    }, [phoneNumber]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            dispatch(setPhoneNumber(value));
            setIsValid(value.length === 10);
        }
    };

    const handleSendOTP = async () => {
        if (!isValid) {
            showToast("Please enter a valid 10-digit phone number.", "error");
            return;
        }

        setIsSending(true);
        try {
            const response = await sendOTP(companyName, phoneNumber);
            if (response.success) {
                // showToast("OTP sent successfully!", "success");
                router.push('/QueueSystem/OTPVerification/EnterOTP');
            } else {
                showToast(response.message || "Failed to send OTP.", "error");
            }
        } catch (error) {
            showToast("An error occurred while sending OTP.", "error");
            console.error("Error sending OTP:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center justify-between min-h-screen w-screen bg-white px-6 py-12">
                <div className="w-full flex justify-center">
                    <Image src="/images/Lock.png" alt="Lock Icon" width={200} height={200} className="mt-14" />
                </div>
                <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center pb-24">
                    <h1 className="text-black font-bold text-2xl pb-6">OTP Verification</h1>
                    <p className="text-gray-600 text-base pb-12">
                        We will send a one-time password to your Phone Number.
                    </p>
                    <div className="w-full flex flex-col items-start">
                        <label htmlFor="phone-input" className="text-gray-600 text-sm mb-2">
                        Phone Number
                        </label>
                        <div className="w-full flex items-center border border-gray-300 rounded-2xl px-4 py-3">
                            <span className="text-gray-500 mr-4">+91</span>
                            <input
                                id="phone-input"
                                type="text"
                                placeholder="Enter your number"
                                value={phoneNumber}
                                onChange={handleInputChange}
                                className="flex-1 outline-none text-gray-700 text-base"
                            />
                            <div
                                className={`ml-2 w-8 h-8 flex items-center justify-center rounded-full transform transition-all duration-300 ${
                                    isValid
                                        ? "bg-green-500 scale-100 opacity-100"
                                        : phoneNumber.length > 0
                                        ? "bg-red-500 scale-100 opacity-100"
                                        : "scale-0 opacity-0"
                                }`}
                            >
                                <span className="text-white text-lg font-bold">
                                    {isValid ? "✔" : "✖"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center">
                    <button
                        onClick={handleSendOTP}
                        disabled={isSending || !isValid}
                        className={`w-full max-w-sm bg-blue-600 text-white font-semibold text-lg py-3 rounded-full shadow ${
                            isSending || !isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                    >
                        {isSending ? "Sending..." : "Get OTP"}
                    </button>
                </div>

                <style jsx>{`
                    .scale-0 {
                        transform: scale(0);
                        -webkit-transform: scale(0); /* Add WebKit prefix */
                    }
                    .scale-100 {
                        transform: scale(1);
                        -webkit-transform: scale(1); /* Add WebKit prefix */
                    }
                    .opacity-0 {
                        opacity: 0;
                    }
                    .opacity-100 {
                        opacity: 1;
                    }
                `}</style>
            </div>
            {toastMessage && <ToastMessage message={toastMessage} type={toastType} />}
        </>
    );
}
