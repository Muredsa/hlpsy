import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function MessageItem({ message, isFromUser }) {
  // Форматирование времени сообщения
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isFromUser ? 'flex-end' : 'flex-start',
        mb: { xs: 1, sm: 1.5 },
        maxWidth: '100%'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: { xs: 1.5, sm: 2 },
          maxWidth: { xs: '90%', sm: '75%' },
          borderRadius: isFromUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          bgcolor: isFromUser ? 'primary.main' : 'grey.100',
          color: isFromUser ? 'white' : 'text.primary',
          boxShadow: isFromUser 
            ? '0 2px 5px rgba(46, 125, 50, 0.2)' 
            : '0 2px 5px rgba(0, 0, 0, 0.05)',
          wordBreak: 'break-word'
        }}
      >
        <Typography 
          variant="body1" 
          component="div" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            lineHeight: 1.5
          }}
        >
          {message.content}
        </Typography>
        <Typography 
          variant="caption" 
          color={isFromUser ? "rgba(255,255,255,0.7)" : "text.secondary"}
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            textAlign: 'right',
            fontSize: '0.7rem'
          }}
        >
          {formatMessageTime(message.created_at)}
        </Typography>
      </Paper>
    </Box>
  );
}

export default MessageItem; 