export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | string;
  participantsLimit?: number;
  participantLimit?: number; // For backward compatibility
  currentParticipants?: number;
  participants?: any[];
  pointsAwarded: number;
  requirements?: string[];
  skills_needed?: string[];
  age_restriction?: string;
  contact_information?: string;
  hours_required?: number;
}

export interface EventsByStatus {
  upcoming: Event[];
  ongoing: Event[];
  completed: Event[];
}

export interface EventRecommendation {
  event: Event;
  reason: string;
} 