'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  CircularProgress,
  Grid,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SelectChangeEvent,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';
import Layout from '../../../../components/layout/Layout';
import { sampleEvents, calculateEventStatus } from '../../page';
import { RootState } from '../../../../redux/store';
import EventRecommendations from '../../../../components/events/EventRecommendations';
import { registerForEvent } from '../../../../redux/slices/authSlice';
import { registerForEventSuccess } from '../../../../redux/slices/userSlice';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shiftPreference: string;
  canAttendEntireEvent: boolean;
  specialAccommodations: string;
  dietaryRestrictions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hasRelevantSkills: boolean;
  comments: string;
  agreedToTerms: boolean;
}

const EventRegistrationPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    shiftPreference: 'full',
    canAttendEntireEvent: true,
    specialAccommodations: '',
    dietaryRestrictions: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    hasRelevantSkills: false,
    comments: '',
    agreedToTerms: false,
  });
  
  // Steps in the registration process
  const steps = ['Personal Information', 'Volunteer Details', 'Review & Confirm'];
  
  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${params.id}/register`);
      return;
    }
    
    // Check if user is allowed to volunteer (must be volunteer or admin)
    if (user?.role !== 'volunteer' && user?.role !== 'admin') {
      setError('Only volunteers and administrators can register to volunteer for events');
      return;
    }
    
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventId = params.id as string;
        
        console.log("Register page: Fetching event details for ID:", eventId);
        
        // Try to find the event in sampleEvents first (for backward compatibility)
        const sampleEvent = sampleEvents.find(e => e.id === eventId);
        
        if (sampleEvent) {
          console.log("Register page: Found event in sample data:", sampleEvent);
          // Handle sample events as before
          const customizedEvent = {
            ...sampleEvent,
            imageUrl: getIndianEventImage(sampleEvent.category),
          };
          setEvent(customizedEvent);
          
          // Check if user is already registered for this event
          if (user?.registeredEvents?.includes(eventId)) {
            setAlreadyRegistered(true);
          }
          
          setLoading(false);
          return;
        }
        
        // If not found in sample events, fetch from API
        try {
          const apiClient = (await import('../../../../utils/api')).default;
          console.log("Register page: Calling API with event ID:", eventId);
          const response = await apiClient.events.getEventById(eventId);
          
          console.log("Register page: API response:", response);
          
          // Check if we have event data in the response
          // Handle both possible response structures
          const apiEvent = response.data.event || response.data;
          
          if (apiEvent) {
            console.log("Register page: Found event in API data:", apiEvent);
            // Map API event to match our frontend structure
            const formattedEvent = {
              id: apiEvent.event_id,
              title: apiEvent.event_name,
              description: apiEvent.description,
              image: apiEvent.event_image,
              imageUrl: apiEvent.event_image || getIndianEventImage(apiEvent.category),
              startDate: apiEvent.start_date,
              endDate: apiEvent.end_date,
              location: apiEvent.location,
              category: apiEvent.category,
              status: calculateEventStatus(apiEvent.start_date, apiEvent.end_date),
              participantsLimit: apiEvent.participant_limit,
              participantLimit: apiEvent.participant_limit, // For backward compatibility
              currentParticipants: apiEvent.participants ? apiEvent.participants.length : 0,
              participants: apiEvent.participants || [],
              pointsAwarded: apiEvent.points_awarded || 0,
              requirements: apiEvent.requirements || [],
              skills_needed: apiEvent.skills_needed || [],
              age_restriction: apiEvent.age_restriction || 'No Restriction',
              contact_information: apiEvent.contact_information || '',
              hours_required: apiEvent.hours_required || 0,
            };
            
            console.log("Register page: Formatted event:", formattedEvent);
            setEvent(formattedEvent);
            
            // Check if user is already registered for this event
            if (user?.registeredEvents?.includes(eventId)) {
              setAlreadyRegistered(true);
            }
          } else {
            console.error("Register page: No event data found in API response:", response);
            setError('Event not found');
          }
        } catch (apiError) {
          console.error('Register page: API error:', apiError);
          setError('Failed to load event from API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Register page: Error in fetchEventDetails:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [params.id, isAuthenticated, router, user]);
  
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
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const target = e.target as HTMLInputElement | { name?: string; value: unknown };
    const name = target.name;
    
    if (!name) return;
    
    // Handle checkbox separately
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      // Handle text inputs and selects
      setFormData({
        ...formData,
        [name]: target.value,
      });
    }
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const validateStep = (step: number): boolean => {
    let isValid = true;
    let errorMessage = '';
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) {
          errorMessage = 'First name is required';
          isValid = false;
        } else if (!formData.lastName.trim()) {
          errorMessage = 'Last name is required';
          isValid = false;
        } else if (!formData.email.trim()) {
          errorMessage = 'Email is required';
          isValid = false;
        } else if (!formData.phone.trim()) {
          errorMessage = 'Phone number is required';
          isValid = false;
        }
        break;
        
      case 1: // Volunteer Details
        if (!formData.emergencyContactName.trim()) {
          errorMessage = 'Emergency contact name is required';
          isValid = false;
        } else if (!formData.emergencyContactPhone.trim()) {
          errorMessage = 'Emergency contact phone is required';
          isValid = false;
        }
        break;
        
      case 2: // Review & Confirm
        if (!formData.agreedToTerms) {
          errorMessage = 'You must agree to the terms and conditions';
          isValid = false;
        }
        break;
    }
    
    if (!isValid) {
      setError(errorMessage);
    } else {
      setError(null);
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First register with the API
      const apiClient = (await import('../../../../utils/api')).default;
      
      // Send registration data to the backend
      await apiClient.events.registerForEvent(params.id as string);
      
      // Now update the Redux state with the event data
      if (params.id && event) {
        // Register the user for this event in Redux store
        dispatch(registerForEvent(params.id as string));
        
        // Make sure we have all the required properties before sending to Redux
        if (event.id && event.title && event.startDate && event.endDate && 
            event.location && event.category && event.status) {
          // Update user profile with event registration including the full event data
          dispatch(registerForEventSuccess({
            eventId: params.id as string,
            eventData: {
              id: event.id,
              title: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
              category: event.category,
              status: event.status,
              pointsAwarded: event.pointsAwarded || 0,
            }
          }));
        } else {
          // Fallback to the simpler method if we don't have all data
          dispatch(registerForEventSuccess(params.id as string));
        }
      }
      
      // Success! Show confetti 🎉
      const end = Date.now() + 1000;
      
      // Create confetti celebration
      const runConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#005CA9', '#E63E11', '#FFC107', '#FFFFFF', '#4CAF50'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(runConfetti);
        }
      };
      
      runConfetti();
      
      setRegistrationSuccess(true);
      setLoading(false);
      
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Volunteer Details
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Shift Preference</FormLabel>
              <RadioGroup
                name="shiftPreference"
                value={formData.shiftPreference}
                onChange={handleInputChange}
              >
                <FormControlLabel value="full" control={<Radio />} label="Full Event" />
                <FormControlLabel value="morning" control={<Radio />} label="Morning Only" />
                <FormControlLabel value="afternoon" control={<Radio />} label="Afternoon Only" />
              </RadioGroup>
            </FormControl>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.canAttendEntireEvent}
                  onChange={handleInputChange}
                  name="canAttendEntireEvent"
                />
              }
              label="I can attend the entire duration of the event"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <TextField
              label="Any Special Accommodations Needed?"
              name="specialAccommodations"
              value={formData.specialAccommodations}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
            
            <TextField
              label="Dietary Restrictions"
              name="dietaryRestrictions"
              value={formData.dietaryRestrictions}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Emergency Contact
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Emergency Contact Phone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
            </Grid>
            
            {event?.skills && event.skills.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasRelevantSkills}
                      onChange={handleInputChange}
                      name="hasRelevantSkills"
                    />
                  }
                  label="I have one or more of the requested skills for this event"
                  sx={{ display: 'block', mb: 1 }}
                />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {event.skills.map((skill: string) => (
                    <Chip key={skill} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
            
            <TextField
              label="Additional Comments"
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="Anything else you'd like the organizers to know?"
            />
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Personal Information
                    </Typography>
                    <List disablePadding>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PersonIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Name" 
                          secondary={`${formData.firstName} ${formData.lastName}`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <EmailIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email" 
                          secondary={formData.email} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PhoneIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Phone" 
                          secondary={formData.phone} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Volunteer Details
                    </Typography>
                    <List disablePadding>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Shift Preference" 
                          secondary={
                            formData.shiftPreference === 'full' ? 'Full Event' :
                            formData.shiftPreference === 'morning' ? 'Morning Only' :
                            'Afternoon Only'
                          } 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <PersonIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Emergency Contact" 
                          secondary={`${formData.emergencyContactName} (${formData.emergencyContactPhone})`} 
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                      {formData.specialAccommodations && (
                        <ListItem disableGutters>
                          <ListItemText 
                            primary="Special Accommodations" 
                            secondary={formData.specialAccommodations} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Event Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={event?.imageUrl}
                    alt={event?.title}
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{event?.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event && (
                        <>
                          <EventIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                          {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')} at {format(parseISO(event.startDate), 'h:mm a')}
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event?.location}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                    name="agreedToTerms"
                    required
                  />
                }
                label="I agree to the terms and conditions of volunteering for this event"
              />
            </Box>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  if (loading && !event) {
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
  
  if (error && !event) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
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
  
  if (alreadyRegistered && !registrationSuccess) {
    console.log("DEBUGGING ALREADY REGISTERED:");
    console.log("Event data:", event);
    console.log("Sample events available:", sampleEvents ? sampleEvents.length : 0);
    
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              You're Already Registered!
            </Typography>
            
            <Typography variant="body1" paragraph>
              You have already registered as a volunteer for {event?.title}.
            </Typography>
            
            <Typography variant="body2" paragraph color="text.secondary">
              Event Date: {event && format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
              <br />
              Event Time: {event && format(parseISO(event.startDate), 'h:mm a')} - {event && format(parseISO(event.endDate), 'h:mm a')}
              <br />
              Location: {event?.location}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/events/${params.id}`)}
              >
                Back to Event
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/profile')}
              >
                View Your Profile
              </Button>
            </Box>
          </Paper>
          
          {/* Event Recommendations with better visibility */}
          {event && sampleEvents && sampleEvents.length > 0 && (
            <Box mt={4} sx={{ 
              p: 3, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <EventRecommendations 
                currentEvent={event}
                allEvents={sampleEvents}
                maxRecommendations={2}
              />
            </Box>
          )}
        </Container>
      </Layout>
    );
  }
  
  if (registrationSuccess) {
    // Clear logging for debugging
    console.log("DEBUGGING RECOMMENDATIONS:");
    console.log("Event data:", event);
    console.log("Sample events available:", sampleEvents ? sampleEvents.length : 0);
    console.log("User:", user);
    
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom>
              Registration Complete!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Thank you for registering for {event?.title}. We've sent a confirmation email with all the event details.
            </Typography>
            
            <Typography variant="body1" paragraph fontWeight="bold">
              {user?.role === 'volunteer' || user?.role === 'admin' ? 
                "Points will be awarded after you log your volunteer hours." :
                `You've earned ${event?.pointsAwarded || 50} points for your profile!`
              }
            </Typography>
            
            <Typography variant="body2" paragraph color="text.secondary">
              Event Date: {event && format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')}
              <br />
              Event Time: {event && format(parseISO(event.startDate), 'h:mm a')} - {event && format(parseISO(event.endDate), 'h:mm a')}
              <br />
              Location: {event?.location}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/events/${params.id}`)}
              >
                Back to Event
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push(user?.role === 'volunteer' || user?.role === 'admin' ? '/volunteer' : '/profile')}
              >
                View Your Profile
              </Button>
            </Box>
          </Paper>
          
          {/* Event Recommendations with better visibility */}
          {event && sampleEvents && sampleEvents.length > 0 && (
            <Box mt={4} sx={{ 
              p: 3, 
              bgcolor: '#f5f5f5', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <EventRecommendations 
                currentEvent={event}
                allEvents={sampleEvents}
                maxRecommendations={2}
              />
            </Box>
          )}
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Register for Event
          </Typography>
          
          {event && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box
                component="img"
                src={event.imageUrl}
                alt={event.title}
                sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
              />
              <Box>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(parseISO(event.startDate), 'EEEE, MMMM d, yyyy')} at {format(parseISO(event.startDate), 'h:mm a')}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default EventRegistrationPage; 