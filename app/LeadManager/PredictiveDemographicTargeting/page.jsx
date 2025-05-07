'use client';
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { 
  Tabs, 
  Tab, 
  Box, 
  CircularProgress, 
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  AppBar
} from '@mui/material';
import { 
  Public, 
  LocalHospital, 
  Timelapse, 
  Business, 
  Assignment, 
  Calculate,
  Dashboard
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import existing components from LeadAnalytics for reuse
import RegionalInsights from '@/app/LeadAnalytics/components/RegionalInsights';
import SpecialtyPrediction from '@/app/LeadAnalytics/components/SpecialtyPrediction';
import TimeBasedTrends from '@/app/LeadAnalytics/components/TimeBasedTrends';
import CompetitiveIntelligence from '@/app/LeadAnalytics/components/CompetitiveIntelligence';
import LeadScoringEngine from '@/app/LeadAnalytics/components/LeadScoringEngine';
import LeadPrioritization from '@/app/LeadAnalytics/components/LeadPrioritization';
import AnalyticsDashboard from '@/app/LeadAnalytics/components/AnalyticsDashboard';

// Mock data generator for simulation
const generateSimulatedData = () => {
  return {
    // Region-Level Conversion Scoring data
    regionalData: {
      regions: [
        { id: 1, name: 'North', conversionRate: 0.67, population: 2250000, leadCount: 1250, successRate: 0.72 },
        { id: 2, name: 'South', conversionRate: 0.58, population: 3100000, leadCount: 1850, successRate: 0.64 },
        { id: 3, name: 'East', conversionRate: 0.62, population: 1800000, leadCount: 980, successRate: 0.69 },
        { id: 4, name: 'West', conversionRate: 0.75, population: 2750000, leadCount: 1580, successRate: 0.77 },
        { id: 5, name: 'Central', conversionRate: 0.51, population: 1500000, leadCount: 760, successRate: 0.55 },
      ],
      cities: [
        { id: 1, name: 'Delhi', population: 19000000, leadCount: 1250, conversionRate: 0.68, successRate: 0.73 },
        { id: 2, name: 'Mumbai', population: 20400000, leadCount: 1350, conversionRate: 0.72, successRate: 0.76 },
        { id: 3, name: 'Bangalore', population: 12700000, leadCount: 980, conversionRate: 0.65, successRate: 0.71 },
        { id: 4, name: 'Chennai', population: 10600000, leadCount: 750, conversionRate: 0.63, successRate: 0.69 },
        { id: 5, name: 'Hyderabad', population: 10000000, leadCount: 680, conversionRate: 0.59, successRate: 0.64 },
        { id: 6, name: 'Kolkata', population: 14850000, leadCount: 540, conversionRate: 0.53, successRate: 0.58 },
        { id: 7, name: 'Pune', population: 6500000, leadCount: 420, conversionRate: 0.61, successRate: 0.66 },
        { id: 8, name: 'Ahmedabad', population: 8200000, leadCount: 380, conversionRate: 0.56, successRate: 0.62 }
      ],
      predictedHotspots: ['Noida Sector 62', 'Powai Mumbai', 'Whitefield Bangalore', 'Gachibowli Hyderabad'],
      
      // GeoJSON data would be included here in a real implementation
      geoJsonData: {
        // Simplified for demo purposes
        type: 'FeatureCollection',
        features: []
      }
    },
    
    // Specialty Prediction data
    specialtyData: {
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
        falling: ['in-person visits', 'elective surgery', 'cash payment']
      },
      nlpAnalysis: {
        topics: [
          { topic: 'Remote Care', weight: 0.87, keywords: ['telemedicine', 'virtual', 'remote', 'online'] },
          { topic: 'Affordability', weight: 0.73, keywords: ['cost', 'insurance', 'affordable', 'budget'] },
          { topic: 'Preventive', weight: 0.65, keywords: ['prevention', 'wellness', 'screening', 'early'] }
        ]
      }
    },
    
    // Time-Based Trends data
    timeData: {
      monthly: [
        { month: 'Jan', leads: 120, conversions: 45, specialties: { Cardiology: 12, Dermatology: 9, Orthopedics: 8 } },
        { month: 'Feb', leads: 135, conversions: 52, specialties: { Cardiology: 15, Dermatology: 10, Orthopedics: 9 } },
        { month: 'Mar', leads: 150, conversions: 65, specialties: { Cardiology: 18, Dermatology: 15, Orthopedics: 12 } },
        { month: 'Apr', leads: 165, conversions: 75, specialties: { Cardiology: 22, Dermatology: 18, Orthopedics: 14 } },
        { month: 'May', leads: 180, conversions: 80, specialties: { Cardiology: 25, Dermatology: 22, Orthopedics: 15 } },
        { month: 'Jun', leads: 195, conversions: 90, specialties: { Cardiology: 28, Dermatology: 24, Orthopedics: 16 } },
        { month: 'Jul', leads: 210, conversions: 95, specialties: { Cardiology: 30, Dermatology: 26, Orthopedics: 17 } },
        { month: 'Aug', leads: 225, conversions: 105, specialties: { Cardiology: 32, Dermatology: 28, Orthopedics: 19 } },
        { month: 'Sep', leads: 240, conversions: 112, specialties: { Cardiology: 35, Dermatology: 30, Orthopedics: 21 } },
        { month: 'Oct', leads: 255, conversions: 118, specialties: { Cardiology: 38, Dermatology: 31, Orthopedics: 22 } },
        { month: 'Nov', leads: 270, conversions: 125, specialties: { Cardiology: 42, Dermatology: 33, Orthopedics: 24 } },
        { month: 'Dec', leads: 285, conversions: 132, specialties: { Cardiology: 45, Dermatology: 35, Orthopedics: 26 } }
      ],
      seasonal: {
        'Winter (Dec-Feb)': { 
          top: ['Cardiology', 'Neurology', 'Orthopedics'], 
          conversions: 0.45, 
          leads: 540
        },
        'Spring (Mar-May)': { 
          top: ['Dermatology', 'ENT', 'Ophthalmology'], 
          conversions: 0.48, 
          leads: 495
        },
        'Summer (Jun-Aug)': { 
          top: ['Dermatology', 'Ophthalmology', 'Pediatrics'], 
          conversions: 0.52, 
          leads: 630
        },
        'Fall (Sep-Nov)': { 
          top: ['ENT', 'Cardiology', 'Neurology'], 
          conversions: 0.47, 
          leads: 765
        }
      },
      forecastData: [
        { month: 'Jan', actual: 45, forecast: null },
        { month: 'Feb', actual: 52, forecast: null },
        { month: 'Mar', actual: 65, forecast: null },
        { month: 'Apr', actual: 75, forecast: null },
        { month: 'May', actual: 80, forecast: null },
        { month: 'Jun', actual: 90, forecast: null },
        { month: 'Jul', actual: 95, forecast: null },
        { month: 'Aug', actual: 105, forecast: null },
        { month: 'Sep', actual: 112, forecast: null },
        { month: 'Oct', actual: 118, forecast: null },
        { month: 'Nov', actual: 125, forecast: null },
        { month: 'Dec', actual: 132, forecast: null },
        { month: 'Jan', actual: null, forecast: 140 },
        { month: 'Feb', actual: null, forecast: 148 },
        { month: 'Mar', actual: null, forecast: 157 }
      ]
    },
    
    // Competitive Intelligence data
    competitiveData: {
      competitors: [
        { name: 'MediCorp Plus', marketShare: 0.28, growthRate: 0.12, specialtyFocus: ['Cardiology', 'Neurology'] },
        { name: 'HealthFirst', marketShare: 0.21, growthRate: 0.09, specialtyFocus: ['Orthopedics', 'Sports Medicine'] },
        { name: 'Prime Health', marketShare: 0.18, growthRate: 0.15, specialtyFocus: ['Dermatology', 'Cosmetic'] },
        { name: 'Metro Medical', marketShare: 0.15, growthRate: 0.07, specialtyFocus: ['General Practice', 'Pediatrics'] },
        { name: 'Wellness Partners', marketShare: 0.12, growthRate: 0.18, specialtyFocus: ['Holistic', 'Preventive'] },
        { name: 'Others', marketShare: 0.06, growthRate: 0.04, specialtyFocus: ['Various'] }
      ],
      adAnalysis: {
        keywords: [
          { term: 'affordable healthcare', volume: 4500, competition: 0.75, trending: true },
          { term: 'specialist doctor', volume: 3800, competition: 0.68, trending: false },
          { term: 'online consultation', volume: 5200, competition: 0.81, trending: true },
          { term: 'same day appointment', volume: 2900, competition: 0.62, trending: true },
          { term: 'health insurance accepted', volume: 3400, competition: 0.72, trending: false }
        ],
        channels: [
          { name: 'Google Ads', share: 0.45, cpc: 2.75, effectiveness: 0.82 },
          { name: 'Facebook', share: 0.28, cpc: 1.85, effectiveness: 0.76 },
          { name: 'Instagram', share: 0.15, cpc: 2.10, effectiveness: 0.69 },
          { name: 'LinkedIn', share: 0.08, cpc: 3.40, effectiveness: 0.72 },
          { name: 'Twitter', share: 0.04, cpc: 1.65, effectiveness: 0.58 }
        ]
      },
      regionalDominance: [
        { region: 'North', leader: 'MediCorp Plus', share: 0.34 },
        { region: 'South', leader: 'HealthFirst', share: 0.29 },
        { region: 'East', leader: 'Prime Health', share: 0.31 },
        { region: 'West', leader: 'Metro Medical', share: 0.27 },
        { region: 'Central', leader: 'Wellness Partners', share: 0.25 }
      ]
    },
    
    // Lead Scoring Engine data
    leadScoringData: {
      scoringModel: {
        factors: {
          demographic: 0.25,
          engagement: 0.30,
          budget: 0.25,
          timeframe: 0.20
        },
        thresholds: {
          high: 80,
          medium: 60,
          low: 40
        }
      },
      recentLeads: [
        {
          id: 1,
          name: 'Aravind Hospital',
          probability: 0.85,
          score: 87,
          factors: {
            demographic: 0.92,
            engagement: 0.88,
            budget: 0.85,
            timeframe: 0.78
          }
        },
        {
          id: 2,
          name: 'City Medical Center',
          probability: 0.78,
          score: 82,
          factors: {
            demographic: 0.86,
            engagement: 0.79,
            budget: 0.90,
            timeframe: 0.72
          }
        },
        {
          id: 3,
          name: 'Wellness Clinic',
          probability: 0.72,
          score: 76,
          factors: {
            demographic: 0.75,
            engagement: 0.82,
            budget: 0.70,
            timeframe: 0.74
          }
        },
        {
          id: 4,
          name: 'Family Health Services',
          probability: 0.63,
          score: 68,
          factors: {
            demographic: 0.65,
            engagement: 0.72,
            budget: 0.62,
            timeframe: 0.68
          }
        },
        {
          id: 5,
          name: 'Metro Healthcare',
          probability: 0.56,
          score: 62,
          factors: {
            demographic: 0.58,
            engagement: 0.54,
            budget: 0.68,
            timeframe: 0.70
          }
        },
        {
          id: 6,
          name: 'Sunshine Pediatrics',
          probability: 0.49,
          score: 54,
          factors: {
            demographic: 0.52,
            engagement: 0.48,
            budget: 0.50,
            timeframe: 0.45
          }
        },
        {
          id: 7,
          name: 'QuickCare Clinic',
          probability: 0.42,
          score: 48,
          factors: {
            demographic: 0.38,
            engagement: 0.45,
            budget: 0.40,
            timeframe: 0.52
          }
        }
      ]
    },
    
    // Smart Prioritization data
    prioritizedLeads: [
      {
        id: 101,
        name: 'Dr. Suresh Kumar',
        company: 'Advanced Cardiac Care',
        priority: 'High',
        score: 92,
        dueDate: 'Today',
        completed: false,
        specialty: 'Cardiology',
        budget: '₹250,000 - ₹500,000',
        nextAction: 'Follow-up call',
        nextActionDate: 'May 7, 2025'
      },
      {
        id: 102,
        name: 'Dr. Priya Sharma',
        company: 'Skin & Aesthetic Clinic',
        priority: 'High',
        score: 88,
        dueDate: 'Today',
        completed: false,
        specialty: 'Dermatology',
        budget: '₹100,000 - ₹250,000',
        nextAction: 'Send proposal',
        nextActionDate: 'May 7, 2025'
      },
      {
        id: 103,
        name: 'Dr. Ravi Patel',
        company: 'Neuroscience Center',
        priority: 'Medium',
        score: 76,
        dueDate: 'Tomorrow',
        completed: false,
        specialty: 'Neurology',
        budget: '₹150,000 - ₹300,000',
        nextAction: 'Demo presentation',
        nextActionDate: 'May 8, 2025'
      },
      {
        id: 104,
        name: 'Dr. Anjali Desai',
        company: 'Women\'s Health Specialists',
        priority: 'Medium',
        score: 72,
        dueDate: '3 days',
        completed: false,
        specialty: 'Gynecology',
        budget: '₹100,000 - ₹200,000',
        nextAction: 'Send brochure',
        nextActionDate: 'May 10, 2025'
      },
      {
        id: 105,
        name: 'Dr. Rajesh Gupta',
        company: 'Eye Care Solutions',
        priority: 'Low',
        score: 58,
        dueDate: '5 days',
        completed: false,
        specialty: 'Ophthalmology',
        budget: '₹50,000 - ₹150,000',
        nextAction: 'Initial contact',
        nextActionDate: 'May 12, 2025'
      },
      {
        id: 106,
        name: 'Dr. Meera Reddy',
        company: 'Children\'s Medical Group',
        priority: 'High',
        score: 85,
        dueDate: 'Today',
        completed: true,
        specialty: 'Pediatrics',
        budget: '₹200,000 - ₹400,000',
        nextAction: 'Contract signed',
        nextActionDate: 'May 7, 2025'
      }
    ]
  };
};

