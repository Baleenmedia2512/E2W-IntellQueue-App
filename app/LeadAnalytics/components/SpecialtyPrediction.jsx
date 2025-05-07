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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge,
  BubbleChart,
  Radar as RadarIcon,
  TrendingFlat,
  Search,
  Refresh,
  Analytics,
  Timeline
} from '@mui/icons-material';

// Mock ML model data for specialty prediction using XGBoost and Decision Trees
const decisionTreeData = {
  model: {
    algorithm: "XGBoost",
    parameters: {
      max_depth: 5,
      learning_rate: 0.1,
      n_estimators: 100,
      objective: 'binary:logistic'
    },
    metrics: {
      accuracy: 0.86,
      precision: 0.83,
      recall: 0.85,
      f1_score: 0.84,
      auc: 0.91
    }
  },
  featureImportance: [
    { feature: 'Patient Demographics', importance: 0.26 },
    { feature: 'Geographic Location', importance: 0.18 },
    { feature: 'Insurance Coverage', importance: 0.22 },
    { feature: 'Past Engagement', importance: 0.14 },
    { feature: 'Seasonal Factors', importance: 0.12 },
    { feature: 'Competitive Index', importance: 0.08 }
  ],
  decisionPath: {
    nodes: [
      { id: 0, condition: 'Insurance Coverage > 75%', samples: 1000, value: [300, 700] },
      { id: 1, condition: 'Demographics: Age > 50', samples: 700, value: [150, 550] },
      { id: 2, condition: 'Season: Summer', samples: 550, value: [100, 450] },
      { id: 3, condition: 'Geographic: Urban', samples: 450, value: [50, 400] },
      { id: 4, leaf: true, class: 'High Conversion', samples: 400, probability: 0.90 }
    ],
    edges: [
      { from: 0, to: 1, condition: 'True' },
      { from: 1, to: 2, condition: 'True' },
      { from: 2, to: 3, condition: 'True' },
      { from: 3, to: 4, condition: 'True' }
    ]
  }
};

// NLP Analysis results for each specialty
const nlpAnalysis = {
  'Cardiology': ['heart health', 'cardiac wellness', 'cholesterol management', 'blood pressure', 'arrhythmia'],
  'Dermatology': ['skin care', 'acne treatment', 'anti-aging', 'skin cancer', 'eczema relief'],
  'Orthopedics': ['joint pain', 'sports medicine', 'arthritis treatment', 'spine health', 'fracture care'],
  'Neurology': ['headache relief', 'stroke prevention', 'memory enhancement', 'sleep disorders', 'epilepsy management'],
  'ENT': ['sinus care', 'hearing solutions', 'allergy treatment', 'voice disorders', 'sleep apnea'],
  'Ophthalmology': ['vision correction', 'cataract surgery', 'glaucoma treatment', 'eye exam', 'retina care'],
  'Pediatrics': ['child wellness', 'developmental milestones', 'immunization', 'growth tracking', 'adolescent care'],
  'Dentistry': ['teeth whitening', 'preventive dental care', 'emergency dental', 'cosmetic dental', 'orthodontics'],
  'Gynecology': ['women\'s health', 'prenatal care', 'fertility treatment', 'menopause management', 'breast health'],
  'General Surgery': ['minimally invasive', 'outpatient procedures', 'hernia repair', 'gallbladder removal', 'appendectomy']
};

