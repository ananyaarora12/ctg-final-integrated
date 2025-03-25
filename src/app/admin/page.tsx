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
  IconButton,
  Button,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import { RootState } from '../../redux/store';
import { THEME_COLORS } from '../../components/layout/Layout';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MessageIcon from '@mui/icons-material/Message';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

// Recent Activities
const recentActivities = [
  { action: 'New volunteer registration', name: 'Priya Sharma', time: '15 minutes ago' },
  { action: 'Event registration', name: 'Blind Cricket Tournament', time: '1 hour ago' },
  { action: 'Donation received', name: 'Suresh Patel - ₹5,000', time: '2 hours ago' },
  { action: 'New feedback submitted', name: 'Tech Workshop Event', time: '3 hours ago' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = useState({
    volunteers: 0,
    activeEvents: 0,
    totalDonations: '₹0',
    engagementRate: '0%',
  });
  const [activities, setActivities] = useState([]);

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

    // Fetch dashboard data from backend
    const fetchDashboardData = async () => {
      try {
        const apiClient = (await import('../../utils/api')).default;
        
        // Get volunteers count
        const volunteersResponse = await apiClient.user.getAllUsers('volunteer');
        const volunteersCount = volunteersResponse.data.count || 0;
        
        // Get events data
        const eventsResponse = await apiClient.events.getAllEvents({ status: 'Upcoming' });
        const activeEventsCount = eventsResponse.data.events.length || 0;
        
        // Update stats
        setStats({
          volunteers: volunteersCount,
          activeEvents: activeEventsCount,
          totalDonations: '₹254,380', // Replace with real data when donation API is available
          engagementRate: '76%', // Calculate from participation data when available
        });
        
        // Set mock activities for now - will be replaced with real activity log later
        setActivities(recentActivities);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, router, user?.role]);

  // Update dashboard stats with real data
  const dashboardStats = [
    { title: 'Total Volunteers', count: stats.volunteers, icon: <PeopleAltIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />, link: '/admin/volunteers' },
    { title: 'Active Events', count: stats.activeEvents, icon: <EventIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />, link: '/admin/events' },
    { title: 'Total Donations', count: stats.totalDonations, icon: <MonetizationOnIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />, link: '/admin/donations' },
    { title: 'Engagement Rate', count: stats.engagementRate, icon: <BarChartIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />, link: '/admin/reports' },
  ];

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
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user?.displayName || 'Admin'}! Here's an overview of your organization.
          </Typography>
        </Box>

        {/* Dashboard Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardStats.map((stat, index) => (
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
                    {stat.count}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Button 
                    component={Link} 
                    href={stat.link}
                    size="small" 
                    sx={{ mt: 2, color: THEME_COLORS.orange }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Admin Menu */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Manage Organization
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/events"
                    variant="outlined" 
                    startIcon={<EventIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Events Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/volunteers"
                    variant="outlined" 
                    startIcon={<VolunteerActivismIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Volunteer Management
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/donations"
                    variant="outlined" 
                    startIcon={<MonetizationOnIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Donation Insights
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/messaging"
                    variant="outlined" 
                    startIcon={<MessageIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Messaging
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/feedback"
                    variant="outlined" 
                    startIcon={<BarChartIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Feedback Insights
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button 
                    component={Link}
                    href="/admin/reports"
                    variant="outlined" 
                    startIcon={<AssessmentIcon />}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      p: 1.5,
                      mb: 2,
                      borderColor: THEME_COLORS.orange,
                      color: THEME_COLORS.offBlack,
                      '&:hover': {
                        borderColor: THEME_COLORS.orange,
                        backgroundColor: 'rgba(255,122,48,0.08)',
                      }
                    }}
                  >
                    Reports
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <IconButton size="small">
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
              {activities.map((activity, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    py: 1.5,
                    borderBottom: index !== activities.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      mr: 2, 
                      bgcolor: THEME_COLORS.orange 
                    }}
                    alt={activity.name.split(' ')[0][0]}
                  >
                    {activity.name.split(' ')[0][0]}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {activity.name} • {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  size="small" 
                  sx={{ color: THEME_COLORS.orange }}
                  component={Link}
                  href="/admin/activities"
                >
                  View All Activities
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
} 