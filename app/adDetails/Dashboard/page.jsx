'use client';
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import useTimerTracker from './useTimerTracker';

const QuoteSenderDashboard = () => {
  // useTimerTracker()
  const companyName = useAppSelector(state => state.authSlice.companyName);
  const [avgMetrics, setAvgMetrics] = useState({  
    avgClickCount: 0,
    avgTimeTaken: 0,
    quotesGenerated: 0,
    quotePageClicks: 0,
    cartPageClicks: 0
  });

  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  // const [startDate, endDate] = dateRange;
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [chartData, setChartData] = useState([]); 
  
  // Fetch Module Tracking Data
  const fetchModuleTrackingData = async (startDate, endDate) => {
    try {
      const url = `https://www.orders.baleenmedia.com/API/Media/FetchModuleTracking.php?JsonDBName=${encodeURIComponent(companyName)}`;

      console.log("Fetching Module Tracking Data from:", url);

      const response = await fetch(url, { method: "GET" });
      const result = await response.json();

      console.log("Fetched Module Tracking Data:", result);

      if (!Array.isArray(result) || result.length === 0) {
        return { avgClickCount: 0, avgTimeTaken: 0, quotesGenerated: 0, chartData: [] };
      }

      // Convert startDate and endDate to comparable formats
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      // Filter data based on date range
      const filteredData = result.filter((item) => {
        const itemDate = new Date(item.EntryDateTime).setHours(0, 0, 0, 0);
        return (!start || itemDate >= start) && (!end || itemDate <= end);
      });

      const quotePageData = filteredData.filter(item => item.PageName === "Quote Page");
      const quotesGenerated = quotePageData.length; // Count of "Quote Page" records
      
      if (quotesGenerated === 0) {
        return { avgClickCount: 0, avgTimeTaken: 0, quotesGenerated: 0, quotePageClicks: 0, cartPageClicks: 0, chartData: [] };
    }

      // Aggregate data by date
      const dateMap = {};
      filteredData.forEach((item) => {
        const dateKey = item.EntryDateTime.split(" ")[0]; // Extract date part only
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { 
              totalClicks: 0, 
              totalTime: 0, 
              count: 0,
              quotePageClicks: 0,
              cartPageClicks: 0,
              quotePageTime: 0,
              cartPageTime: 0
          };
      }
      if (item.PageName === "Quote Page") {
        dateMap[dateKey].totalClicks += item.ClickCount;
        dateMap[dateKey].totalTime += item.TimeTaken;
        dateMap[dateKey].quotePageClicks += item.ClickCount;
        dateMap[dateKey].quotePageTime += item.TimeTaken;
        dateMap[dateKey].count += 1;
      } else if (item.PageName === "Cart Page") {
        dateMap[dateKey].cartPageClicks += item.ClickCount;
        dateMap[dateKey].cartPageTime += item.TimeTaken;
      }
      });

      // Format data for the chart
      const chartData = Object.keys(dateMap).map((date) => ({
        date,
        avgClickCount: (dateMap[date].totalClicks / dateMap[date].count).toFixed(2),
        avgTime: (dateMap[date].totalTime / dateMap[date].count).toFixed(2),
        quotesGenerated: dateMap[date].count,
        quotePageClicks: dateMap[date].quotePageClicks,
        cartPageClicks: dateMap[date].cartPageClicks,
        quotePageTime: dateMap[date].quoteTime,
        cartPageTime: dateMap[date].cartPageTime
      }));

      // Calculate overall averages
      const totalClickCount = filteredData.reduce((sum, item) => sum + item.ClickCount, 0);
      const totalTimeTaken = filteredData.reduce((sum, item) => sum + item.TimeTaken, 0);
      const totalQuotePageClicks = filteredData.reduce((sum, item) => item.PageName === "Quote Page" ? sum + item.ClickCount : sum, 0);
      const totalCartPageClicks = filteredData.reduce((sum, item) => item.PageName === "Cart Page" ? sum + item.ClickCount : sum, 0);
      const totalQuotePageTime = filteredData.reduce((sum, item) => item.PageName === "Quote Page" ? sum + item.TimeTaken : sum, 0);
      const totalCartPageTime = filteredData.reduce((sum, item) => item.PageName === "Cart Page" ? sum + item.TimeTaken : sum, 0);
      const avgClickCount =  Math.round(totalClickCount / quotesGenerated);
      const avgTimeTaken = (totalTimeTaken / quotesGenerated).toFixed(2);
      // const totalQuotePageClicks = quotePageData.reduce((sum, item) => sum + item.ClickCount, 0);
      //   const totalCartPageClicks = filteredData
      //       .filter(item => item.PageName === "Cart Page")
      //       .reduce((sum, item) => sum + item.ClickCount, 0);

      console.log("Calculated Averages:", { avgClickCount, avgTimeTaken, quotesGenerated });

      return { avgClickCount, avgTimeTaken, quotesGenerated,  quotePageClicks: totalQuotePageClicks,
        cartPageClicks: totalCartPageClicks,  quotePageTime: totalQuotePageTime,
        cartPageTime: totalCartPageTime, chartData };
    } catch (error) {
      console.error("Error fetching module tracking data:", error);
      return { avgClickCount: 0, avgTimeTaken: 0, quotesGenerated: 0, quotePageClicks: 0, cartPageClicks: 0, quotePageTime: 0, cartPageTime: 0, chartData: [] };
    }
  };


  // Fetch metrics on mount and when date range changes
  useEffect(() => {
    const fetchData = async () => {
        const data = await fetchModuleTrackingData(startDate, endDate);
        setAvgMetrics(data);
        setChartData(data.chartData); 
    };

    fetchData();
}, [startDate, endDate]);

