'use client'
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiCheckCircle, FiFilter, FiXCircle } from "react-icons/fi";
import CustomButton from './filterButton'
import { FiPhoneCall } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { FaFileExcel } from "react-icons/fa";
import { GiCampfire } from "react-icons/gi";
import { MdOutlineWbSunny } from "react-icons/md";
import { FaRegSnowflake } from "react-icons/fa";
import { motion } from 'framer-motion';
import { FaFilter, FaTimes } from "react-icons/fa";
import LoadingComponent from "./progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import ToastMessage from '../components/ToastMessage';
import SuccessToast from '../components/SuccessToast';
import { useAppSelector } from "@/redux/store";
import { PostInsertOrUpdate } from "@/app/api/InsertUpdateAPI";
import { FaFileAlt } from "react-icons/fa";
import { Timer } from "@mui/icons-material";
import { formatDBDate, formatDBTime } from "../utils/commonFunctions";
import { FetchActiveCSE } from "../api/FetchAPI";
import { useRouter } from "next/navigation";

export const statusColors = {
  New: "bg-green-200 text-green-800",
  Unreachable: "bg-red-200 text-red-800",
  "Call Followup": "bg-yellow-200 text-yellow-800",
  Unqualified: "bg-orange-200 text-orange-800",
  "No Status": "bg-gray-200 text-gray-800",
  "Available": "bg-green-200 text-green-800",
  "Ready for Quote": "bg-blue-200 text-blue-800",
};

const availableStatuses = [
  "New",
  "Call Followup",
  "Unreachable",
  "Unqualified",
  "No Status",
];

