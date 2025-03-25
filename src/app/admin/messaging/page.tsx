'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/layout/Layout';
import { RootState } from '../../../redux/store';
import { THEME_COLORS } from '../../../components/layout/Layout';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import AddIcon from '@mui/icons-material/Add';

// Mock messages data
const mockMessages = [
  {
    id: 'msg1',
    sender: 'System',
    recipient: 'All Volunteers',
    subject: 'New Event Registration Open',
    content: 'Registration for the Tech Workshop is now open. Please login to your dashboard to register.',
    type: 'announcement',
    date: '2023-10-15',
    read: true,
    senderRole: 'system',
    event: 'Tech Education Workshop'
  },
  {
    id: 'msg2',
    sender: 'Admin',
    recipient: 'Event Coordinators',
    subject: 'Coordinator Meeting',
    content: 'There will be a meeting for all event coordinators this Friday at 5 PM.',
    type: 'notification',
    date: '2023-10-18',
    read: true,
    senderRole: 'admin',
    event: 'All Events'
  },
  {
    id: 'msg3',
    sender: 'Priya Sharma',
    recipient: 'Admin',
    subject: 'Event Feedback',
    content: 'I wanted to share some feedback about the recent art workshop. The participants really enjoyed it!',
    type: 'direct',
    date: '2023-10-20',
    read: false,
    senderRole: 'volunteer',
    event: 'Art Exhibition'
  },
  {
    id: 'msg4',
    sender: 'System',
    recipient: 'All Users',
    subject: 'Website Maintenance',
    content: 'The website will be undergoing maintenance on Saturday from 2 AM to 5 AM. Some features may be unavailable during this time.',
    type: 'announcement',
    date: '2023-10-22',
    read: true,
    senderRole: 'system',
    event: 'None'
  },
  {
    id: 'msg5',
    sender: 'Rahul Patel',
    recipient: 'Admin',
    subject: 'Volunteer Application',
    content: 'I submitted my volunteer application last week. Could you please confirm if you received it?',
    type: 'direct',
    date: '2023-10-25',
    read: false,
    senderRole: 'participant',
    event: 'None'
  },
  {
    id: 'msg6',
    sender: 'Admin',
    recipient: 'Event Volunteers',
    subject: 'Blind Cricket Tournament',
    content: 'Thank you to all volunteers who participated in the Blind Cricket Tournament. Your support made the event a great success!',
    type: 'notification',
    date: '2023-10-28',
    read: true,
    senderRole: 'admin',
    event: 'Blind Cricket Tournament'
  },
  {
    id: 'msg7',
    sender: 'Neha Gupta',
    recipient: 'Admin',
    subject: 'Donation Query',
    content: 'I made a donation last week but haven\'t received a receipt. Could you please check on this?',
    type: 'direct',
    date: '2023-10-30',
    read: false,
    senderRole: 'participant',
    event: 'None'
  },
];

// Messaging stats
const messagingStats = [
  { 
    title: 'Total Messages', 
    count: 342, 
    icon: <MessageIcon sx={{ fontSize: 40, color: THEME_COLORS.orange }} /> 
  },
  { 
    title: 'Unread Messages', 
    count: 18, 
    icon: <EmailIcon sx={{ fontSize: 40, color: '#2196F3' }} /> 
  },
  { 
    title: 'Announcements', 
    count: 56, 
    icon: <CampaignIcon sx={{ fontSize: 40, color: '#4CAF50' }} /> 
  },
  { 
    title: 'Recipient Groups', 
    count: 12, 
    icon: <GroupIcon sx={{ fontSize: 40, color: '#9C27B0' }} /> 
  },
];

