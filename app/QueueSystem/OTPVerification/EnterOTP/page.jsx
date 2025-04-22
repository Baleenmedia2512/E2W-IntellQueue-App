"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppSelector } from "@/redux/store";
import { sendOTP, verifyOTP } from "@/app/api/FetchAPI";
import ToastMessage from "@/app/components/ToastMessage";

export default function EnterOTP() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [countdown, setCountdown] = useState(30);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isIncorrect, setIsIncorrect] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState(null);
    const router = useRouter();

    const showToast = (message, type) => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 2000);
    };

    useEffect(() => {
        if (!companyName) {
            router.push("/QueueSystem/InvalidAccess");
        }
    }, [companyName, router]);

    useEffect(() => {
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

    useEffect(() => {
        if ("OTPCredential" in window) {
            const ac = new AbortController();
            navigator.credentials
                .get({
                    otp: { transport: ["sms"] },
                    signal: ac.signal,
                })
                .then((otpCredential) => {
                    const code = otpCredential?.code?.match(/\d{4}/);
                    if (code) {
                        setOtp(code[0].split(""));
                    }
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        console.error("OTP auto-read error:", err);
                    }
                });

            return () => ac.abort();
        }
    }, []);

    useEffect(() => {
        if (isIncorrect) {
            const lastInputIndex = otp.filter((char) => char !== "").length;
            const inputElement = document.querySelector(`input[name="otp"]`);
            if (inputElement) {
                inputElement.setSelectionRange(lastInputIndex, lastInputIndex);
                inputElement.focus();
            }
        }
    }, [isIncorrect]);

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        const newOtp = Array(4).fill("");
        for (let i = 0; i < value.length; i++) {
            newOtp[i] = value[i];
        }
        setOtp(newOtp);
        setIsIncorrect(false);
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").trim();
        if (/^\d{4}$/.test(pasted)) {
            setOtp(pasted.split(""));
            setIsIncorrect(false);
        }
    };

    const handleResendOTP = async () => {
        if (isResendDisabled) return;

        try {
            const response = await sendOTP(companyName, phoneNumber);
            if (response.success) {
                setIsResendDisabled(true);
                setCountdown(30);
            } else {
                showToast(response.message || "Failed to resend OTP.", "error");
            }
        } catch {
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
                router.push("/QueueSystem/OTPVerification/Verified");
            } else {
                setIsIncorrect(true);
                showToast(response.message || "Failed to verify OTP.", "error");
            }
        } catch {
            showToast("An error occurred while verifying OTP.", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    const currentInputLength = otp.filter((char) => char !== "").length;

    return (
        <>
            <div className="flex flex-col items-center justify-between min-h-screen w-screen bg-white px-6 py-12">
                <div className="w-full flex justify-center">
                    <Image src="/images/LockWithChat.png" alt="Lock Icon" width={200} height={200} className="mt-14" />
                </div>
                <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center pb-24">
                    <h1 className="text-black font-bold text-2xl pb-6">OTP Verification</h1>
                    <p className="text-gray-600 text-base pb-12">Enter the OTP sent to your WhatsApp.</p>

                    {/* Hidden input for Web OTP autofill */}
                    <div className="relative w-full max-w-xs mx-auto mb-6">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={otp.join("")}
                            onChange={handleChange}
                            onPaste={handlePaste}
                            autoFocus
                            name="otp"
                            autoComplete="one-time-code"
                            className="absolute inset-0 w-full h-full opacity-0 z-10"
                        />
                        <div className="flex justify-between pointer-events-none space-x-2">
                            {otp.map((digit, i) => {
                                const showCursor = i === currentInputLength && digit === "";
                                return (
                                    <div
                                        key={i}
                                        className={`w-12 h-12 border rounded-lg flex items-center justify-center text-lg font-medium text-black relative transition-all duration-200 ease-in-out ${
                                            isIncorrect ? "border-red-500 animate-shake" : "border-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`transition-all duration-200 transform ${
                                                digit ? "scale-100 opacity-100" : "scale-90 opacity-0"
                                            }`}
                                        >
                                            {digit}
                                        </span>
                                        {showCursor && (
                                            <span className="blinking-cursor absolute left-1/2 -translate-x-1/2 w-[1px] h-5 bg-black" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-6">
                        Didn’t receive a code?{" "}
                        <span
                            className={`text-blue-600 underline ${
                                isResendDisabled ? "text-gray-400 cursor-not-allowed" : ""
                            }`}
                            onClick={handleResendOTP}
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
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        50% { transform: translateX(5px); }
                        75% { transform: translateX(-5px); }
                    }
                    @keyframes blink {
                        0% { opacity: 0; }
                        50% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    .animate-shake {
                        animation: shake 0.3s ease-in-out;
                    }
                    .blinking-cursor {
                        animation: blink 1s step-end infinite;
                    }
                `}</style>
            </div>

            {toastMessage && <ToastMessage message={toastMessage} type={toastType} />}
        </>
    );
}