export function toTitleCase(str) {
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
  const {userName, appRights, dbName: UserCompanyName, companyName: alternateCompanyName} = useAppSelector(state => state.authSlice);
  const router = useRouter()
  const [showModal, setShowModal] = useState(false);
  const [currentCall, setCurrentCall] = useState({ phone: "", name: "", sNo: "", Platform: "", Enquiry: "", LeadDateTime: "", quoteSent: "", rowData: []});
  const [selectedStatus, setSelectedStatus] = useState("New");
  const [remarks, setRemarks] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [followupTime, setFollowupTime] = useState("");
  const [hideOtherStatus, setHideOtherStatus] = useState(false);
  const [followupOnly, setFollowpOnly] = useState(false);
  const [initialSelectedStatus, setInitialSelectedStatus] = useState(selectedStatus);
  const [selectedUser, setSelectedUser] = useState('')
  const [initialFollowupDate, setInitialFollowupDate] = useState(followupDate);
  const [initialFollowupTime, setInitialFollowupTime] = useState(followupTime);
  const [initialCompanyName, setInitialCompanyName] = useState(companyName);
  const [initialRemarks, setInitialRemarks] = useState(remarks);
  const [initialLeadStatus, setInitialLeadStatus] = useState("");
  const [initialQuoteStatus, setInitialQuoteStatus] = useState("");
  const [selectedLeadStatus, setSelectedLeadStatus] = useState("");
  const [quoteSentChecked, setQuoteSentChecked] = useState("");
  const [prospectType, setProspectType] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to track the loading status
  const [hasSaved, setHasSaved] = useState(false); 
  const [statusFilter, setStatusFilter] = useState("All");
  const [prospectTypeFilter, setProspectTypeFilter] = useState("All");
  const [quoteSentFilter, setQuoteSentFilter] = useState("All");
  const [CSEFilter, setCSEFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [fromDate, setFromDate] = useState(null); // Use null for default empty date
  const [toDate, setToDate] = useState(null); // Use null for default empty date
  const [timers, setTimers] = useState("");
  const [toast, setToast] = useState(false);
  const [severity, setSeverity] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isHandledByChange, setIsHandledByChange] = useState('');
  const [CSENames, setCSENames] = useState([]);

  // console.log(rows)
  const toggleFilters = () => {
    setFiltersVisible((prev) => !prev);
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
  };
  
  const clearFilters = () => {
    setStatusFilter('All');
    setProspectTypeFilter('All');
    setQuoteSentFilter("All");
    setFromDate(null);
    setCSEFilter("");
    setToDate(null);
    setSearchQuery('');
  };

  const prospectTypes = [
    { type: "All", icon: null },  // No icon for "All"
    { type: "Hot", icon: <GiCampfire className="inline-block text-red-500 mr-1" size={20}/> },
    { type: "Warm", icon: <MdOutlineWbSunny className="inline-block text-yellow-500 mr-1" size={20}/> },
    { type: "Cold", icon: <FaRegSnowflake className="inline-block text-blue-500 mr-1" size={20}/> },
  ];

  const filteredRows = rows
  .filter((row) =>
    statusFilter === 'All' || row.Status === statusFilter
  )
  .filter((row) =>
    prospectTypeFilter === 'All' || row.ProspectType === prospectTypeFilter
  )
  .filter((row) => 
    quoteSentFilter === 'All' || 
        (quoteSentFilter === 'Quote Sent' && row.QuoteSent === 'Yes' && row.Status === 'Call Followup') ||
        (quoteSentFilter === 'Yet To Send' && row.QuoteSent !== 'Yes' && row.Status === 'Call Followup')
  )
  .filter((row) =>
    CSEFilter === 'All' || row.HandledBy === CSEFilter
  )
  .filter((row) =>
    [row.Phone, row.Enquiry, row.Name, row.CompanyName, row.Remarks, row.FollowupDate, row.LeadDate]
      .filter(Boolean)
      .some((field) =>
        field.toLowerCase().includes(searchQuery)
      )
  )
  .filter((row) => {
    const followUpDate = new Date(row.FollowupDate);
    const leadDate = new Date(row.LeadDate);

    // Convert 'fromDate' and 'toDate' into Date objects for comparison
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    // Ensure both fromDateObj and toDateObj are defined
    if (!fromDateObj || !toDateObj) return true; 

    if (
      (followUpDate >= fromDateObj && followUpDate <= toDateObj) ||
      (leadDate >= fromDateObj && leadDate <= toDateObj)
    ) {
      return true; 
    }
    return false; 
  });

  const fetchCSENames = async () => {
    let data = await FetchActiveCSE(UserCompanyName);
    setCSENames(data)
  };

  const isNoDataFound = filteredRows.length === 0;

  useEffect(() => {
    // Get the current date and time
    const now = new Date();
    let newDate;
    let newTime;
  
    // If the status is "Call Followup" and there’s a valid followup date in currentCall,
    // then use that value directly.
    if (
      selectedStatus === "Call Followup" &&
      currentCall?.rowData?.FollowupDate &&
      currentCall.rowData.FollowupDate !== "No Followup Date"
    ) {
      newDate = currentCall.rowData.FollowupDate;
      newTime = currentCall.rowData.FollowupTime;
    } else {
      // Otherwise, start with the current date as the default
      const defaultDate = new Date(now);
  
      if (selectedStatus === "Unreachable") {
        // For "Unreachable", set the default date to 1 hour ahead.
        defaultDate.setHours(defaultDate.getHours() + 1);
      } else if (selectedStatus === "Call Followup") {
        // For "Call Followup" (when no valid date is present),
        // move to tomorrow while keeping the current time.
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        defaultDate.setDate(defaultDate.getDate() + 1);
        defaultDate.setHours(
          Math.floor(currentTimeMinutes / 60),
          currentTimeMinutes % 60,
          0
        );
      }
      
      // Format the date and time based on the updated defaultDate.
      newDate = defaultDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      newTime = defaultDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  
    // Update state with the new followup date and time
    setFollowupDate(newDate);
    setFollowupTime(newTime);
  
  }, [selectedStatus, showModal]); //Triggers when selected status or current call is called  

  
  useEffect(() => {
    const intervals = {};
  
    rows.forEach((row) => {
      if (row.Status === "New") {
        const leadDateTime = new Date(`${row.LeadDate} ${row.LeadTime}`);
        const currentTime = new Date();
        const initialSeconds = Math.floor((currentTime - leadDateTime) / 1000);
  
        // Start or continue the timer
        if (!intervals[row.SNo]) {
          setTimers((prevTimers) => ({
            ...prevTimers,
            [row.SNo]: initialSeconds > 0 ? initialSeconds : 0,
          }));
          intervals[row.SNo] = setInterval(() => {
            setTimers((prevTimers) => {
              const updatedTimers = {
                ...prevTimers,
                [row.SNo]: (prevTimers[row.SNo] || initialSeconds || 0) + 1,
              };
              localStorage.setItem("leadTimers", JSON.stringify(updatedTimers));
              return updatedTimers;
            });
          }, 1000);
        }
      } else {
        // Clear the timer if status changes
        clearInterval(intervals[row.SNo]);
        setTimers((prevTimers) => {
          const updatedTimers = { ...prevTimers, [row.SNo]: 0 };
          localStorage.setItem("leadTimers", JSON.stringify(updatedTimers));
          return updatedTimers;
        });
      }
    });
  
    // Cleanup intervals on unmount or when rows change
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [rows]);
  
  const insertEnquiry = async () => {
    let row = currentCall.rowData;
    // Extract only the 10-digit number
    const cleanedPhone = row.Phone.replace(/^(\+91\s?)/, '').trim();
    const isNewClient = await checkIfNewClient(cleanedPhone)
    console.log(isNewClient)
    try {
        const url = `https://www.orders.baleenmedia.com/API/Media/InsertNewEnquiryTest.php/?JsonUserName=${toTitleCase(userName)}&JsonClientName=${row.Name}&JsonClientEmail=${row.Email}&JsonClientContact=${cleanedPhone}&JsonSource=${row.Platform}&JsonDBName=${alternateCompanyName}&JsonIsNewClient=${isNewClient}`;

        const response = await fetch(url);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text(); // Get raw response
        console.log("Raw Response:", text); // Log to debug

        let data;
        try {
            data = JSON.parse(text); // Attempt to parse JSON
        } catch (jsonError) {
            throw new Error(`Invalid JSON response: ${text}`);
        }

        if (data === "Values Inserted Successfully!") {
            setSuccessMessage('Client Details Are Saved!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 2000);
        } else if (data === "Duplicate Entry!") {
            setToastMessage('Contact Number Already Exists!');
            setSeverity('error');
            setToast(true);
            setTimeout(() => {
                setToast(false);
            }, 2000);
        } else {
            alert(`The following error occurred while inserting data: ${data}`);
        }
    } catch (error) {
        console.error('Error while inserting data:', error);
        alert(`Error: ${error.message}`);
    }
};


  const insertLeadToDB = async () => {
    let row = currentCall.rowData;

    // Extract only the 10-digit number
    const cleanedPhone = row.Phone.replace(/^(\+91\s?)/, '').trim();

    const leadData = {
        JsonDBName: alternateCompanyName,
        JsonEntryUser: toTitleCase(userName),
        JsonLeadDate: formatDBDate(row.LeadDate),
        JsonLeadTime: formatDBTime(row.LeadTime),
        JsonPlatform: row.Platform,
        JsonClientName: row.Name,
        JsonClientContact: cleanedPhone,
        JsonClientEmail: row.Email,
        JsonDescription: row.Enquiry,
        JsonStatus: selectedStatus,
        JsonLeadType: "New",
        JsonPreviousStatus: "",
        JsonNextFollowupDate: formatDBDate(followupDate),
        JsonNextFollowupTime: formatDBTime(followupTime),
        JsonClientCompanyName: companyName,
        JsonRemarks: remarks,
        JsonHandledBy: toTitleCase(userName),
        JsonProspectType: prospectType,
        JsonIsUnreachable: 0,
        JsonSheetId: row.SNo
    };

    const response = await PostInsertOrUpdate("InsertLeadStatus", leadData);
    const anotherResponse = await insertEnquiry()
    return response && anotherResponse
};

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400); // 86400 seconds in a day
    const remainingSeconds = seconds % 86400;
    const hrs = Math.floor(remainingSeconds / 3600).toString().padStart(2, "0");
    const mins = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, "0");
    const secs = (remainingSeconds % 60).toString().padStart(2, "0");
  
    if (days > 0) {
      return `${days}d ${hrs}:${mins}:${secs}`;
    }
  
    return `${hrs}:${mins}:${secs}`;
  };
  
  
  // const handleCheckboxChange = () => {
  //   setHasSaved(true); // Set hasSaved to true when checkbox is checked
  // };	

  const checkIfNewClient = async (clientContact) => {
    try {
      const response = await fetch(
        `https://orders.baleenmedia.com/API/Media/CheckClientContact.php?ClientContact=${clientContact}&JsonDBName=${UserCompanyName}`
      );
      
      const data = await response.json();
      console.log(data, data.isNewUser)
      return data.isNewUser ? true : false; // Returns true if new user, false if existing
    } catch (error) {
      console.error("Error checking contact number:", error);
      return false; // Default to false in case of an error
    }
  };
  
  const fetchData = async () => {
    try {
      const filters = {
        leadDate: searchParams.leadDate || null,
        status: searchParams.status || "",
        followupDate: searchParams.followupDate || null,
      };

      const fetchedRows = await fetchDataFromAPI(params.id, filters, userName, UserCompanyName, appRights);
      setRows(fetchedRows);
      fetchCSENames();
      // console.log(fetchedRows)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userName || UserCompanyName === "") 
      {
        router.push("/login")
      };
    fetchData();
  }, [params.id, searchParams]);

    

  useEffect(() => {
    if (showModal) {
      // Set initial values when the modal is opened
      setInitialSelectedStatus(selectedStatus);
      setInitialFollowupDate(followupDate);
      setInitialFollowupTime(followupTime);
      setInitialCompanyName(companyName);
      setInitialRemarks(remarks);
      setInitialLeadStatus(selectedLeadStatus);
    }
  }, [showModal]); // Runs when the modal opens

  const handleCallButtonClick = async (phone, name, sNo, Platform, Enquiry, LeadDateTime, quoteSent, rowData) => {
    setCurrentCall({phone, name, sNo, Platform, Enquiry, LeadDateTime, quoteSent, rowData });

    // Trigger a call using `tel:` protocol
    window.location.href = `tel:${phone}`;

    // Simulate the call end before showing the modal
    setTimeout(() => {
      setShowModal(true);
    }, 3000);
  };

  const handleSave = async (Sno, quoteSent, sendQuoteOnly, user) => {

    // const initialQuoteStatus = currentCall?.quoteSent || "";
    setIsLoading(true);
    // Check if changes were made before proceeding
    const hasChanges =
    (selectedStatus || "") !== (initialSelectedStatus || "") ||
    (followupDate || "") !== (initialFollowupDate || "") ||
    (followupTime || "") !== (initialFollowupTime || "") ||
    (companyName || "") !== (initialCompanyName || "") ||
    (remarks || "") !== (initialRemarks || "") ||
    (selectedLeadStatus || "") !== (initialLeadStatus || "") ||
    (quoteSent || "") !== (initialQuoteStatus || "");
      
      if (!hasChanges) {
        setToastMessage("No changes have been made.");
        setSeverity('warning');
          setToast(true);
          setTimeout(() => {
            setToast(false);
          }, 2000);
        // setShowModal(false);
        setIsLoading(false);
        return;
      }
      
      if (selectedStatus === "Call Followup" && !prospectType) {
        setToastMessage("Please select a Prospect Type before saving.");
        setSeverity("error");
        setToast(true);
        setTimeout(() => {
          setToast(false);
        }, 2000);
        setIsLoading(false);
        return;
      }
    let payload = {};

    // Prepare payload based on context
    if (sendQuoteOnly === "Quote Sent") {
      payload = {
        sNo: Sno,
        quoteSent: quoteSent,
        handledBy: toTitleCase(userName),
        dbCompanyName: UserCompanyName || "Baleen Test"
      };
    } else if (followupOnly) {
      payload = {
        sNo: currentCall.sNo,
        followupDate: followupDate || "", // Ensure followupDate is a string or empty
        followupTime: followupTime || "", // Ensure followupTime is a string or empty
        handledBy: toTitleCase(userName),
        dbCompanyName: UserCompanyName || "Baleen Test"
      };
    } else if (sendQuoteOnly === "Handled By") {
      payload = {
        sNo: Sno,
        handledBy: toTitleCase(user),
        dbCompanyName: UserCompanyName || "Baleen Test"
      };
    }else {
      payload = {
        sNo: currentCall.sNo,
        status: selectedStatus,
        companyName: companyName || "", // Default to an empty string if undefined
        followupDate: followupDate || "",
        followupTime: followupTime || "",
        remarks: remarks || "",
        prospectType: prospectType || "",  // Include ProspectType
        handledBy: toTitleCase(userName),
        dbCompanyName: UserCompanyName || "Baleen Test",
        quoteSent: quoteSentChecked === true ? "Yes" : initialQuoteStatus
      };
    }
  
    
    try {
      const response = await fetch(
        "https://leads.baleenmedia.com/api/updateLeads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update lead");
      console.log(response)
      fetchData();
      if (!sendQuoteOnly) {
        setSuccessMessage('Lead updated successfully!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000); // 3000 milliseconds = 3 seconds
      }
      if (selectedStatus === "Call Followup") {
        const contact = {
          name: currentCall?.name,
          phone: currentCall?.phone,
          email: currentCall?.email || "",
        };
        downloadContact(contact); // Download the contact vCard
        try {
          if(initialSelectedStatus !== "Call Followup"){
            insertLeadToDB()
          }
        } catch (error) {
          alert("Error while inserting data: " + error)
        }
        
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      setToastMessage("Failed to update lead. Please try again.");
      setSeverity("error");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } finally {
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

      setIsLoading(false);
      setShowModal(false);
      setHideOtherStatus(false);
      setFollowpOnly(false);
      setSelectedStatus("");
      setRemarks("");
      setSelectedLeadStatus("");
      if (selectedStatus === "Unreachable") {
        setFollowupDate(false);
      } else {
        setFollowupDate(formattedDate);
        setFollowupTime(formattedTime);
      }
    }
  };  

  const handleRemoveFollowup = async (Sno) => {
    let payload = {};
  
      payload = {
        sNo: Sno,
        followupDate: "No Followup Date", // Ensure followupDate is a string or empty
        followupTime: "", // Ensure followupTime is a string or empty
      };
  
    try {
      const response = await fetch(
        "https://leads.baleenmedia.com/api/updateLeads",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) throw new Error("Failed to update lead");
      fetchData();
      setSuccessMessage("Followup removed successfully!");
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000); // 3000 milliseconds = 3 seconds
    } catch (error) {
      console.error("Error updating lead:", error);
      setToastMessage("Failed to update lead. Please try again.");
      setSeverity("error");
      setToast(true);
      setTimeout(() => {
        setToast(false);
      }, 2000);
    } finally {
      setShowModal(false);
      setHideOtherStatus(false);
      setFollowpOnly(false);
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
  
  const addNewFollowup = (phone, name, sNo, Platform, Enquiry, LeadDateTime, quoteSent) => {
    setCurrentCall({phone, name, sNo, Platform, Enquiry, LeadDateTime, quoteSent});

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
      <div>
        <LoadingComponent />
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
    await handleSave(sNo, setValue, "Quote Sent");
    // status !== 'Yes' ? alert("Marked as Quote Sent!") : alert("Marked as Quote Not Sent");
    const successMessage = status !== 'Yes' 
        ? "Marked as Quote Sent!" 
        : "Marked as Quote Not Sent";
    setSuccessMessage(successMessage);
    setTimeout(() => {
        setSuccessMessage('');
    }, 3000); // Hide the message after 3 seconds
  }


  const downloadContact  = (contact) => {
    // Fallback: Generate and download a vCard file
    const vcard =
      "BEGIN:VCARD\nVERSION:4.0\nFN:" +
      contact.name +
      "\nTEL;TYPE=work,voice:" +
      contact.phone +
      (contact.email ? "\nEMAIL:" + contact.email : "") +
      "\nEND:VCARD";
  
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
  
    // Create and click the download link
    const newLink = document.createElement("a");
    newLink.download = contact.name + ".vcf";
    newLink.href = url;
    document.body.appendChild(newLink);
    newLink.click();
    document.body.removeChild(newLink);
  
    //alert("vCard downloaded successfully!");
  };
  const handleFocus = (e) => {
    e.target.select();
  };

  const handleHandledByChange = (user, sNo) => {
    setIsHandledByChange(!isHandledByChange);
    setSelectedUser(user);
    setCurrentCall({sNo: sNo})
  }

  const handleUserChange = async(user) => {
    setSelectedUser(toTitleCase(user));
    console.log(user, currentCall.sNo)
    await handleSave(currentCall?.sNo, 'No', "Handled By", user);
    setIsHandledByChange(false);
  }

  
  // Inside your component
const handleStatusClick = async(row) => {
  setShowModal(true);

  // Set followup date and time if available
  if (row.FollowupDate !== "No Followup Date") {
    console.log("Followup date and time is updated: " + row.FollowupDate + row.FollowupTime)
    setFollowupDate(row.FollowupDate);
    setFollowupTime(row.FollowupTime);
  }else{
    console.log("Followup date time is skipped " + row.FollowupDate)
  }

  // Update the current call information
  setCurrentCall({
    phone: row.Phone,
    name: row.Name,
    sNo: row.SNo,
    Platform: row.Platform,
    Enquiry: row.Enquiry,
    LeadDateTime: `${row.LeadDate} ${row.LeadTime}`,
    quoteSent: row.QuoteSent,
    rowData: row,
  });

  // Set various status and remarks values
  
  setRemarks(row.Remarks);
  setCompanyName(row.CompanyName !== "No Company Name" ? row.CompanyName : '');
  setSelectedLeadStatus(row.ProspectType === "Unknown" ? "" : row.ProspectType);
  setQuoteSentChecked(row.QuoteSent === "Yes")
  setSelectedStatus(row.Status);
};

  return (

    <div className="p-4 text-black">
      {/* Top Bar with Filter and Report Buttons */}
    <div className="flex justify-between items-center mb-4 sticky top-0 left-0 right-0 z-10 bg-white p-3">
    <h2 className="text-xl font-semibold text-blue-500">
    {UserCompanyName === "Baleen Test" ? "Lead Manager Test" : "Lead Manager"}
  </h2>

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
         <a href="/LeadManager/Report">
          <button
            className="flex items-center px-3 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 border border-blue-500"
          >
            <FaFileAlt className="mr-2 text-lg" />
            Report
          </button>
        </a> 
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
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          onClick={handleFocus}
        />
       <button
        onClick={() => {
          if (statusFilter !== 'All' || prospectTypeFilter !== 'All' || fromDate || toDate || quoteSentFilter !== "All" || CSEFilter !== "All") {
            clearFilters(); // If any filters or search query is active, clear them
          } else {
            toggleFilters(); // Otherwise, toggle filter visibility
          }
        }}
        className="ml-2 p-2 sm:p-3 bg-blue-500 text-white rounded-lg focus:outline-none hover:bg-blue-600"
      >
        {statusFilter !== 'All' || prospectTypeFilter !== 'All' || fromDate || toDate || quoteSentFilter !== "All" || CSEFilter !== "All" ? (
          <FaTimes size={20} /> // Clear icon if any filter or search query is active
        ) : (
          <FaFilter size={20} /> // Filter icon if no filter or search query is active
        )}
      </button>

      </div>

       {/* Filters */}
       {filtersVisible && (
        <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-2 sm:gap-4">
          {/* Status Filter Buttons */}
          <div className="flex gap-1 sm:gap-4 bg-gray-200 w-fit rounded-lg p-1 overflow-x-auto">
            {["All", "New", "Call Followup", "Unreachable"].map((status, index) => (
              <motion.button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-base ${
                  statusFilter === status
                    ? "bg-white text-gray-700"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-gray-300`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {status}
              </motion.button>
            ))}
          </div>

          {/* Prospect Type Filter */}
          <div className="flex gap-1 sm:gap-4 bg-gray-200 w-fit rounded-lg p-1 overflow-x-hidden">
            {prospectTypes.map((item, index) => (
              <motion.button
                key={item.type}
                onClick={() => setProspectTypeFilter(item.type)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-base ${
                  prospectTypeFilter === item.type
                    ? "bg-white text-gray-700"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-gray-300`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.type}
              </motion.button>
            ))}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-1 sm:gap-4 bg-gray-200 w-fit rounded-lg p-1 overflow-x-auto">
            {["All", "Quote Sent", "Yet To Send"].map((status, index) => (
              <motion.button
                key={status}
                onClick={() => setQuoteSentFilter(status)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-base ${
                  quoteSentFilter === status
                    ? "bg-white text-gray-700"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-gray-300`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {status}
              </motion.button>
            ))}
          </div>
          
          <div className="flex gap-1 sm:gap-4 bg-gray-200 w-fit rounded-lg p-1 overflow-x-auto">
            {[
              { username: "All" }, // Add "All" at the beginning
              ...CSENames].map((status, index) => (
              <motion.button
                key={status.username}
                onClick={() => setCSEFilter(toTitleCase(status.username))}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-base ${
                  CSEFilter === toTitleCase(status.username)
                    ? "bg-white text-gray-700"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-gray-300`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {toTitleCase(status.username)}
              </motion.button>
            ))}
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-row gap-2 sm:gap-4">
            {/* From Date Picker */}
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="px-2 py-1 sm:px-6 sm:py-3 w-32 sm:w-40 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="From Date"
              dateFormat="dd-MMM-yyyy"
            />
            {/* To Date Picker */}
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="px-2 py-1 sm:px-6 sm:py-3 w-32 sm:w-40 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholderText="To Date"
              dateFormat="dd-MMM-yyyy"
            />
          </div>
        </div>
        
      )}
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
            className={`relative rounded-lg p-4 border-2 hover:shadow-lg hover:-translate-y-2 bg-white hover:transition-all border-gray-200 
              ${timers[row.SNo] > 86400 ? " animate-pulse bg-green-600`" : ""}
            `}
            style={{ minHeight: "240px" }}
          >

            {/* Status at Top Right */}
            <div className="absolute top-2 right-2">
              <span
                onClick={() => {handleStatusClick(row)}}
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
            {row.Status === 'Call Followup' && (
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
          )}
            
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
                  onClick={() => {handleCallButtonClick(row.Phone, row.Name, row.SNo, row.Platform, row.Enquiry, row.LeadDate + " " + row.LeadTime, row.QuoteSent, row); setCompanyName(row.CompanyName !== 'No Company Name' ? row.CompanyName : ''); setRemarks(row.Remarks); setSelectedStatus(row.Status)}}
                  className="text-blue-600 hover:underline ml-1"
                >
                  <strong>{row.Phone}</strong>
                </a>
                <button
                  className="ml-2 p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  onClick={() => {handleCallButtonClick(row.Phone, row.Name, row.SNo, row.Platform, row.Enquiry, row.LeadDate + " " + row.LeadTime, row.QuoteSent, row); setCompanyName(row.CompanyName !== 'No Company Name' ? row.CompanyName : ''); setRemarks(row.Remarks); setSelectedStatus(row.Status)}}
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
                  <div className={`${timers[row.SNo] > 86400 ? "bg-red-100 text-red-500 animate-bounce" : "bg-blue-100 text-blue-500"} relative group border font-semibold p-2 rounded-md justify-self-end hover:cursor-wait hover:bg-blue-500 hover:text-white `}>
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

      {/*Modal for Assignee Change*/}
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
            {(!hideOtherStatus && !followupOnly) &&
            <div className="mb-4 flex flex-wrap gap-1 justify-center">
              {CSENames.map(
                (user) => (
                  <label
                    key={user.usernamer}
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
            }
            </div>
            </div>
            )}

      {/* Modal for Call Status */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg w-auto max-w-md mb-16 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Lead Status</h3>
              <button onClick={() => {setShowModal(false); setHideOtherStatus(false); setFollowpOnly(false); setFollowupDate(followupDate); setFollowupTime(followupTime)}}>
                <AiOutlineClose className="text-gray-500 hover:text-gray-700 text-2xl" />
              </button>
            </div>
            <p>Originated At: <strong>{currentCall.LeadDateTime}</strong></p>
            <p className="mb-2">
            Lead Info: <strong>{currentCall.name} - {currentCall.Platform} - {currentCall.Enquiry}</strong> 
            </p>
            {/* <div>
            <label className=" mb-2 flex items-center space-x-2 ">
              <input
                className="form-checkbox h-4 w-4 text-blue-600 transition-transform duration-300 transform hover:scale-110"
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) handleCheckboxChange();
                }}
              />
              <span className="text-gray-800 font-medium">Save the contact</span>
            </label>
            </div> */}
            {/* Floating Radio Buttons for Status */}
            {(!hideOtherStatus && !followupOnly) &&
            <div className="mb-4 flex flex-wrap gap-1 justify-center">
              {["New", "Call Followup", "Won", "Unreachable", "Unqualified", "Lost"].map(
                (status) => (
                  <label
                    key={status}
                    className={`cursor-pointer border py-1 px-3 text-sm rounded-full ${
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
              {selectedStatus === "Call Followup" && (
                <div>
                <label className=" mb-2 flex items-center space-x-2 ">
                  <input
                    className="form-checkbox h-4 w-4 text-blue-600 transition-transform duration-300 transform hover:scale-110"
                    type="checkbox"
                    checked={quoteSentChecked}
                    onChange={() => setQuoteSentChecked((prev) => !prev)}
                  />
                  <span className="text-gray-800 font-medium">Quote Sent to Client</span>
                </label>
                </div> 
              )}
            {(selectedStatus === "Call Followup" || selectedStatus === "Unreachable") && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Followup Date and Time
                </label>
                <DatePicker
                 selected={new Date(`${followupDate} ${followupTime}`)}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeFormat="h:mm aa" // Sets the format for time (12-hour format with AM/PM)
                  timeIntervals={15} // Time interval options (15 minutes in this case)
                  timeCaption="Time" // Caption for time section
                  dateFormat="dd MMM yyyy h:mm aa" // Displays date and time together
                  className="border border-gray-300 p-2 rounded-md w-full"
                  calendarClassName="bg-white border border-gray-200 rounded-md"
                />
              </div>
            )}

            {!followupOnly && 
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
            }
            
            {/* Remarks */}
            {!followupOnly &&
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
            }
            {/* Lead Status Buttons */}
            {selectedStatus === "Call Followup" && (
            <div className="mb-4 flex justify-center gap-4">
              {[
                { label: "Hot", icon: <GiCampfire />, color: "red" },
                { label: "Warm", icon: <MdOutlineWbSunny />, color: "yellow" },
                { label: "Cold", icon: <FaRegSnowflake />, color: "blue" },
              ].map(({ label, icon, color }) => (
                <button
                  key={label}
                  value={prospectType}
                  onClick={() => {
                    setSelectedLeadStatus((prev) => (prev === label ? "" : label)); 
                    setProspectType((prev) => (prev === label ? "" : label)); 
                  }}
                  className={`flex items-center gap-1 px-3 py-1 border rounded-full transition-transform duration-300 text-sm ${
                    selectedLeadStatus === label
                      ? `bg-${color}-500 text-white shadow-lg transform scale-105`
                      : label === "Hot"
                      ? "text-red-500 border-red-500 bg-red-100 inline-block mr-1 animate-flicker"
                      : `bg-${color}-100 border-${color}-300 text-${color}-500 hover:bg-${color}-200`
                  }`}
                >
                  <span
                    className={`inline-block ${
                      selectedLeadStatus === label ? `text-white` : `text-${color}-500`
                    }`}
                  >
                    {icon}
                  </span>
                  {label}
                </button>
              ))}
            </div>
            )}

            <div className="flex justify-end">
            <button
              className={`px-4 py-2 rounded-md text-white ${
                isLoading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={handleSave}
              disabled={!selectedStatus || isLoading} // Disable button during loading..
            >
              {isLoading ? (
                <span>Loading...</span> // Change text when loading
              ) : (
                "Save"
              )}
            </button>
          </div>

          </div>
          {toast && <ToastMessage message={toastMessage} type="error"/>}
          {toast && <ToastMessage message={toastMessage} type="warning"/>}
        </div>
      )}
      {/* ToastMessage component */}
      {successMessage && <SuccessToast message={successMessage} />}
      
    </div>
  );
};

async function fetchDataFromAPI(queryId, filters, userName, dbCompanyName, appRights) {
  const apiUrl = `https://leads.baleenmedia.com/api/fetchLeads`; // replace with the actual endpoint URL

  const urlWithParams = `${apiUrl}?dbCompanyName=${encodeURIComponent(dbCompanyName)}`;

  const response = await fetch(urlWithParams, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  const today = new Date().toDateString();

  const filteredData = data.rows.filter(
    (lead) =>
      (lead.Status !== "Unqualified" &&
       lead.Status !== "Won" &&
       lead.Status !== "Lost") &&
      (appRights === "Leadership" || 
       (!lead['HandledBy'] || lead['HandledBy'].toLowerCase() === userName.toLowerCase()))
  );

  const sortedRows = filteredData.sort((a, b) => {
    const today = new Date().setHours(0, 0, 0, 0); // Normalize today's date
    const now = new Date(); // Current time
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes for comparison
  
    const aFollowupDate = new Date(a.FollowupDate).setHours(0, 0, 0, 0);
    const bFollowupDate = new Date(b.FollowupDate).setHours(0, 0, 0, 0);
    const aFollowupTime = a.FollowupTime
      ? parseInt(a.FollowupTime.split(":")[0], 10) * 60 + parseInt(a.FollowupTime.split(":")[1], 10)
      : null;
    const bFollowupTime = b.FollowupTime
      ? parseInt(b.FollowupTime.split(":")[0], 10) * 60 + parseInt(b.FollowupTime.split(":")[1], 10)
      : null;
    const aLeadDate = new Date(a.LeadDate).setHours(0, 0, 0, 0);
    const bLeadDate = new Date(b.LeadDate).setHours(0, 0, 0, 0);
  
    // Define status priorities
    const statusPriority = {
      "Call Followup": 2,
      New: 1,
      Unreachable: 3,
    };
  
    // Determine the relevant date
    const aRelevantDate =
      aFollowupDate > today ? aLeadDate : aFollowupDate || aLeadDate;
    const bRelevantDate =
      bFollowupDate > today ? bLeadDate : bFollowupDate || bLeadDate;
  
    // For today's leads, check FollowupTime priority
    const isAToday = aFollowupDate === today;
    const isBToday = bFollowupDate === today;
  
    if (isAToday && isBToday) {
      if (aFollowupTime !== null && bFollowupTime !== null) {
        // Sort leads with followup time ≤ current time on top
        if (aFollowupTime <= currentTime && bFollowupTime > currentTime) return -1;
        if (bFollowupTime <= currentTime && aFollowupTime > currentTime) return 1;
      }
    } else if (isAToday || isBToday) {
      // Ensure today's leads come before others
      return isAToday ? -1 : 1;
    }
  
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

  return (
    <article>
      <EventCards params = {params} searchParams = {searchParams}/>
    </article>
  );
}