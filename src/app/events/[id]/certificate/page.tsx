'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Box, CircularProgress, Typography, Alert, Button, Paper, Divider, Grid } from '@mui/material';
import { RootState } from '@/redux/store';
import Layout from '@/components/layout/Layout';
import VolunteerCertificate from '@/components/certificates/VolunteerCertificate';
import { sampleEvents } from '../../page';
import Link from 'next/link';
import { logout } from '@/redux/slices/authSlice';
import LogoutIcon from '@mui/icons-material/Logout';

const CertificatePage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const certificateType = searchParams.get('type') as 'volunteer' | 'participant' || 'participant';
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  
  // Fetch event data
  useEffect(() => {
    if (!params.id) {
      setError('Event ID is missing');
      setLoading(false);
      return;
    }

    // In a real app, this would be an API call to fetch the event
    try {
      // Find event in sample data
      const eventData = sampleEvents.find(e => e.id === params.id);
      if (!eventData) {
        setError('Event not found');
      } else {
        setEvent(eventData);
        
        // Check if user is registered for this event
        if (isAuthenticated && user) {
          const isRegistered = user.registeredEvents?.includes(params.id as string);
          if (!isRegistered) {
            setError('You are not registered for this event');
          } else {
            // Auto-open certificate
            setCertificateOpen(true);
          }
        } else {
          setError('You must be logged in to view certificates');
        }
      }
    } catch (err) {
      setError('Failed to load event data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id, isAuthenticated, user]);
  
  const handleCloseCertificate = () => {
    setCertificateOpen(false);
    // Navigate back to event page
    router.push(`/events/${params.id}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };
  
  if (loading) {
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
  
  if (error) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box display="flex" justifyContent="center">
            <Button 
              variant="contained" 
              component={Link} 
              href={`/events/${params.id}`}
            >
              Return to Event
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (!event) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error">Event not found</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {certificateType === 'volunteer' ? 'Volunteer Certificate' : 'Participation Certificate'}
          </Typography>
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
        </Box>
        
        <Box textAlign="center" mb={4}>
          <Typography variant="body1" color="text.secondary">
            For {event.title}
          </Typography>
          
          {!certificateOpen && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setCertificateOpen(true)}
              sx={{ mt: 3 }}
            >
              View Certificate
            </Button>
          )}
        </Box>
        
        {/* Certificate Component */}
        <VolunteerCertificate
          open={certificateOpen}
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
            volunteerHours: event.hoursRequired || 4,
          }}
          certificateType={certificateType}
        />
      </Container>
    </Layout>
  );
};

export default CertificatePage; 