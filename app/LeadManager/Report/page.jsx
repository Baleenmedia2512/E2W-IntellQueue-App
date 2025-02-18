'use client'
import React, { useEffect, useState } from "react";
import { Clock, User, BarChart2, Filter } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Leaddiv from "./leadDiv";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FetchActiveCSE } from "@/app/api/FetchAPI";
import { toTitleCase } from "../page";
import { useMediaQuery } from "react-responsive";

const LeadReport = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const isMdOrLarger = useMediaQuery({ minWidth: 768 });
  
  // Date filters
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [CSENames, setCSENames] = useState([]);
  
  // Other filters
  const [platformFilter, setPlatformFilter] = useState("");
  const [handledByFilter, setHandledByFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tatFilter, setTatFilter] = useState(""); // "safe", "average", "delayed"
  
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Transform a Google Sheets row into a lead object
  const transformRow = (row) => {
    const leadDate = row.LeadDate ? new Date(row.LeadDate) : null;
    const responseData = row.DateOfStatusChange ? new Date(row.DateOfStatusChange) : null;

    let tat = 0;
    if (leadDate && responseData) {
      const timeDiff = responseData - leadDate;
      tat = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    }

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
      tat: tat,
      arrivedDate: row.ArrivedDate || "N/A",
      arrivedTime: row.ArrivedTime || "N/A",
      isUnreachable: row.IsUnreachable || "N/A",
      // Store the Date object for filtering purposes
      leadDate: leadDate,
    };
  };

  const { userName, appRights, dbName: UserCompanyName, companyName: alternateCompanyName } = useAppSelector(state => state.authSlice);

  const fetchCSENames = async () => {
    let data = await FetchActiveCSE(UserCompanyName);
    setCSENames(data)
  };

  useEffect(() => {
    setLoading(true);
    fetch("https://leads.baleenmedia.com/api/fetchLeads")
      .then((res) => res.json())
      .then((data) => {
        if (!data.rows || !Array.isArray(data.rows)) {
          throw new Error("Invalid data format received");
        }

        const transformedLeads = data.rows
          .map(transformRow)
          .filter((lead) => lead.statusChangeDate !== "N/A" && lead.statusChangeDate);
        fetchCSENames()
        setLeads(transformedLeads);
        setFilteredLeads(transformedLeads); // Set initial filtered leads
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leads: ", error);
        setLoading(false);
      });
  }, []);

  // Filtering function that applies all filters
  const filterLeads = () => {
    let updatedLeads = [...leads];

    // Date Range Filter
    if (fromDate && toDate) {
      updatedLeads = updatedLeads.filter((lead) => {
        if (!lead.leadDate) return false;
        return lead.leadDate >= fromDate && lead.leadDate <= toDate;
      });
    }

    // Platform Filter
    if (platformFilter) {
      updatedLeads = updatedLeads.filter(lead => lead.platform === platformFilter);
    }

    // HandledBy Filter
    if (handledByFilter) {
      updatedLeads = updatedLeads.filter(lead => lead.handledBy === handledByFilter);
    }

    // Lead Status Filter
    if (statusFilter) {
      updatedLeads = updatedLeads.filter(lead => lead.status === statusFilter);
    }

    // TAT Filter
    if (tatFilter) {
      if (tatFilter === "safe") {
        updatedLeads = updatedLeads.filter(lead => lead.tat <= 24);
      } else if (tatFilter === "average") {
        updatedLeads = updatedLeads.filter(lead => lead.tat > 24 && lead.tat <= 72);
      } else if (tatFilter === "delayed") {
        updatedLeads = updatedLeads.filter(lead => lead.tat > 72);
      }
    }

    setFilteredLeads(updatedLeads);
  };

  useEffect(() => {
    filterLeads();
  }, [fromDate, toDate, platformFilter, handledByFilter, statusFilter, tatFilter, leads]);

  // Calculate average TAT (Total Turnaround Time)
  const avgTAT =
    filteredLeads.length > 0
      ? (filteredLeads.reduce((sum, lead) => sum + lead.tat, 0) / filteredLeads.length).toFixed(2)
      : 0;

  const handleReset = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setPlatformFilter("");
    setHandledByFilter("");
    setStatusFilter("");
    setTatFilter("");
    setFilteredLeads(leads);
    if (!isMdOrLarger) setShowFilters(false);
  };

  // Aggregate analytics data by lead date:
  // For each lead date, calculate the number of leads and average TAT.
  // Aggregate analytics data by lead date (within selected date range)
