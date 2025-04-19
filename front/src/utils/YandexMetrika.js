import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Получаем ID счетчика из переменных окружения
const METRIKA_ID = process.env.REACT_APP_YANDEX_METRIKA_ID || '';

/**
 * Компонент для отслеживания переходов между страницами в Яндекс Метрике
 * Используется совместно с React Router
 */
const YandexMetrika = () => {
  const location = useLocation();

  // Инициализируем Яндекс Метрику при первом рендеринге компонента
  useEffect(() => {
    if (METRIKA_ID && typeof window.ym !== 'undefined') {
      window.ym(METRIKA_ID, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }
  }, []);

  // Отслеживаем смену маршрута
  useEffect(() => {
    if (METRIKA_ID && typeof window.ym !== 'undefined') {
      // Отправляем информацию о просмотре страницы
      window.ym(METRIKA_ID, 'hit', window.location.pathname + window.location.search);
    }
  }, [location]); // Отслеживаем изменение маршрута

  return null; // Компонент ничего не рендерит
};

/**
 * Функция для отправки произвольных целей в Яндекс Метрику
 * @param {string} target - Имя цели
 * @param {object} params - Дополнительные параметры (опционально)
 */
export const sendYandexMetrikaGoal = (target, params = {}) => {
  if (METRIKA_ID && typeof window.ym !== 'undefined') {
    window.ym(METRIKA_ID, 'reachGoal', target, params);
  }
};

export default YandexMetrika; 