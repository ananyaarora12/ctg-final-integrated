'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Layout from '../../components/layout/Layout';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  level: number;
  eventsParticipated: number;
  hoursVolunteered: number;
  badges: number;
  rank: number;
}

// Sample data
const leaderboardData: LeaderboardUser[] = [
  {
    id: 'user1',
    name: 'Rahul Sharma',
    points: 850,
    level: 5,
    eventsParticipated: 12,
    hoursVolunteered: 48,
    badges: 8,
    rank: 1,
  },
  {
    id: 'user2',
    name: 'Priya Patel',
    points: 720,
    level: 4,
    eventsParticipated: 10,
    hoursVolunteered: 42,
    badges: 6,
    rank: 2,
  },
  {
    id: 'user3',
    name: 'Arjun Nair',
    points: 685,
    level: 4,
    eventsParticipated: 9,
    hoursVolunteered: 38,
    badges: 7,
    rank: 3,
  },
  {
    id: 'user4',
    name: 'Anjali Singh',
    points: 610,
    level: 4,
    eventsParticipated: 8,
    hoursVolunteered: 32,
    badges: 5,
    rank: 4,
  },
  {
    id: 'user5',
    name: 'Vikram Reddy',
    points: 590,
    level: 3,
    eventsParticipated: 7,
    hoursVolunteered: 30,
    badges: 5,
    rank: 5,
  },
  {
    id: 'user6',
    name: 'Saanvi Desai',
    points: 550,
    level: 3,
    eventsParticipated: 8,
    hoursVolunteered: 28,
    badges: 4,
    rank: 6,
  },
  {
    id: 'user7',
    name: 'Rohan Kapoor',
    points: 520,
    level: 3,
    eventsParticipated: 7,
    hoursVolunteered: 26,
    badges: 4,
    rank: 7,
  },
  {
    id: 'user8',
    name: 'Neha Gupta',
    points: 480,
    level: 3,
    eventsParticipated: 6,
    hoursVolunteered: 24,
    badges: 3,
    rank: 8,
  },
  {
    id: 'user9',
    name: 'Mihir Joshi',
    points: 430,
    level: 2,
    eventsParticipated: 5,
    hoursVolunteered: 20,
    badges: 3,
    rank: 9,
  },
  {
    id: 'user10',
    name: 'Deepa Kumar',
    points: 385,
    level: 2,
    eventsParticipated: 5,
    hoursVolunteered: 18,
    badges: 2,
    rank: 10,
  },
];

// Mock API call
const fetchLeaderboardData = async (period: string): Promise<LeaderboardUser[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For a real application, you would filter the data based on the period
  return leaderboardData;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Get time periods based on tab value
  const getTimePeriod = (tabIndex: number): string => {
    switch (tabIndex) {
      case 0: return 'all-time';
      case 1: return 'monthly';
      case 2: return 'weekly';
      default: return 'all-time';
    }
  };
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const period = getTimePeriod(tabValue);
        const data = await fetchLeaderboardData(period);
        setLeaderboard(data);
      } catch (err) {
        setError('Failed to load leaderboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [tabValue]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Get level color based on level
  const getLevelColor = (level: number): string => {
    switch (level) {
      case 5: return 'error'; // Red - highest
      case 4: return 'warning'; // Orange
      case 3: return 'success'; // Green
      case 2: return 'info'; // Blue
      case 1: return 'default'; // Grey
      default: return 'default';
    }
  };
  
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Volunteer Leaderboard
        </Typography>
        
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="leaderboard tabs"
            variant="fullWidth"
          >
            <Tab label="All Time" />
            <Tab label="This Month" />
            <Tab label="This Week" />
          </Tabs>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Top 3 Simplified */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {leaderboard.slice(0, 3).map((user) => (
                <Grid item xs={12} sm={4} key={user.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      position: 'relative',
                      borderTop: `4px solid ${
                        user.rank === 1 
                          ? '#FFD700' // Gold
                          : user.rank === 2
                            ? '#C0C0C0' // Silver
                            : '#CD7F32' // Bronze
                      }`,
                    }}
                  >
                    <Box sx={{ mb: 1 }}>
                      <EmojiEventsIcon 
                        sx={{ 
                          fontSize: 32, 
                          color: user.rank === 1 
                            ? '#FFD700' 
                            : user.rank === 2 
                              ? '#C0C0C0' 
                              : '#CD7F32'
                        }} 
                      />
                    </Box>
                    <Typography variant="h6">
                      {user.name}
                    </Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {user.points}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                      <Chip 
                        label={`Level ${user.level}`} 
                        color={getLevelColor(user.level)} 
                        size="small"
                      />
                      <Chip 
                        label={`${user.eventsParticipated} Events`}
                        variant="outlined" 
                        size="small" 
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Leaderboard table - Simplified */}
            <TableContainer component={Paper} elevation={2}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', width: '10%' }}>Rank</TableCell>
                    <TableCell sx={{ color: 'white', width: '25%' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', width: '15%' }}>Level</TableCell>
                    <TableCell sx={{ color: 'white', width: '15%' }} align="right">Points</TableCell>
                    <TableCell sx={{ color: 'white', width: '15%' }} align="right">Events</TableCell>
                    <TableCell sx={{ color: 'white', width: '20%' }} align="right">Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((user) => (
                    <TableRow 
                      key={user.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                        bgcolor: user.rank <= 3 ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={user.rank <= 3 ? 'bold' : 'regular'}>
                          {user.rank}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`Level ${user.level}`} 
                          color={getLevelColor(user.level)} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {user.points}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {user.eventsParticipated}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {user.hoursVolunteered}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Layout>
  );
} 