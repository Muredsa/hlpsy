# Психолог ИИ - Бэкенд

Бэкенд часть сервиса для общения с ИИ-психологом на базе FastAPI.

## Технический стек

- Python 3.9+
- FastAPI
- SQLAlchemy (SQLite)
- JWT для аутентификации
- OpenAI API
- Юкасса для платежей

## Установка и запуск

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Создайте `.env` файл на основе `.env.example` и заполните необходимые переменные окружения:
```bash
cp .env .env
```

5. Запустите сервер:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Аутентификация

- `POST /api/register` - Регистрация нового пользователя
- `POST /api/token` - Получение JWT токена
- `GET /api/me` - Получение информации о текущем пользователе

### Чат

- `POST /api/chat` - Отправка сообщения и получение ответа от ИИ
- `GET /api/messages` - Получение истории сообщений
- `GET /api/remaining-time` - Получение оставшегося времени пользователя

### Платежи

- `GET /api/plans` - Получение списка доступных тарифных планов
- `POST /api/payment` - Создание сессии оплаты
- `GET /api/payment/{payment_id}` - Проверка статуса платежа

## Документация API

После запуска сервера документация API доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 