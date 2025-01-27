'use client'
import { FaFileExcel, FaFilter } from "react-icons/fa";
import { statusColors } from "../page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { FiCheckCircle, FiPhoneCall, FiCalendar } from "react-icons/fi";

export default function ExistingClientToLeads() {
    const isLoading = false
    const filteredRows = [{
        SNo: 1,
        Status: 'Call Followup',
        Name: 'Moorthy',
        HandledBy: 'Siva',
        QuoteSent: 'Yes',
        Enquiry: "Nothing",
        Platform: "Meta",
        LeadDate: "14 Jan 25",
        LeadTime: "10:10 PM"
    }]
    return(
            <div className="p-4 text-black">
              {/* Top Bar with Filter and Report Buttons */}
            <div className="flex justify-between items-center mb-4 sticky top-0 left-0 right-0 z-10 bg-white p-3">
              <h2 className="text-xl font-semibold text-blue-500">Lead Manager</h2>
              <div className="flex  space-x-4 ">
                {/* Sheet Button */}
                <button
                  className="flex items-center px-4 py-2 bg-transparent text-green-600 rounded-md border border-green-500 hover:bg-green-100"
                  onClick={() => window.open("https://docs.google.com/spreadsheets/d/19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw/", "_blank")}
                >
                  <FaFileExcel className="mr-2 text-lg hover:text-green-500 text-green-600" />
                  Sheet
                </button>
                
                {/* Report Button */}
                {/* <a href="/LeadManager/Report">
                  <button
                    className="flex items-center px-3 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 border border-blue-500"
                  >
                    <FaFileAlt className="mr-2 text-lg" />
                    Report
                  </button>
                </a> */}
              </div>
        
            </div>
        
              
               {/* Search Bar */}
              <div className="p-4">
              {/* Search Bar and Filter Icon */}
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by Phone No, Email Address, Ad Enquiry, Company Name, Remarks..."
                //   value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                //   onFocus={handleFocus}
                //   onClick={handleFocus}
                />
               <button
                onClick={() => {
                  if (statusFilter !== 'All' || prospectTypeFilter !== 'All' || fromDate || toDate) {
                    clearFilters(); // If any filters or search query is active, clear them
                  } else {
                    toggleFilters(); // Otherwise, toggle filter visibility
                  }
                }}
                className="ml-2 p-2 sm:p-3 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600"
              >
                {/* {statusFilter !== 'All' || prospectTypeFilter !== 'All' || fromDate || toDate ? (
                  <FaTimes size={20} /> // Clear icon if any filter or search query is active
                ) : ( */}
                  <FaFilter size={20} /> // Filter icon if no filter or search query is active
                {/* )} */}
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
                    key={row.SNo}
                    className="relative bg-white rounded-lg p-4 border-2 border-gray-200  hover:shadow-lg hover:-translate-y-2 hover:transition-all"
                    style={{ minHeight: "240px" }}
                  >
                    {/* Status at Top Right */}
                    <div className="absolute top-2 right-2">
                      <span
                        onClick={() => {setShowModal(true); setCurrentCall({phone: row.Phone, name: row.Name, sNo: row.SNo, Platform: row.Platform, Enquiry: row.Enquiry, LeadDateTime: row.LeadDate + " " + row.LeadTime, quoteSent: row.QuoteSent}); setSelectedStatus(row.Status); setRemarks(row.Remarks); setCompanyName(row.CompanyName !== "No Company Name" ? row.CompanyName : ''); setSelectedLeadStatus(row.ProspectType === "Unknown" ? "" : row.ProspectType)}}
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.Status]} hover:cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:transition-all`}
                      >
                        {row.Status}
                      </span>
                      {row.HandledBy && (
                      <div 
                        className="text-xs mt-2 p-1 sm: mb-2 justify-start px-3 hover: cursor-pointer text-orange-800 bg-orange-100 rounded-full flex flex-row "
                        onClick={() => handleHandledByChange(row.HandledBy, row.SNo)}
                      >
                        <FontAwesomeIcon icon={faUserCircle} className="mr-1 mt-[0.1rem]"/>
                        <p className="font-poppins">
                          {row.HandledBy}
                        </p>
                      </div>
                    )}
                    </div>
        
                    <div className="absolute top-2 left-2 flex flex-row">
                     {row.Status === 'Call Followup' &&
                    <span
                      onClick={() => {
                        if (!isLoading) {
                          toggleQuoteSent(row.SNo, row.QuoteSent); // Only toggle when not loading
                        }
                      }}
                      className={`inline-block rounded-full p-1 ${
                        row.QuoteSent === "Yes"
                          ? "bg-gradient-to-r from-green-400 to-green-600 shadow-md hover:opacity-90"
                          : "bg-gradient-to-r from-red-400 to-red-600"
                      } hover:cursor-pointer`}
                      title={`Click to ${row.QuoteSent === "Yes" ? "remove" : "add"} quote sent status`}
                      
                    >
                      {isLoading ? (
                        <div className="animate-spin border-t-2 border-white rounded-full w-5 h-5" />
                      ) : (
                        <FiCheckCircle className="text-white text-lg" />
                      )}
                    </span>
                  }
                    
                    <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gradient-to-r border border-gray-500">
                        {row.Platform || "Unknown Platform"}
                      </span>
                      {/* Platform and Selected Status */}
                      {row.ProspectType && (
                      <span
                        className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r border ${
                          row.ProspectType === "Hot"
                            ? "text-red-500 border-red-500 bg-red-100"
                            : row.ProspectType === "Warm"
                            ? "text-yellow-500 border-yellow-500 bg-yellow-100"
                            : row.ProspectType === "Cold"
                            ? "text-blue-500 border-blue-500 bg-blue-100"
                            : "border-white"
                        }`}
                      >
                        {row.ProspectType !== "Unknown" && row.ProspectType}
                        
                      </span>
                    )}
                  </div>
        
                    {/* Platform at Top Left */}
                    <div className="absolute top-40 right-3">
                    
                    </div>
                  
                    {/* Name and Company */}
                    <div className="mb-2 mt-8">
                      <h3 className="text-lg font-bold text-gray-900 max-w-[75%] capitalize">
                        {row.Name}
                        {row.CompanyName && row.CompanyName !== "No Company Name"
                          ? ` - ${row.CompanyName}`
                          : ""}
                      </h3>
                    </div>
        
                    {/* Core Details */}
                    <div className="text-sm text-gray-700 mb-2">
                      
                      <p>
                      Originated at: <strong>{row.LeadDate} {row.LeadTime}</strong> 
                      </p>
                      <p className="flex items-center">
                        Phone:
                        <a
                          // href={`tel:${row.Phone}`}
                          onClick={() => handleCallButtonClick(row.Phone, row.Name, row.SNo, row.Platform, row.Enquiry, row.LeadDate + " " + row.LeadTime, row.QuoteSent)}
                          className="text-blue-600 hover:underline ml-1"
                        >
                          <strong>{row.Phone}</strong>
                        </a>
                        <button
                          className="ml-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                          onClick={() => {handleCallButtonClick(row.Phone, row.Name, row.SNo, row.Platform, row.Enquiry, row.LeadDate + " " + row.LeadTime, row.QuoteSent); setCompanyName(row.CompanyName !== 'No Company Name' ? row.CompanyName : ''); setRemarks(row.Remarks)}}
                          title="Call"
                        >
                          <FiPhoneCall className="text-lg" />
                        </button>
                      </p>
                      <p>
                        Enquiry: {<strong>{row.Enquiry}</strong> || "N/A"}
                      </p>
                    </div>
                    {/* Follow-Up Date */}
                    {row.FollowupDate !== "No Followup Date" && (row.Status === "Call Followup" || row.Status === "Unreachable") ? (
                      <div className="text-sm max-w-fit" >
                      <p className="text-sm text-gray-700 mb-1">Followup Date:</p>
                        <p className="bg-green-200 hover:bg-green-300 text-green-900 p-2 text-[14px] rounded-lg cursor-pointer"   onClick={() => {setShowModal(true); setFollowpOnly(true); setSelectedStatus("Call Followup"); setCurrentCall({phone: row.Phone, name: row.Name, sNo: row.SNo, Platform: row.Platform, Enquiry: row.Enquiry, LeadDateTime: row.LeadDate + " " + row.LeadTime, quoteSent: row.QuoteSent}); setFollowupDate(row.FollowupDate); setFollowupTime(row.FollowupTime)}}>
                        <span className="flex flex-row"><FiCalendar className="text-lg mr-2" /> {row.FollowupDate} {row.FollowupTime}</span>
                        </p>
                        <p onClick={() => {handleRemoveFollowup(row.SNo);}} className="mt-2 text-red-500 underline hover:cursor-pointer">Remove Followup</p>
            
                      </div>
                      
                    ) : (
                      <div className="text-sm mt-4 flex flex-row justify-between items-center w-full">
                        <button className="text-red-500 border font-semibold border-red-500 p-1.5 rounded-full" onClick={() => {addNewFollowup(row.Phone, row.Name, row.SNo, row.Platform, row.Enquiry, row.LeadDate + " " + row.LeadTime, row.QuoteSent)}}>+ Add Followup</button>
                        {row.Status === "New" && (
                          <div className="text-blue-500 relative group border font-semibold bg-blue-100 p-2 rounded-md justify-self-end hover:cursor-wait hover:bg-blue-500 hover:text-white ">
                            <Timer className="mr-2"/>
                            {formatTime(timers[row.SNo] || 0)}
                            {/* Helper text that appears on hover */}
                            <div className="absolute top-full mt-1 left-0 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded-md hidden group-hover:block">
                              Every Second Counts <br/>
                              Take Action Now
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                     {/* Remarks */}
                     {row.Remarks && (
                      <div className="text-sm bg-gray-200 text-gray-900 mt-2 p-1 rounded-md">
                        <p>
                          <strong>Remarks:</strong> {row.Remarks}
                        </p>
                      </div>
                    )}
                    
                  </div>
                ))}
                
              </div>
              )}
              </div>
              
    )
}