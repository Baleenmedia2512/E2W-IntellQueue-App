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
  Tooltip,
  Chip,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Link,
  Switch,
  FormControlLabel
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
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  InfoOutlined,
  Dashboard,
  MedicalServices,
  LocationOn,
  AccessTime,
  Analytics,
  PeopleAlt,
  ShowChart,
  EventNote,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  BubbleChart,
  DonutLarge,
  Assessment,
  Category,
  ViewModule,
  TableChart,
  FilterList,
  Refresh,
  CalendarToday,
  ArrowUpward,
  ArrowDownward,
  Speed,
  CompareArrows,
  LocalHospital
} from '@mui/icons-material';

// Sample data for dashboard metrics
const overviewMetrics = {
  totalLeads: 246,
  newLeadsToday: 18,
  conversion: 32.5,
  conversionChange: 4.2,
  avgScore: 73,
  avgScoreChange: 2.8,
  highPriority: 42,
  highPriorityChange: 7,
  revenueGenerated: "₹36,75,000",
  revenueChange: 12.3
};

// Lead source distribution data
const leadSourceData = [
  { name: 'Website', value: 98, fill: '#8884d8' },
  { name: 'Referrals', value: 63, fill: '#83a6ed' },
  { name: 'Social Media', value: 42, fill: '#8dd1e1' },
  { name: 'Email Campaigns', value: 28, fill: '#82ca9d' },
  { name: 'Events', value: 15, fill: '#a4de6c' }
];

// Specialty performance data
const specialtyPerformanceData = [
  { name: 'Cardiology', leads: 35, conversions: 14, conversionRate: 0.40, growth: 0.12 },
  { name: 'Dermatology', leads: 28, conversions: 12, conversionRate: 0.43, growth: 0.18 },
  { name: 'Orthopedics', leads: 32, conversions: 10, conversionRate: 0.31, growth: -0.04 },
  { name: 'Neurology', leads: 22, conversions: 8, conversionRate: 0.36, growth: 0.06 },
  { name: 'ENT', leads: 25, conversions: 9, conversionRate: 0.36, growth: 0.08 },
  { name: 'Ophthalmology', leads: 18, conversions: 5, conversionRate: 0.28, growth: -0.02 }
];

// Regional performance data
const regionalPerformanceData = [
  { name: 'Delhi NCR', value: 88, fill: '#8884d8' },
  { name: 'Mumbai', value: 83, fill: '#83a6ed' },
  { name: 'Bangalore', value: 76, fill: '#8dd1e1' },
  { name: 'Chennai', value: 72, fill: '#82ca9d' },
  { name: 'Hyderabad', value: 69, fill: '#a4de6c' },
  { name: 'Kolkata', value: 65, fill: '#ffc658' }
];

// Monthly trend data
const monthlyTrendData = [
  { month: 'Jan', leads: 52, conversions: 18 },
  { month: 'Feb', leads: 58, conversions: 21 },
  { month: 'Mar', leads: 65, conversions: 25 },
  { month: 'Apr', leads: 72, conversions: 28 },
  { month: 'May', leads: 68, conversions: 24 },
  { month: 'Jun', leads: 74, conversions: 26 },
  { month: 'Jul', leads: 82, conversions: 31 },
  { month: 'Aug', leads: 78, conversions: 29 },
  { month: 'Sep', leads: 84, conversions: 32 },
  { month: 'Oct', leads: 88, conversions: 34 },
  { month: 'Nov', leads: 92, conversions: 37 },
  { month: 'Dec', leads: 98, conversions: 41 }
];

// Conversion by lead score data
const scoreConversionData = [
  { score: '90-100', conversion: 0.86, count: 32 },
  { score: '80-89', conversion: 0.72, count: 48 },
  { score: '70-79', conversion: 0.58, count: 61 },
  { score: '60-69', conversion: 0.43, count: 54 },
  { score: '50-59', conversion: 0.31, count: 29 },
  { score: '0-49', conversion: 0.18, count: 22 }
];

// Priority distribution data
const priorityDistributionData = [
  { name: 'High', value: 42, fill: '#f44336' },
  { name: 'Medium', value: 87, fill: '#ff9800' },
  { name: 'Low', value: 117, fill: '#2196f3' }
];

