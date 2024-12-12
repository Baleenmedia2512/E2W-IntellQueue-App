"use client"
import { useEffect, useState } from "react";
import { api } from "@/app/api/FetchAPI";
import { FiPhoneCall } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { setStagesFromServer } from "@/redux/features/stage-slice";

export default function manageQuotes() {
  const [data, setData] = useState([]); // Holds the fetched data
  const [loading, setLoading] = useState(true); // Loading state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filteredData, setFilteredData] = useState([]); // Holds the filtered data
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchData() {
    if (loading && !hasMore) return;
  
    setLoading(true);
    try {
      const response = await api.get("FetchQuoteItems.php/get", {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        params: {
          JsonDBName: "Baleen Media",
          page,
          limit: 10, // Set the limit explicitly for pagination
        },
      });
  
      const result = response.data;
  
      if (!Array.isArray(result)) {
        throw new Error("Unexpected response format");
      }
  
      if (result.length < 10) {
        setHasMore(false); // No more data to load
      }
  
      setData((prevData) => [...prevData, ...result]); // Append new data
    } catch (error) {
      console.error("Error fetching data:", error); // Detailed error logging
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }   

//   if (loading) {
//     return <div>Loading...</div>; // Show loading indicator
//   }

  useEffect(() => {
    fetchData(); // Fetch initial data
  }, [page]);

  useEffect(() => {
    if(searchQuery === ""){
        setFilteredData(data);
      }
  },[searchQuery, data])
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      setPage((prevPage) => prevPage + 1); // Load next page
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filterData = (e) => {
    var filterValue = e.target.value;
    setSearchQuery(filterValue);
    filterValue = filterValue.toLowerCase()

    // Filter logic
    const filtered = data.filter((item) =>
      [
        item.ClientContact?.toString() || "", // Client Number
        item.QuoteID?.toString() || "", // Quote Number
        item.ClientName?.toLowerCase() || "", // Client Name
        item.Admedium?.toLowerCase() || "", // Medium
        item.AdType?.toLowerCase() || "", // Type
        item.Adcategory?.toLowerCase() || "", // Category
      ].some((field) => field.includes(filterValue)) // Check if any field contains the filterValue
    );

    setFilteredData(filtered);
  };

  return (
    <div className="p-4 text-black">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 sticky top-0 left-0 right-0 z-10 bg-white p-3">
        <h2 className="text-xl font-semibold text-blue-500">Quote Manager</h2>
      </div>

      <div className='mx-[8%] my-4'>
                <div className="flex items-center w-full border rounded-lg border-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-300">
              <input
          className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:shadow-outline border-0`}
          // className="p-2 glass text-black shadow-2xl w-64 focus:border-solid focus:border-[1px] border-[#b7e0a5] border-[1px] rounded-md mr-3 max-h-10"
          type="text"
          id="RateSearchInput"
          // name='RateSearchInput'
          placeholder="Ex: Saro 3 Months"
          value={searchQuery}
          onChange = {filterData}
          onFocus={(e) => {e.target.select()}}
        /><div className="px-3">
        <FontAwesomeIcon icon={faSearch} className="text-blue-500 " />
      </div></div></div>
      
      {/* Lead Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredData.map((row, index) => (
          <div
            key={index}
            className="relative bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-lg hover:-translate-y-2 hover:transition-all"
            style={{ minHeight: "240px" }}
          >

            {/* Admedium Label - Top Left */}
            <div className="absolute top-2 left-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 shadow-sm">
                    {row.Admedium || "Admedium"}
                </span>
            </div>

            {/* Status */}
            <div className="absolute top-2 right-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-700">
                QNo: {row.QuoteID} - {row.Source || "Unknown"}
              </span>
            </div>

            {/* Client Name and Ad Info */}
            <div className="mb-2 mt-8 text-gray-700 text-sm">
              <h3 className="text-lg font-bold text-gray-900">
                {row.ClientName || "No Name"}
              </h3>
              <p className="text-sm text-gray-700">
                <strong>Type:</strong> {row.AdType}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Category:</strong> {row.Adcategory}
              </p>
              
              <p>
                <strong>Amount:</strong> ₹{row.Amount}
              </p>
              {row.ClientContact !== 0 && 
              <p >
                <strong>Phone:</strong> 
                <a
                  href={`tel:${row.Phone}`}
                  className="text-blue-600 hover:underline ml-1"
                >{row.ClientContact}</a>
                <button
                  className="text-blue-500 rounded-full hover:text-blue-700 p-1.5"
                  onClick={() => window.location.href = `tel:${row.ClientContact}`}
                  title="Call"
                >
                  <FiPhoneCall className="text-md " />
                </button>
              </p>}
              <p className="text-sm text-gray-600">
                <strong>Lead Days:</strong> {row.LeadDays || "N/A"}
              </p>
              <p className="bg-green-200 hover:bg-green-300 text-green-900 px-2 py-1 mt-2 text-[14px] rounded-lg cursor-pointer w-fit ">
                <strong>Follow-Up On:</strong> {row.NextFollowupDate || "N/A"}
              </p>
            </div>
            {/* Action Buttons - Bottom */}
        <div className="absolute bottom-2 right-2 flex gap-2">
        <button
            className="bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-md hover:bg-red-600 transition-all"
            onClick={() => console.log("Dropped clicked for:", row.ClientName)}
          >
            Dropped
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm shadow-md hover:bg-green-600 transition-all"
            onClick={() => console.log("Won clicked for:", row.ClientName)}
          >
            Won
          </button>
        </div>
          </div>
        ))}
      </div>
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more data to load</p>}
    </div>
  );
}