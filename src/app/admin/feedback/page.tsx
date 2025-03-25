'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Layout from '../../../components/layout/Layout';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../redux/store';
import { THEME_COLORS } from '../../../components/layout/Layout';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Container,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Email as EmailIcon,
  ThumbsUpDown as ThumbsUpDownIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export default function FeedbackInsights() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');
  const [feedbackType, setFeedbackType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router, user?.role]);

  // Mock data for statistics
  const stats = {
    totalFeedbacks: 645,
    averageRating: 4.2,
    positivePercentage: '78%',
    neutralPercentage: '15%',
    negativePercentage: '7%',
    responseRate: '92%',
  };

  // Mock data for charts
  const sentimentData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [78, 15, 7],
        backgroundColor: [THEME_COLORS.orange, '#90caf9', '#f44336'],
        borderWidth: 0,
      },
    ],
  };

  const categoryRatingsData = {
    labels: ['Event Organization', 'Staff Behavior', 'Facilities', 'Communication'],
    datasets: [
      {
        label: 'Average Rating',
        data: [4.5, 4.7, 3.9, 4.3],
        backgroundColor: THEME_COLORS.orange,
        borderRadius: 4,
      }
    ],
  };

  const sentimentTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Positive',
        data: [75, 78, 76, 79, 80, 82],
        borderColor: THEME_COLORS.orange,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Neutral',
        data: [18, 16, 15, 14, 13, 12],
        borderColor: '#90caf9',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Negative',
        data: [7, 6, 9, 7, 7, 6],
        borderColor: '#f44336',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      }
    ],
  };

  // Mock data for recent feedback
  const recentFeedback = [
    {
      id: 1,
      name: 'Rahul Sharma',
      type: 'Volunteer',
      event: 'Charity Run 2023',
      rating: 5,
      sentiment: 'positive',
      comment: 'Extremely well organized event. The staff was very supportive and everything ran smoothly.',
      date: '2023-06-15',
    },
    {
      id: 2,
      name: 'Priya Singh',
      type: 'Participant',
      event: 'Art Exhibition',
      rating: 4,
      sentiment: 'positive',
      comment: 'Great exhibition showcasing amazing talent. Would have liked more information about artists.',
      date: '2023-06-10',
    },
    {
      id: 3,
      name: 'Amit Patel',
      type: 'Volunteer',
      event: 'Education Workshop',
      rating: 3,
      sentiment: 'neutral',
      comment: 'The workshop was informative but could have been more interactive with the participants.',
      date: '2023-06-05',
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      type: 'Participant',
      event: 'Digital Literacy Camp',
      rating: 2,
      sentiment: 'negative',
      comment: "The camp was too advanced for beginners. Many participants could not keep up with the pace.",
      date: '2023-05-28',
    },
  ];

  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  const handleFeedbackTypeChange = (event: any) => {
    setFeedbackType(event.target.value);
  };

  const handleEventChange = (event: any) => {
    setSelectedEvent(event.target.value);
  };

  const getSentimentChipColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return { bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', icon: <ThumbUpIcon fontSize="small" /> };
      case 'neutral':
        return { bgcolor: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', icon: <ThumbsUpDownIcon fontSize="small" /> };
      case 'negative':
        return { bgcolor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', icon: <ThumbDownIcon fontSize="small" /> };
      default:
        return { bgcolor: 'rgba(0, 0, 0, 0.1)', color: 'text.primary', icon: null };
    }
  };

  if (isLoading) {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Feedback Insights
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Analyze and respond to participant and volunteer feedback
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={handleTimeRangeChange}
                  label="Time Range"
                >
                  <MenuItem value="week">Last Week</MenuItem>
                  <MenuItem value="month">Last Month</MenuItem>
                  <MenuItem value="quarter">Last Quarter</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Feedback Type</InputLabel>
                <Select
                  value={feedbackType}
                  onChange={handleFeedbackTypeChange}
                  label="Feedback Type"
                >
                  <MenuItem value="all">All Feedback</MenuItem>
                  <MenuItem value="volunteer">Volunteers</MenuItem>
                  <MenuItem value="participant">Participants</MenuItem>
                  <MenuItem value="donor">Donors</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Event</InputLabel>
                <Select
                  value={selectedEvent}
                  onChange={handleEventChange}
                  label="Event"
                >
                  <MenuItem value="all">All Events</MenuItem>
                  <MenuItem value="charity_run">Charity Run 2023</MenuItem>
                  <MenuItem value="education_workshop">Education Workshop</MenuItem>
                  <MenuItem value="art_exhibition">Art Exhibition</MenuItem>
                  <MenuItem value="digital_literacy">Digital Literacy Camp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: THEME_COLORS.orange }}>
                  {stats.totalFeedbacks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Feedbacks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: THEME_COLORS.orange }}>
                  {stats.averageRating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50' }}>
                  {stats.positivePercentage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Positive
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff9800' }}>
                  {stats.neutralPercentage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Neutral
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f44336' }}>
                  {stats.negativePercentage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Negative
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: THEME_COLORS.offBlack }}>
                  {stats.responseRate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Response Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Sentiment Analysis
              </Typography>
              <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={sentimentData} options={{ plugins: { legend: { position: 'bottom' } } }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Category Ratings
              </Typography>
              <Box sx={{ height: 280 }}>
                <Bar
                  data={categoryRatingsData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Sentiment Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={sentimentTrendData}
                  options={{
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: (value: any) => `${value}%`
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Feedback
                </Typography>
                <Button 
                  startIcon={<DownloadIcon />} 
                  size="small"
                  sx={{ color: THEME_COLORS.orange }}
                >
                  Export
                </Button>
              </Box>
              <List sx={{ height: 300, overflow: 'auto' }}>
                {recentFeedback.map((feedback, index) => (
                  <React.Fragment key={feedback.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            bgcolor: THEME_COLORS.orange,
                            mr: 2
                          }}
                        >
                          {feedback.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {feedback.name}
                            </Typography>
                            <Chip
                              icon={getSentimentChipColor(feedback.sentiment).icon}
                              label={feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
                              size="small"
                              sx={{
                                bgcolor: getSentimentChipColor(feedback.sentiment).bgcolor,
                                color: getSentimentChipColor(feedback.sentiment).color,
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" component="div">
                            {feedback.type} • {feedback.event} • Rating: {feedback.rating}/5
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                            {feedback.comment}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(feedback.date).toLocaleDateString()}
                            </Typography>
                            <Button
                              startIcon={<EmailIcon fontSize="small" />}
                              size="small"
                              sx={{ color: THEME_COLORS.orange }}
                            >
                              Respond
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < recentFeedback.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
} 