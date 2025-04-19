import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Создаем контекст аутентификации
const AuthContext = createContext();

// Функция для доступа к контексту из компонентов
export function useAuth() {
  return useContext(AuthContext);
}

// Провайдер контекста аутентификации
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  // Эффект для восстановления сессии при перезагрузке страницы
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Настраиваем заголовок авторизации
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Получаем данные о пользователе
        const response = await api.get('/api/me');
        setCurrentUser(response.data);
        
        // Получаем оставшееся время
        const timeResponse = await api.get('/api/remaining-time');
        setRemainingMinutes(timeResponse.data.remaining_minutes);
      } catch (error) {
        console.error('Ошибка при восстановлении сессии:', error);
        // Если токен невалидный, удаляем его
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Функция для регистрации нового пользователя
  const register = async () => {
    try {
      const response = await api.post('/api/register');
      const { access_token, remaining_minutes } = response.data;
      
      // Сохраняем токен в localStorage и state
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Устанавливаем заголовок авторизации для всех последующих запросов
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Обновляем оставшееся время
      setRemainingMinutes(remaining_minutes);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  // Функция для обновления оставшегося времени
  const updateRemainingTime = (minutes) => {
    setRemainingMinutes(minutes);
  };

  // Функция для выхода пользователя
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setRemainingMinutes(0);
    delete api.defaults.headers.common['Authorization'];
  };

  // Создаем объект со значениями, которые будут доступны через контекст
  const value = {
    currentUser,
    token,
    remainingMinutes,
    register,
    logout,
    updateRemainingTime,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 