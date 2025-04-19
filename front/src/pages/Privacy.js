import React from 'react';
import { Typography, Paper, Box, Divider } from '@mui/material';

function Privacy() {
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Политика конфиденциальности
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
        Последнее обновление: {new Date().toLocaleDateString()}
      </Typography>
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          1. Введение
        </Typography>
        <Typography variant="body1" paragraph>
          Добро пожаловать в сервис "Психолог ИИ". Ваша конфиденциальность очень важна для нас. Эта политика конфиденциальности объясняет, какую информацию мы собираем, как мы её используем и защищаем.
        </Typography>
        <Typography variant="body1" paragraph>
          Используя наш сервис, вы соглашаетесь с практиками, описанными в этой политике.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          2. Какую информацию мы собираем
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Информация, которую вы предоставляете:</strong> Содержание ваших сообщений и диалогов с ИИ-психологом.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Автоматически собираемая информация:</strong> Мы можем автоматически собирать определенную информацию о вашем устройстве, включая IP-адрес, тип браузера, времена доступа.
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Информация о платежах:</strong> При совершении платежей мы собираем данные, необходимые для обработки вашего платежа. Обратите внимание, что мы не храним данные вашей кредитной карты - эта информация обрабатывается нашим платежным процессором.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          3. Как мы используем вашу информацию
        </Typography>
        <Typography variant="body1" paragraph>
          Мы используем собранную информацию для:
        </Typography>
        <Typography component="ul" sx={{ pl: 4 }}>
          <li>
            <Typography variant="body1" paragraph>
              Предоставления и улучшения нашего сервиса
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Обработки платежей
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Анализа использования сервиса для улучшения пользовательского опыта
            </Typography>
          </li>
          <li>
            <Typography variant="body1" paragraph>
              Коммуникации с вами о вашем аккаунте или использовании сервиса
            </Typography>
          </li>
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          4. Безопасность
        </Typography>
        <Typography variant="body1" paragraph>
          Мы принимаем разумные меры для защиты вашей информации от несанкционированного доступа, использования или раскрытия. Однако, учтите, что ни один метод передачи через интернет или метод электронного хранения не является 100% безопасным.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          5. Ваши права
        </Typography>
        <Typography variant="body1" paragraph>
          В зависимости от вашего местоположения, вы можете иметь определенные права относительно ваших персональных данных, включая право на доступ, исправление, удаление вашей информации.
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          6. Изменения в политике конфиденциальности
        </Typography>
        <Typography variant="body1" paragraph>
          Мы можем обновлять нашу политику конфиденциальности время от времени. Мы уведомим вас о любых изменениях, публикуя новую политику конфиденциальности на этой странице.
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="h5" gutterBottom>
          7. Контакты
        </Typography>
        <Typography variant="body1" paragraph>
          Если у вас есть вопросы о нашей политике конфиденциальности, пожалуйста, свяжитесь с нами по электронной почте: support@psychologist-ai.com
        </Typography>
      </Box>
    </Paper>
  );
}

export default Privacy; 