"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";
import RatesAdTypePage from "./RatesAdTypePage";

export const RatesAdMediumPage = () => {
  const [selectedRatesAdMedium, setSelectedRatesAdMedium] = useState("");
  const [datas, setDatas] = useState([]);
  const [showRatesTypePage, setShowRatesTypePage] = useState(false);
  const routers = useRouter();
  const [showTextBox, setShowTextBox] = useState(false);
  const [newRateName, setNewRateName] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const datasOptions = datas
    .filter(
      (value, index, self) =>
        self.findIndex((obj) => obj.rateName === value.rateName) === index
    )
    .sort((a, b) => a.rateName.localeCompare(b.rateName));

  // Filtered options based on the search input
  const searchedOptions = datasOptions.filter((option) =>
    option.rateName.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleAddNewOption = () => {
    setShowTextBox(true);
  };

  const handleTextBoxChange = (e) => {
    setNewRateName(e.target.value);
  };

  const handleCreateOption = () => {
    if (newRateName.trim() !== "") {
      const newAdMedium = { rateName: newRateName };
      setDatas([...datas, newAdMedium]);
      setShowTextBox(false);
      setNewRateName("");
    }
  };

  const icons = (iconValue) => {
    if (iconValue === "Automobile") {
      return (
        <Image
          src="/images/school-bus.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Newspaper") {
      return (
        <Image
          src="/images/newspaper.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Print Services") {
      return (
        <Image
          src="/images/printer.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Production") {
      return (
        <Image
          src="/images/smart-tv.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Radio Ads") {
      return (
        <Image src="/images/radio.png" alt="car Icon" width={60} height={60} />
      );
    } else if (iconValue === "Road Side") {
      return (
        <Image
          src="/images/road-map.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Screen Branding") {
      return (
        <Image
          src="/images/branding.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    } else if (iconValue === "Test") {
      return (
        <Image src="/images/test.png" alt="car Icon" width={60} height={60} />
      );
    } else if (iconValue === "TV") {
      return (
        <Image
          src="/images/tv-monitor.png"
          alt="car Icon"
          width={60}
          height={60}
        />
      );
    }
  };

  useEffect(() => {
    const username = Cookies.get("username");

    if (Cookies.get("ratesratename")) {
        // setShowRatesTypePage(true)
    }

    if (!username) {
      routers.push("/login");
    } else {
      fetch("https://www.orders.baleenmedia.com/API/Media/FetchRates.php")
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, []);

  return (
    <div>
      {showRatesTypePage && (<RatesAdTypePage />)}
      {!showRatesTypePage && (
      <div>
        <div className="flex flex-row justify-between mx-[8%] mt-8">
          <>
            <button
              className="hover:scale-110 hover:text-orange-900"
              onClick={() => routers.push("../addenquiry")}
            >
              {" "}
              <FontAwesomeIcon icon={faArrowLeft} />{" "}
            </button>

            <button
              className="px-2 py-1 rounded text-center"
              onClick={() => {
                //   routers.push('../addenquiry')
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </>
        </div>

        <br />
        <h1 className="text-2xl font-bold text-center  mb-4">
          Select AD Medium
        </h1>
        <div className="mx-[8%] relative">
          <input
            className="w-full border border-purple-500 text-black p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-700 focus:ring focus:ring-purple-200"
            type="text"
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search"
          />
          <div className="absolute top-0 right-0 mt-2 mr-3">
            <FontAwesomeIcon icon={faSearch} className="text-purple-500" />
          </div>
        </div>
        <ul className="mx-[8%] justify-stretch grid gap-1 grid-cols-2 sm:grid-cols-2 lg:grid-cols-2">
          {showTextBox ? (
            <li>
              <label className="relative flex flex-row items-center justify-center hover:text-white w-full h-64 border cursor-pointer transition duration-300 rounded-lg hover:bg-purple-500 bg-blue-300">
                <button
                  className="absolute top-0 right-0 mt-1 mr-1 cursor-pointer"
                  onClick={() => {
                    setShowTextBox(false);
                    setNewRateName("");
                  }}
                >
                  {/* Cancel icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="mx-[8%] flex flex-row">
                  <input
                    className="w-full border text-black border-purple-400 p-2 rounded-lg mb-4 focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
                    type="text"
                    placeholder="Add New"
                    value={newRateName}
                    onChange={handleTextBoxChange}
                  />
                  <button
                    className="mb-4 flex items-center justify-center mouse-pointer"
                    onClick={handleCreateOption}
                  >
                    {/* Plus icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
              </label>
            </li>
          ) : (
            <li>
              <label
                key="ADDNEW"
                className="relative flex flex-col items-center justify-center px-[-10] hover:text-white w-full h-64 border cursor-pointer transition duration-300 rounded-lg hover:bg-purple-500 bg-blue-300"
                onClick={handleAddNewOption}
              >
                <div className="text-lg font-bold mb-2 text-black flex items-center justify-center">
                  Add New
                </div>
                <div className="mb-2 flex items-center justify-center">
                  {/* Plus icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </label>
            </li>
          )}
          {searchedOptions.map((option, index) => (
            <>
              {option.rateName !== "Newspaper" && (
                <label
                  key={option.rateName}
                  className={`relative flex flex-col items-center justify-center px-[-10] hover:text-white w-full h-64 border cursor-pointer transition duration-300 rounded-lg hover:bg-purple-500 ${
                    index === 0 || index % 4 === 2 || index % 4 === 1
                      ? " bg-gray-500 "
                      : " bg-blue-300"
                  }`}
                  //    htmlFor={`option-${option.id}`}
                  onClick={() => {
                    setSelectedRatesAdMedium(option.rateName);
                    Cookies.set("ratesratename", option.rateName);
                    setShowRatesTypePage(true);
                  }}
                >
                  <div className="text-lg font-bold mb-2 text-black flex items-center justify-center">
                    {option.rateName}
                  </div>
                  <div className="mb-2 flex items-center justify-center">
                    {icons(option.rateName)}
                  </div>
                </label>
              )}
            </>
          ))}
        </ul>
      </div>
      )} 
    </div>
  );
};
export default RatesAdMediumPage;
