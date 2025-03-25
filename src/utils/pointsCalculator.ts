/**
 * Points Calculator Utility
 * 
 * This utility provides functions for calculating points based on volunteer hours,
 * event participation, and achievement tracking for badges and levels.
 */

export interface PointsCalculationResult {
  points: number;
  level: number;
  nextLevelPoints: number;
  earnedPoints: number;
  newBadges: string[];
}

// Level thresholds
export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
};

// Badge definitions with criteria
export const BADGES = {
  FIRST_EVENT: {
    id: 'FIRST_EVENT',
    name: 'First Steps',
    description: 'Completed your first volunteer event',
    icon: 'stars',
    criteria: {
      events: 1,
      hours: 0,
    },
  },
  FIVE_EVENTS: {
    id: 'FIVE_EVENTS',
    name: 'Regular Volunteer',
    description: 'Completed 5 volunteer events',
    icon: 'workspace_premium',
    criteria: {
      events: 5,
      hours: 0,
    },
  },
  TEN_EVENTS: {
    id: 'TEN_EVENTS',
    name: 'Dedicated Volunteer',
    description: 'Completed 10 volunteer events',
    icon: 'military_tech',
    criteria: {
      events: 10,
      hours: 0,
    },
  },
  TWENTY_FIVE_EVENTS: {
    id: 'TWENTY_FIVE_EVENTS',
    name: 'Community Champion',
    description: 'Completed 25 volunteer events',
    icon: 'emoji_events',
    criteria: {
      events: 25,
      hours: 0,
    },
  },
  TEN_HOURS: {
    id: 'TEN_HOURS',
    name: 'Ten Hours of Service',
    description: 'Contributed 10 hours of volunteer work',
    icon: 'timer',
    criteria: {
      events: 0,
      hours: 10,
    },
  },
  FIFTY_HOURS: {
    id: 'FIFTY_HOURS',
    name: 'Fifty Hours of Service',
    description: 'Contributed 50 hours of volunteer work',
    icon: 'schedule',
    criteria: {
      events: 0,
      hours: 50,
    },
  },
  HUNDRED_HOURS: {
    id: 'HUNDRED_HOURS',
    name: 'Century of Service',
    description: 'Contributed 100 hours of volunteer work',
    icon: 'hourglass_full',
    criteria: {
      events: 0,
      hours: 100,
    },
  },
  MULTI_CATEGORY: {
    id: 'MULTI_CATEGORY',
    name: 'Diverse Impact',
    description: 'Volunteered in 3 different event categories',
    icon: 'diversity_3',
    criteria: {
      categories: 3,
    },
  },
  LEVEL_THREE: {
    id: 'LEVEL_THREE',
    name: 'Rising Star',
    description: 'Reached Level 3',
    icon: 'auto_awesome',
    criteria: {
      level: 3,
    },
  },
  LEVEL_FIVE: {
    id: 'LEVEL_FIVE',
    name: 'Volunteer Extraordinaire',
    description: 'Reached Level 5',
    icon: 'auto_awesome_motion',
    criteria: {
      level: 5,
    },
  },
};

/**
 * Calculate base points from volunteer hours
 * @param hours Number of hours volunteered
 * @returns Base points earned
 */
export const calculateBasePoints = (hours: number): number => {
  // Each hour is worth 10 points
  return Math.round(hours * 10);
};

/**
 * Calculate bonus points based on event characteristics
 * @param isFirstEvent Whether this is the user's first event
 * @param duration Event duration in hours
 * @param category Event category
 * @returns Bonus points earned
 */
export const calculateBonusPoints = (
  isFirstEvent: boolean,
  duration: number,
  category: string
): number => {
  let bonusPoints = 0;

  // First event bonus
  if (isFirstEvent) {
    bonusPoints += 20;
  }

  // Long duration bonus (more than 4 hours)
  if (duration > 4) {
    bonusPoints += 15;
  }

  // Category-specific bonuses (if applicable)
  // Example: Educational events might give extra points
  if (category === 'Education') {
    bonusPoints += 5;
  }

  return bonusPoints;
};

/**
 * Calculate total points for an event
 * @param hours Number of hours volunteered
 * @param isFirstEvent Whether this is the user's first event
 * @param category Event category
 * @returns Total points earned for the event
 */
export const calculateEventPoints = (
  hours: number,
  isFirstEvent: boolean,
  category: string
): number => {
  const basePoints = calculateBasePoints(hours);
  const bonusPoints = calculateBonusPoints(isFirstEvent, hours, category);
  
  return basePoints + bonusPoints;
};

/**
 * Determine user level based on total points
 * @param points Total points accumulated
 * @returns Current user level
 */
