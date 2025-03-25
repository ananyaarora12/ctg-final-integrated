'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  FormControl, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  InputLabel, 
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardMedia,
  ListItemText,
  ListItem,
  List
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsIcon from '@mui/icons-material/Sports';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format, parseISO } from 'date-fns';
import Layout from '../../components/layout/Layout';
import { THEME_COLORS } from '../../components/layout/Layout';
import { sampleEvents } from '../events/page';
import { EventData } from '../../components/events/EventCard';

// Donation options
const donationOptions = [
  { 
    id: 'education', 
    title: 'Education Support', 
    description: 'Help provide education to children with disabilities',
    amounts: [1000, 5000, 10000, 20000],
    icon: <SchoolIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />
  },
  { 
    id: 'livelihood', 
    title: 'Livelihood Program', 
    description: 'Support skills training and job placement for people with disabilities',
    amounts: [1000, 5000, 10000, 20000],
    icon: <WorkIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />
  },
  { 
    id: 'arts', 
    title: 'Arts & Culture', 
    description: 'Support disabled artists in music and performing arts',
    amounts: [1000, 5000, 10000, 20000],
    icon: <MusicNoteIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />
  },
  { 
    id: 'sports', 
    title: 'Sports Programs', 
    description: 'Help visually impaired and disabled athletes achieve their dreams',
    amounts: [1000, 5000, 10000, 20000],
    icon: <SportsIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />
  },
  { 
    id: 'nutrition', 
    title: 'Nutrition & Meals', 
    description: 'Provide nutritious meals to children with disabilities',
    amounts: [1000, 5000, 10000, 20000],
    icon: <RestaurantIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} />
  },
];

