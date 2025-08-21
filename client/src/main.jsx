import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './context/AppContext.jsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark', // Use dark mode for better contrast with video background
    primary: {
      main: '#66bb6a', // A slightly lighter green for dark mode
    },
    secondary: {
      main: '#ffc400',
    },
    background: {
      paper: 'rgba(0, 0, 0, 0.5)', // Darker semi-transparent background
      default: 'transparent',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: transparent !important;
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker semi-transparent AppBar
                backdropFilter: 'blur(10px)',
            }
        }
    },
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
