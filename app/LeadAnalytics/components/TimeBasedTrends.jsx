'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Tooltip,
  ButtonGroup,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis,
  ComposedChart
} from 'recharts';
import {
  InfoOutlined,
  AccessTime,
  Timeline,
  BarChart as BarChartIcon,
  ShowChart,
  Autorenew,
  FilterList,
  Adjust,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  CalendarToday,
  EventNote,
  LocalHospital
} from '@mui/icons-material';

// Prophet time series forecast simulation data
const prophetForecastData = {
  model: {
    name: "Prophet",
    parameters: {
      seasonality_mode: "multiplicative",
      changepoint_prior_scale: 0.05,
      seasonality_prior_scale: 10.0,
      holidays_prior_scale: 10.0
    },
    components: ["trend", "yearly", "weekly", "daily", "holiday"]
  },
  predictions: {
    "Cardiology": [
      { month: "May-25", actual: null, forecast: 78, lower_bound: 74, upper_bound: 82 },
      { month: "Jun-25", actual: null, forecast: 82, lower_bound: 77, upper_bound: 87 },
      { month: "Jul-25", actual: null, forecast: 84, lower_bound: 79, upper_bound: 89 },
      { month: "Aug-25", actual: null, forecast: 86, lower_bound: 80, upper_bound: 92 },
      { month: "Sep-25", actual: null, forecast: 81, lower_bound: 75, upper_bound: 87 },
      { month: "Oct-25", actual: null, forecast: 76, lower_bound: 70, upper_bound: 82 }
    ],
    "Dermatology": [
      { month: "May-25", actual: null, forecast: 88, lower_bound: 83, upper_bound: 93 },
      { month: "Jun-25", actual: null, forecast: 92, lower_bound: 87, upper_bound: 97 },
      { month: "Jul-25", actual: null, forecast: 94, lower_bound: 89, upper_bound: 99 },
      { month: "Aug-25", actual: null, forecast: 90, lower_bound: 85, upper_bound: 95 },
      { month: "Sep-25", actual: null, forecast: 82, lower_bound: 77, upper_bound: 87 },
      { month: "Oct-25", actual: null, forecast: 76, lower_bound: 71, upper_bound: 81 }
    ],
    "Orthopedics": [
      { month: "May-25", actual: null, forecast: 72, lower_bound: 67, upper_bound: 77 },
      { month: "Jun-25", actual: null, forecast: 74, lower_bound: 69, upper_bound: 79 },
      { month: "Jul-25", actual: null, forecast: 71, lower_bound: 66, upper_bound: 76 },
      { month: "Aug-25", actual: null, forecast: 69, lower_bound: 64, upper_bound: 74 },
      { month: "Sep-25", actual: null, forecast: 67, lower_bound: 62, upper_bound: 72 },
      { month: "Oct-25", actual: null, forecast: 70, lower_bound: 65, upper_bound: 75 }
    ]
  },
  seasonalDecomposition: {
    "Cardiology": {
      trend: [
        { month: "Jul-24", value: 72 },
        { month: "Aug-24", value: 73 },
        { month: "Sep-24", value: 74 },
        { month: "Oct-24", value: 75 },
        { month: "Nov-24", value: 76 },
        { month: "Dec-24", value: 77 },
        { month: "Jan-25", value: 78 },
        { month: "Feb-25", value: 79 },
        { month: "Mar-25", value: 80 },
        { month: "Apr-25", value: 81 }
      ],
      seasonal: [
        { month: "Jan", value: -5 },
        { month: "Feb", value: -3 },
        { month: "Mar", value: 0 },
        { month: "Apr", value: 2 },
        { month: "May", value: 4 },
        { month: "Jun", value: 6 },
        { month: "Jul", value: 5 },
        { month: "Aug", value: 3 },
        { month: "Sep", value: 0 },
        { month: "Oct", value: -2 },
        { month: "Nov", value: -4 },
        { month: "Dec", value: -6 }
      ],
      residual: [
        { month: "Jul-24", value: 1.2 },
        { month: "Aug-24", value: -0.8 },
        { month: "Sep-24", value: 2.1 },
        { month: "Oct-24", value: -1.5 },
        { month: "Nov-24", value: 0.9 },
        { month: "Dec-24", value: -1.2 },
        { month: "Jan-25", value: 1.7 },
        { month: "Feb-25", value: -0.5 },
        { month: "Mar-25", value: 1.3 },
        { month: "Apr-25", value: -0.9 }
      ]
    }
  }
};

