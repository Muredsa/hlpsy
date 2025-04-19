import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { paymentService } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { sendYandexMetrikaGoal } from '../utils/YandexMetrika';

function PaymentModal({ open, onClose }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Загрузка тарифов при открытии модального окна
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await paymentService.getPlans();
        setPlans(response.data);
        // По умолчанию выбираем средний тариф (если есть)
        if (response.data.length > 1) {
          setSelectedPlan(response.data[1]);
        } else if (response.data.length > 0) {
          setSelectedPlan(response.data[0]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке тарифов:', error);
      }
    };

    if (open) {
      fetchPlans();
    }
  }, [open]);

  // Обработчик выбора тарифа
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Отслеживаем выбор тарифа
    sendYandexMetrikaGoal('plan_selected', { plan_id: plan.id, plan_name: plan.name, price: plan.price });
  };

  // Обработчик нажатия на кнопку "Оплатить"
  const handlePayment = async () => {
    if (!selectedPlan) return;

    // Отслеживаем нажатие на кнопку оплаты
    sendYandexMetrikaGoal('payment_started', { plan_id: selectedPlan.id, plan_name: selectedPlan.name, price: selectedPlan.price });

    setLoading(true);
    try {
      const response = await paymentService.createPayment(selectedPlan.id);
      
      // Сохраняем информацию о начатом платеже для дальнейшего отслеживания
      localStorage.setItem('pendingPayment', JSON.stringify({
        payment_id: response.data.payment_id,
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        price: selectedPlan.price,
        timestamp: new Date().toISOString()
      }));
      
      // Редирект на страницу оплаты
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      setLoading(false);
      // Отслеживаем ошибку платежа
      sendYandexMetrikaGoal('payment_error', { error_message: error.message });
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? null : onClose}
      aria-labelledby="payment-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '80%', md: 600 },
        maxWidth: '100%',
        maxHeight: { xs: '90vh', sm: '80vh' },
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 }
      }}>
        <Typography 
          id="payment-modal-title" 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 600,
            color: 'primary.dark'
          }}
        >
          Выберите тариф
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          Для продолжения общения с психологом, выберите и оплатите подходящий тариф:
        </Typography>
        
        <Grid 
          container 
          spacing={isMobile ? 1.5 : 2} 
          sx={{ mb: { xs: 2, sm: 3 } }}
          direction={isMobile ? 'column' : 'row'}
        >
          {plans.map((plan) => (
            <Grid item xs={12} sm={4} key={plan.id}>
              <Card 
                variant="outlined" 
                className="payment-card"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedPlan?.id === plan.id ? 2 : 1,
                  borderColor: selectedPlan?.id === plan.id ? 'primary.main' : 'divider',
                  boxShadow: selectedPlan?.id === plan.id ? '0 4px 12px rgba(0, 160, 176, 0.2)' : 'none',
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardContent sx={{ flexGrow: 1, position: 'relative', pb: 1 }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      color: selectedPlan?.id === plan.id ? 'primary.main' : 'inherit'
                    }}
                  >
                    {plan.name}
                    {selectedPlan?.id === plan.id && (
                      <CheckCircleIcon 
                        color="primary" 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          fontSize: '1.2rem'
                        }} 
                      />
                    )}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="primary" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
                  >
                    {plan.price} ₽
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
                  >
                    {Math.floor(plan.minutes / 60)} часов {plan.minutes % 60 > 0 ? `${plan.minutes % 60} минут` : ''}
                  </Typography>
                </CardContent>
                {isMobile && <Divider />}
                <CardActions sx={{ p: { xs: 1, sm: 1.5 } }}>
                  <Button 
                    size="small" 
                    color="primary"
                    variant={selectedPlan?.id === plan.id ? "contained" : "outlined"}
                    onClick={() => handlePlanSelect(plan)}
                    fullWidth
                  >
                    {selectedPlan?.id === plan.id ? 'Выбрано' : 'Выбрать'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }
        }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={loading}
            sx={{ order: { xs: 2, sm: 1 } }}
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={handlePayment} 
            variant="contained" 
            color="primary" 
            disabled={!selectedPlan || loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ 
              order: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: '0.95rem', sm: '1rem' }
            }}
            fullWidth={isMobile}
          >
            {loading ? 'Обработка...' : 'Перейти к оплате'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default PaymentModal; 