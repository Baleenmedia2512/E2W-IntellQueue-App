'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Download, Calendar, Filter, RefreshCw, Users, TrendingUp, Clock, Award, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store';
import { FetchActiveCSE, FetchExistingLeads, FetchLeadsData } from '@/app/api/FetchAPI';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Utility functions to get start and end of day as Date objects
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

// Convert a 12-hour (AM/PM) time string into a timestamp using a base date.
const convertTimeToTimestamp = (timeStr, baseDate = new Date()) => {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(" ");
  if (parts.length === 1) {
    const [hours, minutes] = parts[0].split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }
  const [time, modifier] = parts;
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

// Title case utility function
export const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DSRPage = () => {
  const router = useRouter();
  const { userName, dbName: UserCompanyName } = useAppSelector((state) => state.authSlice);
  
  // Set default dates to today
  const today = new Date();
  const [fromDate, setFromDate] = useState(getStartOfDay(today));
  const [toDate, setToDate] = useState(getEndOfDay(today));
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('');
  const [handledByFilter, setHandledByFilter] = useState('');
  const [CSENames, setCSENames] = useState([]);

  // Transform a raw row into a lead object
  const transformRow = useCallback((row) => {
    try {
      const leadDate = row.LeadDate ? getStartOfDay(new Date(row.LeadDate)) : null;
      const statusChangeDate = row.DateOfStatusChange ? new Date(row.DateOfStatusChange) : null;
      const leadDateTime = row.LeadTime ? new Date(convertTimeToTimestamp(row.LeadTime, leadDate)) : null;
      const statusChangeDateTime = row.LastStatusChangeTime ? new Date(convertTimeToTimestamp(row.LastStatusChangeTime, statusChangeDate)) : null;
      
      return {
        SNo: row.SNo || Date.now().toString(),
        LeadDate: row.LeadDate || "N/A",
        LeadTime: (row.LeadTime && row.LeadTime.trim()) || "N/A",
        Status: row.Status || "N/A",
        Source: row.Platform || "N/A",
        Name: row.Name || "N/A",
        Phone: row.Phone || "N/A",
        Email: row.Email || "N/A",
        Company: row.CompanyName || "N/A",
        BusinessCategory: row.Enquiry || "N/A",
        FollowupDate: row.DateOfStatusChange || "N/A",
        Remarks: row.Remarks || "No remarks",
        HandledBy: row.HandledBy || "N/A",
        leadDate,
        statusChangeDate,
        unattended: statusChangeDate === null,
      };
    } catch (err) {
      console.error("Error transforming row:", err);
      return null;
    }
  }, []);

  // Fetch leads data (including Client2lead data)
  const fetchData = useCallback(async () => {
    try {
      // Fetch original DSR leads
      const response = await fetch("https://leads.baleenmedia.com/api/fetchLeads");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.rows || !Array.isArray(data.rows)) throw new Error("Invalid data format received");
      const dsrLeads = data.rows.map(transformRow).filter((lead) => lead !== null);

      // Fetch Client2lead data
      let client2Leads = [];
      try {
        // Use the same DB name as the logged-in user
        const dbName = UserCompanyName;
        const [existingLeads, leadsData] = await Promise.all([
          FetchExistingLeads(dbName, ''),
          FetchLeadsData(dbName, '')
        ]);
        // Merge and process Client2lead data
        const processClient2Lead = (row) => {
        // Map Client2lead fields to DSR structure
        return {
        SNo: row.Lead_ID || row.OrderNumber || Date.now().toString() + Math.random(),
        LeadDate: row.LeadDate || row.DateOfFirstRelease || 'N/A',
        LeadTime: row.LeadTime || '',
        Status: row.Status || 'N/A',
        Source: row.Source || row.Platform || 'N/A',
        Name: row.ClientName || row.ContactPerson || 'N/A',
        Phone: row.ClientContact || 'N/A',
        Email: row.ClientAuthorizedPerson || row.ClientEmail || 'N/A',
        Company: row.ClientCompanyName || row.ClientName || 'N/A',
        BusinessCategory: row.EnquiryDescription || row.ProspectType || 'N/A',
        FollowupDate: row.NextFollowupDate || '',
        Remarks: row.Remarks || '',
        HandledBy: row.HandledBy || row.CSE || 'N/A',
        leadDate: row.LeadDate ? getStartOfDay(new Date(row.LeadDate)) : (row.DateOfFirstRelease ? getStartOfDay(new Date(row.DateOfFirstRelease)) : null),
        statusChangeDate: row.NextFollowupDate ? new Date(row.NextFollowupDate) : null,
        unattended: false,
        isExistingLead: true, // Mark as existing lead from Client2Lead
        };
        };
        client2Leads = [...leadsData, ...existingLeads].map(processClient2Lead).filter((lead) => lead !== null);
      } catch (client2Err) {
        console.error("Error fetching Client2lead data:", client2Err);
      }

      // Mark DSR leads as not existing by default
      const dsrLeadsWithFlag = dsrLeads.map(lead => ({ ...lead, isExistingLead: false }));
      // Merge DSR and Client2lead leads
      const allLeads = [...dsrLeadsWithFlag, ...client2Leads];
      // Deduplicate: prefer Client2Lead version if duplicate by Phone (or Email if Phone missing)
      const dedupedLeadsMap = new Map();
      for (const lead of allLeads) {
        const key = (lead.Phone && lead.Phone !== 'N/A') ? lead.Phone : (lead.Email && lead.Email !== 'N/A' ? lead.Email : lead.SNo);
        // Prefer Client2Lead (isExistingLead true) if duplicate
        if (!dedupedLeadsMap.has(key) || lead.isExistingLead) {
          dedupedLeadsMap.set(key, lead);
        }
      }
      const dedupedLeads = Array.from(dedupedLeadsMap.values());
      // Sort leads based on leadDate in descending order (newest first)
      dedupedLeads.sort((a, b) => {
        if (!a.leadDate && !b.leadDate) return 0;
        if (!a.leadDate) return 1;
        if (!b.leadDate) return -1;
        return b.leadDate.getTime() - a.leadDate.getTime();
      });
      setLeads(dedupedLeads);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [transformRow, UserCompanyName]);

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
          FetchActiveCSE(UserCompanyName).then((data) => setCSENames(data)),
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    
    initializeData();
  }, [userName, UserCompanyName, router, fetchData]);

  // Memoize filtered leads based on active filters
  // Helper to compare only the date part (ignoring time)
  const isSameOrAfter = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() > date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() > date2.getMonth()) ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() >= date2.getDate())
    );
  };
  const isSameOrBefore = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() < date2.getFullYear() ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
      (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() <= date2.getDate())
    );
  };

  const filteredLeadsMemo = useMemo(() => {
    return leads.filter((lead) => {
      const matchesDate =
        (!fromDate || !toDate) ||
        (
          (lead.leadDate &&
            isSameOrAfter(lead.leadDate, fromDate) &&
            isSameOrBefore(lead.leadDate, toDate))
          ||
          (lead.statusChangeDate &&
            isSameOrAfter(lead.statusChangeDate, fromDate) &&
            isSameOrBefore(lead.statusChangeDate, toDate))
        );
      const matchesPlatform = !platformFilter || lead.Source === platformFilter;
      const matchesHandler = !handledByFilter || lead.HandledBy === handledByFilter;
      const matchesStatus = statusFilter === 'all' || lead.Status === statusFilter;
      const matchesSearch = !searchQuery || 
        Object.values(lead).some(val =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      return matchesDate && matchesPlatform && matchesHandler && matchesStatus && matchesSearch;
    });
  }, [leads, fromDate, toDate, platformFilter, handledByFilter, statusFilter, searchQuery]);

  // Update filteredData when filteredLeadsMemo changes
  useEffect(() => {
    setFilteredData(filteredLeadsMemo);
  }, [filteredLeadsMemo]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handlePlatformFilter = (platform) => {
    setPlatformFilter(platform);
  };

  const handleHandledByFilter = (handledBy) => {
    setHandledByFilter(handledBy);
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for export
      const exportData = filteredData.map((item, index) => ({
        'S.No': index + 1,
        'Lead Date': item.LeadDate !== "N/A" ? new Date(item.LeadDate).toLocaleDateString('en-US') : 'N/A',
        'Lead Time': item.LeadTime,
        'Name': item.Name,
        'Phone': item.Phone,
        'Email': item.Email || 'N/A',
        'Status': item.Status,
        'Source/Platform': item.Source,
        'Company': item.Company,
        'Enquiry/Business Category': item.BusinessCategory,
        'Handled By': item.HandledBy,
        'Remarks': item.Remarks
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with date range
      const fromDateStr = fromDate ? fromDate.toISOString().split('T')[0] : 'all';
      const toDateStr = toDate ? toDate.toISOString().split('T')[0] : 'all';
      const filename = `DSR_Report_${fromDateStr}_to_${toDateStr}.csv`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ CSV file "${filename}" has been downloaded successfully!`);
      }, 500);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('❌ Error exporting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for export
      const exportData = filteredData.map((item, index) => ({
        'S.No': index + 1,
        'Lead Date': item.LeadDate !== "N/A" ? new Date(item.LeadDate).toLocaleDateString('en-US') : 'N/A',
        'Lead Time': item.LeadTime,
        'Name': item.Name,
        'Phone': item.Phone,
        'Email': item.Email || 'N/A',
        'Status': item.Status,
        'Source/Platform': item.Source,
        'Company': item.Company,
        'Enquiry/Business Category': item.BusinessCategory,
        'Handled By': item.HandledBy,
        'Remarks': item.Remarks
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 },   // S.No
        { wch: 12 },  // Lead Date
        { wch: 10 },  // Lead Time
        { wch: 20 },  // Name
        { wch: 15 },  // Phone
        { wch: 25 },  // Email
        { wch: 15 },  // Status
        { wch: 15 },  // Source/Platform
        { wch: 20 },  // Company
        { wch: 30 },  // Enquiry/Business Category
        { wch: 15 },  // Handled By
        { wch: 40 }   // Remarks
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'DSR Report');

      // Generate filename with date range
      const fromDateStr = fromDate ? fromDate.toISOString().split('T')[0] : 'all';
      const toDateStr = toDate ? toDate.toISOString().split('T')[0] : 'all';
      const filename = `DSR_Report_${fromDateStr}_to_${toDateStr}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Excel file "${filename}" has been downloaded successfully!`);
      }, 500);
      
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('❌ Error exporting data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Main download function with format selection
  const downloadData = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Create a custom dialog for better UX
    const exportDialog = document.createElement('div');
    exportDialog.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 400px; width: 90%;">
          <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; font-weight: 600;">Export DSR Report</h3>
          <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Choose your preferred export format:</p>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button id="exportExcel" style="flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
              📊 Excel (.xlsx)
            </button>
            <button id="exportCSV" style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
              📄 CSV (.csv)
            </button>
          </div>
          <div style="text-align: center;">
            <button id="cancelExport" style="padding: 8px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Cancel
            </button>
          </div>
          <p style="margin: 15px 0 0 0; color: #888; font-size: 12px; text-align: center;">
            Exporting ${filteredData.length} records from ${fromDate ? fromDate.toLocaleDateString() : 'all dates'} to ${toDate ? toDate.toLocaleDateString() : 'all dates'}
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(exportDialog);

    // Add event listeners
    document.getElementById('exportExcel').onclick = () => {
      document.body.removeChild(exportDialog);
      exportToExcel();
    };

    document.getElementById('exportCSV').onclick = () => {
      document.body.removeChild(exportDialog);
      exportToCSV();
    };

    document.getElementById('cancelExport').onclick = () => {
      document.body.removeChild(exportDialog);
    };

    // Close on background click
    exportDialog.onclick = (e) => {
      if (e.target === exportDialog) {
        document.body.removeChild(exportDialog);
      }
    };
  };

  const getStatusStats = () => {
    const stats = filteredData.reduce((acc, item) => {
      acc[item.Status] = (acc[item.Status] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const statusStats = getStatusStats();
  const totalLeads = filteredData.length;
  const conversionRate = totalLeads > 0 ? ((statusStats['Won'] || 0) / totalLeads * 100).toFixed(1) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Call Followup': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Won': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return '🆕';
      case 'Call Followup': return '📞';
      case 'Won': return '🎉';
      default: return '📋';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'Website': return '🌐';
      case 'Referral': return '👥';
      case 'LinkedIn': return '💼';
      case 'Google Ads': return '🎯';
      case 'Trade Show': return '🏢';
      default: return '📱';
    }
  };

  // Bottom bar scroll logic
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setShowBottomBar(false); // Hide on scroll down
          } else {
            setShowBottomBar(true); // Show on scroll up
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Daily Status Report</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Monitor and track lead progression across your sales pipeline</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={downloadData}
                disabled={loading || filteredData.length === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={filteredData.length === 0 ? "No data to export" : "Export filtered data as Excel or CSV"}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 sm:mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button 
                onClick={() => router.push('/LeadManager/Report')}
                className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{totalLeads}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-md sm:rounded-lg">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">{statusStats['New'] || 0}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-md sm:rounded-lg">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Won Deals</p>
                <p className="text-xl sm:text-3xl font-bold text-emerald-600 mt-1 sm:mt-2">{statusStats['Won'] || 0}</p>
              </div>
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-md sm:rounded-lg">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-xl sm:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">{conversionRate}%</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-md sm:rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <DatePicker
                selected={fromDate}
                onChange={date => setFromDate(date ? getStartOfDay(date) : null)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholderText="Select from date"
                isClearable
                maxDate={toDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <DatePicker
                selected={toDate}
                onChange={date => setToDate(date ? getEndOfDay(date) : null)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholderText="Select to date"
                isClearable
                minDate={fromDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select
                value={platformFilter}
                onChange={(e) => handlePlatformFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Platforms</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Handled By</label>
              <select
                value={handledByFilter}
                onChange={(e) => handleHandledByFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All CSE</option>
                <option value="Siva">Siva</option>
                {CSENames.map((cse, idx) => (
                  <option key={idx} value={toTitleCase(cse.username)}>
                    {toTitleCase(cse.username)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Call Followup">Call Followup</option>
                <option value="Unreachable">Unreachable</option>
                <option value="Lost">Lost</option>
                <option value="Unqualified">Unqualified</option>
                <option value="Won">Won</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search leads..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPlatformFilter('');
                setHandledByFilter('');
                setFromDate(getStartOfDay(new Date()));
                setToDate(getEndOfDay(new Date()));
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-800 font-medium">Error loading data:</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
            <p className="text-gray-600">Loading leads data...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Lead Details</h3>
                <span className="text-xs sm:text-sm text-gray-500">{filteredData.length} of {leads.length} records</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead #</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enquiry</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Handled By</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Existing Lead</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => (
                    <tr key={item.SNo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.LeadDate !== "N/A" ? new Date(item.LeadDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.LeadTime}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.Name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.Phone}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.Status)}`}>
                          <span className="mr-1">{getStatusIcon(item.Status)}</span>
                          {item.Status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          <span className="mr-1">{getSourceIcon(item.Source)}</span>
                          {item.Source}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.Company || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={item.BusinessCategory}>
                          {item.BusinessCategory || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.HandledBy}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate" title={item.Remarks}>
                          {item.Remarks || 'No remarks'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {item.isExistingLead ? 'Yes' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or date range.</p>
              </div>
            )}
          </div>
        )}
      </div>
    {/* Bottom Bar */}
      <div
        className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ pointerEvents: showBottomBar ? 'auto' : 'none' }}
      >
        <div className="flex justify-center items-center bg-white border-t border-gray-200 py-3 shadow-lg md:rounded-t-xl">
          <button
            onClick={downloadData}
            disabled={loading || filteredData.length === 0}
            className="mx-2 px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline-block align-middle" />
            Export Data
          </button>
          <button
            onClick={() => router.push('/LeadManager/Report')}
            className="mx-2 px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2 inline-block align-middle" />
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSRPage;