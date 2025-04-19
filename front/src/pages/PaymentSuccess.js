import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { paymentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { sendYandexMetrikaGoal } from '../utils/YandexMetrika';

function PaymentSuccess() {
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [paymentInfo, setPaymentInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateRemainingTime } = useAuth();
  
  // Получаем ID платежа из URL
  useEffect(() => {
    const checkPayment = async () => {
      // Извлекаем payment_id из URL-параметров
      const searchParams = new URLSearchParams(location.search);
      const paymentId = searchParams.get('payment_id');
      
      // Пытаемся получить сохраненную информацию о платеже
      let pendingPaymentInfo = null;
      try {
        const savedPayment = localStorage.getItem('pendingPayment');
        if (savedPayment) {
          pendingPaymentInfo = JSON.parse(savedPayment);
        }
      } catch (e) {
        console.error('Ошибка при получении данных о платеже из localStorage:', e);
      }
      
      // Используем ID из URL или из localStorage
      const finalPaymentId = paymentId || (pendingPaymentInfo ? pendingPaymentInfo.payment_id : null);
      
      if (!finalPaymentId) {
        setStatus('error');
        return;
      }
      
      try {
        // Проверяем статус платежа через API
        const response = await paymentService.checkPaymentStatus(finalPaymentId);
        const paymentData = response.data;
        
        // Сохраняем информацию о платеже
        setPaymentInfo(paymentData);
        
        // Обновляем статус и отправляем событие в Яндекс Метрику
        if (paymentData.status === 'completed') {
          setStatus('success');
          updateRemainingTime(paymentData.remaining_minutes);
          
          // Объединяем данные из API и из localStorage для более полной информации
          const metrikaData = {
            payment_id: finalPaymentId,
            status: 'completed',
            amount: paymentData.amount || (pendingPaymentInfo ? pendingPaymentInfo.price : 0),
            minutes_added: paymentData.minutes_added || 0,
            plan_id: pendingPaymentInfo ? pendingPaymentInfo.plan_id : null,
            plan_name: pendingPaymentInfo ? pendingPaymentInfo.plan_name : null,
            payment_time: new Date().toISOString(),
            payment_start_time: pendingPaymentInfo ? pendingPaymentInfo.timestamp : null
          };
          
          // Отправляем цель в Яндекс Метрику
          sendYandexMetrikaGoal('payment_completed', metrikaData);
          
          // Очищаем данные о платеже из localStorage
          localStorage.removeItem('pendingPayment');
        } else if (paymentData.status === 'failed') {
          setStatus('error');
          
          // Отправляем информацию о неудачном платеже
          sendYandexMetrikaGoal('payment_failed', {
            payment_id: finalPaymentId,
            plan_id: pendingPaymentInfo ? pendingPaymentInfo.plan_id : null
          });
          
          // Очищаем данные о платеже из localStorage
          localStorage.removeItem('pendingPayment');
        } else {
          setStatus('pending');
          
          // Если платеж все еще в ожидании, запускаем повторную проверку через 5 секунд
          setTimeout(() => checkPayment(), 5000);
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса платежа:', error);
        setStatus('error');
        
        // Отправляем информацию об ошибке
        sendYandexMetrikaGoal('payment_check_error', {
          payment_id: finalPaymentId,
          error_message: error.message
        });
      }
    };
    
    checkPayment();
  }, [location.search, updateRemainingTime]);
  
  // Кнопка для возврата в чат
  const handleBackToChat = () => {
    navigate('/');
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 'calc(100vh - 150px)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          borderRadius: 2, 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center'
        }}
      >
        {status === 'checking' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>
              Проверяем статус платежа
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Пожалуйста, подождите. Это может занять некоторое время.
            </Typography>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
            <Typography variant="h5" gutterBottom>
              Платеж обрабатывается
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Ваш платеж обрабатывается. Пожалуйста, подождите.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Страница обновится автоматически, когда платеж будет обработан.
            </Typography>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircleIcon color="primary" sx={{ fontSize: 70, mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Оплата прошла успешно!
            </Typography>
            <Typography variant="body1" paragraph>
              Ваш баланс времени пополнен на {paymentInfo?.minutes_added} минут.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Теперь вы можете продолжить общение с психологом.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleBackToChat}
              sx={{ mt: 2 }}
            >
              Вернуться в чат
            </Button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 70, mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Что-то пошло не так
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Не удалось проверить статус платежа. Возможно, произошла ошибка.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Если с вашей карты были списаны средства, напишите нам в поддержку.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleBackToChat}
              sx={{ mt: 2 }}
            >
              Вернуться в чат
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default PaymentSuccess; 