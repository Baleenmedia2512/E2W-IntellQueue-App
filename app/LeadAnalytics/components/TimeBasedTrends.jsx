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

const TimeBasedTrends = ({ data }) => {
  const [monthly, setMonthly] = useState([]);
  const [seasonal, setSeasonal] = useState({});
  const [selectedSpecialty, setSelectedSpecialty] = useState('Cardiology');
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('historical');
  const [showSeasonalDecomposition, setShowSeasonalDecomposition] = useState(false);
  const [timeframe, setTimeframe] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.monthly) {
        setMonthly(data.monthly);
      }
      if (data.seasonal) {
        setSeasonal(data.seasonal);
      }
    }

    // Simulate model processing when specialty changes
    if (selectedSpecialty) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [data, selectedSpecialty]);

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  const handleChartTypeChange = (type) => {
    setChartType(type);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  // Conversion rate by month
  const conversionRateData = monthly.map(item => ({
    ...item,
    conversionRate: (item.conversions / item.leads * 100).toFixed(1)
  }));

  // Prepare data for seasonal decomposition chart
  const getDecompositionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const specialty = selectedSpecialty || 'Cardiology';
    const decomp = seasonalDecomposition[specialty] || seasonalDecomposition['Cardiology'];
    
    return months.map((month, index) => ({
      month,
      trend: decomp.trend[index],
      seasonal: decomp.seasonal[index],
      residual: decomp.residual[index]
    }));
  };

  // Prepare data for seasonal strength chart
  const getSeasonalStrengthData = () => {
    const seasons = Object.keys(seasonal);
    return seasons.map(season => ({
      name: season,
      growth: seasonal[season].growth * 100,
      specialties: seasonal[season].specialties.join(', ')
    }));
  };

  // Format forecast data for the selected specialty
  const getForecastData = () => {
    const specialty = selectedSpecialty || 'Cardiology';
    return forecastData[specialty] || forecastData['Cardiology'];
  };

  // Calculate specialty peak seasons based on seasonal decomposition
  const getSpecialtyPeakSeasons = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const specialty = selectedSpecialty || 'Cardiology';
    const decomp = seasonalDecomposition[specialty] || seasonalDecomposition['Cardiology'];
    
    // Find the months with the highest seasonal components
    const seasonalValues = [...decomp.seasonal];
    const topThree = seasonalValues
      .map((value, index) => ({ value, month: months[index] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
    
    return topThree;
  };

  // Year-over-year growth data for specialties
  const getYoYGrowthData = () => {
    return Object.entries(yoyGrowth).map(([name, value]) => ({
      name,
      growth: value,
      color: value >= 0 ? '#4caf50' : '#f44336'
    }));
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Time-Based Conversion Trends
          <Tooltip title="Analysis of conversion patterns over time using time series forecasting and seasonal decomposition techniques.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <ButtonGroup 
            variant="outlined" 
            size="small" 
            sx={{ mr: 2 }}
          >
            <Button 
              onClick={() => handleViewModeChange('historical')}
              variant={viewMode === 'historical' ? 'contained' : 'outlined'}
            >
              <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
              Historical
            </Button>
            <Button 
              onClick={() => handleViewModeChange('forecast')}
              variant={viewMode === 'forecast' ? 'contained' : 'outlined'}
            >
              <Timeline fontSize="small" sx={{ mr: 0.5 }} />
              Forecast
            </Button>
          </ButtonGroup>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Specialty</InputLabel>
            <Select value={selectedSpecialty} onChange={handleSpecialtyChange} label="Specialty">
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Dermatology">Dermatology</MenuItem>
              <MenuItem value="Orthopedics">Orthopedics</MenuItem>
              <MenuItem value="ENT">ENT</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select value={timeframe} onChange={handleTimeframeChange} label="Timeframe">
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="seasonal">Seasonal</MenuItem>
              <MenuItem value="yearly">Year over Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Processing Time Series Data...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Main chart area */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">
                  {viewMode === 'forecast' 
                    ? `${selectedSpecialty} Lead Conversion Forecast (Next 6 Months)` 
                    : timeframe === 'monthly' 
                      ? 'Monthly Lead Conversion Trends' 
                      : timeframe === 'seasonal' 
                        ? 'Seasonal Performance Analysis'
                        : 'Year-over-Year Specialty Growth'
                  }
                </Typography>
                
                {viewMode === 'historical' && timeframe === 'monthly' && (
                  <Box>
                    <ButtonGroup size="small">
                      <Button 
                        variant={chartType === 'line' ? 'contained' : 'outlined'}
                        onClick={() => handleChartTypeChange('line')}
                      >
                        <ShowChart fontSize="small" />
                      </Button>
                      <Button 
                        variant={chartType === 'area' ? 'contained' : 'outlined'}
                        onClick={() => handleChartTypeChange('area')}
                      >
                        <Timeline fontSize="small" />
                      </Button>
                      <Button 
                        variant={chartType === 'bar' ? 'contained' : 'outlined'}
                        onClick={() => handleChartTypeChange('bar')}
                      >
                        <BarChartIcon fontSize="small" />
                      </Button>
                    </ButtonGroup>
                  </Box>
                )}
              </Box>
              
              <Box height={400}>
                {viewMode === 'historical' && timeframe === 'monthly' && (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart
                        data={conversionRateData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          stroke="#8884d8" 
                          domain={[0, 'dataMax + 100']}
                          label={{ value: 'Lead Count', angle: -90, position: 'insideLeft' }} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#82ca9d" 
                          domain={[0, 30]}
                          tickFormatter={(value) => `${value}%`}
                          label={{ value: 'Conversion Rate', angle: 90, position: 'insideRight' }} 
                        />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                            return [value, name === 'leads' ? 'Leads' : 'Conversions'];
                          }} 
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="leads" 
                          name="Leads" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="conversions" 
                          name="Conversions" 
                          stroke="#f44336" 
                          strokeWidth={2}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="conversionRate" 
                          name="Conversion Rate" 
                          stroke="#82ca9d" 
                          strokeWidth={3}
                        />
                      </LineChart>
                    ) : chartType === 'area' ? (
                      <AreaChart
                        data={conversionRateData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          domain={[0, 'dataMax + 100']}
                          label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
                        />
                        <RechartsTooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="leads" 
                          name="Leads" 
                          stackId="1"
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="conversions" 
                          name="Conversions" 
                          stackId="2"
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={conversionRateData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          label={{ value: 'Count', angle: -90, position: 'insideLeft' }} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          domain={[0, 30]}
                          tickFormatter={(value) => `${value}%`}
                          label={{ value: 'Conversion Rate', angle: 90, position: 'insideRight' }} 
                        />
                        <RechartsTooltip 
                          formatter={(value, name) => {
                            if (name === 'conversionRate') return [`${value}%`, 'Conversion Rate'];
                            return [value, name === 'leads' ? 'Leads' : 'Conversions'];
                          }} 
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="leads" 
                          name="Leads" 
                          fill="#8884d8" 
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="conversions" 
                          name="Conversions" 
                          fill="#82ca9d" 
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="conversionRate" 
                          name="Conversion Rate" 
                          stroke="#ff7300" 
                          strokeWidth={3}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                )}
                
                {viewMode === 'historical' && timeframe === 'seasonal' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getSeasonalStrengthData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `${value}%`}
                        label={{ value: 'Growth Rate', angle: -90, position: 'insideLeft' }} 
                      />
                      <RechartsTooltip 
                        formatter={(value, name) => [`${value}%`, 'Growth Rate']} 
                        labelFormatter={(value) => `${value} Season`}
                      />
                      <Legend />
                      <Bar dataKey="growth" name="Growth Rate" fill="#8884d8">
                        {getSeasonalStrengthData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                
                {viewMode === 'historical' && timeframe === 'yearly' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getYoYGrowthData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={[-5, 15]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis 
                        type="category" 
   