export default function DonatePage() {
  const [selectedCategory, setSelectedCategory] = useState('education');
  const [donationAmount, setDonationAmount] = useState<number | string>(1000);
  const [customAmount, setCustomAmount] = useState<boolean>(false);
  const [donorType, setDonorType] = useState('individual');
  const [donationPurpose, setDonationPurpose] = useState('general');
  const [activeEvents, setActiveEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>(''); // Store the event ID
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panCard: '',
    message: '',
    dedicateName: '',
    organizationName: '',
    donationDate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch active events (upcoming and ongoing)
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, filter from the sample events
    const filteredEvents = sampleEvents.filter(
      event => event.status === 'upcoming' || event.status === 'ongoing'
    );
    setActiveEvents(filteredEvents);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCustomAmount(false);
    // Set first default amount for the selected category
    const categoryData = donationOptions.find(option => option.id === category);
    if (categoryData) {
      setDonationAmount(categoryData.amounts[0]);
    }
  };

  const handleAmountChange = (amount: number | string) => {
    setDonationAmount(amount);
    setCustomAmount(false);
  };

  const handleCustomAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDonationAmount(event.target.value);
  };

  const handleCustomAmountToggle = () => {
    setCustomAmount(true);
    setDonationAmount('');
  };

  const handleDonorTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDonorType((event.target as HTMLInputElement).value);
  };

  const handleDonationPurposeChange = (event: SelectChangeEvent) => {
    setDonationPurpose(event.target.value);
  };

  const handleEventChange = (event: SelectChangeEvent) => {
    setSelectedEvent(event.target.value);
    
    // If an event is selected, set the category based on the event's category
    if (event.target.value) {
      const selectedEventObj = activeEvents.find(e => e.id === event.target.value);
      if (selectedEventObj) {
        // Find matching donation category or default to first category
        const matchingCategory = donationOptions.find(
          option => option.id.toLowerCase() === selectedEventObj.category.toLowerCase()
        );
        
        if (matchingCategory) {
          setSelectedCategory(matchingCategory.id);
        } else {
          // If no direct match, default to education or first available category
          setSelectedCategory(donationOptions[0].id);
        }
        
        // Set default donation amount for the category
        const categoryData = donationOptions.find(
          option => option.id === (matchingCategory ? matchingCategory.id : donationOptions[0].id)
        );
        if (categoryData) {
          setDonationAmount(categoryData.amounts[0]);
          setCustomAmount(false);
        }
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTitleChange = (event: SelectChangeEvent) => {
    setFormData({
      ...formData,
      title: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Form validation
    if (!formData.firstName || !formData.email || !formData.phone) {
      setError('Please fill all required fields');
      return;
    }
    
    // Ensure the donation date is the current date/time when submitted
    const donationPayload = {
      ...formData,
      donationDate: new Date().toISOString(),
      amount: donationAmount,
      category: selectedCategory,
      donorType: donorType,
      donationPurpose: donationPurpose,
      eventId: selectedEvent || null, // Include the selected event ID if any
      event: selectedEvent ? activeEvents.find(e => e.id === selectedEvent) : null // Include event details
    };
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the payload that would be sent to the server
      console.log('Donation payload:', donationPayload);
      
      // If donation was successful
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        panCard: '',
        message: '',
        dedicateName: '',
        organizationName: '',
        donationDate: new Date().toISOString(),
      });
      setSelectedEvent('');
      
    } catch (err) {
      setError('Failed to process donation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  const getCurrentCategory = () => {
    return donationOptions.find(option => option.id === selectedCategory) || donationOptions[0];
  };

  const selectedEventDetails = selectedEvent 
    ? activeEvents.find(event => event.id === selectedEvent) 
    : null;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {success ? (
          <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <FavoriteIcon color="primary" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Thank You for Your Donation!
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your contribution of ₹{typeof donationAmount === 'string' ? parseInt(donationAmount, 10).toLocaleString() : donationAmount.toLocaleString()} will make a difference.
              </Typography>
              <Typography variant="body1" paragraph>
                A confirmation has been sent to your email.
              </Typography>
              
              {selectedEventDetails && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="body1" fontWeight="bold">
                    Your donation is supporting:
                  </Typography>
                  <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                    {selectedEventDetails.title}
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
              >
                Make Another Donation
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Donate to Support Our Mission
            </Typography>
            <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
              Your donations help us create opportunities and provide support for people with disabilities across India.
            </Typography>
            
            <Grid container spacing={4}>
              {/* Donation form */}
              <Grid item xs={12} md={7}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Donation Details
                    </Typography>

                    {/* Event selection section */}
                    <Box sx={{ mb: 4, mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Support a Specific Event (Optional)
                      </Typography>
                      
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="event-select-label">Select an Event to Support</InputLabel>
                        <Select
                          labelId="event-select-label"
                          id="event-select"
                          value={selectedEvent}
                          label="Select an Event to Support"
                          onChange={handleEventChange}
                        >
                          <MenuItem value="">
                            <em>General donation (not event specific)</em>
                          </MenuItem>
                          {activeEvents.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.title} - {event.status === 'upcoming' ? 'Upcoming' : 'Ongoing'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {selectedEventDetails && (
                        <Card variant="outlined" sx={{ mb: 3, mt: 2 }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={selectedEventDetails.image}
                            alt={selectedEventDetails.title}
                          />
                          <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                              {selectedEventDetails.title}
                            </Typography>
                            <List dense>
                              <ListItem>
                                <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                                <ListItemText 
                                  primary={format(parseISO(selectedEventDetails.startDate), 'MMMM dd, yyyy')}
                                />
                              </ListItem>
                              <ListItem>
                                <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                                <ListItemText primary={selectedEventDetails.location} />
                              </ListItem>
                            </List>
                            <Typography variant="body2" color="text.secondary">
                              Your donation will directly support this event
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Box>

                    {/* Donation categories - only show if no event is selected */}
                    {!selectedEvent && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Select a Donation Category
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                          {donationOptions.map((option) => (
                            <Grid item xs={6} sm={4} key={option.id}>
                              <Paper 
                                elevation={selectedCategory === option.id ? 3 : 1}
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center',
                                  border: selectedCategory === option.id ? `2px solid ${THEME_COLORS.primary}` : 'none',
                                  cursor: 'pointer',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => handleCategoryChange(option.id)}
                              >
                                {option.icon}
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>{option.title}</Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                    
                    {/* Display selected category when event is chosen */}
                    {selectedEvent && selectedEventDetails && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Donation Category
                        </Typography>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            border: `2px solid ${THEME_COLORS.primary}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          {getCurrentCategory().icon}
                          <Box>
                            <Typography variant="subtitle2">
                              {getCurrentCategory().title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getCurrentCategory().description}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>
                    )}
                    
                    {/* Donation amount */}
                    <Typography variant="subtitle1" gutterBottom>
                      Donation Amount (₹)
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {getCurrentCategory().amounts.map((amount) => (
                        <Grid item key={amount}>
                          <Chip
                            label={`₹${amount.toLocaleString()}`}
                            onClick={() => handleAmountChange(amount)}
                            color={donationAmount === amount ? "primary" : "default"}
                            variant={donationAmount === amount ? "filled" : "outlined"}
                            sx={{ fontSize: '1rem', py: 1 }}
                          />
                        </Grid>
                      ))}
                      <Grid item>
                        <Chip
                          label="Custom"
                          onClick={handleCustomAmountToggle}
                          color={customAmount ? "primary" : "default"}
                          variant={customAmount ? "filled" : "outlined"}
                          sx={{ fontSize: '1rem', py: 1 }}
                        />
                      </Grid>
                    </Grid>
                    
                    {customAmount && (
                      <TextField
                        label="Enter amount"
                        variant="outlined"
                        fullWidth
                        value={donationAmount}
                        onChange={handleCustomAmountChange}
                        type="number"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                        }}
                        sx={{ mb: 3 }}
                      />
                    )}
                    
                    {/* Donor type */}
                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Donor Type
                      </Typography>
                      <RadioGroup
                        row
                        value={donorType}
                        onChange={handleDonorTypeChange}
                      >
                        <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                        <FormControlLabel value="organization" control={<Radio />} label="Organization" />
                      </RadioGroup>
                    </FormControl>
                    
                    {/* Organization name if organization type selected */}
                    {donorType === 'organization' && (
                      <TextField
                        label="Organization Name"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 3 }}
                        required
                      />
                    )}
                    
                    {/* Donation purpose */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="donation-purpose-label">Donation Purpose</InputLabel>
                      <Select
                        labelId="donation-purpose-label"
                        value={donationPurpose}
                        onChange={handleDonationPurposeChange}
                        label="Donation Purpose"
                      >
                        <MenuItem value="general">General Support</MenuItem>
                        <MenuItem value="memorial">In Memory</MenuItem>
                        <MenuItem value="honor">In Honor</MenuItem>
                        <MenuItem value="corporate">Corporate Giving</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {/* In memory / honor of */}
                    {(donationPurpose === 'memorial' || donationPurpose === 'honor') && (
                      <TextField
                        label={donationPurpose === 'memorial' ? 'In Memory of' : 'In Honor of'}
                        name="dedicateName"
                        value={formData.dedicateName}
                        onChange={handleInputChange}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 3 }}
                      />
                    )}
                    
                    <Divider sx={{ my: 3 }} />
                    
                    {/* Donor information */}
                    <Typography variant="h6" component="h2" gutterBottom>
                      Donor Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={2}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="title-label">Title</InputLabel>
                          <Select
                            labelId="title-label"
                            value={formData.title}
                            onChange={handleTitleChange}
                            label="Title"
                          >
                            <MenuItem value="Mr">Mr</MenuItem>
                            <MenuItem value="Mrs">Mrs</MenuItem>
                            <MenuItem value="Ms">Ms</MenuItem>
                            <MenuItem value="Dr">Dr</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          fullWidth
                          required
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="State"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="PAN Card (for tax benefits)"
                          name="panCard"
                          value={formData.panCard}
                          onChange={handleInputChange}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Message (Optional)"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          multiline
                          rows={3}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </Grid>
                    
                    {error && (
                      <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                      </Alert>
                    )}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{ mt: 2, py: 1.5 }}
                    >
                      {loading ? <CircularProgress size={24} /> : `Donate ₹${typeof donationAmount === 'string' ? parseInt(donationAmount, 10).toLocaleString() : donationAmount.toLocaleString()}`}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Right sidebar with donation info */}
              <Grid item xs={12} md={5}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {getCurrentCategory().title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {getCurrentCategory().description}
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Impact of Your Donation
                    </Typography>
                    <List>
                      <ListItem>
                        <FavoriteIcon color="error" sx={{ mr: 2 }} />
                        <ListItemText primary="₹1,000 can provide educational materials for a visually impaired student for a month" />
                      </ListItem>
                      <ListItem>
                        <FavoriteIcon color="error" sx={{ mr: 2 }} />
                        <ListItemText primary="₹5,000 can cover a month of skill development training for a person with disability" />
                      </ListItem>
                      <ListItem>
                        <FavoriteIcon color="error" sx={{ mr: 2 }} />
                        <ListItemText primary="₹10,000 can fund assistive technology for improving accessibility" />
                      </ListItem>
                      <ListItem>
                        <FavoriteIcon color="error" sx={{ mr: 2 }} />
                        <ListItemText primary="₹20,000 can support a major community program or event" />
                      </ListItem>
                    </List>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events Needing Support
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {activeEvents.slice(0, 3).map((event) => (
                      <Box 
                        key={event.id} 
                        sx={{ 
                          display: 'flex', 
                          mb: 2, 
                          p: 1, 
                          borderRadius: 1,
                          backgroundColor: selectedEvent === event.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                        onClick={() => setSelectedEvent(event.id)}
                      >
                        <Box
                          component="img"
                          src={event.image}
                          alt={event.title}
                          sx={{ width: 60, height: 60, borderRadius: 1, mr: 2, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="subtitle2">{event.title}</Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {format(parseISO(event.startDate), 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Tax Benefits
                  </Typography>
                  <Typography variant="body2" paragraph>
                    All donations are eligible for tax exemption under Section 80G of the Income Tax Act, 1961. You will receive a receipt for your donation.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
        
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Thank you for your donation!
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
} 