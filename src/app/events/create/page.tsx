'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Divider,
  Alert,
  Chip,
  FormHelperText,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Snackbar,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Layout from '../../../components/layout/Layout';
import { RootState } from '../../../redux/store';
import { addEvent } from '../../../redux/slices/eventSlice';

// Event categories
const EVENT_CATEGORIES = [
  'Education',
  'Health',
  'Environment',
  'Community',
  'Cultural',
  'Sports',
  'Tech',
  'Fundraising',
  'Other',
];

interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  category: string;
  imageUrl: string;
  participantLimit: number;
  requirements: string[];
  skills: string[];
  ageRestriction: string;
  contact: string;
}

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: null,
    endDate: null,
    category: '',
    imageUrl: 'https://source.unsplash.com/random/800x600/?volunteer',
    participantLimit: 20,
    requirements: [],
    skills: [],
    ageRestriction: 'none',
    contact: '',
  });
  
  useEffect(() => {
    // If not authenticated or not an organizer, redirect to login
    if (isAuthenticated && user) {
      if (user.role !== 'organizer' && user.role !== 'admin') {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };
  
  const handleAddRequirement = () => {
    if (newRequirement.trim() !== '' && !formData.requirements.includes(newRequirement.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()],
      });
      setNewRequirement('');
    }
  };
  
  const handleRemoveRequirement = (requirement: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(item => item !== requirement),
    });
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(item => item !== skill),
    });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to storage and get a URL
      // For now, we'll create a temporary URL
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData({
        ...formData,
        imageUrl: url,
      });
    }
  };
  
  const validateStep = (step: number): boolean => {
    setError(null);
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.title || !formData.description || !formData.location || !formData.category) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
        
      case 1: // Dates & Capacity
        if (!formData.startDate || !formData.endDate) {
          setError('Please select both start and end dates');
          return false;
        }
        
        if (formData.startDate >= formData.endDate) {
          setError('End date must be after start date');
          return false;
        }
        
        if (formData.participantLimit <= 0) {
          setError('Participant limit must be greater than 0');
          return false;
        }
        break;
        
      case 2: // Requirements & Skills
        // These are optional, so no validation needed
        break;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Final validation
    if (!formData.title || !formData.description || !formData.location || !formData.category ||
        !formData.startDate || !formData.endDate || formData.participantLimit <= 0) {
      setError('Please ensure all required fields are filled correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would send this to your API
      // For now, we'll simulate an API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new event with the form data
      const newEvent = {
        id: `event-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        category: formData.category,
        status: 'upcoming' as const,
        organizerId: user?.uid || '',
        organizerName: user?.displayName || 'Anonymous',
        imageUrl: formData.imageUrl,
        participantLimit: formData.participantLimit,
        participants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requirements: formData.requirements,
        skills: formData.skills,
        ageRestriction: formData.ageRestriction,
        contact: formData.contact,
      };
      
      // Dispatch to Redux store
      dispatch(addEvent(newEvent));
      
      // Show success message and reset form
      setSuccess(true);
      resetForm();
      
      // Redirect to the event's page after a delay
      setTimeout(() => {
        router.push(`/events/${newEvent.id}`);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      startDate: null,
      endDate: null,
      category: '',
      imageUrl: 'https://source.unsplash.com/random/800x600/?volunteer',
      participantLimit: 20,
      requirements: [],
      skills: [],
      ageRestriction: 'none',
      contact: '',
    });
    setActiveStep(0);
    setImagePreview(null);
  };
  
  const steps = ['Basic Information', 'Date & Capacity', 'Requirements & Skills', 'Review & Publish'];
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
            
            <TextField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              placeholder="Address or Online"
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                label="Category"
              >
                {EVENT_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Event Image
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  Recommended size: 800x600 pixels
                </Typography>
              </Box>
              
              {imagePreview ? (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Event preview"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No image uploaded yet.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Date and Capacity
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        required: true,
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="End Date & Time"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal',
                        required: true,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            
            <TextField
              label="Participant Limit"
              name="participantLimit"
              type="number"
              value={formData.participantLimit}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                inputProps: { min: 1 },
              }}
              helperText="Maximum number of volunteers who can register"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Age Restriction</InputLabel>
              <Select
                name="ageRestriction"
                value={formData.ageRestriction}
                onChange={handleInputChange}
                label="Age Restriction"
              >
                <MenuItem value="none">No Restrictions</MenuItem>
                <MenuItem value="18+">18 and above</MenuItem>
                <MenuItem value="21+">21 and above</MenuItem>
                <MenuItem value="family">Family Friendly</MenuItem>
                <MenuItem value="children">Children's Event</MenuItem>
              </Select>
              <FormHelperText>Specify if there are age restrictions for this event</FormHelperText>
            </FormControl>
            
            <TextField
              label="Contact Information"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              placeholder="Phone number or email for inquiries"
            />
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Requirements and Skills
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Volunteer Requirements
              </Typography>
              
              <TextField
                label="Add Requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., 'Bring water bottle', 'Comfortable shoes required'"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddRequirement} edge="end">
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.requirements.map((requirement) => (
                  <Chip
                    key={requirement}
                    label={requirement}
                    onDelete={() => handleRemoveRequirement(requirement)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              {formData.requirements.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No requirements added yet. Add any specific items or preparations volunteers should bring or make.
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Desired Skills
              </Typography>
              
              <TextField
                label="Add Skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., 'First Aid Knowledge', 'Photography', 'Teaching'"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleAddSkill} edge="end">
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              {formData.skills.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No skills added yet. Add any specific skills that would be helpful for this event.
                </Typography>
              )}
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Event
            </Typography>
            
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f9f9f9', mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    component="img"
                    src={imagePreview || formData.imageUrl}
                    alt="Event preview"
                    sx={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {formData.title || '[No Title]'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {formData.category && (
                      <Chip
                        label={formData.category}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    
                    {formData.ageRestriction !== 'none' && (
                      <Chip
                        label={formData.ageRestriction}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    <strong>Location:</strong> {formData.location || '[No Location]'}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Date:</strong>{' '}
                    {formData.startDate
                      ? formData.startDate.toLocaleString()
                      : '[No Start Date]'}{' '}
                    to{' '}
                    {formData.endDate
                      ? formData.endDate.toLocaleString()
                      : '[No End Date]'}
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Max Participants:</strong> {formData.participantLimit}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              
              <Typography variant="body2" paragraph>
                {formData.description || '[No Description]'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Requirements
                  </Typography>
                  
                  {formData.requirements.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.requirements.map((req) => (
                        <Chip key={req} label={req} size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No specific requirements.
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Desired Skills
                  </Typography>
                  
                  {formData.skills.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No specific skills required.
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              {formData.contact && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Contact
                  </Typography>
                  
                  <Typography variant="body2">
                    {formData.contact}
                  </Typography>
                </>
              )}
            </Paper>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review all details before publishing. Once published, your event will be visible to all users.
            </Alert>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  if (!isAuthenticated || (user && user.role !== 'organizer' && user.role !== 'admin')) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Access Restricted
            </Typography>
            <Typography variant="body1" paragraph>
              You need to be logged in as an organizer to create events.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" gutterBottom>
            Create New Event
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary">
            Fill in the details below to create a new volunteer event.
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? () => router.push('/events') : handleBack}
                disabled={loading}
              >
                {activeStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : 'Publish Event'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      </Container>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Event published successfully! Redirecting to event page..."
      />
    </Layout>
  );
};

export default CreateEventPage; 