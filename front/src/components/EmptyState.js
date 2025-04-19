import React from 'react';
import { Box, Typography, Paper } from '@mui/material';


/**
 * Компонент, отображаемый при пустой истории сообщений
 */
function EmptyState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: { xs: 2, sm: 3 },
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          backgroundColor: 'rgba(0,0,0,0.02)',
          maxWidth: { xs: '100%', sm: 500 },
          boxShadow: '0 2px 15px rgba(0,0,0,0.03)',
        }}
      >
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 2,
            fontSize: { xs: '1.3rem', sm: '1.5rem' },
            fontWeight: 600,
            color: 'primary.dark'
          }}
        >
          Добро пожаловать в чат с психологом
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          Мы готовый помочь вам с различными жизненными ситуациями, эмоциональными трудностями и психологическими вопросами круглосуточно, без записи и ожиданий.
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph
          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          Наше общение является анонимным и безопасным пространством, где вы можете свободно выражать свои мысли и чувства.
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'bold', 
            mt: 2, 
            color: 'primary.main',
            fontSize: { xs: '0.95rem', sm: '1.05rem' }
          }}
        >
          Напишите сообщение, чтобы начать общение.
        </Typography>
      </Paper>
    </Box>
  );
}

export default EmptyState; 