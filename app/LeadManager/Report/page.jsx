'use client'
import React, { useEffect, useState } from "react";
import { Clock,User} from "lucide-react";
import { useAppSelector } from "@/redux/store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Leaddiv from "./leadDiv";

const parseDate = (str) => {
  const parts = str.split("-");
  return new Date(parts[2], parts[1] - 1, parts[0]);
};

const LeadReport = () => {
  const [leads, setLeads] = useState([]);

  // Transform a Google Sheets row into a lead object
  const transformRow = (row) => {
    // Convert LeadDate and ArrivedDate to Date objects
    const leadDate = row.LeadDate ? new Date(row.LeadDate) : null;
    const responseData = row.DateOfStatusChange ? new Date(row.DateOfStatusChange) : null;
  
    // Calculate TAT (difference in days)
    let tat = 0;
    if (leadDate && responseData) {
      const timeDiff = responseData - leadDate; // Difference in milliseconds
      tat = Math.round(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days
    }

    console.log(row);
    return {
      sNo: row.SNo || "N/A",
      date: row.LeadDate || "N/A",
      time: row.LeadTime && row.LeadTime.trim() !== "" ? row.LeadTime : "N/A",
      platform: row.Platform || "N/A",
      name: row.Name || "N/A",
      phoneNumber: row.Phone || "N/A",
      email: row.Email || "N/A",
      enquiry: row.Enquiry || "N/A",
      status: row.Status || "N/A",
      statusChangeDate: row.DateOfStatusChange || "N/A",
      leadType: row.LeadType || "N/A",
      previousStatus: row.PreviousStatus || "N/A",
      followupDate: row.FollowupDate || "N/A",
      followupTime: row.FollowupTime || "N/A",
      companyName: row.CompanyName || "N/A",
      remarks: row.Remarks || "N/A",
      quoteSent: row.QuoteSent || "N/A",
      prospectType: row.ProspectType || "N/A",
      handledBy: row.HandledBy || "N/A",
      statusChangedTime: row.LastStatusChangeTime || "N/A",
      tat: tat, // Computed TAT
      arrivedDate: row.ArrivedDate || "N/A",
      arrivedTime: row.ArrivedTime || "N/A",
      isUnreachable: row.IsUnreachable || "N/A",
    };
  };
  
  const {userName, appRights, dbName: UserCompanyName, companyName: alternateCompanyName} = useAppSelector(state => state.authSlice);

  useEffect(() => {
    fetch("https://leads.baleenmedia.com/api/fetchLeads")
      .then((res) => res.json())
      .then((data) => {
  
        if (!data.rows || !Array.isArray(data.rows)) {
          throw new Error("Invalid data format received");
        }
  
        // Transform and filter leads with a valid statusChangeDate
        const transformedLeads = data.rows
          .map(transformRow)
          .filter((lead) => lead.statusChangeDate !== "N/A" && lead.statusChangeDate); 
        
        setLeads(transformedLeads);
      })
      .catch((error) => {
        console.error("Error fetching leads: ", error);
      });
  }, []);
  
  

  // Calculate average TAT (Total Turnaround Time)
  const avgTAT =
    leads.length > 0
      ? (leads.reduce((sum, lead) => sum + lead.tat, 0) / leads.length).toFixed(2)
      : 0;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-3 mb-8">
        <h1 className="text-3xl font-semibold text-blue-500">Lead Report</h1>
        <p className="text-gray-500 text-lg">
          A detailed overview of lead information and statuses
        </p>
      </div>

      {/* Date Picker Fields with Reset Button */}
      <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0 mb-8">
        <div className="">
          <label className="mb-1 block text-sm font-medium text-gray-700">From Date</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            placeholderText="Select From Date"
            className="w-full p-2 border rounded-md"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="">
          <label className="mb-1 block text-sm font-medium text-gray-700">To Date</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            placeholderText="Select To Date"
            className="w-full p-2 border rounded-md"
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={handleReset}
            className="mt-6 px-4 py-2 bg-blue-500 text-gray-100 rounded-md hover:bg-blue-700 transition"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border rounded-xl bg-slate-50 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <User className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>
        <div className="p-6 border rounded-xl bg-slate-50 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Average TAT</p>
              <p className="text-3xl font-bold text-gray-900">{avgTAT}h</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-full">
              <Clock className="w-8 h-8 text-blue-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {leads.map((lead, index) => (
          <Leaddiv key={index} lead={lead} index={index} />
        ))}
      </div>
    </div>
  );
};

export default LeadReport;