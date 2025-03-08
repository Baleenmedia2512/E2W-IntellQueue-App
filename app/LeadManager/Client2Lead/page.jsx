"use client";
import { FaDownload, FaFilter } from "react-icons/fa";
import { statusColors } from "../page";
import {
  FetchActiveCSE,
  FetchExistingLeads,
  FetchLeadsData,
} from "@/app/api/FetchAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FiPhoneCall } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import {
  GetInsertOrUpdate,
  PostInsertOrUpdate,
} from "@/app/api/InsertUpdateAPI";
import { AiOutlineClose } from "react-icons/ai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import SuccessToast from "@/app/components/SuccessToast";
import { formatDBDateTime } from "@/app/utils/commonFunctions";
import { useRouter } from "next/navigation";

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

let initialCurrentUpdate = {
  EnquiryDescription: "",
  Status: "Convert",
  RejectionReason: "",
  NextFollowupDate: tomorrow,
  Remarks: "",
  HandledBy: "",
  ProspectType: "",
  IsUnreachable: 0,
  selectedUser: "",
};
export default function ExistingClientToLeads() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [leadData, setLeadData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showExpandedModal, setShowExpandedModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [isHandledByChange, setIsHandledByChange] = useState(false);
  const [CSENames, setCSENames] = useState([]);
  // Combined state for lead update fields
  const [currentUpdate, setCurrentUpdate] = useState(initialCurrentUpdate);
  const [currentCall, setCurrentCall] = useState(null);

  // Combined filter state
  const [filters, setFilters] = useState({
    statusFilter: "All",
    prospectTypeFilter: "All",
    fromDate: null,
    toDate: null,
    showFilters: false,
  });

  const updateFilter = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const toggleFilters = () => {
    setFilters((prev) => ({ ...prev, showFilters: !prev.showFilters }));
  };

  const clearFilters = () => {
    setFilters({
      statusFilter: "All",
      prospectTypeFilter: "All",
      fromDate: null,
      toDate: null,
      showFilters: false,
    });
  };

  const {
    userName,
    appRights,
    companyName: UserCompanyName,
  } = useAppSelector((state) => state.authSlice);
  const filteredRows = leadData; // Add additional filtering logic if needed

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const FetchLeads = async () => {
    let response = await FetchExistingLeads(UserCompanyName, searchTerm);
    let data = await FetchLeadsData(UserCompanyName, searchTerm);
    let allLeads = data.concat(response);
    setLeadData(allLeads);
    fetchCSENames();
  };

  useEffect(() => {
    if (!userName) {
      router.push("/login");
      return;
    }
    FetchLeads();
  }, [searchTerm]);

  const fetchCSENames = async () => {
    let data = await FetchActiveCSE(UserCompanyName);
    setCSENames(data);
  };

  // const handleHandledByChange = (user, sNo) => {
  //   setIsHandledByChange(true);
  //   setCurrentUpdate(prev => ({ ...prev, selectedUser: user }));
  //   setCurrentCall({ sNo: sNo });
  // };

  const handleUserChange = async (user) => {
    setCurrentUpdate((prev) => ({
      ...prev,
      selectedUser: toTitleCase(user),
      HandledBy: toTitleCase(user),
    }));
    await handleSave();
    setIsHandledByChange(false);
  };

  // Update the raw date object in currentUpdate
  const handleDateChange = (selectedDate) => {
    setCurrentUpdate((prev) => ({
      ...prev,
      NextFollowupDate: selectedDate,
    }));
  };

  function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const handleDownloadExcel = () => {
    if (filteredRows.length === 0) {
      alert("No data to download.");
      return;
    }

    const filteredData = filteredRows.map((row) => ({
      OrderNumber: row.OrderNumber,
      ClientName: row.ClientName,
      ClientAuthorizedPerson: row.ClientAuthorizedPerson,
      Source: row.Source,
      ClientContact: row.ClientContact,
      CSE: toTitleCase(row.CSE),
      DateOfLastRelease: row.DateOfLastRelease,
      Status: row.Status || "Convert",
    }));

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
    XLSX.writeFile(wb, "ExisitngClientLeads.xlsx");
  };

  const insertEnquiry = async () => {
    const row = currentLead;

    // Build your query parameters object
    const queryParams = {
      JsonUserName: toTitleCase(userName),
      JsonClientName: row.ClientName,
      JsonClientEmail: row.ClientAuthorizedPerson,
      JsonClientContact: row.ClientContact,
      JsonSource: row.Source || row.Platform,
      JsonDBName: UserCompanyName,
      JsonIsNewClient: false,
    };

    try {
      // Use the reusable GET function (endpoint without .php as it is appended inside the function)
      const data = await GetInsertOrUpdate("InsertNewEnquiry", queryParams);
      return data;
    } catch (error) {
      console.error(error);
      return error;
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    let currentDateTime = new Date().toISOString();
    let currentDate = currentDateTime.split("T")[0];
    let currentTime = currentDateTime.split("T")[1].split(".")[0];
    currentDateTime = currentDate + " " + currentTime;

    if ((currentLead?.Status || "Convert") === currentUpdate.Status) {
      alert("No changes made.");
      setIsLoading(false);
      return;
    }

    setShowModal(false);
    // Format the followup date and time if provided
    let formattedDate = "";
    let formattedTime = "";
    if (currentUpdate.NextFollowupDate) {
      const dateObj = new Date(currentUpdate.NextFollowupDate);
      formattedDate = dateObj.toISOString().split("T")[0]; // example formatting
      formattedTime = dateObj.toTimeString().split(" ")[0];
    }

    const formData = {
      JsonDBName: UserCompanyName,
      JsonEntryUser: userName,
      JsonLeadDate: currentDate,
      JsonLeadTime: currentTime,
      JsonPlatform: currentLead?.Platform || "",
      JsonClientName: currentLead?.ContactPerson || currentLead?.ClientName,
      JsonClientContact: currentLead?.ClientContact || "",
      JsonClientEmail: currentLead?.ClientAuthorizedPerson || "",
      JsonDescription: currentUpdate.EnquiryDescription || "",
      JsonStatus: currentUpdate.Status,
      JsonRejectionReason: currentUpdate.RejectionReason,
      JsonLeadType: "Existing",
      JsonPreviousStatus: currentLead?.Status,
      JsonNextFollowupDate: currentUpdate.NextFollowupDate ? formattedDate : "",
      JsonNextFollowupTime: currentUpdate.NextFollowupDate ? formattedTime : "",
      JsonClientCompanyName: currentLead?.ClientName || "",
      JsonRemarks: currentUpdate.Remarks,
      JsonHandledBy: userName,
      JsonProspectType: currentUpdate.ProspectType,
      JsonIsUnreachable: currentUpdate.Status === "Unreachable" ? 1 : 0,
    };
    const leadResponse = await PostInsertOrUpdate("InsertLeadStatus", formData);
    const enquiryResponse = await insertEnquiry();
    if (
      leadResponse.status === "success" &&
      enquiryResponse.message === "Values Inserted Successfully!"
    ) {
      setCurrentUpdate(initialCurrentUpdate);
      console.log("saving enquiry:", leadResponse, enquiryResponse);
      alert("Enquiry Saved Successfully!");
    } else {
      console.error(
        "Error while saving enquiry:",
        leadResponse,
        enquiryResponse
      );
      alert("Unable to save due to some network issue!");
    }
    setIsLoading(false);
    FetchLeads();
  };

  const handleCallButtonClick = (contact, name, orderNumber) => {
    console.log("Initiate call to:", contact, name, orderNumber);
  };

  const openExpandedModal = (lead) => {
    setCurrentLead(lead);
    setShowExpandedModal(true);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Top Bar with Filter and Report Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 sticky top-0 left-0 right-0 z-10 bg-white border-b p-4 ">
        <h2 className="text-2xl font-bold text-blue-600 mb-2 md:mb-0">
          Existing Leads
        </h2>
        <div className="flex space-x-4">
          <button
            className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 hover:shadow-md transition-all duration-200"
            onClick={handleDownloadExcel}
          >
            <FaDownload className="mr-2 text-lg" />
            Download
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Search by Client Name, Phone No, Email Address, Ad Medium, Company Name, Remarks..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            onClick={() => {
              if (
                filters.statusFilter !== "All" ||
                filters.prospectTypeFilter !== "All" ||
                filters.fromDate ||
                filters.toDate
              ) {
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

      {/* Filter Panel */}
      {filters.showFilters && (
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter("statusFilter", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Convert">Convert</option>
                <option value="Ready for Quote">Ready for Quote</option>
                <option value="Call Followup">Call Followup</option>
                <option value="Unqualified">Unqualified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prospect Type
              </label>
              <select
                value={filters.prospectTypeFilter}
                onChange={(e) =>
                  updateFilter("prospectTypeFilter", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <DatePicker
                selectsRange={true}
                startDate={filters.fromDate}
                endDate={filters.toDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  updateFilter("fromDate", start);
                  updateFilter("toDate", end);
                }}
                isClearable={true}
                placeholderText="Select date range"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end md:justify-start">
              <button
                onClick={() => toggleFilters()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full md:w-auto"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Cards */}
      {filteredRows.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500 text-lg">
            No data found.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <div
              key={row.OrderNumber}
              className="relative bg-white rounded-lg p-6 border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ minHeight: "240px" }}
            >
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[row.Status || "Convert"]
                  } hover:cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                  onClick={() => {
                    setCurrentLead(row);
                    setShowModal(true);
                  }}
                >
                  {row.Status || "Convert"}
                </span>
                {row.CSE && (
                  <div
                    className="text-xs mt-2 p-1 px-3 hover:cursor-pointer text-orange-800 bg-orange-50 rounded-full flex items-center"
                    // onClick={() => handleHandledByChange(row.CSE, row.OrderNumber)}
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
                    <p>{toTitleCase(row.CSE)}</p>
                  </div>
                )}
              </div>

              <div className="mb-4 mt-8">
                <h3 className="text-xl font-bold text-gray-900 max-w-[75%] capitalize">
                  {row.ClientName}{" "}
                  {row.OrderNumber
                    ? ` - Order # ${row.OrderNumber}`
                    : row.ClientCompanyName === row.ClientName
                    ? ""
                    : `(${row.ClientCompanyName})`}
                </h3>
              </div>

              <div className="space-y-3 text-base">
                {row.Lead_ID && (
                  <p className="text-gray-600">
                    Arrived Date Time:{" "}
                    <span className="font-medium text-gray-900">
                      {formatDBDateTime(row.ArrivedDateTime)}
                    </span>
                  </p>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  Phone:
                  <a
                    href={`tel:${row.ClientContact}`}
                    className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    onClick={() => {
                      setTimeout(() => {
                        setShowModal(true);
                      }, 3000);
                    }}
                  >
                    <FiPhoneCall className="w-4 h-4" />
                    {row.ClientContact}
                  </a>
                </div>
                {(row.ClientAuthorizedPerson || row.ClientEmail) && (
                  <p className="text-gray-600">
                    Email:{" "}
                    <span className="font-medium text-gray-900">
                      {row.ClientAuthorizedPerson || row.ClientEmail}
                    </span>
                  </p>
                )}
                <p className="text-gray-600">
                  Source:{" "}
                  <span className="font-medium text-gray-900">
                    {row.Source || row.Platform}
                  </span>
                </p>
              </div>

              <button
                onClick={() => openExpandedModal(row)}
                className="mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full text-center transition-all duration-200"
              >
                View More
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Change Handled By Modal */}
      {isHandledByChange && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg w-auto max-w-md mb-16 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Change who can Handle the lead
              </h3>
              <button onClick={() => setIsHandledByChange(false)}>
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-1 justify-center">
              {CSENames.map((user) => (
                <label
                  key={user.username}
                  className={`cursor-pointer border py-1 px-3 text-base rounded-full ${
                    currentUpdate.selectedUser === toTitleCase(user.username)
                      ? "bg-blue-500 text-white"
                      : "bg-transparent border border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="user"
                    value={user.username}
                    checked={currentUpdate.selectedUser === user.username}
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

      {/* Lead Details Modal */}
      {showModal && currentLead && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Lead Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentLead(null);
                  setCurrentUpdate(initialCurrentUpdate);
                  setIsLoading(false);
                }}
              >
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Client: <strong>{currentLead.ClientName}</strong>
              </p>
              <p>
                Source:{" "}
                <strong>{currentLead.Source || currentLead.Platform}</strong>
              </p>
              <p>
                Phone:
                <a
                  onClick={() =>
                    handleCallButtonClick(
                      currentLead.ClientContact,
                      currentLead.ClientName,
                      currentLead.OrderNumber
                    )
                  }
                  className="text-blue-600 hover:underline ml-1 cursor-pointer"
                >
                  <strong>{currentLead.ClientContact}</strong>
                </a>
              </p>
              {/* Status Options */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Convert",
                  "Ready for Quote",
                  "Call Followup",
                  "Not Interested",
                ].map((status) => (
                  <label
                    key={status}
                    className={`cursor-pointer border-2 py-1 px-3 text-base rounded-full ${
                      currentUpdate.Status === status
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-transparent border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={currentUpdate.Status === status}
                      onChange={() =>
                        setCurrentUpdate((prev) => ({
                          ...prev,
                          Status: status,
                        }))
                      }
                      className="hidden"
                    />
                    {status}
                  </label>
                ))}
              </div>
              {/* Not Interested Reason Dropdown */}
              {currentUpdate.Status === "Not Interested" && (
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">
                    Select Not Interested Reason
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    value={currentUpdate.RejectionReason}
                    onChange={(e) =>
                      setCurrentUpdate((prev) => ({
                        ...prev,
                        RejectionReason: e.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      Select a reason
                    </option>
                    {[
                      "Not required at the moment",
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
              {(currentUpdate.Status === "Unreachable" ||
                currentUpdate.Status === "Call Followup") && (
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Followup Date and Time
                  </label>
                  <DatePicker
                    selected={currentUpdate.NextFollowupDate}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={15}
                    dateFormat="dd MMM yyyy h:mm aa"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                  } transition-all duration-200`}
                  onClick={handleSave}
                  disabled={!currentUpdate.Status || isLoading}
                >
                  {isLoading ? "Loading..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Order Details Modal */}
      {showExpandedModal && currentLead && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowExpandedModal(false)}
            >
              <AiOutlineClose className="text-2xl" />
            </button>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ad Details for Order #{currentLead.OrderNumber}
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Medium:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.Card}
                  </span>
                </div>
                {currentLead.AdCategory !== " : " && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Ad Category:</span>
                    <span className="text-gray-900 font-semibold">
                      {currentLead.AdCategory}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Type:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.AdType}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Width:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.AdWidth}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Ad Height:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.AdHeight}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">First Release:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.DateOfFirstRelease}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Last Release:</span>
                  <span className="text-gray-900 font-semibold">
                    {currentLead.DateOfLastRelease}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
