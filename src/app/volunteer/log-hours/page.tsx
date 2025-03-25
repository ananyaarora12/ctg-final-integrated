'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  List,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Layout from '../../../components/layout/Layout';
import { sampleEvents } from '../../events/page';
import { RootState } from '../../../redux/store';
import { 
  addPointsStart, 
  addPointsSuccess, 
  completeEventStart,
  completeEventSuccess,
  completeEventFailure,
  earnBadgeStart,
  earnBadgeSuccess
} from '../../../redux/slices/userSlice';
import { updateUserPoints } from '../../../utils/pointsCalculator';

interface EventWithHours {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  image: string;
  status: 'completed';
  pointsAwarded: number;
  minHoursRequired: number;
  inputHours: number;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  successMessage?: string;
}

export default function LogHoursPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { profile, isLoading: profileLoading } = useSelector((state: RootState) => state.user);
  
  // Global styles for animations
  React.useEffect(() => {
    // Insert global keyframes for the pulse animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventWithHours[]>([]);
  
  useEffect(() => {
    // Only volunteers and admins can log hours
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'volunteer' && user?.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Fetch registered events that need hours to be logged
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Fetch real events from API
        const apiClient = (await import('../../../utils/api')).default;
        const response = await apiClient.events.getAllEvents();
        
        // Get user's events
        const userEventsResponse = await apiClient.user.getUserEvents();
        const userEventIds = userEventsResponse.data.events.map((event: any) => event.event_id);
        
        // Filter completed events the user has registered for
        let completedEvents = response.data.events.filter((event: any) => 
          userEventIds.includes(event.event_id) &&
          event.status.toLowerCase() === 'completed' &&
          event.publish_event === true
        );
        
        // Map to expected format
        let registeredCompletedEvents: EventWithHours[] = completedEvents.map((event: any) => ({
          id: event.event_id,
          title: event.event_name,
          description: event.description,
          image: event.event_image,
          startDate: event.start_date,
          endDate: event.end_date,
          location: event.location,
          category: event.category,
          status: 'completed',
          pointsAwarded: event.points_awarded,
          minHoursRequired: event.hours_required,
          inputHours: 0,
          submitting: false,
          submitted: false,
          error: null
        }));
        
        // If no registered events found, use sample data for demo purposes
        if (registeredCompletedEvents.length === 0) {
          console.log('No completed events found, using sample data');
          // Add sample completed events so users can see how the page works
          registeredCompletedEvents = [
            {
              id: '4', // Sports Day Volunteer from sampleEvents
              title: 'Sports Day Volunteer',
              description: 'Assist in organizing and running a sports day event for differently-abled children.',
              image: 'https://source.unsplash.com/random/400x200?sports',
              startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
              location: 'City Sports Complex, Bangalore',
              category: 'Sports',
              status: 'completed',
              pointsAwarded: 70,
              minHoursRequired: 7,
              inputHours: 0,
              submitting: false,
              submitted: false,
              error: null
            },
            // Add more sample events if needed
          ];
        }
        
        setEvents(registeredCompletedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [isAuthenticated, router, user]);
  
  const handleHoursChange = (id: string, hours: number) => {
    setEvents(events.map(event => 
      event.id === id ? { ...event, inputHours: hours } : event
    ));
  };
  
  // Add a new function to calculate earned points directly
  function calculatePointsForHours(hours: number, basePointsPerHour: number = 10): number {
    // Basic calculation: hours × points per hour
    return Math.floor(hours * basePointsPerHour);
  }
  
  const handleSubmitHours = async (id: string) => {
    // Find the event
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    // Update the event to show submitting state
    setEvents(prevEvents => prevEvents.map(e => 
      e.id === id ? { ...e, submitting: true, error: null } : e
    ));
    
    try {
      // Dispatch actions to update user points and stats
      dispatch(completeEventStart());
      
      // Check if hours are sufficient
      if (event.inputHours < event.minHoursRequired) {
        // If hours are insufficient, show warning but don't remove event
        setEvents(prevEvents => prevEvents.map(e => 
          e.id === id ? { 
            ...e, 
            submitting: false,
            error: `Minimum ${event.minHoursRequired} hours required for points. No points awarded.`,
            inputHours: 0 // Reset hours for retry
          } : e
        ));
        return;
      }
      
      // Calculate points earned directly
      const pointsEarned = calculatePointsForHours(event.inputHours);
      
      console.log("Submitting hours:", {
        eventId: event.id,
        hours: event.inputHours,
        pointsEarned
      });
      
      // Hours are sufficient, calculate points and update user profile
      if (profile) {
        // Log the completed event with the correct points
        dispatch(completeEventSuccess({
          eventId: event.id,
          hours: event.inputHours,
          category: event.category,
          earnedPoints: pointsEarned,
          completedDate: new Date().toISOString(),
          eventMonth: format(parseISO(event.startDate), 'MMM yyyy')
        }));
        
        // Update points in Redux
        const newTotalPoints = profile.points + pointsEarned;
        const currentLevel = profile.level;
        const pointsToNextLevel = 100 * (currentLevel + 1);
        
        dispatch(addPointsStart());
        dispatch(addPointsSuccess({
          points: newTotalPoints,
          newLevel: currentLevel,
          nextLevelPoints: pointsToNextLevel
        }));
        
        // Show success message but keep event in list
        const successMessage = `You've successfully logged ${event.inputHours} hours and earned ${pointsEarned} points!`;
        
        // Update UI to show success but keep event
        setEvents(prevEvents => prevEvents.map(e => 
          e.id === id ? { 
            ...e, 
            submitting: false,
            error: null,
            successMessage,
            inputHours: 0, // Reset hours for next submission
            submitted: false // Allow for resubmission
          } : e
        ));
        
        // Force refresh to update profile data
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // Handle case where profile is not loaded
        setEvents(prevEvents => prevEvents.map(e => 
          e.id === id ? { 
            ...e, 
            submitting: false, 
            error: 'Profile data not loaded. Please try again.',
            inputHours: 0 // Reset hours for retry
          } : e
        ));
      }
    } catch (err) {
      console.error("Error submitting hours:", err);
      // Handle error
      setEvents(prevEvents => prevEvents.map(e => 
        e.id === id ? { 
          ...e, 
          submitting: false, 
          error: 'Failed to submit hours',
          inputHours: 0 // Reset hours for retry
        } : e
      ));
      
      dispatch(completeEventFailure('Failed to log hours'));
    }
  };
  
  if (loading || profileLoading) {
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
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TimerIcon sx={{ fontSize: 36, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Log Your Volunteer Hours
            </Typography>
          </Box>
          
          <Typography variant="body1" paragraph>
            Log the hours you've volunteered for your completed events to earn points and move up the leaderboard.
            You'll need to meet the minimum required hours to earn points for an event.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>How Points Are Awarded</AlertTitle>
            You need to complete the minimum hours required for each event to earn points.
            Each volunteer hour is worth 10 base points, with potential bonuses for long events or special categories.
          </Alert>
        </Paper>
        
        {events.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No events to log hours for
            </Typography>
            <Typography variant="body1" paragraph>
              You don't have any completed events that need hours logged.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => router.push('/events')}
              sx={{ mt: 2 }}
            >
              Find Events to Volunteer
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: event.submitting ? 0.8 : 1
                  }}
                >
                  {event.successMessage && (
                    <Alert 
                      severity="success" 
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        right: 16,
                        zIndex: 10,
                        animation: 'fadeOut 3s forwards',
                        '@keyframes fadeOut': {
                          '0%': { opacity: 1 },
                          '70%': { opacity: 1 },
                          '100%': { opacity: 0 }
                        }
                      }}
                      onAnimationEnd={() => {
                        setEvents(prevEvents => prevEvents.map(e => 
                          e.id === event.id ? { ...e, successMessage: undefined } : e
                        ));
                      }}
                    >
                      {event.successMessage}
                    </Alert>
                  )}
                
                  <CardMedia
                    component="img"
                    height="160"
                    image={event.image}
                    alt={event.title}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {event.title}
                    </Typography>
                    
                    <List dense>
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CalendarTodayIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={format(parseISO(event.startDate), 'MMMM dd, yyyy')}
                        />
                      </ListItem>
                      
                      <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <LocationOnIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={event.location} />
                      </ListItem>
                    </List>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3 }}>
                      <Chip 
                        icon={<EmojiEventsIcon />}
                        label={`${event.pointsAwarded} Points Available`}
                        color="secondary" 
                        variant="outlined" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        icon={<TimerIcon />}
                        label={`Min ${event.minHoursRequired} Hours Required`}
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Log Your Hours
                      </Typography>
                      
                      <TextField
                        label="Hours Volunteered"
                        type="number"
                        fullWidth
                        value={event.inputHours}
                        onChange={(e) => handleHoursChange(event.id, Number(e.target.value))}
                        inputProps={{ min: 0, step: 0.5 }}
                        disabled={event.submitting || event.submitted}
                        sx={{ mb: 2 }}
                        helperText={`Minimum ${event.minHoursRequired} hours required to earn ${event.pointsAwarded} points`}
                      />
                      
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={event.inputHours <= 0 || event.submitting || event.submitted}
                        onClick={() => handleSubmitHours(event.id)}
                      >
                        {event.submitting ? <CircularProgress size={24} /> : 'Submit Hours'}
                      </Button>
                      
                      {event.error && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          {event.error}
                        </Alert>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
} 