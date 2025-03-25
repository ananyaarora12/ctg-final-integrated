'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import { RootState } from '../../../redux/store';
import { THEME_COLORS } from '../../../components/layout/Layout';

// Import icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

// Import chart components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

// Mock data for reports
const participationData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Volunteers',
      data: [65, 72, 78, 74, 82, 86, 90, 95, 92, 88, 94, 99],
      backgroundColor: THEME_COLORS.orange,
      borderRadius: 4,
    },
    {
      label: 'Participants',
      data: [42, 45, 51, 48, 56, 60, 62, 68, 71, 65, 74, 78],
      backgroundColor: '#2196F3',
      borderRadius: 4,
    }
  ],
};

const donationTrendsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Donations (₹)',
      data: [25000, 28000, 32000, 30000, 38000, 45000, 42000, 48000, 52000, 55000, 60000, 68000],
      borderColor: '#4CAF50',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
    }
  ],
};

const eventDistributionData = {
  labels: ['Education', 'Sports', 'Arts & Culture', 'Health', 'Skill Development', 'Other'],
  datasets: [
    {
      data: [30, 22, 18, 15, 10, 5],
      backgroundColor: [THEME_COLORS.orange, '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#607D8B'],
      borderWidth: 0,
    },
  ],
};

const engagementRateData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Engagement Rate',
      data: [68, 72, 76, 79],
      backgroundColor: THEME_COLORS.orange,
      borderRadius: 4,
    }
  ],
};

// Mock data for top performing events
const topPerformingEvents = [
  { id: 1, name: 'Blind Cricket Tournament', participants: 120, volunteers: 42, donations: '₹125,000', rating: 4.8 },
  { id: 2, name: 'Tech Education Workshop', participants: 85, volunteers: 28, donations: '₹75,000', rating: 4.6 },
  { id: 3, name: 'Art Exhibition', participants: 95, volunteers: 30, donations: '₹82,000', rating: 4.7 },
  { id: 4, name: 'Career Fair', participants: 110, volunteers: 35, donations: '₹65,000', rating: 4.5 },
  { id: 5, name: 'Digital Literacy Camp', participants: 75, volunteers: 25, donations: '₹58,000', rating: 4.4 },
];

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ReportsDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('year');
  const [eventType, setEventType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, user?.role]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const handleEventTypeChange = (event: any) => {
    setEventType(event.target.value);
  };

  // Filter events based on search
  const filteredEvents = topPerformingEvents.filter((event) => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Reports & Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Download detailed reports about your organization's activities
          </Typography>
        </Box>

        {/* Main content */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="reports tabs"
              sx={{
                '& .MuiTab-root': { 
                  fontWeight: 'bold',
                  textTransform: 'none',
                  minHeight: 64,
                },
                '& .Mui-selected': {
                  color: `${THEME_COLORS.orange} !important`,
                }
              }}
              TabIndicatorProps={{
                style: {
                  backgroundColor: THEME_COLORS.orange,
                }
              }}
            >
              <Tab label="Participation" id="reports-tab-1" aria-controls="reports-tabpanel-1" />
              <Tab label="Donations" id="reports-tab-2" aria-controls="reports-tabpanel-2" />
              <Tab label="Events" id="reports-tab-3" aria-controls="reports-tabpanel-3" />
            </Tabs>
          </Box>

          {/* Participation Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Download Participation Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generate and download various participation reports in CSV format.
              </Typography>
              
              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Volunteer Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Complete volunteer participation data with event details and hours logged.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Company-wise Volunteers
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Report of volunteers grouped by their company affiliations and contributions.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Event Participation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Volunteer and participant turnout for each event with demographic data.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Company Event Participation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Breakdown of corporate volunteer participation across different events.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Donations Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Download Donation Reports
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generate and download various donation reports in CSV format.
              </Typography>
              
              <Grid container spacing={3} mt={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Donation Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Complete donation transactions with amount, date, and donor information.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Corporate Donations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Summary of all donations made by corporate entities with details.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Event-wise Donations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Breakdown of donations received for each event organized.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Location-wise Donations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Geographic distribution of donations by location and region.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />}
                        fullWidth
                        sx={{ mt: 2, borderColor: THEME_COLORS.orange, color: THEME_COLORS.orange }}
                      >
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Events Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1" color="text.secondary">
              Detailed event metrics and reports will be displayed here.
            </Typography>
          </TabPanel>
        </Paper>

        {/* Top Performing Events */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Top Performing Events
            </Typography>
            <TextField
              placeholder="Search events..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="top events table">
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Event Name</TableCell>
                  <TableCell align="right">Participants</TableCell>
                  <TableCell align="right">Volunteers</TableCell>
                  <TableCell align="right">Donations</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                      {event.name}
                    </TableCell>
                    <TableCell align="right">{event.participants}</TableCell>
                    <TableCell align="right">{event.volunteers}</TableCell>
                    <TableCell align="right">{event.donations}</TableCell>
                    <TableCell align="right" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      {event.rating}/5
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body1" py={3} color="text.secondary">
                        No events found matching your search.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Layout>
  );
} 