const aggregatedData = {};
filteredLeads.forEach((lead) => {
  if (lead.leadDate) {
    const dateStr = lead.leadDate.toISOString().split("T")[0]; // Format as "yyyy-MM-dd"

    if (!aggregatedData[dateStr]) {
      aggregatedData[dateStr] = { date: dateStr, count: 0, totalTAT: 0 };
    }
    aggregatedData[dateStr].count += 1;
    aggregatedData[dateStr].totalTAT += lead.tat;
  }
});

const isFilterApplied = () => {
  return (
    platformFilter !== "" ||
    handledByFilter !== "" ||
    statusFilter !== "" ||
    tatFilter !== "" ||
    fromDate.toDateString() !== new Date().toDateString() ||
    toDate.toDateString() !== new Date().toDateString()
  );
};

// Convert aggregated data into chart-compatible format
const chartData = Object.values(aggregatedData)
  .filter((item) => {
    const leadDate = new Date(item.date);
    return leadDate >= fromDate && leadDate <= toDate; // Filter by selected date range
  })
  .map((item) => ({
    date: item.date,
    count: item.count,
    avgTAT: item.count > 0 ? Number((item.totalTAT / item.count).toFixed(2)) : 0,
  }));
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-blue-500">Lead Report</h1>
        <button
          onClick={() => setShowAnalytics(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
        >
          <BarChart2 size={18} /> Show Analytics
        </button>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden flex justify-between items-center gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 flex-1 justify-center"
        >
          <Filter size={18} /> 
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button
          onClick={handleReset}
          disabled={!isFilterApplied()}
          className={`px-4 py-2 ${
            isFilterApplied() ? "bg-blue-500" : "bg-gray-300 cursor-not-allowed"
          } text-white rounded-md flex-1 justify-center`}
        >
          Reset Filters
        </button>
      </div>

      {/* Filters Section */}
      {(showFilters || isMdOrLarger) && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium">From Date</label>
            <DatePicker 
              selected={fromDate} 
              onChange={setFromDate} 
              maxDate={new Date()}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">To Date</label>
            <DatePicker 
              selected={toDate} 
              onChange={setToDate} 
              maxDate={new Date()}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Platform</label>
            <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="Meta">Meta</option>
            <option value="Justdial">Justdial</option>
            <option value="IndiaMart">IndiaMart</option>
            <option value="Sulekha">Sulekha</option>
            <option value="LG">LG</option>
            <option value="Consultant">Consultant</option>
            <option value="Own">Own</option>
            <option value="WebApp DB">WebApp DB</option>
            <option value="Online">Online</option>
            <option value="Online">Self</option>
            <option value="Friends/Relatives">Friends/Relatives</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Handled By</label>
          <select
            value={handledByFilter}
            onChange={(e) => setHandledByFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All</option>
            {CSENames.map((cse) => {
             return <option value={toTitleCase(cse.username)}>{toTitleCase(cse.username)}</option>
            })}
          </select>
          
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Lead Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Call Followup">Call Followup</option>
            <option value="Unreachable">Unreachable</option>
            <option value="Lost">Lost</option>
            <option value="Unqualified">Unqualified</option>
            {/* Add additional statuses as needed */}
          </select>
          </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">TAT</label>
          <select
            value={tatFilter}
            onChange={(e) => setTatFilter(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="safe">Safe (≤ 1 day)</option>
            <option value="average">Average (≤ 3 days)</option>
            <option value="delayed">Delayed ({'>'} 3 days)</option>
          </select>
        </div>
        </div>
      )}

      <button
        onClick={handleReset}
        className="hidden md:flex mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Reset Filters
      </button>

      {/* Loader */}
      {loading && <p className="text-center">Loading leads...</p>}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 border rounded-xl bg-slate-50 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{filteredLeads.length}</p>
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
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead, index) => (
            <Leaddiv key={index} lead={lead} index={index} />
          ))
        ) : (
          <p>No lead report for the selected Date Range</p>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-1/2">
            <h2 className="text-xl font-bold mb-4">Lead Analytics by Date</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="No. of Leads" />
                <Line yAxisId="right" type="monotone" dataKey="avgTAT" stroke="#ff7300" name="Avg TAT (Hrs.)" />
              </ComposedChart>
            </ResponsiveContainer>
            <button
              onClick={() => setShowAnalytics(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadReport;