export default function PredictiveDemographicTargeting() {
  const router = useRouter();
  const { userName, appRights, companyName: UserCompanyName } = useAppSelector(state => state.authSlice);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [predictiveData, setPredictiveData] = useState(null);

  useEffect(() => {
    if (!userName || !UserCompanyName) {
      router.push('/login');
      return;
    }
    
    // Simulate API call to get predictive data
    const fetchPredictiveData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // Using simulated data since you mentioned not using external backend
        setTimeout(() => {
          const simulatedData = generateSimulatedData();
          setPredictiveData(simulatedData);
          setLoading(false);
        }, 1200);
      } catch (error) {
        console.error('Error fetching predictive data:', error);
        toast.error('Failed to load predictive data');
        setLoading(false);
      }
    };
    
    fetchPredictiveData();
  }, [userName, UserCompanyName, router]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading predictive targeting module...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, pb: 10 }}>
      <ToastContainer position="bottom-right" />
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Predictive Demographic Targeting
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Use machine learning to predict high-potential demographics, specialties, and regions for targeted marketing campaigns.
        </Typography>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <AppBar position="static" color="default" elevation={1} sx={{ borderRadius: 1 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="predictive targeting tabs"
          >
            <Tab icon={<Dashboard />} label="Dashboard" iconPosition="start" />
            <Tab icon={<Public />} label="Regional Insights" iconPosition="start" />
            <Tab icon={<LocalHospital />} label="Specialty Prediction" iconPosition="start" />
            <Tab icon={<Timelapse />} label="Time Trends" iconPosition="start" />
            <Tab icon={<Business />} label="Competitive Intel" iconPosition="start" />
            <Tab icon={<Assignment />} label="Lead Scoring" iconPosition="start" />
            <Tab icon={<Calculate />} label="Smart Prioritization" iconPosition="start" />
          </Tabs>
        </AppBar>
        
        <Box sx={{ mt: 3 }}>
          {value === 0 && <AnalyticsDashboard data={predictiveData} />}
          {value === 1 && <RegionalInsights data={predictiveData.regionalData} />}
          {value === 2 && <SpecialtyPrediction data={predictiveData.specialtyData} />}
          {value === 3 && <TimeBasedTrends data={predictiveData.timeData} />}
          {value === 4 && <CompetitiveIntelligence data={predictiveData.competitiveData} />}
          {value === 5 && <LeadScoringEngine data={predictiveData.leadScoringData} />}
          {value === 6 && <LeadPrioritization data={{ 
            highPriority: predictiveData.prioritizedLeads.filter(lead => lead.priority === 'High' && !lead.completed),
            mediumPriority: predictiveData.prioritizedLeads.filter(lead => lead.priority === 'Medium' && !lead.completed),
            lowPriority: predictiveData.prioritizedLeads.filter(lead => lead.priority === 'Low' && !lead.completed)
          }} />}
        </Box>
      </Box>
    </Container>
  );
}