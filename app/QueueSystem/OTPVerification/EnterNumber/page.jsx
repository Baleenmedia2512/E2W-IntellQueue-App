"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setPhoneNumber } from "@/redux/features/queue-slice";
import { sendOTP } from "@/app/api/FetchAPI";

export default function EnterNumber() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [isSending, setIsSending] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();

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
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        setIsSending(true);
        try {
            const response = await sendOTP(companyName, phoneNumber);
            if (response.success) {
                console.log(response)
                // alert("OTP sent successfully!");
                // Redirect to the OTP verification page
                router.push('/QueueSystem/OTPVerification/EnterOTP');
            } else {
                alert(response.message || "Failed to send OTP.");
            }
        } catch (error) {
            alert("An error occurred while sending OTP.");
            console.error("Error sending OTP:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center">
                <Image src="/images/LockIcon.png" alt="Lock Icon" width={100} height={100} className="mb-6" />
                <h1 className="text-black font-bold text-2xl mb-4">OTP Verification</h1>
                <p className="text-gray-600 text-lg mb-6">
                    We will send a one-time password to your WhatsApp number.
                </p>
                <div className="w-full flex items-center border border-gray-300 rounded-lg px-4 py-3 mb-6">
                    <span className="text-gray-500 mr-2">+91</span>
                    <input
                        id="phone-input"
                        type="text"
                        placeholder="WhatsApp Number"
                        value={phoneNumber}
                        onChange={handleInputChange}
                        className="flex-1 outline-none text-gray-700 text-lg"
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
                <button
                    onClick={handleSendOTP}
                    disabled={isSending || !isValid}
                    className={`bg-blue-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow ${
                        isSending || !isValid ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                >
                    {isSending ? "Sending..." : "Get OTP"}
                </button>
            </div>

            <style jsx>{`
                .scale-0 {
                    transform: scale(0);
                }
                .scale-100 {
                    transform: scale(1);
                }
                .opacity-0 {
                    opacity: 0;
                }
                .opacity-100 {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
}