// Campaign effectiveness data
const campaignEffectivenessData = [
  { 
    campaign: 'Summer Health Check', 
    leads: 45, 
    conversions: 18, 
    conversionRate: 0.4, 
    roi: 3.2,
    specialty: 'Multiple'
  },
  { 
    campaign: 'Cardiology Webinar', 
    leads: 38, 
    conversions: 14, 
    conversionRate: 0.37, 
    roi: 2.8,
    specialty: 'Cardiology'
  },
  { 
    campaign: 'Dermatology Special', 
    leads: 32, 
    conversions: 15, 
    conversionRate: 0.47, 
    roi: 3.5,
    specialty: 'Dermatology'
  },
  { 
    campaign: 'Healthcare Newsletter', 
    leads: 56, 
    conversions: 19, 
    conversionRate: 0.34, 
    roi: 2.6,
    specialty: 'Multiple'
  },
  { 
    campaign: 'Orthopedic Assessment', 
    leads: 29, 
    conversions: 10, 
    conversionRate: 0.34, 
    roi: 2.4,
    specialty: 'Orthopedics'
  }
];

// Competitive analysis data
const competitiveAnalysisData = [
  { competitor: 'Apollo', marketShare: 24, leadConversion: 38, digitalSpend: 65, growthRate: 12 },
  { competitor: 'Max', marketShare: 18, leadConversion: 35, digitalSpend: 72, growthRate: 15 },
  { competitor: 'Fortis', marketShare: 16, leadConversion: 32, digitalSpend: 58, growthRate: 9 },
  { competitor: 'Medanta', marketShare: 14, leadConversion: 30, digitalSpend: 61, growthRate: 11 },
  { competitor: 'Your Practice', marketShare: 12, leadConversion: 41, digitalSpend: 45, growthRate: 18 },
  { competitor: 'Others', marketShare: 16, leadConversion: 28, digitalSpend: 52, growthRate: 7 }
];

// Key insights
const keyInsights = [
  "Dermatology leads have the highest conversion rate at 43%, with 18% growth MoM",
  "78% of high-priority leads convert within 14 days vs. 32% for medium-priority",
  "Delhi NCR region shows highest lead-to-patient conversion at 42%",
  "Lead score accuracy improved by 8.4% with latest ML model update",
  "Summer campaigns show 22% higher engagement for dermatology services",
  "60% of converted leads came from website and referrals combined"
];

