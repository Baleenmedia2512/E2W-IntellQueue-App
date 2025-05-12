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
  IconButton,
  TextField,
  Slider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  InfoOutlined, 
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DonutLarge,
  Edit,
  Save,
  RestartAlt,
  Check,
  Close,
  Star,
  StarHalf,
  StarOutline,
  Person,
  BusinessCenter,
  Schedule,
  MonetizationOn,
  SettingsApplications,
  ShowChart,
  Speed
} from '@mui/icons-material';

// ML model settings for lead scoring
const mlModelSettings = {
  name: "Logistic Regression",
  parameters: {
    C: 1.0,
    penalty: 'l2',
    solver: 'lbfgs',
    max_iter: 100,
    multi_class: 'ovr',
    class_weight: 'balanced'
  },
  performance: {
    accuracy: 0.86,
    precision: 0.83,
    recall: 0.88,
    f1_score: 0.85,
    roc_auc: 0.91
  }
};

// Feature importance from ML model
const featureImportance = [
  { name: "Last Contact Recency", importance: 0.24 },
  { name: "Demographic Match", importance: 0.21 },
  { name: "Website Engagement", importance: 0.18 },
  { name: "Budget Alignment", importance: 0.16 },
  { name: "Previous Conversions", importance: 0.12 },
  { name: "Email Open Rate", importance: 0.09 }
];

// Lead distribution by score ranges
const leadDistribution = [
  { name: "90-100", value: 15, label: "Excellent", color: "#4caf50" },
  { name: "80-89", value: 23, label: "Very Good", color: "#8bc34a" },
  { name: "70-79", value: 31, label: "Good", color: "#cddc39" },
  { name: "60-69", value: 18, label: "Average", color: "#ffeb3b" },
  { name: "50-59", value: 12, label: "Below Average", color: "#ffc107" },
  { name: "0-49", value: 9, label: "Poor", color: "#ff9800" }
];

// Generated lead insights for tooltip content
const leadInsights = {
  "Raj Patel": "High-value prospect with recent engagement on cardiology services pages. Budget approved, ready for immediate follow-up.",
  "Priya Singh": "Demonstrated interest in pediatric services, multiple website visits. Previous patient with positive feedback.",
  "Amit Kumar": "Looking for orthopedic services for corporate health program. Medium budget but potential for volume.",
  "Sneha Gupta": "Early-stage research on dermatology services. Budget uncertain, longer sales cycle expected.",
  "Vikram Reddy": "Ready to finalize ENT package for family. High budget approval, requires specialist consultation."
};

// Historical score thresholds
const scoreThresholds = [
  { month: "Jan", threshold: 65 },
  { month: "Feb", threshold: 67 },
  { month: "Mar", threshold: 70 },
  { month: "Apr", threshold: 68 },
  { month: "May", threshold: 72 },
  { month: "Jun", threshold: 75 },
  { month: "Jul", threshold: 78 },
  { month: "Aug", threshold: 75 },
  { month: "Sep", threshold: 73 },
  { month: "Oct", threshold: 76 },
  { month: "Nov", threshold: 80 },
  { month: "Dec", threshold: 82 }
];

// Demographic attributes and their weights
const demographicAttributes = [
  { name: "Age Range", weight: 0.25, options: ["18-30", "31-45", "46-60", "60+"] },
  { name: "Income Level", weight: 0.30, options: ["Low", "Medium", "High", "Premium"] },
  { name: "Geographic Location", weight: 0.25, options: ["Urban", "Suburban", "Rural", "Remote"] },
  { name: "Family Size", weight: 0.10, options: ["Single", "Couple", "Small Family", "Large Family"] },
  { name: "Education Level", weight: 0.10, options: ["High School", "Undergraduate", "Graduate", "Post-Graduate"] }
];

// Engagement attributes and their weights
const engagementAttributes = [
  { name: "Website Visits", weight: 0.20, options: ["1-2", "3-5", "6-10", "10+"] },
  { name: "Email Opens", weight: 0.15, options: ["None", "Low", "Medium", "High"] },
  { name: "Content Downloads", weight: 0.20, options: ["None", "1-2", "3-5", "6+"] },
  { name: "Form Submissions", weight: 0.25, options: ["None", "Inquiry", "Detailed Form", "Multiple Forms"] },
  { name: "Call Duration", weight: 0.20, options: ["None", "<5min", "5-15min", "15min+"] }
];