// Seasonal peak data by specialty
const seasonalPeaks = {
  "Cardiology": { peak: "Winter", increase: 0.12, reason: "Cold weather increases cardiovascular issues" },
  "Dermatology": { peak: "Summer", increase: 0.18, reason: "Sun exposure leads to more skin consultations" },
  "Orthopedics": { peak: "Winter", increase: 0.14, reason: "Cold weather aggravates joint pain" },
  "Neurology": { peak: "Spring", increase: 0.08, reason: "Weather changes trigger migraines and headaches" },
  "ENT": { peak: "Spring", increase: 0.15, reason: "Seasonal allergies increase ENT consultations" },
  "Ophthalmology": { peak: "Summer", increase: 0.11, reason: "Sun-related eye issues increase" },
  "Pediatrics": { peak: "Fall", increase: 0.16, reason: "Back-to-school checkups and illness spread" },
  "Dentistry": { peak: "Summer", increase: 0.09, reason: "More free time for elective procedures" },
  "Gynecology": { peak: "Spring", increase: 0.07, reason: "Regular annual check-ups scheduled" },
  "General Surgery": { peak: "Winter", increase: 0.10, reason: "Year-end insurance benefits utilization" }
};

const TimeBasedTrends = ({ data }) => {
  const [selectedView, setSelectedView] = useState('monthly');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Cardiology');
  const [timeframe, setTimeframe] = useState('monthly');
  const [viewMode, setViewMode] = useState('historical');
  const [showDecomposition, setShowDecomposition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSpecialty, setCompareSpecialty] = useState('Dermatology');
  const [forecastHorizon, setForecastHorizon] = useState(6);

  useEffect(() => {
    if (viewMode === 'forecast') {
      setIsLoading(true);
      // Simulate API call for Prophet forecasting
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [viewMode, selectedSpecialty]);

  // Handle view change (monthly, seasonal, etc.)
  const handleViewChange = (view) => {
    setTimeframe(view);
  };

  // Toggle between historical and forecast views
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'forecast') {
      setShowDecomposition(false);
    }
  };

  // Handle specialty selection
  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  // Handle comparison specialty selection
  const handleCompareSpecialtyChange = (event) => {
    setCompareSpecialty(event.target.value);
  };

  // Toggle seasonal decomposition view
  const toggleDecomposition = () => {
    setShowDecomposition(!showDecomposition);
    if (!showDecomposition) {
      setViewMode('historical');
    }
  };

  // Toggle comparison mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };

  // Get peak month or season for a specialty
  const getPeakSeason = (specialty) => {
    return seasonalPeaks[specialty] || { peak: "Summer", increase: 0.10, reason: "General trend" };
  };

  // Format data for Prophet forecast
  const getForecastData = () => {
    return prophetForecastData.predictions[selectedSpecialty] || [];
  };

  // Format data for year-over-year comparison
  const getYearOverYearData = () => {
    // Simulate year-over-year data
    const currentYear = data.monthly.map(item => ({
      month: item.month,
      current: item.leads * (0.7 + Math.random() * 0.4), // Random variation
      previous: item.leads * (0.6 + Math.random() * 0.3)  // Random variation
    }));
    
    return currentYear;
  };

  // Get data for seasonal decomposition view
  const getDecompositionData = () => {
    return prophetForecastData.seasonalDecomposition[selectedSpecialty] || {
      trend: [],
      seasonal: [],
      residual: []
    };
  };

  // Format historical monthly data with year-over-year comparison
  const getMonthlyData = () => {
    if (!compareMode) {
      return data.monthly;
    }
    
    // Generate comparison data when compareMode is true
    return data.monthly.map(item => ({
      ...item,
      [selectedSpecialty]: item.conversions,
      [compareSpecialty]: Math.round(item.conversions * (0.7 + Math.random() * 0.6))
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
          
          {viewMode === 'historical' && (
            <ButtonGroup variant="outlined" size="small">
              <Button 
                onClick={() => handleViewChange('monthly')}
                variant={timeframe === 'monthly' ? 'contained' : 'outlined'}
              >
                <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} />
                Monthly
              </Button>
              <Button 
                onClick={() => handleViewChange('seasonal')}
                variant={timeframe === 'seasonal' ? 'contained' : 'outlined'}
              >
                <ShowChart fontSize="small" sx={{ mr: 0.5 }} />
                Seasonal
              </Button>
              <Button 
                onClick={() => handleViewChange('yearly')}
                variant={timeframe === 'yearly' ? 'contained' : 'outlined'}
              >
                <CalendarToday fontSize="small" sx={{ mr: 0.5 }} />
                Year-over-Year
              </Button>
            </ButtonGroup>
          )}
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
                  <InputLabel>Specialty</InputLabel>
                  <Select value={selectedSpecialty} onChange={handleSpecialtyChange} label="Specialty">
                    {Object.keys(seasonalPeaks).map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {compareMode && viewMode !== 'forecast' && (
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Compare With</InputLabel>
                    <Select value={compareSpecialty} onChange={handleCompareSpecialtyChange} label="Compare With">
                      {Object.keys(seasonalPeaks)
                        .filter(s => s !== selectedSpecialty)
                        .map((specialty) => (
                          <MenuItem key={specialty} value={specialty}>
                            {specialty}
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                )}
              </Box>
              
              <Box>
                {viewMode === 'historical' && timeframe === 'monthly' && (
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={compareMode} 
                        onChange={toggleCompareMode}
                        size="small"
                      />
                    }
                    label="Compare Specialties"
                  />
                )}
                
                {viewMode === 'historical' && timeframe !== 'seasonal' && !compareMode && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={toggleDecomposition}
                    startIcon={<Autorenew />}
                  >
                    {showDecomposition ? 'Hide Decomposition' : 'Seasonal Decomposition'}
                  </Button>
                )}
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
              <Box height={400}>
                {/* View 1: Monthly Historical Data */}
                {viewMode === 'historical' && timeframe === 'monthly' && !showDecomposition && (
                  <ResponsiveContainer width="100%" height="100%">
                    {!compareMode ? (
                      <BarChart data={data.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          label={{ value: 'Total Leads', angle: -90, position: 'insideLeft' }} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          label={{ value: 'Conversions', angle: 90, position: 'insideRight' }} 
                        />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="leads" name="Total Leads" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#82ca9d" />
                      </BarChart>
                    ) : (
                      <LineChart data={getMonthlyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis label={{ value: 'Conversions', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={selectedSpecialty} 
                          name={selectedSpecialty} 
                          stroke="#8884d8"
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey={compareSpecialty} 
                          name={compareSpecialty} 
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={{ r: 4 }} 
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}

                {/* View 2: Seasonal Decomposition */}
                {viewMode === 'historical' && showDecomposition && (
                  <Grid container spacing={2} height="100%">
                    <Grid item xs={12} height="33%">
                      <Typography variant="subtitle2" gutterBottom>Trend Component</Typography>
                      <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={getDecompositionData().trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" name="Trend" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} height="33%">
                      <Typography variant="subtitle2" gutterBottom>Seasonal Component</Typography>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={getDecompositionData().seasonal}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" name="Seasonal Effect" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} height="33%">
                      <Typography variant="subtitle2" gutterBottom>Residual Component</Typography>
                      <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={getDecompositionData().residual}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="value" name="Residual" stroke="#ff7300" strokeWidth={1} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Grid>
                  </Grid>
                )}

                {/* View 3: Seasonal Analysis */}
                {viewMode === 'historical' && timeframe === 'seasonal' && !showDecomposition && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={Object.keys(data.seasonal).map(season => ({
                          name: season,
                          growth: data.seasonal[season].growth * 100
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Conversion Growth (%)', angle: -90, position: 'insideLeft' }} />
                          <RechartsTooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Growth']} />
                          <Bar dataKey="growth" fill="#8884d8">
                            {Object.keys(data.seasonal).map((season, index) => {
                              let color;
                              switch(season) {
                                case 'Winter': color = '#90caf9'; break;
                                case 'Spring': color = '#a5d6a7'; break; 
                                case 'Summer': color = '#ffcc80'; break;
                                case 'Fall': case 'Monsoon': color = '#ef9a9a'; break;
                                default: color = '#8884d8';
                              }
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Top Specialties by Season
                      </Typography>
                      <TableContainer sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Season</TableCell>
                              <TableCell>Top Specialties</TableCell>
                              <TableCell align="right">Growth</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.keys(data.seasonal).map((season) => (
                              <TableRow key={season} sx={{
                                backgroundColor: 
                                  getPeakSeason(selectedSpecialty).peak === season ? 
                                  'rgba(25, 118, 210, 0.08)' : 'inherit'
                              }}>
                                <TableCell>{season}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {data.seasonal[season].specialties.map((specialty, idx) => (
                                      <Chip 
                                        key={idx} 
                                        label={specialty} 
                                        size="small"
                                        variant={specialty === selectedSpecialty ? "filled" : "outlined"}
                                        color={specialty === selectedSpecialty ? "primary" : "default"} 
                                      />
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  {(data.seasonal[season].growth * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                )}

                {/* View 4: Year-over-Year Analysis */}
                {viewMode === 'historical' && timeframe === 'yearly' && !showDecomposition && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getYearOverYearData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Conversions', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="current" name="2025" fill="#8884d8" />
                      <Line type="monotone" dataKey="previous" name="2024" stroke="#ff7300" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {/* View 5: Forecast View (Prophet) */}
                {viewMode === 'forecast' && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedSpecialty} Lead Conversion Forecast (Next 6 Months)
                      <Tooltip title="Using Facebook Prophet time series forecasting with 95% confidence intervals">
                        <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                      </Tooltip>
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={getForecastData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="upper_bound" 
                          fill="#8884d8" 
                          stroke="none" 
                          fillOpacity={0.2} 
                          name="95% Upper Bound" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower_bound" 
                          fill="#8884d8" 
                          stroke="none" 
                          fillOpacity={0.2} 
                          name="95% Lower Bound" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          name="Forecast" 
                          dot={{ r: 5 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#82ca9d" 
                          strokeWidth={2} 
                          name="Actual" 
                          dot={{ r: 5 }} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedSpecialty} Insights
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Peak Season: {getPeakSeason(selectedSpecialty).peak}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {(getPeakSeason(selectedSpecialty).increase * 100).toFixed(1)}% higher conversion rate
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Reason: {getPeakSeason(selectedSpecialty).reason}
              </Typography>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Current Trend Analysis
              </Typography>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                bgcolor: viewMode === 'forecast' ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                border: viewMode === 'forecast' ? '1px solid rgba(25, 118, 210, 0.3)' : 'none'
              }}>
                {viewMode === 'forecast' ? (
                  <>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Timeline color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="medium">
                        Forecast: {Math.round(getForecastData()[getForecastData().length - 1]?.forecast || 0)}% conversion by Oct-25
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Confidence Interval: ±{Math.round(
                        (getForecastData()[getForecastData().length - 1]?.upper_bound || 0) - 
                        (getForecastData()[getForecastData().length - 1]?.forecast || 0)
                      )}%
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box display="flex" alignItems="center" mb={1}>
                      {data.monthly[data.monthly.length - 1].conversions > 
                       data.monthly[data.monthly.length - 2].conversions ? (
                        <TrendingUp color="success" sx={{ mr: 1 }} />
                      ) : (
                        <TrendingDown color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {data.monthly[data.monthly.length - 1].conversions > 
                         data.monthly[data.monthly.length - 2].conversions ? 
                         "Increasing trend" : "Decreasing trend"} in recent months
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last month: {data.monthly[data.monthly.length - 1].conversions} conversions 
                      ({((data.monthly[data.monthly.length - 1].conversions / 
                         data.monthly[data.monthly.length - 1].leads) * 100).toFixed(1)}% rate)
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Seasonal Recommendations
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="flex-start">
                      <CalendarToday color="primary" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Timing Strategy
                        </Typography>
                        <Typography variant="body2">
                          {getPeakSeason(selectedSpecialty).peak === "Winter" ? 
                            "Increase marketing budget by 15-20% during November-February for optimal results." :
                           getPeakSeason(selectedSpecialty).peak === "Summer" ?
                            "Focus campaign efforts during May-August when demand peaks by 18%." :
                           getPeakSeason(selectedSpecialty).peak === "Spring" ?
                            "Launch new initiatives in March-May to capitalize on seasonal uptick." :
                            "Maximize outreach during September-October for best response rates."}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="flex-start">
                      <EventNote color="secondary" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Content Planning
                        </Typography>
                        <Typography variant="body2">
                          {selectedSpecialty === "Cardiology" ? 
                            "Create heart health awareness content during winter months." :
                           selectedSpecialty === "Dermatology" ?
                            "Focus on sun protection messaging during summer and skincare during winter." :
                           selectedSpecialty === "Orthopedics" ?
                            "Highlight joint pain management during colder months and sports injury prevention in spring/summer." :
                            "Develop educational content addressing seasonal concerns related to this specialty."}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="flex-start">
                      <LocalHospital color="error" sx={{ mr: 1, mt: 0.5 }} />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Staffing Optimization
                        </Typography>
                        <Typography variant="body2">
                          Increase staffing and appointment availability during {getPeakSeason(selectedSpecialty).peak.toLowerCase()} 
                          months by {Math.round(getPeakSeason(selectedSpecialty).increase * 100)}% to accommodate 
                          higher patient volume and maintain service quality.
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TimeBasedTrends;
