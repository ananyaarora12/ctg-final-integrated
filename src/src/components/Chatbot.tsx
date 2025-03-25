import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

// Add these type declarations at the very top of your file, before any imports
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Styled components
const ChatPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  maxWidth: 1200,
  height: 800,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  margin: '20px auto',
  borderRadius: theme.spacing(2),
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: '#f5f8ff',
  borderRadius: theme.spacing(2),
}));

const MessageBubble = styled(Box)<{ isBot?: boolean }>(({ theme, isBot }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  maxWidth: isBot ? '95%' : '80%',
  alignSelf: isBot ? 'flex-start' : 'flex-end',
  backgroundColor: isBot ? '#fff' : '#1976d2',
  color: isBot ? '#2c2c2c' : '#fff',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  width: isBot ? '95%' : 'auto',
  '& .MuiTypography-root': {
    color: isBot ? '#2c2c2c' : '#fff',
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  '& .MuiButton-contained': {
    backgroundColor: isBot ? '#1976d2' : '#fff',
    color: isBot ? '#fff' : '#1976d2',
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    fontSize: '0.9rem',
    '&:hover': {
      backgroundColor: isBot ? '#1565c0' : '#f8f8f8',
    },
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#fff',
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
  },
}));

// Message interface for chat bubbles
interface Message {
  text: string;
  isBot: boolean;
  type?: 'text' | 'button' | 'form';
  buttons?: Array<{ text: string; action: () => void }>;
}

// Event interface and sample upcoming events
interface Event {
  id: number;
  title: string;
  date: string;
  description?: string;
  location?: string;
  category?: string;
}

const categories = [
  'Education',
  'Health',
  'Environment',
  'Community',
  'Culture',
  'Sports',
  'Tech',
];

let upcomingEvents: Event[] = [
  { id: 1, title: 'Music Concert for Awareness', date: '25th March 2025' },
  { id: 2, title: 'Inclusive Sports Meet', date: '5th April 2025' },
  { id: 3, title: 'Art Workshop for Differently Abled', date: '15th April 2025' },
  { id: 4, title: 'Technology for Inclusion Conference', date: '20th April 2025' },
];

// Chat states including further help
type ChatState = 
  | 'welcome'
  | 'volunteer'
  | 'volunteerConfirm'
  | 'participant'
  | 'participantConfirm'
  | 'create-event'
  | 'eventCreationConfirm'
  | 'events'
  | 'registered'
  | 'furtherHelp';

// QUESTION ARRAYS FOR SEQUENTIAL SERVICES
const volunteerQuestions = [
  { field: 'fullName', question: 'Please tell me your full name:' },
  { field: 'contactNumber', question: 'What is your contact number?' },
  { field: 'email', question: 'What is your email address?' },
  { field: 'age', question: 'What is your age?' },
  { field: 'organization', question: 'What is your organization?' },
  { field: 'volunteeringOptions', question: 'Which volunteering options do you prefer?' },
  { field: 'preferredLocation', question: 'What is your preferred location?' },
  { field: 'startDate', question: 'When can you start? (YYYY-MM-DD)' },
  { field: 'endDate', question: 'When do you end? (YYYY-MM-DD)' },
  { field: 'noOfDays', question: 'How many days are you available?' },
  { field: 'availability', question: 'What is your availability?' },
];

const participantQuestions = [
  { field: 'fullName', question: 'Please tell me your full name:' },
  { field: 'contactNumber', question: 'What is your contact number?' },
  { field: 'email', question: 'What is your email address?' },
  { field: 'age', question: 'What is your age?' },
  { 
    field: 'selectedEvent', 
    question:
      'Here are the upcoming events:\n' +
      '1. Music Concert for Awareness - 25th March 2025\n' +
      '2. Inclusive Sports Meet - 5th April 2025\n' +
      '3. Art Workshop for Differently Abled - 15th April 2025\n' +
      '4. Technology for Inclusion Conference - 20th April 2025\n' +
      'Please enter the event number you would like to register for:',
  },
];

const eventCreationQuestions = [
  { field: 'title', question: 'Please enter the event title:' },
  { field: 'description', question: 'Please enter the event description:' },
  { field: 'location', question: 'Please enter the event location:' },
  { field: 'category', question: 'Please enter the event category (e.g., Education, Health):' },
  { field: 'date', question: 'Please enter the event date (YYYY-MM-DD):' },
];

