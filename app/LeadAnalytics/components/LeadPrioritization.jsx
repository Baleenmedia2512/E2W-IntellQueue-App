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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemButton,
  Switch,
  FormControlLabel,
  Badge,
  Tab,
  Tabs,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  InfoOutlined,
  Person,
  AccessTime,
  ArrowUpward,
  ArrowDownward,
  Star,
  StarBorder,
  ArrowForward,
  Add,
  Remove,
  Refresh,
  FilterList,
  Search,
  Sort,
  Check,
  PriorityHigh,
  Email,
  Phone,
  CalendarToday,
  AssignmentTurnedIn,
  Assignment,
  ArrowRight,
  Timer,
  Analytics,
  Autorenew,
  LocalHospital,
  MonetizationOn,
  Edit,
  ArrowDownward as HighPriority,
  ArrowDownward as LowPriority
} from '@mui/icons-material';

// Mock data for lead prioritization
const prioritizedLeads = {
  high: [
    {
      id: 1,
      name: "Raj Patel",
      company: "Apollo Hospitals",
      score: 94,
      specialty: "Cardiology",
      lastContact: "2 days ago",
      budget: "₹2,50,000",
      nextAction: "Follow-up call",
      nextActionDate: "May 8, 2025",
      autoReason: "High score, recent engagement, budget approved",
      factors: {
        demographic: 0.92,
        engagement: 0.96,
        budget: 0.89,
        timeframe: 0.95
      }
    },
    {
      id: 2,
      name: "Priya Singh",
      company: "Max Healthcare",
      score: 91,
      specialty: "Pediatrics",
      lastContact: "1 day ago",
      budget: "₹1,80,000",
      nextAction: "Send proposal",
      nextActionDate: "May 7, 2025",
      autoReason: "Returning client, high engagement on website",
      factors: {
        demographic: 0.87,
        engagement: 0.92,
        budget: 0.85,
        timeframe: 0.90
      }
    },
    {
      id: 7,
      name: "Vikram Reddy",
      company: "Fortis Health",
      score: 89,
      specialty: "ENT",
      lastContact: "5 days ago",
      budget: "₹2,00,000",
      nextAction: "Schedule specialist consultation",
      nextActionDate: "May 9, 2025",
      autoReason: "Family package inquiry, high budget",
      factors: {
        demographic: 0.83,
        engagement: 0.86,
        budget: 0.91,
        timeframe: 0.88
      }
    }
  ],
  medium: [
    {
      id: 3,
      name: "Amit Kumar",
      company: "Corporate Health Solutions",
      score: 78,
      specialty: "Orthopedics",
      lastContact: "6 days ago",
      budget: "₹1,20,000",
      nextAction: "Corporate proposal",
      nextActionDate: "May 12, 2025",
      autoReason: "Medium budget, potential for volume contract",
      factors: {
        demographic: 0.76,
        engagement: 0.82,
        budget: 0.70,
        timeframe: 0.75
      }
    },
    {
      id: 4,
      name: "Shivani Sharma",
      company: "Wellness Forever",
      score: 72,
      specialty: "General Medicine",
      lastContact: "8 days ago",
      budget: "₹90,000",
      nextAction: "Follow-up email",
      nextActionDate: "May 10, 2025",
      autoReason: "Multiple touchpoints, budget pending approval",
      factors: {
        demographic: 0.73,
        engagement: 0.75,
        budget: 0.65,
        timeframe: 0.68
      }
    },
    {
      id: 8,
      name: "Rahul Guha",
      company: "MediFirst",
      score: 69,
      specialty: "Dermatology",
      lastContact: "7 days ago",
      budget: "₹1,10,000",
      nextAction: "Product demo",
      nextActionDate: "May 14, 2025",
      autoReason: "Specific service interest, seasonal opportunity",
      factors: {
        demographic: 0.71,
        engagement: 0.72,
        budget: 0.68,
        timeframe: 0.62
      }
    }
  ],
  low: [
    {
      id: 5,
      name: "Sneha Gupta",
      company: "Individual Practice",
      score: 55,
      specialty: "Dermatology",
      lastContact: "15 days ago",
      budget: "₹50,000-₹70,000",
      nextAction: "Nurturing email",
      nextActionDate: "May 20, 2025",
      autoReason: "Early research stage, budget uncertain",
      factors: {
        demographic: 0.62,
        engagement: 0.58,
        budget: 0.48,
        timeframe: 0.55
      }
    },
    {
      id: 6,
      name: "Rajesh Khanna",
      company: "Neighborhood Clinic",
      score: 48,
      specialty: "General Medicine",
      lastContact: "20 days ago",
      budget: "₹30,000-₹50,000",
      nextAction: "Educational content",
      nextActionDate: "May 25, 2025",
      autoReason: "Limited engagement, budget constraints",
      factors: {
        demographic: 0.55,
        engagement: 0.41,
        budget: 0.42,
        timeframe: 0.50
      }
    },
    {
      id: 9,
      name: "Anil Kapoor",
      company: "Family Clinic",
      score: 42,
      specialty: "General Practice",
      lastContact: "25 days ago",
      budget: "₹40,000",
      nextAction: "Check-in call",
      nextActionDate: "May 28, 2025",
      autoReason: "Low engagement, long sales cycle expected",
      factors: {
        demographic: 0.44,
        engagement: 0.38,
        budget: 0.45,
        timeframe: 0.41
      }
    }
  ]
};

