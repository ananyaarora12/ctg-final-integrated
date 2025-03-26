import { User } from '@/types/user';

// Save auth data to localStorage
export const saveAuthData = (token: string, user: User): void => {
  // Store token in user object as well for type consistency
  const userWithToken = {
    ...user,
    token
  };
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userWithToken));
};

// Clear auth data from localStorage
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Get user from localStorage
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  try {
    return JSON.parse(userString) as User;
  } catch (e) {
    console.error('Error parsing user data from localStorage', e);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Initialize auth state
export const initAuthState = () => {
  const token = getToken();
  const user = getUser();
  
  return {
    user,
    isAuthenticated: !!token,
    loading: false,
    error: null
  };
}; 