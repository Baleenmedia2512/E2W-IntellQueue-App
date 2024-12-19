"use client"
import { useEffect, useState } from "react";
import { api } from "@/app/api/FetchAPI";
import { FiPhoneCall } from "react-icons/fi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FiCheck, FiX, FiPhone, FiCalendar, FiUser, FiDatabase, FiTag } from "react-icons/fi";

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
      
      console.log(result)
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

  const winQuote = async(QuoteData) => {
    
  }

  return (
    <div className="p-4 text-black font-montserrat ">
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
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 3xl:grid-cols-3 auto-rows-fr">
  {filteredData.map((row, index) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Client Details Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {row.ClientName}
            </h2>
            <div className="space-y-2">
              {row.ClientContact !== 0 && (
                <a href={`tel:${row.ClientContact}`}>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-blue-500" />
                    {row.ClientContact}
                  </p>
                </a>
              )}
              <p className="flex items-center gap-2 text-gray-600">
                <FiDatabase className="text-blue-500" />
                Source: {row.Source}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FiTag className="text-blue-500" />
                Leads Days: {row.LeadDays}
              </p>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar className="text-blue-500" />
                <input
                  type="date"
                  value={row.NextFollowupDate}
                  className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden border-l border-gray-300"></div>

          {/* Quote Details Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Quote Details</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                Quote No: <span className="font-medium">{row.QuoteID}</span>
              </p>
              <p className="text-gray-600">
                Medium: <span className="font-medium">{row.Admedium}</span>
              </p>
              <p className="text-gray-600">
                Type: <span className="font-medium">{row.AdType}</span>
              </p>
              <p className="text-gray-600">
                Category: <span className="font-medium">{row.Adcategory}</span>
              </p>
              <p className="text-gray-600">
                Amount:{" "}
                <span className="font-medium text-green-600">
                  ₹{row.Amount}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 flex gap-4 justify-end mt-auto">
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          <FiCheck className="text-lg" />
          Win Quote
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          <FiX className="text-lg" />
          Drop Quote
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