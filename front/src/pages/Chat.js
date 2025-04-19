import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
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
import { sendYandexMetrikaGoal } from '../utils/YandexMetrika';
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

  // Проверка наличия незавершенных платежей из предыдущего сеанса
  useEffect(() => {
    const checkPendingPayments = async () => {
      try {
        // Проверяем, есть ли информация о незавершенном платеже
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          // Парсим информацию о платеже
          const paymentInfo = JSON.parse(pendingPayment);
          
          // Проверяем, не устарел ли платеж (старше 1 дня)
          const paymentTime = new Date(paymentInfo.timestamp);
          const currentTime = new Date();
          const timeDiff = currentTime.getTime() - paymentTime.getTime();
          const daysDiff = timeDiff / (1000 * 3600 * 24);
          
          // Если платеж старше 1 дня, удаляем информацию о нем
          if (daysDiff > 1) {
            localStorage.removeItem('pendingPayment');
            return;
          }
          
          // Проверяем статус платежа через API
          const response = await paymentService.checkPaymentStatus(paymentInfo.payment_id);
          
          // Если платеж успешно завершен, обновляем информацию и отправляем событие
          if (response.data.status === 'completed') {
            updateRemainingTime(response.data.remaining_minutes);
            
            // Отправляем событие в Яндекс Метрику
            sendYandexMetrikaGoal('payment_completed_background', {
              payment_id: paymentInfo.payment_id,
              plan_id: paymentInfo.plan_id,
              plan_name: paymentInfo.plan_name,
              price: paymentInfo.price,
            });
            
            // Удаляем информацию о платеже
            localStorage.removeItem('pendingPayment');
          }
        }
      } catch (error) {
        console.error('Ошибка при проверке платежа:', error);
      }
    };
    
    checkPendingPayments();
  }, [updateRemainingTime]);

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
    
    // Отмечаем событие отправки сообщения в Яндекс Метрике
    sendYandexMetrikaGoal('message_sent');
    
    // Если времени не осталось, открываем модальное окно
    if (remainingMinutes <= 0) {
      handleOpenPaymentModal();
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
        handleOpenPaymentModal();
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

  const handleOpenPaymentModal = () => {
    // Отмечаем событие открытия окна оплаты в Яндекс Метрике
    sendYandexMetrikaGoal('payment_modal_opened');
    setPaymentModalOpen(true);
  };

  return (
    <Box 
      sx={{ 
        height: '100dvh', 
        maxHeight: '100dvh',
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        padding: { xs: '1px', sm: '2px', md: '24px' },
        paddingBottom: { xs: '8px', sm: '16px' },
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: 'background.default'
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          pt: { xs: 0, sm: 1 }, 
          pb: { xs: 1, sm: 1 },
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 600,
          color: 'primary.dark',
          flexShrink: 0,
          textAlign: 'center'
        }}
      >
        Чат с психологом 24/7
      </Typography>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          backgroundColor: 'background.paper',
          minHeight: 0, // Важно для корректной работы flex в Firefox
        }}
      >
        {/* Область с сообщениями */}
        <Box 
          ref={messageListRef}
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minHeight: 0, // Важно для корректной работы flex в Firefox
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            },
          }}
        >
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress size={40} thickness={4} />
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
            p: { xs: 1, sm: 1.5 }, 
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
            flexShrink: 0
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
            sx={{ 
              mr: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.03)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                },
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim()) {
                  handleSendMessage(e);
                }
              }
            }}
          />
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={loading || typing || !message.trim()}
            sx={{ 
              width: { xs: 40, sm: 50 }, 
              height: { xs: 40, sm: 50 },
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              color: 'white',
              transition: 'all 0.2s',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'scale(1.05)',
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