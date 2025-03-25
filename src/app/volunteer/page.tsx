'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tab,
  Tabs,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

// Icons
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import TimerIcon from '@mui/icons-material/Timer';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';

import Layout from '../../components/layout/Layout';
import { RootState } from '../../redux/store';
import VolunteerCertificate from '@/components/certificates/VolunteerCertificate';
import { logout } from '@/redux/slices/authSlice';

// Mock event data
const mockUpcomingEvents = [
  {
    id: 'event-1',
    title: 'Community Garden Cleanup',
    date: '2023-12-15T09:00:00',
    location: 'City Park',
    status: 'Registered',
    role: 'Team Leader',
    points: 50,
  },
  {
    id: 'event-2',
    title: 'Charity Run for Disability Awareness',
    date: '2023-12-20T08:00:00',
    location: 'Downtown',
    status: 'Registered',
    role: 'Event Support',
    points: 35,
  },
];

const mockPastEvents = [
  {
    id: 'event-3',
    title: 'Art Workshop for Children',
    date: '2023-11-10T10:00:00',
    location: 'Community Center',
    status: 'Completed',
    role: 'Instructor',
    points: 75,
    hours: 4,
    certificateAvailable: true,
  },
  {
    id: 'event-4',
    title: 'Tech Accessibility Seminar',
    date: '2023-10-25T15:00:00',
    location: 'Public Library',
    status: 'Completed',
    role: 'Assistant',
    points: 40,
    hours: 3,
    certificateAvailable: true,
  },
  {
    id: 'event-5',
    title: 'Music Festival for All',
    date: '2023-09-18T12:00:00',
    location: 'Riverside Park',
    status: 'Completed',
    role: 'Event Support',
    points: 60,
    hours: 6,
    certificateAvailable: true,
  },
];

