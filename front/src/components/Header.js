import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Header() {
  const { remainingMinutes } = useAuth();
  
  // Форматирование времени
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    } else if (mins > 0) {
      return `${mins}м ${secs}с`;
    } else {
      return `${secs}с`;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold' 
          }}
        >
          Психолог ИИ
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <AccessTimeIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Осталось времени: {formatTime(remainingMinutes)}
          </Typography>
        </Box>
        
        <Button 
          color="inherit" 
          component={RouterLink} 
          to="/privacy"
        >
          Политика конфиденциальности
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 