import { RootState } from '@/redux/store';

/**
 * Helper function to get authentication state from Redux
 * Provides consistent access across components
 */
export const getAuthFromState = (state: RootState) => {
  return state.user;
};

/**
 * Helper function to extract user profile information
 * Provides fallbacks for missing data
 */
export const getUserProfile = (state: RootState) => {
  const { user } = state.user;
  
  return {
    id: user?.id || '',
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || '',
    displayName: user?.name || 'User',
    photoURL: user?.photoURL || '/images/default-avatar.png',
    stats: user?.stats || {
      totalEvents: 0,
      totalHours: 0,
      totalPoints: 0,
      categoryDistribution: [],
      monthlyActivity: []
    },
    registeredEvents: user?.registeredEvents || [],
    createdAt: user?.createdAt || new Date().toISOString(),
    phoneNumber: user?.phoneNumber || '',
  };
}; 