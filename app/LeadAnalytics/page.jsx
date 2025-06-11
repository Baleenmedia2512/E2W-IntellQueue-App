'use client';
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import RegionalInsights from './components/RegionalInsights';
import SpecialtyPrediction from './components/SpecialtyPrediction';
import TimeBasedTrends from './components/TimeBasedTrends';
import CompetitiveIntelligence from './components/CompetitiveIntelligence';
import LeadScoringEngine from './components/LeadScoringEngine';
import LeadPrioritization from './components/LeadPrioritization';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { 
  Tabs, 
  Tab, 
  Box, 
  CircularProgress, 
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  AppBar
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BarChart, Assessment, Public, Timelapse, TrendingUp, Business, Insights 
} from '@mui/icons-material';

export default function LeadAnalytics() {
  const router = useRouter();
  const { userName, appRights, companyName: UserCompanyName } = useAppSelector(state => state.authSlice);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (!userName || !UserCompanyName) {
      router.push('/login');
      return;
    }
    
    // Simulate API call to get analytics data
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // Using simulated data since you mentioned not using external backend
        setTimeout(() => {
          const simulatedData = generateSimulatedData();
          setAnalyticsData(simulatedData);
          setLoading(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [userName, UserCompanyName, router]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Function to generate simulated data for the analytics
  const generateSimulatedData = () => {
    return {
      // Simulated data for regional insights
      regionalData: {
        regions: [
          { id: 1, name: 'North', conversionRate: 0.68, population: 2500000, leadCount: 1250, successRate: 0.72 },
          { id: 2, name: 'South', conversionRate: 0.54, population: 3100000, leadCount: 1850, successRate: 0.61 },
          { id: 3, name: 'East', conversionRate: 0.43, population: 1800000, leadCount: 920, successRate: 0.48 },
          { id: 4, name: 'West', conversionRate: 0.72, population: 2750000, leadCount: 1580, successRate: 0.77 },
          { id: 5, name: 'Central', conversionRate: 0.51, population: 1500000, leadCount: 760, successRate: 0.55 },
        ],
        predictedHotspots: ['West Delhi', 'South Mumbai', 'East Bangalore', 'North Chennai']
      },
      
      // Simulated data for specialty prediction
      specialtyData: {
        specialties: [
          { name: 'Cardiology', conversionPotential: 0.85, growth: 0.12, leadCount: 320 },
          { name: 'Orthopedics', conversionPotential: 0.73, growth: 0.09, leadCount: 280 },
          { name: 'Dermatology', conversionPotential: 0.65, growth: 0.15, leadCount: 210 },
          { name: 'ENT', conversionPotential: 0.58, growth: 0.07, leadCount: 185 },
          { name: 'Neurology', conversionPotential: 0.79, growth: 0.11, leadCount: 175 },
          { name: 'Ophthalmology', conversionPotential: 0.67, growth: 0.08, leadCount: 165 },
          { name: 'Pediatrics', conversionPotential: 0.72, growth: 0.13, leadCount: 230 },
        ],
        keywordTrends: {
          rising: ['telemedicine', 'home healthcare', 'preventive care'],
          falling: ['inpatient services', 'conventional surgery']
        }
      },
      
      // Simulated data for time-based trends
      timeData: {
        monthly: [
          { month: 'Jan', leads: 120, conversions: 45 },
          { month: 'Feb', leads: 135, conversions: 52 },
          { month: 'Mar', leads: 160, conversions: 62 },
          { month: 'Apr', leads: 190, conversions: 73 },
          { month: 'May', leads: 210, conversions: 95 },
          { month: 'Jun', leads: 180, conversions: 78 },
          { month: 'Jul', leads: 175, conversions: 72 },
          { month: 'Aug', leads: 165, conversions: 68 },
          { month: 'Sep', leads: 195, conversions: 85 },
          { month: 'Oct', leads: 225, conversions: 102 },
          { month: 'Nov', leads: 245, conversions: 115 },
          { month: 'Dec', leads: 205, conversions: 88 },
        ],
        seasonal: {
          'Winter': { specialties: ['ENT', 'Pulmonology'], growth: 0.22 },
          'Summer': { specialties: ['Dermatology', 'Ophthalmology'], growth: 0.18 },
          'Monsoon': { specialties: ['Infectious Disease', 'Pediatrics'], growth: 0.15 },
          'Spring': { specialties: ['Allergy', 'ENT'], growth: 0.19 }
        }
      },
      
      // Simulated data for competitive intelligence
      competitiveData: {
        competitors: [
          { name: 'Competitor A', adSpend: 850000, webTraffic: 124000, keywords: 1250, marketShare: 0.28 },
          { name: 'Competitor B', adSpend: 720000, webTraffic: 98000, keywords: 980, marketShare: 0.23 },
          { name: 'Competitor C', adSpend: 550000, webTraffic: 76000, keywords: 850, marketShare: 0.17 },
          { name: 'Your Company', adSpend: 680000, webTraffic: 105000, keywords: 1020, marketShare: 0.21 },
          { name: 'Competitor D', adSpend: 420000, webTraffic: 62000, keywords: 720, marketShare: 0.11 },
        ],
        keywordGaps: ['affordable healthcare', 'quick appointment', 'specialist consultation'],
        contentGaps: ['patient success stories', 'healthcare technology', 'insurance coverage']
      },
      
      // Simulated data for lead scoring
      leadScoringData: {
        scoringModel: {
          demographicFit: { weight: 0.25, factors: ['age', 'location', 'income'] },
          engagementLevel: { weight: 0.30, factors: ['website visits', 'email opens', 'call duration'] },
          budgetRange: { weight: 0.25, factors: ['price sensitivity', 'payment history'] },
          timeframe: { weight: 0.20, factors: ['urgency', 'decision timeline'] }
        },
        recentLeads: [
          { id: 1, name: 'Raj Patel', score: 92, probability: 0.88, factors: { demographic: 0.95, engagement: 0.90, budget: 0.85, timeframe: 0.98 } },
          { id: 2, name: 'Priya Singh', score: 85, probability: 0.82, factors: { demographic: 0.80, engagement: 0.95, budget: 0.90, timeframe: 0.75 } },
          { id: 3, name: 'Amit Kumar', score: 78, probability: 0.76, factors: { demographic: 0.85, engagement: 0.75, budget: 0.80, timeframe: 0.70 } },
          { id: 4, name: 'Sneha Gupta', score: 65, probability: 0.62, factors: { demographic: 0.60, engagement: 0.65, budget: 0.75, timeframe: 0.60 } },
          { id: 5, name: 'Vikram Reddy', score: 89, probability: 0.84, factors: { demographic: 0.90, engagement: 0.85, budget: 0.95, timeframe: 0.80 } },
        ]
      },
      
      // Simulated data for lead prioritization
      prioritizationData: {
        highPriority: [
          { id: 101, name: 'Arjun Mehta', contact: '9876543210', score: 95, lastContact: '2025-05-01', notes: 'Ready to finalize, needs follow-up call' },
          { id: 102, name: 'Shalini Verma', contact: '8765432109', score: 92, lastContact: '2025-05-02', notes: 'Interested in premium package' },
          { id: 103, name: 'Karthik Nair', contact: '7654321098', score: 90, lastContact: '2025-05-03', notes: 'Has budget approval, waiting for proposal' },
        ],
        mediumPriority: [
          { id: 104, name: 'Neha Sharma', contact: '6543210987', score: 75, lastContact: '2025-04-28', notes: 'Reviewing competitor offers' },
          { id: 105, name: 'Rahul Mishra', contact: '5432109876', score: 72, lastContact: '2025-04-29', notes: 'Pending budget approval' },
          { id: 106, name: 'Divya Kapoor', contact: '4321098765', score: 68, lastContact: '2025-04-30', notes: 'Requested more information' },
        ],
        lowPriority: [
          { id: 107, name: 'Suresh Menon', contact: '3210987654', score: 55, lastContact: '2025-04-25', notes: 'Initial inquiry only' },
          { id: 108, name: 'Ananya Patel', contact: '2109876543', score: 48, lastContact: '2025-04-26', notes: 'Budget constraints' },
          { id: 109, name: 'Mahesh Joshi', contact: '1098765432', score: 42, lastContact: '2025-04-27', notes: 'Long-term prospect only' },
        ]
      }
    };
  };

  if (!userName || !UserCompanyName) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography ml={2} variant="h6">Loading Analytics Data...</Typography>
      </Box>
    );
  }

  // Mock data for all analytics components
  const mockData = {
    // Regional data
    regions: [
      { id: 1, name: 'Delhi NCR', population: 32000000, leadCount: 1250, conversionRate: 0.68, successRate: 0.72 },
      { id: 2, name: 'Mumbai Metro', population: 23700000, leadCount: 980, conversionRate: 0.62, successRate: 0.68 },
      { id: 3, name: 'Bangalore', population: 12500000, leadCount: 870, conversionRate: 0.71, successRate: 0.75 },
      { id: 4, name: 'Chennai', population: 10900000, leadCount: 720, conversionRate: 0.58, successRate: 0.64 },
      { id: 5, name: 'Hyderabad', population: 10000000, leadCount: 680, conversionRate: 0.65, successRate: 0.70 },
      { id: 6, name: 'Kolkata', population: 14900000, leadCount: 520, conversionRate: 0.52, successRate: 0.60 },
      { id: 7, name: 'Pune', population: 6500000, leadCount: 480, conversionRate: 0.63, successRate: 0.67 },
      { id: 8, name: 'Ahmedabad', population: 8200000, leadCount: 380, conversionRate: 0.56, successRate: 0.62 }
    ],
    predictedHotspots: ['Noida Sector 62', 'Powai Mumbai', 'Whitefield Bangalore', 'Gachibowli Hyderabad'],
    
    // Specialty data
    specialties: [
      { name: 'Cardiology', conversionPotential: 0.78, growth: 0.15, leadCount: 450 },
      { name: 'Dermatology', conversionPotential: 0.72, growth: 0.23, leadCount: 380 },
      { name: 'Orthopedics', conversionPotential: 0.68, growth: 0.12, leadCount: 420 },
      { name: 'Neurology', conversionPotential: 0.65, growth: 0.09, leadCount: 320 },
      { name: 'ENT', conversionPotential: 0.63, growth: 0.14, leadCount: 290 },
      { name: 'Ophthalmology', conversionPotential: 0.61, growth: 0.11, leadCount: 310 },
      { name: 'Pediatrics', conversionPotential: 0.60, growth: 0.17, leadCount: 350 },
      { name: 'Dentistry', conversionPotential: 0.58, growth: 0.21, leadCount: 270 },
      { name: 'Gynecology', conversionPotential: 0.57, growth: 0.13, leadCount: 330 },
      { name: 'General Surgery', conversionPotential: 0.55, growth: 0.08, leadCount: 280 }
    ],
    keywordTrends: {
      rising: ['telemedicine', 'affordable healthcare', 'online consultation', 'health insurance', 'preventive care'],
      falling: ['emergency care', 'cosmetic surgery', 'international medical tourism', 'second opinion', 'elective procedures']
    },
    
    // Time-based data
    monthly: [
      { month: 'Jan', leads: 950, conversions: 186 },
      { month: 'Feb', leads: 870, conversions: 174 },
      { month: 'Mar', leads: 1050, conversions: 231 },
      { month: 'Apr', leads: 1150, conversions: 265 },
      { month: 'May', leads: 1280, conversions: 307 },
      { month: 'Jun', leads: 1240, conversions: 273 },
      { month: 'Jul', leads: 980, conversions: 196 },
      { month: 'Aug', leads: 870, conversions: 183 },
      { month: 'Sep', leads: 930, conversions: 205 },
      { month: 'Oct', leads: 1100, conversions: 253 },
      { month: 'Nov', leads: 1350, conversions: 324 },
      { month: 'Dec', leads: 1180, conversions: 272 }
    ],
    seasonal: {
      'Summer': { specialties: ['Dermatology', 'Ophthalmology', 'Pediatrics'], growth: 0.18 },
      'Winter': { specialties: ['ENT', 'Pulmonology', 'Cardiology'], growth: 0.12 },
      'Monsoon': { specialties: ['Pediatrics', 'General Medicine', 'Infectious Disease'], growth: 0.15 },
      'Spring': { specialties: ['Orthopedics', 'Gynecology', 'Allergy & Immunology'], growth: 0.09 }
    },
    
    // Competitive data
    competitors: [
      { name: 'Your Company', marketShare: 0.28, adSpend: 1200000, webTraffic: 425000, keywords: 1850 },
      { name: 'Competitor A', marketShare: 0.32, adSpend: 1450000, webTraffic: 480000, keywords: 2100 },
      { name: 'Competitor B', marketShare: 0.18, adSpend: 820000, webTraffic: 320000, keywords: 1450 },
      { name: 'Competitor C', marketShare: 0.15, adSpend: 750000, webTraffic: 290000, keywords: 1250 },
      { name: 'Competitor D', marketShare: 0.07, adSpend: 350000, webTraffic: 180000, keywords: 950 }
    ],
    keywordGaps: ['affordable specialist', 'rapid appointment', 'online doctor review', 'digital health records', 'transparent pricing'],
    contentGaps: ['patient success stories', 'specialist credentialing', 'insurance network explanations', 'medical technology advances', 'wellness tips'],
    
    // Lead scoring model data
    scoringModel: {
      demographicFit: {
        weight: 0.3,
        factors: ['age', 'income', 'location', 'family size', 'occupation']
      },
      engagementLevel: {
        weight: 0.25,
        factors: ['website visits', 'content downloads', 'email opens', 'call duration', 'form fills']
      },
      budgetRange: {
        weight: 0.25,
        factors: ['stated budget', 'insurance coverage', 'payment history', 'previous treatment value']
      },
      timeframe: {
        weight: 0.2,
        factors: ['urgency indicator', 'decision timeline', 'seasonal factors']
      }
    },
    recentLeads: [
      { id: 101, name: 'Amit Sharma', score: 92, probability: 0.88, factors: { demographic: 0.95, engagement: 0.82, budget: 0.93, timeframe: 0.85 } },
      { id: 102, name: 'Priya Patel', score: 87, probability: 0.81, factors: { demographic: 0.90, engagement: 0.79, budget: 0.88, timeframe: 0.80 } },
      { id: 103, name: 'Rahul Verma', score: 78, probability: 0.71, factors: { demographic: 0.75, engagement: 0.85, budget: 0.70, timeframe: 0.75 } },
      { id: 104, name: 'Ananya Singh', score: 83, probability: 0.76, factors: { demographic: 0.82, engagement: 0.90, budget: 0.75, timeframe: 0.72 } },
      { id: 105, name: 'Vikram Mehta', score: 67, probability: 0.62, factors: { demographic: 0.65, engagement: 0.75, budget: 0.60, timeframe: 0.60 } },
      { id: 106, name: 'Neha Gupta', score: 56, probability: 0.48, factors: { demographic: 0.58, engagement: 0.52, budget: 0.55, timeframe: 0.48 } },
      { id: 107, name: 'Sanjay Kumar', score: 74, probability: 0.68, factors: { demographic: 0.78, engagement: 0.67, budget: 0.72, timeframe: 0.65 } },
      { id: 108, name: 'Deepika Shah', score: 89, probability: 0.84, factors: { demographic: 0.92, engagement: 0.85, budget: 0.84, timeframe: 0.78 } },
      { id: 109, name: 'Rajesh Malhotra', score: 63, probability: 0.58, factors: { demographic: 0.60, engagement: 0.70, budget: 0.58, timeframe: 0.55 } }
    ],
    
    // Lead prioritization data
    highPriority: [
      { id: 201, name: 'Rajiv Kapoor', company: 'Metro Healthcare', contact: '9876543210', score: 92, lastContact: '2025-05-01', notes: 'Interested in cardiology package' },
      { id: 202, name: 'Sunita Reddy', company: 'Wellness Chain', contact: '8765432109', score: 90, lastContact: '2025-05-02', notes: 'Requested urgent proposal' },
      { id: 203, name: 'Manoj Bansal', company: 'City Hospitals', contact: '7654321098', score: 88, lastContact: '2025-05-03', notes: 'Follow-up on expansion plan' }
    ],
    mediumPriority: [
      { id: 204, name: 'Anjali Deshmukh', company: 'Family Clinics', contact: '9765432108', score: 78, lastContact: '2025-04-27', notes: 'Comparing with competitor quotes' },
      { id: 205, name: 'Prakash Iyer', company: 'Medicare Solutions', contact: '8654321097', score: 75, lastContact: '2025-04-28', notes: 'Scheduled demo next week' },
      { id: 206, name: 'Kavita Khanna', company: 'Urban Health', contact: '7543210986', score: 73, lastContact: '2025-04-29', notes: 'Interested but budget constraints' }
    ],
    lowPriority: [
      { id: 207, name: 'Harish Sharma', company: 'Regional Medical', contact: '9654321098', score: 65, lastContact: '2025-04-20', notes: 'Initial inquiry only' },
      { id: 208, name: 'Meena Pai', company: 'Community Health', contact: '8543210987', score: 62, lastContact: '2025-04-22', notes: 'Requested information, no follow-up' },
      { id: 209, name: 'Vishal Agarwal', company: 'Health First', contact: '7432109876', score: 59, lastContact: '2025-04-24', notes: 'Exploring options, long timeframe' }
    ]
  };

  // Overall stats for dashboard
  const overallStats = {
    totalLeads: mockData.regions.reduce((sum, region) => sum + region.leadCount, 0),
    avgConversionRate: (mockData.regions.reduce((sum, region) => sum + region.conversionRate, 0) / mockData.regions.length * 100).toFixed(1),
    topPerformingSpecialty: mockData.specialties.reduce((prev, current) => (prev.conversionPotential > current.conversionPotential) ? prev : current).name,
    leadsScored: mockData.recentLeads.length,
    highPriorityLeads: mockData.highPriority.length,
    regionsCovered: mockData.regions.length
  };

  // Tab panel component
  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`analytics-tabpanel-${index}`}
        aria-labelledby={`analytics-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Lead Analytics & Intelligence
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Data-driven insights to optimize your lead conversion strategy and maximize ROI through advanced analytics.
        </Typography>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="lead analytics tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 'medium',
              }
            }}
          >
            <Tab icon={<Assessment />} iconPosition="start" label="Dashboard" />
            <Tab icon={<Public />} iconPosition="start" label="Regional Analysis" />
            <Tab icon={<Insights />} iconPosition="start" label="Specialty Prediction" />
            <Tab icon={<Timelapse />} iconPosition="start" label="Time-Based Trends" />
            <Tab icon={<Business />} iconPosition="start" label="Competitive Intelligence" />
            <Tab icon={<BarChart />} iconPosition="start" label="Lead Scoring" />
            <Tab icon={<TrendingUp />} iconPosition="start" label="Lead Prioritization" />
          </Tabs>
        </Box>
        
        <Box sx={{ py: 3 }}>
          {/* Dashboard View */}
          {value === 0 && analyticsData && (
            <AnalyticsDashboard data={analyticsData} />
          )}
          
          {/* Regional Insights */}
          {value === 1 && analyticsData && (
            <RegionalInsights data={analyticsData.regionalData} />
          )}
          
          {/* Specialty Prediction */}
          {value === 2 && analyticsData && (
            <SpecialtyPrediction data={analyticsData.specialtyData} />
          )}
          
          {/* Time-Based Trends */}
          {value === 3 && analyticsData && (
            <TimeBasedTrends data={analyticsData.timeData} />
          )}
          
          {/* Competitive Intelligence */}
          {value === 4 && analyticsData && (
            <CompetitiveIntelligence data={analyticsData.competitiveData} />
          )}
          
          {/* Lead Scoring Engine */}
          {value === 5 && analyticsData && (
            <LeadScoringEngine data={analyticsData.leadScoringData} />
          )}
          
          {/* Smart Prioritization */}
          {value === 6 && analyticsData && (
            <LeadPrioritization data={analyticsData.prioritizationData} />
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      {value === 0 && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Leads
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.totalLeads.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Across {overallStats.regionsCovered} regions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Avg. Conversion Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.avgConversionRate}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +2.5% from last month
                    </Typography>
                    <TrendingUp fontSize="small" color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    High Priority Leads
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.highPriorityLeads}
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Require immediate attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Top Performing Specialty
                  </Typography>
                  <Typography variant="h5" component="div">
                    {overallStats.topPerformingSpecialty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {(mockData.specialties.find(s => s.name === overallStats.topPerformingSpecialty)?.conversionPotential * 100).toFixed(1)}% conversion potential
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Leads Scored
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.leadsScored}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      {((mockData.recentLeads.filter(l => l.score >= 80).length / overallStats.leadsScored) * 100).toFixed(0)}% high-quality leads
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Peak Season
                  </Typography>
                  <Typography variant="h5" component="div">
                    Summer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    18% higher conversion rates
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Tabs Navigation */}
      
      {/* Tab Panels - Removing redundant TabPanel content since we're using components above */}
      {/* Only keeping summary cards in index 0 view */}
      {value === 0 && (
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Total Leads
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.totalLeads.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Across {overallStats.regionsCovered} regions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    Avg. Conversion Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.avgConversionRate}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="success.main" sx={{ mr: 1 }}>
                      +2.5% from last month
                    </Typography>
                    <TrendingUp fontSize="small" color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card elevation={2}>
                <CardContent>
                  <Typography color="text.secondary" variant="overline">
                    High Priority Leads
                  </Typography>
                  <Typography variant="h4" component="div">
                    {overallStats.highPriorityLeads}
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Require immediate attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}