"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { sendOTP, verifyOTP } from "@/app/api/FetchAPI";

export default function EnterOTP() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false); // Track incorrect OTP
    const router = useRouter();

    useEffect(() => {
        if (!companyName) {
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    useEffect(() => {
        setTimeout(() => {
            const firstInput = document.getElementById("otp-0");
            firstInput?.focus();
        }, 100);

        if (isResendDisabled) {
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsResendDisabled(false);
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isResendDisabled]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setIsIncorrect(false); // Reset incorrect state on input change

        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleDelete = (e, index) => {
        if (e.key === "Backspace" && otp[index] === "") {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleResendOTP = async () => {
        if (isResendDisabled) return;

        try {
            const response = await sendOTP(companyName, phoneNumber);
            if (response.success) {
                console.log(response);
                alert("OTP resent successfully!");
                setIsResendDisabled(true);
                setCountdown(30); // Reset countdown
            } else {
                alert(response.message || "Failed to resend OTP.");
            }
        } catch (error) {
            alert("An error occurred while resending OTP.");
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            alert("Please enter a valid 4-digit OTP.");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyOTP(companyName, phoneNumber, otpCode);
            if (response.success) {
                alert("OTP verified successfully!");
                router.push("/QueueSystem/OTPVerification/Verified");
            } else {
                setIsIncorrect(true); // Mark OTP as incorrect
                alert(response.message || "Failed to verify OTP.");
            }
        } catch (error) {
            alert("An error occurred while verifying OTP.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen w-screen bg-white px-6 py-12">
            <div className="w-full flex justify-center">
                <Image src="/images/LockWithChat.png" alt="Lock Icon" width={200} height={200} className="mt-14" />
            </div>
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center pb-24">
                <h1 className="text-black font-bold text-2xl pb-6">OTP Verification</h1>
                <p className="text-gray-600 text-base pb-12">
                    Enter the OTP sent to your WhatsApp.
                </p>
                <div className="flex justify-between w-full mb-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleDelete(e, index)}
                            inputMode="numeric"
                            pattern="[0-9]{1}"
                            autoComplete="one-time-code"
                            autoFocus={index === 0}
                            className={`w-12 h-12 text-center border rounded-lg text-lg text-black outline-none focus:ring-2 transition-transform duration-300 ease-in-out ${
                                isIncorrect
                                    ? "border-red-500 animate-shake"
                                    : "border-gray-300 focus:ring-blue-400"
                            }`}
                        />
                    ))}
                </div>
                <p className="text-gray-500 text-sm mb-6">
                    Didn’t receive a code?{" "}
                    <span
                        className={`text-blue-600 underline ${isResendDisabled ? "text-gray-400 cursor-not-allowed" : ""}`}
                        onClick={handleResendOTP}
                        cursor={isResendDisabled ? "not-allowed" : "pointer"}
                    >
                        {isResendDisabled ? `Resend in ${countdown}s` : "Resend"}
                    </span>
                </p>
            </div>
            <div className="w-full flex justify-center">
                <button
                    onClick={handleVerifyOTP}
                    disabled={isVerifying}
                    className={`w-full max-w-sm bg-blue-600 text-white font-semibold text-lg py-3 rounded-full shadow ${
                        isVerifying ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                >
                    {isVerifying ? "Verifying..." : "Verify"}
                </button>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    50% {
                        transform: translateX(5px);
                    }
                    75% {
                        transform: translateX(-5px);
                    }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
