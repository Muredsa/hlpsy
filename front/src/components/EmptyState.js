import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';

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
        p: 4,
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          maxWidth: 500,
        }}
      >
        <ForumIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Добро пожаловать в чат с психологом
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Я ваш личный психолог-консультант, готовый помочь вам с различными жизненными ситуациями, эмоциональными трудностями и психологическими вопросами.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Наше общение является конфиденциальным и безопасным пространством, где вы можете свободно выражать свои мысли и чувства.
        </Typography>
        
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Напишите сообщение, чтобы начать общение.
        </Typography>
      </Paper>
    </Box>
  );
}

export default EmptyState; 