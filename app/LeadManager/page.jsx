'use client'
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiCheckCircle, FiFilter, FiXCircle } from "react-icons/fi";
import CustomButton from './filterButton'
import { FiPhoneCall } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaFileExcel } from "react-icons/fa";

const statusColors = {
  New: "bg-green-200 text-green-800",
  Unreachable: "bg-red-200 text-red-800",
  "Call Followup": "bg-yellow-200 text-yellow-800",
  Unqualified: "bg-orange-200 text-orange-800",
  "No Status": "bg-gray-200 text-gray-800",
};

const availableStatuses = [
  "New",
  "Call Followup",
  "Unreachable",
  "Unqualified",
  "No Status",
];

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const parseFollowupDate = (dateStr) => {
  if(dateStr === 'No Followup Date'){
    return;
  }

  const [day, month, year] = dateStr.split("-");
  const monthIndex = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ].indexOf(month);

  if (monthIndex === -1 || !day || !year) {
    console.error("Invalid date format:", dateStr);
    return null;
  }

  return new Date(2000 + parseInt(year, 10), monthIndex, parseInt(day, 10));
};

const EventCards = ({params, searchParams}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCall, setCurrentCall] = useState({ phone: "", name: "", sNo: "" });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [followupTime, setFollowupTime] = useState("");
  const [hideOtherStatus, setHideOtherStatus] = useState(false);
  const [followupOnly, setFollowpOnly] = useState(false);

  const fetchData = async () => {
    try {
      const filters = {
        leadDate: searchParams.leadDate || null,
        status: searchParams.status || "",
        followupDate: searchParams.followupDate || null,
      };

      const fetchedRows = await fetchDataFromAPI(params.id, filters);
      setRows(fetchedRows);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id, searchParams]);
  
  const handleCallButtonClick = async (phone, name, sNo) => {
    setCurrentCall({phone, name, sNo });

    // Trigger a call using `tel:` protocol
    window.location.href = `tel:${phone}`;

    // Simulate the call end before showing the modal
    setTimeout(() => {
      setShowModal(true);
    }, 3000);
  };

  const handleSave = async (Sno, quoteSent, sendQuoteOnly) => {
    var payload = {}
    if(sendQuoteOnly){
      payload = {
        sNo: Sno,
        quoteSent: quoteSent
      };
    }else{
      payload = {
        sNo: currentCall.sNo,
        status: selectedStatus,
        companyName,
        followupDate,
        followupTime,
        quoteSent: quoteSent,
        remarks,
      };
    }

    try {
      const response = await fetch("https://leads.baleenmedia.com/api/updateLeads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update lead");
      fetchData();
      !sendQuoteOnly && alert("Lead updated successfully!");
      
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setShowModal(false);
      setHideOtherStatus(false);
      setSelectedStatus("");
      setRemarks("");
    }
  };

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

  const addNewFollowup = (phone, name, sNo) => {
    setCurrentCall({phone, name, sNo});

    setHideOtherStatus(true);
    const now = new Date(); // Get the current date and time

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Format tomorrow's date as dd-MMM-yyyy
    const formattedDate = tomorrow.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Format the current time as hh:mm AM/PM
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSelectedStatus("Call Followup");
    setShowModal(true);
    setFollowupDate(formattedDate); // Set the followupDate to tomorrow's date
    setFollowupTime(formattedTime); // Set the followupTime to the current time
  }

  if (loading) {
    return (
      <div className="font-poppins text-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="font-poppins text-center">
        <h2>No Data Found</h2>
      </div>
    );
  }

  const toggleQuoteSent = async(sNo, status) => {
    var setValue = status === 'Yes' ? 'No' : 'Yes';
    await handleSave(sNo, setValue, true);
    status !== 'Yes' ? alert("Marked as Quote Sent!") : alert("Marked as Quote Not Sent");
  }

  return (
    <div className="p-4 text-black">
      {/* Top Bar with Filter Button */}
      <div className="flex justify-between items-center mb-4 sticky top-0 left-0 right-0 z-10 bg-white p-3">
        <h2 className="text-xl font-semibold text-blue-500">Lead Manager</h2>
        <button
          className="flex items-center px-4 py-2 bg-transparent text-green-500 rounded-md border border-green-500"
          onClick={() => window.open("https://docs.google.com/spreadsheets/d/19gpuyAkdMFZIYwaDXaaKtPWAZqMvcIZld6EYkb4_xjw/", "_blank")}
        >
          <FaFileExcel className="mr-2 text-lg hover:text-green-500 text-green-500" />
          Sheet 
        </button>
      </div>

      {/* Lead Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.SNo}
            className="relative bg-white rounded-lg p-4 border-2 border-gray-200  hover:shadow-lg hover:-translate-y-2 hover:transition-all"
            style={{ minHeight: "240px" }}
          >
            {/* Status at Top Right */}
            <div className="absolute top-2 right-2">
              <span
                onClick={() => {setShowModal(true); setCurrentCall({phone: row.Phone, name: row.Name, sNo: row.SNo}); setSelectedStatus(row.Status); setRemarks(row.Remarks); setCompanyName(row.CompanyName !== "No Company Name" ? row.CompanyName : '')}}
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[row.Status]} hover:cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:transition-all`}
              >
                {row.Status}
              </span>
            </div>

            <div className="absolute top-2 left-2 flex flex-row">
              {row.Status === 'Call Followup' &&
            <span
              onClick={() => toggleQuoteSent(row.SNo, row.QuoteSent)} // Function to toggle the QuoteSent status
              className={`inline-block rounded-full p-1 ${
                row.QuoteSent === "Yes"
                  ? "bg-gradient-to-r from-green-400 to-green-600 shadow-md hover:opacity-90"
                  : "bg-gray-200"
              } hover:cursor-pointer`}
              title={`Click to ${row.QuoteSent === "Yes" ? "remove" : "add"} quote sent status`}
            >
              {/* Icon from React Icons */}
                <FiCheckCircle className="text-white text-lg" /> 
            </span>
            }
            <span className="inline-block ml-2 px-3 py-1 rounded-full text-xs font-bold text-gray-500 bg-gradient-to-r border border-gray-500">
                {row.Platform || "Unknown Platform"}
              </span>
          </div>

            {/* Platform at Top Left */}
            <div className="absolute top-2 left-2">
              
            </div>

            {/* Name and Company */}
            <div className="mb-2 mt-8">
              <h3 className="text-lg font-bold text-gray-900">
                {row.Name}
                {row.CompanyName && row.CompanyName !== "No Company Name"
                  ? ` - ${row.CompanyName}`
                  : ""}
              </h3>
            </div>

            {/* Core Details */}
            <div className="text-sm text-gray-700 mb-2">
              <p>
                Arrived at: <strong>{row.LeadDate} {row.LeadTime}</strong> 
              </p>
              <p className="flex items-center">
                Phone:
                <a
                  // href={`tel:${row.Phone}`}
                  onClick={() => handleCallButtonClick(row.Phone, row.Name, row.SNo)}
                  className="text-blue-600 hover:underline ml-1"
                >
                  <strong>{row.Phone}</strong>
                </a>
                <button
                  className="ml-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  onClick={() => handleCallButtonClick(row.Phone, row.Name, row.SNo)}
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
              <div className="text-sm max-w-fit" onClick={() => {
                
            }}>
                <p className="bg-red-500 hover:cursor-pointer text-white p-2 text-[14px] rounded-lg">
                <span className="flex flex-row"><FiCalendar className="text-lg mr-2" /> {row.FollowupDate} {row.FollowupTime}</span>
                </p>
              </div>
            ) : (
              <div className="text-sm max-w-fit mt-4">
                <button className="text-red-500 border font-semibold border-red-500 p-1.5 rounded-full" onClick={() => {addNewFollowup(row.Phone, row.Name, row.SNo)}}>+ Add Followup</button>
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

      {/* Modal for Call Status */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Call Status</h3>
              <button onClick={() => {setShowModal(false); setHideOtherStatus(false)}}>
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            <p className="mb-4">
              <strong>Updating Lead for:</strong> {currentCall.name} ({currentCall.phone})
            </p>

            {/* Floating Radio Buttons for Status */}
            {!hideOtherStatus &&
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              {["New", "Call Followup", "Won", "Unreachable", "Unqualified", "Lost"].map(
                (status) => (
                  <label
                    key={status}
                    className={`cursor-pointer border p-2 rounded-full px-4 ${
                      selectedStatus === status ? "bg-blue-500 text-white" : "bg-transparent border border-gray-500"
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
            }
            { (selectedStatus === "Call Followup" || selectedStatus === "Unreachable") &&
             <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <DatePicker
                selected={followupDate ? new Date(`${followupDate} ${followupTime}`) : new Date()}
                onChange={handleDateChange}
                // onChange={handleDateChange}
                showTimeSelect
                timeFormat="h:mm aa" // Sets the format for time (24-hour format)
                timeIntervals={15} // Time interval options (15 minutes in this case)
                timeCaption="Time" // Caption for time section
                dateFormat="dd MMM yyyy h:mm aa" // Displays date and time together
                className="border border-gray-300 p-2 rounded-md w-full"
                calendarClassName="bg-white border border-gray-200 rounded-md"
              />
            </div> 
}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-500 rounded-lg p-2"
                rows={3}
                onFocus={e => e.target.select()}
              />
            </div> 

            {/* Remarks */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-gray-500 rounded-lg p-2"
                rows={3}
                onFocus={e => e.target.select()}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleSave}
                disabled={!selectedStatus}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


