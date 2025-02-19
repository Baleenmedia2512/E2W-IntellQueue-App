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
import useClickTracker from './useClickTracker'; 

const QuoteSenderDashboard = () => {
  useClickTracker();
  const clickCount = useAppSelector((state) => state.countSlice.clickCount);
  //  const clientDetails = useAppSelector(state => state.clientSlice);
  // Other metrics (could be fetched or remain static)
  const [metrics, setMetrics] = useState({
    avgGenerationTime: 15,
    quotesGeneratedToday: 45,
    clicksOverTime: [
      { date: "2025-02-01", clicks: 30, quotesGenerated: 5 },
      { date: "2025-02-02", clicks: 35, quotesGenerated: 8 },
      { date: "2025-02-03", clicks: 45, quotesGenerated: 10 }
    ],
    generationTimeOverTime: [
      { date: "2025-02-01", avgTime: 20, quotesGenerated: 5 },
      { date: "2025-02-02", avgTime: 15, quotesGenerated: 8 },
      { date: "2025-02-03", avgTime: 10, quotesGenerated: 10 }
    ],
    pageBreakdown: {
      adDetails: { clicks: 60, avgTime: 4.2 },
      checkout: { clicks: 60, avgTime: 3.4 }
    },
    quotesBreakdown: [
      { clientName: "Client A", clientContact: "1234567890", quoteCount: 3, avgTime: 4.5, clicks: 5 },
      { clientName: "Client B", clientContact: "0987654321", quoteCount: 2, avgTime: 3.2, clicks: 3 }
    ],
    suggestions: [
      "Reduce the number of steps on the Ad Details page to cut down clicks.",
      "Consider pre-loading frequently used data to lower generation time."
    ]
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  

  // New state for tracking user clicks dynamically
  // const [clickCount, setClickCount] = useState(0);

  // Function to fetch metrics from backend with optional date range filtering
  const fetchMetrics = async (start, end) => {
    try {
      let url = '/api/quote-sender-metrics';
      if (start && end) {
        // Append date parameters in ISO format or your desired format
        url += `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Global click tracking: Increment clickCount on every user click
  // useEffect(() => {
  //   const handleUserClick = () => {
  //     setClickCount(prevCount => prevCount + 1);
  //   };

  //   document.addEventListener('click', handleUserClick);

  //   return () => {
  //     document.removeEventListener('click', handleUserClick);
  //   };
  // }, []);

  // Fetch metrics on mount and when date range changes
  useEffect(() => {
    setLoading(true);
    fetchMetrics(startDate, endDate);
  }, [startDate, endDate]);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

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
            onChange={(update) => {
              setDateRange(update);
            }}
            isClearable={true}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Dynamically tracked Total Clicks */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Total Clicks</h2>
          <p className="text-5xl font-bold mt-4 text-blue-600">{clickCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Average Generation Time</h2>
          <p className="text-5xl font-bold mt-4 text-blue-600">{metrics.avgGenerationTime} sec</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800">Quotes Generated Today</h2>
          <p className="text-5xl font-bold mt-4 text-blue-600">{metrics.quotesGeneratedToday}</p>
        </div>
      </div>

      {/* Trend Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Clicks & Quotes Generated Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Clicks & Quotes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} name="Clicks" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="quotesGenerated" stroke="#ff7300" strokeWidth={2} name="Quotes Generated" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Average Generation Time & Quotes Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Avg Generation Time & Quotes Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={metrics.generationTimeOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#555" />
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
            <p className="mt-2 text-gray-600">Clicks: {metrics.pageBreakdown.adDetails.clicks}</p>
            <p className="text-gray-600">Avg Generation Time: {metrics.pageBreakdown.adDetails.avgTime} sec</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold text-gray-700">Checkout Page</h3>
            <p className="mt-2 text-gray-600">Clicks: {metrics.pageBreakdown.checkout.clicks}</p>
            <p className="text-gray-600">Avg Generation Time: {metrics.pageBreakdown.checkout.avgTime} sec</p>
          </div>
        </div>
      </div>

      {/* Per Client Metrics */}
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
      </div>

      {/* Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
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
      </div>
    </div>
  );
};

export default QuoteSenderDashboard;
