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
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLeaderboard } from '../../redux/actions/userActions';
import { UserProfile } from '../../redux/slices/userSlice';

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

// Get time periods based on tab value
const getTimePeriod = (tabIndex: number): string => {
  switch (tabIndex) {
    case 0: return 'all-time';
    case 1: return 'monthly';
    case 2: return 'weekly';
    default: return 'all-time';
  }
};

// Map UserProfile from Redux to LeaderboardUser format
const mapProfileToLeaderboardUser = (profile: UserProfile, index: number): LeaderboardUser => {
  return {
    id: profile.id,
    name: profile.displayName,
    points: profile.points,
    level: profile.level,
    eventsParticipated: profile.eventsAttended.length,
    hoursVolunteered: profile.hoursVolunteered,
    badges: profile.badges.length,
    rank: index + 1,
  };
};

export default function LeaderboardPage() {
  const dispatch = useAppDispatch();
  const { leaderboard: reduxLeaderboard, isLoading, error: reduxError } = useAppSelector(state => state.user);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const period = getTimePeriod(tabValue);
        await dispatch(fetchLeaderboard(period));
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard data. Please try again later.');
        console.error(err);
      }
    };
    
    loadLeaderboard();
  }, [dispatch, tabValue]);
  
  // Map Redux profiles to LeaderboardUser format when reduxLeaderboard changes
  useEffect(() => {
    if (reduxLeaderboard?.length > 0) {
      // Sort by points in descending order before mapping
      const sortedLeaderboard = [...reduxLeaderboard]
        .sort((a, b) => b.points - a.points)
        .map(mapProfileToLeaderboardUser);
      
      setLeaderboard(sortedLeaderboard);
    }
  }, [reduxLeaderboard]);

  // Set error from Redux if it exists
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);
  
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
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : leaderboard.length === 0 ? (
          <Alert severity="info">No leaderboard data available for this time period.</Alert>
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