// Helper function to create a tabular summary of provided data
const createSummary = (data: Record<string, string>, questions: { field: string; question: string }[]) => {
  let summary = "Please confirm the details below:\n\n";
  questions.forEach(q => {
    let fieldDisplay = "";
    switch (q.field) {
      case "fullName":
        fieldDisplay = "Full Name";
        break;
      case "contactNumber":
        fieldDisplay = "Contact Number";
        break;
      case "email":
        fieldDisplay = "Email Address";
        break;
      case "age":
        fieldDisplay = "Age";
        break;
      case "organization":
        fieldDisplay = "Organization";
        break;
      case "volunteeringOptions":
        fieldDisplay = "Volunteering Options";
        break;
      case "preferredLocation":
        fieldDisplay = "Preferred Location";
        break;
      case "startDate":
        fieldDisplay = "Start Date";
        break;
      case "endDate":
        fieldDisplay = "End Date";
        break;
      case "noOfDays":
        fieldDisplay = "Days Available";
        break;
      case "availability":
        fieldDisplay = "Availability";
        break;
      default:
        fieldDisplay = q.field;
    }
    const value = data[q.field] || "Not provided";
    summary += `${fieldDisplay.padEnd(25)}: ${value}\n`;
  });
  return summary;
};

// Update these interfaces at the top of your file
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart: () => void;
}

