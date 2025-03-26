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
  Tabs,
  Tab,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import { RootState } from '../../../redux/store';
import { THEME_COLORS } from '../../../components/layout/Layout';
import { Download as DownloadIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

// Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VerifiedIcon from '@mui/icons-material/Verified';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Mock volunteer data
const mockVolunteers = [
  {
    id: 1,
    name: 'John Volunteer',
    email: 'john12@gmail.com',
    phone: '+91 9876543210',
    joinDate: '23 March 2025',
    status: 'Active',
    events: 12,
    hours: 150,
    verified: true,
  },
  {
    id: 2,
    name: 'ananya',
    email: 'arora.ananya05@gmail.com',
    phone: '+91 9990354943',
    joinDate: '23 March 2025',
    status: 'Active',
    events: 4,
    hours: 48,
    verified: true,
  },
  {
    id: 'vol3',
    name: 'Riya Jain',
    email: 'riyajain1040@gmail.com',
    phone: '+91 7654321098',
    joinDate: '24 March 2025',
    status: 'inactive',
    verified: true,
    eventsAttended: 3,
    hoursLogged: 0,
  },
  {
    id: 'vol4',
    name: 'Namita Bhatt',
    email: 'namitabhatt@gmail.com',
    phone: '+91 6543210987',
    joinDate: '26 March 2025',
    status: 'inactive',
    verified: true,
    eventsAttended: 1,
    hoursLogged: 0,
  },

];

// Stats for the dashboard
const volunteerStats = [
  { title: 'Total Volunteers', count: 4, icon: <PeopleAltIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} /> },
  { title: 'Active Volunteers', count: 2, icon: <VerifiedIcon sx={{ fontSize: 40, color: '#4CAF50' }} /> },
  { title: 'Pending Verification', count: 0, icon: <VerifiedIcon sx={{ fontSize: 40, color: '#2196F3' }} /> },
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
      id={`volunteer-tabpanel-${index}`}
      aria-labelledby={`volunteer-tab-${index}`}
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

export default function VolunteerManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete' | 'add'>('view');
  
  const open = Boolean(anchorEl);

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

  const handleSendMail = () => {
     axios.post('http://localhost:5000/auth/send_evs')
  }
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle volunteer menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, volunteerId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedVolunteer(volunteerId);
  };

  // Handle volunteer menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle action selection from menu
  const handleActionSelect = (action: 'view' | 'edit' | 'delete') => {
    setDialogType(action);
    setOpenDialog(true);
    handleMenuClose();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Handle add new volunteer
  const handleAddVolunteer = () => {
    setDialogType('add');
    setOpenDialog(true);
  };

  // Filter volunteers based on search and filter
  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    // Search filter
    const matchesSearch = 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      volunteer.status === filterStatus;
      
    return matchesSearch && matchesStatus;
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#9E9E9E';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  if (isLoading) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        {/* Header and Stats Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Volunteer Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all volunteers
            </Typography>
          </Box>
        </Box>

        {/* Table Section */}
        <Paper sx={{ flex: 1, overflow: 'hidden' }}>
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <TextField
              size="small"
              placeholder="Search volunteers..."
              sx={{ width: 300 }}
            />
            <Button
             onclick ={handleSendMail}
              variant="contained"
              startIcon={<DownloadIcon />}
              size="small"
            >
              Export
            </Button>
          </Box>
          
          <TableContainer sx={{ height: 'calc(100% - 52px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Events</TableCell>
                  <TableCell align="center">Hours</TableCell>
                  <TableCell padding="checkbox"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockVolunteers.map((volunteer) => (
                  <TableRow key={volunteer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 30, height: 30, mr: 1 }}>{volunteer.name[0]}</Avatar>
                        <Box>
                          {volunteer.name}
                          {volunteer.verified && (
                            <Chip
                              label="Verified"
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{volunteer.email}</TableCell>
                    <TableCell>{volunteer.phone}</TableCell>
                    <TableCell>{volunteer.joinDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={volunteer.status}
                        color={volunteer.status === 'Active' ? 'success' : 'default'}
                        size="small"
                        sx={{ height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="center">{volunteer.events}</TableCell>
                    <TableCell align="center">{volunteer.hours}</TableCell>
                    <TableCell padding="checkbox">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Layout>
  );
} 