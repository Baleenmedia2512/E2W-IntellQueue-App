"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function EnterOTP() {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [countdown, setCountdown] = useState(30); // 30 seconds countdown for resend
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    useEffect(() => {
        // Use setTimeout to ensure focus happens after rendering
        setTimeout(() => {
            const firstInput = document.getElementById("otp-0");
            firstInput?.focus();
        }, 100); // Delay focus to ensure input is rendered first

        // Start the countdown when the component mounts
        if (isResendDisabled) {
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsResendDisabled(false); // Enable resend button after 30 seconds
                        return 30; // Reset countdown
                    }
                    return prev - 1;
                });
            }, 1000);
            
            // Clean up the interval on component unmount
            return () => clearInterval(interval);
        }
    }, [isResendDisabled]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return; // Allow only numbers
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to the next field
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

    const handleResendOTP = () => {
        if (isResendDisabled) return; // Prevent multiple clicks before cooldown

        // Simulate OTP resend (you should replace this with an actual API call)
        alert("OTP has been resent!"); // Placeholder for sending OTP

        // Disable the resend button and start the countdown
        setIsResendDisabled(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white p-6 space-y-6">
            <div className="w-full max-w-sm md:max-w-md flex flex-col items-center text-center">
                <Image src="/images/LockIcon.png" alt="Lock Icon" width={100} height={100} className="mb-6" />
                <h1 className="text-black font-bold text-2xl mb-4">OTP Verification</h1>
                <p className="text-gray-600 text-lg mb-6">
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
                            inputMode="numeric"  // Ensures numeric keyboard on mobile
                            pattern="[0-9]{1}"  // Validates the input to allow only numbers
                            autoComplete="one-time-code"
                            autoFocus={index === 0} // Auto-focus on the first input
                            className="w-12 h-12 text-center border border-gray-300 rounded-lg text-lg text-black outline-none focus:ring-2 focus:ring-blue-400 transition-transform duration-300 ease-in-out"
                            style={{
                                animation: digit ? "none" : "bounce 0.5s ease-in-out", // Apply bounce effect when input is empty
                            }}
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
                <button className="bg-blue-600 text-white font-semibold text-lg py-3 px-6 rounded-full shadow hover:bg-blue-700">
                    Verify
                </button>
            </div>

            <style jsx>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}