const handleDateChange = (dates) => {
  const [start, end] = dates;
  setStartDate(start);
  setEndDate(end);
};

  // if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-900">Quote Sender Dashboard</h1>

      {/* Date Range Picker */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 bg-white p-4 rounded shadow">
          <span className="text-gray-700 font-semibold">Select Date Range:</span>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            isClearable={true}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Dynamically tracked Total Clicks */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
  <h2 className="text-xl font-semibold text-gray-800">Average Clicks</h2>
  <p className="text-5xl font-bold mt-4 text-blue-600">{avgMetrics.avgClickCount}</p>
</div>
<div className="bg-white p-6 rounded-lg shadow-lg">
  <h2 className="text-xl font-semibold text-gray-800">Average Time Taken</h2>
  <p className="text-5xl font-bold mt-4 text-blue-600">{avgMetrics.avgTimeTaken} sec</p>
</div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Quotes Generated </h2>
          <p className="text-5xl font-bold mt-4 text-blue-600">{avgMetrics.quotesGenerated}</p>
        </div>
      </div>

      {/* Trend Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Clicks & Quotes Generated Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Average Clicks Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="date" stroke="#555"  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#555" label={{ value: 'Clicks', angle: -90, position: 'insideLeft' }}/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgClickCount" stroke="#8884d8" strokeWidth={2} name="Avg Clicks" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="quotePageClicks" stroke="#82ca9d" strokeWidth={2} name="Quote Page Clicks" />
            <Line type="monotone" dataKey="cartPageClicks" stroke="#ff7300" strokeWidth={2} name="Cart Page Clicks" />
          </LineChart>
        </ResponsiveContainer>
      </div>

        {/* Average Generation Time & Quotes Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Avg Generation Time & Quotes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#555"  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" stroke="#555" label={{ value: 'Time (sec)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#555" label={{ value: 'Quotes', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgTime" fill="#82ca9d" name="Avg Time (sec)" />
              <Line yAxisId="right" type="monotone" dataKey="quotesGenerated" stroke="#ff7300" strokeWidth={2} name="Quotes Generated" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Page Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">  	
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Page Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h3 className="font-semibold text-gray-700">Ad Details Page</h3>
            <p className="mt-2 text-gray-600">Clicks: {avgMetrics.quotePageClicks}</p>
            <p className="text-gray-600">Avg Generation Time: {avgMetrics.quotePageTime} sec</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold text-gray-700">Checkout Page</h3>
            <p className="mt-2 text-gray-600">Clicks: {avgMetrics.cartPageClicks}</p>
            <p className="text-gray-600">Avg Generation Time: {avgMetrics.cartPageTime} sec</p>
          </div>
        </div>
      </div>

      {/* Per Client Metrics
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Per Client Metrics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-4 py-2">Client Name</th>
                <th className="px-4 py-2">Client Contact</th>
                <th className="px-4 py-2">Quotes Generated</th>
                <th className="px-4 py-2">Avg Time (sec)</th>
                <th className="px-4 py-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {metrics.quotesBreakdown.map((client, index) => (
                <tr key={index} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2">{client.clientName}</td>
                  <td className="px-4 py-2">{client.clientContact}</td>
                  <td className="px-4 py-2">{client.quoteCount}</td>
                  <td className="px-4 py-2">{client.avgTime}</td>
                  <td className="px-4 py-2">{client.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Suggestions */}
      {/* <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Suggestions for Improvement</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {metrics.suggestions && metrics.suggestions.length > 0 ? (
            metrics.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))
          ) : (
            <li>No suggestions at this time.</li>
          )}
        </ul>
      </div> */}
    </div>
  );
};

export default QuoteSenderDashboard;
