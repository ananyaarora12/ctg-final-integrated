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
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Container,
  CircularProgress,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Warning as WarningIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';

// Define type for event from backend
interface Event {
  event_id: string;
  event_name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  status: string;
  publish_event: boolean;
  event_image: string;
  participant_limit: number;
  requirements: string[];
  skills_needed: string[];
  age_restriction: string;
  contact_information: string;
  points_awarded: number;
  hours_required: number;
  participants: any[];
  availableSlots?: number;
}

// Form state type
interface EventFormData {
  event_id?: string;
  event_name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  status: string;
  publish_event: boolean;
  event_image: string;
  participant_limit: number;
  requirements: string[];
  skills_needed: string[];
  age_restriction: string;
  contact_information: string;
  points_awarded: number;
  hours_required: number;
}

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

// Default form values
const DEFAULT_FORM_VALUES: EventFormData = {
  event_name: '',
  description: '',
  start_date: '',
  end_date: '',
  location: '',
  category: '',
  status: 'Upcoming',
  publish_event: false,
  event_image: '',
  participant_limit: 20,
  requirements: [],
  skills_needed: [],
  age_restriction: 'No Restriction',
  contact_information: '',
  points_awarded: 0,
  hours_required: 0,
};

export default function EventsManagement() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Event data states
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formData, setFormData] = useState<EventFormData>(DEFAULT_FORM_VALUES);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);
  const [eventToDuplicate, setEventToDuplicate] = useState<Event | null>(null);

  useEffect(() => {
    // Check user authentication and role
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchEvents();
  }, [isAuthenticated, router, user?.role]);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const apiClient = (await import('../../../utils/api')).default;
      const response = await apiClient.events.getAllEvents();
      setEvents(response.data.events);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    }
  };

  // Filter events based on tab and search query
  const filteredEvents = events.filter(event => {
    // Filter by tab
    let passesTabFilter = true;
    switch (tabValue) {
      case 0: passesTabFilter = true; break; // All Events
      case 1: passesTabFilter = event.status === 'Upcoming'; break;
      case 2: passesTabFilter = event.status === 'Ongoing'; break;
      case 3: passesTabFilter = event.status === 'Completed'; break;
      default: passesTabFilter = true;
    }
    
    // Filter by search query
    const passesSearchFilter = !searchQuery || 
      event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return passesTabFilter && passesSearchFilter;
  });

  // Event handlers
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddEvent = () => {
    setDialogMode('add');
    setFormData(DEFAULT_FORM_VALUES);
    setOpenDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setDialogMode('edit');
    setSelectedEvent(event);
    setFormData({...event});
    setOpenDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({...prev, [name]: checked}));
  };

  const handleSaveClick = () => {
    if (dialogMode === 'edit') {
      setSaveConfirmOpen(true);
    } else {
      handleSaveEvent();
    }
  };

  const handleSaveEvent = async () => {
    // Validate required fields
    const requiredFields = [
      'event_name', 'description', 'start_date', 
      'end_date', 'location', 'category'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof EventFormData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate dates
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      alert('End date must be after start date');
      return;
    }

    try {
      const apiClient = (await import('../../../utils/api')).default;
      
      // Ensure numeric fields are numbers
      const cleanedFormData = {
        ...formData,
        points_awarded: Number(formData.points_awarded),
        hours_required: Number(formData.hours_required),
        participant_limit: Number(formData.participant_limit),
      };
      
      if (dialogMode === 'add') {
        const response = await apiClient.events.createEvent(cleanedFormData);
        setEvents(prev => [...prev, response.data.event]);
        alert('Event created successfully!');
      } else {
        // Update existing event
        const response = await apiClient.events.updateEvent(selectedEvent!.event_id, cleanedFormData);
        setEvents(prev => prev.map(event => 
          event.event_id === selectedEvent!.event_id ? response.data.event : event
        ));
        alert('Event updated successfully!');
      }
      
      // Close dialogs
      setSaveConfirmOpen(false);
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save event. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteClick = (eventId: string) => {
    const event = events.find(e => e.event_id === eventId);
    if (event) {
      setEventToDelete(event);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const apiClient = (await import('../../../utils/api')).default;
      await apiClient.events.deleteEvent(eventToDelete.event_id);
      
      setEvents(prev => prev.filter(event => event.event_id !== eventToDelete.event_id));
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleTogglePublish = async (eventId: string, currentStatus: boolean) => {
    try {
      const apiClient = (await import('../../../utils/api')).default;
      const event = events.find(e => e.event_id === eventId);
      
      if (!event) return;
      
      // Update publish status
      const updatedEvent = {
        ...event,
        publish_event: !currentStatus
      };
      
      await apiClient.events.updateEvent(eventId, updatedEvent);
      
      setEvents(prev => prev.map(e => 
        e.event_id === eventId ? {...e, publish_event: !currentStatus} : e
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status. Please try again.');
    }
  };

  const handleCloneClick = (event: Event) => {
    setEventToDuplicate(event);
    setDuplicateConfirmOpen(true);
  };

  const handleCloneEvent = () => {
    if (!eventToDuplicate) return;
    
    // Create a copy of the event
    setDialogMode('add');
    setFormData({
      ...JSON.parse(JSON.stringify(eventToDuplicate)),
      event_name: `Copy of ${eventToDuplicate.event_name}`,
      publish_event: false,
      participant_limit: eventToDuplicate.participant_limit || 20,
      requirements: eventToDuplicate.requirements || [],
      skills_needed: eventToDuplicate.skills_needed || [],
      age_restriction: eventToDuplicate.age_restriction || 'No Restriction',
      contact_information: eventToDuplicate.contact_information || '',
    });
    
    setDuplicateConfirmOpen(false);
    setEventToDuplicate(null);
    setOpenDialog(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() !== '' && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };
  
  const handleRemoveRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(item => item !== requirement),
    }));
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !formData.skills_needed.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_needed: [...prev.skills_needed, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_needed: prev.skills_needed.filter(item => item !== skill),
    }));
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return { bg: 'rgba(25, 118, 210, 0.08)', color: 'primary.main' };
      case 'Ongoing': return { bg: 'rgba(255, 193, 7, 0.08)', color: '#FFC107' };
      case 'Completed': return { bg: 'rgba(46, 125, 50, 0.08)', color: '#4CAF50' };
      default: return { bg: 'rgba(25, 118, 210, 0.08)', color: 'primary.main' };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Events Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage, create and publish events
            </Typography>
          </div>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
            sx={{ bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
          >
            Create Event
          </Button>
        </Box>

        {/* Events Table */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All Events" />
              <Tab label="Upcoming" />
              <Tab label="Ongoing" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Search and Filter */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={8}>
                <TextField
                  placeholder="Search events..."
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { sm: 'flex-end' } }}>
                <Button
                  startIcon={<FilterIcon />}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Filter
                </Button>
              </Grid>
            </Grid>

            {/* Events Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Published</TableCell>
                    <TableCell align="center">Participation</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const statusStyle = getStatusColor(event.status);
                      return (
                        <TableRow key={event.event_id}>
                          <TableCell>
                            {!event.publish_event && <span style={{ color: 'gray', fontStyle: 'italic' }}>(draft) </span>}
                            {event.event_name}
                          </TableCell>
                          <TableCell>
                            {new Date(event.start_date).toLocaleDateString()} 
                            {event.end_date !== event.start_date && 
                              ` - ${new Date(event.end_date).toLocaleDateString()}`}
                          </TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>{event.category}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={event.status} 
                              size="small"
                              sx={{
                                bgcolor: statusStyle.bg,
                                color: statusStyle.color,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Switch
                              checked={event.publish_event}
                              onChange={() => handleTogglePublish(event.event_id, event.publish_event)}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {event.participants.length}/{event.participant_limit}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditEvent(event)}
                              sx={{ color: THEME_COLORS.offBlack }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleCloneClick(event)}
                              sx={{ color: THEME_COLORS.offBlack }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(event.event_id)}
                              sx={{ color: THEME_COLORS.offBlack }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No events found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* Event Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'add' ? 'Add New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Event Title"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  placeholder="Address or Online"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleSelectChange}
                    label="Category"
                  >
                    {EVENT_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Status"
                  >
                    <MenuItem value="Upcoming">Upcoming</MenuItem>
                    <MenuItem value="Ongoing">Ongoing</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.publish_event}
                      onChange={handleToggleChange}
                      name="publish_event"
                      color="primary"
                    />
                  }
                  label="Publish Event"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Points Awarded"
                  name="points_awarded"
                  type="number"
                  value={formData.points_awarded}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hours Required"
                  name="hours_required"
                  type="number"
                  value={formData.hours_required}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Participant Limit"
                  name="participant_limit"
                  type="number"
                  value={formData.participant_limit}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Age Restriction</InputLabel>
                  <Select
                    name="age_restriction"
                    value={formData.age_restriction}
                    onChange={handleSelectChange}
                    label="Age Restriction"
                  >
                    <MenuItem value="No Restriction">No Restriction</MenuItem>
                    <MenuItem value="18+">18+ Only</MenuItem>
                    <MenuItem value="21+">21+ Only</MenuItem>
                    <MenuItem value="Family Friendly">Family Friendly</MenuItem>
                    <MenuItem value="Children">Children</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Contact Information"
                  name="contact_information"
                  value={formData.contact_information}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Email, phone, or other contact information"
                />
              </Grid>
              
              {/* Requirements Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Requirements
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label="Add Requirement"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddRequirement}
                    sx={{ ml: 1, bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {formData.requirements.map((req) => (
                    <Chip
                      key={req}
                      label={req}
                      onDelete={() => handleRemoveRequirement(req)}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
              
              {/* Skills Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Skills Needed
                </Typography>
                <Box sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    label="Add Skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSkill}
                    sx={{ ml: 1, bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {formData.skills_needed.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleSaveClick} 
              variant="contained"
              sx={{ bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
            >
              {dialogMode === 'add' ? 'Create Event' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon /> Confirm Delete
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the event &quot;{eventToDelete?.event_name}&quot;? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleDeleteEvent} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Save Confirmation Dialog */}
        <Dialog open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)}>
          <DialogTitle>Confirm Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to save the changes to this event? This will update the event for all users.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveConfirmOpen(false)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleSaveEvent} 
              variant="contained"
              sx={{ bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Duplicate Confirmation Dialog */}
        <Dialog open={duplicateConfirmOpen} onClose={() => setDuplicateConfirmOpen(false)}>
          <DialogTitle>Duplicate Event</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to duplicate the event &quot;{eventToDuplicate?.event_name}&quot;? 
              This will create a new draft copy of the event that you can modify.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDuplicateConfirmOpen(false)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleCloneEvent} 
              variant="contained"
              sx={{ bgcolor: THEME_COLORS.orange, '&:hover': { bgcolor: '#e66000' } }}
            >
              Duplicate Event
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
} 