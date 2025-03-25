'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Container, 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { format, parseISO, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import Layout from '../../components/layout/Layout';
import { sampleEvents } from '../events/page';
import { EventData } from '../../components/events/EventCard';

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [calendarRows, setCalendarRows] = useState<Date[][]>([]);
  const [eventLayoutMap, setEventLayoutMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fetch real events from API
        const apiClient = (await import('../../utils/api')).default;
        const response = await apiClient.events.getAllEvents();
        
        // Map backend events to frontend format - only include published events
        const mappedEvents = response.data.events
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
        
        setEvents(mappedEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      console.log('Events loaded:', events.length);
      console.log('Sample event:', events[0]);
    }
  }, [events]);

  // When month or events change, recalculate calendar rows and event layouts
  useEffect(() => {
    // Organize days into rows (weeks)
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getDay(daysInMonth[0]);
    
    // Create array of prev month days to fill in first row
    const prevMonthFiller = Array(firstDayOfMonth).fill(null).map((_, i) => {
      const prevMonthDate = new Date(currentMonth);
      prevMonthDate.setMonth(currentMonth.getMonth() - 1);
      prevMonthDate.setDate(new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0).getDate() - firstDayOfMonth + i + 1);
      return prevMonthDate;
    });
    
    // Create array of all days to show
    const allDays = [...prevMonthFiller, ...daysInMonth];
    
    // Split into rows (weeks)
    const rows: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      rows.push(allDays.slice(i, i + 7));
    }
    
    // If the last row isn't complete, add days from next month
    const lastRow = rows[rows.length - 1];
    if (lastRow.length < 7) {
      const nextMonthDays = Array(7 - lastRow.length).fill(null).map((_, i) => {
        const nextMonthDate = new Date(currentMonth);
        nextMonthDate.setMonth(currentMonth.getMonth() + 1);
        nextMonthDate.setDate(i + 1);
        return nextMonthDate;
      });
      rows[rows.length - 1] = [...lastRow, ...nextMonthDays];
    }
    
    setCalendarRows(rows);
    
    // Calculate event layouts for multi-day events
    if (events.length > 0) {
      calculateEventLayouts(rows);
    }
  }, [currentMonth, events]);
  
  // Function to calculate multi-day event layouts
  const calculateEventLayouts = (rows: Date[][]) => {
    // Map to store layout information for each event
    const layoutMap: Record<string, any> = {};
    
    // Helper to get a string ID for a date (for lookups)
    const getDateId = (date: Date) => format(date, 'yyyy-MM-dd');
    
    // First sort events by duration (multi-day first) then by start time
    const sortedEvents = [...events].sort((a, b) => {
      const aStart = parseISO(a.startDate);
      const aEnd = parseISO(a.endDate);
      const bStart = parseISO(b.startDate);
      const bEnd = parseISO(b.endDate);
      
      const aDuration = aEnd.getTime() - aStart.getTime();
      const bDuration = bEnd.getTime() - bStart.getTime();
      
      // Sort by duration (longest first) then by start time
      if (aDuration !== bDuration) {
        return bDuration - aDuration;
      }
      return aStart.getTime() - bStart.getTime();
    });
    
    // Process all events and organize them by day and position
    sortedEvents.forEach(event => {
      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);
      const isMultiDay = !isSameDay(startDate, endDate);
      
      // For each row (week) in the calendar
      rows.forEach((row, rowIndex) => {
        // Check if event appears in this row
        const eventInRow = row.some(day => isDayInEventRange(day, event));
        if (!eventInRow) return;
        
        // Find start and end columns for this event in this row
        let startCol = -1;
        let endCol = -1;
        
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
          const day = row[colIndex];
          
          if (isDayInEventRange(day, event)) {
            if (startCol === -1) startCol = colIndex;
            endCol = colIndex;
          }
        }
        
        // If event appears in this row
        if (startCol !== -1 && endCol !== -1) {
          // This is a key change - for multi-day events, we only store at the start position
          // but with information about how many cells it spans
          if (isMultiDay) {
            const startDay = row[startCol];
            const startDayId = getDateId(startDay);
            
            if (!layoutMap[startDayId]) {
              layoutMap[startDayId] = { events: [] };
            }
            
            // Add event to the start day with colSpan information
            layoutMap[startDayId].events.push({
              event,
              colSpan: endCol - startCol + 1,
              rowIndex,
              colIndex: startCol,
              isStart: isSameDay(startDay, startDate),
              isEnd: isSameDay(row[endCol], endDate),
              position: layoutMap[startDayId].events.length // Used for stacking events
            });
          } else {
            // For single day events, store them individually on their day
            const day = row[startCol];
            const dayId = getDateId(day);
            
            if (!layoutMap[dayId]) {
              layoutMap[dayId] = { events: [] };
            }
            
            // Add single day event
            layoutMap[dayId].events.push({
              event,
              colSpan: 1,
              rowIndex,
              colIndex: startCol,
              isStart: true,
              isEnd: true,
              position: layoutMap[dayId].events.length // Used for stacking events
            });
          }
        }
      });
    });
    
    setEventLayoutMap(layoutMap);
  };

  // Function to provide culturally relevant images
  const getIndianEventImage = (category: string) => {
    const images: Record<string, string> = {
      'Education': 'https://images.unsplash.com/photo-1456243762991-9bc5d5e960db?q=80&w=1000&auto=format&fit=crop',
      'Health': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop',
      'Environment': 'https://images.unsplash.com/photo-1590274853856-f808e6a0c5f2?q=80&w=1000&auto=format&fit=crop',
      'Community': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop',
      'Cultural': 'https://images.unsplash.com/photo-1603206004639-22003d78a0d6?q=80&w=1000&auto=format&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
      'Tech': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop',
      'Fundraising': 'https://images.unsplash.com/photo-1593113598332-cd59a93333c3?q=80&w=1000&auto=format&fit=crop',
      'default': 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=1000&auto=format&fit=crop',
    };
    
    return images[category] || images['default'];
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const days = getDaysInMonth(currentMonth);
  const startDay = getDay(days[0]);

  const handleEventClick = (event: EventData) => {
    // Check for specific events that should always go to summary
    if (event.id === 'test-sports-day' || event.id === 'test-fundraising' || event.status === 'completed') {
      router.push(`/events/${event.id}/summary`);
      return;
    }
    
    // Determine event status based on dates
    const now = new Date();
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    
    // For older/past events: go to summary
    if (endDate < now) {
      router.push(`/events/${event.id}/summary`);
    } 
    // For ongoing events: go to details
    else if (startDate <= now && endDate >= now) {
      router.push(`/events/${event.id}`);
    }
    // For upcoming events: show dialog to register
    else {
      setSelectedEvent(event);
      setEventDialogOpen(true);
    }
  };

  const handleRegisterClick = (eventId: string) => {
    setEventDialogOpen(false);
    router.push(`/events/${eventId}`);
  };

  // Helper to check if an event spans multiple days
  const isMultiDayEvent = (event: EventData) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return !isSameDay(startDate, endDate);
  };

  // Helper to check if a day is within an event's date range
  const isDayInEventRange = (day: Date, event: EventData) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    
    // Set hours to 0 to compare just the dates
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    
    return (
      (startDate <= dayEnd && endDate >= dayStart) || // Day is within the event range
      isSameDay(startDate, day) || // Day is the start day
      isSameDay(endDate, day) // Day is the end day
    );
  };

  const renderCalendarDays = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {dayNames.map((day) => (
                <th key={day} style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarRows.map((row, rowIndex) => {
              // First, collect all events that need to be rendered in this row
              // and keep track of which columns are occupied by multi-day events
              const rowEvents: any[] = [];
              const occupiedCols = new Set<number>();
              
              row.forEach((day, colIndex) => {
                const dayId = format(day, 'yyyy-MM-dd');
                const dayLayout = eventLayoutMap[dayId];
                
                if (dayLayout && dayLayout.events) {
                  dayLayout.events.forEach((eventLayout: any) => {
                    // Only process events that start on this day
                    if (eventLayout.rowIndex === rowIndex && eventLayout.colIndex === colIndex) {
                      rowEvents.push({
                        ...eventLayout,
                        dayId
                      });
                      
                      // Mark columns as occupied for multi-day events
                      if (eventLayout.colSpan > 1) {
                        for (let i = colIndex; i < colIndex + eventLayout.colSpan; i++) {
                          occupiedCols.add(i);
                        }
                      }
                    }
                  });
                }
              });
              
              // Sort events so multi-day events render first, then by position
              rowEvents.sort((a, b) => {
                if (b.colSpan !== a.colSpan) return b.colSpan - a.colSpan;
                return a.position - b.position;
              });
              
              return (
                <tr key={`row-${rowIndex}`} style={{ height: '120px' }}>
                  {row.map((day, colIndex) => {
                    const dayId = format(day, 'yyyy-MM-dd');
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    
                    // Skip rendering this cell if it's part of a multi-day event that started earlier
                    if (occupiedCols.has(colIndex) && !rowEvents.some(e => e.colIndex === colIndex)) {
                      return null;
                    }
                    
                    // Get events that start on this day in this row
                    const dayEvents = rowEvents.filter(e => e.colIndex === colIndex);
                                        
                    return (
                      <td 
                        key={`day-${dayId}`}
                        colSpan={dayEvents.length > 0 && dayEvents[0].colSpan > 1 ? dayEvents[0].colSpan : 1}
                        style={{ 
                          padding: '4px',
                          verticalAlign: 'top',
                          border: '1px solid #eee',
                          backgroundColor: isToday ? 'rgba(0, 92, 169, 0.1)' : 'white',
                          opacity: isCurrentMonth ? 1 : 0.5,
                          position: 'relative',
                          height: '100%'
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 'normal' }}>
                            {format(day, 'd')}
                          </Typography>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {dayEvents.map((eventLayout, i) => {
                            const { event } = eventLayout;
                            const startDate = parseISO(event.startDate);
                            const endDate = parseISO(event.endDate);
                            
                            // Different colors for different categories
                            const categoryColors: Record<string, { bg: string, text: string }> = {
                              'Tech': { bg: '#E3F2FD', text: '#0D47A1' },
                              'Education': { bg: '#E8F5E9', text: '#1B5E20' },
                              'Sports': { bg: '#FFF3E0', text: '#E65100' },
                              'Cultural': { bg: '#F3E5F5', text: '#7B1FA2' },
                              'Community': { bg: '#E1F5FE', text: '#01579B' },
                              'Health': { bg: '#FFEBEE', text: '#B71C1C' },
                              'Environment': { bg: '#E0F2F1', text: '#004D40' },
                              'Fundraising': { bg: '#FFF8E1', text: '#FF6F00' }
                            };
                            
                            // Get color based on category, or use default if category is unknown
                            const defaultColor = { bg: '#ECEFF1', text: '#37474F' };
                            const eventColor = categoryColors[event.category] || defaultColor;
                            
                            // Multi-day events get rounded corners only at start/end
                            const borderRadius = 
                              eventLayout.colSpan === 1 ? '4px' :
                              (eventLayout.isStart && eventLayout.isEnd) ? '4px' :
                              eventLayout.isStart ? '4px 0 0 4px' :
                              eventLayout.isEnd ? '0 4px 4px 0' : '0';
                            
                            return (
                              <div 
                                key={`event-${event.id}-${i}`}
                                onClick={() => handleEventClick(event)}
                                style={{
                                  backgroundColor: eventColor.bg,
                                  color: eventColor.text,
                                  padding: '4px 6px',
                                  borderRadius,
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  width: '100%',
                                  marginBottom: '2px',
                                  borderLeft: eventLayout.colSpan > 1 ? `3px solid ${eventColor.text}` : 'none',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                {event.title}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* More events indicator */}
                        {dayEvents.length > 3 && (
                          <div
                            style={{
                              color: 'var(--mui-palette-primary-main)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              marginTop: '2px'
                            }}
                            onClick={() => {
                              if (dayEvents.length > 0) {
                                handleEventClick(dayEvents[3].event);
                              }
                            }}
                          >
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          mb: 2
        }}>
          <CalendarMonthIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1">
            Event Calendar
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          View all upcoming events in a calendar format to easily plan your volunteer schedule. Click on any event to register.
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    sx={{ mr: 1 }}
                  >
                    Previous Month
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    Next Month
                  </Button>
                </Box>
              </Box>
              
              <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  {renderCalendarDays()}
                </CardContent>
              </Card>
            </Paper>
          </Box>
        )}
        
        {/* Event Details Dialog */}
        <Dialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedEvent && (
            <>
              <DialogTitle>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {selectedEvent.title}
                </Typography>
                <Chip 
                  label={selectedEvent.category} 
                  size="small" 
                  color="primary" 
                  sx={{ mt: 1 }}
                />
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ height: 200, mb: 2, overflow: 'hidden', borderRadius: 1 }}>
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body2">
                      {format(parseISO(selectedEvent.startDate), 'PPP')}
                      <br />
                      {format(parseISO(selectedEvent.startDate), 'p')} - {format(parseISO(selectedEvent.endDate), 'p')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2">
                      {selectedEvent.location}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedEvent.description}
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Organized by
                  </Typography>
                  <Typography variant="body2">
                    {selectedEvent.organizerName}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={() => setEventDialogOpen(false)}>
                  Close
                </Button>
                {selectedEvent && new Date(selectedEvent.startDate) > new Date() && (
                  <Button 
                    variant="contained"
                    color="primary"
                    onClick={() => handleRegisterClick(selectedEvent.id)}
                  >
                    Register for Event
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Layout>
  );
} 