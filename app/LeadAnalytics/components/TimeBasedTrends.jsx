'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Chip,
  Divider,
  ButtonGroup,
  Button,
  CircularProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  InfoOutlined, 
  AccessTime,
  CalendarToday, 
  LocalHospital,
  ShowChart,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline
} from '@mui/icons-material';

// Color scheme for charts
const COLORS = [
  '#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0', 
  '#2196f3', '#ff5722', '#673ab7', '#009688', '#3f51b5'
];

// Simulated seasonal decomposition data (could come from Prophet/Facebook Prophet in a real app)
const seasonalDecomposition = {
  'Cardiology': { 
    trend: [3, 4, 5, 6, 7, 8, 9, 9, 8, 7, 6, 5], 
    seasonal: [2, -1, -2, 0, 1, 2, 1, 0, 3, 4, 2, -3], 
    residual: [0.3, -0.2, 0.1, 0.5, -0.3, 0.2, -0.4, 0.3, 0.1, -0.2, 0.4, -0.1]
  },
  'Dermatology': { 
    trend: [4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5], 
    seasonal: [-3, -2, 0, 2, 4, 5, 4, 3, 1, -1, -2, -3], 
    residual: [0.2, -0.3, 0.4, -0.1, 0.3, -0.2, 0.1, -0.3, 0.2, -0.1, 0.4, -0.2]
  },
  'Orthopedics': { 
    trend: [6, 7, 8, 9, 9, 8, 7, 6, 7, 8, 9, 8], 
    seasonal: [1, 2, 3, 2, 0, -2, -3, -3, -2, 0, 1, 2], 
    residual: [-0.1, 0.2, -0.3, 0.1, -0.2, 0.3, -0.1, 0.4, -0.2, 0.1, -0.3, 0.2]
  },
  'ENT': { 
    trend: [7, 8, 9, 10, 9, 8, 7, 8, 9, 10, 9, 8], 
    seasonal: [4, 3, 2, 0, -2, -3, -4, -3, -2, 0, 2, 3], 
    residual: [0.1, -0.2, 0.3, -0.1, 0.2, -0.3, 0.1, -0.2, 0.3, -0.1, 0.2, -0.3]
  }
};

// Forecasting data for next 6 months (simulating Prophet predictions)
const forecastData = {
  'Cardiology': [
    { month: 'Jun', prediction: 113, lower: 102, upper: 125 },
    { month: 'Jul', prediction: 108, lower: 97, upper: 119 },
    { month: 'Aug', prediction: 102, lower: 91, upper: 114 },
    { month: 'Sep', prediction: 117, lower: 103, upper: 130 },
    { month: 'Oct', prediction: 128, lower: 116, upper: 139 },
    { month: 'Nov', prediction: 137, lower: 125, upper: 150 }
  ],
  'Dermatology': [
    { month: 'Jun', prediction: 98, lower: 88, upper: 109 },
    { month: 'Jul', prediction: 105, lower: 94, upper: 117 },
    { month: 'Aug', prediction: 112, lower: 100, upper: 123 },
    { month: 'Sep', prediction: 96, lower: 85, upper: 106 },
    { month: 'Oct', prediction: 89, lower: 79, upper: 99 },
    { month: 'Nov', prediction: 84, lower: 74, upper: 93 }
  ],
  'Orthopedics': [
    { month: 'Jun', prediction: 85, lower: 76, upper: 96 },
    { month: 'Jul', prediction: 82, lower: 73, upper: 91 },
    { month: 'Aug', prediction: 79, lower: 69, upper: 89 },
    { month: 'Sep', prediction: 87, lower: 77, upper: 97 },
    { month: 'Oct', prediction: 95, lower: 85, upper: 106 },
    { month: 'Nov', prediction: 102, lower: 92, upper: 113 }
  ],
  'ENT': [
    { month: 'Jun', prediction: 76, lower: 67, upper: 87 },
    { month: 'Jul', prediction: 71, lower: 62, upper: 81 },
    { month: 'Aug', prediction: 68, lower: 59, upper: 77 },
    { month: 'Sep', prediction: 85, lower: 75, upper: 95 },
    { month: 'Oct', prediction: 97, lower: 87, upper: 107 },
    { month: 'Nov', prediction: 93, lower: 83, upper: 103 }
  ]
};

// Year-over-year growth for key specialties
const yoyGrowth = {
  'Cardiology': 8.4,
  'Dermatology': 12.7,
  'Orthopedics': 5.9,
  'ENT': 7.2,
  'Neurology': 9.5,
  'Ophthalmology': 6.8,
  'Pediatrics': 4.2,
  'Dentistry': 10.6,
  'Gynecology': 3.8,
  'General Surgery': -2.3
};

import React from 'react';
import { Line } from 'react-chartjs-2';

export default function TimeBasedTrends({ data }) {
  const chartData = {
    labels: data.monthly.map((item) => item.month),
    datasets: [
      {
        label: 'Leads',
        data: data.monthly.map((item) => item.leads),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: true,
      },
      {
        label: 'Conversions',
        data: data.monthly.map((item) => item.conversions),
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h3>Time-Based Trends</h3>
      <Line data={chartData} />
    </div>
  );
}
