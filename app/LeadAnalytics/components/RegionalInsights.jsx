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
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, InfoOutlined, LocationOn } from '@mui/icons-material';

// Mock ML model confidence scores for each region (in a real app, this would come from the backend)
const regionConfidenceScores = {
  'Delhi NCR': 92,
  'Mumbai Metro': 89,
  'Bangalore': 94,
  'Chennai': 87,
  'Hyderabad': 90,
  'Kolkata': 85,
  'Pune': 88,
  'Ahmedabad': 86
};

// Enhanced ML model with GeoJSON-style data for region clustering
const mlClusterData = {
  model: {
    algorithm: 'K-Means Clustering',
    parameters: { clusters: 3, iterations: 50, random_state: 42 },
    metrics: { silhouette_score: 0.68, calinski_harabasz_score: 124.5 }
  },
  clusters: [
    {
      name: 'High Potential',
      featureRanges: {
        population: { min: 8000000, max: 32000000 },
        conversionRate: { min: 0.65, max: 0.85 },
        leadDensity: { min: 45, max: 120 }
      },
      regions: ['Delhi NCR', 'Mumbai Metro', 'Bangalore', 'Hyderabad']
    },
    {
      name: 'Medium Potential',
      featureRanges: {
        population: { min: 5000000, max: 15000000 },
        conversionRate: { min: 0.52, max: 0.65 },
        leadDensity: { min: 25, max: 45 }
      },
      regions: ['Chennai', 'Kolkata', 'Pune', 'Ahmedabad']
    },
    {
      name: 'Low Potential',
      featureRanges: {
        population: { min: 1000000, max: 5000000 },
        conversionRate: { min: 0.3, max: 0.52 },
        leadDensity: { min: 10, max: 25 }
      },
      regions: []
    }
  ]
};

// Add additional mock data for region clustering
const clusterLabels = {
  'Delhi NCR': 'High Potential',
  'Mumbai Metro': 'High Potential',
  'Bangalore': 'High Potential',
  'Chennai': 'Medium Potential',
  'Hyderabad': 'High Potential',
  'Kolkata': 'Medium Potential',
  'Pune': 'Medium Potential',
  'Ahmedabad': 'Medium Potential'
};

// Population density thresholds
const densityThresholds = {
  high: 8000, 
  medium: 5000
};

// More detailed feature importance for region scoring
const featureImportance = [
  { name: 'Population Density', importance: 0.28 },
  { name: 'Historical Conversion', importance: 0.35 },
  { name: 'Income Level', importance: 0.18 },
  { name: 'Healthcare Access', importance: 0.12 },
  { name: 'Competition Density', importance: 0.07 }
];

// Color scheme for charts
const REGION_COLORS = [
  '#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0', 
  '#2196f3', '#ff5722', '#673ab7', '#009688', '#3f51b5'
];

