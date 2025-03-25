import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  organizerName: string;
  imageUrl?: string;
  participantLimit?: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

interface EventState {
  events: Event[];
  filteredEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  filterCriteria: {
    category: string | null;
    status: string | null;
    search: string | null;
  };
}

const initialState: EventState = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  filterCriteria: {
    category: null,
    status: null,
    search: null,
  }
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.isLoading = false;
      state.events = action.payload;
      state.filteredEvents = action.payload;
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    setFilterCriteria: (state, action: PayloadAction<Partial<EventState['filterCriteria']>>) => {
      state.filterCriteria = { ...state.filterCriteria, ...action.payload };
      
      // Apply filters
      state.filteredEvents = state.events.filter(event => {
        let match = true;
        
        if (state.filterCriteria.category) {
          match = match && event.category === state.filterCriteria.category;
        }
        
        if (state.filterCriteria.status) {
          match = match && event.status === state.filterCriteria.status;
        }
        
        if (state.filterCriteria.search) {
          const searchTerm = state.filterCriteria.search.toLowerCase();
          match = match && (
            event.title.toLowerCase().includes(searchTerm) || 
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm)
          );
        }
        
        return match;
      });
    },
    clearFilter: (state) => {
      state.filterCriteria = {
        category: null,
        status: null,
        search: null,
      };
      state.filteredEvents = state.events;
    },
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.push(action.payload);
      state.filteredEvents = [...state.events];
    },
    updateEvent: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
        
        if (state.selectedEvent?.id === action.payload.id) {
          state.selectedEvent = action.payload;
        }
        
        // Re-apply filters
        const filterAction = { type: 'events/setFilterCriteria', payload: state.filterCriteria };
        eventSlice.caseReducers.setFilterCriteria(state, filterAction as PayloadAction<Partial<EventState['filterCriteria']>>);
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      state.filteredEvents = state.filteredEvents.filter(event => event.id !== action.payload);
      
      if (state.selectedEvent?.id === action.payload) {
        state.selectedEvent = null;
      }
    },
  },
});

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  setSelectedEvent,
  setFilterCriteria,
  clearFilter,
  addEvent,
  updateEvent,
  deleteEvent,
} = eventSlice.actions;

export default eventSlice.reducer; 