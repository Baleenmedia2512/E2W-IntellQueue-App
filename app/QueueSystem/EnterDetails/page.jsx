"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setPhoneNumber } from "@/redux/features/queue-slice";
import { checkAndRegisterQueue } from "@/app/api/FetchAPI";
import { useAppSelector } from "@/redux/store";

export default function EnterDetails() {
    const companyName = useAppSelector((state) => state.authSlice.companyName);
    const language = useAppSelector((state) => state.queueSlice.language);
    const [name, setName] = useState("");
    const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
    const [isRegistering, setIsRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const router = useRouter();
    const dispatch = useDispatch();
    const inputRef = useRef(null); // Reference for the input field

    useEffect(() => {
        if (!companyName) {
            console.warn("Company name is missing, redirecting...");
            router.push('/QueueSystem/InvalidAccess');
        }
    }, [companyName, router]);

    useEffect(() => {
        inputRef.current?.focus(); // Automatically focus on the input field
    }, []);

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,10}$/.test(value)) {
            dispatch(setPhoneNumber(value)); // Update Redux state
            setError(null); // Clear error when user starts typing
        }
    };

    const handleFocus = () => {
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const handleSubmit = async () => {
        if (phoneNumber.length !== 10) {
            setError(language === "en" ? "Invalid phone number" : "தவறான தொலைபேசி எண்");
            return;
        }

        try {
            const response = await checkAndRegisterQueue(companyName, phoneNumber, "");

            if (response.status === "found" || response.status === "registered") {
                setMessage({
                    type: "success",
                    text: language === "en"
                        ? `Welcome back<br />${response.ClientName}!`
                        : `மீண்டும் வருக<br />${response.ClientName}!`,
                });
                setTimeout(() => router.push("/QueueSystem/WaitingScreen"), 2000);
            } else if (response.status === "not_found") {
                setMessage({
                    type: "info",
                    text: language === "en"
                        ? "Your number is not registered.<br />Please visit the counter."
                        : "உங்கள் எண் பதிவு செய்யப்படவில்லை.<br />கவுண்டருக்கு செல்லவும்.",
                });
                console.log("User not found.");
                // Uncomment the following lines for future registration functionality
                /*
                setIsRegistering(true);
                */
            }
        } catch (error) {
            console.error("Error fetching queue data:", error);
        }
    };

    // const handleRegister = async () => {
    //     if (name && phoneNumber.length === 10) {
    //         console.log("Registering user with name:", name, "and phone number:", phoneNumber);
    //         try {
    //             const response = await checkAndRegisterQueue(companyName, phoneNumber, name);
    //             console.log("Request sent with:", { companyName, phoneNumber, name });
    //             console.log("Response from registration:", response);

    //             if (response.status === "registered") {
    //                 setMessage({
    //                     type: "success",
    //                     text: language === "en"
    //                         ? "Registration successful! Redirecting..."
    //                         : "பதிவு வெற்றிகரமாக முடிந்தது! மாற்றி விடுகிறது...",
    //                 });
    //                 console.log("User successfully registered:", name);
    //                 setTimeout(() => router.push("/QueueSystem/WaitingScreen"), 2000);
    //             } else {
    //                 setMessage({
    //                     type: "error",
    //                     text: language === "en"
    //                         ? "Registration failed. Please try again."
    //                         : "பதிவு தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    //                 });
    //                 console.log("Registration failed.");
    //             }
    //         } catch (error) {
    //             console.error("Error registering:", error);
    //         }
    //     } else {
    //         console.warn("Invalid registration details:", { name, phoneNumber });
    //     }
    // };

    return (
        <div className="flex flex-col items-center min-h-screen w-screen bg-white px-4 sm:px-6 md:px-8 py-8 overflow-y-auto">
            {/* Logo at the top center */}
            <div className="absolute">
                <img
                    src="/GS/GSTitleMidLogo600x200.png"
                    alt="Grace Scans Logo"
                    className="w-32 sm:w-40 h-auto object-contain"
                />
            </div>

            {/* Centered content */}
            <div className="flex flex-col items-center justify-center flex-grow space-y-6 w-full max-w-md">
                <h1 className="text-lg sm:text-xl md:text-2xl text-black font-bold text-center">
                    {language === "en" ? "Enter Your Details" : "உங்கள் விவரங்களை உள்ளிடவும்"}
                </h1>
                <div className="flex flex-col space-y-4 w-full">
                    <div className="flex flex-col w-full">
                        <label htmlFor="phone-input" className="text-gray-600 text-sm mb-2">
                            {language === "en" ? "Phone Number" : "தொலைபேசி எண்"}
                        </label>
                        <div
                            className={`flex items-center border rounded-2xl px-4 py-3 transition-all duration-300 ${
                                error ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <span className="text-gray-500 mr-4">+91</span>
                            <input
                                id="phone-input"
                                type="text"
                                placeholder={language === "en" ? "Enter your number" : "உங்கள் எண்ணை உள்ளிடவும்"}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                onFocus={handleFocus} // Scroll input into view when focused
                                ref={inputRef} // Attach reference to input
                                className="flex-1 outline-none text-gray-700 text-sm sm:text-base"
                            />
                            <div
                                className={`ml-2 w-8 h-8 flex items-center justify-center rounded-full transform transition-all duration-300 ${
                                    phoneNumber.length === 10
                                        ? "bg-green-500 scale-100 opacity-100"
                                        : phoneNumber.length > 0
                                        ? "bg-red-500 scale-100 opacity-100"
                                        : "scale-0 opacity-0"
                                }`}
                            >
                                <span className="text-white text-lg font-bold">
                                    {phoneNumber.length === 10 ? "✔" : "✖"}
                                </span>
                            </div>
                        </div>
                        {error && (
                            <div className="mt-2 text-red-600 text-sm flex items-center space-x-2 animate-fade-in">
                                <span className="text-lg">❌</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600"
                    >
                        {language === "en" ? "Submit" : "சமர்ப்பிக்கவும்"}
                    </button>
                    {message && (
                        <div
                            className={`mt-4 p-4 rounded-lg flex items-center space-x-3 animate-slide-in ${
                                message.type === "success"
                                    ? "bg-green-100 text-green-900"
                                    : message.type === "info"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-red-100 text-red-900"
                            }`}
                            style={{
                                borderLeft: `4px solid ${
                                    message.type === "success"
                                        ? "#16a34a"
                                        : message.type === "info"
                                        ? "#2563eb"
                                        : "#dc2626"
                                }`,
                            }}
                        >
                            <div className="text-2xl">
                                {message.type === "success" && "🎉"}
                                {message.type === "info" && "ℹ️"}
                                {message.type === "error" && "❌"}
                            </div>
                            <div
                                className="text-left text-sm font-semibold leading-5"
                                dangerouslySetInnerHTML={{ __html: message.text }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-in-out;
                }
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
