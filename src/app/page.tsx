'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout, { THEME_COLORS } from '../components/layout/Layout';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import SchoolIcon from '@mui/icons-material/School';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import BarChartIcon from '@mui/icons-material/BarChart';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import { sampleEvents } from './events/page';

// Extend THEME_COLORS with any additional needed values
const EXTENDED_COLORS = {
  ...THEME_COLORS,
  success: '#4caf50',
  gold: '#FFD700',
  primary: '#3f51b5',
  secondary: '#f50057',
  light: '#ffffff',
  dark: '#121212',
  grey: '#f5f5f5',
};

// Progress data for volunteer initiatives
const progressData = [
  { 
    title: 'Education Support', 
    current: 12750, 
    goal: 15000, 
    percentage: 85, 
    color: EXTENDED_COLORS.secondary,
    icon: <SchoolIcon sx={{ fontSize: 32, color: EXTENDED_COLORS.secondary }} />
  },
  { 
    title: 'Skills Training', 
    current: 3400, 
    goal: 5000, 
    percentage: 68, 
    color: EXTENDED_COLORS.primary,
    icon: <WorkIcon sx={{ fontSize: 32, color: EXTENDED_COLORS.primary }} />
  },
  { 
    title: 'Community Events', 
    current: 360, 
    goal: 500, 
    percentage: 72, 
    color: EXTENDED_COLORS.secondary,
    icon: <CalendarMonthIcon sx={{ fontSize: 32, color: EXTENDED_COLORS.secondary }} />
  },
  { 
    title: 'Job Placements', 
    current: 2325, 
    goal: 2500, 
    percentage: 93, 
    color: EXTENDED_COLORS.primary,
    icon: <WorkIcon sx={{ fontSize: 32, color: EXTENDED_COLORS.primary }} />
  },
];

// Hero carousel images
const heroImages = [
  {
    url: '/images/education.jpg',
    title: 'Education for the Disabled',
    subtitle: 'Providing equal education opportunities to people with disabilities',
  },
  {
    url: '/images/sports.jpg',
    title: 'Blind Cricket Initiative',
    subtitle: 'Promoting sports as a rightful pursuit for people with disabilities',
  },
  {
    url: '/images/arts.jpg',
    title: 'Arts & Culture Programs',
    subtitle: 'Supporting disabled artists in music and performing arts',
  }
];

// Impact statistics
const impactStats = [
  { value: 15000, label: 'Lives Impacted', icon: <GroupsIcon sx={{ fontSize: 40, color: EXTENDED_COLORS.secondary }} /> },
  { value: 350, label: 'Events Completed', icon: <CalendarMonthIcon sx={{ fontSize: 40, color: EXTENDED_COLORS.primary }} /> },
  { value: 750, label: 'Active Volunteers', icon: <VolunteerActivismIcon sx={{ fontSize: 40, color: EXTENDED_COLORS.secondary }} /> },
  { value: 45000, label: 'Volunteer Hours', icon: <AccessibilityNewIcon sx={{ fontSize: 40, color: EXTENDED_COLORS.primary }} /> },
];

// Initiative areas
const initiatives = [
  { 
    title: 'Education', 
    icon: <SchoolIcon sx={{ fontSize: 60, color: EXTENDED_COLORS.primary }} />,
    description: 'Supporting accessible education for visually impaired students through teaching assistance and resource development.',
    image: '/images/education.jpg'
  },
  { 
    title: 'Livelihood', 
    icon: <WorkIcon sx={{ fontSize: 60, color: EXTENDED_COLORS.secondary }} />,
    description: 'Creating job opportunities and skill development programs to enhance employability and independence.',
    image: '/images/livelihood.jpg'
  },
  { 
    title: 'Sports', 
    icon: <GroupsIcon sx={{ fontSize: 60, color: EXTENDED_COLORS.primary }} />,
    description: 'Establishing cricket for the blind and other sports activities to build confidence and abilities.',
    image: '/images/sports.jpg'
  },
  { 
    title: 'Arts & Culture', 
    icon: <BarChartIcon sx={{ fontSize: 60, color: EXTENDED_COLORS.secondary }} />,
    description: 'Supporting artists with disabilities who excel in Indian classical, folk dance and music.',
    image: '/images/arts.jpg'
  },
];