// Priority Queue history data
const priorityHistory = [
  {
    date: "May 6, 2025",
    high: 3,
    medium: 5,
    low: 4,
    changes: [
      { id: 7, name: "Vikram Reddy", from: "Medium", to: "High", reason: "Budget approval received" },
      { id: 4, name: "Shivani Sharma", from: "Low", to: "Medium", reason: "Increased engagement" }
    ]
  },
  {
    date: "May 5, 2025",
    high: 2,
    medium: 4,
    low: 5,
    changes: [
      { id: 2, name: "Priya Singh", from: "Medium", to: "High", reason: "Product demo completed" }
    ]
  },
  {
    date: "May 4, 2025",
    high: 1,
    medium: 5,
    low: 5,
    changes: [
      { id: 8, name: "Rahul Guha", from: "Low", to: "Medium", reason: "Budget information added" },
      { id: 5, name: "Sneha Gupta", from: "Medium", to: "Low", reason: "Decision timeline extended" }
    ]
  },
  {
    date: "May 3, 2025",
    high: 1,
    medium: 4,
    low: 4
  }
];

// Rules for auto-prioritization
const prioritizationRules = [
  { id: 1, active: true, name: "High Score Rule", condition: "Lead Score ≥ 85", priority: "High", weight: 10 },
  { id: 2, active: true, name: "Budget Qualification", condition: "Budget ≥ ₹1,50,000", priority: "High", weight: 8 },
  { id: 3, active: true, name: "Recent Activity", condition: "Engagement in last 72 hours", priority: "Increase by 1 level", weight: 7 },
  { id: 4, active: true, name: "Decision Timeframe", condition: "Expected decision within 14 days", priority: "Increase by 1 level", weight: 6 },
  { id: 5, active: true, name: "Medium Score Rule", condition: "Lead Score between 65-84", priority: "Medium", weight: 5 },
  { id: 6, active: true, name: "Budget Medium", condition: "Budget between ₹80,000-₹1,49,999", priority: "Medium", weight: 4 },
  { id: 7, active: true, name: "Low Score Rule", condition: "Lead Score < 65", priority: "Low", weight: 3 },
  { id: 8, active: true, name: "Inactivity Rule", condition: "No engagement in 14+ days", priority: "Decrease by 1 level", weight: 2 }
];

