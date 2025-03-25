import { createTheme } from '@mui/material/styles';
import { THEME_COLORS } from '../components/layout/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: THEME_COLORS.orange,
    },
    secondary: {
      main: THEME_COLORS.offBlack,
    },
    background: {
      default: THEME_COLORS.offWhiteGrey,
      paper: THEME_COLORS.white,
    },
    text: {
      primary: THEME_COLORS.offBlack,
      secondary: 'rgba(51, 51, 51, 0.7)', // Lighter version of offBlack
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:focus-visible': {
            outline: `3px solid ${THEME_COLORS.orange}`,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${THEME_COLORS.orange}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${THEME_COLORS.orange}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${THEME_COLORS.orange}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${THEME_COLORS.orange}`,
            outlineOffset: -2,
            backgroundColor: 'rgba(255, 122, 48, 0.1)',
          },
        },
      },
    }
  },
  unstable_sx: {
    focusVisibleStyle: {
      outline: `3px solid ${THEME_COLORS.orange}`,
      outlineOffset: 2,
    }
  }
});

export default theme; 