const AnalyticsDashboard = ({ data }) => {
  const [timeframe, setTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showDataLabels, setShowDataLabels] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonMetric, setComparisonMetric] = useState('leads');
  
  useEffect(() => {
    if (data) {
      // Process real data when available
    }
  }, [data]);
  
  // Handle timeframe change
  const handleTimeframeChange = (event) => {
    setIsLoading(true);
    setTimeframe(event.target.value);
    
    // Simulate data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Handle specialty filter change
  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };
  
  // Toggle data labels
  const handleDataLabelsToggle = () => {
    setShowDataLabels(!showDataLabels);
  };
  
  // Toggle comparison mode
  const handleComparisonToggle = () => {
    setComparisonMode(!comparisonMode);
  };
  
  // Handle comparison metric change
  const handleComparisonMetricChange = (event) => {
    setComparisonMetric(event.target.value);
  };
  
  // Filter data by selected specialty
  const getFilteredData = (data) => {
    if (selectedSpecialty === 'all') return data;
    return data.filter(item => item.specialty === selectedSpecialty || item.name === selectedSpecialty);
  };
  
  // Format percent change with arrow icon
  const renderPercentChange = (value) => {
    if (value > 0) {
      return (
        <Box component="span" sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
          <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
          {value}%
        </Box>
      );
    } else if (value < 0) {
      return (
        <Box component="span" sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
          <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />
          {Math.abs(value)}%
        </Box>
      );
    }
    return <Box component="span">{value}%</Box>;
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Lead Analytics Dashboard
          <Tooltip title="Comprehensive overview of lead performance, conversion metrics, and insights across all dimensions">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              onChange={handleTimeframeChange}
              label="Timeframe"
            >
              <MenuItem value="day">Last 24 Hours</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>Specialty</InputLabel>
            <Select
              value={selectedSpecialty}
              onChange={handleSpecialtyChange}
              label="Specialty"
            >
              <MenuItem value="all">All Specialties</MenuItem>
              {specialtyPerformanceData.map(specialty => (
                <MenuItem key={specialty.name} value={specialty.name}>
                  {specialty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 800);
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress size={40} />
          <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
            Loading dashboard data...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Key Metrics Overview */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Leads
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="div">
                      {overviewMetrics.totalLeads}
                    </Typography>
                    <PeopleAlt sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary" mr={1}>
                      Today:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      +{overviewMetrics.newLeadsToday}
                    </Typography>
                    {renderPercentChange(8.2)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Conversion Rate
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="div">
                      {overviewMetrics.conversion}%
                    </Typography>
                    <ShowChart sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary" mr={1}>
                      Change:
                    </Typography>
                    {renderPercentChange(overviewMetrics.conversionChange)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Average Lead Score
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="div">
                      {overviewMetrics.avgScore}
                    </Typography>
                    <Speed sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary" mr={1}>
                      Change:
                    </Typography>
                    {renderPercentChange(overviewMetrics.avgScoreChange)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Revenue Generated
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="div">
                      {overviewMetrics.revenueGenerated}
                    </Typography>
                    <Assessment sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary" mr={1}>
                      Growth:
                    </Typography>
                    {renderPercentChange(overviewMetrics.revenueChange)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={3} mb={3}>
            {/* Monthly Trend Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Monthly Lead & Conversion Trend
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={comparisonMode}
                        onChange={handleComparisonToggle}
                        size="small"
                      />
                    }
                    label="Show as percentage"
                  />
                </Box>
                
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    {comparisonMode ? (
                      <LineChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <RechartsTooltip 
                          formatter={(value) => [`${value}%`, 'Conversion Rate']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="conversions"
                          name="Conversion Rate"
                          stroke="#8884d8"
                          data={monthlyTrendData.map(item => ({
                            month: item.month,
                            conversions: ((item.conversions / item.leads) * 100).toFixed(1)
                          }))}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <ComposedChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="leads" 
                          name="Total Leads" 
                          fill="#8884d8" 
                          barSize={20}
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="conversions" 
                          name="Conversions" 
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Lead Source Distribution */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Lead Source Distribution
                </Typography>
                
                <Box height={320} display="flex" flexDirection="column" justifyContent="center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={showDataLabels ? ({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                        labelLine={showDataLabels}
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <Box display="flex" justifyContent="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDataLabels}
                          onChange={handleDataLabelsToggle}
                          size="small"
                        />
                      }
                      label="Show labels"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3} mb={3}>
            {/* Specialty Performance */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Specialty Performance
                  </Typography>
                  
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                      value={comparisonMetric}
                      onChange={handleComparisonMetricChange}
                      label="Metric"
                    >
                      <MenuItem value="leads">Leads</MenuItem>
                      <MenuItem value="conversions">Conversions</MenuItem>
                      <MenuItem value="conversionRate">Conversion Rate</MenuItem>
                      <MenuItem value="growth">Growth</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getFilteredData(specialtyPerformanceData)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={comparisonMetric === 'conversionRate' || comparisonMetric === 'growth' ? 
                                [0, 'dataMax + 0.1'] : [0, 'auto']} 
                        tickFormatter={comparisonMetric === 'conversionRate' || comparisonMetric === 'growth' ? 
                                      (value) => `${(value * 100).toFixed(0)}%` : undefined}
                      />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip 
                        formatter={(value, name) => {
                          if (comparisonMetric === 'conversionRate' || comparisonMetric === 'growth') {
                            return [`${(value * 100).toFixed(1)}%`, name];
                          }
                          return [value, name];
                        }}
                      />
                      <Bar 
                        dataKey={comparisonMetric} 
                        name={comparisonMetric === 'leads' ? 'Total Leads' : 
                              comparisonMetric === 'conversions' ? 'Conversions' :
                              comparisonMetric === 'conversionRate' ? 'Conversion Rate' : 'Growth Rate'}
                        fill="#8884d8"
                      >
                        {getFilteredData(specialtyPerformanceData).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={comparisonMetric === 'growth' ? 
                                 (entry.growth > 0 ? '#4caf50' : '#f44336') : 
                                 `hsl(${index * 30 + 120}, 70%, 50%)`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Region Performance Heat Map */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Regional Performance Heat Map
                </Typography>
                
                <Box height={320}>
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={regionalPerformanceData}
                      dataKey="value"
                      aspectRatio={4/3}
                      stroke="#fff"
                      colorPanel={['#f44336', '#ff9800', '#ffeb3b', '#c6ff00', '#4caf50']}
                    >
                      <RechartsTooltip 
                        formatter={(value, name, props) => [`Score: ${value}`, props.payload.name]} 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 4 }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 3 */}
          <Grid container spacing={3} mb={3}>
            {/* Conversion by Lead Score */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Conversion Rate by Lead Score
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scoreConversionData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Conversion Rate']} />
                      <Area 
                        type="monotone" 
                        dataKey="conversion" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Conversion Rate"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Campaign Effectiveness */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Campaign Effectiveness
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="conversionRate" 
                        name="Conversion Rate" 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        domain={[0, 0.6]}
                        label={{ value: 'Conversion Rate (%)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="roi" 
                        name="ROI" 
                        label={{ value: 'ROI', angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="leads" 
                        range={[30, 150]} 
                        name="Leads Generated"
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => {
                          if (name === 'Conversion Rate') return [`${(value * 100).toFixed(1)}%`, name];
                          if (name === 'ROI') return [`${value.toFixed(1)}x`, name];
                          return [value, name];
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc', borderRadius: 4 }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{data.campaign}</p>
                                <p style={{ margin: 0 }}>Leads: {data.leads}</p>
                                <p style={{ margin: 0 }}>Conversions: {data.conversions}</p>
                                <p style={{ margin: 0 }}>Conversion Rate: {(data.conversionRate * 100).toFixed(1)}%</p>
                                <p style={{ margin: 0 }}>ROI: {data.roi.toFixed(1)}x</p>
                                <p style={{ margin: 0 }}>Specialty: {data.specialty}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Campaigns" 
                        data={getFilteredData(campaignEffectivenessData)} 
                        fill="#8884d8"
                      >
                        {getFilteredData(campaignEffectivenessData).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${index * 50 + 120}, 70%, 50%)`} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 4 */}
          <Grid container spacing={3} mb={3}>
            {/* Competitive Analysis */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Competitive Analysis
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={competitiveAnalysisData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="competitor" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Market Share %" 
                        dataKey="marketShare" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6} 
                      />
                      <Radar 
                        name="Lead Conversion %" 
                        dataKey="leadConversion" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6} 
                      />
                      <Legend />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Priority Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Lead Priority Distribution
                </Typography>
                
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                        dataKey="value"
                      >
                        {priorityDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Key Insights */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Insights & Recommendations
            </Typography>
            
            <Grid container spacing={2}>
              {keyInsights.map((insight, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="flex-start">
                        <Analytics color="primary" sx={{ mr: 1, mt: 0.5 }} />
                        <Typography variant="body2">
                          {insight}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
          
          {/* AI-Powered Recommendations */}
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                AI-Powered Action Recommendations
              </Typography>
              
              <Chip 
                label="ML Generated" 
                color="primary" 
                variant="outlined" 
                size="small" 
                icon={<InfoOutlined />} 
              />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocalHospital sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Specialty Focus
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Increase marketing budget for Dermatology by 15% to capitalize on 43% conversion rate and 18% growth trend.
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      color="primary"
                      sx={{ bgcolor: 'primary.dark' }}
                    >
                      Generate Plan
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocationOn sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Regional Strategy
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Expand Bangalore marketing reach by targeting 3 new suburban areas with high-potential demographics matching Delhi NCR profile.
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      color="success"
                      sx={{ bgcolor: 'success.dark' }}
                    >
                      View Demographics
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <CalendarToday sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight="medium">
                        Timing Optimization
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Launch Dermatology-focused campaign in next 14 days to align with seasonal trend. Projected 22% higher engagement than standard campaign.
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      color="warning"
                      sx={{ bgcolor: 'warning.dark' }}
                    >
                      Schedule Campaign
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;