export const getUserLevel = (points: number): number => {
  let level = 1;
  
  for (let i = 6; i >= 1; i--) {
    if (points >= LEVEL_THRESHOLDS[i as keyof typeof LEVEL_THRESHOLDS]) {
      level = i;
      break;
    }
  }
  
  return level;
};

/**
 * Calculate points needed for next level
 * @param currentPoints Current points
 * @param currentLevel Current level
 * @returns Points needed for next level
 */
export const getNextLevelPoints = (currentPoints: number, currentLevel: number): number => {
  if (currentLevel >= 6) {
    return 0; // Max level reached
  }
  
  const nextLevel = currentLevel + 1;
  const nextLevelThreshold = LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS];
  
  return nextLevelThreshold - currentPoints;
};

/**
 * Check for newly earned badges
 * @param totalEvents Total events completed
 * @param totalHours Total hours volunteered
 * @param currentLevel Current user level
 * @param categoryDistribution Category distribution of events
 * @param currentBadges Currently earned badges
 * @returns Array of newly earned badge IDs
 */
export const checkNewBadges = (
  totalEvents: number,
  totalHours: number,
  currentLevel: number,
  categoryDistribution: { name: string; count: number }[],
  currentBadges: string[]
): string[] => {
  const newBadges: string[] = [];
  
  // Check event count badges
  if (totalEvents >= 1 && !currentBadges.includes(BADGES.FIRST_EVENT.id)) {
    newBadges.push(BADGES.FIRST_EVENT.id);
  }
  if (totalEvents >= 5 && !currentBadges.includes(BADGES.FIVE_EVENTS.id)) {
    newBadges.push(BADGES.FIVE_EVENTS.id);
  }
  if (totalEvents >= 10 && !currentBadges.includes(BADGES.TEN_EVENTS.id)) {
    newBadges.push(BADGES.TEN_EVENTS.id);
  }
  if (totalEvents >= 25 && !currentBadges.includes(BADGES.TWENTY_FIVE_EVENTS.id)) {
    newBadges.push(BADGES.TWENTY_FIVE_EVENTS.id);
  }
  
  // Check hours badges
  if (totalHours >= 10 && !currentBadges.includes(BADGES.TEN_HOURS.id)) {
    newBadges.push(BADGES.TEN_HOURS.id);
  }
  if (totalHours >= 50 && !currentBadges.includes(BADGES.FIFTY_HOURS.id)) {
    newBadges.push(BADGES.FIFTY_HOURS.id);
  }
  if (totalHours >= 100 && !currentBadges.includes(BADGES.HUNDRED_HOURS.id)) {
    newBadges.push(BADGES.HUNDRED_HOURS.id);
  }
  
  // Check level badges
  if (currentLevel >= 3 && !currentBadges.includes(BADGES.LEVEL_THREE.id)) {
    newBadges.push(BADGES.LEVEL_THREE.id);
  }
  if (currentLevel >= 5 && !currentBadges.includes(BADGES.LEVEL_FIVE.id)) {
    newBadges.push(BADGES.LEVEL_FIVE.id);
  }
  
  // Check category diversity
  if (categoryDistribution.length >= 3 && !currentBadges.includes(BADGES.MULTI_CATEGORY.id)) {
    newBadges.push(BADGES.MULTI_CATEGORY.id);
  }
  
  return newBadges;
};

/**
 * Update user points and level after event completion
 * @param currentPoints Current user points
 * @param currentLevel Current user level
 * @param hours Hours volunteered in the event
 * @param isFirstEvent Whether this is the user's first event
 * @param category Event category
 * @param totalEvents Total events completed (including this one)
 * @param totalHours Total hours volunteered (including this event)
 * @param categoryDistribution Category distribution of events
 * @param currentBadges Currently earned badges
 * @returns Updated points, level, and badge information
 */
export const updateUserPoints = (
  currentPoints: number,
  currentLevel: number,
  hours: number,
  isFirstEvent: boolean,
  category: string,
  totalEvents: number,
  totalHours: number,
  categoryDistribution: { name: string; count: number }[],
  currentBadges: string[]
): PointsCalculationResult => {
  // Calculate points earned from this event
  const earnedPoints = calculateEventPoints(hours, isFirstEvent, category);
  
  // Update total points
  const newTotalPoints = currentPoints + earnedPoints;
  
  // Determine new level
  const newLevel = getUserLevel(newTotalPoints);
  
  // Calculate points needed for next level
  const nextLevelPoints = getNextLevelPoints(newTotalPoints, newLevel);
  
  // Check for new badges
  const newBadges = checkNewBadges(
    totalEvents,
    totalHours,
    newLevel,
    categoryDistribution,
    currentBadges
  );
  
  return {
    points: newTotalPoints,
    level: newLevel,
    nextLevelPoints,
    earnedPoints,
    newBadges,
  };
}; 