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
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
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
  LineChart,
  Line,
  ComposedChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  InfoOutlined, 
  Search,
  Business,
  ContentPaste,
  Language,
  MonetizationOn,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  CompareArrows,
  KeyboardArrowUp,
  KeyboardArrowDown,
  AdUnits,
  Web,
  Analytics
} from '@mui/icons-material';

// Color scheme for charts
const COLORS = [
  '#1976d2', '#f44336', '#4caf50', '#ff9800', '#9c27b0',
  '#2196f3', '#ff5722', '#673ab7', '#009688', '#3f51b5'
];

// Simulated ad spend by channel for competitors
const adChannelDistribution = {
  'Your Company': {
    'Search Ads': 250000,
    'Social Media': 150000,
    'Display Networks': 120000,
    'Email Marketing': 80000,
    'Content Marketing': 80000
  },
  'Competitor A': {
    'Search Ads': 320000,
    'Social Media': 280000,
    'Display Networks': 190000,
    'Email Marketing': 90000,
    'Content Marketing': 120000
  },
  'Competitor B': {
    'Search Ads': 180000,
    'Social Media': 210000,
    'Display Networks': 150000,
    'Email Marketing': 60000,
    'Content Marketing': 120000
  },
  'Competitor C': {
    'Search Ads': 160000,
    'Social Media': 190000,
    'Display Networks': 140000,
    'Email Marketing': 120000,
    'Content Marketing': 140000
  },
  'Competitor D': {
    'Search Ads': 110000,
    'Social Media': 150000,
    'Display Networks': 100000,
    'Email Marketing': 20000,
    'Content Marketing': 40000
  }
};

// Simulated web traffic sources
const trafficSources = {
  'Your Company': {
    'Organic Search': 40,
    'Paid Search': 25,
    'Direct': 15,
    'Referral': 10,
    'Social': 10
  },
  'Competitor A': {
    'Organic Search': 45,
    'Paid Search': 30,
    'Direct': 12,
    'Referral': 8,
    'Social': 5
  },
  'Competitor B': {
    'Organic Search': 35,
    'Paid Search': 20,
    'Direct': 20,
    'Referral': 15,
    'Social': 10
  },
  'Competitor C': {
    'Organic Search': 50,
    'Paid Search': 15,
    'Direct': 20,
    'Referral': 5,
    'Social': 10
  },
  'Competitor D': {
    'Organic Search': 30,
    'Paid Search': 10,
    'Direct': 25,
    'Referral': 25,
    'Social': 10
  }
};

// Simulated marketing channel effectiveness
const channelEffectiveness = {
  'Search Ads': {
    'Your Company': 82,
    'Competitor A': 87,
    'Competitor B': 76,
    'Industry Average': 79
  },
  'Social Media': {
    'Your Company': 68,
    'Competitor A': 79,
    'Competitor B': 72,
    'Industry Average': 70
  },
  'Email Marketing': {
    'Your Company': 72,
    'Competitor A': 65,
    'Competitor B': 70,
    'Industry Average': 68
  },
  'Content Marketing': {
    'Your Company': 65,
    'Competitor A': 74,
    'Competitor B': 68,
    'Industry Average': 67
  },
  'Display Networks': {
    'Your Company': 58,
    'Competitor A': 62,
    'Competitor B': 60,
    'Industry Average': 59
  }
};

// Simulated trending topics and keywords in the industry
const trendingTopics = [
  { keyword: 'healthcare app', volume: 12500, growth: 32, difficulty: 76 },
  { keyword: 'telemedicine services', volume: 8700, growth: 48, difficulty: 65 },
  { keyword: 'online doctor consultation', volume: 9800, growth: 28, difficulty: 72 },
  { keyword: 'healthcare technology', volume: 6500, growth: 18, difficulty: 68 },
  { keyword: 'medical care near me', volume: 15600, growth: 14, difficulty: 82 },
  { keyword: 'affordable healthcare', volume: 11200, growth: 22, difficulty: 79 },
  { keyword: 'specialist doctor online', volume: 7300, growth: 37, difficulty: 70 },
  { keyword: 'health insurance coverage', volume: 8900, growth: 12, difficulty: 85 }
];