const LeadScoringEngine = ({ data }) => {
  const [scoringModel, setScoringModel] = useState({});
  const [recentLeads, setRecentLeads] = useState([]);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingWeights, setEditingWeights] = useState(false);
  const [customWeights, setCustomWeights] = useState({
    demographic: 0.25,
    engagement: 0.30,
    budget: 0.25,
    timeframe: 0.20
  });
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState('demographic');
  const [showMlDetails, setShowMlDetails] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.scoringModel) {
        setScoringModel(data.scoringModel);
      }
      if (data.recentLeads) {
        setRecentLeads(data.recentLeads);
      }
    }
  }, [data]);

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
  };

  const toggleEditWeights = () => {
    setEditingWeights(!editingWeights);
    if (editingWeights) {
      recalculateScores();
    }
  };

  const handleWeightChange = (factor, value) => {
    setCustomWeights({
      ...customWeights,
      [factor]: parseFloat(value)
    });
  };

  const recalculateScores = () => {
    setIsRecalculating(true);
    
    // Simulate API call for recalculating scores
    setTimeout(() => {
      // Normally this would be done on the backend
      const updatedLeads = recentLeads.map(lead => {
        const newScore = Math.round(
          lead.factors.demographic * customWeights.demographic * 100 +
          lead.factors.engagement * customWeights.engagement * 100 +
          lead.factors.budget * customWeights.budget * 100 +
          lead.factors.timeframe * customWeights.timeframe * 100
        ) / (customWeights.demographic + customWeights.engagement + customWeights.budget + customWeights.timeframe);
        
        return {
          ...lead,
          score: Math.min(Math.max(newScore, 0), 100),
          probability: newScore / 100
        };
      });
      
      setRecentLeads(updatedLeads);
      setIsRecalculating(false);
    }, 1500);
  };

  const resetWeights = () => {
    setCustomWeights({
      demographic: 0.25,
      engagement: 0.30,
      budget: 0.25,
      timeframe: 0.20
    });
  };

  const handleFactorChange = (event) => {
    setSelectedFactor(event.target.value);
  };

  const toggleMlDetails = () => {
    setShowMlDetails(!showMlDetails);
  };

  // Get data for lead score distribution chart
  const getScoreDistribution = () => {
    const distribution = {};
    recentLeads.forEach(lead => {
      const scoreRange = lead.score >= 90 ? "90-100" :
                        lead.score >= 80 ? "80-89" :
                        lead.score >= 70 ? "70-79" :
                        lead.score >= 60 ? "60-69" :
                        lead.score >= 50 ? "50-59" : "0-49";
      distribution[scoreRange] = (distribution[scoreRange] || 0) + 1;
    });
    
    return leadDistribution.map(range => ({
      ...range,
      value: distribution[range.name] || 0
    }));
  };

  // Format data for factor radar chart
  const getFactorRadarData = () => {
    if (!selectedLead) return [];
    
    return [
      { factor: "Demographic", value: selectedLead.factors.demographic * 100 },
      { factor: "Engagement", value: selectedLead.factors.engagement * 100 },
      { factor: "Budget", value: selectedLead.factors.budget * 100 },
      { factor: "Timeframe", value: selectedLead.factors.timeframe * 100 }
    ];
  };

  // Get factor details based on selected factor
  const getFactorDetails = () => {
    switch(selectedFactor) {
      case 'demographic':
        return demographicAttributes;
      case 'engagement':
        return engagementAttributes;
      default:
        return demographicAttributes;
    }
  };

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#cddc39';
    if (score >= 60) return '#ffeb3b';
    if (score >= 50) return '#ffc107';
    return '#ff9800';
  };

  // Calculate score label
  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 50) return 'Below Average';
    return 'Poor';
  };

  // Format data for scatter plot
  const getScatterData = () => {
    return recentLeads.map(lead => ({
      x: lead.factors.demographic * 100, // x-axis: demographic fit
      y: lead.factors.engagement * 100,  // y-axis: engagement level
      z: lead.probability * 100,         // z-axis (size): conversion probability
      name: lead.name,
      score: lead.score
    }));
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Lead Scoring Engine
          <Tooltip title="Machine learning-based lead scoring system that predicts conversion potential based on demographics, engagement, budget, and timeframe.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>View</InputLabel>
            <Select value={selectedView} onChange={handleViewChange} label="View">
              <MenuItem value="overview">Score Overview</MenuItem>
              <MenuItem value="factors">Factor Analysis</MenuItem>
              <MenuItem value="model">ML Model</MenuItem>
              <MenuItem value="distribution">Score Distribution</MenuItem>
              <MenuItem value="thresholds">Score Thresholds</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<SettingsApplications />}
            onClick={toggleEditWeights}
            color={editingWeights ? "success" : "primary"}
          >
            {editingWeights ? "Save Weights" : "Customize Weights"}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main visualization area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {/* Score Overview */}
            {selectedView === 'overview' && (
              <Box height={400}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Lead Score Overview
                  </Typography>
                  {isRecalculating && (
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Recalculating scores...
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <TableContainer sx={{ maxHeight: 350, overflowY: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Probability</TableCell>
                        <TableCell align="right">Demographic</TableCell>
                        <TableCell align="right">Engagement</TableCell>
                        <TableCell align="right">Budget</TableCell>
                        <TableCell align="right">Timeframe</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow 
                          key={lead.id} 
                          hover
                          onClick={() => handleLeadSelect(lead)}
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: selectedLead?.id === lead.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Tooltip title={leadInsights[lead.name] || "Lead details"}>
                              <Typography variant="body2" fontWeight={selectedLead?.id === lead.id ? 'medium' : 'regular'}>
                                {lead.name}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center">
                              <Chip
                                label={lead.score}
                                size="small"
                                sx={{
                                  bgcolor: getScoreColor(lead.score),
                                  color: lead.score >= 70 ? 'white' : 'rgba(0, 0, 0, 0.87)',
                                  fontWeight: 'medium',
                                  minWidth: 45
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {(lead.probability * 100).toFixed(0)}%
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2" width={30}>
                                {(lead.factors.demographic * 100).toFixed(0)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={lead.factors.demographic * 100}
                                sx={{
                                  ml: 1,
                                  width: 40,
                                  height: 4,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2" width={30}>
                                {(lead.factors.engagement * 100).toFixed(0)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={lead.factors.engagement * 100}
                                sx={{
                                  ml: 1,
                                  width: 40,
                                  height: 4,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2" width={30}>
                                {(lead.factors.budget * 100).toFixed(0)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={lead.factors.budget * 100}
                                sx={{
                                  ml: 1,
                                  width: 40,
                                  height: 4,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2" width={30}>
                                {(lead.factors.timeframe * 100).toFixed(0)}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={lead.factors.timeframe * 100}
                                sx={{
                                  ml: 1,
                                  width: 40,
                                  height: 4,
                                  borderRadius: 1
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Factor Analysis */}
            {selectedView === 'factors' && (
              <Box height={400}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Scoring Factor Analysis
                  </Typography>
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Factor</InputLabel>
                    <Select value={selectedFactor} onChange={handleFactorChange} label="Factor">
                      <MenuItem value="demographic">Demographic Fit</MenuItem>
                      <MenuItem value="engagement">Engagement Level</MenuItem>
                      <MenuItem value="budget">Budget Range</MenuItem>
                      <MenuItem value="timeframe">Decision Timeframe</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedFactor === 'demographic' ? 'Demographic Fit Attributes' :
                       selectedFactor === 'engagement' ? 'Engagement Level Attributes' :
                       selectedFactor === 'budget' ? 'Budget Range Attributes' : 'Decision Timeframe Attributes'}
                    </Typography>
                    <TableContainer sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Attribute</TableCell>
                            <TableCell align="center">Weight</TableCell>
                            <TableCell>Possible Values</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getFactorDetails().map((attribute) => (
                            <TableRow key={attribute.name}>
                              <TableCell>{attribute.name}</TableCell>
                              <TableCell align="center">{(attribute.weight * 100).toFixed(0)}%</TableCell>
                              <TableCell>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {attribute.options.map((option, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={option} 
                                      size="small" 
                                      variant="outlined" 
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Factor Impact on Lead Score
                    </Typography>
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featureImportance}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            domain={[0, 0.3]} 
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          />
                          <YAxis dataKey="name" type="category" />
                          <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importance']} />
                          <Bar 
                            dataKey="importance" 
                            fill="#8884d8"
                            background={{ fill: '#eee' }}
                          >
                            {featureImportance.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(${index * 30 + 120}, 70%, 50%)`} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* ML Model */}
            {selectedView === 'model' && (
              <Box height={400}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Machine Learning Model Performance
                    <Tooltip title="Our ML model analyzes lead behavior and attributes to predict conversion probability">
                      <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                    </Tooltip>
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleMlDetails}
                  >
                    {showMlDetails ? 'Hide Model Details' : 'Show Model Details'}
                  </Button>
                </Box>
                
                {showMlDetails && (
                  <Box sx={{ mb: 3, p: 1.5, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Model: {mlModelSettings.name}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Parameters:</strong>
                        </Typography>
                        <Typography variant="body2">
                          C: {mlModelSettings.parameters.C}, 
                          penalty: {mlModelSettings.parameters.penalty}, 
                          solver: {mlModelSettings.parameters.solver}, 
                          max_iter: {mlModelSettings.parameters.max_iter}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Performance Metrics:</strong>
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Accuracy: {mlModelSettings.performance.accuracy.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Precision: {mlModelSettings.performance.precision.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              Recall: {mlModelSettings.performance.recall.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              F1 Score: {mlModelSettings.performance.f1_score.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              ROC AUC: {mlModelSettings.performance.roc_auc.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                <Box height={showMlDetails ? 280 : 340}>
                  <Typography variant="subtitle2" gutterBottom>
                    Lead Conversion Prediction Matrix
                  </Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 10, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Demographic Fit" 
                        domain={[0, 100]} 
                        label={{ value: 'Demographic Fit Score', position: 'insideBottomRight', offset: -5 }} 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name="Engagement Level" 
                        domain={[0, 100]} 
                        label={{ value: 'Engagement Level Score', angle: -90, position: 'insideLeft' }} 
                      />
                      <ZAxis 
                        type="number" 
                        dataKey="z" 
                        range={[50, 400]} 
                        name="Conversion Probability" 
                      />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        formatter={(value, name, props) => {
                          if (name === 'Conversion Probability') return [`${props.payload.z.toFixed(1)}%`, name];
                          return [value, name];
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ 
                                backgroundColor: '#fff', 
                                border: '1px solid #ccc',
                                padding: '10px',
                                borderRadius: '3px'
                              }}>
                                <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{data.name}</p>
                                <p style={{ margin: '0' }}>Lead Score: <span style={{ fontWeight: 'bold' }}>{data.score}</span></p>
                                <p style={{ margin: '0' }}>Demographic Fit: {data.x.toFixed(1)}%</p>
                                <p style={{ margin: '0' }}>Engagement Level: {data.y.toFixed(1)}%</p>
                                <p style={{ margin: '0' }}>Conversion Probability: {data.z.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        name="Leads" 
                        data={getScatterData()} 
                        fill="#8884d8"
                      >
                        {getScatterData().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getScoreColor(entry.score)} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}

            {/* Score Distribution */}
            {selectedView === 'distribution' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Lead Score Distribution
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box height={350}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getScoreDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={120}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getScoreDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value, name, props) => [value, `${props.payload.label} (${name})`]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Score Classifications
                    </Typography>
                    <TableContainer sx={{ maxHeight: 330, overflowY: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Score Range</TableCell>
                            <TableCell>Classification</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getScoreDistribution().map((range) => {
                            const total = getScoreDistribution().reduce((sum, r) => sum + r.value, 0);
                            const percentage = (range.value / total) * 100;
                            
                            return (
                              <TableRow key={range.name}>
                                <TableCell>
                                  <Box display="flex" alignItems="center">
                                    <Box 
                                      sx={{ 
                                        width: 12, 
                                        height: 12, 
                                        borderRadius: '50%', 
                                        bgcolor: range.color,
                                        mr: 1
                                      }} 
                                    />
                                    {range.name}
                                  </Box>
                                </TableCell>
                                <TableCell>{range.label}</TableCell>
                                <TableCell align="right">{range.value}</TableCell>
                                <TableCell align="right">{percentage.toFixed(1)}%</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Score Distribution Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {getScoreDistribution()[0].value + getScoreDistribution()[1].value} leads ({((getScoreDistribution()[0].value + getScoreDistribution()[1].value) / recentLeads.length * 100).toFixed(0)}%) 
                        have an excellent or very good score, indicating high conversion potential.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getScoreDistribution()[5].value} leads ({(getScoreDistribution()[5].value / recentLeads.length * 100).toFixed(0)}%) 
                        have a poor score and may require special nurturing or reprioritization.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Score Thresholds */}
            {selectedView === 'thresholds' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Historical Score Thresholds
                  <Tooltip title="The minimum score required for a lead to be considered high-quality over time">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                
                <Box height={350}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={scoreThresholds}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[50, 90]} label={{ value: 'Score Threshold', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="threshold" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {editingWeights ? (
              // Weight editing panel
              <Box>
                <Typography variant="h6" gutterBottom>
                  Customize Scoring Weights
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Adjust the importance of each factor in the lead scoring algorithm.
                </Typography>
                
                {/* Weight sliders would go here */}
                {/* Adding more controls here */}
              </Box>
            ) : (
              // Lead details panel
              <Box>
                <Typography variant="h6" gutterBottom>
                  Lead Details
                  {selectedLead ? `: ${selectedLead.name}` : ''}
                </Typography>
                
                {selectedLead ? (
                  <>
                    {/* Lead details content would go here */}
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', flexDirection: 'column' }}>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      Select a lead from the table to view detailed information
                    </Typography>
                    <Person sx={{ fontSize: 60, color: 'text.disabled', opacity: 0.3 }} />
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadScoringEngine;
