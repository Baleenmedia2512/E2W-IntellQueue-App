"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import RatesAdMediumPage from "./page";

const RatesAdTypePage = () => {
  const [datas, setDatas] = useState([]);
  const [showRatesEditionPage, setShowRatesEditionPage] = useState(false);
  const [selectedRatesTypeofAd, setSelectedRatesTypeofAd] = useState(null);
  const [selectedRatesAdType, setSelectedRatesAdType] = useState(null);
  const routers = useRouter();
  const [showRatesAdMediumPage, setShowRatesAdMediumPage] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [newAdType, setNewAdType] = useState("");
  const [newTypeOfAd, setNewTypeOfAd] = useState("");

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    const username = Cookies.get("username");

    // if(Cookies.get('adtype')){
    //   setCat(true)
    //   } else{
    //     setCat(false)
    //   }
    if (!username) {
      routers.push("/login");
    } else {
      fetch("https://www.orders.baleenmedia.com/API/Media/FetchRates.php")
        .then((response) => response.json())
        .then((data) => setDatas(data))
        .catch((error) => console.error(error));
    }
  }, []);

  const handleAddNewOption = () => {
    setShowTextBox(true);
  };

  const handleTextBoxChange = (e) => {
    if (selectedRatesTypeofAd) {
      setNewAdType(e.target.value);
    } else {
      setNewTypeOfAd(e.target.value);
    }
  };

  const createNewTypes = () => {
    if (!selectedRatesTypeofAd) {
      if (newTypeOfAd.trim() !== "") {
        const dataIndex = datas.findIndex(data => data.rateName === Cookies.get("ratesratename"));

        // Create a copy of the datas array
        const updatedDatas = [...datas];
  
        // If the rateName exists in datas, update the typeOfAd field
        if (dataIndex !== -1) {
          updatedDatas[dataIndex] = {
            ...updatedDatas[dataIndex],
            typeOfAd: newTypeOfAd
          };
        }
        setDatas(updatedDatas);
        setShowTextBox(false);
        setNewTypeOfAd(""); 
      }
    } else {
      if (newAdType.trim() !== "") {
        const newRatesAdType = { adType: newAdType };
        console.log(newAdType,"rr",newRatesAdType,datas);
        setDatas([...datas, newRatesAdType]);
        setShowTextBox(false);
        setNewAdType("");
      }
    }
  };
  const filteredTypeofAd = datas
    .filter((item) => item.rateName === Cookies.get("ratesratename"))
    .filter(
      (value, index, self) =>
        self.findIndex((obj) => obj.typeOfAd === value.typeOfAd) === index
    )
    .sort((a, b) => a.typeOfAd.localeCompare(b.typeOfAd));

  const filteredRatesAdType = datas
    .filter(
      (value, index, self) =>
        self.findIndex((obj) => obj.adType === value.adType) === index
    )
    .sort((a, b) => a.adType.localeCompare(b.adType));

  const searchedRatesTypeofAD = filteredTypeofAd.filter((optionn) =>
    optionn.adType.toLowerCase().includes(searchInput.toLowerCase())
  );

  const moveToPreviousPage = (adMedium) => {
    if (adMedium) {
      Cookies.remove('ratesratename');
      Cookies.remove('ratestypeofad');
      setShowRatesAdMediumPage(true)
    } else {
      Cookies.remove('ratesadtype');
      Cookies.remove('selectedratestypeofad');
      setShowTextBox(false);
      setSelectedRatesTypeofAd(null)
    }
  };
  const searchedRatesAdType = filteredRatesAdType.filter((optionn) =>
    optionn.adType.toLowerCase().includes(searchInput.toLowerCase())
  );
  useEffect(() => {
    if (Cookies.get('selectedratestypeofad')) {
      const selected = JSON.parse(Cookies.get('selectedratestypeofad'))
      setSelectedRatesTypeofAd(selected);
    }
  }, [filteredTypeofAd]);

  const greater = ">>";
  return (
    <div>
      {/* {showRatesEditionPage && (<AdCategoryPage />)} */}
      {showRatesAdMediumPage && <RatesAdMediumPage />}
      {!showRatesEditionPage && !showRatesAdMediumPage && (
        <div>
          <div className="flex flex-row justify-between mx-[8%] mt-8">
            <>
              <h1 className="font-semibold">
                <button
                  className="hover:transform hover:scale-110 transition-transform duration-300 ease-in-out mr-8"
                  onClick={() => {
                    moveToPreviousPage(!selectedRatesTypeofAd);
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />{" "}
                </button>
                {Cookies.get("ratesratename")}
              </h1>
              <button
                className=" px-2 py-1 rounded text-center"
                onClick={() => { }}
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
          {/* <h1 className='mx-[8%] mb-8 font-semibold'>Select any one</h1> */}
          <br />

          <h1 className="text-2xl font-bold text-center  mb-4">
            Select AD {!selectedRatesTypeofAd ? "Type" : "Category"}
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
          <div>
            {!selectedRatesTypeofAd ? (
              <div className="flex flex-col mx-[8%]">
                {!showTextBox ? (
                  <label
                    className="flex flex-row items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500"
                    onClick={() => { handleAddNewOption(); }}
                  >
                    <div className="text-lg font-bold text-black flex space-x-10">
                      Add New
                    </div>
                    <div className="flex space-x-10">
                      {/* Plus icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className=" ml-6 h-6 w-6"
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

                  </label>) :
                  (<label
                    className="relative flex flex-row items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500"
                  >
                    <input
                      className="w-1/3 border text-black border-purple-400 p-2 rounded-lg focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
                      type="text"
                      placeholder="Add New"
                      value={newTypeOfAd}
                      onChange={handleTextBoxChange}
                    />
                    <button
                      className="ml-4 flex items-center justify-center mouse-pointer"
                      onClick={createNewTypes}
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
                    <button
                      className="absolute right-0 mr-4 flex items-center justify-center mouse-pointer"
                      onClick={() => setShowTextBox(false)} // Set showTextBox to false when the cancel button is clicked
                    >
                      {/* Cancel icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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

                  </label>

                  )}

                {searchedRatesTypeofAD.map((optionss) => (
                  <label
                    key={optionss.typeOfAd}
                    className="flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 "
                    onClick={() => {
                      {
                        Cookies.set("ratestypeofad", optionss.typeOfAd);
                        //   Cookies.set('ratesadtype', optionss.adType)
                        setSelectedRatesTypeofAd(optionss);
                        setShowTextBox(false);
                        Cookies.set("selectedratestypeofad", JSON.stringify(optionss));
                      }
                    }}
                  >
                    <div className="text-lg font-bold flex items-center justify-center">
                      {optionss.typeOfAd}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <ul className="flex flex-col items-center mx-[8%]">
                {!showTextBox ? (
                  <label
                    className="flex flex-row items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500"
                    onClick={() => { handleAddNewOption(); }}
                  >
                    <div className="text-lg font-bold text-black flex space-x-10">
                      Add New
                    </div>
                    <div className="flex space-x-10">
                      {/* Plus icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className=" ml-6 h-6 w-6"
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

                  </label>) :
                  (<label
                    className="relative flex flex-row items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500"
                  >
                    <input
                      className="w-1/3 border text-black border-purple-400 p-2 rounded-lg focus:outline-none focus:border-purple-600 focus:ring focus:ring-purple-200"
                      type="text"
                      placeholder="Add New"
                      value={newAdType}
                      onChange={handleTextBoxChange}
                    />
                    <button
                      className="ml-4 flex items-center justify-center mouse-pointer"
                      onClick={createNewTypes}
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
                    <button
                      className="absolute right-0 mr-4 flex items-center justify-center mouse-pointer"
                      onClick={() => setShowTextBox(false)} // Set showTextBox to false when the cancel button is clicked
                    >
                      {/* Cancel icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
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

                  </label>

                  )}

                {searchedRatesAdType
                  .filter(
                    (item) => item.typeOfAd === selectedRatesTypeofAd.typeOfAd
                  )
                  .map((option) => (
                    <label
                      key={option.adType}
                      className="flex flex-col items-center justify-center w-full h-16 border mb-4 cursor-pointer transition duration-300 rounded-lg border-gray-300 text-black bg-gradient-to-r from-blue-300  to-blue-500 hover:bg-gradient-to-r hover:from-purple-500 "
                      onClick={() => {
                        // Cookies.set('ratestypeofad', option.typeOfAd)
                        Cookies.set("ratesadtype", option.adType);
                        setSelectedRatesAdType(option);
                        setShowRatesEditionPage(true);
                      }}
                    >
                      <div className="text-lg font-bold flex items-center justify-center">
                        {option.adType}
                      </div>
                    </label>
                  ))}
              </ul>
            )
              // :(setShowRatesEditionPage(true)
              //   Cookies.set('typeofad', selectedRatesTypeofAd.typeOfAd),
              //   Cookies.set('adtype', selectedRatesTypeofAd.adType)
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default RatesAdTypePage;