// Testimonials
const testimonials = [
  {
    quote: "I believe in building a society where people with disabilities are potential tax-payers but not dole recipients.",
    name: "Dr. Mahantesh G Kivadasannavar",
    role: "Founder Chairman – Samarthanam International",
    avatar: "/images/founder.jpg"
  },
  {
    quote: "Samarthanam has provided me opportunities to gain new skills that have transformed my life. I'm now more confident and independent.",
    name: "Sai Prasanna",
    role: "Program Beneficiary",
    avatar: "/images/education.jpg"
  },
  {
    quote: "As a volunteer, working with Samarthanam's blind cricket initiative has been an incredible experience. Sport truly empowers people with disabilities.",
    name: "Bhavani Kedia",
    role: "Volunteer",
    avatar: "/images/sports.jpg"
  }
];

// Animation for counting up numbers
interface CountUpAnimationProps {
  end: number;
  duration?: number;
}

const CountUpAnimation = ({ end, duration = 2000 }: CountUpAnimationProps) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return <>{count.toLocaleString()}</>;
};

// Helper function to get featured events based on tab and fetch from API
const getFeaturedEvents = async () => {
  try {
    const apiClient = (await import('../utils/api')).default;
    const response = await apiClient.events.getAllEvents();
    
    // Only include published events
    return response.data.events
      .filter((event: any) => event.publish_event === true)
      .map((event: any) => ({
        id: event.event_id,
        title: event.event_name,
        description: event.description,
        image: event.event_image,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        status: event.status.toLowerCase(),
        participantsLimit: event.participant_limit,
        currentParticipants: event.participants ? event.participants.length : 0,
        pointsAwarded: event.points_awarded,
      }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// Filter featured events based on tab
const filterFeaturedEvents = (events: any[], tab: number) => {
  switch(tab) {
    case 0: // Upcoming
      return events.filter(event => event.status.toLowerCase() === 'upcoming').slice(0, 1);
    case 1: // Trending
      // For trending, we'll use events with high participation rates
      return events
        .filter(event => (event.currentParticipants / event.participantsLimit) > 0.7)
        .slice(0, 1);
    case 2: // New
      // For new events, we'll use the most recent upcoming events
      return events
        .filter(event => event.status.toLowerCase() === 'upcoming')
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 1);
    default:
      return events.length > 0 ? [events[0]] : [];
  }
};

export default function HomePage() {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroImages.length);
  };

  const handlePrevSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setLoadingEvents(true);
        const fetchedEvents = await getFeaturedEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    fetchEventsData();
  }, []);

  // Hero carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentHeroSlide]);

  return (
    <Layout>
      {/* Hero Carousel Section */}
      <Box 
        sx={{ 
          position: 'relative',
          height: { xs: '60vh', md: '80vh' },
          overflow: 'hidden',
        }}
      >
        {heroImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: currentHeroSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: EXTENDED_COLORS.light,
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Container maxWidth="md">
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                }}
              >
                {image.title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                {image.subtitle}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/events"
                  sx={{
                    bgcolor: EXTENDED_COLORS.primary,
                    '&:hover': {
                      bgcolor: EXTENDED_COLORS.secondary,
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  Volunteer Now
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/donate"
                  sx={{
                    bgcolor: EXTENDED_COLORS.light,
                    color: EXTENDED_COLORS.primary,
                    '&:hover': {
                      bgcolor: EXTENDED_COLORS.primary,
                      color: EXTENDED_COLORS.light,
                    },
                    px: 4,
                    py: 1.5,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    fontWeight: 'bold',
                  }}
                >
                  Donate
                </Button>
              </Box>
            </Container>
          </Box>
        ))}
        
        {/* Carousel navigation buttons */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 0, 
            right: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2 
          }}
        >
          {heroImages.map((_, index) => (
            <Box 
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                backgroundColor: currentHeroSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
        
        <IconButton 
          sx={{ 
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.2)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
            display: { xs: 'none', md: 'flex' }
          }}
          onClick={handlePrevSlide}
        >
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>
        
        <IconButton 
          sx={{ 
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.2)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
            display: { xs: 'none', md: 'flex' }
          }}
          onClick={handleNextSlide}
        >
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      </Box>
      
      {/* Impact Statistics Section - Floating Design */}
      <Box 
        sx={{ 
          py: 10, 
          position: 'relative',
          overflow: 'hidden',
          background: EXTENDED_COLORS.grey,
        }}
      >
        {/* Background decoration elements */}
        <Box sx={{ 
          position: 'absolute', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${EXTENDED_COLORS.secondary}14 0%, ${EXTENDED_COLORS.secondary}00 70%)`,
          top: '-100px',
          left: '-100px',
          zIndex: 0
        }} />
        
        <Box sx={{ 
          position: 'absolute', 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${EXTENDED_COLORS.primary}14 0%, ${EXTENDED_COLORS.primary}00 70%)`,
          bottom: '50px',
          right: '10%',
          zIndex: 0
        }} />
        
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            px: { xs: 2, md: 3 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 3, md: 0 },
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'translateY(20px)'
          }}>
            {impactStats.map((stat, index) => (
              <Box 
                key={index} 
                sx={{
                  width: { xs: '45%', sm: '45%', md: '22%' },
                  position: 'relative',
                  transform: { 
                    xs: 'none', 
                    md: `translateY(${index % 2 === 0 ? '-20px' : '20px'})` 
                  },
                  zIndex: 2,
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: { 
                      xs: 'translateY(-10px)', 
                      md: `translateY(${index % 2 === 0 ? '-30px' : '10px'})` 
                    },
                  },
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: index % 2 === 0 ? EXTENDED_COLORS.secondary : EXTENDED_COLORS.primary,
                    }
                  }}
                >
                  <Box sx={{ 
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '60px'
                  }}>
                    {React.cloneElement(stat.icon, { 
                      sx: { 
                        fontSize: 50,
                        color: index % 2 === 0 ? EXTENDED_COLORS.secondary : EXTENDED_COLORS.primary 
                      } 
                    })}
                  </Box>
                  
                  <Typography
                    variant="h3"
                    component="p"
                    sx={{ 
                      fontWeight: 800,
                      lineHeight: 1.1,
                      mb: 1,
                      color: index % 2 === 0 ? EXTENDED_COLORS.secondary : EXTENDED_COLORS.primary,
                      fontSize: { xs: '2.5rem', md: '3rem' }
                    }}
                  >
                    <CountUpAnimation end={stat.value} />+
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: EXTENDED_COLORS.dark,
                      fontSize: '1.1rem'
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
      
      {/* Initiatives Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ position: 'relative', mb: 4, display: 'inline-block', mx: 'auto', width: '100%', textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              color: EXTENDED_COLORS.secondary
            }}
          >
            Our Initiatives
          </Typography>
          <Box 
            sx={{ 
              width: '60px', 
              height: '4px', 
              backgroundColor: EXTENDED_COLORS.primary,
              mx: 'auto',
              mb: 3
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          component="p"
          align="center"
          color={EXTENDED_COLORS.dark}
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          Focused on creating meaningful impact through these key areas
        </Typography>
        
        <Grid container spacing={3}>
          {initiatives.map((initiative, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box 
                  sx={{ 
                    height: '120px', 
                    backgroundColor: index % 2 === 0 ? EXTENDED_COLORS.secondary : EXTENDED_COLORS.primary,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white'
                  }}
                >
                  {initiative.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1, color: EXTENDED_COLORS.dark }}>
                    {initiative.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {initiative.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Featured Events Section with minimalist design */}
      <Box 
        sx={{ 
          py: 8,
          background: EXTENDED_COLORS.dark,
          color: EXTENDED_COLORS.light,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            sx={{ 
              mb: 2,
              fontWeight: 'bold',
              color: EXTENDED_COLORS.light,
            }}
          >
            Featured Events
          </Typography>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              mb: 4,
              '& .MuiTabs-indicator': {
                backgroundColor: EXTENDED_COLORS.primary,
                height: 3,
              },
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: EXTENDED_COLORS.light,
                },
              },
            }}
          >
            <Tab label="Upcoming" />
            <Tab label="Trending" />
            <Tab label="New" />
          </Tabs>
          
          <Box sx={{ mt: 4 }}>
            {loadingEvents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : events.length === 0 ? (
              <Typography variant="h5" align="center" sx={{ my: 4 }}>
                No published events available
              </Typography>
            ) : (
              /* Single large featured event based on active tab */
              filterFeaturedEvents(events, activeTab).map((event) => (
                <Card 
                  key={event.id}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    borderRadius: 3,
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', md: '40%' },
                      height: { xs: '200px', md: '400px' },
                      objectFit: 'cover'
                    }}
                    image={event.image || '/images/event-placeholder.jpg'}
                    alt={event.title}
                  />
                  <CardContent sx={{ 
                    flex: 1, 
                    p: { xs: 2, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2
                      }}
                    >
                      <Chip 
                        label={event.category}
                        size="small"
                        sx={{ 
                          bgcolor: EXTENDED_COLORS.primary,
                          color: EXTENDED_COLORS.light,
                          fontWeight: 500,
                        }} 
                      />
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          <StarIcon sx={{ fontSize: 18, color: EXTENDED_COLORS.gold, verticalAlign: 'text-bottom' }} />
                          {event.pointsAwarded} points
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {event.title}
                    </Typography>
                    
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 2,
                        mb: 2
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                        {event.location}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        mb: 3,
                        flexGrow: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {event.description}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                          {event.currentParticipants} / {event.participantsLimit} participants
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(event.currentParticipants / event.participantsLimit) * 100}
                          sx={{ 
                            width: 150, 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'rgba(0,0,0,0.1)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: EXTENDED_COLORS.success
                            }
                          }}
                        />
                      </Box>
                      
                      <Button
                        component={Link}
                        href={`/events/${event.id}`}
                        variant="contained"
                        color="primary"
                        sx={{ 
                          borderRadius: 2,
                          px: 3
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              component={Link}
              href="/events"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                borderColor: EXTENDED_COLORS.primary,
                color: EXTENDED_COLORS.light, 
                borderWidth: 2,
                px: 4,
                py: 1.5,
                borderRadius: 8,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: EXTENDED_COLORS.primary,
                  backgroundColor: `${EXTENDED_COLORS.primary}33`,
                  borderWidth: 2,
                },
              }}
            >
              Explore All Events
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Upcoming Events Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ position: 'relative', mb: 4, display: 'inline-block', mx: 'auto', width: '100%', textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              color: EXTENDED_COLORS.secondary
            }}
          >
            Upcoming Events
          </Typography>
          <Box 
            sx={{ 
              width: '60px', 
              height: '4px', 
              backgroundColor: EXTENDED_COLORS.primary,
              mx: 'auto',
              mb: 3
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          component="p"
          align="center"
          color={EXTENDED_COLORS.dark}
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          Join us for these exciting upcoming volunteer opportunities
        </Typography>
        
        {loadingEvents ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Typography variant="h5" align="center" sx={{ my: 4 }}>
            No upcoming events available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {events
              .filter(event => event.status.toLowerCase() === 'upcoming')
              .slice(0, 6)
              .map(event => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardActionArea component={Link} href={`/events/${event.id}`}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={event.image || '/images/event-placeholder.jpg'}
                          alt={event.title}
                        />
                        <Chip 
                          label={event.category}
                          size="small"
                          sx={{ 
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: EXTENDED_COLORS.primary,
                            color: EXTENDED_COLORS.light,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 700 }}>
                          {event.title}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 1
                          }}
                        >
                          <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 2
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {event.location}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {event.description}
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            mt: 'auto'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.currentParticipants}/{event.participantsLimit}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StarIcon sx={{ fontSize: 16, mr: 0.5, color: EXTENDED_COLORS.gold }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.pointsAwarded} points
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))
            }
          </Grid>
        )}
        
        {events.length > 0 && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button 
              variant="contained"
              component={Link}
              href="/events"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                px: 4,
                py: 1.2,
                borderRadius: 8,
              }}
            >
              View All Events
            </Button>
          </Box>
        )}
      </Container>
      
      {/* Volunteer Progress Chart */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ position: 'relative', mb: 4, display: 'inline-block', mx: 'auto', width: '100%', textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ 
              mb: 1,
              fontWeight: 'bold',
              color: EXTENDED_COLORS.secondary
            }}
          >
            Volunteer Progress
          </Typography>
          <Box 
            sx={{ 
              width: '60px', 
              height: '4px', 
              backgroundColor: EXTENDED_COLORS.primary,
              mx: 'auto',
              mb: 3
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          component="p"
          align="center"
          color={EXTENDED_COLORS.dark}
          sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
        >
          Track our collective impact across key initiatives
        </Typography>
        
        <Box sx={{ 
          background: EXTENDED_COLORS.light,
          borderRadius: 3, 
          p: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
        }}>
          <Grid container spacing={3}>
            {progressData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  height: '100%',
                  p: 2,
                  backgroundColor: EXTENDED_COLORS.light,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {item.icon}
                    <Typography variant="h6" fontWeight="bold" sx={{ ml: 1, color: EXTENDED_COLORS.dark }}>
                      {item.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      bottom: 0,
                      width: '70%',
                      height: `${Math.max(item.percentage, 5)}%`,
                      borderRadius: '8px 8px 0 0',
                      background: `linear-gradient(180deg, ${item.color}BB 0%, ${item.color} 100%)`,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      pt: 1,
                      boxShadow: `0 4px 12px ${item.color}40`,
                      '&:hover': {
                        height: `${Math.min(item.percentage + 3, 100)}%`,
                        background: `linear-gradient(180deg, ${item.color} 0%, ${item.color} 100%)`,
                      },
                      transition: 'height 0.3s ease, background 0.3s ease',
                    }}>
                      <Typography variant="h5" sx={{ color: EXTENDED_COLORS.light, fontWeight: 'bold' }}>
                        {item.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      {item.current.toLocaleString()} / {item.goal.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: item.color }}>
                      {item.current > 0 ? `${Math.round((item.current / item.goal) * 100)}% Complete` : 'Not Started'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}
