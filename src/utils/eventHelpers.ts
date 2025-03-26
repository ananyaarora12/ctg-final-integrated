import { format, parseISO, isAfter, isBefore, isWithinInterval } from 'date-fns';

export interface FormattedEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  imageUrl: string;
  pointsAwarded: number;
  hoursRequired: number;
  status: string;
  registrationStatus?: string;
}

export interface CategorizedEvents {
  upcoming: FormattedEvent[];
  ongoing: FormattedEvent[];
  completed: FormattedEvent[];
}

/**
 * Calculate event status based on start and end dates
 */
export const calculateEventStatus = (startDate: string, endDate: string): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isBefore(end, now)) {
    return 'completed';
  } else if (isAfter(start, now)) {
    return 'upcoming';
  } else {
    return 'ongoing';
  }
};

/**
 * Get default image based on event category
 */
export const getDefaultImage = (category: string = 'default'): string => {
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

/**
 * Format date to display in a readable format
 */
export const formatEventDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format time to display in a readable format
 */
export const formatEventTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateString;
  }
};

/**
 * Categorize events into upcoming, ongoing, and completed
 */
export const categorizeEvents = (events: FormattedEvent[]): CategorizedEvents => {
  const now = new Date();
  const categorized: CategorizedEvents = {
    upcoming: [],
    ongoing: [],
    completed: []
  };

  events.forEach(event => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      categorized.completed.push(event);
    } else if (startDate > now) {
      categorized.upcoming.push(event);
    } else {
      categorized.ongoing.push(event);
    }
  });

  return categorized;
};

/**
 * Calculate category distribution from events
 */
export const calculateCategoryDistribution = (events: FormattedEvent[]): Array<{ name: string; count: number }> => {
  const distribution: Record<string, number> = {};
  
  events.forEach(event => {
    if (event.category) {
      distribution[event.category] = (distribution[event.category] || 0) + 1;
    }
  });
  
  return Object.entries(distribution).map(([name, count]) => ({ name, count }));
};

/**
 * Calculate monthly activity from events
 */
export const calculateMonthlyActivity = (events: FormattedEvent[]): Array<{ month: string; count: number }> => {
  const monthlyMap: Record<string, number> = {};
  
  events.forEach(event => {
    try {
      const month = format(parseISO(event.startDate), 'MMM');
      monthlyMap[month] = (monthlyMap[month] || 0) + (event.hoursRequired || 0);
    } catch (error) {
      console.error('Error processing date for monthly activity:', error);
    }
  });
  
  return Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));
}; 