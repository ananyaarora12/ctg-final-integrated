'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import Layout from '../../components/layout/Layout';
import EventsList from '../../components/events/EventsList';
import { EventData } from '../../components/events/EventCard';

// Sample data for demo purposes
export const sampleEvents: EventData[] = [
  {
    id: '1',
    title: 'Volunteer at Samarthanam School',
    description: 'Help teach and engage with children at Samarthanam School for the visually impaired.',
    image: 'https://www.google.com/search?sca_esv=4fe20b8700bc3141&sxsrf=AHTn8zoFiAIuFVB3coAn90UdngZ7SRxVUw:1742639192663&q=samarthanam+school&udm=2&fbs=ABzOT_CWdhQLP1FcmU5B0fn3xuWpA-dk4wpBWOGsoR7DG5zJBjnSuuKZNj-6zieDk_gkn6CyymgG_tEVFNWvBwycIom9fAkLCsPsF-grDFWWIT-hU-sn48g3ciU0tfBfbFK2yArcwTRLi90ukn_vXgeUzyATqFUJmpFU9aFR_kTMGduTyFu7z2Li8FdIoMOel6xy_etAo58k9lhgGiU-MXNQ8p3H3BuCEg&sa=X&ved=2ahUKEwiuobPwvJ2MAxW7n2MGHejeKQ0QtKgLegQIFRAB&biw=1440&bih=778&dpr=2#vhid=ACy1CDPI48lkJM&vssid=mosaic',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // +4 hours
    location: 'Samarthanam School, Bangalore',
    category: 'Education',
    status: 'upcoming',
    participantsLimit: 20,
    currentParticipants: 12,
    pointsAwarded: 50,
  },
  {
    id: '2',
    title: 'Career Counseling Session',
    description: 'Provide career guidance to visually impaired students preparing for college.',
    image: 'https://source.unsplash.com/random/400x200?counseling',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
    location: 'Samarthanam Center, Delhi',
    category: 'Career',
    status: 'upcoming',
    participantsLimit: 15,
    currentParticipants: 10,
    pointsAwarded: 40,
  },
  {
    id: '3',
    title: 'Technology Workshop',
    description: 'Teach basic computer skills to visually impaired adults to improve employability.',
    image: 'https://source.unsplash.com/random/400x200?technology',
    startDate: new Date().toISOString(), // Today (ongoing)
    endDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // +6 hours
    location: 'Samarthanam Tech Center, Mumbai',
    category: 'Technology',
    status: 'ongoing',
    participantsLimit: 25,
    currentParticipants: 22,
    pointsAwarded: 60,
  },
  {
    id: '4',
    title: 'Sports Day Volunteer',
    description: 'Assist in organizing and running a sports day event for differently-abled children.',
    image: 'https://source.unsplash.com/random/400x200?sports',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(), // +8 hours
    location: 'City Sports Complex, Bangalore',
    category: 'Sports',
    status: 'completed',
    participantsLimit: 30,
    currentParticipants: 28,
    pointsAwarded: 70,
  },
  {
    id: '5',
    title: 'Fundraising Drive',
    description: 'Help collect donations for Samarthanam Trust\'s education programs.',
    image: 'https://source.unsplash.com/random/400x200?fundraising',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(), // +5 hours
    location: 'Various locations, Chennai',
    category: 'Fundraising',
    status: 'completed',
    participantsLimit: 40,
    currentParticipants: 35,
    pointsAwarded: 55,
  },
  {
    id: '6',
    title: 'Art Workshop',
    description: 'Conduct an art workshop for visually impaired children to express themselves creatively.',
    image: 'https://source.unsplash.com/random/400x200?art',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
    location: 'Community Center, Hyderabad',
    category: 'Art',
    status: 'upcoming',
    participantsLimit: 20,
    currentParticipants: 5,
    pointsAwarded: 45,
  },
];

// Real API call
const fetchEvents = async (): Promise<EventData[]> => {
  try {
    const apiClient = (await import('../../utils/api')).default;
    const response = await apiClient.events.getAllEvents();
    
    // Map backend event structure to frontend EventData structure
    return response.data.events.map((event: any) => {
      // Calculate the real-time status based on dates
      const calculatedStatus = calculateEventStatus(event.start_date, event.end_date);
      
      return {
        id: event.event_id,
        title: event.event_name,
        description: event.description,
        image: event.event_image,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        // Use the calculated status instead of the one from the backend
        status: calculatedStatus,
        participantsLimit: event.participant_limit,
        currentParticipants: event.participants ? event.participants.length : 0,
        pointsAwarded: event.points_awarded,
      };
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Helper function to calculate event status based on dates
export const calculateEventStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'completed';
  }
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvents();
  }, []);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const filterEventsByTab = (tabIndex: number): EventData[] => {
    switch (tabIndex) {
      case 0: // All
        return events;
      case 1: // Upcoming
        return events.filter(event => event.status === 'upcoming');
      case 2: // Ongoing
        return events.filter(event => event.status === 'ongoing');
      case 3: // Completed
        return events.filter(event => event.status === 'completed');
      default:
        return events;
    }
  };
  
  return (
    <Layout>
      <Box sx={{ bgcolor: 'background.paper', pt: 6, pb: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" gutterBottom>
            Events
          </Typography>
          
          <Typography variant="h6" component="p" color="text.secondary" paragraph>
            Explore volunteer opportunities and events organized by Samarthanam Trust
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="event tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Events" />
              <Tab label="Upcoming" />
              <Tab label="Ongoing" />
              <Tab label="Completed" />
            </Tabs>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <EventsList 
              events={filterEventsByTab(tabValue)} 
              showFilters={true}
              title={''} // No title as we already have tabs
            />
          )}
        </Container>
      </Box>
    </Layout>
  );
} 