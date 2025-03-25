'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Fab, 
  Drawer, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Switch, 
  IconButton,
  Button,
  Divider,
  Tooltip,
  Badge,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ContrastIcon from '@mui/icons-material/Contrast';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import TranslateIcon from '@mui/icons-material/Translate';
import LanguageIcon from '@mui/icons-material/Language';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Define language options
interface Language {
  code: string;
  name: string;
  native: string;
  voiceCommands: { [key: string]: string };
}

// Define available languages with their voice commands
const languages: Language[] = [
  {
    code: 'en-IN',
    name: 'English (India)',
    native: 'English',
    voiceCommands: {
      'go to home': 'go to home',
      'go to profile': 'go to profile',
      'go to events': 'go to events',
      'go to login': 'go to login',
      'go to calendar': 'go to calendar',
      'go to leaderboard': 'go to leaderboard',
      'click button': 'click button',
      'scroll down': 'scroll down',
      'scroll up': 'scroll up',
      'close': 'close'
    }
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    native: 'हिन्दी',
    voiceCommands: {
      'go to home': 'होम पेज जाओ',
      'go to profile': 'प्रोफाइल पर जाओ',
      'go to events': 'इवेंट्स पर जाओ',
      'go to login': 'लॉगिन पर जाओ',
      'go to calendar': 'कैलेंडर पर जाओ',
      'go to leaderboard': 'लीडरबोर्ड पर जाओ',
      'click button': 'बटन दबाओ',
      'scroll down': 'नीचे स्क्रॉल करो',
      'scroll up': 'ऊपर स्क्रॉल करो',
      'close': 'बंद करो'
    }
  },
  {
    code: 'bn-IN',
    name: 'Bengali',
    native: 'বাংলা',
    voiceCommands: {
      'go to home': 'হોম পેজে যান',
      'go to profile': 'প্রোফাইলে যান',
      'go to events': 'ইভেন্টে যান',
      'go to login': 'লগইনে যান',
      'go to calendar': 'ক্যালেন্ডারে যান',
      'go to leaderboard': 'লিডারবੋর্ডে যান',
      'click button': 'বাটন ক্লিক করুন',
      'scroll down': 'নিচে স্ক্রল করুন',
      'scroll up': 'উপর স্ক্রল করুন',
      'close': 'বন্ধ করুন'
    }
  },
  {
    code: 'ta-IN',
    name: 'Tamil',
    native: 'தமிழ்',
    voiceCommands: {
      'go to home': 'முகப்புப் பக்கத்திற்குச் செல்',
      'go to profile': 'சுயவிவரத்திற்குச் செல்',
      'go to events': 'நிகழ்வுகளுக்குச் செல்',
      'go to login': 'உள்நுழைவுக்குச் செல்',
      'go to calendar': 'காலண்டருக்குச் செல்',
      'go to leaderboard': 'லீடர்போர்டுக்குச் செல்',
      'click button': 'பொத்தானை கிளிக் செய்',
      'scroll down': 'கீழே ஸ்க்ரோல் செய்',
      'scroll up': 'மேலே ஸ்க்ரோல் செய்',
      'close': 'மூடு'
    }
  },
  {
    code: 'te-IN',
    name: 'Telugu',
    native: 'తెలుగు',
    voiceCommands: {
      'go to home': 'హోమ్ పేజీకి వెళ్ళండి',
      'go to profile': 'ప్రొఫైల్‌కి వెళ్ళండి',
      'go to events': 'ఈవెంట్స్‌కి వెళ్ళండి',
      'go to login': 'లాగిన్‌కి వెళ్ళండి',
      'go to calendar': 'క్యాలెండర్‌కి వెళ్ళండి',
      'go to leaderboard': 'లీడర్‌బోర్డుకి వెళ్ళండి',
      'click button': 'బటన్ క్లిక్ చేయండి',
      'scroll down': 'కిందికి స్క్రోల్ చేయండి',
      'scroll up': 'పైకి స్క్రోల్ చేయండి',
      'close': 'మూసివేయండి'
    }
  },
  {
    code: 'gu-IN',
    name: 'Gujarati',
    native: 'ગુજરાતી',
    voiceCommands: {
      'go to home': 'હોમ પેજ પર જાઓ',
      'go to profile': 'પ્રોફાઇલ પર જાઓ',
      'go to events': 'ઇવેન્ટ્સ પર જાઓ',
      'go to login': 'લૉગિન પર જાઓ',
      'go to calendar': 'કેલેન્ડર પર જાઓ',
      'go to leaderboard': 'લીડરબોર્ડ પર જાઓ',
      'click button': 'બટન ક્લિક કરો',
      'scroll down': 'નીચે સ્ક્રોલ કરો',
      'scroll up': 'ઉપર સ્ક્રોલ કરો',
      'close': 'બંધ કરો'
    }
  },
  {
    code: 'kn-IN',
    name: 'Kannada',
    native: 'ಕನ್ನಡ',
    voiceCommands: {
      'go to home': 'ಹೋಮ್ ಪುಟಕ್ಕೆ ಹೋಗಿ',
      'go to profile': 'ಪ್ರೊಫೈಲ್‌ಗೆ ಹೋಗಿ',
      'go to events': 'ಈವೆಂಟ್‌ಗಳಿಗೆ ಹೋಗಿ',
      'go to login': 'ಲಾಗಿನ್‌ಗೆ ಹೋಗಿ',
      'go to calendar': 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಹೋಗಿ',
      'go to leaderboard': 'ಲೀಡರ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
      'click button': 'ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ',
      'scroll down': 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ',
      'scroll up': 'ಮೇಲೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ',
      'close': 'ಮುಚ್ಚಿ'
    }
  },
  {
    code: 'ml-IN',
    name: 'Malayalam',
    native: 'മലയാളം',
    voiceCommands: {
      'go to home': 'ഹോം പേജിലേക്ക് പോകുക',
      'go to profile': 'പ്രൊഫൈലിലേക്ക് പോകുക',
      'go to events': 'ഇവന്റുകളിലേക്ക് പോകുക',
      'go to login': 'ലോഗിനിലേക്ക് പോകുക',
      'go to calendar': 'കലണ്ടറിലേക്ക് പോകുക',
      'go to leaderboard': 'ലീഡർബോർഡിലേക്ക് പോകുക',
      'click button': 'ബട്ടൺ ക്ലിക്ക് ചെയ്യുക',
      'scroll down': 'താഴേക്ക് സ്ക്രോൾ ചെയ്യുക',
      'scroll up': 'മുകളിലേക്ക് സ്ക്രോൾ ചെയ്യുക',
      'close': 'അടയ്ക്കുക'
    }
  },
  {
    code: 'pa-IN',
    name: 'Punjabi',
    native: 'ਪੰਜਾਬੀ',
    voiceCommands: {
      'go to home': 'ਹੋਮ ਪੇਜ ਤੇ ਜਾਓ',
      'go to profile': 'ਪ੍ਰੋਫਾਈਲ ਤੇ ਜਾਓ',
      'go to events': 'ਇਵੈਂਟਸ ਤੇ ਜਾਓ',
      'go to login': 'ਲੌਗਿਨ ਤੇ ਜਾਓ',
      'go to calendar': 'ਕੈਲੰਡਰ ਤੇ ਜਾਓ',
      'go to leaderboard': 'ਲੀਡਰਬੋਰਡ ਤੇ ਜਾਓ',
      'click button': 'ਬਟਨ ਕਲਿੱਕ ਕਰੋ',
      'scroll down': 'ਹੇਠਾਂ ਸਕ੍ਰੋਲ ਕਰੋ',
      'scroll up': 'ਉੱਪਰ ਸਕ੍ਰੋਲ ਕਰੋ',
      'close': 'ਬੰਦ ਕਰੋ'
    }
  },
  {
    code: 'mr-IN',
    name: 'Marathi',
    native: 'मराठी',
    voiceCommands: {
      'go to home': 'होम पेजवर जा',
      'go to profile': 'प्रोफाइलवर जा',
      'go to events': 'इव्हेंट्सवर जा',
      'go to login': 'लॉगिनवर जा',
      'go to calendar': 'कॅलेंडरवर जा',
      'go to leaderboard': 'लीडरबोर्डवर जा',
      'click button': 'बटण क्लिक करा',
      'scroll down': 'खाली स्क्रोल करा',
      'scroll up': 'वर स्क्रोल करा',
      'close': 'बंद करा'
    }
  }
];

