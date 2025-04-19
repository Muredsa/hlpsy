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
        mb: 2
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '80%',
          borderRadius: 2,
          bgcolor: isFromUser ? 'primary.main' : 'grey.100',
          color: isFromUser ? 'white' : 'text.primary'
        }}
      >
        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        <Typography 
          variant="caption" 
          color={isFromUser ? "rgba(255,255,255,0.7)" : "text.secondary"} 
          sx={{ display: 'block', mt: 1, textAlign: 'right' }}
        >
          {formatMessageTime(message.created_at)}
        </Typography>
      </Paper>
    </Box>
  );
}

export default MessageItem; 