// LDA Topic model results for detecting trends
const ldaTopicModel = {
  topics: [
    {
      id: 1,
      name: "Preventive Care",
      keywords: ["prevention", "screening", "early detection", "check-up", "wellness"],
      trending: true,
      growth: 0.32,
      relatedSpecialties: ["Cardiology", "Gynecology", "Dermatology"]
    },
    {
      id: 2,
      name: "Minimally Invasive",
      keywords: ["outpatient", "quick recovery", "minimal scarring", "same-day", "laparoscopic"],
      trending: true,
      growth: 0.28,
      relatedSpecialties: ["General Surgery", "Orthopedics", "Gynecology"]
    },
    {
      id: 3,
      name: "Telemedicine",
      keywords: ["virtual visit", "online consultation", "remote monitoring", "digital health", "telehealth"],
      trending: true,
      growth: 0.45,
      relatedSpecialties: ["Dermatology", "Psychiatry", "General Practice"]
    },
    {
      id: 4,
      name: "Aesthetic Procedures",
      keywords: ["cosmetic", "appearance", "rejuvenation", "beauty", "enhancement"],
      trending: false,
      growth: 0.08,
      relatedSpecialties: ["Dermatology", "Dentistry", "Plastic Surgery"]
    }
  ]
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
  const [showMlDetails, setShowMlDetails] = useState(false);
  const [showNlpAnalysis, setShowNlpAnalysis] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(ldaTopicModel.topics[0]);

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

  // Toggle ML model details
  const toggleMlDetails = () => {
    setShowMlDetails(!showMlDetails);
  };

  // Toggle NLP analysis section
  const toggleNlpAnalysis = () => {
    setShowNlpAnalysis(!showNlpAnalysis);
  };

  // Handle topic selection
  const handleTopicChange = (event) => {
    const topic = ldaTopicModel.topics.find(t => t.id === parseInt(event.target.value));
    if (topic) setSelectedTopic(topic);
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
          Medical Specialty Conversion Potential
          <Tooltip title="ML-powered analysis of medical specialties with the highest conversion potential based on multiple factors.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>View</InputLabel>
            <Select value={selectedView} onChange={handleViewChange} label="View">
              <MenuItem value="potential">Conversion Potential</MenuItem>
              <MenuItem value="growth">Growth Rate</MenuItem>
              <MenuItem value="treemap">Size vs. Potential</MenuItem>
              <MenuItem value="radar">Multi-factor Analysis</MenuItem>
              <MenuItem value="seasonal">Seasonal Trends</MenuItem>
              <MenuItem value="decision">Decision Tree Model</MenuItem>
              <MenuItem value="lda">LDA Topic Analysis</MenuItem>
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    XGBoost Decision Tree Model
                    <Tooltip title="Advanced machine learning model that predicts specialty conversion potential using multiple features">
                      <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleMlDetails}
                  >
                    {showMlDetails ? 'Hide ML Details' : 'Show ML Details'}
                  </Button>
                </Box>

                {showMlDetails && (
                  <Box sx={{ mb: 3, p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Model Performance Metrics:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={2}>
                        <Typography variant="body2">
                          <strong>Accuracy:</strong> {decisionTreeData.model.metrics.accuracy.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Typography variant="body2">
                          <strong>Precision:</strong> {decisionTreeData.model.metrics.precision.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Typography variant="body2">
                          <strong>Recall:</strong> {decisionTreeData.model.metrics.recall.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <Typography variant="body2">
                          <strong>F1:</strong> {decisionTreeData.model.metrics.f1_score.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                          <strong>AUC:</strong> {decisionTreeData.model.metrics.auc.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      XGBoost Parameters:
                    </Typography>
                    <Typography variant="body2">
                      max_depth: {decisionTreeData.model.parameters.max_depth}, 
                      learning_rate: {decisionTreeData.model.parameters.learning_rate}, 
                      estimators: {decisionTreeData.model.parameters.n_estimators}, 
                      objective: {decisionTreeData.model.parameters.objective}
                    </Typography>
                  </Box>
                )}

                <Box height={showMlDetails ? 280 : 340}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={decisionTreeData.featureImportance}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={[0, 0.3]} 
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <YAxis 
                        dataKey="feature" 
                        type="category"
                        width={120}
                      />
                      <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Feature Importance']} />
                      <Bar 
                        dataKey="importance" 
                        fill="#8884d8"
                      >
                        {decisionTreeData.featureImportance.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${index * 30 + 120}, 70%, 50%)`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}

            {selectedView === 'lda' && (
              <Box height={400}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    LDA Topic Analysis
                    <Tooltip title="Latent Dirichlet Allocation topic modeling to identify emerging trends in healthcare">
                      <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleNlpAnalysis}
                    startIcon={showNlpAnalysis ? <BarChartIcon /> : <Timeline />}
                  >
                    {showNlpAnalysis ? 'Show Topic Growth' : 'Show NLP Keywords'}
                  </Button>
                </Box>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mb: 2 }}>
                  <InputLabel>Topic</InputLabel>
                  <Select 
                    value={selectedTopic.id} 
                    onChange={handleTopicChange} 
                    label="Topic"
                  >
                    {ldaTopicModel.topics.map((topic) => (
                      <MenuItem key={topic.id} value={topic.id}>
                        {topic.name} 
                        {topic.trending && (
                          <TrendingUp fontSize="small" color="primary" sx={{ ml: 1 }} />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {showNlpAnalysis ? (
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Phrases for {selectedTopic.name}:
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {selectedTopic.keywords.map((keyword, index) => (
                        <Grid item key={index}>
                          <Chip 
                            label={keyword} 
                            variant="outlined" 
                            color="primary"
                            size="small"
                          />
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                      Related Specialties:
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      {selectedTopic.relatedSpecialties.map((specialty, index) => (
                        <Grid item key={index}>
                          <Chip 
                            label={specialty} 
                            color="secondary"
                            size="small"
                            icon={<MedicalServices fontSize="small" />}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        NLP Keyword Analysis for {selectedTopic.relatedSpecialties[0]}:
                      </Typography>
                      <TableContainer sx={{ mt: 1, maxHeight: 180 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Keyword</TableCell>
                              <TableCell align="right">Relevance</TableCell>
                              <TableCell align="right">Trend</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {nlpAnalysis[selectedTopic.relatedSpecialties[0]].map((keyword, index) => (
                              <TableRow key={index}>
                                <TableCell>{keyword}</TableCell>
                                <TableCell align="right">
                                  {(0.9 - (index * 0.1)).toFixed(2)}
                                </TableCell>
                                <TableCell align="right">
                                  {index < 2 ? (
                                    <TrendingUp fontSize="small" color="success" />
                                  ) : index < 4 ? (
                                    <TrendingFlat fontSize="small" color="primary" />
                                  ) : (
                                    <TrendingDown fontSize="small" color="error" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                ) : (
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ldaTopicModel.topics}
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
                        <YAxis 
                          domain={[0, 0.5]} 
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          label={{ value: 'Topic Growth Rate', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Growth Rate']} />
                        <Bar 
                          dataKey="growth" 
                          fill="#8884d8"
                          animationDuration={1500}
                        >
                          {ldaTopicModel.topics.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.trending ? '#4caf50' : '#ff9800'} 
                              fillOpacity={0.8}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar with specialty details */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Specialties by {sortBy === 'conversionPotential' ? 'Conversion Potential' : 
                               sortBy === 'growth' ? 'Growth Rate' : 
                               sortBy === 'leadCount' ? 'Lead Count' : 
                               'ML Score'}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={showAdvancedInsights} 
                  onChange={(e) => setShowAdvancedInsights(e.target.checked)} 
                  color="primary"
                />
              }
              label="Show Advanced ML Insights"
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2}>
              {topSpecialties.map((specialty, index) => (
                <Grid item xs={12} key={specialty.name}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 2, 
                      borderColor: SPECIALTY_COLORS[index % SPECIALTY_COLORS.length],
                      borderWidth: 2
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                          {specialty.name}
                        </Typography>
                        <Chip 
                          label={`Rank #${index + 1}`} 
                          size="small"
                          sx={{ 
                            bgcolor: SPECIALTY_COLORS[index % SPECIALTY_COLORS.length],
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Conversion Rate
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h6" component="span">
                              {(specialty.conversionPotential * 100).toFixed(1)}%
                            </Typography>
                            {specialty.conversionTrend > 0 ? (
                              <TrendingUp fontSize="small" color="success" sx={{ ml: 1 }} />
                            ) : (
                              <TrendingDown fontSize="small" color="error" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Growth Rate
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h6" component="span">
                              {(specialty.growth * 100).toFixed(1)}%
                            </Typography>
                            {specialty.growth > 0.10 ? (
                              <TrendingUp fontSize="small" color="success" sx={{ ml: 1 }} />
                            ) : (
                              <TrendingFlat fontSize="small" color="primary" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Lead Count
                          </Typography>
                          <Typography variant="h6">
                            {specialty.leadCount.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            ML Score
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Typography variant="h6" component="span">
                              {getOverallScore(specialty)}
                            </Typography>
                            {getOverallScore(specialty) >= 75 ? (
                              <Analytics fontSize="small" color="success" sx={{ ml: 1 }} />
                            ) : (
                              <Analytics fontSize="small" color="warning" sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {showAdvancedInsights && (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Typography variant="subtitle2" gutterBottom>
                            ML Insights
                          </Typography>
                          
                          <Typography variant="body2" paragraph>
                            {specialty.mlInsights || `${specialty.name} shows ${specialty.conversionPotential > 0.75 ? 'excellent' : specialty.conversionPotential > 0.6 ? 'good' : 'moderate'} conversion potential based on demographic match and historical performance. ${specialty.growth > 0.15 ? 'Strong growth trend indicates expanding market.' : specialty.growth > 0.1 ? 'Steady growth indicates market stability.' : 'Moderate growth suggests mature market.'}`}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Key Factors
                          </Typography>
                          
                          <Grid container spacing={1}>
                            {[
                              { name: 'Demographics', value: specialtyMetrics[specialty.name]?.demographics || 0.6 },
                              { name: 'Competition', value: 1 - (specialtyMetrics[specialty.name]?.competition || 0.4) },
                              { name: 'Seasonality', value: getCombinedSeasonality(specialty.name) || 0.7 }
                            ].map((factor, idx) => (
                              <Grid item xs={12} key={factor.name}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <Typography variant="body2" width={100}>
                                    {factor.name}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={factor.value * 100}
                                    sx={{
                                      width: '60%',
                                      height: 8,
                                      borderRadius: 5,
                                      bgcolor: 'rgba(0,0,0,0.1)',
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: SPECIALTY_COLORS[index % SPECIALTY_COLORS.length]
                                      }
                                    }}
                                  />
                                  <Typography variant="body2" width={40}>
                                    {(factor.value * 100).toFixed(0)}%
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Dummy color palette for specialties
const SPECIALTY_COLORS = [
  '#1976d2', // blue
  '#388e3c', // green
  '#d32f2f', // red
  '#f57c00', // orange
  '#7b1fa2', // purple
  '#0097a7', // cyan
  '#c2185b', // pink
  '#fbc02d', // yellow
  '#455a64', // blue-grey
  '#5d4037', // brown
];

// Dummy specialty metrics
const specialtyMetrics = {
  'Cardiology': { demographics: 0.85, competition: 0.65, growth: 0.78, profitability: 0.82 },
  'Dermatology': { demographics: 0.75, competition: 0.45, growth: 0.82, profitability: 0.88 },
  'Orthopedics': { demographics: 0.80, competition: 0.70, growth: 0.65, profitability: 0.75 },
  'Neurology': { demographics: 0.65, competition: 0.55, growth: 0.60, profitability: 0.70 },
  'ENT': { demographics: 0.70, competition: 0.50, growth: 0.65, profitability: 0.75 },
  'Ophthalmology': { demographics: 0.75, competition: 0.60, growth: 0.60, profitability: 0.80 },
  'Pediatrics': { demographics: 0.90, competition: 0.80, growth: 0.70, profitability: 0.65 },
  'Gynecology': { demographics: 0.85, competition: 0.60, growth: 0.75, profitability: 0.78 },
  'Urology': { demographics: 0.70, competition: 0.50, growth: 0.65, profitability: 0.72 },
  'Psychiatry': { demographics: 0.60, competition: 0.40, growth: 0.85, profitability: 0.70 }
};

// Dummy seasonal trends
const seasonalTrends = {
  'Cardiology': { winter: 0.75, spring: 0.65, summer: 0.60, fall: 0.70 },
  'Dermatology': { winter: 0.60, spring: 0.75, summer: 0.85, fall: 0.70 },
  'Orthopedics': { winter: 0.80, spring: 0.75, summer: 0.65, fall: 0.70 },
  'Neurology': { winter: 0.70, spring: 0.65, summer: 0.60, fall: 0.75 },
  'ENT': { winter: 0.85, spring: 0.70, summer: 0.60, fall: 0.80 },
  'Ophthalmology': { winter: 0.65, spring: 0.75, summer: 0.70, fall: 0.65 },
  'Pediatrics': { winter: 0.80, spring: 0.75, summer: 0.60, fall: 0.85 },
  'Gynecology': { winter: 0.70, spring: 0.80, summer: 0.75, fall: 0.70 },
  'Urology': { winter: 0.65, spring: 0.70, summer: 0.75, fall: 0.65 },
  'Psychiatry': { winter: 0.70, spring: 0.65, summer: 0.60, fall: 0.80 }
};

// Helper function to get combined seasonality score
const getCombinedSeasonality = (specialty) => {
  const trends = seasonalTrends[specialty];
  if (!trends) return 0.7;
  
  // Get average of highest two seasons
  const values = Object.values(trends);
  values.sort((a, b) => b - a);
  return (values[0] + values[1]) / 2;
};

export default SpecialtyPrediction;
