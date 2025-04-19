import React from 'react';
import { Box, Paper } from '@mui/material';

/**
 * Компонент для отображения индикатора набора текста
 * Показывается, когда психолог (ИИ) "печатает" ответ
 */
function TypingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: { xs: 1, sm: 1.5 },
        maxWidth: '100%'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1.2, sm: 1.5 },
          maxWidth: { xs: '60%', sm: '40%' },
          borderRadius: '16px 16px 16px 4px',
          bgcolor: 'grey.100',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.8
          }}
        >
          <Box
            sx={{
              width: { xs: 6, sm: 8 },
              height: { xs: 6, sm: 8 },
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.6,
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '0s',
              '@keyframes bounce': {
                '0%, 80%, 100%': { 
                  transform: 'scale(0)',
                },
                '40%': { 
                  transform: 'scale(1)',
                }
              }
            }}
          />
          <Box
            sx={{
              width: { xs: 6, sm: 8 },
              height: { xs: 6, sm: 8 },
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.6,
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.16s',
            }}
          />
          <Box
            sx={{
              width: { xs: 6, sm: 8 },
              height: { xs: 6, sm: 8 },
              borderRadius: '50%',
              bgcolor: 'primary.main',
              opacity: 0.6,
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.32s',
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default TypingIndicator; 