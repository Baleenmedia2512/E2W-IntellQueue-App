'use client'
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Clock, User, BarChart2, Filter } from "lucide-react";
import { useAppSelector } from "@/redux/store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Leaddiv from "./leadDiv";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FetchActiveCSE } from "@/app/api/FetchAPI";
import { toTitleCase } from "../page";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";

// Utility functions to get start and end of day
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const convertTo24Hour = (timeStr) => {
  if (!timeStr) return "";
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier.toLowerCase() === "pm" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toLowerCase() === "am" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const convertTimeToTimestamp = (timeStr, baseDate = new Date()) => {
  if (!timeStr) return null;
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier.toLowerCase() === "pm" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toLowerCase() === "am" && hours === 12) {
    hours = 0;
  }
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};


const LeadReport = () => {
  const router = useRouter();
  const isMdOrLarger = useMediaQuery({ minWidth: 768 });
  const { userName, dbName: UserCompanyName } = useAppSelector(state => state.authSlice);

  // State management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [CSENames, setCSENames] = useState([]);

  // Filter states
  const [platformFilter, setPlatformFilter] = useState("");
  const [handledByFilter, setHandledByFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tatFilter, setTatFilter] = useState(""); // "safe", "average", "delayed"
  const [fromDate, setFromDate] = useState(() => getStartOfDay(new Date()));
  const [toDate, setToDate] = useState(() => getEndOfDay(new Date()));

  // Transform a raw row into a lead object
  const transformRow = useCallback((row) => {
    try {
      const leadDate = row.LeadDate ? getStartOfDay(new Date(row.LeadDate)) : null;
      const statusChangeDate = row.DateOfStatusChange ? new Date(row.DateOfStatusChange) : null;
      const leadDateTime = row.LeadTime ? new Date(convertTimeToTimestamp(row.LeadTime, leadDate)) : null;
      const statusChangeDateTime = row.LastStatusChangeTime ? new Date(convertTimeToTimestamp(row.LastStatusChangeTime, statusChangeDate)) : null;
      console.log(statusChangeDateTime)
      // const statusChangeDateTime = statusChangeDate ? new Date(statusChangeDate + " " + statusChangeTime) : null
      // Compute TAT in hours only if a status change exists
      const tat = (leadDate && statusChangeDate)
        ? ((statusChangeDateTime - leadDateTime) / (1000 * 60 * 60)).toFixed(2)
        : null;
      return {
        sNo: row.SNo || Date.now().toString(),
        date: row.LeadDate || "N/A",
        time: (row.LeadTime && row.LeadTime.trim()) || "N/A",
        platform: row.Platform || "N/A",
        name: row.Name || "N/A",
        phoneNumber: row.Phone || "N/A",
        email: row.Email || "N/A",
        enquiry: row.Enquiry || "N/A",
        status: row.Status || "N/A",
        statusChangeDate: row.DateOfStatusChange || "N/A",
        leadType: row.LeadType || "N/A",
        handledBy: row.HandledBy || "N/A",
        statusChangedTime: row.LastStatusChangeTime || "N/A",
        previousStatus: row.PreviousStatus || "N/A",
        tat, // numeric value in hours (or null if not available)
        // For UI display – if tat is null then show "Unattended"
        displayTAT: tat === null ? "Unattended" : `${tat}h`,
        // Mark unattended if no status change date/time
        unattended: statusChangeDate === null,
        leadDate,
      };
    } catch (err) {
      console.error("Error transforming row:", err);
      return null;
    }
  }, []);

  // Optimized fetch for leads with error handling
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("https://leads.baleenmedia.com/api/fetchLeads");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.rows || !Array.isArray(data.rows)) throw new Error("Invalid data format received");

      const validLeads = data.rows
        .map(transformRow)
        .filter(lead => lead !== null);
      setLeads(validLeads);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transformRow]);

  // Initial data fetch & fetch CSENames concurrently
  useEffect(() => {
    if (!userName || !UserCompanyName) {
      router.push("/login");
      return;
    }
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchData(),
          FetchActiveCSE(UserCompanyName).then(data => setCSENames(data))
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    initializeData();
  }, [userName, UserCompanyName, router, fetchData]);

  // Memoize filtered leads based on all active filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesDate = lead.leadDate >= fromDate && lead.leadDate <= toDate;
      const matchesPlatform = !platformFilter || lead.platform === platformFilter;
      const matchesHandler = !handledByFilter || lead.handledBy === handledByFilter;
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesTat = !tatFilter || (
        // Only consider leads with a valid TAT (numeric value) for filtering
        lead.tat !== null && (
          tatFilter === "safe" ? lead.tat <= 24 :
          tatFilter === "average" ? lead.tat > 24 && lead.tat <= 72 :
          tatFilter === "delayed" ? lead.tat > 72 : true
        )
      );
      return matchesDate && matchesPlatform && matchesHandler && matchesStatus && matchesTat;
    });
  }, [leads, fromDate, toDate, platformFilter, handledByFilter, statusFilter, tatFilter]);

  // Calculate average TAT for summary card using only leads with a valid TAT
  const avgTAT = useMemo(() => {
    const validTATLeads = filteredLeads.filter(lead => lead.tat !== null);
    return validTATLeads.length > 0
      ? validTATLeads.reduce((sum, lead) => sum + parseInt(lead.tat), 0) / validTATLeads.length
      : null;
  }, [filteredLeads]);

  // Prepare chart data (analytics) – only averaging TAT for leads with computed values
  const chartData = useMemo(() => {
    const aggregation = {};
    filteredLeads.forEach(lead => {
      if (!lead.leadDate) return;
      const dateKey = lead.leadDate.toISOString().split('T')[0];
      if (!aggregation[dateKey]) {
        aggregation[dateKey] = { date: dateKey, count: 0, totalTAT: 0, tatCount: 0 };
      }
      aggregation[dateKey].count += 1;
      if (lead.tat !== null) {
        aggregation[dateKey].totalTAT += lead.tat;
        aggregation[dateKey].tatCount += 1;
      }
    });
    return Object.values(aggregation).map(entry => ({
      date: entry.date,
      count: entry.count,
      avgTAT: entry.tatCount > 0 ? Number((entry.totalTAT / entry.tatCount).toFixed(2)) : 0
    }));
  }, [filteredLeads]);

  // Reset filters to default values
  const handleReset = useCallback(() => {
    setFromDate(getStartOfDay(new Date()));
    setToDate(getEndOfDay(new Date()));
    setPlatformFilter("");
    setHandledByFilter("");
    setStatusFilter("");
    setTatFilter("");
    if (!isMdOrLarger) setShowFilters(false);
  }, [isMdOrLarger]);

  if (error) return <div className="text-center text-red-500 p-8">Error: {error}</div>;

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
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button
          onClick={handleReset}
          disabled={
            platformFilter === "" && handledByFilter === "" && statusFilter === "" && tatFilter === "" &&
            fromDate.toDateString() === getStartOfDay(new Date()).toDateString() &&
            toDate.toDateString() === getEndOfDay(new Date()).toDateString()
          }
          className={`px-4 py-2 ${
            (platformFilter || handledByFilter || statusFilter || tatFilter ||
             fromDate.toDateString() !== getStartOfDay(new Date()).toDateString() ||
             toDate.toDateString() !== getEndOfDay(new Date()).toDateString())
              ? "bg-blue-500" : "bg-gray-300 cursor-not-allowed"
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
              onChange={(date) => setFromDate(getStartOfDay(date))} 
              maxDate={new Date()}
              className="w-full p-2 border rounded-md"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">To Date</label>
            <DatePicker 
              selected={toDate} 
              onChange={(date) => setToDate(getEndOfDay(date))} 
              maxDate={new Date()}
              className="w-full p-2 border rounded-md"
              dateFormat="dd/MM/yyyy"
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
              <option value="Self">Self</option>
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
              {CSENames.map((cse, idx) => (
                <option key={idx} value={toTitleCase(cse.username)}>
                  {toTitleCase(cse.username)}
                </option>
              ))}
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
              <option value="safe">Safe (≤ 24h)</option>
              <option value="average">Average (≤ 72h)</option>
              <option value="delayed">Delayed (&gt; 72h)</option>
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
              <p className="text-3xl font-bold text-gray-900">
                {avgTAT !== null ? `${avgTAT.toString()}h` : "Unattended"}
              </p>
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
            <Leaddiv key={lead.sNo || index} lead={lead} index={index} />
          ))
        ) : (
          <p className="text-center">No lead report for the selected Date Range</p>
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
