import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Paper, 
  Typography,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageItem from '../components/MessageItem';
import PaymentModal from '../components/PaymentModal';
import TypingIndicator from '../components/TypingIndicator';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/api';
import { paymentService } from '../services/api';

function Chat() {
  const { remainingMinutes, updateRemainingTime } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [typing, setTyping] = useState(false);  // Состояние "печатает"
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [error, setError] = useState('');
  const messageListRef = useRef(null);

  // Загрузка истории сообщений при монтировании компонента
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatService.getMessages();
        setMessages(response.data);
        setLoadingHistory(false);
        
        // Прокрутка к последнему сообщению
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } catch (error) {
        console.error('Ошибка при загрузке сообщений:', error);
        setLoadingHistory(false);
      }
    };

    fetchMessages();
  }, []);

  // Прокрутка к последнему сообщению при добавлении новых
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Периодическое обновление времени и проверка статуса обработки
  useEffect(() => {
    // Функция обновления оставшегося времени
    const updateTime = async () => {
      try {
        const response = await chatService.getRemainingTime();
        updateRemainingTime(response.data.remaining_minutes);
      } catch (error) {
        console.error('Ошибка при обновлении времени:', error);
      }
    };

    // Функция проверки статуса обработки сообщений
    const checkProcessingStatus = async () => {
      try {
        const response = await chatService.getProcessingStatus();
        if (response.data.processing && !typing) {
          setTyping(true);
        } else if (!response.data.processing && typing) {
          // Если обработка завершена, но индикатор всё еще активен, 
          // скрываем его и обновляем сообщения
          setTyping(false);
          const messagesResponse = await chatService.getMessages();
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса обработки:', error);
      }
    };

    // Проверка статуса обработки при загрузке
    checkProcessingStatus();

    // Устанавливаем интервалы для обновления
    const timeInterval = setInterval(updateTime, 5000); // Каждые 5 секунд
    const processingInterval = setInterval(checkProcessingStatus, 3000); // Каждые 3 секунды

    // Очистка интервалов при размонтировании компонента
    return () => {
      clearInterval(timeInterval);
      clearInterval(processingInterval);
    };
  }, [updateRemainingTime, typing]);

  // Функция для прокрутки к последнему сообщению
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  // Обработчик отправки сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Если времени не осталось, открываем модальное окно
    if (remainingMinutes <= 0) {
      setPaymentModalOpen(true);
      return;
    }
    
    setLoading(true);
    
    // Создаем временное сообщение пользователя для отображения до ответа сервера
    const tempUserMessage = {
      id: Date.now(),
      content: message,
      is_from_user: true,
      created_at: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, tempUserMessage]);
    setMessage('');
    
    try {
      // Показываем индикатор "печатает"
      setTyping(true);
      
      // Отправляем сообщение на сервер
      const response = await chatService.sendMessage(message);
      
      // Скрываем индикатор "печатает"
      setTyping(false);
      
      // Добавляем ответ ИИ в список сообщений
      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        is_from_user: false,
        created_at: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Обновляем оставшееся время
      updateRemainingTime(response.data.remaining_minutes);
      
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      
      // Скрываем индикатор "печатает"
      setTyping(false);
      
      // Если ошибка связана с истекшим временем
      if (error.response && error.response.status === 402) {
        setPaymentModalOpen(true);
      } else {
        setError('Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.');
      }
      
      // Удаляем временное сообщение пользователя
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== tempUserMessage.id)
      );
    } finally {
      setLoading(false);
    }
  };

  // Обработчик закрытия модального окна оплаты
  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
  };

  // Обработчик закрытия уведомления об ошибке
  const handleCloseError = () => {
    setError('');
  };

  // Обработчик проверки платежей
  const handleCheckPayments = async () => {
    try {
      const response = await paymentService.checkAllPayments();
      if (response.data.updated > 0) {
        // Обновляем время, если были обновлены платежи
        const timeResponse = await chatService.getRemainingTime();
        updateRemainingTime(timeResponse.data.remaining_minutes);
        setError(`Проверено ${response.data.checked} платежей, обновлено ${response.data.updated}. Ваше время обновлено!`);
      } else {
        setError(`Проверено ${response.data.checked} платежей. Новых оплаченных платежей не найдено.`);
      }
    } catch (error) {
      console.error('Ошибка при проверке платежей:', error);
      setError('Произошла ошибка при проверке платежей. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ pt: 2, pb: 2 }}>
        Чат с психологом
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          mb: 2
        }}
      >
        {/* Область с сообщениями */}
        <Box 
          ref={messageListRef}
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  isFromUser={msg.is_from_user} 
                />
              ))}
              {typing && <TypingIndicator />}
            </>
          )}
        </Box>
        
        {/* Поле ввода сообщения */}
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            placeholder="Напишите сообщение..."
            variant="outlined"
            size="medium"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || typing}
            multiline
            maxRows={4}
            sx={{ mr: 1 }}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCheckPayments}
            sx={{ mr: 1, minWidth: 'auto', px: 2 }}
            title="Проверить платежи"
          >
            Проверить оплату
          </Button>
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={loading || typing || !message.trim()}
            sx={{ 
              width: 50, 
              height: 50,
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&.Mui-disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
      
      {/* Модальное окно оплаты */}
      <PaymentModal 
        open={paymentModalOpen} 
        onClose={handleClosePaymentModal} 
      />
      
      {/* Уведомление об ошибке */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
      >
        <Alert onClose={handleCloseError} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Chat; 