'use client';
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  Switch,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Person,
  FilterList,
  PriorityHigh,
  LowPriority,
  ArrowUpward,
  ArrowDownward,
  Search,
  CheckCircle,
  Cancel,
  Schedule,
  CalendarMonth,
  Flag,
  StarBorder,
  Star,
  FormatListBulleted,
  ViewAgenda,
  ViewKanban,
  Refresh,
  Send,
  ArrowForward,
  Assignment
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const PRIORITY_COLORS = {
  High: '#f44336',
  Medium: '#ff9800',
  Low: '#4caf50'
};

const SmartPrioritization = ({ data }) => {
  const [viewMode, setViewMode] = useState('list');
  const [timeframe, setTimeframe] = useState('today');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Filter leads based on priority, timeframe, and search term
  const filteredLeads = data.prioritizedLeads.filter(lead => {
    const priorityMatch = selectedPriority === 'all' || lead.priority === selectedPriority;
    const completedMatch = showCompleted || !lead.completed;
    const searchMatch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by timeframe
    let timeframeMatch = true;
    if (timeframe === 'today') {
      timeframeMatch = lead.dueDate === 'Today';
    } else if (timeframe === 'week') {
      timeframeMatch = lead.dueDate === 'Today' || lead.dueDate === 'Tomorrow' || lead.dueDate.includes('days');
    }
    
    return priorityMatch && completedMatch && searchMatch && timeframeMatch;
  });
  
  // Get counts by priority
  const priorityCounts = {
    High: data.prioritizedLeads.filter(lead => lead.priority === 'High' && !lead.completed).length,
    Medium: data.prioritizedLeads.filter(lead => lead.priority === 'Medium' && !lead.completed).length,
    Low: data.prioritizedLeads.filter(lead => lead.priority === 'Low' && !lead.completed).length,
    Completed: data.prioritizedLeads.filter(lead => lead.completed).length
  };
  
  // Format data for pie chart
  const getPriorityChartData = () => {
    return [
      { name: 'High Priority', value: priorityCounts.High, color: PRIORITY_COLORS.High },
      { name: 'Medium Priority', value: priorityCounts.Medium, color: PRIORITY_COLORS.Medium },
      { name: 'Low Priority', value: priorityCounts.Low, color: PRIORITY_COLORS.Low },
      { name: 'Completed', value: priorityCounts.Completed, color: '#9e9e9e' }
    ];
  };
  
  // Create kanban groups
  const kanbanGroups = {
    High: filteredLeads.filter(lead => lead.priority === 'High' && !lead.completed),
    Medium: filteredLeads.filter(lead => lead.priority === 'Medium' && !lead.completed),
    Low: filteredLeads.filter(lead => lead.priority === 'Low' && !lead.completed),
    ...(showCompleted ? { Completed: filteredLeads.filter(lead => lead.completed) } : {})
  };
  
  // Handle lead selection
  const handleLeadClick = (lead) => {
    setSelectedLead(lead === selectedLead ? null : lead);
  };
  
  // Simulate automatic refresh every 5 minutes
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        // In a real implementation, this would re-fetch data or recalculate prioritization
        console.log('Auto-refreshing lead priorities...');
      }, 300000); // 5 minutes
    }
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Render the list view of leads
  const renderListView = () => (
    <TableContainer sx={{ maxHeight: 500 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Lead</TableCell>
            <TableCell>Company</TableCell>
            <TableCell align="center">Priority</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell align="center">Due</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow 
              key={lead.id}
              hover
              onClick={() => handleLeadClick(lead)}
              sx={{ 
                cursor: 'pointer',
                backgroundColor: lead === selectedLead ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                '&:hover': {
                  backgroundColor: lead === selectedLead ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                },
                textDecoration: lead.completed ? 'line-through' : 'none',
                opacity: lead.completed ? 0.7 : 1
              }}
            >
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{lead.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell align="center">
                <Chip 
                  label={lead.priority} 
                  size="small" 
                  color={
                    lead.priority === 'High' ? 'error' : 
                    lead.priority === 'Medium' ? 'warning' : 'success'
                  }
                  sx={{ fontWeight: lead.priority === 'High' ? 'bold' : 'normal' }}
                />
              </TableCell>
              <TableCell align="center">{lead.score}</TableCell>
              <TableCell align="center">{lead.dueDate}</TableCell>
              <TableCell align="center">
                <Chip 
                  icon={lead.completed ? <CheckCircle /> : <Schedule />}
                  label={lead.completed ? "Completed" : "Pending"}
                  color={lead.completed ? "default" : "primary"}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Render the kanban view of leads
  const renderKanbanView = () => (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      {Object.entries(kanbanGroups).map(([priority, leads]) => (
        <Grid item xs={12} sm={6} md={3} key={priority}>
          <Paper elevation={2} sx={{ p: 1, height: '100%', bgcolor: priority === 'High' ? '#fff5f5' : priority === 'Medium' ? '#fff8e1' : priority === 'Low' ? '#f1f8e9' : '#f5f5f5' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {priority} Priority
              </Typography>
              <Chip 
                label={leads.length} 
                size="small" 
                color={
                  priority === 'High' ? 'error' : 
                  priority === 'Medium' ? 'warning' : 
                  priority === 'Low' ? 'success' : 'default'
                }
              />
            </Box>
            
            <Stack spacing={1} sx={{ maxHeight: 430, overflowY: 'auto', p: 1 }}>
              {leads.map((lead) => (
                <Card 
                  key={lead.id} 
                  elevation={1} 
                  onClick={() => handleLeadClick(lead)}
                  sx={{ 
                    cursor: 'pointer', 
                    bgcolor: lead === selectedLead ? 'rgba(25, 118, 210, 0.08)' : 'white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    opacity: lead.completed ? 0.7 : 1,
                    position: 'relative',
                    ...(lead.priority === 'High' && { borderLeft: `4px solid ${PRIORITY_COLORS.High}` }),
                    ...(lead.priority === 'Medium' && { borderLeft: `4px solid ${PRIORITY_COLORS.Medium}` }),
                    ...(lead.priority === 'Low' && { borderLeft: `4px solid ${PRIORITY_COLORS.Low}` })
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {lead.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {lead.company}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={`Score: ${lead.score}`} 
                        size="small" 
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {lead.dueDate}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              
              {leads.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No leads in this category</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: '#1976d2' }}>
          Smart Lead Prioritization
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Machine learning-powered prioritization of leads based on conversion potential, urgency, and business value to help sales teams focus on the highest potential opportunities.
        </Typography>
      </Grid>

      {/* Controls and Filters */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="priority-filter-label">Priority</InputLabel>
                  <Select
                    labelId="priority-filter-label"
                    value={selectedPriority}
                    label="Priority"
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterList fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="High">High Priority</MenuItem>
                    <MenuItem value="Medium">Medium Priority</MenuItem>
                    <MenuItem value="Low">Low Priority</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="timeframe-filter-label">Timeframe</InputLabel>
                  <Select
                    labelId="timeframe-filter-label"
                    value={timeframe}
                    label="Timeframe"
                    onChange={(e) => setTimeframe(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <CalendarMonth fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  size="small"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Switch
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    inputProps={{ 'aria-label': 'Show completed leads' }}
                    size="small"
                  />
                  <Typography variant="body2">Show Completed</Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Box sx={{ borderRadius: 1, border: '1px solid #e0e0e0', display: 'flex' }}>
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'text'}
                    startIcon={<FormatListBulleted />}
                    onClick={() => setViewMode('list')}
                    color="primary"
                    size="small"
                    disableElevation
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'contained' : 'text'}
                    startIcon={<ViewKanban />}
                    onClick={() => setViewMode('kanban')}
                    color="primary"
                    size="small"
                    disableElevation
                  >
                    Kanban
                  </Button>
                </Box>
                
                <Button
                  startIcon={<Refresh />}
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  sx={{ border: autoRefresh ? '1px solid #1976d2' : '1px solid #e0e0e0', color: autoRefresh ? 'primary.main' : 'text.secondary' }}
                >
                  {autoRefresh ? 'Auto Refresh: On' : 'Auto Refresh: Off'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Main Content Area */}
      <Grid item xs={12} md={selectedLead ? 8 : 12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          {viewMode === 'list' ? renderListView() : renderKanbanView()}
        </Paper>
      </Grid>
      
      {/* Lead Details Sidebar */}
      {selectedLead && (
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Lead Details
              </Typography>
              <IconButton size="small" onClick={() => setSelectedLead(null)}>
                <Cancel fontSize="small" />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" color="primary">
                  {selectedLead.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedLead.company}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={
                    selectedLead.priority === 'High' ? <PriorityHigh /> : 
                    selectedLead.priority === 'Medium' ? <Flag /> : 
                    <LowPriority />
                  }
                  label={`${selectedLead.priority} Priority`}
                  color={
                    selectedLead.priority === 'High' ? 'error' : 
                    selectedLead.priority === 'Medium' ? 'warning' : 'success'
                  }
                />
                
                <Chip 
                  icon={<Assignment />}
                  label={`Score: ${selectedLead.score}`} 
                  variant="outlined"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {selectedLead.dueDate}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip 
                  icon={selectedLead.completed ? <CheckCircle /> : <Schedule />}
                  label={selectedLead.completed ? "Completed" : "Pending Follow-up"}
                  color={selectedLead.completed ? "default" : "primary"}
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Lead Details
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Email" 
                      secondary={`${selectedLead.name.split(' ')[0].toLowerCase()}@${selectedLead.company.toLowerCase().replace(/\s+/g, '')}.com`} 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Phone" 
                      secondary={`(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`} 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Last Contact" 
                      secondary={`${Math.floor(Math.random() * 7) + 1} days ago`} 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemText 
                      primary="Engagement Level" 
                      secondary={
                        <Rating 
                          value={Math.round(selectedLead.score / 20)} 
                          max={5} 
                          readOnly 
                          size="small" 
                        />
                      } 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recommended Actions
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForward fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={selectedLead.priority === 'High' ? 
                        "Schedule immediate follow-up call" : 
                        selectedLead.priority === 'Medium' ? 
                        "Send personalized proposal within 48 hours" :
                        "Add to weekly touchpoint schedule"
                      } 
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <ArrowForward fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Share ${selectedLead.score > 80 ? 'case studies' : 'product information'} for ${selectedLead.company}`} 
                    />
                  </ListItem>
                </List>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  fullWidth
                  disableElevation
                >
                  Contact Now
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={selectedLead.completed ? <Cancel /> : <CheckCircle />}
                  color={selectedLead.completed ? "error" : "success"}
                  fullWidth
                >
                  {selectedLead.completed ? "Mark Pending" : "Mark Complete"}
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      )}
      
      {/* Priority Distribution */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Lead Priority Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPriorityChartData()}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
              >
                {getPriorityChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} Leads`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      
      {/* Priority Categories */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Prioritization Insights
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#fff5f5', borderLeft: `4px solid ${PRIORITY_COLORS.High}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    High Priority
                  </Typography>
                  <Typography variant="h4" color="error" sx={{ mb: 1 }}>
                    {priorityCounts.High}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Criteria:</strong> Score 80+, short timeframe, engaged
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#fff8e1', borderLeft: `4px solid ${PRIORITY_COLORS.Medium}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Medium Priority
                  </Typography>
                  <Typography variant="h4" color="warning.dark" sx={{ mb: 1 }}>
                    {priorityCounts.Medium}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Criteria:</strong> Score 60-79, active engagement signs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#f1f8e9', borderLeft: `4px solid ${PRIORITY_COLORS.Low}` }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    Low Priority
                  </Typography>
                  <Typography variant="h4" color="success.dark" sx={{ mb: 1 }}>
                    {priorityCounts.Low}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Criteria:</strong> Score below 60, longer timeframe
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Prioritization Factors
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Star fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Lead score (conversion potential)" 
                  secondary="Based on machine learning model predictions"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Schedule fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Action urgency & timing" 
                  secondary="Determined by buying signals and timeframe"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Engagement level" 
                  secondary="Recent interactions and response rates"
                />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SmartPrioritization;