// Interface for TabPanel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`messaging-tabpanel-${index}`}
      aria-labelledby={`messaging-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MessagingDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [openComposeDialog, setOpenComposeDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    message: '',
    event: '',
  });

  // Get unique events from messages
  const events = ['all', ...Array.from(new Set(mockMessages.map(message => message.event))).filter(event => event !== 'None')];

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

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle compose dialog
  const handleOpenComposeDialog = () => {
    setOpenComposeDialog(true);
  };

  const handleCloseComposeDialog = () => {
    setOpenComposeDialog(false);
  };

  // Updated to handle different event types including SelectChangeEvent
  const handleComposeInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setComposeData({
      ...composeData,
      [name as string]: value,
    });
  };

  const handleSendMessage = () => {
    // Here you would send the message
    console.log('Sending message:', composeData);
    // Close the dialog
    handleCloseComposeDialog();
    // Reset form
    setComposeData({
      recipient: '',
      subject: '',
      message: '',
      event: '',
    });
  };

  // Filter messages based on search, type, role, and event
  const filteredMessages = mockMessages.filter((message) => {
    // Search filter
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = 
      filterType === 'all' || 
      message.type === filterType;
    
    // Role filter
    const matchesRole =
      filterRole === 'all' ||
      message.senderRole === filterRole;
    
    // Event filter
    const matchesEvent =
      filterEvent === 'all' ||
      message.event === filterEvent;
      
    return matchesSearch && matchesType && matchesRole && matchesEvent;
  });

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Get message type color
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return '#4CAF50';
      case 'notification':
        return '#FF9800';
      case 'direct':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  // Get sender role color
  const getSenderRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#E91E63';
      case 'volunteer':
        return '#4CAF50';
      case 'participant':
        return '#2196F3';
      case 'system':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  // Get sender role label
  const getSenderRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'volunteer':
        return 'Volunteer';
      case 'participant':
        return 'Participant';
      case 'system':
        return 'System';
      default:
        return 'Unknown';
    }
  };

  // Handle message selection
  const handleMessageSelect = (messageId: string) => {
    setSelectedMessage(messageId === selectedMessage ? null : messageId);
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
            Messaging
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage all communications with volunteers and participants.
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {messagingStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {stat.count}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main content */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', paddingLeft: 2, paddingY: 1 }}>
            <Typography variant="h6" component="div" fontWeight="bold" color={THEME_COLORS.orange}>
              Message Inbox
            </Typography>
          </Box>

          {/* Inbox Content */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search messages..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="type-filter-label">Message Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    id="type-filter"
                    value={filterType}
                    label="Message Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="direct">Direct Messages</MenuItem>
                    <MenuItem value="notification">Notifications</MenuItem>
                    <MenuItem value="announcement">Announcements</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="role-filter-label">Sender Role</InputLabel>
                  <Select
                    labelId="role-filter-label"
                    id="role-filter"
                    value={filterRole}
                    label="Sender Role"
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="volunteer">Volunteers</MenuItem>
                    <MenuItem value="participant">Participants</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="event-filter-label">Related Event</InputLabel>
                  <Select
                    labelId="event-filter-label"
                    id="event-filter"
                    value={filterEvent}
                    label="Related Event"
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    {events.map(event => (
                      <MenuItem key={event} value={event}>
                        {event === 'all' ? 'All Events' : event}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenComposeDialog}
                sx={{ 
                  bgcolor: THEME_COLORS.orange,
                  '&:hover': { bgcolor: '#e65100' }
                }}
              >
                Compose
              </Button>
            </Box>

            <List sx={{ bgcolor: 'background.paper' }} disablePadding>
              {filteredMessages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      py: 2, 
                      px: 3,
                      cursor: 'pointer',
                      bgcolor: message.read ? 'transparent' : 'rgba(33, 150, 243, 0.05)',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                    onClick={() => handleMessageSelect(message.id)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getSenderRoleColor(message.senderRole) }}>
                        {message.senderRole === 'system' ? 
                          <CampaignIcon /> : 
                          message.sender.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              component="span" 
                              variant="body1" 
                              fontWeight={message.read ? 'regular' : 'bold'}
                            >
                              {message.subject}
                            </Typography>
                            {!message.read && (
                              <Chip 
                                label="New" 
                                size="small" 
                                sx={{ 
                                  ml: 1, 
                                  bgcolor: '#2196F3', 
                                  color: 'white',
                                  height: 20,
                                  fontSize: '0.7rem'
                                }} 
                              />
                            )}
                          </Box>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.secondary"
                          >
                            {formatDate(message.date)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                              fontWeight="medium"
                            >
                              {message.sender}
                            </Typography>
                            <Chip 
                              label={getSenderRoleLabel(message.senderRole)} 
                              size="small" 
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: `${getSenderRoleColor(message.senderRole)}20`,
                                color: getSenderRoleColor(message.senderRole)
                              }}
                            />
                            {message.event !== 'None' && (
                              <Chip
                                label={message.event}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: 'rgba(255, 122, 48, 0.1)',
                                  color: THEME_COLORS.orange
                                }}
                              />
                            )}
                          </Box>
                          <Typography
                            component="p"
                            variant="body2"
                            color="text.secondary"
                            sx={{ 
                              mt: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: selectedMessage === message.id ? 'unset' : 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {message.content}
                          </Typography>
                          {selectedMessage === message.id && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SendIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenComposeDialog();
                                }}
                                sx={{ 
                                  borderColor: THEME_COLORS.orange,
                                  color: THEME_COLORS.orange,
                                  '&:hover': { borderColor: '#e65100', bgcolor: 'rgba(230, 81, 0, 0.04)' }
                                }}
                              >
                                Reply
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<MarkEmailReadIcon />}
                                sx={{ 
                                  borderColor: '#4CAF50',
                                  color: '#4CAF50',
                                  '&:hover': { borderColor: '#388E3C', bgcolor: 'rgba(76, 175, 80, 0.04)' }
                                }}
                              >
                                Mark as Read
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DeleteIcon />}
                                sx={{ 
                                  borderColor: '#F44336',
                                  color: '#F44336',
                                  '&:hover': { borderColor: '#D32F2F', bgcolor: 'rgba(244, 67, 54, 0.04)' }
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < filteredMessages.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {filteredMessages.length === 0 && (
                <ListItem sx={{ py: 4 }}>
                  <ListItemText
                    primary={
                      <Typography align="center" color="text.secondary">
                        No messages found matching your search criteria.
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Paper>

        {/* Compose Dialog */}
        <Dialog 
          open={openComposeDialog} 
          onClose={handleCloseComposeDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>Compose Message</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel id="recipient-label">Recipient</InputLabel>
              <Select
                labelId="recipient-label"
                id="recipient"
                name="recipient"
                value={composeData.recipient}
                label="Recipient"
                onChange={handleComposeInputChange}
              >
                <MenuItem value="all_volunteers">All Volunteers</MenuItem>
                <MenuItem value="event_coordinators">Event Coordinators</MenuItem>
                <MenuItem value="all_users">All Users</MenuItem>
                <MenuItem value="custom">Custom Group...</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="event-label">Related Event</InputLabel>
              <Select
                labelId="event-label"
                id="event"
                name="event"
                value={composeData.event}
                label="Related Event"
                onChange={handleComposeInputChange}
              >
                <MenuItem value="">No specific event</MenuItem>
                {events.filter(event => event !== 'all').map(event => (
                  <MenuItem key={event} value={event}>{event}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              id="subject"
              name="subject"
              label="Subject"
              type="text"
              fullWidth
              variant="outlined"
              value={composeData.subject}
              onChange={handleComposeInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="message"
              name="message"
              label="Message"
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              value={composeData.message}
              onChange={handleComposeInputChange}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseComposeDialog} variant="outlined">Cancel</Button>
            <Button 
              onClick={handleSendMessage} 
              variant="contained"
              startIcon={<SendIcon />}
              disabled={!composeData.recipient || !composeData.subject || !composeData.message}
              sx={{ 
                bgcolor: THEME_COLORS.orange,
                '&:hover': { bgcolor: '#e65100' }
              }}
            >
              Send Message
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
} 