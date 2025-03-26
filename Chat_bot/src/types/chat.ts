export interface ParticipantData {
  [key: string]: string;
  fullName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  age: string;
  phoneNumber: string;
  emergencyContact: string;
  interest: string;
}

export type ChatState = 
  | 'welcome'
  | 'menu'
  | 'volunteer'
  | 'volunteerConfirm'
  | 'participant'
  | 'participantConfirm'
  | 'create-event'
  | 'eventCreationConfirm'
  | 'events'
  | 'registered'
  | 'furtherHelp'; 