async function fetchDataFromAPI(queryId, filters) {
  const apiUrl = `https://leads.baleenmedia.com/api/fetchLeads`; // replace with the actual endpoint URL

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      id: queryId,
      leadDate: filters.leadDate || "",
      status: filters.status || "",
      followupDate: filters.followupDate || "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  const today = new Date().toDateString();

  const filteredData = data.rows.filter(
    (lead) => lead.Status !== "Unqualified" && lead.Status !== "Won" && lead.Status !== "Lost"
  );

  const sortedRows = filteredData.sort((a, b) => {
    const today = new Date().setHours(0, 0, 0, 0); // Normalize today's date
  
    const aFollowupDate = new Date(a.FollowupDate).setHours(0, 0, 0, 0);
    const bFollowupDate = new Date(b.FollowupDate).setHours(0, 0, 0, 0);
    const aLeadDate = new Date(a.LeadDate).setHours(0, 0, 0, 0);
    const bLeadDate = new Date(b.LeadDate).setHours(0, 0, 0, 0);
  
    // Define status priorities
    const statusPriority = {
      "Call Followup": 1,
      New: 2,
      Unreachable: 3,
    };
  
    // Determine the relevant date
    const aRelevantDate =
      aFollowupDate > today ? aLeadDate : aFollowupDate || aLeadDate;
    const bRelevantDate =
      bFollowupDate > today ? bLeadDate : bFollowupDate || bLeadDate;
  
    // Sort by the most relevant date (descending, most recent first)
    if (aRelevantDate !== bRelevantDate) {
      return bRelevantDate - aRelevantDate;
    }
  
    // Sort by status priority if dates are the same
    const aPriority = statusPriority[a.Status] || 5; // Default priority for unknown statuses
    const bPriority = statusPriority[b.Status] || 5;
  
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
  
    // Sort by follow-up date as a tiebreaker if both have the same status priority
    return bFollowupDate - aFollowupDate;
  });  

  return sortedRows;
}


export default function Page({ params, searchParams }) {
  // const [rows, setRows] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const filters = {
  //         leadDate: searchParams.leadDate || null,
  //         status: searchParams.status || "",
  //         followupDate: searchParams.followupDate || null,
  //       };

  //       const fetchedRows = await fetchDataFromAPI(params.id, filters);
  //       setRows(fetchedRows);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [params.id, searchParams]);

  // if (loading) {
  //   return (
  //     <div className="font-poppins text-center">
  //       <h2>Loading...</h2>
  //     </div>
  //   );
  // }

  // if (!rows.length) {
  //   return (
  //     <div className="font-poppins text-center">
  //       <h2>No Data Found</h2>
  //     </div>
  //   );
  // }

  return (
    <article>
      <EventCards params = {params} searchParams = {searchParams}/>
    </article>
  );
}
