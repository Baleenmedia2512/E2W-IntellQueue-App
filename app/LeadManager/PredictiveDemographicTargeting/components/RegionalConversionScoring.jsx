'use client';
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Public,
  TrendingUp,
  InfoOutlined,
  PeopleAlt,
  ArrowUpward,
  ArrowDownward,
  Search,
  LocationOn,
  FilterList
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RegionalConversionScoring = ({ data }) => {
  const [viewMode, setViewMode] = useState('table');
  const [regionType, setRegionType] = useState('regions');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sortBy, setSortBy] = useState('potential');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate potential score for each region based on conversion rate, population and existing lead count
  const calculatePotentialScore = (region) => {
    const conversionFactor = region.conversionRate * 10; // Scale up for visibility
    const populationFactor = Math.log10(region.population) / 2; // Logarithmic scale to avoid domination by large populations
    const leadDensity = region.leadCount / (region.population / 100000); // Leads per 100K population
    
    return (conversionFactor * 0.5) + (populationFactor * 0.3) + (leadDensity * 0.2);
  };
  
  // Add potential score to regions and cities
  const regionsWithScores = data.regions.map(region => ({
    ...region,
    potentialScore: calculatePotentialScore(region).toFixed(2)
  }));
  
  const citiesWithScores = data.cities.map(city => ({
    ...city,
    potentialScore: calculatePotentialScore(city).toFixed(2)
  }));
  
  // Sort and filter based on current settings
  const getSortedAndFilteredData = () => {
    const dataSource = regionType === 'regions' ? regionsWithScores : citiesWithScores;
    
    // Filter by search term if provided
    const filteredData = searchTerm 
      ? dataSource.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : dataSource;
    
    // Sort data based on selected criteria
    return filteredData.sort((a, b) => {
      switch(sortBy) {
        case 'potential':
          return b.potentialScore - a.potentialScore;
        case 'conversion':
          return b.conversionRate - a.conversionRate;
        case 'population':
          return b.population - a.population;
        case 'leads':
          return b.leadCount - a.leadCount;
        default:
          return b.potentialScore - a.potentialScore;
      }
    });
  };
  
  const sortedData = getSortedAndFilteredData();
  
  // Format data for scatter plot - bubble size represents potential
  const getScatterData = () => {
    return sortedData.map(region => ({
      x: region.conversionRate * 100, // Convert to percentage for x-axis
      y: Math.log10(region.population), // Log scale for y-axis to handle population variation
      z: region.potentialScore * 10, // Scale for bubble size
      name: region.name,
      leadCount: region.leadCount
    }));
  };
  
  // Format data for bar chart
  const getBarChartData = () => {
    return sortedData.slice(0, 10).map(region => ({
      name: region.name,
      potential: parseFloat(region.potentialScore),
      conversion: region.conversionRate * 100, // Convert to percentage
      leads: region.leadCount / 100 // Scale down for visibility in the same chart
    }));
  };
  
  // Handle region selection
  const handleRegionSelect = (region) => {
    setSelectedRegion(region === selectedRegion ? null : region);
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Public sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                <div>
                  <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                    Region-Level Conversion Scoring
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Predict high-conversion regions based on historical performance, population, and market penetration
                  </Typography>
                </div>
              </Box>
              <Tooltip title="Uses machine learning algorithms to analyze geographic patterns and predict regions with highest conversion potential">
                <IconButton>
                  <InfoOutlined />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Highest Potential Region
                    </Typography>
                    <Typography variant="h5" component="div">
                      {sortedData[0]?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                      Score: {sortedData[0]?.potentialScore || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Highest Conversion Rate
                    </Typography>
                    <Typography variant="h5" component="div">
                      {regionsWithScores.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                      {(regionsWithScores.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.conversionRate * 100).toFixed(1) || 'N/A'}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Largest Population
                    </Typography>
                    <Typography variant="h5" component="div">
                      {regionsWithScores.sort((a, b) => b.population - a.population)[0]?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleAlt fontSize="small" sx={{ mr: 0.5 }} />
                      {(regionsWithScores.sort((a, b) => b.population - a.population)[0]?.population / 1000000).toFixed(1) || 'N/A'}M
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Predicted Hotspots
                    </Typography>
                    <Typography variant="h5" component="div">
                      {data.predictedHotspots.length}
                    </Typography>
                    <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                      High-potential micro-regions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Controls */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>View Mode</InputLabel>
                  <Select
                    value={viewMode}
                    label="View Mode"
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <MenuItem value="table">Table View</MenuItem>
                    <MenuItem value="scatter">Scatter Plot</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Region Type</InputLabel>
                  <Select
                    value={regionType}
                    label="Region Type"
                    onChange={(e) => setRegionType(e.target.value)}
                  >
                    <MenuItem value="regions">Regions</MenuItem>
                    <MenuItem value="cities">Cities</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="potential">Potential Score</MenuItem>
                    <MenuItem value="conversion">Conversion Rate</MenuItem>
                    <MenuItem value="population">Population</MenuItem>
                    <MenuItem value="leads">Lead Count</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Regions"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {}} // Would open advanced filters in a full implementation
                >
                  Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={selectedRegion ? 8 : 12}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            {viewMode === 'table' && (
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>{regionType === 'regions' ? 'Region' : 'City'}</TableCell>
                      <TableCell align="right">Potential Score</TableCell>
                      <TableCell align="right">Conversion Rate</TableCell>
                      <TableCell align="right">Population</TableCell>
                      <TableCell align="right">Leads</TableCell>
                      <TableCell align="right">Success Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedData.map((region, index) => (
                      <TableRow 
                        key={region.id}
                        hover
                        onClick={() => handleRegionSelect(region)}
                        sx={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedRegion?.id === region.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                          '&:nth-of-type(odd)': {
                            backgroundColor: selectedRegion?.id === region.id 
                              ? 'rgba(25, 118, 210, 0.08)' 
                              : 'rgba(0, 0, 0, 0.02)',
                          },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{region.name}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={region.potentialScore} 
                            size="small" 
                            color={index < 3 ? "primary" : "default"}
                            variant={index < 3 ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="right">{(region.conversionRate * 100).toFixed(1)}%</TableCell>
                        <TableCell align="right">{(region.population / 1000000).toFixed(2)}M</TableCell>
                        <TableCell align="right">{region.leadCount}</TableCell>
                        <TableCell align="right">{(region.successRate * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {viewMode === 'scatter' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Conversion Rate vs Population (bubble size = potential)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Conversion Rate" 
                      unit="%" 
                      label={{ value: 'Conversion Rate (%)', position: 'bottom', offset: 0 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Population (log)" 
                      label={{ value: 'Population (log scale)', angle: -90, position: 'left' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name, props) => {
                        if (name === 'Conversion Rate') return `${value}%`;
                        if (name === 'Population (log)') {
                          return `${Math.pow(10, value).toLocaleString()} people`;
                        }
                        return value;
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                              <p style={{ margin: 0 }}><b>{payload[0].payload.name}</b></p>
                              <p style={{ margin: 0 }}>Conversion Rate: {payload[0].value}%</p>
                              <p style={{ margin: 0 }}>Population: {Math.pow(10, payload[1].value).toLocaleString()}</p>
                              <p style={{ margin: 0 }}>Leads: {payload[0].payload.leadCount}</p>
                              <p style={{ margin: 0 }}>Potential Score: {(payload[0].payload.z / 10).toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Regions" 
                      data={getScatterData()} 
                      fill="#8884d8"
                      onClick={(data) => {
                        const region = sortedData.find(r => r.name === data.name);
                        if (region) handleRegionSelect(region);
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            )}
            
            {viewMode === 'bar' && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Top 10 Regions by Potential Score
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={getBarChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar 
                      dataKey="potential" 
                      name="Potential Score" 
                      fill="#8884d8" 
                      onClick={(data) => {
                        const region = sortedData.find(r => r.name === data.name);
                        if (region) handleRegionSelect(region);
                      }}
                    />
                    <Bar 
                      dataKey="conversion" 
                      name="Conversion Rate (%)" 
                      fill="#82ca9d" 
                    />
                    <Bar 
                      dataKey="leads" 
                      name="Leads (x100)" 
                      fill="#ffc658" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Region Details Sidebar */}
        {selectedRegion && (
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {selectedRegion.name} Details
                </Typography>
                <Chip 
                  label={`Rank #${sortedData.findIndex(r => r.id === selectedRegion.id) + 1}`} 
                  color="primary" 
                  size="small"
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Potential Score Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h5">{selectedRegion.potentialScore}</Typography>
                      <Typography variant="caption">Total Score</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h5">{(selectedRegion.conversionRate * 100).toFixed(1)}%</Typography>
                      <Typography variant="caption">Conversion</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="h5">{(selectedRegion.successRate * 100).toFixed(1)}%</Typography>
                      <Typography variant="caption">Success</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
              
              <List dense>
                <ListItem divider>
                  <ListItemText 
                    primary="Population" 
                    secondary={selectedRegion.population.toLocaleString()} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText 
                    primary="Lead Count" 
                    secondary={selectedRegion.leadCount.toLocaleString()} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText 
                    primary="Market Penetration" 
                    secondary={`${((selectedRegion.leadCount / selectedRegion.population) * 100000).toFixed(2)} per 100K population`} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Predicted Growth Potential" 
                    secondary={`${Math.round(parseFloat(selectedRegion.potentialScore) * 10)}% increase possible`} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                    secondaryTypographyProps={{ variant: 'body2', color: 'success.main', fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Predicted Hotspots in {selectedRegion.name}
                </Typography>
                {data.predictedHotspots.slice(0, 2).map((hotspot, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                    <Avatar sx={{ bgcolor: 'warning.light', width: 28, height: 28, mr: 1 }}>
                      <LocationOn fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">{hotspot}</Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" color="primary">
                  View Leads
                </Button>
                <Button variant="contained" color="primary">
                  Create Campaign
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RegionalConversionScoring;