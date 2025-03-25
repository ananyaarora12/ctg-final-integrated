import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'participant' | 'volunteer' | 'admin';
  profileImage?: string;
  registeredEvents?: string[]; // Array of event IDs the user has registered for
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    registerForEvent: (state, action: PayloadAction<string>) => {
      if (state.user) {
        if (!state.user.registeredEvents) {
          state.user.registeredEvents = [];
        }
        // Add the event ID if not already registered
        if (!state.user.registeredEvents.includes(action.payload)) {
          state.user.registeredEvents.push(action.payload);
        }
        // Note: Points are now only awarded after logging hours, not upon registration
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateRegisteredEvents: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.registeredEvents = action.payload;
      }
    },
  },
});

export const { login, logout, setAuthLoading, setAuthError, registerForEvent, updateRegisteredEvents } = authSlice.actions;

export default authSlice.reducer; 