interface SpeechCommand {
  command: string;
  action: () => void;
  feedback: string;
}

// Define translation state interface
interface TranslationState {
  isTranslating: boolean;
  isTranslated: boolean;
  currentLanguage: string;
  error: string | null;
}

const AccessibilityWidget = () => {
  const [open, setOpen] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [fontSizeIncreased, setFontSizeIncreased] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeElement, setActiveElement] = useState<Element | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true);
  const [translationState, setTranslationState] = useState<TranslationState>({
    isTranslating: false,
    isTranslated: false,
    currentLanguage: 'en-IN',
    error: null
  });
  
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  // Store original page text for reverting translations
  const originalTextContent = useRef<Map<Element, string>>(new Map());
  
  // Text-to-speech function - MOVED UP before it's used
  const speak = useCallback((text: string) => {
    if (synth && !synth.speaking && text && textToSpeechEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Set language for utterance
      utterance.lang = selectedLanguage.code;
      
      // Use a preferred voice if available
      const voices = synth.getVoices();
      const preferredVoice = voices.find(
        voice => voice.lang === selectedLanguage.code || 
                 voice.lang.startsWith(selectedLanguage.code.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 1.0;  // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      synth.speak(utterance);
    }
  }, [synth, selectedLanguage.code, textToSpeechEnabled]);
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);
  
  // First define the revertTranslation function
  const revertTranslation = useCallback(() => {
    // Restore original text content
    originalTextContent.current.forEach((originalText, element) => {
      if (element.textContent !== originalText) {
        element.textContent = originalText;
      }
      element.removeAttribute('lang');
    });
    
    // Reset html lang attribute
    document.documentElement.setAttribute('lang', 'en');
    
    // Update state
    setTranslationState({
      isTranslating: false,
      isTranslated: false,
      currentLanguage: 'en-IN',
      error: null
    });
    
    // Clear stored content
    originalTextContent.current.clear();
    
    // Announce change
    speak('Translation reverted to English');
  }, [speak]);
  
  // Replace the translation function
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (!text.trim()) return text;
    
    // If English is targeted, return the original text
    if (targetLang === 'en-IN') return text;
    
    try {
      // Extract the language code without region (e.g., 'hi-IN' becomes 'hi')
      const langCode = targetLang.split('-')[0];
      
      // For demonstration purposes - normally you would use a backend proxy to hide your API key
      // This uses Google Translate API via rapid API - a safer approach is to use a backend proxy
      const response = await axios({
        method: 'POST',
        url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'application/gzip',
          'X-RapidAPI-Key': 'YOUR_RAPID_API_KEY', // In production, use environment variables
          'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
        },
        data: new URLSearchParams({
          q: text,
          source: 'en',
          target: langCode,
          format: 'text'
        })
      });
      
      if (response.data && 
          response.data.data && 
          response.data.data.translations && 
          response.data.data.translations[0]) {
        return response.data.data.translations[0].translatedText;
      }
      
      // Fallback translation for demo purposes when API is not available
      return getFallbackTranslation(text, langCode);
      
    } catch (error) {
      console.error('Translation error:', error);
      // Use fallback translation in case of error for demo purposes
      return getFallbackTranslation(text, langCode);
    }
  };

  // Fallback translation function for demo purposes - remove in production
  const getFallbackTranslation = (text: string, langCode: string): string => {
    // This is just for demonstration when API is not available
    const demoTranslations: {[key: string]: string} = {
      'hi': `${text} (हिंदी)`,
      'bn': `${text} (বাংলা)`,
      'ta': `${text} (தமிழ்)`,
      'te': `${text} (తెలుగు)`,
      'gu': `${text} (ગુજરાતી)`,
      'kn': `${text} (ಕನ್ನಡ)`,
      'ml': `${text} (മലയാളം)`,
      'pa': `${text} (ਪੰਜਾਬੀ)`,
      'mr': `${text} (मराठी)`
    };
    
    return demoTranslations[langCode] || text;
  };
  
  // Then define translatePage which can now safely use revertTranslation
  const translatePage = useCallback(async (targetLang: string) => {
    // Always revert any existing translation first to prevent stacking
    if (translationState.isTranslated) {
      revertTranslation();
    }
    
    if (targetLang === 'en-IN') {
      // If English is selected, no need to do anything after revert
      return;
    }
    
    try {
      setTranslationState(prev => ({ 
        ...prev, 
        isTranslating: true, 
        error: null 
      }));
      
      // Select elements to translate (excluding the accessibility panel itself)
      const textElements = document.querySelectorAll(
        'body > *:not(.MuiDrawer-root) h1, body > *:not(.MuiDrawer-root) h2, body > *:not(.MuiDrawer-root) h3, ' +
        'body > *:not(.MuiDrawer-root) h4, body > *:not(.MuiDrawer-root) h5, body > *:not(.MuiDrawer-root) h6, ' +
        'body > *:not(.MuiDrawer-root) p, body > *:not(.MuiDrawer-root) span, body > *:not(.MuiDrawer-root) a, ' +
        'body > *:not(.MuiDrawer-root) button, body > *:not(.MuiDrawer-root) label, body > *:not(.MuiDrawer-root) li'
      );
      
      for (const element of Array.from(textElements)) {
        // Skip elements with no direct text or already processed elements
        if (!element.childNodes.length) continue;
        
        // Store original text if not already stored
        if (!originalTextContent.current.has(element)) {
          originalTextContent.current.set(element, element.textContent || '');
        }
        
        // Only translate text nodes that are direct children of this element
        for (const node of Array.from(element.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            const translatedText = await translateText(node.textContent, targetLang);
            node.textContent = translatedText;
          }
        }
        
        // Set the lang attribute to help screen readers
        element.setAttribute('lang', targetLang.split('-')[0]);
      }
      
      // Update the html lang attribute
      document.documentElement.setAttribute('lang', targetLang.split('-')[0]);
      
      // Update state after translation
      setTranslationState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        isTranslated: true,
        currentLanguage: targetLang
      }));
      
      // Announce the translation in the selected language
      const langName = languages.find(lang => lang.code === targetLang)?.native || '';
      speak(`Page translated to ${langName}`);
      
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationState(prev => ({ 
        ...prev, 
        isTranslating: false,
        error: "Failed to translate page. Please try again." 
      }));
    }
  }, [speak, revertTranslation, translationState.isTranslated]);
  
  // Define base commands in English
  const getCommands = useCallback((): SpeechCommand[] => {
    return [
      { 
        command: 'go to home', 
        action: () => router.push('/'), 
        feedback: 'Navigating to home page'
      },
      { 
        command: 'go to profile', 
        action: () => router.push('/profile'), 
        feedback: 'Navigating to profile page'
      },
      { 
        command: 'go to events', 
        action: () => router.push('/events'), 
        feedback: 'Navigating to events page'
      },
      { 
        command: 'go to login', 
        action: () => router.push('/login'), 
        feedback: 'Navigating to login page'
      },
      { 
        command: 'go to calendar', 
        action: () => router.push('/calendar'), 
        feedback: 'Navigating to calendar page'
      },
      { 
        command: 'go to leaderboard', 
        action: () => router.push('/leaderboard'), 
        feedback: 'Navigating to leaderboard page'
      },
      { 
        command: 'click button', 
        action: () => {
          // Find the active/focused button and click it
          const focusedElement = document.activeElement;
          if (focusedElement && focusedElement.tagName === 'BUTTON') {
            (focusedElement as HTMLButtonElement).click();
          }
        },
        feedback: 'Clicking focused button'
      },
      { 
        command: 'scroll down', 
        action: () => window.scrollBy(0, 300), 
        feedback: 'Scrolling down'
      },
      { 
        command: 'scroll up', 
        action: () => window.scrollBy(0, -300), 
        feedback: 'Scrolling up'
      },
      { 
        command: 'close', 
        action: () => setOpen(false), 
        feedback: 'Closing accessibility panel'
      },
    ];
  }, [router]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript.toLowerCase().trim());
        };
        
        recognitionRef.current.onend = () => {
          if (speechToTextEnabled) {
            // Restart speech recognition if it's still enabled
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart speech recognition:", e);
              setListening(false);
            }
          } else {
            setListening(false);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            // Permission denied
            alert("Microphone access denied. Please enable microphone access in your browser settings to use speech recognition.");
            setSpeechToTextEnabled(false);
            setListening(false);
          }
        };
      } else {
        // Browser doesn't support speech recognition
        setBrowserSupportsSpeech(false);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
      }
    };
  }, []);
  
  // Handle language change with translation
  const handleLanguageChange = (event: SelectChangeEvent) => {
    const langCode = event.target.value;
    const newLang = languages.find(lang => lang.code === langCode) || languages[0];
    setSelectedLanguage(newLang);
    
    // Translate the page when language changes
    translatePage(langCode);
    
    // Update speech recognition language
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang.code;
      
      // If already listening, restart with new language
      if (listening) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error("Failed to restart speech recognition with new language:", e);
            }
          }, 200);
        } catch (e) {
          console.error("Error changing speech recognition language:", e);
        }
      }
    }
  };
  
  // Process voice commands based on transcript
  useEffect(() => {
    if (!transcript || !speechToTextEnabled) return;
    
    const commands = getCommands();
    const voiceCommands = selectedLanguage.voiceCommands;
    
    // Check for commands in selected language
    for (const command of commands) {
      const localizedCommand = voiceCommands[command.command];
      
      // Check both English command and localized command
      if (transcript.includes(command.command) || 
          (localizedCommand && transcript.includes(localizedCommand))) {
        speak(command.feedback);
        command.action();
        setTranscript('');
        break;
      }
    }
  }, [transcript, speechToTextEnabled, selectedLanguage, getCommands]);
  
  // Toggle speech recognition when enabled/disabled
  useEffect(() => {
    if (speechToTextEnabled && recognitionRef.current) {
      // Set language before starting
      recognitionRef.current.lang = selectedLanguage.code;
      
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setSpeechToTextEnabled(false);
        setListening(false);
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
      setListening(false);
    }
  }, [speechToTextEnabled, selectedLanguage.code]);
  
  // Load saved settings from localStorage on mount, but don't auto-enable text-to-speech
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load high contrast setting
      const savedHighContrast = localStorage.getItem('accessibility_highContrast');
      if (savedHighContrast) {
        setHighContrastEnabled(savedHighContrast === 'true');
        // Apply high contrast immediately
        if (savedHighContrast === 'true') {
          document.body.classList.add('high-contrast-mode');
        }
      }
      
      // Load font size setting
      const savedFontSize = localStorage.getItem('accessibility_fontSize');
      if (savedFontSize) {
        setFontSizeIncreased(savedFontSize === 'true');
        // Apply font size immediately
        if (savedFontSize === 'true') {
          document.body.classList.add('increased-font-size');
        }
      }
      
      // We no longer auto-load text-to-speech setting to prevent it from starting automatically
      // The user must explicitly enable it through the UI
      
      // Load language setting
      const savedLanguage = localStorage.getItem('accessibility_language');
      if (savedLanguage) {
        const lang = languages.find(l => l.code === savedLanguage);
        if (lang) {
          setSelectedLanguage(lang);
        }
      }
    }
  }, []);
  
  // High contrast mode
  useEffect(() => {
    // Add high contrast styles
    const style = document.createElement('style');
    style.id = 'high-contrast-styles';
    style.textContent = `
      .high-contrast-mode {
        filter: contrast(1.5);
      }
      .high-contrast-mode button, 
      .high-contrast-mode a, 
      .high-contrast-mode [role="button"] {
        filter: brightness(1.2);
      }
      /* Make sure the accessibility button always remains visible */
      .MuiFab-root[aria-label="accessibility options"] {
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 9999 !important;
      }
    `;
    
    if (highContrastEnabled) {
      document.body.classList.add('high-contrast-mode');
      if (!document.getElementById('high-contrast-styles')) {
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('high-contrast-mode');
      const existingStyle = document.getElementById('high-contrast-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    }
    
    // Save setting to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility_highContrast', highContrastEnabled.toString());
    }
    
    return () => {
      document.body.classList.remove('high-contrast-mode');
      const existingStyle = document.getElementById('high-contrast-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, [highContrastEnabled]);
  
  // Increased font size
  useEffect(() => {
    // Add font size styles
    const style = document.createElement('style');
    style.id = 'increased-font-styles';
    style.textContent = `
      .increased-font-size {
        font-size: 120% !important;
      }
      .increased-font-size h1 {
        font-size: 2.4rem !important;
      }
      .increased-font-size h2 {
        font-size: 2rem !important;
      }
      .increased-font-size h3 {
        font-size: 1.8rem !important;
      }
      .increased-font-size h4, .increased-font-size h5, .increased-font-size h6 {
        font-size: 1.5rem !important;
      }
      .increased-font-size p, .increased-font-size span, .increased-font-size button, .increased-font-size a {
        font-size: 1.2rem !important;
      }
    `;
    
    if (fontSizeIncreased) {
      document.body.classList.add('increased-font-size');
      if (!document.getElementById('increased-font-styles')) {
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('increased-font-size');
      const existingStyle = document.getElementById('increased-font-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    }
    
    // Save setting to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility_fontSize', fontSizeIncreased.toString());
    }
    
    return () => {
      document.body.classList.remove('increased-font-size');
      const existingStyle = document.getElementById('increased-font-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, [fontSizeIncreased]);
  
  // Language selection
  useEffect(() => {
    // Save language setting to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility_language', selectedLanguage.code);
    }
  }, [selectedLanguage]);
  
  // Text-to-speech for focused elements - only activate when explicitly enabled
  useEffect(() => {
    if (!textToSpeechEnabled) {
      // If text-to-speech is disabled, stop any ongoing speech
      if (synth) {
        synth.cancel();
        setIsSpeaking(false);
      }
      return;
    }
    
    // Save setting to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility_textToSpeech', textToSpeechEnabled.toString());
    }
    
    const handleFocus = (e: FocusEvent) => {
      const element = e.target as HTMLElement;
      if (!textToSpeechEnabled || !element || element === activeElement) return;
      
      setActiveElement(element);
      
      // Extract text content to speak
      let textToSpeak = '';
      
      // For links, buttons, and headings, read their visible text
      if (
        element.tagName === 'A' || 
        element.tagName === 'BUTTON' || 
        element.tagName.match(/H[1-6]/)
      ) {
        textToSpeak = element.textContent || '';
      }
      
      // For form controls, read their labels
      if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        // Try to find associated label
        const id = element.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) {
            textToSpeak = `${label.textContent || ''} ${element.tagName === 'INPUT' ? 'field' : element.tagName.toLowerCase()}`;
          }
        }
      }
      
      // For tabs and other role elements
      const role = element.getAttribute('role');
      if (role) {
        textToSpeak = `${element.textContent || ''} ${role}`;
      }
      
      // Speak the text if not empty
      if (textToSpeak.trim()) {
        speak(textToSpeak);
      }
    };
    
    document.addEventListener('focus', handleFocus, true);
    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, [textToSpeechEnabled, activeElement, speak, synth]);
  
  // Get available voices for the current language
  const getAvailableVoicesForLanguage = useCallback(() => {
    if (!synth) return [];
    const voices = synth.getVoices();
    return voices.filter(voice => 
      voice.lang === selectedLanguage.code || 
      voice.lang.startsWith(selectedLanguage.code.split('-')[0])
    );
  }, [synth, selectedLanguage.code]);
  
  // Observer for dynamic content
  useEffect(() => {
    if (!translationState.isTranslated) return;
    
    // Set up a MutationObserver to catch dynamically added content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Translate new elements
              setTimeout(() => {
                const newTextElements = (node as Element).querySelectorAll(
                  'h1, h2, h3, h4, h5, h6, p, span, a, button, label, li'
                );
                
                newTextElements.forEach(async (element) => {
                  // Skip if already processed
                  if (originalTextContent.current.has(element)) return;
                  
                  // Store original
                  originalTextContent.current.set(element, element.textContent || '');
                  
                  // Translate
                  if (element.textContent?.trim()) {
                    const translatedText = await translateText(
                      element.textContent, 
                      translationState.currentLanguage
                    );
                    element.textContent = translatedText;
                  }
                  
                  // Set lang attribute
                  element.setAttribute(
                    'lang', 
                    translationState.currentLanguage.split('-')[0]
                  );
                });
              }, 100);
            }
          });
        }
      });
    });
    
    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => {
      observer.disconnect();
    };
  }, [translationState.isTranslated, translationState.currentLanguage]);
  
  const toggleDrawer = () => {
    setOpen(!open);
    // Announce when the accessibility panel opens, but only if text-to-speech is enabled
    if (!open && textToSpeechEnabled) {
      speak('Accessibility panel opened');
    }
  };
  
  return (
    <>
      <Tooltip title="Accessibility Options" arrow>
        <Fab
          color="primary"
          aria-label="accessibility options"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 2000,
            visibility: 'visible !important',
            opacity: '1 !important',
          }}
          onClick={toggleDrawer}
        >
          <AccessibilityNewIcon />
        </Fab>
      </Tooltip>
      
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: { width: 320, padding: 2 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography variant="h6" component="div">
            Accessibility Options
          </Typography>
          <IconButton onClick={toggleDrawer} aria-label="close accessibility panel">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Language Selection with Translation Status */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="language-select-label">Page Language</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={selectedLanguage.code}
              label="Page Language"
              onChange={handleLanguageChange}
              startAdornment={<LanguageIcon sx={{ mr: 1, ml: -0.5 }} fontSize="small" />}
              disabled={translationState.isTranslating}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.native})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {translationState.isTranslating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption">
                Translating page content...
              </Typography>
            </Box>
          )}
          
          {translationState.isTranslated && !translationState.isTranslating && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TranslateIcon color="success" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="caption">
                Page translated to {selectedLanguage.native}
              </Typography>
            </Box>
          )}
        </Box>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <VolumeUpIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Text-to-Speech" 
              secondary="Read screen elements aloud" 
            />
            <Switch
              edge="end"
              checked={textToSpeechEnabled}
              onChange={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
              inputProps={{
                'aria-labelledby': 'text-to-speech-switch'
              }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <MicIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Speech Recognition" 
              secondary="Control with voice commands" 
            />
            <Switch
              edge="end"
              checked={speechToTextEnabled}
              onChange={() => {
                // Only enable if browser supports it
                if (!browserSupportsSpeech && !speechToTextEnabled) {
                  alert("Your browser doesn't support speech recognition. Please try Chrome or Edge browser.");
                  return;
                }
                setSpeechToTextEnabled(!speechToTextEnabled);
              }}
              disabled={!browserSupportsSpeech}
              inputProps={{
                'aria-labelledby': 'speech-to-text-switch'
              }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ZoomInIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Larger Text" 
              secondary="Increase font size" 
            />
            <Switch
              edge="end"
              checked={fontSizeIncreased}
              onChange={() => setFontSizeIncreased(!fontSizeIncreased)}
              inputProps={{
                'aria-labelledby': 'font-size-switch'
              }}
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <ContrastIcon />
            </ListItemIcon>
            <ListItemText 
              primary="High Contrast" 
              secondary="Improve visibility" 
            />
            <Switch
              edge="end"
              checked={highContrastEnabled}
              onChange={() => setHighContrastEnabled(!highContrastEnabled)}
              inputProps={{
                'aria-labelledby': 'high-contrast-switch'
              }}
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        {translationState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {translationState.error}
          </Alert>
        )}
        
        {!browserSupportsSpeech && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your browser doesn't support speech recognition. Please use Chrome or Edge for full accessibility features.
          </Alert>
        )}
        
        {speechToTextEnabled && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Voice Commands
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, mb: 2, backgroundColor: listening ? 'rgba(0, 255, 0, 0.05)' : 'transparent' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge color={listening ? "success" : "error"} variant="dot" sx={{ mr: 1 }}>
                  <RecordVoiceOverIcon />
                </Badge>
                <Typography variant="body2">
                  {listening ? 'Listening for commands...' : 'Voice recognition inactive'}
                </Typography>
              </Box>
              
              {transcript && (
                <Typography variant="body2" fontStyle="italic">
                  &quot;{transcript}&quot;
                </Typography>
              )}
            </Paper>
            
            <Typography variant="body2" gutterBottom>
              Available commands ({selectedLanguage.native}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getCommands().map((cmd, index) => {
                const localizedCommand = selectedLanguage.voiceCommands[cmd.command];
                return (
                  <Tooltip 
                    key={index} 
                    title={selectedLanguage.code === 'en-IN' ? '' : cmd.command} 
                    arrow
                  >
                    <Chip 
                      label={localizedCommand || cmd.command} 
                      size="small" 
                      variant="outlined"
                      icon={<KeyboardIcon fontSize="small" />}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        )}
        
        {textToSpeechEnabled && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Text-to-Speech Status
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge color={isSpeaking ? "success" : "primary"} variant="dot" sx={{ mr: 1 }}>
                  <VolumeUpIcon />
                </Badge>
                <Typography variant="body2">
                  {isSpeaking ? 'Speaking...' : 'Ready to speak'}
                </Typography>
              </Box>
              
              {getAvailableVoicesForLanguage().length === 0 && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <InfoIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    No specific voices available for {selectedLanguage.name}. Using default voice.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
          <Button 
            variant="contained" 
            onClick={toggleDrawer}
            fullWidth
          >
            Close Panel
          </Button>
        </Box>
      </Drawer>
      
      {/* Snackbar for translation notifications */}
      <Snackbar
        open={translationState.isTranslating}
        message="Translating page content..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  );
};

export default AccessibilityWidget; 