const CompetitiveIntelligence = ({ data }) => {
  const [competitors, setCompetitors] = useState([]);
  const [keywordGaps, setKeywordGaps] = useState([]);
  const [contentGaps, setContentGaps] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState('Competitor A');
  const [selectedView, setSelectedView] = useState('market');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('Search Ads');

  useEffect(() => {
    if (data) {
      if (data.competitors) {
        setCompetitors(data.competitors);
      }
      if (data.keywordGaps) {
        setKeywordGaps(data.keywordGaps);
      }
      if (data.contentGaps) {
        setContentGaps(data.contentGaps);
      }
    }
  }, [data]);

  const handleCompetitorChange = (event) => {
    setSelectedCompetitor(event.target.value);
  };

  const handleViewChange = (event) => {
    setSelectedView(event.target.value);
  };

  const handleChannelChange = (event) => {
    setSelectedChannel(event.target.value);
  };

  // Format data for market share pie chart
  const getMarketShareData = () => {
    return competitors.map((competitor) => ({
      name: competitor.name,
      value: Math.round(competitor.marketShare * 100),
      fill: competitor.name === 'Your Company' ? '#4caf50' : COLORS[competitors.indexOf(competitor) % COLORS.length]
    }));
  };

  // Format data for competitor comparison chart
  const getComparisonData = () => {
    const selectedComp = competitors.find(comp => comp.name === selectedCompetitor) || competitors[0];
    const yourCompany = competitors.find(comp => comp.name === 'Your Company') || competitors[0];
    
    return [
      {
        metric: 'Ad Spend',
        competitor: selectedComp?.adSpend,
        yourCompany: yourCompany?.adSpend,
      },
      {
        metric: 'Web Traffic',
        competitor: selectedComp?.webTraffic,
        yourCompany: yourCompany?.webTraffic,
      },
      {
        metric: 'Keywords',
        competitor: selectedComp?.keywords,
        yourCompany: yourCompany?.keywords,
      }
    ];
  };

  // Format data for ad channel distribution
  const getAdChannelData = () => {
    const channels = Object.keys(adChannelDistribution['Your Company'] || {});
    
    return channels.map(channel => {
      const data = { name: channel };
      Object.keys(adChannelDistribution).forEach(company => {
        data[company] = adChannelDistribution[company][channel];
      });
      return data;
    });
  };

  // Format data for radar chart comparison
  const getChannelEffectivenessData = () => {
    return Object.keys(channelEffectiveness).map(channel => {
      const data = { channel };
      Object.keys(channelEffectiveness[channel]).forEach(company => {
        data[company] = channelEffectiveness[channel][company];
      });
      return data;
    });
  };

  // Format data for traffic sources comparison
  const getTrafficSourceData = () => {
    const yourCompany = trafficSources['Your Company'] || {};
    const competitorData = trafficSources[selectedCompetitor] || {};
    const sources = Object.keys(yourCompany);
    
    return sources.map(source => ({
      name: source,
      yourCompany: yourCompany[source],
      competitor: competitorData[source]
    }));
  };

  // Filter trending topics based on search term
  const filteredTopics = trendingTopics.filter(topic => 
    searchTerm === '' || topic.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h2" gutterBottom>
          Competitive Intelligence Dashboard
          <Tooltip title="Analysis of competitors' marketing strategies, ad spend, web traffic, and content gaps to identify opportunities.">
            <InfoOutlined fontSize="small" sx={{ ml: 1, cursor: 'pointer', verticalAlign: 'middle' }} />
          </Tooltip>
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>View</InputLabel>
            <Select value={selectedView} onChange={handleViewChange} label="View">
              <MenuItem value="market">Market Share</MenuItem>
              <MenuItem value="adspend">Ad Spend</MenuItem>
              <MenuItem value="traffic">Traffic Analysis</MenuItem>
              <MenuItem value="effectiveness">Channel Effectiveness</MenuItem>
              <MenuItem value="keywords">Keyword Intelligence</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Compare With</InputLabel>
            <Select value={selectedCompetitor} onChange={handleCompetitorChange} label="Compare With">
              {competitors.map((competitor) => (
                competitor.name !== 'Your Company' && (
                  <MenuItem key={competitor.name} value={competitor.name}>
                    {competitor.name}
                  </MenuItem>
                )
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Market Share View */}
        {selectedView === 'market' && (
          <>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Market Share Analysis
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getMarketShareData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getMarketShareData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Competitive Comparison
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" paragraph>
                  You vs. {selectedCompetitor}
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getComparisonData()}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="metric" type="category" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="yourCompany" name="Your Company" fill="#4caf50" />
                      <Bar dataKey="competitor" name={selectedCompetitor} fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box mt={2}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell align="right">Your Company</TableCell>
                          <TableCell align="right">{selectedCompetitor}</TableCell>
                          <TableCell align="right">Gap</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getComparisonData().map((row) => {
                          const gap = row.yourCompany - row.competitor;
                          const isPositive = gap > 0;
                          
                          return (
                            <TableRow key={row.metric}>
                              <TableCell component="th" scope="row">
                                {row.metric}
                              </TableCell>
                              <TableCell align="right">
                                {row.metric === 'Ad Spend' 
                                  ? `$${(row.yourCompany / 1000).toFixed(0)}k` 
                                  : ""}
                              </TableCell>
                              <TableCell align="right">
                                {row.metric === 'Ad Spend' 
                                  ? `$${(row.competitor / 1000).toFixed(0)}k` 
                                  : ""}
                              </TableCell>
                              <TableCell 
                                align="right"
                                sx={{ 
                                  color: isPositive ? 'success.main' : 'error.main',
                                  fontWeight: 'medium'
                                }}
                              >
                                {isPositive ? '+' : ''}{Math.abs(gap) > 1000 
                                  ? `${(gap / 1000).toFixed(1)}k` 
                                  : gap.toLocaleString()}
                                {isPositive 
                                  ? <KeyboardArrowUp fontSize="small" />
                                  : <KeyboardArrowDown fontSize="small" />
                                }
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {/* Ad Spend Distribution View */}
        {selectedView === 'adspend' && (
          <>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ad Spend by Channel
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getAdChannelData()}
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
                        tickFormatter={(value) => `$${value / 1000}k`}
                        label={{ value: 'Ad Spend (thousands)', angle: -90, position: 'insideLeft' }} 
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Ad Spend']}
                      />
                      <Legend />
                      <Bar dataKey="Your Company" name="Your Company" fill="#4caf50" />
                      <Bar dataKey={selectedCompetitor} name={selectedCompetitor} fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Channel Focus Analysis
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" paragraph>
                  Percentage of total ad spend
                </Typography>
                
                {Object.keys(adChannelDistribution['Your Company'] || {}).map((channel) => {
                  const yourSpend = adChannelDistribution['Your Company'][channel];
                  const competitorSpend = adChannelDistribution[selectedCompetitor][channel];
                  const yourTotal = Object.values(adChannelDistribution['Your Company']).reduce((a, b) => a + b, 0);
                  const competitorTotal = Object.values(adChannelDistribution[selectedCompetitor]).reduce((a, b) => a + b, 0);
                  
                  const yourPercent = (yourSpend / yourTotal) * 100;
                  const competitorPercent = (competitorSpend / competitorTotal) * 100;
                  const difference = yourPercent - competitorPercent;
                  
                  return (
                    <Box key={channel} mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {channel}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" color={difference > 0 ? 'success.main' : difference < 0 ? 'error.main' : 'text.secondary'}>
                            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                          </Typography>
                          {Math.abs(difference) > 2 && (
                            difference > 0 
                              ? <KeyboardArrowUp fontSize="small" color="success" />
                              : <KeyboardArrowDown fontSize="small" color="error" />
                          )}
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Box flex={1} mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={yourPercent} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 2,
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4caf50'
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" width={35}>
                          {yourPercent.toFixed(0)}%
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Box flex={1} mr={1}>
                          <LinearProgress 
                            variant="determinate" 
                            value={competitorPercent} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 2,
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#f44336'
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" width={35}>
                          {competitorPercent.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                
                <Box mt={3}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Key Insights
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <TrendingUp fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${selectedCompetitor} spends ${Math.round((adChannelDistribution[selectedCompetitor]['Social Media'] / adChannelDistribution['Your Company']['Social Media'] - 1) * 100)}% more on social media`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <InfoOutlined fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Consider reallocating budget from display to search ads for better ROI"
                      />
                    </ListItem>
                  </List>
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {/* Traffic Analysis View */}
        {selectedView === 'traffic' && (
          <>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Traffic Sources Comparison
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getTrafficSourceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Traffic Share']} />
                      <Legend />
                      <Bar dataKey="yourCompany" name="Your Company" fill="#4caf50" />
                      <Bar dataKey="competitor" name={selectedCompetitor} fill="#f44336" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Web Traffic Analysis
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell align="right">Traffic</TableCell>
                        <TableCell align="right">Keywords</TableCell>
                        <TableCell align="right">Traffic/Keyword</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {competitors.map((competitor) => {
                        const efficiency = (competitor.webTraffic / competitor.keywords).toFixed(1);
                        return (
                          <TableRow key={competitor.name} sx={{ 
                            backgroundColor: competitor.name === 'Your Company' ? 'rgba(76, 175, 80, 0.08)' : 'inherit'
                          }}>
                            <TableCell component="th" scope="row">
                              {competitor.name}
                            </TableCell>
                            <TableCell align="right">
                              {(competitor.webTraffic / 1000).toFixed(0)}k
                            </TableCell>
                            <TableCell align="right">
                              {competitor.keywords.toLocaleString()}
                            </TableCell>
                            <TableCell align="right">
                              {efficiency}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box mt={3}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Traffic Quality Indicators
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Bounce Rate
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              42%
                            </Typography>
                            <Chip 
                              size="small" 
                              color="success" 
                              label="-5%" 
                              icon={<KeyboardArrowDown />} 
                              sx={{ height: 20 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            vs. {selectedCompetitor}: 47%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Avg. Session
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              3:42
                            </Typography>
                            <Chip 
                              size="small" 
                              color="error" 
                              label="-0:38" 
                              icon={<KeyboardArrowDown />} 
                              sx={{ height: 20 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            vs. {selectedCompetitor}: 4:20
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Pages/Session
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              3.8
                            </Typography>
                            <Chip 
                              size="small" 
                              color="error" 
                              label="-0.5" 
                              icon={<KeyboardArrowDown />} 
                              sx={{ height: 20 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            vs. {selectedCompetitor}: 4.3
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1 }}>
                        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Conversion Rate
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              4.2%
                            </Typography>
                            <Chip 
                              size="small" 
                              color="success" 
                              label="+0.8%" 
                              icon={<KeyboardArrowUp />} 
                              sx={{ height: 20 }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            vs. {selectedCompetitor}: 3.4%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {/* Channel Effectiveness View */}
        {selectedView === 'effectiveness' && (
          <>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Marketing Channel Effectiveness
                </Typography>
                <FormControl variant="outlined" size="small" sx={{ mb: 2, minWidth: 120 }}>
                  <InputLabel>Channel</InputLabel>
                  <Select value={selectedChannel} onChange={handleChannelChange} label="Channel">
                    {Object.keys(channelEffectiveness).map((channel) => (
                      <MenuItem key={channel} value={channel}>
                        {channel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      outerRadius={150} 
                      width={500} 
                      height={500}
                      data={getChannelEffectivenessData()}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="channel" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Your Company" 
                        dataKey="Your Company" 
                        stroke="#4caf50" 
                        fill="#4caf50" 
                        fillOpacity={0.5} 
                      />
                      <Radar 
                        name={selectedCompetitor} 
                        dataKey={selectedCompetitor} 
                        stroke="#f44336" 
                        fill="#f44336" 
                        fillOpacity={0.5} 
                      />
                      <Radar 
                        name="Industry Average" 
                        dataKey="Industry Average" 
                        stroke="#2196f3" 
                        fill="#2196f3" 
                        fillOpacity={0.3} 
                      />
                      <Legend />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedChannel} Performance
                </Typography>
                
                <Box mt={2} mb={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Effectiveness Score
                  </Typography>
                  
                  <Box my={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary">
                            {channelEffectiveness[selectedChannel]?.['Your Company'] || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Your Company
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="error">
                            {channelEffectiveness[selectedChannel]?.[selectedCompetitor] || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedCompetitor}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="info.main">
                            {channelEffectiveness[selectedChannel]?.['Industry Average'] || 0}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Industry Avg
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Key Performance Factors
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="body2" display="flex" justifyContent="space-between">
                      <span>Message Relevance</span>
                      <span>78%</span>
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={78} 
                      sx={{ 
                        mt: 0.5,
                        height: 6, 
                        borderRadius: 1,
                      }} 
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" display="flex" justifyContent="space-between">
                      <span>Audience Targeting</span>
                      <span>85%</span>
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        mt: 0.5,
                        height: 6, 
                        borderRadius: 1,
                      }} 
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" display="flex" justifyContent="space-between">
                      <span>Creative Quality</span>
                      <span>72%</span>
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={72} 
                      sx={{ 
                        mt: 0.5,
                        height: 6, 
                        borderRadius: 1,
                      }} 
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" display="flex" justifyContent="space-between">
                      <span>Conversion Path</span>
                      <span>68%</span>
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={68} 
                      sx={{ 
                        mt: 0.5,
                        height: 6, 
                        borderRadius: 1,
                      }} 
                    />
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Recommended Actions
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TrendingUp fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Increase ${selectedChannel} budget by 15%`}
                      secondary="To match competitor's market presence"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CompareArrows fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Improve conversion path optimization"
                      secondary="Current performance is 14% below industry average"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </>
        )}

        {/* Keyword Intelligence View */}
        {selectedView === 'keywords' && (
          <>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Trending Keywords & Topics
                </Typography>
                
                <TextField
                  placeholder="Search keywords..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TableContainer sx={{ maxHeight: 345, overflowY: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Keyword</TableCell>
                        <TableCell align="right">Volume</TableCell>
                        <TableCell align="right">Growth</TableCell>
                        <TableCell align="right">Difficulty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTopics.map((topic) => (
                        <TableRow key={topic.keyword}>
                          <TableCell component="th" scope="row">
                            {topic.keyword}
                          </TableCell>
                          <TableCell align="right">
                            {topic.volume.toLocaleString()}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ 
                              color: topic.growth > 20 ? 'success.main' : 'text.primary',
                              fontWeight: topic.growth > 20 ? 'medium' : 'regular'
                            }}
                          >
                            +{topic.growth}%
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2" sx={{ minWidth: 25 }}>
                                {topic.difficulty}
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={topic.difficulty} 
                                sx={{ 
                                  ml: 1,
                                  width: 40,
                                  height: 6, 
                                  borderRadius: 1,
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: topic.difficulty > 80 ? '#f44336' : 
                                      topic.difficulty > 65 ? '#ff9800' : '#4caf50'
                                  }
                                }} 
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Content & Keyword Gaps
                </Typography>
                
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Keyword Opportunities
                  </Typography>
                  <Box display="flex" flexWrap="wrap" mb={3}>
                    {keywordGaps.map((keyword, index) => (
                      <Chip 
                        key={index}
                        label={keyword}
                        icon={<Search fontSize="small" />}
                        sx={{ m: 0.5 }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Content Type Gaps
                  </Typography>
                  <Box display="flex" flexWrap="wrap">
                    {contentGaps.map((content, index) => (
                      <Chip 
                        key={index}
                        label={content}
                        icon={<ContentPaste fontSize="small" />}
                        sx={{ m: 0.5 }}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Competitive Content Analysis
                </Typography>
                
                <Box mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Language fontSize="small" color="primary" sx={{ mr: 1 }} />
                            <Typography variant="subtitle2">Your Company</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Content Types:</Typography>
                            <Typography variant="body2">8</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Avg. Word Count:</Typography>
                            <Typography variant="body2">850</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Publishing Frequency:</Typography>
                            <Typography variant="body2">2/week</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Language fontSize="small" color="error" sx={{ mr: 1 }} />
                            <Typography variant="subtitle2">{selectedCompetitor}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Content Types:</Typography>
                            <Typography variant="body2">12</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Avg. Word Count:</Typography>
                            <Typography variant="body2">1250</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">Publishing Frequency:</Typography>
                            <Typography variant="body2">4/week</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Content Strategy
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <TrendingUp fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Create patient success stories"
                          secondary="Missing content type with high engagement"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Analytics fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Increase publishing frequency"
                          secondary="Current frequency is 50% below competitor"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AdUnits fontSize="small" color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Target 'affordable healthcare' keyword"
                          secondary="High volume (11.2K/mo) with moderate difficulty"
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </>
        )}

        {/* Bottom Action Cards */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Competitive Intelligence Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <MonetizationOn color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Ad Spend
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Increase search ad spend by 20% to close the gap with {selectedCompetitor}, focusing on top-performing healthcare keywords.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="High Impact" color="primary" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Web color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="secondary">
                        Content
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Create a content series on {contentGaps[0]} to fill the gap with competitors and improve organic traffic by an estimated 12%.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="Medium Impact" color="secondary" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Search color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="error">
                        Keywords
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Target "{keywordGaps[0]}" and "{keywordGaps[1]}" keywords across paid and organic channels to improve visibility in areas where {selectedCompetitor} is weaker.
                    </Typography>
                    <Chip icon={<TrendingUp />} label="High Impact" color="error" size="small" />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Business color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="info">
                        Market Share
                      </Typography>
                    </Box>
                    <Typography variant="body2" paragraph>
                      Focus resources on {selectedChannel} where your effectiveness (
                      {channelEffectiveness[selectedChannel]?.['Your Company']}%) 
                      exceeds {selectedCompetitor} (
                      {channelEffectiveness[selectedChannel]?.[selectedCompetitor]}%).
                    </Typography>
                    <Chip icon={<TrendingUp />} label="Medium Impact" color="info" size="small" />
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

export default CompetitiveIntelligence;