// Mock achievements/badges
const mockAchievements = [
  {
    id: 'achievement-1',
    title: 'First Timer',
    description: 'Completed your first volunteer event',
    dateEarned: '2023-09-20',
    icon: '🌟',
  },
  {
    id: 'achievement-2',
    title: '10 Hour Club',
    description: 'Accumulated 10+ volunteer hours',
    dateEarned: '2023-10-15',
    icon: '⏱️',
  },
  {
    id: 'achievement-3',
    title: 'Dedicated Volunteer',
    description: 'Volunteered at 3 different events',
    dateEarned: '2023-11-05',
    icon: '🏆',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'upcoming', 'past', 'achievements'
  const [isLoading, setIsLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<string | null>(null);
  
  // Calculate total points and hours
  const totalPoints = mockPastEvents.reduce((sum, event) => sum + event.points, 0) +
                      mockUpcomingEvents.reduce((sum, event) => sum + event.points, 0);
  const totalHours = mockPastEvents.reduce((sum, event) => sum + event.hours, 0);
  
  // Calculate level based on points
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsToNextLevel = level * 100 - totalPoints;
  const levelProgress = (totalPoints % 100) / 100 * 100;

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Handle Get Certificate
  const handleGetCertificate = (eventId: string) => {
    setCurrentEventId(eventId);
    setShowCertModal(true);
  };
  
  // Handle certificate download
  const handleCertificateDownload = () => {
    if (!currentEventId) return;
    
    setCertificateLoading('download');
    // Simulate download
    setTimeout(() => {
      alert(`Certificate for event ${currentEventId} downloaded successfully!`);
      setCertificateLoading(null);
    }, 1000);
  };
  
  // Handle email certificate
  const handleEmailCertificate = () => {
    if (!currentEventId) return;
    
    setCertificateLoading('email');
    // Simulate email sending
    setTimeout(() => {
      alert(`Certificate for event ${currentEventId} has been emailed to ${user?.email}`);
      setCertificateLoading(null);
    }, 1000);
  };
  
  // Close certificate modal
  const handleCloseCertModal = () => {
    setShowCertModal(false);
    setCurrentEventId(null);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
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
        <Grid container spacing={4}>
          {/* Volunteer Info Summary */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2193b0, #6dd5ed)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Decorative elements */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  left: -20, 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.1)' 
                }} 
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -30, 
                  right: -30, 
                  width: 150, 
                  height: 150, 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.1)' 
                }} 
              />
              <Grid container spacing={3} alignItems="center" sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} sm={2}>
                  <Avatar
                    src={user?.photoURL || ''}
                    alt={user?.displayName}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto',
                      border: '4px solid white',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                    Welcome, {user?.displayName}!
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Thank you for your dedication to volunteering. Your contributions make a real difference!
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      icon={<VerifiedIcon />}
                      label="Verified Volunteer"
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                    <Chip
                      icon={<StarIcon />}
                      label={`Level ${level}`}
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                    <Chip
                      icon={<VolunteerActivismIcon />}
                      label={`${totalPoints} Points`}
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                    <Chip
                      icon={<TimerIcon />}
                      label={`${totalHours} Hours`}
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      mt: 2,
                      borderRadius: 8,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Logout
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                    <Typography variant="subtitle2" gutterBottom color="white" fontWeight="bold">
                      Level Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="white" sx={{ mr: 1 }}>
                        {totalPoints % 100}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={levelProgress}
                        sx={{ 
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.3)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: 'white'
                          }
                        }}
                      />
                      <Typography variant="body2" color="white" sx={{ ml: 1 }}>
                        100
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                      {pointsToNextLevel} points to level {level + 1}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Section Navigation Bubbles */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => handleSectionChange('dashboard')}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 3,
                  bgcolor: activeSection === 'dashboard' ? '#FF5722' : 'rgba(255, 87, 34, 0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#FF5722' },
                  boxShadow: activeSection === 'dashboard' ? '0 4px 10px rgba(255, 87, 34, 0.4)' : 'none',
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSectionChange('upcoming')}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 3,
                  bgcolor: activeSection === 'upcoming' ? '#4CAF50' : 'rgba(76, 175, 80, 0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#4CAF50' },
                  boxShadow: activeSection === 'upcoming' ? '0 4px 10px rgba(76, 175, 80, 0.4)' : 'none',
                }}
              >
                Upcoming Events
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSectionChange('past')}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 3,
                  bgcolor: activeSection === 'past' ? '#2196F3' : 'rgba(33, 150, 243, 0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#2196F3' },
                  boxShadow: activeSection === 'past' ? '0 4px 10px rgba(33, 150, 243, 0.4)' : 'none',
                }}
              >
                Past Events
              </Button>
              <Button
                variant="contained"
                onClick={() => handleSectionChange('achievements')}
                sx={{
                  borderRadius: 8,
                  py: 1.5,
                  px: 3,
                  bgcolor: activeSection === 'achievements' ? '#9C27B0' : 'rgba(156, 39, 176, 0.7)',
                  color: 'white',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#9C27B0' },
                  boxShadow: activeSection === 'achievements' ? '0 4px 10px rgba(156, 39, 176, 0.4)' : 'none',
                }}
              >
                Achievements
              </Button>
            </Box>
          </Grid>

          {/* Section Content */}
          <Grid item xs={12}>
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="#FF5722">
                      {mockPastEvents.length + mockUpcomingEvents.length}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Events
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                      {totalHours}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Hours
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="#2196F3">
                      {totalPoints}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Points
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom sx={{ mt: 4, color: "#9C27B0", fontWeight: "bold" }}>
                  Quick Actions
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<CalendarTodayIcon />}
                      onClick={() => router.push('/calendar')}
                      sx={{ 
                        borderRadius: 8,
                        py: 1.5,
                        bgcolor: '#FF9800',
                        '&:hover': { bgcolor: '#F57C00' },
                      }}
                    >
                      Event Calendar
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<GroupsIcon />}
                      onClick={() => router.push('/leaderboard')}
                      sx={{ 
                        borderRadius: 8,
                        py: 1.5,
                        bgcolor: '#9C27B0',
                        '&:hover': { bgcolor: '#7B1FA2' },
                      }}
                    >
                      Leaderboard
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<TimerIcon />}
                      onClick={() => router.push('/volunteer/log-hours')}
                      sx={{ 
                        borderRadius: 8,
                        py: 1.5,
                        bgcolor: '#2196F3',
                        '&:hover': { bgcolor: '#1976D2' },
                      }}
                    >
                      Log Volunteer Hours
                    </Button>
                  </Grid>
                </Grid>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 4, color: "#FF5722", fontWeight: "bold" }}>
                  Recent Activity
                </Typography>
                
                <Grid container spacing={3}>
                  {mockPastEvents.slice(0, 2).map((event) => (
                    <Grid item xs={12} sm={6} key={event.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 3,
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                            {event.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip
                              label={`+${event.points} Points`}
                              size="small"
                              sx={{ bgcolor: '#FF5722', color: 'white' }}
                            />
                            <Chip
                              label={`${event.hours} Hours`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarTodayIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {format(new Date(event.date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                            <Typography variant="body2">
                              {event.location}
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            component={Link}
                            href={`/events/${event.id}`}
                            sx={{ 
                              borderRadius: 8,
                              color: '#2196F3',
                              fontWeight: 'bold',
                              '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                            }}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Upcoming Events Section */}
            {activeSection === 'upcoming' && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="#4CAF50">
                  Your Upcoming Volunteer Opportunities
                </Typography>

                {mockUpcomingEvents.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    You haven't registered for any upcoming volunteer opportunities yet.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {mockUpcomingEvents.map((event) => (
                      <Grid item xs={12} sm={6} key={event.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            border: '1px solid #e0e0e0',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {event.title}
                            </Typography>
                            <Chip
                              label={`+${event.points} Points`}
                              size="small"
                              sx={{ mb: 2, bgcolor: '#4CAF50', color: 'white', fontWeight: 'medium' }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarTodayIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {format(new Date(event.date), 'MMMM dd, yyyy')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTimeFilledIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {format(new Date(event.date), 'h:mm a')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <WorkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                Role: {event.role}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                Status: {event.status}
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                            <Button
                              size="small"
                              component={Link}
                              href={`/events/${event.id}`}
                              sx={{ 
                                borderRadius: 8,
                                color: '#4CAF50',
                                borderColor: '#4CAF50',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' }
                              }}
                              variant="outlined"
                            >
                              View Event
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    href="/events"
                    sx={{ 
                      borderRadius: 8,
                      py: 1.5,
                      px: 4,
                      bgcolor: '#4CAF50',
                      '&:hover': { bgcolor: '#3d8b40' }
                    }}
                  >
                    Find More Volunteer Opportunities
                  </Button>
                </Box>
              </Paper>
            )}

            {/* Past Events Section */}
            {activeSection === 'past' && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="#2196F3">
                  Your Volunteer History
                </Typography>

                {mockPastEvents.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    You haven't volunteered for any events yet.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {mockPastEvents.map((event) => (
                      <Grid item xs={12} sm={6} key={event.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {event.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip
                                label={`+${event.points} Points`}
                                size="small"
                                sx={{ bgcolor: '#2196F3', color: 'white', fontWeight: 'medium' }}
                              />
                              <Chip
                                label={`${event.hours} Hours`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#2196F3', color: '#2196F3' }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarTodayIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {format(new Date(event.date), 'MMMM dd, yyyy')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {event.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WorkIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                Role: {event.role}
                              </Typography>
                            </Box>
                          </CardContent>
                          <CardActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
                            <Button
                              size="small"
                              component={Link}
                              href={`/events/${event.id}`}
                              variant="outlined"
                              sx={{ 
                                borderRadius: 8,
                                color: '#2196F3',
                                borderColor: '#2196F3',
                                '&:hover': { 
                                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                                  borderColor: '#2196F3'
                                }
                              }}
                            >
                              View Event
                            </Button>
                            <Button
                              size="small"
                              component={Link}
                              href={`/events/${event.id}/feedback`}
                              variant="outlined"
                              sx={{ 
                                borderRadius: 8,
                                color: '#FF9800',
                                borderColor: '#FF9800',
                                '&:hover': { 
                                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                                  borderColor: '#FF9800'
                                }
                              }}
                            >
                              Feedback
                            </Button>
                            {event.certificateAvailable && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleGetCertificate(event.id)}
                                sx={{ 
                                  borderRadius: 8,
                                  color: '#9C27B0',
                                  borderColor: '#9C27B0',
                                  '&:hover': { 
                                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                                    borderColor: '#9C27B0'
                                  }
                                }}
                              >
                                Certificate
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            )}

            {/* Achievements Section */}
            {activeSection === 'achievements' && (
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" color="#9C27B0">
                  Your Achievements
                </Typography>

                {mockAchievements.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    You haven't earned any achievements yet. Keep volunteering to unlock them!
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {mockAchievements.map((achievement) => (
                      <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                            color: 'white',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                              {achievement.icon}
                            </Typography>
                            <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                              {achievement.title}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                              {achievement.description}
                            </Typography>
                            <Chip 
                              label={`Earned on ${format(new Date(achievement.dateEarned), 'MMM dd, yyyy')}`} 
                              size="small" 
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.3)', 
                                color: 'white',
                                fontWeight: 'medium'
                              }} 
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
                
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    variant="contained"
                    component={Link}
                    href="/leaderboard"
                    sx={{ 
                      borderRadius: 8,
                      py: 1.5,
                      px: 3,
                      bgcolor: '#9C27B0',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#7B1FA2' }
                    }}
                  >
                    View Volunteer Leaderboard
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
        
        {/* Certificate Modal */}
        <Dialog 
          open={showCertModal} 
          onClose={handleCloseCertModal}
          maxWidth="md"
          fullWidth
          aria-labelledby="certificate-dialog-title"
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle id="certificate-dialog-title" sx={{ textAlign: 'center', pb: 0 }}>
            <Typography variant="h5" component="div" fontWeight="bold">
              Volunteer Certificate
            </Typography>
            {currentEventId && (
              <Typography variant="body1" color="text.secondary">
                {mockPastEvents.find(e => e.id === currentEventId)?.title || ''}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              {currentEventId && (
                <VolunteerCertificate
                  open={true}
                  onClose={handleCloseCertModal}
                  eventData={{
                    title: mockPastEvents.find(e => e.id === currentEventId)?.title || '',
                    startDate: mockPastEvents.find(e => e.id === currentEventId)?.date || '',
                    endDate: mockPastEvents.find(e => e.id === currentEventId)?.date || '',
                    location: mockPastEvents.find(e => e.id === currentEventId)?.location || '',
                    organizerName: 'Samarthanam Trust',
                    category: 'Volunteer',
                    id: currentEventId,
                  }}
                  userData={{
                    name: user?.displayName || 'User',
                    email: user?.email || 'user@example.com',
                    volunteerHours: mockPastEvents.find(e => e.id === currentEventId)?.hours || 4,
                  }}
                  certificateType="volunteer"
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCertificateDownload}
                disabled={certificateLoading === 'download'}
                sx={{ 
                  borderRadius: 8,
                  py: 1.5,
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#3d8b40' },
                }}
              >
                {certificateLoading === 'download' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Download PDF'
                )}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleEmailCertificate}
                disabled={certificateLoading === 'email'}
                sx={{ 
                  borderRadius: 8,
                  py: 1.5,
                  bgcolor: '#2196F3',
                  '&:hover': { bgcolor: '#1976d2' },
                }}
              >
                {certificateLoading === 'email' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send to Email'
                )}
              </Button>
            </Box>
            <Button
              variant="outlined"
              onClick={handleCloseCertModal}
              sx={{ 
                borderRadius: 8,
                width: '100%'
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
} 