import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with common configs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  validateToken: () => apiClient.get('/auth/validate-token'),
  logout: () => {
    // Client-side logout - remove token from localStorage
    localStorage.removeItem('token');
    return Promise.resolve({ success: true });
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    return token ? apiClient.get('/auth/validate-token') : Promise.reject({ message: 'No token found' });
  },
};

// Events API
export const eventsAPI = {
  getAllEvents: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.published) params.append('published', filters.published);
    
    return apiClient.get(`/events?${params.toString()}`);
  },
  getEventById: (eventId) => apiClient.get(`/events/${eventId}`),
  createEvent: (eventData) => apiClient.post('/events', eventData),
  updateEvent: (eventId, eventData) => apiClient.put(`/events/${eventId}`, eventData),
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),
  registerForEvent: (eventId) => apiClient.post(`/events/${eventId}/register`),
  cancelRegistration: (eventId) => apiClient.post(`/events/${eventId}/cancel`),
  getEventParticipants: (eventId) => apiClient.get(`/events/${eventId}/participants`),
};

// User API
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (profileData) => apiClient.put('/users/profile', { profile: profileData }),
  getUserEvents: () => apiClient.get('/users/events'),
  getAllUsers: (role) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    return apiClient.get(`/users?${params.toString()}`);
  },
  getUserById: (userId) => apiClient.get(`/users/${userId}`),
  getLeaderboard: (period = 'all-time') => {
    const params = new URLSearchParams();
    params.append('period', period);
    return apiClient.get(`/users/leaderboard?${params.toString()}`);
  },
};

export default {
  auth: authAPI,
  events: eventsAPI,
  user: userAPI,
}; 