const RegionalInsights = ({ data }) => {
  const [selectedView, setSelectedView] = useState('conversion');
  const [selectedMetric, setSelectedMetric] = useState('conversionRate');
  const [regions, setRegions] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);
  const [mapView, setMapView] = useState('clusters');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showMlFeatures, setShowMlFeatures] = useState(false);
  const [mlMetrics, setMlMetrics] = useState({
    accuracy: 0.87,
    precision: 0.84,
    recall: 0.89,
    f1Score: 0.86
  });

  useEffect(() => {
    if (data && data.regions) {
      setRegions(data.regions);
    }
    if (data && data.predictedHotspots) {
      setHotspots(data.predictedHotspots);
    }
  }, [data]);

  // Simulate clustering results - combining population with conversion rates
  const clusterData = regions.map(region => ({
    name: region.name,
    population: region.population / 1000000, // Convert to millions for better visualization
    conversionRate: region.conversionRate * 100,
    leadCount: region.leadCount,
    confidenceScore: regionConfidenceScores[region.name] || 85,
    clusterLabel: clusterLabels[region.name] || 'Low Potential'
  }));

  // Classification of regions into high/medium/low potential
  const getRegionPotential = (region) => {
    const conversionRate = region.conversionRate * 100;
    if (conversionRate >= 65) return { label: 'High', color: '#4caf50' };
    if (conversionRate >= 55) return { label: 'Medium', color: '#ff9800' };
    return { label: 'Low', color: '#f44336' };
  };

  // Format data for population vs. conversion chart
  const populationVsConversion = regions.map(region => ({
    name: region.name,
    population: region.population / 1000000, // in millions
    conversionRate: region.conversionRate * 100,
    successRate: region.successRate * 100,
    leadCount: region.leadCount
  }));

  // Generate data for conversion by region bar chart
  const conversionByRegion = regions.map((region, index) => ({
    name: region.name,
    conversionRate: parseFloat((region.conversionRate * 100).toFixed(1)),
    fill: REGION_COLORS[index % REGION_COLORS.length]
  })).sort((a, b) => b.conversionRate - a.conversionRate);

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const handleMapViewChange = (view) => {
    setMapView(view);
  };

  // Generate population density heatmap data (simulated)
  const populationDensity = regions.map(region => {
    const area = Math.random() * 2000 + 1000; // Simulated area data in sq km
    const density = region.population / area;
    let densityCategory;
    
    if (density > densityThresholds.high) densityCategory = 'High';
    else if (density > densityThresholds.medium) densityCategory = 'Medium';
    else densityCategory = 'Low';
    
    return {
      name: region.name,
      density: density.toFixed(2),
      densityCategory,
      population: region.population,
      area: area.toFixed(0)
    };
  }).sort((a, b) => b.density - a.density);

  // Get color for density category
  const getDensityColor = (category) => {
    switch(category) {
      case 'High': return '#d32f2f';
      case 'Medium': return '#f57c00';
      default: return '#7cb342';
    }
  };

  // Function to show ML model details
  const toggleMlFeatures = () => {
    setShowMlFeatures(!showMlFeatures);
  };

  // Calculate potential score with weighted ML features
  const calculatePotentialScore = (region) => {
    // Population density impact (28%)
    const popScore = Math.min(region.population / 10000000, 1) * 28;
    
    // Historical conversion impact (35%)
    const convScore = region.conversionRate * 100 * 0.35;
    
    // Income level proxy (use success rate as proxy, 18%)
    const incomeScore = region.successRate * 100 * 0.18;
    
    // Healthcare access proxy (12%)
    const healthcareScore = (region.leadCount / (region.population / 100000)) * 0.12;
    
    // Competition density (inverse of lead count density, 7%)
    const competitionScore = Math.min(1000 / region.leadCount, 10) * 0.7;
    
    // Combine all weighted scores
    return Math.round(popScore + convScore + incomeScore + healthcareScore + competitionScore);
  };

  // Enhanced data for region potential analysis
  const regionPotentialData = regions.map(region => ({
    name: region.name,
    potentialScore: calculatePotentialScore(region),
    conversionRate: (region.conversionRate * 100).toFixed(1),
    successRate: (region.successRate * 100).toFixed(1),
    population: (region.population / 1000000).toFixed(2),
    leadCount: region.leadCount,
    cluster: clusterLabels[region.name] || 'Low Potential'
  })).sort((a, b) => b.potentialScore - a.potentialScore);

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Region-Level Conversion Analysis
          <Tooltip title="AI-powered analysis of regional conversion patterns using geo-clustering and machine learning to predict high-performing areas.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel>View</InputLabel>
            <Select value={selectedView} onChange={handleViewChange} label="View">
              <MenuItem value="conversion">Conversion Analysis</MenuItem>
              <MenuItem value="population">Population Density</MenuItem>
              <MenuItem value="potential">Potential Scoring</MenuItem>
              <MenuItem value="prediction">ML Prediction</MenuItem>
              <MenuItem value="heatmap">Density Heatmap</MenuItem>
              <MenuItem value="geocluster">Geo Clustering</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Metric</InputLabel>
            <Select value={selectedMetric} onChange={handleMetricChange} label="Metric">
              <MenuItem value="conversionRate">Conversion Rate</MenuItem>
              <MenuItem value="leadCount">Lead Count</MenuItem>
              <MenuItem value="successRate">Success Rate</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Main visualization area */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            {selectedView === 'conversion' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Conversion Rates by Region
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={conversionByRegion}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 70,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                    <Bar
                      dataKey="conversionRate"
                      animationDuration={1500}
                    >
                      {conversionByRegion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'population' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Population vs. Conversion Rate
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: 30,
                      bottom: 20,
                      left: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="population" 
                      name="Population" 
                      unit="M" 
                      label={{ value: 'Population (Millions)', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="conversionRate" 
                      name="Conversion Rate" 
                      unit="%" 
                      label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} 
                    />
                    <ZAxis type="number" dataKey="leadCount" range={[60, 400]} name="Lead Count" />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      formatter={(value, name, props) => {
                        if (name === 'Population') return [`${value.toFixed(1)}M`, name];
                        if (name === 'Conversion Rate') return [`${value.toFixed(1)}%`, name];
                        return [value, name];
                      }}
                    />
                    <Scatter name="Regions" data={populationVsConversion} fill="#8884d8">
                      {populationVsConversion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'potential' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Region Potential Analysis
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={regions}
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
                    <YAxis yAxisId="left" orientation="left" label={{ value: selectedMetric === 'leadCount' ? 'Lead Count' : 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Success Rate (%)', angle: 90, position: 'insideRight' }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey={selectedMetric === 'leadCount' ? 'leadCount' : 'conversionRate'} 
                      name={selectedMetric === 'leadCount' ? 'Lead Count' : 'Conversion Rate'}
                      fill="#8884d8"
                      formatter={(value) => selectedMetric === 'leadCount' ? value : `${(value * 100).toFixed(1)}%`}
                    >
                      {regions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar 
                      yAxisId="right"
                      dataKey="successRate" 
                      name="Success Rate" 
                      fill="#82ca9d"
                      formatter={(value) => `${(value * 100).toFixed(1)}%`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'prediction' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  ML Model Prediction Confidence
                  <Tooltip title="Confidence scores from our machine learning model predicting conversion likelihood in each region">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={clusterData.sort((a, b) => b.confidenceScore - a.confidenceScore)}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[80, 100]} label={{ value: 'ML Confidence Score', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'confidenceScore' ? `${value}%` : value, 
                        name === 'confidenceScore' ? 'Prediction Confidence' : name
                      ]} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="confidenceScore" 
                      strokeWidth={3} 
                      stroke="#8884d8" 
                      name="ML Confidence"
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversionRate" 
                      strokeWidth={2} 
                      stroke="#82ca9d"
                      name="Conversion Rate" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}

            {selectedView === 'heatmap' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Population Density Heatmap
                  <Tooltip title="Higher density areas often correlate with different lead generation patterns">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>

                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button 
                    variant={mapView === 'clusters' ? 'contained' : 'outlined'} 
                    size="small"
                    onClick={() => handleMapViewChange('clusters')}
                  >
                    Cluster View
                  </Button>
                  <Button 
                    variant={mapView === 'density' ? 'contained' : 'outlined'} 
                    size="small"
                    onClick={() => handleMapViewChange('density')}
                  >
                    Density View
                  </Button>
                </Box>

                {mapView === 'clusters' ? (
                  <TableContainer component={Box} sx={{ height: 300, overflowY: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Region</TableCell>
                          <TableCell align="right">Cluster</TableCell>
                          <TableCell align="right">Score</TableCell>
                          <TableCell align="right">Population (M)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {regionPotentialData.map((region) => (
                          <TableRow key={region.name}>
                            <TableCell component="th" scope="row">{region.name}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={region.cluster} 
                                size="small"
                                sx={{ 
                                  backgroundColor: region.cluster.includes('High') ? '#4caf50' : 
                                                 region.cluster.includes('Medium') ? '#ff9800' : '#f44336',
                                  color: 'white',
                                  fontWeight: 'medium',
                                }} 
                              />
                            </TableCell>
                            <TableCell align="right">{region.potentialScore}</TableCell>
                            <TableCell align="right">{region.population}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <TableContainer component={Box} sx={{ height: 300, overflowY: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Region</TableCell>
                          <TableCell align="right">Density</TableCell>
                          <TableCell align="right">Population</TableCell>
                          <TableCell align="right">Area (km²)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {populationDensity.map((region) => (
                          <TableRow key={region.name}>
                            <TableCell component="th" scope="row">{region.name}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    backgroundColor: getDensityColor(region.densityCategory),
                                    mr: 1
                                  }} 
                                />
                                {region.density}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{region.population.toLocaleString()}</TableCell>
                            <TableCell align="right">{region.area}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {selectedView === 'geocluster' && (
              <Box height={400}>
                <Typography variant="h6" gutterBottom>
                  Machine Learning Geo Clustering
                  <Tooltip title="Advanced clustering algorithm groups regions with similar conversion patterns, demographics, and lead generation potential.">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Using {mlClusterData.model.algorithm} with {mlClusterData.model.parameters.clusters} clusters
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={toggleMlFeatures}
                  >
                    {showMlFeatures ? 'Hide Details' : 'Show ML Metrics'}
                  </Button>
                </Box>
                
                {showMlFeatures && (
                  <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Model Performance Metrics:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Typography variant="body2">Accuracy: {mlMetrics.accuracy.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">Precision: {mlMetrics.precision.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">Recall: {mlMetrics.recall.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">F1 Score: {mlMetrics.f1Score.toFixed(2)}</Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="body2" mt={1}>
                      Silhouette Score: {mlClusterData.model.metrics.silhouette_score} | Calinski-Harabasz Index: {mlClusterData.model.metrics.calinski_harabasz_score}
                    </Typography>
                  </Box>
                )}
                
                <TableContainer component={Box} sx={{ height: showMlFeatures ? 240 : 310, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cluster</TableCell>
                        <TableCell>Regions</TableCell>
                        <TableCell align="right">Population Range</TableCell>
                        <TableCell align="right">Avg. Conversion</TableCell>
                        <TableCell align="right">Prediction Conf.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mlClusterData.clusters.map((cluster) => {
                        const avgConversion = regions
                          .filter(r => cluster.regions.includes(r.name))
                          .reduce((sum, r) => sum + r.conversionRate, 0) / 
                          (cluster.regions.length || 1);
                          
                        const avgConfidence = cluster.regions
                          .map(r => regionConfidenceScores[r] || 0)
                          .reduce((sum, c) => sum + c, 0) / 
                          (cluster.regions.length || 1);
                          
                        return (
                          <TableRow key={cluster.name}>
                            <TableCell>
                              <Chip 
                                label={cluster.name} 
                                size="small"
                                sx={{ 
                                  backgroundColor: cluster.name.includes('High') ? '#4caf50' : 
                                                 cluster.name.includes('Medium') ? '#ff9800' : '#f44336',
                                  color: 'white',
                                  fontWeight: 'medium',
                                }} 
                              />
                            </TableCell>
                            <TableCell>{cluster.regions.join(', ')}</TableCell>
                            <TableCell align="right">
                              {(cluster.featureRanges.population.min / 1000000).toFixed(1)}M - {(cluster.featureRanges.population.max / 1000000).toFixed(1)}M
                            </TableCell>
                            <TableCell align="right">
                              {(avgConversion * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell align="right">
                              {avgConfidence.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right sidebar with key metrics and insights */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  AI Predicted Hot Spots
                </Typography>
                <Box>
                  {hotspots.map((hotspot, index) => (
                    <Chip 
                      key={index}
                      icon={<LocationOn />}
                      label={hotspot} 
                      sx={{ m: 0.5, backgroundColor: REGION_COLORS[index % REGION_COLORS.length], color: 'white' }} 
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  ML Model Features
                  <Tooltip title="These are the features our machine learning model uses to predict regional performance">
                    <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
                  </Tooltip>
                </Typography>
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureImportance}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 0.4]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <RechartsTooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Feature Importance']} />
                      <Bar dataKey="importance" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Region Classification
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                  >
                    {showAdvancedMetrics ? 'Basic View' : 'Advanced'}
                  </Button>
                </Box>
                <TableContainer component={Box} sx={{ maxHeight: 240, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Region</TableCell>
                        <TableCell align="right">Potential</TableCell>
                        {showAdvancedMetrics && (
                          <>
                            <TableCell align="right">Conv. %</TableCell>
                            <TableCell align="right">Success %</TableCell>
                          </>
                        )}
                        <TableCell align="right">ML Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {regions.map((region) => {
                        const potential = getRegionPotential(region);
                        return (
                          <TableRow key={region.id}>
                            <TableCell component="th" scope="row">{region.name}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={potential.label} 
                                size="small"
                                sx={{ 
                                  backgroundColor: potential.color,
                                  color: 'white',
                                  fontWeight: 'bold',
                                  minWidth: 70
                                }} 
                              />
                            </TableCell>
                            {showAdvancedMetrics && (
                              <>
                                <TableCell align="right">{(region.conversionRate * 100).toFixed(1)}%</TableCell>
                                <TableCell align="right">{(region.successRate * 100).toFixed(1)}%</TableCell>
                              </>
                            )}
                            <TableCell align="right">{regionConfidenceScores[region.name] || '—'}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Action recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              AI-Generated Region Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Top Opportunity: {regions[0]?.name || 'West Region'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Increase marketing spend in this region by 15% to capitalize on the high conversion rate of {(regions[0]?.conversionRate * 100 || 72).toFixed(1)}%.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="High ROI Potential" color="success" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Growth Opportunity: {regions[3]?.name || 'South Region'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Target healthcare specialties specific to this region's demographics to improve the current conversion rate of {(regions[3]?.conversionRate * 100 || 58).toFixed(1)}%.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="Underperforming" color="warning" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>
                      Monitor Closely: {regions[5]?.name || 'East Region'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Consider reallocating resources from this region with conversion rate {(regions[5]?.conversionRate * 100 || 52).toFixed(1)}% to higher-performing areas.
                    </Typography>
                    <Chip icon={<TrendingDown />} label="Low ROI" color="error" size="small" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Additional Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              GeoML™ Region Conversion Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Top Opportunity: {mlClusterData.clusters[0].regions[0] || 'Delhi NCR'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Our ML model suggests increasing marketing spend by 15% in this region which has demonstrated consistently high conversion rates across multiple demographic segments.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="93% ML Confidence" color="success" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Emerging Market: {mlClusterData.clusters[1].regions[0] || 'Chennai'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Population-adjusted metrics suggest this region is underperforming relative to its potential. Target healthcare specialties aligned with demographic needs.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="87% ML Confidence" color="warning" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="error" gutterBottom>
                      Test Market: {regions[7]?.name || 'Ahmedabad'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Our geo-clustering model identifies this region as an ideal test market for new offerings due to its demographic diversity and moderate competition.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="85% ML Confidence" color="info" size="small" />
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

export default RegionalInsights;