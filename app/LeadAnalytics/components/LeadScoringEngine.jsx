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
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  Stack,
  Pagination
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
  ScatterChart, 
  Scatter,
  ZAxis
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  InfoOutlined, 
  Search,
  Sort,
  FilterList,
  PersonOutline,
  Person,
  PersonAdd,
  MonetizationOn,
  StarOutline,
  Star,
  StarHalf,
  AccessTime,
  RotateLeft,
  RotateRight,
  AccountBox,
  Business,
  Edit,
  ArrowUpward,
  ArrowDownward,
  LocalHospital,
  DragHandle,
  ExpandMore,
  ExpandLess,
  ArrowForward,
  AddCircleOutline
} from '@mui/icons-material';

// Color scheme for charts and UI elements
const COLORS = [
  '#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0', 
  '#2196f3', '#ff5722', '#673ab7', '#009688', '#3f51b5'
];

// Scoring weights configuration 
const scoringWeights = {
  demographic: 0.25,
  budget: 0.20,
  engagement: 0.20,
  history: 0.15,
  timing: 0.10,
  specialty: 0.10
};

// Example factor descriptions for tooltip explanations
const factorDescriptions = {
  demographic: "Match with target demographic profile based on age, location, specialty interest, and other attributes",
  budget: "Likelihood to have budget based on practice size, history, and estimated financial capacity",
  engagement: "Level of interaction with marketing content, website visits, email opens, etc.",
  history: "Previous conversion history and customer relationship",
  timing: "Timeliness of needs and alignment with buying cycles",
  specialty: "Match with highest converting medical specialties"
};

// Priority level thresholds
const priorityThresholds = {
  high: 80,
  medium: 60,
  low: 0
};

// Get color based on score
const getScoreColor = (score) => {
  if (score >= priorityThresholds.high) return '#4caf50';
  if (score >= priorityThresholds.medium) return '#ff9800';
  return '#f44336';
};

// Get priority label based on score
const getPriorityLabel = (score) => {
  if (score >= priorityThresholds.high) return 'High';
  if (score >= priorityThresholds.medium) return 'Medium';
  return 'Low';
};

// Get star rating display based on score (out of 5 stars)
const getStarRating = (score) => {
  const stars = [];
  const fullStars = Math.floor(score / 20); // 100/5 = 20 per star
  const hasHalfStar = score % 20 >= 10;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} fontSize="small" sx={{ color: 'gold' }} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<StarHalf key={i} fontSize="small" sx={{ color: 'gold' }} />);
    } else {
      stars.push(<StarOutline key={i} fontSize="small" sx={{ color: 'text.disabled' }} />);
    }
  }
  
  return <Box display="flex">{stars}</Box>;
};

