'use client';
import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  Button
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  LocationOn, 
  MedicalServices, 
  DateRange, 
  Business, 
  Assessment, 
  PriorityHigh 
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = ({ data }) => {
  // Summary metrics
  const totalLeads = data.timeData.monthly.reduce((acc, month) => acc + month.leads, 0);
  const totalConversions = data.timeData.monthly.reduce((acc, month) => acc + month.conversions, 0);
  const conversionRate = (totalConversions / totalLeads * 100).toFixed(1);
  const highPriorityLeads = data.prioritizationData.highPriority.length;
  
  // Top specialties by conversion potential
  const topSpecialties = [...data.specialtyData.specialties]
    .sort((a, b) => b.conversionPotential - a.conversionPotential)
    .slice(0, 3);
    
  // Top regions by conversion rate
  const topRegions = [...data.regionalData.regions]
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 3);

  return (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Leads
              </Typography>
              <Typography variant="h4" component="div">
                {totalLeads.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Year to date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversions
              </Typography>
              <Typography variant="h4" component="div">
                {totalConversions.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Year to date
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4" component="div">
                {conversionRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overall performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Priority Leads
              </Typography>
              <Typography variant="h4" component="div">
                {highPriorityLeads}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Requiring immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DateRange color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Lead Performance by Month</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.timeData.monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill="#8884d8" />
                <Bar dataKey="conversions" name="Conversions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Specialties */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MedicalServices color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Top Medical Specialties</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topSpecialties}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="conversionPotential"
                  nameKey="name"
                >
                  {topSpecialties.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        {/* Regional Map (Placeholder) */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Regional Conversion Rates</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              {/* Top regions table */}
              {topRegions.map((region, index) => (
                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
                  <Typography>{region.name}</Typography>
                  <Typography color="primary" fontWeight="bold">{(region.conversionRate * 100).toFixed(1)}%</Typography>
                </Box>
              ))}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined" size="small">View Full Map</Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Lead Scoring Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assessment color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Lead Score Distribution</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { range: '90-100', count: data.leadScoringData.recentLeads.filter(l => l.score >= 90).length },
                  { range: '80-89', count: data.leadScoringData.recentLeads.filter(l => l.score >= 80 && l.score < 90).length },
                  { range: '70-79', count: data.leadScoringData.recentLeads.filter(l => l.score >= 70 && l.score < 80).length },
                  { range: '60-69', count: data.leadScoringData.recentLeads.filter(l => l.score >= 60 && l.score < 70).length },
                  { range: '0-59', count: data.leadScoringData.recentLeads.filter(l => l.score < 60).length }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Lead Count" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Competitor Market Share */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Business color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Market Share Analysis</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.competitiveData.competitors}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="marketShare"
                  nameKey="name"
                >
                  {data.competitiveData.competitors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => (value * 100).toFixed(1) + '%'} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;