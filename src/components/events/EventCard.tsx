'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  CardActions 
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import Link from 'next/link';

// Define the event interface
export interface EventData {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participantsLimit: number;
  currentParticipants: number;
  pointsAwarded: number;
}

interface EventCardProps {
  event: EventData;
  variant?: 'default' | 'compact';
}

const EventCard: React.FC<EventCardProps> = ({ event, variant = 'default' }) => {
  const isUpcoming = event.status === 'upcoming';
  const isOngoing = event.status === 'ongoing';
  const isCompleted = event.status === 'completed';
  
  const getStatusColor = () => {
    if (isUpcoming) return 'primary';
    if (isOngoing) return 'success';
    return 'default';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  if (variant === 'compact') {
    return (
      <Card sx={{ display: 'flex', mb: 2, height: 120 }}>
        <CardMedia
          component="img"
          sx={{ width: 120 }}
          image={event.image || 'https://source.unsplash.com/random/120x120?volunteer'}
          alt={event.title}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto', py: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography component="div" variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                {event.title}
              </Typography>
              <Chip 
                label={event.status} 
                size="small" 
                color={getStatusColor()}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {formatDate(event.startDate)}
              </Typography>
              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {event.location}
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              component={Link} 
              href={`/events/${event.id}`}
              variant={isUpcoming ? "contained" : "outlined"}
              color={isCompleted ? "secondary" : "primary"}
            >
              {isUpcoming ? 'Register' : isCompleted ? 'View Summary' : 'View Details'}
            </Button>
          </CardActions>
        </Box>
      </Card>
    );
  }
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="180"
        image={event.image || 'https://source.unsplash.com/random/400x200?volunteer'}
        alt={event.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0 }}>
            {event.title}
          </Typography>
          <Chip 
            label={event.status} 
            size="small" 
            color={getStatusColor()}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatDate(event.startDate)} · {formatTime(event.startDate)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.location}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {event.currentParticipants} / {event.participantsLimit} participants
          </Typography>
        </Box>
        
        {event.pointsAwarded > 0 && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`${event.pointsAwarded} points`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>
      <CardActions>
        <Button 
          fullWidth
          size="medium" 
          component={Link}
          href={`/events/${event.id}`}
          variant={isUpcoming ? "contained" : "outlined"}
          color={isCompleted ? "secondary" : "primary"}
        >
          {isUpcoming ? 'Register' : isCompleted ? 'View Summary' : 'View Details'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard; 