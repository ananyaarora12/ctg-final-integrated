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
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import { RootState } from '../../../redux/store';
import { THEME_COLORS } from '../../../components/layout/Layout';

// Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventIcon from '@mui/icons-material/Event';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Mock donation data
const mockDonations = [
  {
    id: 'DON-1501',
    donor: 'Morgan Stanley',
    email: 'corporate@morganstanley.com',
    amount: 125000,
    date: '2023-09-05',
    paymentMethod: 'Bank Transfer',
    purpose: 'General Fund',
    status: 'completed',
    receipt: true,
    location: 'Bangalore',
    event: 'Annual CSR Initiative',
    type: 'Corporate'
  },
  {
    id: 'DON-1502',
    donor: 'Morgan Stanley',
    email: 'corporate@morganstanley.com',
    amount: 75000,
    date: '2023-07-12',
    paymentMethod: 'Bank Transfer',
    purpose: 'Blind Cricket Tournament',
    status: 'completed',
    receipt: true,
    location: 'Bangalore',
    event: 'Blind Cricket Tournament',
    type: 'Corporate'
  },
  {
    id: 'DON-1001',
    donor: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    amount: 5000,
    date: '2023-08-15',
    paymentMethod: 'UPI',
    purpose: 'General Fund',
    status: 'completed',
    receipt: true,
    location: 'Bangalore',
    event: 'None',
    type: 'Individual'
  },
  {
    id: 'DON-1002',
    donor: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    amount: 10000,
    date: '2023-08-20',
    paymentMethod: 'Credit Card',
    purpose: 'Blind Cricket Tournament',
    status: 'completed',
    receipt: true,
    location: 'Mumbai',
    event: 'Blind Cricket Tournament',
    type: 'Individual'
  },
  {
    id: 'DON-1003',
    donor: 'Infosys Foundation',
    email: 'foundation@infosys.com',
    amount: 50000,
    date: '2023-09-01',
    paymentMethod: 'Bank Transfer',
    purpose: 'Tech Workshop',
    status: 'completed',
    receipt: true,
    location: 'Bangalore',
    event: 'Tech Education Workshop',
    type: 'Corporate'
  },
  {
    id: 'DON-1004',
    donor: 'Meena Joshi',
    email: 'meena.joshi@example.com',
    amount: 2000,
    date: '2023-09-10',
    paymentMethod: 'UPI',
    purpose: 'General Fund',
    status: 'completed',
    receipt: true,
    location: 'Delhi',
    event: 'None',
    type: 'Individual'
  },
  {
    id: 'DON-1005',
    donor: 'Tata Consultancy Services',
    email: 'csr@tcs.com',
    amount: 35000,
    date: '2023-09-15',
    paymentMethod: 'Bank Transfer',
    purpose: 'Scholarship Fund',
    status: 'completed',
    receipt: true,
    location: 'Mumbai',
    event: 'Career Fair',
    type: 'Corporate'
  },
  {
    id: 'DON-1006',
    donor: 'Priya Malhotra',
    email: 'priya.malhotra@example.com',
    amount: 8000,
    date: '2023-09-22',
    paymentMethod: 'Credit Card',
    purpose: 'General Fund',
    status: 'completed',
    receipt: true,
    location: 'Delhi',
    event: 'None',
    type: 'Individual'
  },
  {
    id: 'DON-1007',
    donor: 'Wipro Cares',
    email: 'cares@wipro.com',
    amount: 30000,
    date: '2023-10-05',
    paymentMethod: 'Bank Transfer',
    purpose: 'Assistive Tech',
    status: 'completed',
    receipt: true,
    location: 'Bangalore',
    event: 'Digital Literacy Camp',
    type: 'Corporate'
  },
  {
    id: 'DON-1008',
    donor: 'Kavita Singhania',
    email: 'kavita.singhania@example.com',
    amount: 15000,
    date: '2023-10-10',
    paymentMethod: 'Bank Transfer',
    purpose: 'General Fund',
    status: 'pending',
    receipt: false,
    location: 'Chennai',
    event: 'None',
    type: 'Individual'
  },
];

