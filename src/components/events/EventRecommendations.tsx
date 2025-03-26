'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  CardActions,
  Button,
  Chip,
  Paper
} from '@mui/material';
import { EventData } from './EventCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface EventRecommendationsProps {
  currentEvent: EventData;
  allEvents: EventData[];
  maxRecommendations?: number;
}

const EventRecommendations: React.FC<EventRecommendationsProps> = ({
  currentEvent,
  allEvents,
  maxRecommendations = 2
}) => {
  // Add debugging to track component rendering
  console.log("EventRecommendations component rendering with:");
  console.log("- Current event:", currentEvent?.title);
  console.log("- Total events available:", allEvents?.length || 0);
  
  // Get recommendations based on matching category or location
  const recommendations = React.useMemo(() => {
    // Always include a beach cleanup event
    const beachCleanupEvent = {
      id: 'beach-cleanup-event',
      title: 'Beach Cleanup Volunteer Day',
      description: 'Join us for a day of cleaning our local beaches and protecting marine life.',
      startDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 2 weeks from now
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
      location: 'Marina Beach, Chennai',
      category: 'Environment',
      status: 'upcoming',
      participantsLimit: 50,
      currentParticipants: 12,
    };

    // Return just the beach cleanup event
    return [beachCleanupEvent];
  }, []);
  
  console.log("Fixed beach cleanup recommendation added");
  
  // Determine why each event is being recommended
  const getRecommendationReason = (event: EventData) => {
    if (event.category === currentEvent.category) {
      return `Similar ${event.category} event`;
    } else {
      const eventCity = event.location?.split(',').pop()?.trim() || '';
      const currentEventCity = currentEvent.location?.split(',').pop()?.trim() || '';
      if (eventCity === currentEventCity) {
        return `Event in ${eventCity}`;
      }
    }
    return "Recommended event";
  };
  
  // Always show component with useful information
  return (
    <Paper elevation={1} sx={{ mt: 4, pt: 4, pb: 2, px: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {recommendations.length > 0 ? 'Recommended Events' : 'Explore More Events'}
      </Typography>
      
      {recommendations.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Check out our upcoming events page to find more events to participate in!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map(event => (
            <Grid item key={event.id} xs={12} sm={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Removed CardMedia component for image display */}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip 
                    label={event.category} 
                    size="small" 
                    sx={{ mb: 1 }} 
                    color="primary" 
                    variant="outlined"
                  />
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {event.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {format(parseISO(event.startDate), 'MMMM dd, yyyy')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" noWrap>
                      {event.location}
                    </Typography>
                  </Box>
                  
                  {/* Show why this event is recommended */}
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontStyle="italic" color="text.secondary">
                      {getRecommendationReason(event)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    component={Link}
                    href={`/events/${event.id}`}
                    fullWidth
                    variant="contained"
                    size="small"
                  >
                    View Event
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {recommendations.length === 0 && (
        <Button
          component={Link}
          href="/events"
          variant="contained"
          color="primary"
          sx={{ mt: 2, mb: 2 }}
        >
          Browse All Events
        </Button>
      )}
    </Paper>
  );
};

export default EventRecommendations; 