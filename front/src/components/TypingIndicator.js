import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Компонент для отображения индикатора набора текста
 * Показывается, когда психолог (ИИ) "печатает" ответ
 */
function TypingIndicator() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        maxWidth: '40%',
        borderRadius: 2,
        bgcolor: 'grey.100',
        ml: 1,
        mb: 2
      }}
    >
      <CircularProgress size={16} thickness={4} sx={{ mr: 1 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: 'pulse 1s infinite',
            animationDelay: '0s',
            '@keyframes pulse': {
              '0%': { opacity: 0.4 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.4 }
            }
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: 'pulse 1s infinite',
            animationDelay: '0.2s'
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'grey.500',
            animation: 'pulse 1s infinite',
            animationDelay: '0.4s'
          }}
        />
      </Box>
    </Box>
  );
}

export default TypingIndicator; 