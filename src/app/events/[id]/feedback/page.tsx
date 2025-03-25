'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Rating,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  Divider,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { format, parseISO } from 'date-fns';
import Layout from '../../../../components/layout/Layout';
import { sampleEvents } from '../../page';
import { RootState } from '../../../../redux/store';
import { updateUserPoints } from '@/utils/pointsCalculator';
import { 
  completeEventStart, 
  completeEventSuccess, 
  completeEventFailure,
  addPointsStart,
  addPointsSuccess,
  addPointsFailure,
  earnBadgeStart,
  earnBadgeSuccess,
  earnBadgeFailure
} from '@/redux/slices/userSlice';

interface FeedbackFormData {
  role: 'participant' | 'volunteer' | 'both';
  overallRating: number;
  organizationRating: number;
  accessibilityRating: number;
  volunteersRating: number;
  contentRating: number;
  likedMost: string;
  improvements: string;
  additionalComments: string;
  provideTestimonial: boolean;
  contactForFeedback: boolean;
}

const EventFeedbackPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.user);
  
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    role: 'participant',
    overallRating: 0,
    organizationRating: 0,
    accessibilityRating: 0,
    volunteersRating: 0,
    contentRating: 0,
    likedMost: '',
    improvements: '',
    additionalComments: '',
    provideTestimonial: false,
    contactForFeedback: false,
  });
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventId = params.id as string;
        
        // Try to find the event in sampleEvents first (for backward compatibility)
        const sampleEvent = sampleEvents.find(e => e.id === eventId);
        
        if (sampleEvent) {
          // Handle sample events as before
          setEvent(sampleEvent);
          setLoading(false);
          return;
        }
        
        // If not found in sample events, fetch from API
        try {
          const apiClient = (await import('../../../../utils/api')).default;
          const response = await apiClient.events.getEventById(eventId);
          
          if (response.data.event) {
            const apiEvent = response.data.event;
            // Map API event to match our frontend structure
            const formattedEvent = {
              id: apiEvent.event_id,
              title: apiEvent.event_name,
              description: apiEvent.description,
              image: apiEvent.event_image,
              startDate: apiEvent.start_date,
              endDate: apiEvent.end_date,
              location: apiEvent.location,
              category: apiEvent.category,
              status: apiEvent.status.toLowerCase(),
              participantsLimit: apiEvent.participant_limit,
              participantLimit: apiEvent.participant_limit, // For backward compatibility
              currentParticipants: apiEvent.participants ? apiEvent.participants.length : 0,
              participants: apiEvent.participants || [],
              pointsAwarded: apiEvent.points_awarded,
              hours: apiEvent.hours_required || 0,
            };
            
            setEvent(formattedEvent);
          } else {
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleRatingChange = (name: string, value: number | null) => {
    setFormData({
      ...formData,
      [name]: value || 0,
    });
  };
  
  const validateForm = (): boolean => {
    let isValid = true;
    let errorMessage = '';
    
    if (formData.overallRating === 0) {
      errorMessage = 'Please provide an overall rating';
      isValid = false;
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
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate an API call to submit feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // After submitting feedback, mark the event as completed for the user
      if (profile && event) {
        // Dispatch action to mark event as completed
        dispatch(completeEventStart());
        
        // Calculate the current month from the event date
        const eventDate = new Date(event.startDate);
        const eventMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Calculate if this is the user's first event
        const isFirstEvent = profile.eventsAttended.length === 0;
        
        // Get event hours - either from event details or calculate from start/end time
        const eventHours = event.hours || 
          ((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60));
        
        // Complete the event and update user stats
        dispatch(completeEventSuccess({
          eventId: params.id as string,
          hours: eventHours,
          category: event.category,
          earnedPoints: 0, // Will calculate this separately
          completedDate: new Date().toISOString(),
          eventMonth: eventMonth
        }));
        
        // Now update points based on event completion
        dispatch(addPointsStart());
        
        // Use the points calculator utility to determine points and level changes
        const pointsResult = updateUserPoints(
          profile.points,
          profile.level,
          eventHours,
          isFirstEvent,
          event.category,
          profile.stats.totalEvents,
          profile.stats.totalHours,
          profile.stats.categoryDistribution,
          profile.badgesEarned
        );
        
        // Update user's points and level
        dispatch(addPointsSuccess({
          points: pointsResult.points,
          newLevel: pointsResult.level,
          nextLevelPoints: pointsResult.nextLevelPoints
        }));
        
        // Check for and award any new badges
        if (pointsResult.newBadges.length > 0) {
          dispatch(earnBadgeStart());
          
          // For each new badge, dispatch an action to add it
          for (const badgeId of pointsResult.newBadges) {
            dispatch(earnBadgeSuccess({
              badgeId,
              earnedDate: new Date().toISOString()
            }));
          }
        }
      }
      
      setSubmitSuccess(true);
      setLoading(false);
      
      // Redirect after a delay
      setTimeout(() => {
        router.push(`/events/${params.id}`);
      }, 3000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      setLoading(false);
      dispatch(completeEventFailure('Failed to complete event'));
    }
  };
  
  if (loading && !submitSuccess) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error && !submitSuccess) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => router.push(`/events/${params.id}`)}>
              Back to Event
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (submitSuccess) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <SentimentSatisfiedAltIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Thank You for Your Feedback!
            </Typography>
            <Typography variant="body1" paragraph>
              We appreciate you taking the time to share your thoughts and experiences with us.
              Your feedback helps us continuously improve our events.
            </Typography>
            {formData.provideTestimonial && formData.contactForFeedback && (
              <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                We'll contact you soon about providing a testimonial.
              </Typography>
            )}
            <Box sx={{ mt: 4 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => router.push('/events')}
                sx={{ mr: 2 }}
              >
                Explore More Events
              </Button>
              <Button 
                variant="outlined"
                size="large"
                onClick={() => router.push(`/events/${params.id}`)}
              >
                Back to Event
              </Button>
            </Box>
          </Paper>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Event Feedback
          </Typography>
          {event && (
            <>
              <Typography variant="h6" gutterBottom align="center">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
                {format(parseISO(event.startDate), 'MMMM d, yyyy')}
              </Typography>
            </>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4 }}>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">I attended this event as a:</FormLabel>
                <RadioGroup
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  row
                >
                  <FormControlLabel value="participant" control={<Radio />} label="Participant" />
                  <FormControlLabel value="volunteer" control={<Radio />} label="Volunteer" />
                  <FormControlLabel value="both" control={<Radio />} label="Both" />
                </RadioGroup>
              </FormControl>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Event Ratings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Overall Experience</Typography>
                    <Rating
                      name="overallRating"
                      value={formData.overallRating}
                      onChange={(_, value) => handleRatingChange('overallRating', value)}
                      size="large"
                      sx={{ mt: 1 }}
                      required
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Event Organization</Typography>
                    <Rating
                      name="organizationRating"
                      value={formData.organizationRating}
                      onChange={(_, value) => handleRatingChange('organizationRating', value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Accessibility</Typography>
                    <Rating
                      name="accessibilityRating"
                      value={formData.accessibilityRating}
                      onChange={(_, value) => handleRatingChange('accessibilityRating', value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">
                      {formData.role === 'participant' ? 'Volunteers' : formData.role === 'volunteer' ? 'Co-volunteers' : 'Both'}
                    </Typography>
                    <Rating
                      name="volunteersRating"
                      value={formData.volunteersRating}
                      onChange={(_, value) => handleRatingChange('volunteersRating', value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Event Content/Activities</Typography>
                    <Rating
                      name="contentRating"
                      value={formData.contentRating}
                      onChange={(_, value) => handleRatingChange('contentRating', value)}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Your Feedback
              </Typography>
              
              <TextField
                name="likedMost"
                label="What did you like most about this event?"
                value={formData.likedMost}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              
              <TextField
                name="improvements"
                label="What could we improve for future events?"
                value={formData.improvements}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              
              <TextField
                name="additionalComments"
                label="Additional Comments"
                value={formData.additionalComments}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Testimonial
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    name="provideTestimonial"
                    checked={formData.provideTestimonial}
                    onChange={handleInputChange}
                  />
                }
                label="I would like to provide a testimonial that may be used on the website or in promotional materials"
              />
              
              {formData.provideTestimonial && (
                <FormControlLabel
                  control={
                    <Checkbox
                      name="contactForFeedback"
                      checked={formData.contactForFeedback}
                      onChange={handleInputChange}
                    />
                  }
                  label="Samarthanam may contact me for additional feedback"
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => router.push(`/events/${params.id}`)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : undefined}
              >
                Submit Feedback
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default EventFeedbackPage; 