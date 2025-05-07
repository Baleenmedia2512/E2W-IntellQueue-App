'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  LineChart, 
  Line,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  InfoOutlined, 
  MedicalServices,
  Bloodtype,
  Psychology,
  LocalHospital,
  BioTech,
  Science,
  Analytics,
  Search,
  Refresh,
  BarChartOutlined,
  BubbleChart,
} from '@mui/icons-material';

// Color scheme for charts
const SPECIALTY_COLORS = [
  '#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0', 
  '#2196f3', '#ff5722', '#673ab7', '#009688', '#3f51b5'
];

// Simulated ML model output for specialty metrics
const specialtyMetrics = {
  'Cardiology': { demographics: 0.85, competition: 0.70, growth: 0.78, profitability: 0.90 },
  'Dermatology': { demographics: 0.75, competition: 0.55, growth: 0.92, profitability: 0.82 },
  'Orthopedics': { demographics: 0.82, competition: 0.68, growth: 0.64, profitability: 0.87 },
  'Neurology': { demographics: 0.72, competition: 0.76, growth: 0.59, profitability: 0.79 },
  'ENT': { demographics: 0.65, competition: 0.72, growth: 0.65, profitability: 0.72 },
  'Ophthalmology': { demographics: 0.68, competition: 0.64, growth: 0.61, profitability: 0.71 },
  'Pediatrics': { demographics: 0.78, competition: 0.58, growth: 0.73, profitability: 0.67 },
  'Dentistry': { demographics: 0.80, competition: 0.82, growth: 0.76, profitability: 0.75 },
  'Gynecology': { demographics: 0.77, competition: 0.62, growth: 0.68, profitability: 0.80 },
  'General Surgery': { demographics: 0.73, competition: 0.79, growth: 0.55, profitability: 0.69 }
};

// Simulated NLP analysis of specialty trend keywords
const nlpAnalysis = {
  'Cardiology': ['heart disease prevention', 'home monitoring', 'non-invasive procedures'],
  'Dermatology': ['telehealth consultations', 'minimally invasive', 'cosmetic procedures'],
  'Orthopedics': ['sports medicine', 'joint replacement', 'rehabilitation services'],
  'Neurology': ['sleep disorders', 'headache treatment', 'cognitive therapy'],
  'ENT': ['allergy testing', 'sinus treatment', 'hearing aids'],
  'Ophthalmology': ['laser surgery', 'vision therapy', 'diabetic eye care'],
  'Pediatrics': ['developmental screening', 'vaccination', 'behavioral health'],
  'Dentistry': ['cosmetic dentistry', 'preventive care', 'implants'],
  'Gynecology': ['wellness exams', 'fertility', 'menopause management'],
  'General Surgery': ['laparoscopic procedures', 'outpatient surgery', 'hernia repair']
};

// Seasonal trends for specialties
const seasonalTrends = {
  'Cardiology': { winter: 0.72, spring: 0.68, summer: 0.65, fall: 0.70 },
  'Dermatology': { winter: 0.58, spring: 0.65, summer: 0.85, fall: 0.68 },
  'Orthopedics': { winter: 0.74, spring: 0.68, summer: 0.62, fall: 0.66 },
  'Neurology': { winter: 0.70, spring: 0.69, summer: 0.68, fall: 0.72 },
  'ENT': { winter: 0.78, spring: 0.82, summer: 0.60, fall: 0.75 },
  'Ophthalmology': { winter: 0.68, spring: 0.72, summer: 0.70, fall: 0.69 },
  'Pediatrics': { winter: 0.80, spring: 0.68, summer: 0.65, fall: 0.76 },
  'Dentistry': { winter: 0.65, spring: 0.70, summer: 0.72, fall: 0.68 },
  'Gynecology': { winter: 0.65, spring: 0.68, summer: 0.72, fall: 0.69 },
  'General Surgery': { winter: 0.66, spring: 0.64, summer: 0.63, fall: 0.65 }
};

