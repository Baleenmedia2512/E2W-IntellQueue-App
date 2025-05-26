"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setPhoneNumber } from "@/redux/features/queue-slice";
import { checkAndRegisterQueue, AddRemoteQueueUser } from "@/app/api/FetchAPI";
import { useAppSelector } from "@/redux/store";
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

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
    const [rateCard, setRateCard] = useState("USG Scan");

    const scanOptions = [
        { value: 'USG Scan', label: 'USG Scan' },
        { value: 'CT Scan', label: 'CT Scan' },
        { value: 'X-Ray', label: 'X-Ray' },
    ];

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
            console.log("Phone number updated:", value);
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

        console.log("Submitting phone number:", phoneNumber);
        try {
            const response = await checkAndRegisterQueue(companyName, phoneNumber, "");
            console.log("Request sent with:", { companyName, phoneNumber });
            console.log("Response from checkAndRegisterQueue:", response);

            if (response.status === "found" || response.status === "registered") {
                setMessage({
                    type: "success",
                    text: language === "en"
                        ? `Welcome back<br />${response.ClientName}!`
                        : `மீண்டும் வருக<br />${response.ClientName}!`,
                });
                console.log("User found in the system:", response.ClientName);
                setTimeout(() => router.push("/QueueSystem/WaitingScreen"), 2000);
            } else if (response.status === "not_found") {
                setMessage({
                    type: "info",
                    text: language === "en"
                        ? "Your number is not registered. Please enter your details to view your estimated waiting time."
                        : "உங்கள் எண் பதிவு செய்யப்படவில்லை. உங்கள் மதிப்பிடப்பட்ட காத்திருப்பு நேரத்தை காண உங்கள் விவரங்களை உள்ளிடவும்.",
                });
                setIsRegistering(true); // Show name field
            }
        } catch (error) {
            console.error("Error fetching queue data:", error);
        }
    };
    console.log(isRegistering, "isRegistering state");

    const handleRegister = async () => {
        console.log("Registering user with name:", name, "and phone number:", phoneNumber);
        if (name && phoneNumber.length === 10) {
            try {
                console.log("Registering user with name inside:", name, "and phone number:", phoneNumber, "and scan type:", rateCard);
                // Call new PHP API to add remote user
                const data = await AddRemoteQueueUser(companyName, phoneNumber, name, rateCard);
                console.log("Response from AddRemoteQueueUser:", data);
                if (data.status === "remote_registered") {
                    setMessage({
                        type: "success",
                        text: language === "en"
                            ? "Registered as remote user! Redirecting..."
                            : "தற்காலிக பயனராக பதிவு செய்யப்பட்டது! மாற்றி விடுகிறது...",
                    });
                    setTimeout(() => router.push("/QueueSystem/WaitingScreen"), 2000);
                } else {
                    setMessage({
                        type: "error",
                        text: language === "en" ? "Registration failed. Please try again." : "பதிவு தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
                    });
                }
            } catch (error) {
                setMessage({
                    type: "error",
                    text: language === "en" ? "Registration failed. Please try again." : "பதிவு தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
                });
            }
        } else {
            setError(language === "en" ? "Please enter your name" : "உங்கள் பெயரை உள்ளிடவும்");
        }
    };

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
                    {isRegistering && (
                        <>
                            <div className="flex flex-col w-full">
                                <label htmlFor="name-input" className="text-gray-600 text-sm mb-2">
                                    {language === "en" ? "Name" : "பெயர்"}
                                </label>
                                <input
                                    id="name-input"
                                    type="text"
                                    placeholder={language === "en" ? "Enter your name" : "உங்கள் பெயரை உள்ளிடவும்"}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="flex-1 outline-none text-gray-700 text-sm sm:text-base border rounded-2xl px-4 py-3 border-gray-300"
                                />
                            </div>
                            <div className="flex flex-col w-full mt-2">
                                <label htmlFor="scan-type" className="text-gray-600 text-sm mb-2">
                                    {language === "en" ? "Scan Type" : "ஸ்கேன் வகை"}
                                </label>
                                <Listbox value={rateCard} onChange={setRateCard}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white border border-gray-300 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 text-sm sm:text-base transition-all">
                                            <span className="block truncate">{scanOptions.find(o => o.value === rateCard)?.label}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                            {scanOptions.map(option => (
                                                <Listbox.Option
                                                    key={option.value}
                                                    className={({ active }) =>
                                                        `relative cursor-pointer select-none py-3 pl-10 pr-4 rounded-xl transition-all ${
                                                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                                        }`
                                                    }
                                                    value={option.value}
                                                >
                                                    {({ selected }) => (
                                                        <>
                                                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>{option.label}</span>
                                                            {selected ? (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            ) : null}
                                                        </>
                                                    )}
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </div>
                                </Listbox>
                            </div>
                        </>
                    )}
                    <button
                        onClick={isRegistering ? handleRegister : handleSubmit}
                        className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600"
                    >
                        {isRegistering
                            ? (language === "en" ? "Register & View Waiting Time" : "பதிவு செய்து காத்திருப்பு நேரம் காண்க")
                            : (language === "en" ? "Submit" : "சமர்ப்பிக்கவும்")}
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
                .custom-select option, .custom-option {
                    background: #f8fafc;
                    color: #22223b;
                    font-size: 1rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    margin: 0.25rem 0;
                    transition: background 0.2s, color 0.2s;
                }
                .custom-select option:checked, .custom-option:checked {
                    background: #2563eb;
                    color: #fff;
                }
                .custom-select option:hover, .custom-option:hover {
                    background: #e0e7ff;
                    color: #1e293b;
                }
                @media (max-width: 640px) {
                    select {
                        font-size: 1rem;
                        padding: 0.75rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
