import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuIcon from '@mui/icons-material/Menu';

function Header() {
  const { remainingMinutes } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
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
    <AppBar position="static" sx={{ boxShadow: 1 }}>
      <Toolbar sx={{ minHeight: { xs: '56px', sm: '64px' } }}>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          HLPSY
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: { xs: 1, sm: 2 },
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: { xs: '4px 8px', sm: '4px 12px' }
          }}
        >
          <AccessTimeIcon sx={{ mr: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }} />
          <Typography 
            variant="body2"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {formatTime(remainingMinutes)}
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
              edge="end"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleCloseMenu}
            >
              <MenuItem 
                component={RouterLink} 
                to="/chat" 
                onClick={handleCloseMenu}
                sx={{ minWidth: 150 }}
              >
                Чат с психологом
              </MenuItem>
              <Divider />
              <MenuItem 
                component={RouterLink} 
                to="/privacy" 
                onClick={handleCloseMenu}
              >
                Политика конфиденциальности
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/chat"
              sx={{ mx: 1 }}
            >
              Чат с психологом
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/privacy"
              sx={{ ml: 1 }}
            >
              Политика конфиденциальности
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header; 