'use client';
import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Chip,
  Card,
  CardContent,
  Button,
  IconButton
} from '@mui/material';
import {
  Public,
  LocalHospital,
  Timelapse,
  Business,
  Assignment,
  Calculate,
  TrendingUp,
  InfoOutlined,
  ArrowUpward,
  ArrowDownward,
  ArrowForward
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
  Tooltip, 
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B'];

const PredictiveDashboard = ({ data }) => {
  // Calculate high potential regions based on conversion rate and population
  const highPotentialRegions = [...data.regionalData.regions]
    .sort((a, b) => (b.conversionRate * b.population) - (a.conversionRate * a.population))
    .slice(0, 3);
  
  // Calculate top specialties based on conversion potential and growth
  const topSpecialties = [...data.specialtyData.specialties]
    .sort((a, b) => ((b.conversionPotential * 0.7) + (b.growth * 0.3)) - ((a.conversionPotential * 0.7) + (a.growth * 0.3)))
    .slice(0, 3);
  
  // Format data for monthly conversions line chart
  const monthlyConversionsData = data.timeData.monthly.map(item => ({
    name: item.month,
    leads: item.leads,
    conversions: item.conversions,
    rate: Math.round((item.conversions / item.leads) * 100)
  }));
  
  // Format data for scoring distribution pie chart
  const getScoreDistribution = () => {
    const distribution = {
      'High (80+)': 0,
      'Medium (60-79)': 0,
      'Low (<60)': 0
    };
    
    data.leadScoringData.recentLeads.forEach(lead => {
      if (lead.score >= 80) distribution['High (80+)']++;
      else if (lead.score >= 60) distribution['Medium (60-79)']++;
      else distribution['Low (<60)']++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Summary Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Predictive Intelligence Summary
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Public color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        High Potential Regions
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      {highPotentialRegions[0].name}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.round(highPotentialRegions[0].conversionRate * 100)}% Conversion
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <LocalHospital color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Top Specialty
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      {topSpecialties[0].name}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.round(topSpecialties[0].growth * 100)}% Growth
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Timelapse color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Peak Season
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      Summer
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.round(data.timeData.seasonal['Summer (Jun-Aug)'].conversions * 100)}% Conversion
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Assignment color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        High Priority Leads
                      </Typography>
                    </Box>
                    <Typography variant="h5" component="div">
                      {data.prioritizedLeads.filter(lead => lead.priority === 'High' && !lead.completed).length}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                      {Math.round((data.leadScoringData.recentLeads.filter(lead => lead.score >= 80).length / data.leadScoringData.recentLeads.length) * 100)}% Scoring High
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Top Row */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Monthly Conversion Trends</Typography>
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyConversionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#8884d8" name="Total Leads" />
                <Line yAxisId="left" type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
                <Line yAxisId="right" type="monotone" dataKey="rate" stroke="#ff7300" name="Conversion Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Lead Score Distribution</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getScoreDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getScoreDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Bottom Row */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Potential Regions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              {highPotentialRegions.map((region, index) => (
                <Box key={region.id} sx={{ mb: 2, p: 1, backgroundColor: index === 0 ? 'rgba(232, 244, 253, 0.6)' : 'transparent', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={index === 0 ? 'medium' : 'regular'}>
                      {region.name}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${Math.round(region.conversionRate * 100)}%`} 
                      color={index === 0 ? "primary" : "default"}
                      variant={index === 0 ? "filled" : "outlined"}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Population: {(region.population / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Leads: {region.leadCount}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Button 
                variant="text" 
                color="primary" 
                endIcon={<ArrowForward />}
                sx={{ mt: 1 }}
                onClick={() => {}} // This would navigate to Regional Insights in a full implementation
              >
                View All Regions
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Specialties
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              {topSpecialties.map((specialty, index) => (
                <Box key={specialty.name} sx={{ mb: 2, p: 1, backgroundColor: index === 0 ? 'rgba(232, 244, 253, 0.6)' : 'transparent', borderRadius: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={index === 0 ? 'medium' : 'regular'}>
                      {specialty.name}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${Math.round(specialty.conversionPotential * 100)}%`} 
                      color={index === 0 ? "primary" : "default"}
                      variant={index === 0 ? "filled" : "outlined"}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Growth: +{Math.round(specialty.growth * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Leads: {specialty.leadCount}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Button 
                variant="text" 
                color="primary" 
                endIcon={<ArrowForward />}
                sx={{ mt: 1 }}
                onClick={() => {}} // This would navigate to Specialty Prediction in a full implementation
              >
                View All Specialties
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              High-Priority Leads
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              {data.prioritizedLeads
                .filter(lead => lead.priority === 'High' && !lead.completed)
                .slice(0, 3)
                .map((lead) => (
                <Box key={lead.id} sx={{ mb: 2, p: 1, borderLeft: '3px solid #f44336', borderRadius: 1, backgroundColor: 'rgba(244, 67, 54, 0.08)' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {lead.name}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={lead.score} 
                      color="error"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {lead.company}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      {lead.specialty}
                    </Typography>
                    <Typography variant="body2" color="error" fontWeight="medium">
                      Due: {lead.dueDate}
                    </Typography>
                  </Box>
                </Box>
              ))}
              
              <Button 
                variant="text" 
                color="primary" 
                endIcon={<ArrowForward />}
                sx={{ mt: 1 }}
                onClick={() => {}} // This would navigate to Smart Prioritization in a full implementation
              >
                View All Leads
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PredictiveDashboard;