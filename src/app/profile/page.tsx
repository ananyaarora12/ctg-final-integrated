'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  IconButton,
  Modal,
  Rating,
  TextField,
  Link
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Layout from '../../components/layout/Layout';
import { Link as NextLink } from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../../redux/slices/userSlice';
import { logout } from '../../redux/slices/authSlice';
import { sampleEvents } from '../events/page';
import { format, parseISO } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VolunteerCertificate from '@/components/certificates/VolunteerCertificate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import { calculateEventStatus } from '../events/page';
import { Event, EventsByStatus } from '../../types/events';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

// Interface matching the one in userSlice.ts
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: number;
  points: number;
  level: number;
  nextLevelPoints: number;
  badgesEarned: string[];
  badges: Badge[];
  eventsAttended: string[];
  eventsRegistered: string[];
  hoursVolunteered: number;
  stats: {
    totalEvents: number;
    totalHours: number;
    categoryDistribution: CategoryCount[];
    monthlyActivity: MonthlyActivity[];
  };
}

interface CategoryCount {
  name: string;
  count: number;
}

interface MonthlyActivity {
  month: string;
  hours: number;
}

// Mock past events
const pastEvents = [
  {
    id: 'event1',
    title: 'Beach Cleanup Drive',
    date: '2023-06-15',
    category: 'Environment',
    hours: 4,
    points: 120,
    role: 'Volunteer',
  },
  {
    id: 'event2',
    title: 'Food Distribution',
    date: '2023-07-22',
    category: 'Community',
    hours: 3,
    points: 90,
    role: 'Team Lead',
  },
  {
    id: 'event3',
    title: 'Tree Plantation Drive',
    date: '2023-08-10',
    category: 'Environment',
    hours: 5,
    points: 150,
    role: 'Volunteer',
  },
];

// Mock upcoming events
const upcomingEvents = [
  {
    id: 'event4',
    title: 'Coding Workshop for Kids',
    date: '2023-10-15',
    category: 'Education',
    hours: 3,
    role: 'Mentor',
  },
  {
    id: 'event5',
    title: 'Charity Run',
    date: '2023-11-05',
    category: 'Health',
    hours: 4,
    role: 'Participant',
  },
];

// Mock API call
const mockFetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock user profile data matching the userSlice's UserProfile interface
  return {
    id: userId,
    displayName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    photoURL: '',
    phoneNumber: '+91 9876543210',
    createdAt: Date.now() - 7890000000, // About 3 months ago
    points: 720,
    level: 4,
    nextLevelPoints: 180,
    badgesEarned: ['badge1', 'badge2', 'badge3', 'badge4', 'badge6'],
    badges: [
      {
        id: 'badge1',
        name: 'Environmental Protector',
        description: 'Participated in 5+ environmental events',
        icon: '🌱',
        earnedDate: '2023-06-15',
      },
      {
        id: 'badge2',
        name: 'Community Champion',
        description: 'Completed 10+ community events',
        icon: '🏆',
        earnedDate: '2023-07-22',
      },
      {
        id: 'badge3',
        name: 'Team Leader',
        description: 'Led a team in 3+ events',
        icon: '👑',
        earnedDate: '2023-08-10',
      },
      {
        id: 'badge4',
        name: 'Marathon Volunteer',
        description: 'Volunteered for over 40 hours',
        icon: '⏱️',
        earnedDate: '2023-09-05',
      },
      {
        id: 'badge5',
        name: 'Versatile Volunteer',
        description: 'Participated in 5+ different categories',
        icon: '🌈',
        earnedDate: '',
      },
      {
        id: 'badge6',
        name: 'Dedicated Member',
        description: 'Active for over 6 months',
        icon: '📅',
        earnedDate: '2023-09-30',
      },
    ],
    eventsAttended: ['event1', 'event2', 'event3'],
    eventsRegistered: ['event4', 'event5'],
    hoursVolunteered: 42,
    stats: {
      totalEvents: 10,
      totalHours: 42,
      categoryDistribution: [
        { name: 'Environment', count: 30 },
        { name: 'Education', count: 25 },
        { name: 'Community', count: 20 },
        { name: 'Health', count: 15 },
        { name: 'Arts', count: 10 },
      ],
      monthlyActivity: [
        { month: '2023-01', hours: 3 },
        { month: '2023-02', hours: 5 },
        { month: '2023-03', hours: 0 },
        { month: '2023-04', hours: 7 },
        { month: '2023-05', hours: 3 },
        { month: '2023-06', hours: 5 },
        { month: '2023-07', hours: 8 },
        { month: '2023-08', hours: 4 },
        { month: '2023-09', hours: 7 },
      ],
    },
  };
};

