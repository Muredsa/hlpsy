import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Chat from './pages/Chat';
import Privacy from './pages/Privacy';
import PaymentSuccess from './pages/PaymentSuccess';
import YandexMetrika from './utils/YandexMetrika';

function App() {
  const { token, register } = useAuth();

  // Автоматическая регистрация при первом входе
  useEffect(() => {
    const autoRegister = async () => {
      if (!token) {
        try {
          await register();
        } catch (error) {
          console.error('Ошибка при автоматической регистрации:', error);
        }
      }
    };

    autoRegister();
  }, [token, register]);

  return (
    <div className="app">
      <YandexMetrika />
      <Header />
      <Container maxWidth="lg" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App; 