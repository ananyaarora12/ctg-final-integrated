import { AppDispatch } from '../store';
import api from '../../utils/api';
import { 
  fetchProfileStart, 
  fetchProfileSuccess, 
  fetchProfileFailure, 
  updateProfileStart, 
  updateProfileSuccess, 
  updateProfileFailure,
  fetchLeaderboardStart,
  fetchLeaderboardSuccess,
  fetchLeaderboardFailure,
  registerForEventStart,
  registerForEventSuccess,
  registerForEventFailure
} from '../slices/userSlice';

// Fetch user profile
export const fetchUserProfile = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchProfileStart());
    const response = await api.user.getProfile();
    dispatch(fetchProfileSuccess(response.data));
  } catch (error) {
    console.error('Error fetching profile:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch user profile';
    dispatch(fetchProfileFailure(errorMessage));
  }
};

// Update user profile
export const updateUserProfile = (profileData: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(updateProfileStart());
    const response = await api.user.updateProfile(profileData);
    dispatch(updateProfileSuccess(response.data));
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update user profile';
    dispatch(updateProfileFailure(errorMessage));
    throw error;
  }
};

// Register for event
export const registerForEvent = (eventId: string, eventData?: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(registerForEventStart());
    await api.events.registerForEvent(eventId);
    const payload = eventData ? { eventId, eventData } : eventId;
    dispatch(registerForEventSuccess(payload));
    return { success: true };
  } catch (error) {
    console.error('Error registering for event:', error);
    const errorMessage = error.response?.data?.message || 'Failed to register for event';
    dispatch(registerForEventFailure(errorMessage));
    throw error;
  }
};

// Fetch leaderboard data
export const fetchLeaderboard = (period = 'all-time') => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchLeaderboardStart());
    const response = await api.user.getLeaderboard(period);
    dispatch(fetchLeaderboardSuccess(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch leaderboard data';
    dispatch(fetchLeaderboardFailure(errorMessage));
    throw error;
  }
}; 