// Update the participant data interface
interface ParticipantData {
  fullName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  age: string;
  phoneNumber: string;
  emergencyContact: string;
  interest: string;
  selectedEvent?: string; // Keep this for backward compatibility
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatState, setChatState] = useState<ChatState>('welcome');
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const didMountRef = useRef(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('registeredEvents');
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  // Sequential states for each service
  const [volunteerData, setVolunteerData] = useState<Record<string, string>>({});
  const [volunteerQuestionIndex, setVolunteerQuestionIndex] = useState(0);
  const [participantData, setParticipantData] = useState<ParticipantData>({
    fullName: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    age: '',
    phoneNumber: '',
    emergencyContact: '',
    interest: ''
  });
  const [participantQuestionIndex, setParticipantQuestionIndex] = useState(0);
  const [eventCreationSeqData, setEventCreationSeqData] = useState<Record<string, string>>({});
  const [eventCreationQuestionIndex, setEventCreationQuestionIndex] = useState(0);
  const [upcomingEventIndex, setUpcomingEventIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);

  // Add new state for tracking typing timeout
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && speechEnabled && text.trim() !== '') {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    // Speak only bot messages (welcome message will be spoken only once when added to messages array)
    if (lastMessage.isBot) {
      speakMessage(lastMessage.text);
    }
  }, [messages, speechEnabled]);

  // Add the welcome message ONLY ONCE when component mounts
  useEffect(() => {
    setMessages([{
      text: "Welcome to Samarthanam. Do you need voice assistance?",
      isBot: true,
      type: 'button',
      buttons: [
        { 
          text: 'Yes, enable voice', 
          action: () => handleVoiceServiceChoice(true) 
        },
        { 
          text: 'No, continue with text', 
          action: () => handleVoiceServiceChoice(false) 
        },
      ],
    }]);
  }, []);

  useEffect(() => {
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
  }, [registeredEvents]);

  const addMessage = (
    text: string,
    isBot: boolean,
    type: 'text' | 'button' | 'form' = 'text',
    buttons?: Array<{ text: string; action: () => void }>
  ) => {
    setMessages((prev) => [...prev, { text, isBot, type, buttons }]);
  };

  const handleVoiceAssistanceSelection = (voiceRequired: boolean) => {
    setSpeechEnabled(voiceRequired);
    addMessage('How can I assist you today?', true, 'button', [
      { text: 'Registration for Volunteer', action: () => handleMainMenuClick('volunteer') },
      { text: 'Registration as Participant', action: () => handleMainMenuClick('participant') },
      { text: 'Create Event', action: () => handleMainMenuClick('create-event') },
      { text: 'Upcoming Events', action: () => handleMainMenuClick('events') },
      { text: 'Registered Events', action: () => handleMainMenuClick('registered') },
    ]);
  };

  const handleMainMenuClick = (state: ChatState) => {
    setChatState(state);
    if (state === 'volunteer') {
      setVolunteerData({});
      setVolunteerQuestionIndex(0);
      addMessage(volunteerQuestions[0].question, true);
    } else if (state === 'participant') {
      setParticipantData({
        fullName: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
        age: '',
        phoneNumber: '',
        emergencyContact: '',
        interest: ''
      });
      setParticipantQuestionIndex(0);
      addMessage(participantQuestions[0].question, true);
    } else if (state === 'create-event') {
      setEventCreationSeqData({});
      setEventCreationQuestionIndex(0);
      addMessage(eventCreationQuestions[0].question, true);
    } else if (state === 'events') {
      setUpcomingEventIndex(0);
      addMessage(
        `Upcoming event: ${upcomingEvents[0].title} - ${upcomingEvents[0].date}\nWould you like to register for this event? (Yes/No)`,
        true
      );
    } else if (state === 'registered') {
      handleRegisteredEventsFlow();
    } else if (state === 'welcome') {
      addMessage('How can I assist you today?', true, 'button', [
        { text: 'Registration for Volunteer', action: () => handleMainMenuClick('volunteer') },
        { text: 'Registration as Participant', action: () => handleMainMenuClick('participant') },
        { text: 'Create Event', action: () => handleMainMenuClick('create-event') },
        { text: 'Upcoming Events', action: () => handleMainMenuClick('events') },
        { text: 'Registered Events', action: () => handleMainMenuClick('registered') },
      ]);
    }
  };

  // HANDLERS FOR SEQUENTIAL ANSWERS WITH CONFIRMATION
  const handleVolunteerAnswer = () => {
    const answer = inputMessage.trim();
    if (!answer) return;
    addMessage(answer, false);
    const currentQuestion = volunteerQuestions[volunteerQuestionIndex];
    setVolunteerData((prev) => ({
      ...prev,
      [currentQuestion.field]: answer,
    }));
    const nextIndex = volunteerQuestionIndex + 1;
    if (nextIndex < volunteerQuestions.length) {
      setVolunteerQuestionIndex(nextIndex);
      addMessage(volunteerQuestions[nextIndex].question, true);
    } else {
      const finalData = { ...volunteerData, [currentQuestion.field]: answer };
      const summary = createSummary(finalData, volunteerQuestions);
      addMessage(summary + "\nIs this correct? (Yes/No)", true);
      setChatState('volunteerConfirm');
    }
  };

  const handleVolunteerConfirmation = async (data: any) => {
    addMessage("Thank you for registering as a volunteer!", true);
    setChatState('welcome');
    handleMainMenuClick('welcome');
  };

  const handleParticipantAnswer = () => {
    const answer = inputMessage.trim();
    if (!answer) return;
    addMessage(answer, false);
    const currentQuestion = participantQuestions[participantQuestionIndex];
    setParticipantData((prev) => ({
      ...prev,
      [currentQuestion.field]: answer,
    }));
    const nextIndex = participantQuestionIndex + 1;
    if (nextIndex < participantQuestions.length) {
      setParticipantQuestionIndex(nextIndex);
      addMessage(participantQuestions[nextIndex].question, true);
    } else {
      const finalData = { ...participantData, [currentQuestion.field]: answer };
      const summary = createSummary(finalData, participantQuestions);
      addMessage(summary + "\nIs this correct? (Yes/No)", true);
      handleParticipantConfirmation(finalData);
    }
  };

  const handleParticipantConfirmation = async (data: any) => {
    addMessage("Thank you for registering as a participant!", true);
    setChatState('welcome');
    handleMainMenuClick('welcome');
  };

  const handleEventCreationAnswer = () => {
    const answer = inputMessage.trim();
    if (!answer) return;
    addMessage(answer, false);
    const currentQuestion = eventCreationQuestions[eventCreationQuestionIndex];
    setEventCreationSeqData((prev) => ({
      ...prev,
      [currentQuestion.field]: answer,
    }));
    const nextIndex = eventCreationQuestionIndex + 1;
    if (nextIndex < eventCreationQuestions.length) {
      setEventCreationQuestionIndex(nextIndex);
      addMessage(eventCreationQuestions[nextIndex].question, true);
    } else {
      const finalData = { ...eventCreationSeqData, [currentQuestion.field]: answer };
      const summary = createSummary(finalData, eventCreationQuestions);
      addMessage(summary + "\nIs this correct? (Yes/No)", true);
      setChatState('eventCreationConfirm');
    }
  };

  const handleUpcomingEventsAnswer = () => {
    const answer = inputMessage.trim().toLowerCase();
    if (!answer) return;
    addMessage(answer, false);
    if (answer === 'yes') {
      const eventToRegister = upcomingEvents[upcomingEventIndex];
      addMessage(`You have registered for: ${eventToRegister.title}`, true);
      setRegisteredEvents((prev) => [...prev, eventToRegister]);
    }
    const nextIndex = upcomingEventIndex + 1;
    if (nextIndex < upcomingEvents.length) {
      setUpcomingEventIndex(nextIndex);
      addMessage(
        `Upcoming event: ${upcomingEvents[nextIndex].title} - ${upcomingEvents[nextIndex].date}\nWould you like to register for this event? (Yes/No)`,
        true
      );
    } else {
      addMessage('No more upcoming events.', true);
      addMessage('Would you like to access any other service?', true, 'button', [
        { text: 'Yes', action: () => handleMainMenuClick('welcome') },
        { text: 'No', action: () => addMessage('Thank you for connecting with Samarthanam. Have a great day!', true) },
      ]);
      setUpcomingEventIndex(0);
    }
  };

  const handleRegisteredEventsFlow = () => {
    if (registeredEvents.length === 0) {
      addMessage("You haven't registered for any events yet.", true);
      addMessage('Would you like to register for an event?', true, 'button', [
        { text: 'Yes', action: () => handleMainMenuClick('events') },
        { text: 'No', action: () => handleMainMenuClick('welcome') },
      ]);
      return;
    }
    let index = 0;
    const readNext = () => {
      if (index < registeredEvents.length) {
        addMessage(`Registered event ${index + 1}: ${registeredEvents[index].title} - ${registeredEvents[index].date}`, true);
        index++;
        setTimeout(readNext, 1000);
      } else {
        addMessage('Would you like to register for another event?', true, 'button', [
          { text: 'Yes', action: () => handleMainMenuClick('events') },
          { text: 'No', action: () => handleMainMenuClick('welcome') },
        ]);
      }
    };
    readNext();
  };

  // Further help handler for final confirmation
  const handleFurtherHelp = () => {
    const answer = inputMessage.trim().toLowerCase();
    if (!answer) return;
    addMessage(answer, false);
    if (answer === 'yes' || answer === 'y') {
      addMessage('How can I assist you today?', true, 'button', [
        { text: 'Registration for Volunteer', action: () => handleMainMenuClick('volunteer') },
        { text: 'Registration as Participant', action: () => handleMainMenuClick('participant') },
        { text: 'Create Event', action: () => handleMainMenuClick('create-event') },
        { text: 'Upcoming Events', action: () => handleMainMenuClick('events') },
        { text: 'Registered Events', action: () => handleMainMenuClick('registered') },
      ]);
      speakMessage('How can I assist you today?');
    } else {
      addMessage('Thank you for connecting with Samarthanam. Have a great day!', true);
      speakMessage('Thank you for connecting with Samarthanam. Have a great day!');
    }
    setChatState('welcome');
  };

  // Function to handle auto-submission
  const handleAutoSubmit = () => {
    if (inputMessage.trim() !== '') {
      handleSendMessage();
      setInputMessage('');
    }
  };

  // Function to reset the auto-submit timer
  const resetAutoSubmitTimer = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (inputMessage.trim() !== '') {
      const newTimeout = setTimeout(() => {
        handleAutoSubmit();
      }, 2000);
      setTypingTimeout(newTimeout);
    }
  };

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[event.results.length - 1][0].transcript;
        setInputMessage(spokenText);
        // Reset the timer whenever new speech is detected
        resetAutoSubmitTimer();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  };

  // Watch for changes in inputMessage to handle auto-submit
  useEffect(() => {
    resetAutoSubmitTimer();
    
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [inputMessage]);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      if (chatState === 'volunteerConfirm') {
        const answer = inputMessage.toLowerCase();
        addMessage(answer, false);
        if (answer === 'yes') {
          handleVolunteerConfirmation(volunteerData);
        } else {
          addMessage('Registration cancelled. Returning to main menu.', true);
          setChatState('welcome');
          handleMainMenuClick('welcome');
        }
      } else if (chatState === 'participantConfirm') {
        const answer = inputMessage.toLowerCase();
        addMessage(answer, false);
        if (answer === 'yes') {
          handleParticipantConfirmation(participantData);
        } else {
          addMessage('Registration cancelled. Returning to main menu.', true);
          setChatState('welcome');
          handleMainMenuClick('welcome');
        }
      } else {
        if (chatState === 'volunteer') {
          handleVolunteerAnswer();
        } else if (chatState === 'participant') {
          handleParticipantAnswer();
        } else if (chatState === 'create-event') {
          handleEventCreationAnswer();
        } else if (chatState === 'events') {
          handleUpcomingEventsAnswer();
        } else if (chatState === 'registered') {
          handleRegisteredEventsFlow();
        } else if (chatState === 'furtherHelp') {
          handleFurtherHelp();
        } else {
          addMessage(inputMessage, false);
        }
      }
      setInputMessage('');
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsProcessingSubmit(true);
      await handleSendMessage();
      setIsProcessingSubmit(false);
      setInputMessage('');
      
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (isListening && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 100);
      }
    }
  };

  const toggleSpeech = () => {
    setSpeechEnabled((prev) => !prev);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
    };
  }, []);

  const handleVoiceServiceChoice = (enableVoice: boolean) => {
    setSpeechEnabled(enableVoice);
    
    if (enableVoice) {
      addMessage("Voice service enabled!", true);
    } else {
      addMessage("Going ahead without voice service!", true);
    }
    
    setTimeout(() => {
      addMessage(
        "How can I assist you today?",
        true,
        'button',
        [
          { text: 'Registration for Volunteer', action: () => handleMainMenuClick('volunteer') },
          { text: 'Registration as Participant', action: () => handleMainMenuClick('participant') },
          { text: 'Upcoming Events', action: () => handleMainMenuClick('events') },
          { text: 'Registered Events', action: () => handleMainMenuClick('registered') },
          { text: 'Create Event', action: () => handleMainMenuClick('create-event') },
        ]
      );
    }, 1000);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const renderMessage = (message: Message, index: number) => {
    if (message.text.includes("Please confirm the details below:")) {
      return (
        <MessageBubble isBot={message.isBot} key={index}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {message.text}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                addMessage("Yes", false);
                addMessage("Are you sure you want to submit? (Yes/No)", true);
                setChatState(chatState === 'participant' ? 'participantConfirm' : 'volunteerConfirm');
              }}
            >
              Yes
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={() => {
                addMessage("No", false);
                addMessage("Let's fill out the form again.", true);
                if (chatState === 'participant') {
                  setParticipantData({
                    fullName: '',
                    emailAddress: '',
                    password: '',
                    confirmPassword: '',
                    age: '',
                    phoneNumber: '',
                    emergencyContact: '',
                    interest: ''
                  });
                  setParticipantQuestionIndex(0);
                  setChatState('participant');
                  addMessage(participantQuestions[0].question, true);
                } else {
                  setVolunteerData({});
                  setVolunteerQuestionIndex(0);
                  setChatState('volunteer');
                  addMessage(volunteerQuestions[0].question, true);
                }
              }}
            >
              No
            </Button>
          </Box>
        </MessageBubble>
      );
    }
    if (message.type === 'button' && message.buttons) {
      return (
        <MessageBubble key={index} isBot={message.isBot}>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{message.text}</Typography>
          <ButtonContainer>
            {message.buttons.map((button, btnIndex) => (
              <Button key={btnIndex} variant="contained" onClick={button.action} sx={{ mt: 1 }}>
                {button.text}
              </Button>
            ))}
          </ButtonContainer>
        </MessageBubble>
      );
    }
    return (
      <MessageBubble key={index} isBot={message.isBot}>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{message.text}</Typography>
      </MessageBubble>
    );
  };

  return (
    <ChatPaper elevation={3}>
      <HeaderContainer>
        <Typography variant="h5">Samarthanam Chatbot</Typography>
        <IconButton onClick={toggleSpeech}>
          {speechEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
      </HeaderContainer>
      <MessageContainer>
        {messages.map((message, index) => (
          <React.Fragment key={index}>{renderMessage(message, index)}</React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </MessageContainer>
      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isListening ? "Listening..." : "Type your message..."}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isListening}
        />
        {/* Updated mic IconButton with keyboard support for Tab key */}
        <IconButton 
          color={isListening ? "error" : "primary"} 
          onClick={isListening ? stopListening : startListening}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              isListening ? stopListening() : startListening();
            }
          }}
        >
          {isListening ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => {
            if (chatState === 'volunteer') handleVolunteerAnswer();
            else if (chatState === 'participant') handleParticipantAnswer();
            else if (chatState === 'create-event') handleEventCreationAnswer();
            else if (chatState === 'events') handleUpcomingEventsAnswer();
          }}
        >
          <SendIcon />
        </IconButton>
      </InputContainer>
    </ChatPaper>
  );
};

export default Chatbot;
