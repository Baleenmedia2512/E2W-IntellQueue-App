import React, { useState, useEffect } from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, Divider,
  Chip, Button, ToggleButtonGroup, ToggleButton,
  FormControl, InputLabel, Select, MenuItem, TextField,
  InputAdornment, Switch, FormControlLabel
} from '@mui/material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { 
  FilterList, PriorityHigh, Search, Refresh
} from '@mui/icons-material';

const PRIORITY_COLORS = {
  High: '#f44336',
  Medium: '#ff9800',
  Low: '#4caf50'
};

const LeadPrioritization = ({ data }) => {
  const [view, setView] = useState('card');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Combine all leads into a single array
  const allLeads = [
    ...data.highPriority.map(lead => ({ ...lead, priority: 'High', completed: false })),
    ...data.mediumPriority.map(lead => ({ ...lead, priority: 'Medium', completed: false })),
    ...data.lowPriority.map(lead => ({ ...lead, priority: 'Low', completed: false })),
    // Add some completed leads for demonstration
    { id: 110, name: 'Ravi Kumar', company: 'Tech Solutions', contact: '7654321099', score: 87, lastContact: '2025-04-20', notes: 'Contract signed', priority: 'High', completed: true, dueDate: 'Completed' },
    { id: 111, name: 'Meera Patel', company: 'Global Health', contact: '8765432100', score: 74, lastContact: '2025-04-22', notes: 'Closed - not interested', priority: 'Medium', completed: true, dueDate: 'Completed' }
  ];
  
  // Add due dates for display
  const leadsWithDueDates = allLeads.map(lead => {
    if (lead.completed) return { ...lead, dueDate: 'Completed' };
    
    const daysAgo = Math.floor((new Date() - new Date(lead.lastContact)) / (1000 * 60 * 60 * 24));
    let dueDate;
    if (lead.priority === 'High') {
      if (daysAgo >= 2) dueDate = 'Overdue';
      else dueDate = 'Today';
    } else if (lead.priority === 'Medium') {
      if (daysAgo >= 5) dueDate = 'Overdue';
      else if (daysAgo >= 3) dueDate = 'Today';
      else dueDate = 'Tomorrow';
    } else {
      if (daysAgo >= 7) dueDate = 'Overdue';
      else if (daysAgo >= 5) dueDate = 'Today';
      else dueDate = `In ${3 - daysAgo} days`;
    }
    
    return { ...lead, dueDate };
  });
  
  // Filter leads based on priority, timeframe, and search term
  const filteredLeads = leadsWithDueDates.filter(lead => {
    const priorityMatch = selectedPriority === 'all' || lead.priority === selectedPriority;
    const completedMatch = showCompleted || !lead.completed;
    const searchMatch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by timeframe
    let timeframeMatch = true;
    if (timeframe === 'today') {
      timeframeMatch = lead.dueDate === 'Today' || lead.dueDate === 'Overdue';
    } else if (timeframe === 'week') {
      timeframeMatch = lead.dueDate === 'Today' || lead.dueDate === 'Tomorrow' || 
                       lead.dueDate === 'Overdue' || lead.dueDate.includes('days');
    }
    
    return priorityMatch && completedMatch && searchMatch && timeframeMatch;
  });
  
  // Get counts by priority
  const priorityCounts = {
    High: allLeads.filter(lead => lead.priority === 'High' && !lead.completed).length,
    Medium: allLeads.filter(lead => lead.priority === 'Medium' && !lead.completed).length,
    Low: allLeads.filter(lead => lead.priority === 'Low' && !lead.completed).length,
    Completed: allLeads.filter(lead => lead.completed).length
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
  
  // Group leads by priority for card view
  const groupedLeads = {
    High: filteredLeads.filter(lead => lead.priority === 'High' && !lead.completed),
    Medium: filteredLeads.filter(lead => lead.priority === 'Medium' && !lead.completed),
    Low: filteredLeads.filter(lead => lead.priority === 'Low' && !lead.completed),
    Completed: filteredLeads.filter(lead => lead.completed)
  };
  
  // Handle lead selection
  const handleLeadClick = (lead) => {
    setSelectedLead(lead === selectedLead ? null : lead);
  };

  // Handle view change
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  
  // Render a lead card
  const renderLeadCard = (lead) => (
    <Card 
      key={lead.id}
      variant="outlined"
      sx={{ 
        mb: 2, 
        p: 2,
        backgroundColor: lead === selectedLead ? 'rgba(25, 118, 210, 0.08)' : 'white',
        borderLeft: `4px solid ${lead.completed ? '#9e9e9e' : PRIORITY_COLORS[lead.priority]}`,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: lead === selectedLead ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
        }
      }}
      onClick={() => handleLeadClick(lead)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {lead.name}
        </Typography>
        <Chip 
          label={lead.score} 
          color={lead.score >= 85 ? "success" : lead.score >= 70 ? "primary" : "default"}
          size="small"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {lead.company || 'No company'} • {lead.contact}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Chip 
          label={lead.dueDate} 
          color={lead.dueDate === 'Overdue' ? 'error' : lead.dueDate === 'Today' ? 'warning' : 'default'}
          size="small"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary">
          Last Contact: {new Date(lead.lastContact).toLocaleDateString()}
        </Typography>
      </Box>
    </Card>
  );
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              {/* View Toggle */}
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="card" aria-label="card view">
                  Card
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  List
                </ToggleButton>
              </ToggleButtonGroup>
              
              {/* Priority Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="priority-filter-label">Priority</InputLabel>
                <Select
                  labelId="priority-filter-label"
                  value={selectedPriority}
                  label="Priority"
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
              
              {/* Timeframe Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="timeframe-filter-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-filter-label"
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                </Select>
              </FormControl>
              
              {/* Search */}
              <TextField
                size="small"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              {/* Additional Controls */}
              <FormControlLabel
                control={
                  <Switch
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Completed"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto Refresh"
              />
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                size="small"
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Summary and Charts */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Priority Distribution</Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getPriorityChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPriorityChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Leads`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Priority Summary</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PRIORITY_COLORS.High, mr: 1 }} />
                  <Typography variant="body2">High Priority:</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">{priorityCounts.High} Leads</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PRIORITY_COLORS.Medium, mr: 1 }} />
                  <Typography variant="body2">Medium Priority:</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">{priorityCounts.Medium} Leads</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PRIORITY_COLORS.Low, mr: 1 }} />
                  <Typography variant="body2">Low Priority:</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">{priorityCounts.Low} Leads</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9e9e9e', mr: 1 }} />
                  <Typography variant="body2">Completed:</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="medium">{priorityCounts.Completed} Leads</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Lead List */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Smart Prioritized Leads</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found
                </Typography>
                <FilterList color="action" />
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {view === 'card' ? (
              <Box>
                {/* High Priority */}
                {(selectedPriority === 'all' || selectedPriority === 'High') && groupedLeads.High.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PriorityHigh sx={{ color: PRIORITY_COLORS.High, mr: 1 }} />
                      <Typography variant="subtitle1" color="error">High Priority</Typography>
                    </Box>
                    {groupedLeads.High.map(renderLeadCard)}
                  </Box>
                )}
                
                {/* Medium Priority */}
                {(selectedPriority === 'all' || selectedPriority === 'Medium') && groupedLeads.Medium.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PriorityHigh sx={{ color: PRIORITY_COLORS.Medium, mr: 1 }} />
                      <Typography variant="subtitle1" color="warning.main">Medium Priority</Typography>
                    </Box>
                    {groupedLeads.Medium.map(renderLeadCard)}
                  </Box>
                )}
                
                {/* Low Priority */}
                {(selectedPriority === 'all' || selectedPriority === 'Low') && groupedLeads.Low.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PriorityHigh sx={{ color: PRIORITY_COLORS.Low, mr: 1 }} />
                      <Typography variant="subtitle1" color="success.main">Low Priority</Typography>
                    </Box>
                    {groupedLeads.Low.map(renderLeadCard)}
                  </Box>
                )}
                
                {/* Completed */}
                {showCompleted && groupedLeads.Completed.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PriorityHigh sx={{ color: '#9e9e9e', mr: 1 }} />
                      <Typography variant="subtitle1" color="text.secondary">Completed</Typography>
                    </Box>
                    {groupedLeads.Completed.map(renderLeadCard)}
                  </Box>
                )}
                
                {filteredLeads.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No leads found matching your filters
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                {/* Implement list view here if needed */}
                <Typography variant="body1">List view implementation</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Lead Details Panel (when a lead is selected) */}
        {selectedLead && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{selectedLead.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLead.company || 'No company'} • ID: {selectedLead.id}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={selectedLead.priority} 
                    color={
                      selectedLead.priority === 'High' ? 'error' : 
                      selectedLead.priority === 'Medium' ? 'warning' : 'success'
                    }
                  />
                  <Chip 
                    label={`Score: ${selectedLead.score}`} 
                    color={selectedLead.score >= 85 ? "success" : selectedLead.score >= 70 ? "primary" : "default"}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                    <Typography variant="body1">{selectedLead.contact}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Contacted:</Typography>
                    <Typography variant="body1">{new Date(selectedLead.lastContact).toLocaleDateString()}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Lead Details</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Due Status:</Typography>
                    <Chip 
                      label={selectedLead.dueDate} 
                      color={selectedLead.dueDate === 'Overdue' ? 'error' : selectedLead.dueDate === 'Today' ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Notes:</Typography>
                    <Typography variant="body1">{selectedLead.notes || 'No notes available'}</Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" size="small">
                  Schedule Follow-up
                </Button>
                <Button variant="outlined" size="small">
                  Mark as Contacted
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  color={selectedLead.completed ? 'primary' : 'success'}
                >
                  {selectedLead.completed ? 'Reopen Lead' : 'Mark as Completed'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LeadPrioritization;