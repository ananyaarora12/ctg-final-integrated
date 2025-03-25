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
    // Safety check for missing data
    if (!currentEvent || !allEvents || allEvents.length === 0) {
      console.log("Missing data for recommendations");
      return [];
    }
    
    // Filter out the current event and get only upcoming events
    const upcomingEvents = allEvents.filter(event => 
      event.id !== currentEvent.id && 
      event.status === 'upcoming'
    );
    
    if (upcomingEvents.length === 0) {
      console.log("No upcoming events available for recommendations");
      return [];
    }
    
    // Extract current event city
    const currentEventCity = currentEvent.location?.split(',').pop()?.trim() || '';
    const currentEventCategory = currentEvent.category;
    
    console.log("Looking for matches with:", { 
      category: currentEventCategory, 
      city: currentEventCity 
    });
    
    // Find events with matching location or category
    const matchingEvents = upcomingEvents.filter(event => {
      const eventCity = event.location?.split(',').pop()?.trim() || '';
      
      // Only include if category or location matches
      const categoryMatch = currentEventCategory && event.category === currentEventCategory;
      const locationMatch = currentEventCity && eventCity && currentEventCity === eventCity;
      
      return categoryMatch || locationMatch;
    });
    
    if (matchingEvents.length === 0) {
      console.log("No matching events found");
      // Don't return random events if no matches
      return [];
    }
    
    console.log("Found matching events:", matchingEvents.length);
    
    // Sort by "relevance" - category matches first, then location matches
    return matchingEvents
      .sort((a, b) => {
        // First prioritize category matches
        const aMatchesCategory = a.category === currentEventCategory ? 1 : 0;
        const bMatchesCategory = b.category === currentEventCategory ? 1 : 0;
        
        if (aMatchesCategory !== bMatchesCategory) {
          return bMatchesCategory - aMatchesCategory;
        }
        
        // Then prioritize location matches
        const aCity = a.location?.split(',').pop()?.trim() || '';
        const bCity = b.location?.split(',').pop()?.trim() || '';
        const aMatchesLocation = aCity === currentEventCity ? 1 : 0;
        const bMatchesLocation = bCity === currentEventCity ? 1 : 0;
        
        return bMatchesLocation - aMatchesLocation;
      })
      .slice(0, maxRecommendations);
  }, [currentEvent, allEvents, maxRecommendations]);
  
  console.log("Final recommendations:", recommendations.length);
  
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
                <CardMedia
                  component="img"
                  height="160"
                  image={event.image}
                  alt={event.title}
                  sx={{ objectFit: 'cover' }}
                />
                
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