const LeadScoringEngine = ({ data }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [scoringFactors, setScoringFactors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [showWeightCustomization, setShowWeightCustomization] = useState(false);
  const [customWeights, setCustomWeights] = useState({...scoringWeights});
  const [selectedLead, setSelectedLead] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterPriority, setFilterPriority] = useState('All');

  useEffect(() => {
    if (data) {
      if (data.leads) {
        setLeads(data.leads);
        setFilteredLeads(data.leads);
      }
      if (data.scoringFactors) {
        setScoringFactors(data.scoringFactors);
      }
    }
  }, [data]);

  useEffect(() => {
    // Apply filtering and sorting whenever relevant state changes
    let filtered = [...leads];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply specialty filter
    if (selectedSpecialty !== 'All') {
      filtered = filtered.filter(lead => lead.specialty === selectedSpecialty);
    }
    
    // Apply priority filter
    if (filterPriority !== 'All') {
      const minThreshold = priorityThresholds[filterPriority.toLowerCase()];
      const maxThreshold = filterPriority === 'High' ? 101 : // Above high threshold
                           filterPriority === 'Medium' ? priorityThresholds.high : // Between medium and high
                           priorityThresholds.medium; // Between low and medium
      
      filtered = filtered.filter(lead => {
        const score = calculateLeadScore(lead);
        return score >= minThreshold && score < maxThreshold;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      
      if (sortBy === 'score') {
        valA = calculateLeadScore(a);
        valB = calculateLeadScore(b);
      } else if (sortBy === 'name') {
        valA = a.name;
        valB = b.name;
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (sortBy === 'lastContact') {
        valA = new Date(a.lastContact).getTime();
        valB = new Date(b.lastContact).getTime();
      } else {
        valA = a[sortBy] || 0;
        valB = b[sortBy] || 0;
      }
      
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    
    setFilteredLeads(filtered);
  }, [leads, searchTerm, sortBy, sortDirection, selectedSpecialty, filterPriority, customWeights]);

  const calculateLeadScore = (lead) => {
    if (!lead) return 0;
    
    // Calculate weighted score
    let weightedScore = 
      (lead.demographicFit * customWeights.demographic) +
      (lead.budgetScore * customWeights.budget) +
      (lead.engagementScore * customWeights.engagement) +
      (lead.historyScore * customWeights.history) +
      (lead.timingScore * customWeights.timing) +
      (lead.specialtyScore * customWeights.specialty);
    
    // Convert to 0-100 scale
    return Math.round(weightedScore * 100);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortDirectionToggle = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  const handlePriorityFilterChange = (event) => {
    setFilterPriority(event.target.value);
  };

  const handleWeightChange = (factor, value) => {
    // Ensure the value is between 0 and 1
    const newValue = Math.max(0, Math.min(1, parseFloat(value)));
    
    setCustomWeights(prev => ({
      ...prev,
      [factor]: newValue
    }));
  };

  const handleResetWeights = () => {
    setCustomWeights({...scoringWeights});
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
  };

  // Prepare data for score distribution chart
  const getScoreDistributionData = () => {
    const scoreRanges = [
      { name: '90-100', range: [90, 100], count: 0 },
      { name: '80-89', range: [80, 89], count: 0 },
      { name: '70-79', range: [70, 79], count: 0 },
      { name: '60-69', range: [60, 69], count: 0 },
      { name: '50-59', range: [50, 59], count: 0 },
      { name: '0-49', range: [0, 49], count: 0 }
    ];
    
    leads.forEach(lead => {
      const score = calculateLeadScore(lead);
      const matchedRange = scoreRanges.find(range => 
        score >= range.range[0] && score <= range.range[1]
      );
      
      if (matchedRange) {
        matchedRange.count++;
      }
    });
    
    return scoreRanges.map(range => ({
      name: range.name,
      count: range.count,
      color: range.name === '90-100' || range.name === '80-89' ? '#4caf50' :
             range.name === '70-79' || range.name === '60-69' ? '#ff9800' : '#f44336'
    }));
  };

  // Prepare data for specialty scoring chart
  const getSpecialtyScoreData = () => {
    const specialtyMap = {};
    
    leads.forEach(lead => {
      if (!lead.specialty) return;
      
      if (!specialtyMap[lead.specialty]) {
        specialtyMap[lead.specialty] = {
          name: lead.specialty,
          avgScore: 0,
          count: 0,
          totalScore: 0
        };
      }
      
      specialtyMap[lead.specialty].count++;
      specialtyMap[lead.specialty].totalScore += calculateLeadScore(lead);
    });
    
    return Object.values(specialtyMap)
      .map(specialty => ({
        ...specialty,
        avgScore: Math.round(specialty.totalScore / specialty.count)
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  };

  // Prepare data for factor radar chart
  const getFactorRadarData = (lead) => {
    if (!lead) return [];
    
    return [
      { factor: 'Demographic', value: lead.demographicFit * 100 },
      { factor: 'Budget', value: lead.budgetScore * 100 },
      { factor: 'Engagement', value: lead.engagementScore * 100 },
      { factor: 'History', value: lead.historyScore * 100 },
      { factor: 'Timing', value: lead.timingScore * 100 },
      { factor: 'Specialty', value: lead.specialtyScore * 100 }
    ];
  };

  // Get count by priority
  const getPriorityCountData = () => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    
    leads.forEach(lead => {
      const score = calculateLeadScore(lead);
      const priority = getPriorityLabel(score);
      counts[priority]++;
    });
    
    return [
      { name: 'High', value: counts.High, color: '#4caf50' },
      { name: 'Medium', value: counts.Medium, color: '#ff9800' },
      { name: 'Low', value: counts.Low, color: '#f44336' }
    ];
  };

  // Calculate optimal factors for improvement
  const getImprovementSuggestions = (lead) => {
    if (!lead) return [];
    
    // Find the lowest scoring factors
    const factors = [
      { name: 'demographic', label: 'Demographic Fit', value: lead.demographicFit, weight: customWeights.demographic },
      { name: 'budget', label: 'Budget Qualification', value: lead.budgetScore, weight: customWeights.budget },
      { name: 'engagement', label: 'Engagement Level', value: lead.engagementScore, weight: customWeights.engagement },
      { name: 'history', label: 'Conversion History', value: lead.historyScore, weight: customWeights.history },
      { name: 'timing', label: 'Timing & Urgency', value: lead.timingScore, weight: customWeights.timing },
      { name: 'specialty', label: 'Specialty Alignment', value: lead.specialtyScore, weight: customWeights.specialty }
    ];
    
    // Sort by weighted opportunity (low score * weight = high potential gain)
    return factors
      .sort((a, b) => (a.value * a.weight) - (b.value * b.weight))
      .slice(0, 3)
      .map(factor => ({
        name: factor.name,
        label: factor.label,
        value: factor.value,
        suggestion: getSuggestionForFactor(factor.name, lead)
      }));
  };

  // Get specific suggestion based on factor
  const getSuggestionForFactor = (factor, lead) => {
    switch (factor) {
      case 'demographic':
        return 'Verify practice size and location details. Consider targeted messaging based on specialty.';
      case 'budget':
        return 'Provide ROI calculations and financing options. Discuss budget concerns directly.';
      case 'engagement':
        return 'Send personalized content about their specialty. Schedule a follow-up call within 3 days.';
      case 'history':
        return 'Review past interactions and address previous objections. Highlight new benefits.';
      case 'timing':
        return 'Determine current timeline needs and urgent pain points. Offer time-limited incentives.';
      case 'specialty':
        return `Focus on success stories from other ${lead.specialty} practices. Share specialty-specific benefits.`;
      default:
        return 'Further qualification needed. Schedule discovery call.';
    }
  };

  // Get formatted date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get days since last contact
  const getDaysSinceContact = (dateString) => {
    const contactDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - contactDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pagination calculations
  const paginatedLeads = filteredLeads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(filteredLeads.length / rowsPerPage);
  
  // Get unique specialties for filter dropdown
  const specialties = ['All', ...new Set(leads.map(lead => lead.specialty).filter(Boolean))];
  
  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Lead Scoring Engine
          <Tooltip title="AI-powered lead scoring system that evaluates leads based on demographic fit, budget, engagement, history, timing, and specialty alignment.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showWeightCustomization}
                onChange={(e) => setShowWeightCustomization(e.target.checked)}
                color="primary"
              />
            }
            label="Customize Scoring"
            sx={{ mr: 2 }}
          />
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PersonAdd />}
          >
            New Lead
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Scoring customization panel */}
        {showWeightCustomization && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Customize Scoring Weights
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<RotateLeft />}
                  onClick={handleResetWeights}
                >
                  Reset to Default
                </Button>
              </Box>
              
              <Grid container spacing={3}>
                {Object.entries(customWeights).map(([factor, weight]) => (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={factor}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {factor}
                          <Tooltip title={factorDescriptions[factor] || ''}>
                            <InfoOutlined fontSize="small" sx={{ ml: 0.5, fontSize: 14, verticalAlign: 'middle' }} />
                          </Tooltip>
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {Math.round(weight * 100)}%
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mt={1}>
                        <TextField
                          type="range"
                          value={weight}
                          onChange={(e) => handleWeightChange(factor, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: 1,
                            step: 0.05
                          }}
                          sx={{ 
                            width: '100%',
                            '& input': { 
                              padding: 0,
                              height: 24
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Filters and search */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={5}>
                <TextField
                  placeholder="Search leads..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={selectedSpecialty}
                    onChange={handleSpecialtyChange}
                    label="Specialty"
                  >
                    {specialties.map((specialty) => (
                      <MenuItem key={specialty} value={specialty}>
                        {specialty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    onChange={handlePriorityFilterChange}
                    label="Priority"
                  >
                    <MenuItem value="All">All Leads</MenuItem>
                    <MenuItem value="High">High Priority</MenuItem>
                    <MenuItem value="Medium">Medium Priority</MenuItem>
                    <MenuItem value="Low">Low Priority</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={2} md={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Sort By"
                  >
                    <MenuItem value="score">Score</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="lastContact">Last Contact</MenuItem>
                    <MenuItem value="budgetScore">Budget</MenuItem>
                    <MenuItem value="engagementScore">Engagement</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={1}>
                <IconButton 
                  onClick={handleSortDirectionToggle}
                  sx={{ border: '1px solid rgba(0,0,0,0.23)', borderRadius: 1 }}
                >
                  {sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Lead scoring dashboard */}
        <Grid item xs={12} md={selectedLead ? 8 : 12}>
          <Paper sx={{ p: 2 }}>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Typography variant="h6" component="h3">
                  Scored Leads ({filteredLeads.length})
                </Typography>
                {filteredLeads.length !== leads.length && (
                  <Chip 
                    label={`Filtered from ${leads.length}`} 
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <Box>
                <Button 
                  size="small" 
                  startIcon={<AddCircleOutline />}
                  sx={{ mr: 1 }}
                >
                  Add Note
                </Button>
                <Button 
                  size="small" 
                  startIcon={<ArrowForward />}
                >
                  Assign
                </Button>
              </Box>
            </Box>
            
            <TableContainer sx={{ maxHeight: selectedLead ? 'calc(100vh - 340px)' : 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Lead</TableCell>
                    <TableCell>Specialty</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Priority</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Engagement</TableCell>
                    <TableCell>Last Contact</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLeads.map((lead) => {
                    const score = calculateLeadScore(lead);
                    const priority = getPriorityLabel(score);
                    const scoreColor = getScoreColor(score);
                    const daysSince = getDaysSinceContact(lead.lastContact);
                    
                    return (
                      <TableRow 
                        key={lead.id}
                        hover
                        onClick={() => handleLeadSelect(lead)}
                        sx={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedLead?.id === lead.id ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: scoreColor }}>
                              {lead.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {lead.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {lead.company}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={lead.specialty} 
                            size="small" 
                            variant="outlined"
                            icon={<LocalHospital fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body2" 
                            fontWeight="medium" 
                            color={scoreColor}
                          >
                            {score}
                          </Typography>
                          <Box mt={0.5}>
                            {getStarRating(score)}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={priority} 
                            size="small"
                            sx={{ 
                              bgcolor: scoreColor,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <LinearProgress 
                            variant="determinate" 
                            value={lead.budgetScore * 100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              width: 70
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <LinearProgress 
                            variant="determinate" 
                            value={lead.engagementScore * 100} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              width: 70
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(lead.lastContact)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {daysSince} days ago
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small">
                            <DragHandle fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min(rowsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
              </Typography>
              
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange}
                color="primary" 
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Selected lead details */}
        {selectedLead && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Lead Details
                </Typography>
                <IconButton size="small">
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: getScoreColor(calculateLeadScore(selectedLead)) }}>
                  {selectedLead.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedLead.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLead.title} | {selectedLead.company}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Lead Score: {calculateLeadScore(selectedLead)}/100
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateLeadScore(selectedLead)} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getScoreColor(calculateLeadScore(selectedLead))
                    }
                  }} 
                />
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Scoring Factors
              </Typography>
              
              <Box height={220} mb={3}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={getFactorRadarData(selectedLead)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="factor" />
                    <PolarRadiusAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Radar 
                      name="Factor Score" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Contact Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedLead.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedLead.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Last Contact:</strong> {formatDate(selectedLead.lastContact)} ({getDaysSinceContact(selectedLead.lastContact)} days ago)
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Improvement Recommendations
              </Typography>
              
              <Box>
                {getImprovementSuggestions(selectedLead).map((suggestion, index) => (
                  <Card variant="outlined" sx={{ mb: 1, borderLeft: '3px solid #8884d8' }} key={index}>
                    <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Improve {suggestion.label} ({Math.round(suggestion.value * 100)}%)
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.suggestion}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Contact Lead
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                >
                  Create Task
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Dashboard charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Lead Score Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getScoreDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name, props) => [value, 'Leads']} 
                    labelFormatter={(value) => `Score Range: ${value}`}
                  />
                  <Bar dataKey="count" name="Leads">
                    {getScoreDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Priority Distribution
            </Typography>
            <Box height={300} display="flex" alignItems="center" justifyContent="center">
              <Box width="70%" height="100%">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPriorityCountData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPriorityCountData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [value, 'Leads']} 
                      labelFormatter={(value) => `${value} Priority`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Specialty Score Analysis
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getSpecialtyScoreData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
                    domain={[0, 100]}
                    label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }} 
                  />
                  <RechartsTooltip 
                    formatter={(value, name) => {
                      if (name === 'avgScore') return [`${value}/100`, 'Average Score'];
                      return [value, name === 'count' ? 'Lead Count' : name];
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="avgScore" name="Average Score" fill="#8884d8">
                    {getSpecialtyScoreData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getScoreColor(entry.avgScore)} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="count" name="Lead Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadScoringEngine;