'use client'
import { FaFileExcel, FaFilter } from "react-icons/fa";
import { statusColors } from "../page";
import { FetchActiveCSE, FetchExistingLeads } from "@/app/api/FetchAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FiCheckCircle, FiPhoneCall, FiCalendar } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { PostInsertOrUpdate } from "@/app/api/InsertUpdateAPI";
import { AiOutlineClose } from "react-icons/ai";
import DatePicker from "react-datepicker";

export default function ExistingClientToLeads() {
    const [isLoading, setIsLoading] = useState(false);
    const [leadData, setLeadData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false)
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("Available");
    const [followupDate, setFollowupDate] = useState("");
    const [followupTime, setFollowupTime] = useState("");
    const [currentLead, setCurrentLead] = useState(null);
    const [notInterestedReason, setNotInterestedReason] = useState("");
    const [isHandledByChange, setIsHandledByChange] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [CSENames, setCSENames] = useState([]);
    const {userName, appRights, companyName: UserCompanyName} = useAppSelector(state => state.authSlice);
    const filteredRows = leadData;

    const handleViewMore = (orderNumber) => {
      setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber);
    };

    const FetchLeads = async() => {
      let response = await FetchExistingLeads(UserCompanyName, searchTerm);
      setLeadData(response);
      fetchCSENames();
    }

    useEffect(()=>{
      FetchLeads();
    },[searchTerm])
    
    const fetchCSENames = async () => {
      let data = await FetchActiveCSE(UserCompanyName);
      setCSENames(data)
    };

    const handleHandledByChange = (user, sNo) => {
      setIsHandledByChange(!isHandledByChange);
      setSelectedUser(user);
      // setCurrentCall({sNo: sNo})
    }
  
    const handleUserChange = async(user) => {
      setSelectedUser(toTitleCase(user));
      console.log(user, currentCall.sNo)
      await handleSave(currentCall?.sNo, 'No', "Handled By", user);
      setIsHandledByChange(false);
    }

    const handleDateChange = (selectedDate) => {
      // Format date as dd-MMM-yyyy
      const date = selectedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }); // Example: 02-Dec-2024
  
      // Format time as hh:mm AM/PM
      const time = selectedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }); // Example: 03:30 PM
  
      setFollowupDate(date); // Set the date
      setFollowupTime(time); // Set the time
    };

    function toTitleCase(str) {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    const handleSave = async () => {
      const formData = {
        "JsonDBName": UserCompanyName,
        "JsonEntryUser": userName,
        "JsonLeadDate": "2023-10-15",
        "JsonLeadTime": "14:30",
        "JsonPlatform": "Website",
        "JsonClientName": "Jane Smith",
        "JsonClientContact": "1234567890",
        "JsonClientEmail": "jane@example.com",
        "JsonDescription": "Interested in product X",
        "JsonStatus": "New",
        "JsonRejectionReason": "",
        "JsonLeadType": "Hot",
        "JsonPreviousStatus": "",
        "JsonNextFollowupDate": "2023-10-20",
        "JsonNextFollowupTime": "10:00",
        "JsonClientCompanyName": "Example Corp",
        "JsonRemarks": "Follow up scheduled",
        "JsonHandledBy": "Sales Team",
        "JsonProspectType": "Potential",
        "JsonIsUnreachable": 0
      }
    };

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
  {/* Top Bar with Filter and Report Buttons */}
  <div className="flex justify-between items-center mb-6 sticky top-0 left-0 right-0 z-10 bg-white p-4 shadow-sm">
    <h2 className="text-2xl font-bold text-blue-600">Lead Manager</h2>
    <div className="flex space-x-4">
      {/* Sheet Button */}
      <button
        className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 hover:shadow-md transition-all duration-200"
        onClick={() => window.open("https://docs.google.com/spreadsheets/d/19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw/", "_blank")}
      >
        <FaFileExcel className="mr-2 text-lg" />
        Sheet
      </button>
    </div>
  </div>

  {/* Search Bar */}
  <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
    <div className="flex items-center justify-between">
      <input
        type="text"
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        placeholder="Search by Client Name, Phone No, Email Address, Ad Medium, Company Name, Remarks..."
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
        className="ml-3 p-3 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600 transition-all duration-200"
      >
        <FaFilter size={20} />
      </button>
    </div>
  </div>

  {/* Lead Cards */}
  {filteredRows.length === 0 ? (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-500 text-lg">No data found.</div>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredRows.map((row) => (
        <div
          key={row.OrderNumber}
          className="relative bg-white rounded-lg p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          style={{ minHeight: "240px" }}
        >
          {/* Status at Top Right */}
          <div className="absolute top-4 right-4">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedStatus]} hover:cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              onClick={() => { setCurrentLead(row); setShowModal(true) }}
            >
              {selectedStatus}
            </span>
            {row.CSE && (
              <div
                className="text-xs mt-2 p-1 px-3 hover:cursor-pointer text-orange-800 bg-orange-50 rounded-full flex items-center"
                onClick={() => handleHandledByChange(row.CSE, row.OrderNumber)}
              >
                <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                <p>{toTitleCase(row.CSE)}</p>
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="mb-4 mt-8">
            <h3 className="text-xl font-bold text-gray-900 max-w-[75%] capitalize">
              {row.ClientName} - Order #{row.OrderNumber}
            </h3>
          </div>

          {/* Core Details */}
          <div className="text-sm text-gray-700 mb-4 gap-2 space-y-2">
            <p>Client Contact: <strong>{row.ClientAuthorizedPerson}</strong></p>
            <p>Source: <strong>{row.Source}</strong></p>
            <p>Phone:
              <a
                onClick={() => window.location.href = `tel:${row.ClientContact}`}
                className="text-blue-600 hover:underline ml-1 cursor-pointer"
              >
                <strong>{row.ClientContact}</strong>
              </a>
            </p>
          </div>

          {/* View More Button */}
          <button
            onClick={() => handleViewMore(row.OrderNumber)}
            className="mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full text-center transition-all duration-200"
          >
            {expandedOrder === row.OrderNumber ? "View Less" : "View More"}
          </button>

          {/* Expanded Order Details */}
          {expandedOrder === row.OrderNumber && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ad Details</h3>
              <div className="space-y-3 text-gray-700">
              <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Medium:</span>
                  <span className="text-gray-900 font-semibold">{row.Card}</span>
                </div>
                {row.AdCategory !== " : " && 
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Ad Category:</span>
                    <span className="text-gray-900 font-semibold">{row.AdCategory}</span>
                  </div>
                }
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Type:</span>
                  <span className="text-gray-900 font-semibold">{row.AdType}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Width:</span>
                  <span className="text-gray-900 font-semibold">{row.AdWidth}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Height:</span>
                  <span className="text-gray-900 font-semibold">{row.AdHeight}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">First Release:</span>
                  <span className="text-gray-900 font-semibold">{row.DateOfFirstRelease}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Release:</span>
                  <span className="text-gray-900 font-semibold">{row.DateOfLastRelease}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

{isHandledByChange && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg w-auto max-w-md mb-16 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Change who can Handle the lead</h3>
              <button onClick={() => {setIsHandledByChange(false)}}>
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            
            {/* Floating Radio Buttons for Status */}
            
            <div className="mb-4 flex flex-wrap gap-1 justify-center">
              {CSENames.map(
                (user) => (
                  <label
                    key={user.username}
                    className={`cursor-pointer border py-1 px-3 text-sm rounded-full ${
                      selectedUser === toTitleCase(user.username) ? "bg-blue-500 text-white" : "bg-transparent border border-gray-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user.username}
                   
                      checked={selectedUser === user.username}
                      onChange={() => handleUserChange(user.username)}
                      className="hidden"
                    />
                    {toTitleCase(user.username)}
                  </label>
                ))}
            </div>
            
            </div>
            </div>
            )}
  {/* Modal */}
  {showModal && currentLead && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Lead Details</h3>
        <button onClick={() => setShowModal(false)}>
          <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
        </button>
      </div>
      <div className="space-y-4 text-gray-700">
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
  
        {/* Status Options */}
        <div className="flex flex-wrap gap-2">
          {["Available", "Ready for Quote", "Call Followup", "Not Interested"].map(
            (status) => (
              <label
                key={status}
                className={`cursor-pointer border-2 py-1 px-3 text-sm rounded-full ${
                  selectedStatus === status ? "bg-blue-500 text-white border-blue-500" : "bg-transparent border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                  className="hidden"
                />
                {status}
              </label>
            ))}
        </div>
  
        {/* Not Interested Reason Dropdown */}
        {selectedStatus === "Not Interested" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Not Interested Reason</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              onChange={(e) => setNotInterestedReason(e.target.value)}
            >
              <option value="" disabled selected>Select a reason</option>
              {[
                "Not required at the moment",
                "Not Reachable",
                "Ringing No Response",
                "Invalid Phone Number",
                "Don't Call Again - Service was not good",
                "Don't Call Again - Poor Ad Response",
                "Don't Call Again - Customer has behavioural Issues",
                "Don't Call Again - Customer will call in case of any need",
              ].map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}
  
        {/* Followup Date and Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Followup Date and Time</label>
          <DatePicker
            selected={followupDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="h:mm aa"
            timeIntervals={15}
            dateFormat="dd MMM yyyy h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            className={`px-4 py-2 rounded-md text-white ${
              isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            } transition-all duration-200`}
            onClick={handleSave}
            disabled={!selectedStatus || isLoading}
          >
            {isLoading ? "Loading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  </div>
  )}
</div>
    );
  };