// Decision tree influencing factors (simplified representation)
const decisionTreeFactors = [
  { 
    name: 'Demographics', 
    children: [
      { name: 'Age Distribution', importance: 0.22 },
      { name: 'Income Level', importance: 0.18 },
      { name: 'Insurance Coverage', importance: 0.15 }
    ],
    importance: 0.28
  },
  { 
    name: 'Market Factors', 
    children: [
      { name: 'Competitive Density', importance: 0.20 },
      { name: 'Growth Rate', importance: 0.16 },
      { name: 'Reimbursement Rates', importance: 0.15 }
    ],
    importance: 0.24
  },
  { 
    name: 'Patient Needs', 
    children: [
      { name: 'Prevalence of Conditions', importance: 0.19 },
      { name: 'Treatment Urgency', importance: 0.16 },
      { name: 'Seasonal Variation', importance: 0.14 }
    ],
    importance: 0.22
  },
  { 
    name: 'Provider Factors', 
    children: [
      { name: 'Technology Level', importance: 0.17 },
      { name: 'Specialist Availability', importance: 0.16 },
      { name: 'Procedure Complexity', importance: 0.14 }
    ],
    importance: 0.20
  },
  { 
    name: 'Operational', 
    children: [
      { name: 'Cost Structure', importance: 0.17 },
      { name: 'Patient Volume', importance: 0.15 },
      { name: 'Facility Requirements', importance: 0.14 }
    ],
    importance: 0.18
  }
];

// Icons for specialties
const specialtyIcons = {
  'Cardiology': <Bloodtype fontSize="small" />,
  'Dermatology': <BioTech fontSize="small" />,
  'Orthopedics': <LocalHospital fontSize="small" />,
  'Neurology': <Psychology fontSize="small" />,
  'ENT': <MedicalServices fontSize="small" />,
  'Ophthalmology': <Science fontSize="small" />,
  'Pediatrics': <LocalHospital fontSize="small" />,
  'Dentistry': <MedicalServices fontSize="small" />,
  'Gynecology': <LocalHospital fontSize="small" />,
  'General Surgery': <MedicalServices fontSize="small" />
};

