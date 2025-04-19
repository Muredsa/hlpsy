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
  CircularProgress
} from '@mui/material';
import { paymentService } from '../services/api';

function PaymentModal({ open, onClose }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Загрузка тарифов при открытии модального окна
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await paymentService.getPlans();
        setPlans(response.data);
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
  };

  // Обработчик нажатия на кнопку "Оплатить"
  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const response = await paymentService.createPayment(selectedPlan.id);
      // Редирект на страницу оплаты
      window.location.href = response.data.payment_url;
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      setLoading(false);
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
        width: { xs: '90%', sm: 600 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4
      }}>
        <Typography id="payment-modal-title" variant="h5" component="h2" gutterBottom>
          Выберите тариф
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          У вас закончилось время общения с психологом. Чтобы продолжить, выберите и оплатите один из тарифов ниже:
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
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
                  borderColor: selectedPlan?.id === plan.id ? 'primary.main' : 'divider'
                }}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {plan.price} ₽
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.floor(plan.minutes / 60)} часов {plan.minutes % 60 > 0 ? `${plan.minutes % 60} минут` : ''}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    variant={selectedPlan?.id === plan.id ? "contained" : "outlined"}
                    onClick={() => handlePlanSelect(plan)}
                    fullWidth
                  >
                    Выбрать
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={loading}
          >
            Отмена
          </Button>
          <Button 
            onClick={handlePayment} 
            variant="contained" 
            color="primary" 
            disabled={!selectedPlan || loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Обработка...' : 'Оплатить'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default PaymentModal; 