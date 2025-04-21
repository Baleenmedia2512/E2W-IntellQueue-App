"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { sendOTP, verifyOTP } from "@/app/api/FetchAPI";
import SuccessToast from "@/app/components/SuccessToast";
import ToastMessage from "@/app/components/ToastMessage";

export default function EnterOTP() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false); // Track incorrect OTP
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState(null);
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

    // Web OTP API integration for Android Chrome
    useEffect(() => {
        if ('OTPCredential' in window) {
            const ac = new AbortController();
    
            navigator.credentials
                .get({
                    otp: { transport: ['sms'] },
                    signal: ac.signal,
                })
                .then((otpCredential) => {
                    if (otpCredential?.code) {
                        const code = otpCredential.code;
                        if (/^\d{4}$/.test(code)) {
                            const splitOtp = code.split('');
                            setOtp(splitOtp);
                        }
                    }
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error("OTP auto-read error:", err);
                    }
                });
    
            return () => {
                // Abort Web OTP API if the component unmounts
                ac.abort();
            };
        }
    }, []);
        

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;
    
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setIsIncorrect(false);
    
        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handlePaste = (e) => {
        const paste = e.clipboardData.getData("text");
        if (/^\d{4}$/.test(paste)) {
            const pasteArray = paste.split("");
            setOtp(pasteArray);
    
            // Focus the last field to give a sense of completion
            setTimeout(() => {
                const lastInput = document.getElementById(`otp-3`);
                lastInput?.focus();
            }, 0);
        }
    };
    

    const handleDelete = (e, index) => {
        if (e.key === "Backspace" && otp[index] === "") {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.classList.add("animate-bounce-up"); // Add bounce animation
            setTimeout(() => prevInput?.classList.remove("animate-bounce-up"), 300); // Remove class after animation
            prevInput?.focus();
        }
    };

    const handleResendOTP = async () => {
        if (isResendDisabled) return;

        try {
            const response = await sendOTP(companyName, phoneNumber);
            if (response.success) {
                // showToast("OTP resent successfully!", "success");
                setIsResendDisabled(true);
                setCountdown(30); // Reset countdown
            } else {
                showToast(response.message || "Failed to resend OTP.", "error");
            }
        } catch (error) {
            showToast("An error occurred while resending OTP.", "error");
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 4) {
            showToast("Please enter a valid 4-digit OTP.", "error");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await verifyOTP(companyName, phoneNumber, otpCode);
            if (response.success) {
                // showToast("OTP verified successfully!", "success");
                router.push("/QueueSystem/OTPVerification/Verified");
            } else {
                setIsIncorrect(true); // Mark OTP as incorrect
                showToast(response.message || "Failed to verify OTP.", "error");
            }
        } catch (error) {
            showToast("An error occurred while verifying OTP.", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
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
                                onPaste={handlePaste}
                                inputMode="numeric"
                                pattern="[0-9]{1}"
                                name={index === 0 ? "otp" : undefined}
                                autoComplete={index === 0 ? "one-time-code" : "off"}
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

                    @-webkit-keyframes shake { /* Add WebKit prefix */
                        0%, 100% {
                            -webkit-transform: translateX(0);
                        }
                        25% {
                            -webkit-transform: translateX(-5px);
                        }
                        50% {
                            -webkit-transform: translateX(5px);
                        }
                        75% {
                            -webkit-transform: translateX(-5px);
                        }
                    }

                    .animate-shake {
                        animation: shake 0.3s ease-in-out;
                        -webkit-animation: shake 0.3s ease-in-out; /* Add WebKit prefix */
                    }

                    .animate-backspace {
                        animation: backspace 0.3s ease-in-out;
                    }

                    @keyframes bounce-up {
                        0% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-10px);
                        }
                        100% {
                            transform: translateY(0);
                        }
                    }

                    .animate-bounce-up {
                        animation: bounce-up 0.3s ease-in-out;
                    }
                `}</style>
            </div>
            {toastMessage && <ToastMessage message={toastMessage} type={toastType} />}
        </>
    );
}
