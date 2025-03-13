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
import { FiCalendar, FiPhoneCall, FiCheckCircle, FiLoader } from "react-icons/fi";
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
import { formatDBDateTime, normalizeDate } from "@/app/utils/commonFunctions";
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
  PreviousStatus: "",
  FollowupOnly: false,
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
    // "Baleen Media": UserCompanyName,
  } = useAppSelector((state) => state.authSlice);

  const UserCompanyName = "Baleen Media"
  const filteredRows = leadData
                        .filter(row => filters.statusFilter === "All" || (row.Status || "Convert") === filters.statusFilter )
                        .filter((row) => {
                          const followUpDate = normalizeDate(new Date(row.NextFollowupDate));
                          const leadDate = normalizeDate(new Date(row.LeadDate));
                      
                          // Convert 'fromDate' and 'toDate' into Date objects for comparison
                          const fromDateObj = filters.fromDate ? normalizeDate(new Date(filters.fromDate)) : null;
                          const toDateObj = filters.toDate ? normalizeDate(new Date(filters.toDate)) : null;
                      
                          // Ensure both fromDateObj and toDateObj are defined
                          if (!fromDateObj || !toDateObj) return true; 
                      
                          if (
                            (followUpDate >= fromDateObj && followUpDate <= toDateObj) ||
                            (leadDate >= fromDateObj && leadDate <= toDateObj)
                          ) {
                            return true; 
                          }
                          return false; 
                        }) ; // Add additional filtering logic if needed

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const FetchLeads = async () => {
    setIsLoading(true);
    let response = await FetchExistingLeads(UserCompanyName, searchTerm);
    let data = await FetchLeadsData(UserCompanyName, searchTerm);

    // Convert all date strings to Date objects
    const processLeads = (leads) => leads.map(lead => ({
        ...lead,
        NextFollowupDate: lead.NextFollowupDate ? new Date(`${lead.NextFollowupDate}T${lead.NextFollowupTime}`) : null
    }));

    // Process both sets of leads
    let allLeads = processLeads(data).concat(processLeads(response));

    // Get today's date in "YYYY-MM-DD" format
    const today = new Date().toISOString().slice(0, 10);

    // Separate today's follow-up leads, existing leads, and other follow-up leads
    const todaysLeads = allLeads.filter(lead => lead.NextFollowupDate && lead.NextFollowupDate.toISOString().slice(0, 10) === today);
    const existingLeads = allLeads.filter(lead => lead.DateOfLastRelease);  // Assuming existing leads have DateOfLastRelease
    const otherFollowupLeads = allLeads.filter(lead => lead.NextFollowupDate && lead.NextFollowupDate.toISOString().slice(0, 10) !== today);

    // Sort other follow-up leads in ascending order of NextFollowupDate
    otherFollowupLeads.sort((a, b) => a.NextFollowupDate - b.NextFollowupDate);

    // Combine the leads in the required order: today's leads on top, then existing leads, then other follow-up leads
    let sortedLeads = [...todaysLeads, ...existingLeads, ...otherFollowupLeads];

    // Update the state with the sorted leads
    setLeadData(sortedLeads);

    // Fetch CSENames
    fetchCSENames();
    setIsLoading(false);
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
    let chosenDate = new Date(selectedDate);
    console.log("Selected Date:", selectedDate, typeof selectedDate, chosenDate);
    setCurrentUpdate((prev) => ({
      ...prev,
      NextFollowupDate: chosenDate,
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

    //Check if the lead is existing or not
    const isExistingLead = currentLead?.Lead_ID ? true : false;

    setShowModal(false);
    // Format the followup date and time if provided
    let formattedDate = "";
    let formattedTime = "";
    if (currentUpdate.NextFollowupDate) {
      const dateObj = new Date(currentUpdate.NextFollowupDate);
      formattedDate = dateObj.toISOString().split("T")[0]; // example formatting
      formattedTime = dateObj.toTimeString().split(" ")[0];
    }

    const updateFormData = {
      JsonLead_ID: currentLead?.Lead_ID || "",
      JsonDBName: UserCompanyName,
      JsonEntryUser: userName,
      JsonStatus: currentUpdate.Status,
      JsonRejectionReason: currentUpdate.RejectionReason,
      JsonNextFollowupDate: currentUpdate.NextFollowupDate ? formattedDate : "",
      JsonNextFollowupTime: currentUpdate.NextFollowupDate ? formattedTime : "",
      JsonRemarks: currentUpdate.Remarks || currentLead.Remarks,
      JsonHandledBy: currentUpdate.HandledBy || userName,
      JsonPreviousStatus: currentUpdate.PreviousStatus || currentLead.Status,
    }

    const formData = {
      JsonDBName: UserCompanyName,
      JsonEntryUser: userName,
      JsonLeadDate: currentDate,
      JsonLeadTime: currentTime,
      JsonPlatform: currentLead?.Source || "",
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
      JsonRemarks: currentUpdate.Remarks || currentLead.Remarks,
      JsonHandledBy: userName,
      JsonProspectType: currentUpdate.ProspectType,
      JsonIsUnreachable: currentUpdate.Status === "Unreachable" ? 1 : 0,
    };

    const hasChanges = Object.keys(updateFormData).some(key => {
      const originalValue = currentLead[key.replace("Json", "")];
      const newValue = updateFormData[key];
      return originalValue !== undefined && newValue !== originalValue;
    });
    
    //check if the status is changed or not
    if (!hasChanges) {
      alert("No changes made.");
      setIsLoading(false);
      return;
    }

    const leadResponse = await PostInsertOrUpdate("InsertLeadStatus", isExistingLead ? updateFormData : formData);
    const enquiryResponse = await insertEnquiry();
    if (
      enquiryResponse.message === "Values Inserted Successfully!" &&
      isExistingLead ? true : leadResponse.status === "success"
    ) {
      setCurrentUpdate(initialCurrentUpdate);
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
            className="w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          <div className="flex flex-col md:flex-row justify-start md:justify-evenly">
            <div className="mb-4 md:mb-0">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter("statusFilter", e.target.value)}
                className="w-60 text-black p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Convert">Convert</option>
                {/* <option value="Ready for Quote">Won</option> */}
                <option value="Call Followup">Call Followup</option>
                <option value="Unreachable">Unreachable</option>
                {/* <option value="Unqualified">Unqualified</option> */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lead Date Range
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

            {/* <div className="flex justify-end md:justify-start">
              <button
                onClick={() => toggleFilters()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full md:w-auto"
              >
                Apply Filters
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Lead Cards */}

  {filteredRows.length === 0 ? 
    isLoading ?  (<div className="flex items-center justify-center h-64">
      <div className="flex flex-row text-center text-black text-lg font-semibold">
      <FiLoader className="animate-spin mr-2 border-white rounded-full w-6 h-6 text-blue-500"/>
      Loading data...
      </div>
    </div>) :(<div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-500 text-lg">
        No data found.
      </div>
    </div>
  ) : (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {filteredRows.map((row) => (
      <div
        key={row.OrderNumber}
        className="relative bg-white rounded-xl shadow-md hover:shadow-xl p-5 border-l-4 border-l-blue-500 transition-all duration-300"
        style={{ minHeight: "280px" }}
      >
        {/* Header Section with Client Name and Status */}
        <div className="flex justify-between items-start  mb-2">
          <h3 className="text-lg font-bold text-gray-900 capitalize pr-2 leading-tight">
            {row.ClientName}
          </h3>
          <span
          onClick={() => {
             if (!isLoading) {
              toggleQuoteSent(row.SNo, row.QuoteSent); // Only toggle when not loading
            }
           }}
           className={`flex items-center gap-2 rounded-lg px-3 py-1 text-white text-xs sm:text-sm font-medium shadow-md transition-all duration-300 cursor-pointer ${
             row.QuoteSent === "Yes"
               ? "bg-green-500 hover:bg-green-600"
               : "bg-red-500 hover:bg-red-600"
           }`}
          title={`Click to ${row.QuoteSent === "Yes" ? "remove" : "add"} quote sent status`}
         >
          {isLoading ? (
            <div className="animate-spin border-t-2 border-white rounded-full w-4 h-4" />
          ) : (
             <FiCheckCircle className="text-white text-base" />
          )}
           <span>{row.QuoteSent === "Yes" ? "Sent" : "Not Sent"}</span>
         </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColors[row.Status || "Convert"]
            } hover:cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => {
              setCurrentLead(row);
              setShowModal(true);
              if(row.Lead_ID){
                setCurrentUpdate({
                  ...currentUpdate,
                  Status: row.Status || "Convert",
                  RejectionReason: row.RejectionReason,
                  NextFollowupDate: row.NextFollowupDate,
                  Remarks: row.Remarks,
                  HandledBy: row.HandledBy,
                  ProspectType: row.ProspectType,
                  IsUnreachable: row.IsUnreachable,
                  PreviousStatus: row.PreviousStatus
                });
              }
            }}
          >
            {row.Status || "Convert"}
          </span>
          
                      {/* CSE Assignment */}
        {row.CSE && (
          <div className="mb-4">
            <div className="text-xs py-1 px-3 inline-flex items-center text-orange-800 bg-orange-50 rounded-full">
              <FontAwesomeIcon icon={faUserCircle} className="mr-1" />
              <p>{toTitleCase(row.CSE)}</p>
            </div>
          </div>
        )}

                      
        </div>

        {/* Order Number & Company */}
        <div className="mb-4">
          {row.OrderNumber && (
            <div className="text-sm text-gray-600 font-medium mb-1">
              Order # {row.OrderNumber}
            </div>
          )}
          {row.ClientCompanyName && row.ClientCompanyName !== row.ClientName && (
            <div className="text-sm text-gray-700 font-medium">
              {row.ClientCompanyName}
            </div>
          )}
        </div>

        

        {/* Client Details Section - Clean List */}
        <div className="space-y-2.5 mb-12">
          {row.Lead_ID && (
            <div className="flex items-baseline">
              <div className="w-28 text-xs text-gray-500 uppercase font-medium">Date</div>
              <div className="flex-1 text-gray-900 text-sm">
                {formatDBDateTime(row.ArrivedDateTime)}
              </div>
            </div>
          )}
          
          <div className="flex items-baseline">
            <div className="w-28 text-xs text-gray-500 uppercase font-medium">Phone</div>
            <a
              href={`tel:${row.ClientContact}`}
              className="flex-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              onClick={() => {
                setTimeout(() => {
                  setShowModal(true);
                }, 3000);
              }}
            >
              <div className="flex items-center">
                <FiPhoneCall className="w-3.5 h-3.5 mr-1.5" />
                {row.ClientContact}
              </div>
            </a>
          </div>
          
          {(row.ClientAuthorizedPerson || row.ClientEmail) && (
            <div className="flex items-baseline">
              <div className="w-28 text-xs text-gray-500 uppercase font-medium">Email</div>
              <div className="flex-1 text-gray-900 text-sm truncate">
                {row.ClientAuthorizedPerson || row.ClientEmail}
              </div>
            </div>
          )}
          
          <div className="flex items-baseline">
            <div className="w-28 text-xs text-gray-500 uppercase font-medium">Source</div>
            <div className="flex-1 text-gray-900 text-sm">
              {row.Source || row.Platform}
            </div>
          </div>
        </div>

        {/* Follow-up Date Tab */}
        {/* {row.NextFollowupDate !== "No Followup Date" && 
         (row.Status === "Call Followup" || row.Status === "Unreachable") && (
          <div className="absolute left-[407px] top-[225px] transform translate-x-8">
            <div
              className="bg-green-100 hover:bg-green-200 text-green-900 px-4 py-2 rounded-l-lg shadow cursor-pointer -rotate-90 origin-top-left"
              onClick={() => {
                setShowModal(true);
                setCurrentUpdate({
                  ...currentUpdate,
                  Status: "Call Followup",
                  FollowupOnly: true,
                  NextFollowupDate: new Date(row.NextFollowupDate),
                });
                setCurrentLead(row);
              }}
            >
              <div className="flex items-center whitespace-nowrap text-xs font-medium">
                <FiCalendar className="mr-1.5" />
                {formatDBDateTime(row.NextFollowupDate.toISOString())}
              </div>
            </div>
          </div>
        )} */}

        {/* Action Buttons */}
        <div className="absolute bottom-5 left-5 right-5 flex gap-2">
          {row.Status !== "Convert" && row.Status !== "Call Followup" && row.Status !== "Unreachable" && (
            <button
              onClick={() => openExpandedModal(row)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
            >
              View More
            </button>
          )}
          
          {row.Status !== "No Followup Date" && (row.Status === "Call Followup" || row.Status === "Unreachable") && (
            <div
            className="bg-green-600 hover:bg-green-700 text-green-100 px-4 py-2 rounded-lg shadow cursor-pointer w-full "
            onClick={() => {
              setShowModal(true);
              setCurrentUpdate({
                ...currentUpdate,
                Status: "Call Followup",
                FollowupOnly: true,
                NextFollowupDate: new Date(row.NextFollowupDate),
              });
              setCurrentLead(row);
            }}
          >
            <div className="flex items-center whitespace-nowrap text-xs font-medium">
              <FiCalendar className="mr-1.5" />
              {formatDBDateTime(row.NextFollowupDate.toISOString())}
            </div>
          </div>
          )}
        </div>
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
                    className="hidden text-black"
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
              {!currentUpdate.FollowupOnly && (
              <div className="flex flex-wrap gap-2">
                {[
                  "Call Followup",
                  "Unreachable",
                  "Unqualified",
                  "Won",
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
                      className="hidden text-black"
                    />
                    {status}
                  </label>
                ))}
              </div>)}
              {/* Not Interested Reason Dropdown */}
              {!currentUpdate.FollowupOnly && currentUpdate.Status === "Unqualified" && (
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">
                    Select Unqualified Reason
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
              {!currentUpdate.FollowupOnly && (
              <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">
                    Remarks
                  </label>
                  <input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-black"
                    value={currentUpdate.Remarks}
                    onChange={(e) => setCurrentUpdate(prev => ({ ...prev, Remarks: e.target.value }))} />
                </div>)}
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