// Badge interface
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
}

// Tab Panel Component
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

// Event card component with better error handling for images
const EventCard = ({ event, status }: { event: any, status: string }) => {
  const [imageError, setImageError] = useState(false);
  
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming': return 'green';
      case 'ongoing': return 'orange';
      case 'completed': return 'grey';
      default: return 'primary.main';
    }
  };
  
  const getDefaultImage = () => {
    // Default images based on event category or a generic one
    const category = event.category || 'other';
    
    switch (category.toLowerCase()) {
      case 'education': return '/images/education.jpg';
      case 'environment': return '/images/environment.jpg';
      case 'health': return '/images/health.jpg';
      case 'community': return '/images/community.jpg';
      case 'animals': return '/images/animals.jpg';
      default: return '/images/default-event.jpg';
    }
  };
  
  return (
    <Card sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      border: `2px solid ${getStatusColor()}`,
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {event.title || "Untitled Event"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {event.location || "Location not specified"}
        </Typography>
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          size="small" 
          sx={{ 
            bgcolor: getStatusColor(), 
            color: 'white',
            mb: 1
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mt: 1
        }}>
          {event.description || "No description available"}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={NextLink} href={`/events/${event.id}`}>
          View Details
        </Button>
        {status === 'completed' && (
          <Button size="small" color="secondary">
            Provide Feedback
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { profile: userProfile, loading, error } = useSelector((state: RootState) => state.user);
  const [activeSection, setActiveSection] = useState('overview');
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [openCertModal, setOpenCertModal] = useState(false);
  const [userEvents, setUserEvents] = useState<EventsByStatus>({ 
    upcoming: [], 
    ongoing: [], 
    completed: [] 
  });
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Refs for focus management
  const modalRef = React.useRef<HTMLDivElement>(null);
  const returnFocusRef = React.useRef<HTMLButtonElement | null>(null);
  
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  // Handle logout
  const handleLogout = () => {
    const logoutUser = async () => {
      try {
        const apiClient = (await import('../../utils/api')).default;
        await apiClient.auth.logout();
        
        // Dispatch logout action to Redux
        dispatch(logout());
        
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    logoutUser();
  };
  
  // Handle Get Certificate
  const handleGetCertificate = (eventId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    // Store the button that was clicked to return focus later
    returnFocusRef.current = event.currentTarget;
    setSelectedEvent(eventId);
    
    setOpenCertModal(true);
  };
  
  // Handle certificate download
  const handleCertificateDownload = () => {
    if (!selectedEvent) return;
    
    setOpenCertModal(false);
    // Simulate download
    setTimeout(() => {
      alert(`Certificate for event ${selectedEvent} downloaded successfully!`);
    }, 1000);
  };
  
  // Modal handler for sending certificate via email
  const handleEmailCertificate = () => {
    // Simulate email sending
    axios.post('http://localhost:5000/auth/send_attachment')
    .then((response) => {
      console.log(response);
    })
    setTimeout(() => {
      alert(`Certificate for event ${selectedEvent} has been emailed to ${userProfile.email}`);
    }, 1000);
    handleCloseCertModal();
  };
  
  // Close certificate modal
  const handleCloseCertModal = () => {
    setOpenCertModal(false);
    setSelectedEvent(null);
    // Return focus to the button that opened the modal
    if (returnFocusRef.current) {
      setTimeout(() => {
        returnFocusRef.current?.focus();
      }, 0);
    }
  };
  
  // Add feedback submit handler here
  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      alert('Please select a rating');
      return;
    }
    
    setSubmittingFeedback(true);
    
    try {
      // In a real app, you would call your API to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Feedback submitted:', {
        eventId: selectedEvent,
        rating: feedbackRating,
        feedback: feedbackText
      });
      
      // Reset form and close modal
      setFeedbackText('');
      setFeedbackRating(0);
      setOpenFeedbackModal(false);
      alert('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };
  
  // Handle escape key for modal
  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCloseCertModal();
    }
  };
  
  // Focus the modal when it opens
  useEffect(() => {
    if (openCertModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [openCertModal]);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // If we have user data, but profile data is not loaded yet
    if (user && Object.keys(userProfile).length === 0) {
      dispatch(fetchUserProfile());
    }
    
    // Fetch registered events data
    const getRegisteredEvents = async () => {
      if (user?.registeredEvents && user.registeredEvents.length > 0) {
        setLoadingEvents(true);
        try {
          const eventsByStatus = await fetchUserEvents(user.registeredEvents);
          setUserEvents(eventsByStatus);
        } catch (error) {
          console.error('Error fetching user events:', error);
        } finally {
          setLoadingEvents(false);
        }
      }
    };
    
    getRegisteredEvents();
  }, [isAuthenticated, router, user, dispatch, userProfile]);
  
  const calculateCategoryDistribution = (events: any[]) => {
    const categories: {[key: string]: number} = {};
    
    events.forEach(event => {
      const category = event.category;
      if (category) {
        categories[category] = (categories[category] || 0) + 1;
      }
    });
    
    return Object.keys(categories).map(name => ({
      name,
      count: categories[name]
    }));
  };
  
  const calculateMonthlyActivity = (events: any[]) => {
    const months: {[key: string]: number} = {};
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' });
      months[monthName] = 0;
    }
    
    // Count hours for each month
    events.forEach(event => {
      if (event.start_date) {
        const eventDate = new Date(event.start_date);
        const monthName = eventDate.toLocaleDateString('en-US', { month: 'short' });
        
        // Only count events in the last 6 months
        const eventMonth = eventDate.getMonth();
        const eventYear = eventDate.getFullYear();
        const monthsAgo = (currentYear - eventYear) * 12 + (currentMonth - eventMonth);
        
        if (monthsAgo >= 0 && monthsAgo < 6) {
          months[monthName] += event.hours_required || 0;
        }
      }
    });
    
    // Convert to array format
    return Object.keys(months).map(month => ({
      month,
      hours: months[month]
    })).reverse(); // Show oldest to newest
  };

  // Get user's registered events
  const registeredEvents = React.useMemo(() => {
    // Sample upcoming events for demonstration
    const sampleUpcomingEvents = [
      {
        id: 'event1',
        title: 'Community Garden Cleanup',
        startDate: '2023-12-15T09:00:00',
        endDate: '2023-12-15T12:00:00',
        location: 'City Park',
        category: 'Environment',
        status: 'upcoming',
        description: 'Join us for a community garden cleanup event.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: false
      },
      {
        id: 'event2',
        title: 'Charity Run for Disability Awareness',
        startDate: '2023-12-20T08:00:00',
        endDate: '2023-12-20T11:00:00',
        location: 'Downtown',
        category: 'Health',
        status: 'upcoming',
        description: 'A charity run to raise awareness for disability rights.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: false
      },
      {
        id: 'event3',
        title: 'Holiday Food Drive',
        startDate: '2023-12-22T10:00:00',
        endDate: '2023-12-22T14:00:00',
        location: 'Community Center',
        category: 'Community',
        status: 'upcoming',
        description: 'Help collect food donations for those in need during the holidays.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: false
      }
    ];
    
    // Return sample events for demonstration
    return sampleUpcomingEvents;
    
    /* Uncomment this for real implementation
    if (!authUser?.registeredEvents || authUser.registeredEvents.length === 0) return [];
    
    // Filter the sampleEvents array to get only the events the user is registered for
    return sampleEvents.filter(event => 
      authUser.registeredEvents?.includes(event.id) && 
      // Only show upcoming and ongoing events
      (event.status === 'upcoming' || event.status === 'ongoing')
    );
    */
  }, []);

  // Get user's attended past events
  const attendedEvents = React.useMemo(() => {
    // Sample past events for demonstration
    const samplePastEvents = [
      {
        id: 'past1',
        title: 'Tech Workshop for Visually Impaired',
        startDate: '2023-11-15T09:00:00',
        endDate: '2023-11-15T14:00:00',
        location: 'Samarthanam Training Center',
        category: 'Education',
        status: 'completed',
        description: 'A workshop on assistive technologies for the visually impaired.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: true
      },
      {
        id: 'past2',
        title: 'Annual Charity Concert',
        startDate: '2023-10-25T18:00:00',
        endDate: '2023-10-25T21:00:00',
        location: 'City Auditorium',
        category: 'Arts',
        status: 'completed',
        description: 'Annual fundraising concert featuring performances by artists with disabilities.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: true
      },
      {
        id: 'past3',
        title: 'Inclusive Sports Day',
        startDate: '2023-09-05T09:00:00',
        endDate: '2023-09-05T17:00:00',
        location: 'Sports Complex',
        category: 'Sports',
        status: 'completed',
        description: 'A day of inclusive sports activities for people of all abilities.',
        image: '/images/placeholder.jpg',
        organizerName: 'Samarthanam Trust',
        certificateAvailable: true
      }
    ];
    
    // Return sample events for demonstration
    return samplePastEvents;
    
    /* Uncomment this for real implementation
    if (!user?.eventsAttended || user.eventsAttended.length === 0) return [];
    
    // Filter the sampleEvents array to get only the events the user has attended
    return sampleEvents.filter(event => 
      user.eventsAttended?.includes(event.id) && 
      // Only show completed events
      event.status === 'completed'
    );
    */
  }, []);
  
  // Get past events for certificate modal
  const pastEvents = React.useMemo(() => {
    // Just reuse the attended events for demonstration
    return attendedEvents;
    
    /* Uncomment this for real implementation
    return sampleEvents.filter(event => event.status === 'completed');
    */
  }, [attendedEvents]);
  
  // Function to fetch user events
  const fetchUserEvents = async (eventIds: string[]) => {
    if (!eventIds || eventIds.length === 0) {
      console.log("No registered events found");
      return { upcoming: [], ongoing: [], completed: [] };
    }
    
    setLoadingEvents(true);
    
    try {
      const apiClient = (await import('../../utils/api')).default;
      const fetchedEvents: Event[] = [];
      
      // Fetch each event individually
      await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            const response = await apiClient.events.getEventById(eventId);
            const apiEvent = response.data.event || response.data;
            
            // Map API event to match our frontend structure
            if (apiEvent) {
              const formattedEvent: Event = {
                id: apiEvent.event_id,
                title: apiEvent.event_name,
                description: apiEvent.description,
                image: apiEvent.event_image,
                imageUrl: apiEvent.event_image,
                startDate: apiEvent.start_date,
                endDate: apiEvent.end_date,
                location: apiEvent.location,
                category: apiEvent.category,
                status: calculateEventStatus(apiEvent.start_date, apiEvent.end_date),
                participantsLimit: apiEvent.participant_limit,
                currentParticipants: apiEvent.participants ? apiEvent.participants.length : 0,
                participants: apiEvent.participants || [],
                pointsAwarded: apiEvent.points_awarded || 0,
              };
              fetchedEvents.push(formattedEvent);
            }
          } catch (error) {
            console.error(`Failed to fetch event ${eventId}:`, error);
          }
        })
      );
      
      // Categorize events by status
      const categorizedEvents: EventsByStatus = {
        upcoming: fetchedEvents.filter(e => e.status === 'upcoming'),
        ongoing: fetchedEvents.filter(e => e.status === 'ongoing'),
        completed: fetchedEvents.filter(e => e.status === 'completed'),
      };
      
      console.log("Fetched and categorized events:", categorizedEvents);
      setLoadingEvents(false);
      return categorizedEvents;
      
    } catch (error) {
      console.error("Error fetching user events:", error);
      setLoadingEvents(false);
      return { upcoming: [], ongoing: [], completed: [] };
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error || !userProfile) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
            <Typography variant="h5" component="h1" gutterBottom>
              {error || 'Failed to load profile data'}
            </Typography>
            {!isAuthenticated && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => router.push('/login?redirect=/profile')}
                sx={{ mt: 2 }}
              >
                Login to View Profile
              </Button>
            )}
          </Box>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Profile Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #3498db 0%, #1976d2 100%)',
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
          
          <Box sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Avatar 
              src={userProfile.photoURL} 
              alt={userProfile.displayName}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                border: '4px solid white',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}
            />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {userProfile.displayName}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ opacity: 0.9 }}>
              {userProfile.email}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Verified Participant`} 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              />
              <Chip 
                label={`${attendedEvents.length} Events Attended`} 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              />
              <Chip 
                label={`${attendedEvents.length} Certificates`} 
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
          </Box>
        </Paper>
        
        {/* Welcome Message */}
        <Paper
          elevation={2}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: '#f8f9fa'
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Welcome, {userProfile.displayName}!
          </Typography>
          <Typography variant="body1" paragraph>
            This is your participant dashboard where you can track your registered events, view your participation history, and download certificates.
          </Typography>
        </Paper>
        
        {/* Section Navigation Bubbles */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={() => handleSectionChange('overview')}
            sx={{
              borderRadius: 8,
              py: 1.5,
              px: 3,
              bgcolor: activeSection === 'overview' ? '#3498db' : 'rgba(52, 152, 219, 0.7)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#2980b9' },
              boxShadow: activeSection === 'overview' ? '0 4px 10px rgba(52, 152, 219, 0.4)' : 'none',
            }}
          >
            Overview
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
              '&:hover': { bgcolor: '#3d8b40' },
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
              bgcolor: activeSection === 'past' ? '#9C27B0' : 'rgba(156, 39, 176, 0.7)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#7b1fa2' },
              boxShadow: activeSection === 'past' ? '0 4px 10px rgba(156, 39, 176, 0.4)' : 'none',
            }}
          >
            Past Events
          </Button>
        </Box>
        
        {/* Section Content */}
        <Box sx={{ mb: 4 }}>
          {/* Dashboard Section */}
          {activeSection === 'overview' && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="#3498db">
                    {registeredEvents.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Upcoming Events
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                    {attendedEvents.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Events Attended
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="#9C27B0">
                    {attendedEvents.length}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Certificates
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="#3498db">
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Member Since
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {userProfile.phoneNumber || 'Not provided'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      Verified Participant
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/events"
                  sx={{ 
                    borderRadius: 8,
                    py: 1.5,
                    px: 4,
                    bgcolor: '#3498db',
                    '&:hover': { bgcolor: '#2980b9' }
                  }}
                >
                  Browse Events
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* My Events Section */}
          {activeSection === 'events' && (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                Your Events
              </Typography>
              
              {/* Upcoming Events */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Upcoming Events
                </Typography>
                {loadingEvents ? (
                  <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                  </Box>
                ) : userEvents.upcoming.length > 0 ? (
                  <Grid container spacing={3}>
                    {userEvents.upcoming.map((event: any) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <EventCard event={event} status="upcoming" />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                    <Typography variant="body1">No upcoming events found</Typography>
                  </Paper>
                )}
              </Box>
              
              {/* Ongoing Events */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Ongoing Events
                </Typography>
                {loadingEvents ? (
                  <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                  </Box>
                ) : userEvents.ongoing.length > 0 ? (
                  <Grid container spacing={3}>
                    {userEvents.ongoing.map((event: any) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <EventCard event={event} status="ongoing" />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                    <Typography variant="body1">No ongoing events found</Typography>
                  </Paper>
                )}
              </Box>
              
              {/* Past Events */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Past Events
                </Typography>
                {loadingEvents ? (
                  <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                  </Box>
                ) : userEvents.completed.length > 0 ? (
                  <Grid container spacing={3}>
                    {userEvents.completed.map((event: any) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <EventCard event={event} status="completed" />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
                    <Typography variant="body1">No past events found</Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          )}
        </Box>
        
        {/* Certificate Modal */}
        <Dialog 
          open={openCertModal} 
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
              Participation Certificate
            </Typography>
            {selectedEvent && (
              <Typography variant="body1" color="text.secondary">
                {findEventById(selectedEvent, pastEvents)?.title || ''}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <VolunteerCertificate
                open={true}
                onClose={handleCloseCertModal}
                eventData={{
                  title: selectedEvent ? findEventById(selectedEvent, pastEvents)?.title || '' : '',
                  startDate: selectedEvent ? findEventById(selectedEvent, pastEvents)?.startDate || '' : '',
                  endDate: selectedEvent ? findEventById(selectedEvent, pastEvents)?.endDate || '' : '',
                  location: selectedEvent ? findEventById(selectedEvent, pastEvents)?.location || '' : '',
                  organizerName: 'Samarthanam Trust',
                  category: selectedEvent ? findEventById(selectedEvent, pastEvents)?.category || '' : '',
                  id: selectedEvent || '',
                }}
                userData={{
                  name: userProfile?.displayName || 'User',
                  email: userProfile?.email || 'user@example.com',
                  volunteerHours: 0, // Not relevant for participants
                }}
                certificateType="participant"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCertificateDownload}
                disabled={openCertModal}
                sx={{ 
                  borderRadius: 8,
                  py: 1.5,
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#3d8b40' },
                }}
              >
                Download PDF
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleEmailCertificate}
                disabled={openCertModal}
                sx={{ 
                  borderRadius: 8,
                  py: 1.5,
                  bgcolor: '#3498db',
                  '&:hover': { bgcolor: '#2980b9' },
                }}
              >
                Send to Email
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
        
        {/* Feedback Modal */}
        <Dialog
          open={openFeedbackModal}
          onClose={() => setOpenFeedbackModal(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="feedback-dialog-title"
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle id="feedback-dialog-title" sx={{ textAlign: 'center', pb: 0 }}>
            <Typography variant="h5" component="div" fontWeight="bold">
              Event Feedback
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Share your experience
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 2 }}>
              <Typography gutterBottom>Rating</Typography>
              <Rating
                name="feedback-rating"
                value={feedbackRating}
                onChange={(_, newValue) => setFeedbackRating(newValue || 0)}
                precision={1}
                size="large"
              />
            </Box>
            
            <TextField
              label="Your Feedback"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us about your experience..."
              sx={{ mb: 3 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback}
                startIcon={submittingFeedback ? <CircularProgress size={20} /> : null}
                sx={{ 
                  borderRadius: 8,
                  py: 1.5,
                  bgcolor: '#4CAF50',
                  '&:hover': { bgcolor: '#3d8b40' },
                }}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </Box>
            <Button
              variant="outlined"
              onClick={() => setOpenFeedbackModal(false)}
              disabled={submittingFeedback}
              sx={{ 
                borderRadius: 8,
                width: '100%'
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ProfilePage;

// Helper function to find event by ID
function findEventById(id: string, events: any[]) {
  return events.find(event => event.id === id) || null;
} 