const SpecialtyPrediction = ({ data }) => {
  const [selectedView, setSelectedView] = useState('potential');
  const [sortBy, setSortBy] = useState('conversionPotential');
  const [specialties, setSpecialties] = useState([]);
  const [trendData, setTrendData] = useState({});
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [showDecisionTree, setShowDecisionTree] = useState(false);

  useEffect(() => {
    if (data && data.specialties) {
      setSpecialties(data.specialties);
      // Set initial selected specialty to the top one
      if (data.specialties.length > 0 && !selectedSpecialty) {
        setSelectedSpecialty(data.specialties[0].name);
      }
    }
    if (data && data.keywordTrends) {
      setTrendData(data.keywordTrends);
    }
  }, [data, selectedSpecialty]);

  // Filter specialties based on search term
  const filteredSpecialties = specialties.filter(specialty => 
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for radar chart
  const getRadarChartData = (specialty) => {
    const metrics = specialtyMetrics[specialty] || {
      demographics: 0.6,
      competition: 0.6,
      growth: 0.6,
      profitability: 0.6
    };
    
    return [
      { subject: 'Demographic Fit', A: metrics.demographics * 100 },
      { subject: 'Competitive Position', A: (1 - metrics.competition) * 100 },
      { subject: 'Growth Potential', A: metrics.growth * 100 },
      { subject: 'Profitability', A: metrics.profitability * 100 }
    ];
  };

  // Format data for treemap (size based on lead count, color based on conversion potential)
  const treemapData = specialties.map((specialty, index) => ({
    name: specialty.name,
    size: specialty.leadCount,
    value: specialty.conversionPotential * 100,
    color: SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]
  }));

  // Calculate the specialty score (accounting for other factors)
  const getOverallScore = (specialty) => {
    const metrics = specialtyMetrics[specialty.name] || {
      demographics: 0.6,
      competition: 0.6,
      growth: 0.6,
      profitability: 0.6
    };
    
    // Weighted score accounting for multiple factors
    const score = (
      (specialty.conversionPotential * 0.35) +
      (metrics.demographics * 0.20) +
      ((1 - metrics.competition) * 0.15) +
      (metrics.growth * 0.15) +
      (metrics.profitability * 0.15)
    ) * 100;
    
    return Math.round(score);
  };

  // Get seasonal trend data for current selected specialty
  const getSeasonalTrendData = () => {
    if (!selectedSpecialty) return [];
    
    const trends = seasonalTrends[selectedSpecialty];
    if (!trends) return [];
    
    return [
      { name: 'Winter', value: trends.winter * 100 },
      { name: 'Spring', value: trends.spring * 100 },
      { name: 'Summer', value: trends.summer * 100 },
      { name: 'Fall', value: trends.fall * 100 }
    ];
  };

  // Get seasonal comparison data across specialties
  const getSeasonalComparisonData = () => {
    const selectedSeasonData = [];
    
    specialties.forEach((specialty) => {
      const trends = seasonalTrends[specialty.name];
      if (!trends) return;
      
      if (selectedSeason === 'all' || selectedSeason === 'winter') {
        selectedSeasonData.push({ 
          name: specialty.name, 
          season: 'Winter', 
          value: trends.winter * 100,
          fill: '#b3e5fc'
        });
      }
      
      if (selectedSeason === 'all' || selectedSeason === 'spring') {
        selectedSeasonData.push({ 
          name: specialty.name, 
          season: 'Spring', 
          value: trends.spring * 100,
          fill: '#c8e6c9'
        });
      }
      
      if (selectedSeason === 'all' || selectedSeason === 'summer') {
        selectedSeasonData.push({ 
          name: specialty.name, 
          season: 'Summer', 
          value: trends.summer * 100,
          fill: '#ffecb3'
        });
      }
      
      if (selectedSeason === 'all' || selectedSeason === 'fall') {
        selectedSeasonData.push({ 
          name: specialty.name, 
          season: 'Fall', 
          value: trends.fall * 100,
          fill: '#ffccbc'
        });
      }
    });
    
    return selectedSeasonData;
  };

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  // Sort the specialties based on the selected metric
  const sortedSpecialties = [...filteredSpecialties].sort((a, b) => {
    if (sortBy === 'score') {
      return getOverallScore(b) - getOverallScore(a);
    }
    return b[sortBy] - a[sortBy];
  });

  // Get top 3 specialties
  const topSpecialties = sortedSpecialties.slice(0, 3);

  // Format data for bar chart
  const barChartData = sortedSpecialties.map((specialty) => ({
    name: specialty.name,
    conversionPotential: parseFloat((specialty.conversionPotential * 100).toFixed(1)),
    growth: parseFloat((specialty.growth * 100).toFixed(1)),
    mlScore: getOverallScore(specialty)
  }));

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Medical Specialty Conversion Analysis
          <Tooltip title="Analysis of which medical specialties have the highest conversion potential using decision trees, XGBoost, and NLP trend analysis.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showAdvancedInsights}
                onChange={(e) => setShowAdvancedInsights(e.target.checked)}
                color="primary"
              />
            }
            label="Advanced ML Insights"
            sx={{ mr: 2 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>View</InputLabel>
            <Select value={selectedView} onChange={handleViewChange} label="View">
              <MenuItem value="potential">Conversion Potential</MenuItem>
              <MenuItem value="growth">Growth Rate</MenuItem>
              <MenuItem value="treemap">Size vs. Potential</MenuItem>
              <MenuItem value="radar">Multi-factor Analysis</MenuItem>
              <MenuItem value="seasonal">Seasonal Trends</MenuItem>
              <MenuItem value="decision">Decision Tree Model</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="conversionPotential">Conversion Rate</MenuItem>
              <MenuItem value="growth">Growth Rate</MenuItem>
              <MenuItem value="leadCount">Lead Count</MenuItem>
              <MenuItem value="score">ML Score</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Search/Filter Row */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" width="250px">
          <TextField
            size="small"
            placeholder="Search specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ ml: 1 }}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
        
        {selectedView === 'seasonal' && (
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Season</InputLabel>
            <Select value={selectedSeason} onChange={handleSeasonChange} label="Season">
              <MenuItem value="all">All Seasons</MenuItem>
              <MenuItem value="winter">Winter</MenuItem>
              <MenuItem value="spring">Spring</MenuItem>
              <MenuItem value="summer">Summer</MenuItem>
              <MenuItem value="fall">Fall</MenuItem>
            </Select>
          </FormControl>
        )}
        
        {(selectedView === 'radar' || selectedView === 'seasonal') && (
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Specialty</InputLabel>
            <Select value={selectedSpecialty} onChange={handleSpecialtyChange} label="Specialty">
              {specialties.map((specialty) => (
                <MenuItem key={specialty.name} value={specialty.name}>
                  {specialty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {selectedView === 'decision' && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setShowDecisionTree(!showDecisionTree)}
            startIcon={showDecisionTree ? <BarChartOutlined /> : <BubbleChart />}
          >
            {showDecisionTree ? 'Show Feature Importance' : 'Show Decision Tree'}
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Main visualization area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {selectedView === 'potential' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Specialty Conversion Potential
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 80,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Conversion Potential']} />
                    <Bar
                      dataKey="conversionPotential"
                      animationDuration={1500}
                    >
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'growth' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Specialty Growth Rates
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis domain={[0, 30]} tickFormatter={(value) => `${value}%`} label={{ value: 'Annual Growth (%)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Annual Growth']} />
                    <Bar dataKey="growth" fill="#4caf50">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'treemap' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Specialty Size vs. Conversion Potential
                  <Tooltip title="Size represents lead volume, color intensity represents conversion potential">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4/3}
                    stroke="#fff"
                    fill="#8884d8"
                    animationDuration={1000}
                  >
                    {treemapData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        fillOpacity={0.4 + (entry.value / 100) * 0.6}
                      />
                    ))}
                  </Treemap>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'radar' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Multi-factor Analysis for {selectedSpecialty || 'Selected Specialty'}
                  <Tooltip title="AI model analysis of multiple factors affecting specialty success potential">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <RadarChart 
                    outerRadius={120} 
                    width={500} 
                    height={500} 
                    data={getRadarChartData(selectedSpecialty)}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 14 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Radar 
                      name={selectedSpecialty || 'Selected Specialty'} 
                      dataKey="A" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <RechartsTooltip formatter={(value) => [`${value}%`, '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'seasonal' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Seasonal Trend Analysis
                  <Tooltip title="Analysis of how specialty conversion rates vary throughout the year">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                
                {selectedSeason === 'all' ? (
                  // Specialized chart for selected specialty across all seasons
                  selectedSpecialty && (
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart
                        data={getSeasonalTrendData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Conversion Potential (%)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Conversion Potential']} />
                        <Bar dataKey="value">
                          {getSeasonalTrendData().map((entry, index) => {
                            let fill;
                            switch(entry.name) {
                              case 'Winter': fill = '#b3e5fc'; break;
                              case 'Spring': fill = '#c8e6c9'; break;
                              case 'Summer': fill = '#ffecb3'; break;
                              case 'Fall': fill = '#ffccbc'; break;
                              default: fill = SPECIALTY_COLORS[index];
                            }
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  // Comparative chart across specialties for a selected season
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={getSeasonalComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        interval={0} 
                      />
                      <YAxis domain={[40, 90]} label={{ value: 'Conversion Potential (%)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        formatter={(value, name, props) => {
                          if (name === 'value') return [`${value.toFixed(1)}%`, `${props.payload.season}`];
                          return [value, name];
                        }} 
                      />
                      <Bar dataKey="value">
                        {getSeasonalComparisonData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}

            {selectedView === 'decision' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  ML Decision Model: {showDecisionTree ? 'Key Decision Factors' : 'Feature Importance'}
                  <Tooltip title="Visualization of our machine learning model's decision making process for specialty predictions">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                
                {showDecisionTree ? (
                  <Box p={2} height={340} sx={{ overflowY: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Decision Tree Branches for Specialty Prediction
                    </Typography>
                    <Box p={2}>
                      {decisionTreeFactors.map((factor, index) => (
                        <Box key={index} mb={3}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {factor.name} ({(factor.importance * 100).toFixed(1)}%)
                          </Typography>
                          <Box pl={2} pt={1}>
                            {factor.children.map((child, childIndex) => (
                              <Box key={childIndex} display="flex" alignItems="center" mb={1}>
                                <Box width={12} height={12} bgcolor={SPECIALTY_COLORS[index]} borderRadius="50%" mr={1} />
                                <Box width="100%">
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">
                                      {child.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {(child.importance * 100).toFixed(1)}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={child.importance * 100} 
                                    sx={{ 
                                      mt: 0.5, 
                                      height: 4, 
                                      borderRadius: 2,
                                      backgroundColor: 'rgba(0,0,0,0.05)',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: SPECIALTY_COLORS[index]
                                      }
                                    }} 
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart
                      data={decisionTreeFactors}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.35]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis dataKey="name" type="category" width={140} />
                      <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Feature Importance']} />
                      <Bar dataKey="importance">
                        {decisionTreeFactors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right sidebar with top specialties and insights */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  AI-Selected Top Specialties
                </Typography>
                <Box>
                  {topSpecialties.map((specialty, index) => (
                    <Card variant="outlined" key={index} sx={{ mb: 2, borderLeft: `4px solid ${SPECIALTY_COLORS[index]}` }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center">
                            {specialtyIcons[specialty.name] || <MedicalServices fontSize="small" />}
                            <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                              {specialty.name}
                            </Typography>
                          </Box>
                          <Chip 
                            label={`${getOverallScore(specialty)}% ML Score`} 
                            size="small"
                            sx={{ 
                              bgcolor: SPECIALTY_COLORS[index],
                              color: 'white',
                              fontWeight: 'bold'
                            }} 
                          />
                        </Box>
                        
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Conversion Potential:
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <LinearProgress 
                              variant="determinate" 
                              value={specialty.conversionPotential * 100} 
                              sx={{ 
                                flexGrow: 1, 
                                mr: 1, 
                                height: 8, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: SPECIALTY_COLORS[index]
                                }
                              }} 
                            />
                            <Typography variant="body2">
                              {(specialty.conversionPotential * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Growth Rate:
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <LinearProgress 
                              variant="determinate" 
                              value={specialty.growth * 100} 
                              sx={{ 
                                flexGrow: 1, 
                                mr: 1, 
                                height: 8, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#4caf50'
                                }
                              }} 
                            />
                            <Typography variant="body2">
                              {(specialty.growth * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            Best Season:
                          </Typography>
                          <Box display="flex" alignItems="center">
                            {(() => {
                              const trends = seasonalTrends[specialty.name];
                              if (!trends) return 'N/A';
                              
                              const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
                              const values = [trends.winter, trends.spring, trends.summer, trends.fall];
                              const maxIndex = values.indexOf(Math.max(...values));
                              
                              const seasonColors = {
                                'Winter': '#b3e5fc',
                                'Spring': '#c8e6c9',
                                'Summer': '#ffecb3',
                                'Fall': '#ffccbc'
                              };
                              
                              return (
                                <Chip 
                                  label={seasons[maxIndex]} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: seasonColors[seasons[maxIndex]],
                                  }} 
                                />
                              );
                            })()}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Trending Keywords
                  <Tooltip title="NLP analysis of trending keywords for medical specialties">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                <Box my={1}>
                  <Typography variant="subtitle2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> Rising Trends
                  </Typography>
                  <Box mt={1}>
                    {trendData.rising && trendData.rising.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword}
                        size="small"
                        sx={{ m: 0.5, bgcolor: 'rgba(76, 175, 80, 0.1)' }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDown fontSize="small" sx={{ mr: 0.5 }} /> Declining Trends
                  </Typography>
                  <Box mt={1}>
                    {trendData.falling && trendData.falling.map((keyword, index) => (
                      <Chip 
                        key={index} 
                        label={keyword}
                        size="small"
                        sx={{ m: 0.5, bgcolor: 'rgba(244, 67, 54, 0.1)' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Advanced ML Insights Section */}
        {showAdvancedInsights && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Advanced ML Insights & NLP Analysis
                <Tooltip title="Insights derived from our machine learning models and natural language processing of market data">
                  <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                </Tooltip>
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Specialty-Specific Keyword Analysis
                  </Typography>
                  <TableContainer component={Box}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Specialty</TableCell>
                          <TableCell>Trending Keywords (NLP Analysis)</TableCell>
                          <TableCell align="right">ML Confidence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topSpecialties.map((specialty, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                {specialtyIcons[specialty.name] || <MedicalServices fontSize="small" />}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {specialty.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" flexWrap="wrap">
                                {(nlpAnalysis[specialty.name] || []).map((keyword, kidx) => (
                                  <Chip 
                                    key={kidx} 
                                    label={keyword} 
                                    size="small" 
                                    sx={{ 
                                      m: 0.3, 
                                      bgcolor: `${SPECIALTY_COLORS[index]}20`
                                    }} 
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {getOverallScore(specialty)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    ML Model-Generated Recommendations
                  </Typography>
                  <Box mb={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Analytics color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" color="primary">
                                Strategic Recommendation
                              </Typography>
                            </Box>
                            <Typography variant="body2" paragraph>
                              Focus marketing resources on {topSpecialties[0]?.name} and {topSpecialties[1]?.name} for highest conversion potential in the next quarter.
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              ML Confidence: 92%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Analytics color="secondary" sx={{ mr: 1 }} />
                              <Typography variant="h6" color="secondary">
                                Content Strategy
                              </Typography>
                            </Box>
                            <Typography variant="body2" paragraph>
                              Create targeted content around keywords "{nlpAnalysis[topSpecialties[0]?.name]?.[0]}" and "{nlpAnalysis[topSpecialties[0]?.name]?.[1]}" for higher engagement.
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              ML Confidence: 87%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Analytics color="error" sx={{ mr: 1 }} />
                              <Typography variant="h6" color="error">
                                Risk Assessment
                              </Typography>
                            </Box>
                            <Typography variant="body2" paragraph>
                              Reduce focus on "General Surgery" as conversion rates are trending downward and competition is increasing rapidly.
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              ML Confidence: 83%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SpecialtyPrediction;