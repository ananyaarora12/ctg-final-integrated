'use client';

import React from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  CircularProgress, 
  Container, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventCard, { EventData } from './EventCard';

interface EventsListProps {
  events: EventData[];
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  showFilters?: boolean;
  compact?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  isLoading = false,
  error = null,
  title = "Events",
  showFilters = false,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [locationFilter, setLocationFilter] = React.useState('all');
  
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
  };
  
  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocationFilter(event.target.value);
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Get unique categories from events
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(events.map(event => event.category));
    return Array.from(uniqueCategories);
  }, [events]);
  
  // Get unique locations from events
  const locations = React.useMemo(() => {
    const uniqueLocations = new Set(events.map(event => {
      // Extract city from location string (assuming format like "Venue, City")
      const locationParts = event.location.split(',');
      return locationParts.length > 1 
        ? locationParts[locationParts.length - 1].trim() 
        : event.location.trim();
    }));
    return Array.from(uniqueLocations);
  }, [events]);
  
  // Filter events based on search term, category, and location
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      
      const matchesLocation = locationFilter === 'all' || 
                             event.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [events, searchTerm, categoryFilter, locationFilter]);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        
        {showFilters && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <OutlinedInput
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={handleSearch}
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-filter-label">Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={categoryFilter}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="location-filter-label">Location</InputLabel>
                  <Select
                    labelId="location-filter-label"
                    value={locationFilter}
                    label="Location"
                    onChange={handleLocationChange}
                  >
                    <MenuItem value="all">All Locations</MenuItem>
                    {locations.map(location => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>
      
      {filteredEvents.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <Typography align="center" color="text.secondary">
            No events found. Try adjusting your filters.
          </Typography>
        </Box>
      ) : compact ? (
        <Box>
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map(event => (
            <Grid item key={event.id} xs={12} sm={6} md={4}>
              <EventCard event={event} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventsList; 