// Stats for the dashboard
const donationStats = [
  { 
    title: 'Total Donations', 
    value: '₹3,55,000', 
    icon: <MonetizationOnIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />,
    change: '+15%',
    trending: true
  },
  { 
    title: 'Donors', 
    value: '246', 
    icon: <PeopleAltIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
    change: '+8%',
    trending: true
  },
  { 
    title: 'Average Donation', 
    value: '₹9,450', 
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
    change: '+5%',
    trending: true
  },
  { 
    title: 'Event Donations', 
    value: '₹1,85,000', 
    icon: <EventIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
    change: '+20%',
    trending: true
  },
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
      id={`donation-tabpanel-${index}`}
      aria-labelledby={`donation-tab-${index}`}
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

export default function DonationsManagement() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null);
  
  const open = Boolean(anchorEl);

  // Unique locations from the donations data
  const locations = ['all', ...Array.from(new Set(mockDonations.map(donation => donation.location)))];
  
  // Unique events from the donations data
  const events = ['all', ...Array.from(new Set(mockDonations.map(donation => donation.event))).filter(event => event !== 'None')];
  
  // Donation types
  const donationTypes = ['all', 'Individual', 'Corporate'];

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

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle donation menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, donationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDonation(donationId);
  };

  // Handle donation menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Filter donations based on search and filters
  const filteredDonations = mockDonations.filter((donation) => {
    // Search filter
    const matchesSearch = 
      donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) || 
      donation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      donation.status === filterStatus;
    
    // Location filter
    const matchesLocation = 
      filterLocation === 'all' || 
      donation.location === filterLocation;
    
    // Event filter
    const matchesEvent = 
      filterEvent === 'all' || 
      donation.event === filterEvent;
      
    // Type filter
    const matchesType =
      filterType === 'all' ||
      donation.type === filterType;
      
    return matchesSearch && matchesStatus && matchesLocation && matchesEvent && matchesType;
  });

  // Format date string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            Donation Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage all donations received by your organization.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {donationStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 1, 
                    color: stat.trending ? '#4CAF50' : '#F44336' 
                  }}>
                    {stat.trending ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                    <Typography variant="body2" fontWeight="medium">
                      {stat.change} this month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main content */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', paddingLeft: 2, paddingY: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold" color={THEME_COLORS.orange}>
              Donations
            </Typography>
          </Box>

          {/* Donations Content */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search donations..."
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
                  sx={{ minWidth: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="location-filter-label">Location</InputLabel>
                  <Select
                    labelId="location-filter-label"
                    id="location-filter"
                    value={filterLocation}
                    label="Location"
                    onChange={(e) => setFilterLocation(e.target.value)}
                  >
                    {locations.map(location => (
                      <MenuItem key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="event-filter-label">Event</InputLabel>
                  <Select
                    labelId="event-filter-label"
                    id="event-filter"
                    value={filterEvent}
                    label="Event"
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    {events.map(event => (
                      <MenuItem key={event} value={event}>
                        {event === 'all' ? 'All Events' : event}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="type-filter-label">Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    id="type-filter"
                    value={filterType}
                    label="Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    {donationTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{ 
                    bgcolor: '#2196F3',
                    '&:hover': { bgcolor: '#1976D2' }
                  }}
                >
                  Export CSV
                </Button>
              </Box>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="donations table">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Donation ID</TableCell>
                    <TableCell>Donor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDonations
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((donation) => (
                      <TableRow key={donation.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                        <TableCell>{donation.id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {donation.donor}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {donation.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(donation.amount)}</TableCell>
                        <TableCell>{formatDate(donation.date)}</TableCell>
                        <TableCell>{donation.location}</TableCell>
                        <TableCell>{donation.event === 'None' ? '-' : donation.event}</TableCell>
                        <TableCell>
                          <Chip 
                            label={donation.type} 
                            size="small" 
                            sx={{ 
                              bgcolor: donation.type === 'Corporate' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                              color: donation.type === 'Corporate' ? '#2196F3' : '#4CAF50',
                              fontWeight: 'medium'
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={donation.status.charAt(0).toUpperCase() + donation.status.slice(1)} 
                            size="small" 
                            sx={{ 
                              bgcolor: donation.status === 'completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', 
                              color: donation.status === 'completed' ? '#4CAF50' : '#FF9800',
                              fontWeight: 'medium'
                            }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            aria-label="more"
                            id={`donation-menu-button-${donation.id}`}
                            aria-controls={open ? 'donation-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={(e) => handleMenuClick(e, donation.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {filteredDonations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" py={3} color="text.secondary">
                          No donations found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDonations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Paper>

        {/* Dropdown Menu for Actions */}
        <Menu
          id="donation-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': 'donation-menu-button',
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
            Download Receipt
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <EmailIcon fontSize="small" sx={{ mr: 1 }} />
            Send Thank You
          </MenuItem>
        </Menu>
      </Container>
    </Layout>
  );
} 