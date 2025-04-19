import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Создаем тему для приложения
const theme = createTheme({
  palette: {
    primary: {
      main: '#00a0b0',
      light: '#4dd0e1',
      dark: '#007885',
    },
    secondary: {
      main: '#6a7fdb',
      light: '#9fa8e5',
      dark: '#4055b5',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    grey: {
      100: '#f0f4f5',
    }
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
); 