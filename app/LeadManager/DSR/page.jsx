'use client'
import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, Filter, RefreshCw, Users, TrendingUp, Clock, Award } from 'lucide-react';

const DSRPage = () => {
  const [fromDate, setFromDate] = useState('2024-01-01');
  const [toDate, setToDate] = useState('2024-12-31');
  const [searchQuery, setSearchQuery] = useState('');
  const [dsrData, setDsrData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');

  // Mock data for demonstration
  const mockData = [
    { SNo: 1, LeadDate: '2024-01-15', Status: 'New', PreviousStatus: 'Prospect', Name: 'John Smith', Phone: '+1-555-0123', Company: 'TechCorp Inc.' },
    { SNo: 2, LeadDate: '2024-01-16', Status: 'Call Followup', PreviousStatus: 'New', Name: 'Sarah Johnson', Phone: '+1-555-0124', Company: 'DataSys LLC' },
    { SNo: 3, LeadDate: '2024-01-17', Status: 'Won', PreviousStatus: 'Call Followup', Name: 'Mike Chen', Phone: '+1-555-0125', Company: 'CloudNet Solutions' },
    { SNo: 4, LeadDate: '2024-01-18', Status: 'Call Followup', PreviousStatus: 'New', Name: 'Emily Davis', Phone: '+1-555-0126', Company: 'InnovateLab' },
    { SNo: 5, LeadDate: '2024-01-19', Status: 'New', PreviousStatus: null, Name: 'Robert Wilson', Phone: '+1-555-0127', Company: 'NextGen Systems' },
  ];

  useEffect(() => {
    setDsrData(mockData);
    setFilteredData(mockData);
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    let filtered = dsrData.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.Status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    let filtered = dsrData;
    
    if (status !== 'all') {
      filtered = dsrData.filter(item => item.Status === status);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        Object.values(item).some(val =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredData(filtered);
  };

  const downloadExcel = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock download functionality
      alert('Excel file would be downloaded in a real implementation');
    }, 1500);
  };

  const getStatusStats = () => {
    const stats = dsrData.reduce((acc, item) => {
      acc[item.Status] = (acc[item.Status] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const statusStats = getStatusStats();
  const totalLeads = dsrData.length;
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
                onClick={downloadExcel}
                disabled={loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 sm:mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Report
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
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

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setFilteredData(dsrData);
              }}
              className="sm:col-span-1 col-span-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Lead Details</h3>
              <span className="text-xs sm:text-sm text-gray-500">{filteredData.length} of {totalLeads} records</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Previous Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={item.SNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {new Date(item.LeadDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.Name}</div>
                        <div className="text-sm text-gray-500">{item.Phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.Status)}`}>
                        <span className="mr-1">{getStatusIcon(item.Status)}</span>
                        {item.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.PreviousStatus ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.PreviousStatus)}`}>
                          <span className="mr-1">{getStatusIcon(item.PreviousStatus)}</span>
                          {item.PreviousStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.Company || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DSRPage;