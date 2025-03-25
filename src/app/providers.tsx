'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '../redux/store';
import AccessibilityWidgetWrapper from '@/components/accessibility/AccessibilityWidgetWrapper';

// Create theme with high contrast colors for accessibility
const theme = createTheme({
  palette: {
    primary: {
      main: '#005CA9', // Darker blue with better contrast
      light: '#4D88C8',
      dark: '#004076',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E63E11', // Orange-red for better visibility
      light: '#FF6B45',
      dark: '#BC2200',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F', // Accessible red
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#ED6C02', // Orange
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0288D1', // Accessible blue
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32', // Accessible green
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#212121', // Very dark gray for high contrast
      secondary: '#424242', // Dark gray for readable secondary text
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // More readable button text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          // Improve focus visibility for keyboard users
          '&:focus-visible': {
            outline: '3px solid #005CA9',
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: '#005CA9',
              },
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    // Add styles for links and interactive elements
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #005CA9',
            outlineOffset: 2,
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #005CA9',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            backgroundColor: 'rgba(0, 92, 169, 0.1)',
            outline: '2px solid #005CA9',
            outlineOffset: -2,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #005CA9',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #005CA9',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #005CA9',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

// Keyboard Navigation Helper - adds keyboard shortcuts and focus indicators
function KeyboardNavigationHelper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add a keyboard navigation class to the body when Tab is pressed
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        
        // Remove event listener after first tab
        window.removeEventListener('keydown', handleFirstTab);
        // Add ongoing listener for keyboard vs mouse detection
        window.addEventListener('mousedown', handleMouseDownOnce);
      }
    };
    
    // Remove the class when mouse is used
    const handleMouseDownOnce = () => {
      document.body.classList.remove('user-is-tabbing');
      
      // Re-add tab detection
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleFirstTab);
    };
    
    // Add skip to content link (will be styled in CSS)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add the event listener
    window.addEventListener('keydown', handleFirstTab);
    
    // Add CSS for keyboard users
    const style = document.createElement('style');
    style.textContent = `
      .user-is-tabbing *:focus {
        outline: 3px solid #005CA9 !important;
        outline-offset: 2px !important;
      }
      
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #005CA9;
        color: white;
        padding: 8px 16px;
        z-index: 1500;
        transition: top 0.2s;
        text-decoration: none;
        border-radius: 0 0 4px 0;
      }
      
      .skip-to-content:focus {
        top: 0;
      }
      
      /* Add ID for skip link target */
      #main-content {
        outline: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDownOnce);
      document.body.classList.remove('user-is-tabbing');
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);
  
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <KeyboardNavigationHelper>
          {children}
          <AccessibilityWidgetWrapper />
        </KeyboardNavigationHelper>
      </ThemeProvider>
    </Provider>
  );
} 