'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Stack,
  Tooltip,
  AlertTitle,
  Link,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlagIcon from '@mui/icons-material/Flag';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, parseISO } from 'date-fns';
import Layout from '../../../components/layout/Layout';
import { sampleEvents, calculateEventStatus } from '../page';
import { RootState } from '../../../redux/store';
import VolunteerCertificate from '@/components/certificates/VolunteerCertificate';
import PersonIcon from '@mui/icons-material/Person';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FeedbackIcon from '@mui/icons-material/Feedback';
import { logout } from '@/redux/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';

const EventDetailsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisteredParticipant, setIsRegisteredParticipant] = useState(false);
  const [isRegisteredVolunteer, setIsRegisteredVolunteer] = useState(false);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [certificateType, setCertificateType] = useState<'volunteer' | 'participant'>('participant');
  
  // Define status based on dates
  const isUpcoming = event && new Date(event.startDate) > new Date();
  const isOngoing = event && new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
  const isCompleted = event && new Date(event.endDate) < new Date();
  
  // Check if the user has already registered for this event
  const isRegisteredForEvent = React.useMemo(() => {
    if (!user || !user.registeredEvents) return false;
    return user.registeredEvents.includes(params.id as string);
  }, [user, params.id]);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventId = params.id as string;
        
        if (!eventId) {
          setError('Event ID is missing');
          setLoading(false);
          return;
        }
        
        console.log("Fetching event details for ID:", eventId);
        
        // Try to find the event in sampleEvents first (for backward compatibility)
        const sampleEvent = sampleEvents.find(e => e.id === eventId);
        
        if (sampleEvent) {
          console.log("Found event in sample data:", sampleEvent);
          // Handle sample events as before
          const customizedEvent = {
            ...sampleEvent,
            imageUrl: getIndianEventImage(sampleEvent.category),
          };
          setEvent(customizedEvent);
          setLoading(false);
          return;
        }
        
        // If not found in sample events, fetch from API
        try {
          const apiClient = (await import('../../../utils/api')).default;
          console.log("Calling API with event ID:", eventId);
          const response = await apiClient.events.getEventById(eventId);
          
          console.log("API response:", response);
          
          // Check if we have event data in the response
          // Handle both possible response structures
          const apiEvent = response?.data?.event || response?.data;
          
          if (apiEvent) {
            console.log("Found event in API data:", apiEvent);
            
            // Safely extract values with fallbacks to prevent errors
            const event_id = apiEvent.event_id || eventId;
            const event_name = apiEvent.event_name || 'Event Name';
            const description = apiEvent.description || '';
            const start_date = apiEvent.start_date || new Date().toISOString();
            const end_date = apiEvent.end_date || new Date().toISOString();
            
            // Map API event to match our frontend structure with fallbacks for all properties
            const formattedEvent = {
              id: event_id,
              title: event_name,
              description: description,
              image: apiEvent.event_image || '',
              imageUrl: apiEvent.event_image || getIndianEventImage(apiEvent.category || 'default'),
              startDate: start_date,
              endDate: end_date,
              location: apiEvent.location || 'TBD',
              category: apiEvent.category || 'Other',
              // Calculate real-time status based on dates
              status: calculateEventStatus(start_date, end_date),
              participantsLimit: apiEvent.participant_limit || 100,
              participantLimit: apiEvent.participant_limit || 100, // For backward compatibility
              currentParticipants: apiEvent.participants ? apiEvent.participants.length : 0,
              participants: apiEvent.participants || [],
              pointsAwarded: apiEvent.points_awarded || 0,
              requirements: apiEvent.requirements || [],
              skills_needed: apiEvent.skills_needed || [],
              age_restriction: apiEvent.age_restriction || 'No Restriction',
              contact_information: apiEvent.contact_information || '',
              hours_required: apiEvent.hours_required || 0,
            };
            
            console.log("Formatted event:", formattedEvent);
            setEvent(formattedEvent);
          } else {
            console.error("No event data found in API response:", response);
            setError('Event not found');
          }
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Failed to load event from API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchEventDetails:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [params.id]);
  
  useEffect(() => {
    // This would normally check if the user is registered for this event
    // But we should primarily use the Redux store data for consistency
    if (isAuthenticated && user) {
      const eventId = params.id as string;
      
      // First check if the user has the event in their registeredEvents array
      if (user.registeredEvents && user.registeredEvents.includes(eventId)) {
        // If they're in Redux store as registered, reflect that in the UI
        setIsRegisteredParticipant(true);
        
        // For volunteers/admins, they can register as both
        if (user.role === 'volunteer' || user.role === 'admin') {
          setIsRegisteredVolunteer(true);
        }
        return;
      }
      
      // Only run fallback if not found in Redux store
      // This is just for demo purposes
      setTimeout(() => {
        // For demo, let's say users are registered for certain event IDs
        const registeredParticipantEvents = ['event1', 'event3', 'test-sports-day'];
        const registeredVolunteerEvents = ['event2', 'event4', 'test-fundraising'];
        
        setIsRegisteredParticipant(registeredParticipantEvents.includes(eventId));
        
        // Only volunteers and admins can be registered as volunteers
        if (user?.role === 'volunteer' || user?.role === 'admin') {
          setIsRegisteredVolunteer(registeredVolunteerEvents.includes(eventId));
        } else {
          setIsRegisteredVolunteer(false);
        }
      }, 500);
    }
  }, [isAuthenticated, params.id, user]);
  
  // Function to provide culturally relevant images
  const getIndianEventImage = (category: string) => {
    const images: Record<string, string> = {
      'Education': 'https://images.unsplash.com/photo-1456243762991-9bc5d5e960db?q=80&w=1000&auto=format&fit=crop',
      'Health': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop',
      'Environment': 'https://images.unsplash.com/photo-1590274853856-f808e6a0c5f2?q=80&w=1000&auto=format&fit=crop',
      'Community': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop',
      'Cultural': 'https://images.unsplash.com/photo-1603206004639-22003d78a0d6?q=80&w=1000&auto=format&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
      'Tech': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop',
      'Fundraising': 'https://images.unsplash.com/photo-1593113598332-cd59a93333c3?q=80&w=1000&auto=format&fit=crop',
      'default': 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=1000&auto=format&fit=crop',
    };
    
    return images[category] || images['default'];
  };
  
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${params.id}/register`);
      return;
    }
    
    router.push(`/events/${params.id}/register`);
  };
  
  const handleOpenCertificate = (type: 'volunteer' | 'participant') => {
    setCertificateType(type);
    setCertificateDialogOpen(true);
  };
  
  const handleCloseCertificate = () => {
    setCertificateDialogOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };
  
  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error || !event) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error || 'Event not found'}
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => router.push('/events')}>
              Back to Events
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }
  
  // Assuming event data is available
  return (
    <Layout>
      <Box 
        sx={{ 
          height: { xs: '200px', md: '300px' }, 
          width: '100%', 
          overflow: 'hidden', 
          position: 'relative',
          bgcolor: 'rgba(0,0,0,0.7)'
        }}
      >
        <Box 
          component="img"
          src={event.imageUrl} 
          alt={event.title}
          sx={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            opacity: 0.7
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            p: { xs: 2, md: 4 },
          }}
        >
          <Container maxWidth="lg">
            <Chip 
              label={event.category} 
              color="primary" 
              size="small" 
              sx={{ mb: 1, fontWeight: 'bold' }} 
            />
            <Typography variant="h4" component="h1" fontWeight="bold">
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ mr: 0.5, fontSize: 18 }} />
                <Typography variant="body2">
                  {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                <Typography variant="body2">
                  {format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 0.5, fontSize: 18 }} />
                <Typography variant="body2">{event.location}</Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {event.title}
                </Typography>
                {isAuthenticated && (
                  <Button
                    variant="contained"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 8,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                    }}
                  >
                    Logout
                  </Button>
                )}
              </Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                About This Event
              </Typography>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Event Details
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date and Time" 
                    secondary={`${format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')} • ${format(parseISO(event.startDate), 'h:mm a')} - ${format(parseISO(event.endDate), 'h:mm a')}`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Location" 
                    secondary={event.location} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Capacity" 
                    secondary={`${event.participants ? event.participants.length : 0} / ${event.participantLimit} volunteers registered`} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {isRegisteredForEvent 
                  ? "Your Registration" 
                  : isCompleted 
                    ? "Event Status" 
                    : "Join This Event"}
              </Typography>

              <Box sx={{ mt: 3 }}>
                {isCompleted ? (
                  <Alert severity="info">This event has concluded</Alert>
                ) : isOngoing ? (
                  <Alert severity="info">This event is currently in progress</Alert>
                ) : isRegisteredForEvent ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>You're registered for this event!</AlertTitle>
                    Details have been sent to your email.
                  </Alert>
                ) : (
                  <Typography variant="body1" paragraph fontWeight="medium">
                    How would you like to participate?
                  </Typography>
                )}
                
                {!isCompleted && (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {/* Participant Registration Button - Available to all users */}
                    {isRegisteredForEvent ? (
                      <Alert 
                        severity="success" 
                        icon={<CheckCircleIcon fontSize="inherit" />}
                        sx={{ mb: 2, fontWeight: 'medium' }}
                      >
                        <AlertTitle>Registration Confirmed</AlertTitle>
                        {user?.role === 'volunteer' || user?.role === 'admin' 
                          ? "You can attend this event as both participant and volunteer."
                          : "You are registered as a participant for this event."}
                      </Alert>
                    ) : (
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          bgcolor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          }
                        }}
                        onClick={isUpcoming ? () => router.push(`/events/${params.id}/participant-register`) : undefined}
                        disabled={isCompleted || isRegisteredParticipant || isRegisteredForEvent}
                        startIcon={isRegisteredParticipant ? <CheckCircleIcon /> : <PersonIcon />}
                      >
                        {isRegisteredParticipant
                          ? "Already Registered as Participant" 
                          : isUpcoming 
                            ? "Register as Participant" 
                            : isOngoing 
                              ? "Walk-in Registration Available" 
                              : "Registration Closed"}
                      </Button>
                    )}
                    
                    {/* Volunteer Registration Button - Only show for volunteers and admins */}
                    {(user?.role === 'volunteer' || user?.role === 'admin') && !isRegisteredForEvent && (
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="secondary"
                        sx={{ py: 1.5 }}
                        onClick={isUpcoming ? () => router.push(`/events/${params.id}/register`) : undefined}
                        disabled={isOngoing || isCompleted || isRegisteredVolunteer || isRegisteredForEvent}
                        startIcon={isRegisteredVolunteer ? <CheckCircleIcon /> : <VolunteerActivismIcon />}
                      >
                        {isRegisteredVolunteer 
                          ? "Already Registered as Volunteer" 
                          : isUpcoming 
                            ? "Register as Volunteer" 
                            : "Volunteer Registration Closed"}
                      </Button>
                    )}

                    {/* Information about current role and available options */}
                    {user?.role && !isRegisteredForEvent && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {user.role === 'admin' 
                            ? "As an admin, you can both participate in and volunteer for events." 
                            : user.role === 'volunteer' 
                              ? "As a volunteer, you can also participate in events." 
                              : "You are registered as a participant."}
                        </Typography>
                      </Box>
                    )}

                    {event.pointsAwarded > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${event.pointsAwarded} points`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Points are awarded after logging volunteer hours
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Event Feedback
                </Typography>

                <Button 
                  variant="outlined" 
                  fullWidth
                  sx={{ mb: 2, py: 1.5 }}
                  onClick={() => router.push(`/events/${params.id}/feedback`)}
                  disabled={isUpcoming}
                >
                  Provide Feedback
                </Button>
                
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  For participants and volunteers who have attended this event
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Certificate Dialog */}
      {event && (
        <VolunteerCertificate
          open={certificateDialogOpen}
          onClose={handleCloseCertificate}
          eventData={{
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate || event.startDate,
            location: event.location,
            organizerName: event.organizer || 'Samarthanam Trust',
            category: event.category || 'Community',
            id: String(params.id),
          }}
          userData={{
            name: user?.displayName || 'User',
            email: user?.email || 'user@example.com',
            volunteerHours: 4,
          }}
          certificateType={certificateType}
        />
      )}
    </Layout>
  );
};

export default EventDetailsPage; 