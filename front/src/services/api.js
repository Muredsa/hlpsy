import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    // Обработка ошибок аутентификации
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Если есть окно авторизации, перенаправляем на него
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    // Обработка ошибки с истекшим временем
    if (error.response && error.response.status === 402) {
      // Можно добавить дополнительную обработку
    }
    
    return Promise.reject(error);
  }
);

// Методы для работы с чатом
export const chatService = {
  sendMessage: async (message) => {
    return api.post('/api/chat', { content: message });
  },
  
  getMessages: async () => {
    return api.get('/api/messages');
  },
  
  getRemainingTime: async () => {
    return api.get('/api/remaining-time');
  },
  
  getProcessingStatus: async () => {
    return api.get('/api/processing-status');
  }
};

// Методы для работы с платежами
export const paymentService = {
  getPlans: async () => {
    return api.get('/api/plans');
  },
  
  createPayment: async (planId) => {
    return api.post('/api/payment', { plan_id: planId });
  },
  
  checkPaymentStatus: async (paymentId) => {
    return api.get(`/api/payment/${paymentId}`);
  },
  
  checkAllPayments: async () => {
    return api.post('/api/check-all-payments');
  }
};

export default api; 