const LeadPrioritization = ({ data }) => {
  const [priorityView, setPriorityView] = useState('current');
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openRules, setOpenRules] = useState(false);
  const [customRules, setCustomRules] = useState(prioritizationRules);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [historyRange, setHistoryRange] = useState('week');
  
  useEffect(() => {
    // This would fetch initial data in a real implementation
    if (data && data.priorities) {
      // Handle real data
    }
  }, [data]);
  
  // Handle refresh to simulate real-time prioritization
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };
  
  // Handle view change
  const handleViewChange = (event, newValue) => {
    setPriorityView(newValue);
  };
  
  // Handle lead selection
  const handleLeadSelect = (lead) => {
    setSelectedLead(lead === selectedLead ? null : lead);
  };
  
  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterPriority(event.target.value);
  };
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Toggle auto-refresh
  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  // Toggle rules panel
  const toggleRules = () => {
    setOpenRules(!openRules);
  };
  
  // Toggle rule active state
  const toggleRuleActive = (ruleId) => {
    setCustomRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId ? { ...rule, active: !rule.active } : rule
      )
    );
  };
  
  // Start editing a rule
  const startEditRule = (rule) => {
    setEditingRule({ ...rule });
    setIsEditing(true);
  };
  
  // Save edited rule
  const saveEditRule = () => {
    if (editingRule) {
      setCustomRules(prevRules => 
        prevRules.map(rule => 
          rule.id === editingRule.id ? { ...editingRule } : rule
        )
      );
      setIsEditing(false);
      setEditingRule(null);
    }
  };
  
  // Cancel editing
  const cancelEditRule = () => {
    setIsEditing(false);
    setEditingRule(null);
  };
  
  // Handle rule weight change
  const handleRuleWeightChange = (value) => {
    if (editingRule) {
      setEditingRule({
        ...editingRule,
        weight: parseInt(value, 10)
      });
    }
  };
  
  // Handle history range change
  const handleHistoryRangeChange = (event) => {
    setHistoryRange(event.target.value);
  };
  
  // Filter leads based on search and priority filter
  const getFilteredLeads = () => {
    const allLeads = [
      ...prioritizedLeads.high.map(lead => ({ ...lead, priority: 'high' })),
      ...prioritizedLeads.medium.map(lead => ({ ...lead, priority: 'medium' })),
      ...prioritizedLeads.low.map(lead => ({ ...lead, priority: 'low' }))
    ];
    
    return allLeads.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });
  };
  
  // Get total counts for dashboard
  const getTotalCounts = () => {
    return {
      high: prioritizedLeads.high.length,
      medium: prioritizedLeads.medium.length,
      low: prioritizedLeads.low.length,
      total: prioritizedLeads.high.length + prioritizedLeads.medium.length + prioritizedLeads.low.length
    };
  };

  // Get color for priority
  const getPriorityColor = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };
  
  // Get icon for priority
  const getPriorityIcon = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return <PriorityHigh />;
      case 'medium': return <HighPriority />;
      case 'low': return <LowPriority />;
      default: return <InfoOutlined />;
    }
  };
  
  // Get leads by priority
  const getLeadsByPriority = (priority) => {
    return prioritizedLeads[priority] || [];
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Smart Lead Prioritization
          <Tooltip title="Automated lead prioritization system that uses ML-based scoring to rank leads as High, Medium, or Low priority for your sales team.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={handleAutoRefreshToggle}
                color="primary"
                size="small"
              />
            }
            label="Auto-refresh"
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isRefreshing}
            sx={{ mr: 2 }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={openRules ? <Remove /> : <Add />}
            onClick={toggleRules}
            color={openRules ? "secondary" : "primary"}
          >
            {openRules ? 'Hide Rules' : 'Prioritization Rules'}
          </Button>
        </Box>
      </Box>
      
      {/* Rules Panel */}
      {openRules && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
              Auto-Prioritization Rules
              <Tooltip title="These rules determine how leads are automatically prioritized in your queue.">
                <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
              </Tooltip>
            </Typography>
            
            {isEditing ? (
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Check />}
                  onClick={saveEditRule}
                  color="success"
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={cancelEditRule}
                  color="error"
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Autorenew />}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Apply Rules Now
              </Button>
            )}
          </Box>
          
          <TableContainer sx={{ maxHeight: isEditing ? 240 : 300 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Active</TableCell>
                  <TableCell>Rule Name</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Priority Action</TableCell>
                  <TableCell align="center">Weight</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customRules.map((rule) => (
                  <TableRow key={rule.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={rule.active}
                        onChange={() => toggleRuleActive(rule.id)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={rule.active ? 'medium' : 'regular'}>
                        {rule.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={rule.active ? 'text.primary' : 'text.secondary'}>
                        {rule.condition}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rule.priority}
                        size="small"
                        color={rule.priority.includes('High') ? 'error' : 
                               rule.priority.includes('Medium') ? 'warning' : 
                               rule.priority.includes('Low') ? 'info' : 'default'}
                        variant={rule.active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={rule.weight >= 8 ? 'medium' : 'regular'}>
                        {rule.weight}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => startEditRule(rule)}
                        disabled={isEditing}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {isEditing && editingRule && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Edit Rule: {editingRule.name}
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Rule Name"
                    value={editingRule.name}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Condition"
                    value={editingRule.condition}
                    onChange={(e) => setEditingRule({ ...editingRule, condition: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority Action</InputLabel>
                    <Select
                      value={editingRule.priority}
                      onChange={(e) => setEditingRule({ ...editingRule, priority: e.target.value })}
                      label="Priority Action"
                    >
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Increase by 1 level">Increase by 1 level</MenuItem>
                      <MenuItem value="Decrease by 1 level">Decrease by 1 level</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" gutterBottom>
                    Weight: {editingRule.weight}
                  </Typography>
                  <Slider
                    value={editingRule.weight}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(e, value) => handleRuleWeightChange(value)}
                    marks
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Priority Queue Dashboard */}
      <Grid container spacing={3}>
        {/* Priority Distribution Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="error.dark">
                      High Priority
                    </Typography>
                    <PriorityHigh color="error" />
                  </Box>
                  <Typography variant="h3" component="div" mt={1} color="error.dark">
                    {getTotalCounts().high}
                  </Typography>
                  <Typography variant="body2" color="error.dark" sx={{ opacity: 0.8 }}>
                    {Math.round(getTotalCounts().high / getTotalCounts().total * 100)}% of total leads
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getTotalCounts().high / getTotalCounts().total * 100} 
                    color="error"
                    sx={{ mt: 1, height: 6, borderRadius: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="warning.dark">
                      Medium Priority
                    </Typography>
                    <HighPriority color="warning" />
                  </Box>
                  <Typography variant="h3" component="div" mt={1} color="warning.dark">
                    {getTotalCounts().medium}
                  </Typography>
                  <Typography variant="body2" color="warning.dark" sx={{ opacity: 0.8 }}>
                    {Math.round(getTotalCounts().medium / getTotalCounts().total * 100)}% of total leads
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getTotalCounts().medium / getTotalCounts().total * 100} 
                    color="warning"
                    sx={{ mt: 1, height: 6, borderRadius: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="info.dark">
                      Low Priority
                    </Typography>
                    <LowPriority color="info" />
                  </Box>
                  <Typography variant="h3" component="div" mt={1} color="info.dark">
                    {getTotalCounts().low}
                  </Typography>
                  <Typography variant="body2" color="info.dark" sx={{ opacity: 0.8 }}>
                    {Math.round(getTotalCounts().low / getTotalCounts().total * 100)}% of total leads
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getTotalCounts().low / getTotalCounts().total * 100} 
                    color="info"
                    sx={{ mt: 1, height: 6, borderRadius: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="text.primary">
                      Total Leads
                    </Typography>
                    <Person color="action" />
                  </Box>
                  <Typography variant="h3" component="div" mt={1}>
                    {getTotalCounts().total}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <AccessTime fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      Last updated: May 7, 2025, 10:32 AM
                    </Typography>
                  </Box>
                  {isRefreshing && (
                    <LinearProgress sx={{ mt: 1, height: 6, borderRadius: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Tabs for Views */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 0 }}>
            <Tabs 
              value={priorityView} 
              onChange={handleViewChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab 
                value="current" 
                label="Current Priorities" 
                icon={<FilterList />} 
                iconPosition="start"
              />
              <Tab 
                value="history" 
                label="Priority History" 
                icon={<AccessTime />} 
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        </Grid>
        
        {/* Main Content Area - Current Priority View */}
        {priorityView === 'current' && (
          <>
            <Grid item xs={12} md={8} lg={9}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                    Lead Priority Queue
                  </Typography>
                  
                  <Box display="flex" alignItems="center">
                    <TextField
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={handleSearch}
                      size="small"
                      sx={{ width: 200, mr: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={filterPriority}
                        onChange={handleFilterChange}
                        label="Priority"
                      >
                        <MenuItem value="all">All Priorities</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {isRefreshing ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress size={40} />
                    <Typography variant="h6" color="text.secondary" sx={{ ml: 2 }}>
                      Refreshing priority queue...
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Lead Name</TableCell>
                          <TableCell>Company</TableCell>
                          <TableCell align="center">Priority</TableCell>
                          <TableCell align="center">Score</TableCell>
                          <TableCell>Specialty</TableCell>
                          <TableCell>Last Contact</TableCell>
                          <TableCell>Next Action</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getFilteredLeads().map((lead) => (
                          <TableRow 
                            key={lead.id}
                            hover
                            onClick={() => handleLeadSelect(lead)}
                            sx={{ 
                              cursor: 'pointer',
                              bgcolor: selectedLead?.id === lead.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar 
                                  sx={{ 
                                    width: 28, 
                                    height: 28, 
                                    mr: 1,
                                    bgcolor: getPriorityColor(lead.priority) + '.light',
                                    color: getPriorityColor(lead.priority) + '.dark'
                                  }}
                                >
                                  {lead.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" fontWeight={selectedLead?.id === lead.id ? 'medium' : 'regular'}>
                                  {lead.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {lead.company}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={lead.priority.toUpperCase()}
                                size="small"
                                color={getPriorityColor(lead.priority)}
                                icon={getPriorityIcon(lead.priority)}
                                sx={{ minWidth: 85 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                color={lead.score >= 80 ? 'success.main' : 
                                      lead.score >= 65 ? 'warning.main' : 'text.secondary'}
                              >
                                {lead.score}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {lead.specialty}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {lead.lastContact}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={`Due: ${lead.nextActionDate}`}>
                                <Typography variant="body2">
                                  {lead.nextAction}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // This would handle follow-up action in a real implementation
                                }}
                              >
                                <ArrowForward fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
            
            {/* Lead Details Sidebar */}
            <Grid item xs={12} md={4} lg={3}>
              {selectedLead ? (
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Lead Details
                  </Typography>
                  
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar 
                        sx={{ 
                          bgcolor: getPriorityColor(selectedLead.priority) + '.light', 
                          color: getPriorityColor(selectedLead.priority) + '.dark',
                          width: 40,
                          height: 40,
                          mr: 1
                        }}
                      >
                        {selectedLead.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {selectedLead.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedLead.company}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                      <Chip
                        label={selectedLead.priority.toUpperCase() + " PRIORITY"}
                        color={getPriorityColor(selectedLead.priority)}
                        icon={getPriorityIcon(selectedLead.priority)}
                        size="small"
                      />
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="medium"
                        color={selectedLead.score >= 80 ? 'success.main' : 
                              selectedLead.score >= 65 ? 'warning.main' : 'text.secondary'}
                      >
                        Score: {selectedLead.score}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <List dense disablePadding>
                    <ListItem disablePadding sx={{ pb: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocalHospital fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Specialty" 
                        secondary={selectedLead.specialty} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ pb: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <MonetizationOn fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Budget" 
                        secondary={selectedLead.budget} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                    <ListItem disablePadding sx={{ pb: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <AccessTime fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Last Contact" 
                        secondary={selectedLead.lastContact} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  </List>
                  
                  <Box mt={2} p={1.5} bgcolor="rgba(0, 0, 0, 0.03)" borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                      Next Action
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedLead.nextAction}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <CalendarToday fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Due: {selectedLead.nextActionDate}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Auto-Prioritization Reason
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {selectedLead.autoReason}
                  </Typography>
                  
                  <Box mt={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      color={selectedLead.priority === 'high' ? 'error' : 
                            selectedLead.priority === 'medium' ? 'warning' : 'info'}
                      startIcon={<AssignmentTurnedIn />}
                    >
                      Take Action Now
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Lead Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 250 }}>
                    Select a lead from the priority queue to view detailed information and take action.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </>
        )}
        
        {/* Priority History View */}
        {priorityView === 'history' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Priority Queue History
                </Typography>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={historyRange}
                    onChange={handleHistoryRangeChange}
                    label="Time Range"
                  >
                    <MenuItem value="day">Last 24 Hours</MenuItem>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">High Priority</TableCell>
                      <TableCell align="center">Medium Priority</TableCell>
                      <TableCell align="center">Low Priority</TableCell>
                      <TableCell>Priority Changes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priorityHistory.map((day, index) => (
                      <TableRow key={day.date} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={index === 0 ? 'medium' : 'regular'}>
                            {day.date}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={day.high}
                            size="small"
                            color="error"
                            variant={index === 0 ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={day.medium}
                            size="small"
                            color="warning"
                            variant={index === 0 ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={day.low}
                            size="small"
                            color="info"
                            variant={index === 0 ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell>
                          {day.changes && day.changes.length > 0 ? (
                            <Box>
                              {day.changes.map((change, idx) => (
                                <Box key={idx} display="flex" alignItems="center" mb={idx < day.changes.length - 1 ? 0.5 : 0}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {change.name}:
                                  </Typography>
                                  <Box display="flex" alignItems="center" ml={0.5}>
                                    <Chip
                                      label={change.from}
                                      size="small"
                                      color={getPriorityColor(change.from)}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                    <ArrowRight fontSize="small" sx={{ mx: 0.5 }} />
                                    <Chip
                                      label={change.to}
                                      size="small"
                                      color={getPriorityColor(change.to)}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No changes
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Priority Change Insights
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TrendingUp color="success" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" fontWeight="medium">
                          Upward Trends
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        3 leads moved to higher priority in the last week, primarily due to increased engagement and budget approvals.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <TrendingDown color="error" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" fontWeight="medium">
                          Downward Trends
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        1 lead moved to lower priority due to extended decision timeline and reduced engagement over the past 14 days.
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Analytics color="primary" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" fontWeight="medium">
                          Priority Distribution
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        High-priority leads increased by 50% over the past week, indicating improved lead quality and sales opportunity.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LeadPrioritization;