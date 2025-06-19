"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setPhoneNumber, resetPhoneNumber, resetQueueStatus } from "@/redux/features/queue-slice";
import { checkAndRegisterQueue, AddRemoteQueueUser } from "@/app/api/FetchAPI";
import { useAppSelector } from "@/redux/store";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function EnterDetails() {
  const companyName = useAppSelector((state) => state.authSlice.companyName);
  const language = useAppSelector((state) => state.queueSlice.language);
  const phoneNumber = useAppSelector((state) => state.queueSlice.phoneNumber);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const scanOptions = [
    { value: "", label: "Select a Scan" },
    { value: "USG Scan", label: "USG Scan" },
    { value: "CT Scan", label: "CT Scan" },
    { value: "X-Ray", label: "X-Ray" },
  ];
  const [rateCard, setRateCard] = useState(scanOptions[0].value);

  useEffect(() => {
    if (!companyName) {
      console.warn("Company name is missing, redirecting...");
      router.push("/QueueSystem/InvalidAccess");
    }
  }, [companyName, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Force reset on mount if phoneNumber is set (regardless of navigation type)
  useEffect(() => {
    if (phoneNumber) {
      dispatch(resetPhoneNumber());
      dispatch(resetQueueStatus());
      setIsRegistering(false);
      setMessage("");
      setError(null);
      setRateCard(scanOptions[0].value);
      inputRef.current?.focus();
    }
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      dispatch(setPhoneNumber(value));
      setError(null);
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
            ? "Your number is not registered. Please select your scan type to continue."
            : "உங்கள் எண் பதிவு செய்யப்படவில்லை. தொடர ஸ்கேன் வகையைத் தேர்ந்தெடுக்கவும்.",
        });
        setIsRegistering(true);
      }
    } catch (error) {
      console.error("Error fetching queue data:", error);
    }
  };

    const handleRegister = async () => {
        if (phoneNumber.length !== 10) {
            setError(language === "en" ? "Invalid phone number" : "தவறான தொலைபேசி எண்");
            return;
        }

        if (rateCard === "") {
            setError(language === "en" ? "Please select a valid scan type" : "தயவுசெய்து ஒரு சரியான ஸ்கேன் வகையைத் தேர்ந்தெடுக்கவும்");
            return;
        }

        try {
            const data = await AddRemoteQueueUser(companyName, phoneNumber, rateCard);
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
    };

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-white px-4 py-8 overflow-y-auto">
      <div className="absolute">
        <img
          src="/GS/GSTitleMidLogo600x200.png"
          alt="Grace Scans Logo"
          className="w-32 sm:w-40 h-auto object-contain"
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow space-y-6 w-full max-w-md">
        <h1 className="text-lg sm:text-xl md:text-2xl text-black font-bold text-center">
          {language === "en" ? "Enter Your Details" : "உங்கள் விவரங்களை உள்ளிடவும்"}
        </h1>
        <div className="flex flex-col space-y-4 w-full">
          {/* Phone Input */}
          <div className="flex flex-col w-full">
            <label htmlFor="phone-input" className="text-gray-600 text-sm mb-2">
              {language === "en" ? "Phone Number" : "தொலைபேசி எண்"}
            </label>
            <div className={`flex items-center border rounded-2xl px-4 py-3 ${error ? "border-red-500" : "border-gray-300"}`}>
              <span className="text-gray-500 mr-4">+91</span>
              <input
                id="phone-input"
                type="text"
                placeholder={language === "en" ? "Enter your number" : "உங்கள் எண்ணை உள்ளிடவும்"}
                value={phoneNumber}
                onChange={handlePhoneChange}
                onFocus={handleFocus}
                ref={inputRef}
                className="flex-1 outline-none text-gray-700 text-sm sm:text-base"
              />
              <div className={`ml-2 w-8 h-8 flex items-center justify-center rounded-full transform transition-all duration-300 ${
                phoneNumber.length === 10 ? "bg-green-500" : phoneNumber.length > 0 ? "bg-red-500" : "scale-0 opacity-0"
              }`}>
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

          {/* Dropdown for Scan Type */}
          {isRegistering && (
            <div className="flex flex-col w-full mt-2">
              <label htmlFor="scan-type" className="text-gray-600 text-sm mb-2">
                {language === "en" ? "Scan Type" : "ஸ்கேன் வகை"}
              </label>
              <Listbox value={rateCard} onChange={setRateCard}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white border border-gray-300 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none text-gray-700 text-sm sm:text-base">
                    <span className="block truncate">{scanOptions.find(o => o.value === rateCard)?.label}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
                    {scanOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 rounded-xl ${active ? "bg-blue-100 text-blue-900" : "text-gray-900"}`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <CheckIcon className="h-5 w-5" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          )}

          {/* Button */}
          <button
            onClick={isRegistering ? handleRegister : handleSubmit}
            className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600"
          >
            {isRegistering
              ? (language === "en" ? "Register & View Waiting Time" : "பதிவு செய்து காத்திருப்பு நேரம் காண்க")
              : (language === "en" ? "Submit" : "சமர்ப்பிக்கவும்")}
          </button>

          {/* Message Box */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === "success" ? "bg-green-100 text-green-900" :
                message.type === "info" ? "bg-blue-100 text-blue-900" :
                "bg-red-100 text-red-900"
              }`}
              style={{
                borderLeft: `4px solid ${
                  message.type === "success" ? "#16a34a" :
                  message.type === "info" ? "#2563eb" :
                  "#dc2626"
                }`
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
              />
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
      `}</style>
    </div>
  );
}
