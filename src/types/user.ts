export interface MonthlyActivity {
  month: string;
  count: number;
}

export interface UserStats {
  totalEvents: number;
  totalHours: number;
  totalPoints: number;
  categoryDistribution: Array<{ name: string; count: number }>;
  monthlyActivity: MonthlyActivity[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
  stats?: UserStats;
  registeredEvents?: string[];
  // Additional profile fields
  photoURL?: string;
  displayName?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  skills?: string[];
  interests?: string[];
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
} 