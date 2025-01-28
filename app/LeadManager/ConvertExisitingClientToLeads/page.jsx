'use client'
import { FaFileExcel, FaFilter } from "react-icons/fa";
import { statusColors } from "../page";
import { FetchExistingLeads } from "@/app/api/FetchAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FiCheckCircle, FiPhoneCall, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { AiOutlineClose } from "react-icons/ai";
import DatePicker from "react-datepicker";

export default function ExistingClientToLeads() {
    const [isLoading, setIsLoading] = useState(false);
    const [leadData, setLeadData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [currentLead, setCurrentLead] = useState(null);
    const {userName, appRights, companyName: UserCompanyName} = useAppSelector(state => state.authSlice);
    const filteredRows = leadData;

    const handleViewMore = (orderNumber) => {
      setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber);
    };

    const FetchLeads = async() => {
      let response = await FetchExistingLeads(UserCompanyName, searchTerm);
      setLeadData(response)
    }

    useEffect(()=>{
      FetchLeads();
    },[searchTerm])
    
    return (
      <div className="p-4 text-black">
        {/* Top Bar with Filter and Report Buttons */}
        <div className="flex justify-between items-center mb-4 sticky top-0 left-0 right-0 z-10 bg-white p-3">
          <h2 className="text-xl font-semibold text-blue-500">Lead Manager</h2>
          <div className="flex space-x-4">
            {/* Sheet Button */}
            <button
              className="flex items-center px-4 py-2 bg-transparent text-green-600 rounded-md border border-green-500 hover:bg-green-100"
              onClick={() => window.open("https://docs.google.com/spreadsheets/d/19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw/", "_blank")}
            >
              <FaFileExcel className="mr-2 text-lg hover:text-green-500 text-green-600" />
              Sheet
            </button>
          </div>
        </div>
  
        {/* Search Bar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by Phone No, Email Address, Ad Enquiry, Company Name, Remarks..."
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button
              onClick={() => {
                if (statusFilter !== 'All' || prospectTypeFilter !== 'All' || fromDate || toDate) {
                  clearFilters();
                } else {
                  toggleFilters();
                }
              }}
              className="ml-2 p-2 sm:p-3 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600"
            >
              <FaFilter size={20} />
            </button>
          </div>
        </div>
  
        {/* Lead Cards */}
        {filteredRows.length === 0 ? (
          <div className="flex items-start justify-center h-screen">
            <div className="text-center pt-20">No data found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((row) => (
              <div
                key={row.OrderNumber}
                className="relative bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-lg hover:-translate-y-2 hover:transition-all"
                style={{ minHeight: "240px" }}
              >
                {/* Status at Top Right */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors["Available"]} hover:cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:transition-all`}
                    onClick={() => {setCurrentLead(row); setShowModal(true)}}
                  >
                    Available
                  </span>
                  {row.CSE && (
                    <div 
                      className="text-xs mt-2 p-1 sm:mb-2 justify-start px-3 hover:cursor-pointer text-orange-800 bg-orange-100 rounded-full flex flex-row"
                    >
                      <FontAwesomeIcon icon={faUserCircle} className="mr-1 mt-[0.1rem]"/>
                      <p className="font-poppins">{row.CSE}</p>
                    </div>
                  )}
                </div>
  
                {/* Order Details */}
                <div className="mb-2 mt-8">
                  <h3 className="text-lg font-bold text-gray-900 max-w-[75%] capitalize">
                    {row.ClientName} - Order #{row.OrderNumber}
                  </h3>
                </div>
  
                {/* Core Details */}
                <div className="text-sm text-gray-700 mb-2">
                  <p>Client Contact: <strong>{row.ClientAuthorizedPerson}</strong></p>
                  <p>Source: <strong>{row.Source}</strong></p>
                  <p>Phone: 
                    <a
                      onClick={() => window.location.href = `tel:${row.ClientCo}`}
                      className="text-blue-600 hover:underline ml-1 cursor-pointer"
                    >
                      <strong>{row.ClientContact}</strong>
                    </a>
                  </p>
                </div>
  
                {/* View More Button */}
                <button
                  onClick={() => handleViewMore(row.OrderNumber)}
                  className="mt-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full text-center"
                >
                  {expandedOrder === row.OrderNumber ? "View Less" : "View More"}
                </button>
  
                {/* Expanded Order Details */}
                {expandedOrder === row.OrderNumber && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p>Ad Category: <strong>{row.AdCategory}</strong></p>
                    <p>Ad Type: <strong>{row.AdType}</strong></p>
                    <p>Ad Width: <strong>{row.AdWidth}</strong></p>
                    <p>Ad Height: <strong>{row.AdHeight}</strong></p>
                    <p>Position: <strong>{row.Position}</strong></p>
                    <p>First Release: <strong>{row.DateOfFirstRelease}</strong></p>
                    <p>Last Release: <strong>{row.DateOfLastRelease}</strong></p>
                  </div>
                )}
              </div>
            ))}
            {showModal && currentLead && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg w-auto max-w-md mb-16 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Lead Details</h3>
              <button onClick={() => setShowModal(false)}>
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            <p>Client: <strong>{currentLead.ClientName}</strong></p>
            <p>Source: <strong>{currentLead.Source}</strong></p>
            <p>Phone: 
              <a
                onClick={() => handleCallButtonClick(currentLead.ClientContact, currentLead.ClientName, currentLead.OrderNumber)}
                className="text-blue-600 hover:underline ml-1 cursor-pointer"
              >
                <strong>{currentLead.ClientContact}</strong>
              </a>
            </p>
            <div className="mb-4 flex flex-wrap gap-1 justify-center mt-2">
              {["Available", "Call Followup", "Won", "Unreachable", "Unqualified", "Lost"].map(
                (status) => (
                  <label
                    key={status}
                    className={`cursor-pointer border-2 py-1 px-3 text-sm rounded-full bg-transparent border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      // checked={selectedStatus === status}
                      // onChange={() => setSelectedStatus(status)}
                      className="hidden"
                    />
                    {status}
                  </label>
                ))}
            </div>
            <div className="mb-4">
                <label className="block text-black text-sm font-bold mb-2">
                  Followup Date and Time
                </label>
                <DatePicker
                  // selected={
                  //   followupDate
                  //     ? new Date(`${followupDate} ${followupTime}`) // If a date is selected, use it
                  //     : selectedStatus === "Unreachable" // Only for "Unreachable"
                  //     ? new Date(new Date().getTime() + 60 * 60 * 1000) // Set time 1 hour ahead
                  //     : selectedStatus === "Call Followup" // For "Call Followup", set the date to tomorrow
                  //     ? new Date(new Date().setDate(new Date().getDate() + 1)) // Set to tomorrow
                  //     : new Date() // For other statuses, default to the current date
                  // }
                  // onChange={handleDateChange}
                  showTimeSelect
                  timeFormat="h:mm aa" // Sets the format for time (12-hour format with AM/PM)
                  timeIntervals={15} // Time interval options (15 minutes in this case)
                  timeCaption="Time" // Caption for time section
                  dateFormat="dd MMM yyyy h:mm aa" // Displays date and time together
                  className="border border-gray-300 p-2 rounded-md w-full"
                  calendarClassName="bg-white border border-gray-200 rounded-md"
                />
              </div>
            <div className="flex justify-end">
            <button
              className={`px-4 py-2 rounded-md text-white ${
                isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
              // onClick={handleSave}
              // disabled={!selectedStatus || isLoading} // Disable button during loading..
            >
              {isLoading ? (
                <span>Loading...</span> // Change text when loading
              ) : (
                "Save"
              )}
            </button>
          </div>
          </div>
        </div>
      )}
          </div>
        )}
      </div>
    );
  };