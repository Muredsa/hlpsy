# Инструкция по деплою проекта "Психолог ИИ" на VPS-сервер

## Подготовка сервера

### 1. Подключение к серверу

```bash
ssh пользователь@адрес_сервера
```

### 2. Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Установка необходимых пакетов

```bash
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx ufw git
```

## Настройка файрвола

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## Клонирование проекта

```bash
cd /var/www
sudo mkdir hlpsy
sudo chown $USER:$USER hlpsy
cd hlpsy
git clone https://github.com/ваш-репозиторий.git .
# или загрузите файлы проекта через sftp
```

## Настройка и запуск бэкенда

### 1. Создание виртуального окружения и установка зависимостей

```bash
cd /var/www/hlpsy/back
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 2. Создание файла переменных окружения

```bash
# Создаем файл .env
nano .env
```

Добавьте в файл следующие переменные:

```
JWT_SECRET_KEY=ваш_секретный_ключ
OPENAI_API_KEY=ваш_ключ_api_openai
OPENAI_BASE_URL=https://api.rockapi.ru/openai/v1
YOOKASSA_ACCOUNT_ID=ваш_id_юкассы
YOOKASSA_SECRET_KEY=ваш_секретный_ключ_юкассы
PAYMENT_SUCCESS_URL=https://ваш_домен/success
```

### 3. Настройка systemd для запуска бэкенда

```bash
sudo nano /etc/systemd/system/hlpsy.service
```

Добавьте в файл следующее содержимое:

```
[Unit]
Description=HLPSY FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/hlpsy/back
Environment="PATH=/var/www/hlpsy/back/venv/bin"
ExecStart=/var/www/hlpsy/back/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

Запустите сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl start hlpsy
sudo systemctl enable hlpsy
sudo chown -R www-data:www-data /var/www/hlpsy/back
```

## Настройка и сборка фронтенда

### 1. Установка зависимостей и сборка проекта

```bash
cd /var/www/hlpsy/front
npm install

# Создаем файл с переменными окружения
echo "REACT_APP_API_URL=https://ваш_домен/api" > .env

# Сборка проекта
npm run build
```

## Настройка Nginx

### 1. Создание конфигурационного файла

```bash
sudo nano /etc/nginx/sites-available/hlpsy
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name ваш_домен www.ваш_домен;
    
    location / {
        root /var/www/hlpsy/front/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /docs {
        proxy_pass http://localhost:8000/docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /openapi.json {
        proxy_pass http://localhost:8000/openapi.json;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Включение сайта и проверка конфигурации

```bash
sudo ln -s /etc/nginx/sites-available/hlpsy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Настройка SSL-сертификата с помощью Certbot

```bash
sudo certbot --nginx -d ваш_домен -d www.ваш_домен
```

## Дополнительные настройки

### 1. Настройка резервного копирования базы данных

Создайте скрипт для резервного копирования:

```bash
sudo nano /var/www/hlpsy/backup.sh
```

Добавьте в файл:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/hlpsy"

mkdir -p $BACKUP_DIR

# Копирование базы данных
cp /var/www/hlpsy/back/chat_app.db $BACKUP_DIR/chat_app_$TIMESTAMP.db

# Удаление старых резервных копий (оставить только последние 10)
ls -t $BACKUP_DIR/chat_app_*.db | tail -n +11 | xargs -r rm
```

Сделайте скрипт исполняемым и добавьте в cron:

```bash
sudo chmod +x /var/www/hlpsy/backup.sh
sudo crontab -e
```

Добавьте строку для запуска каждый день в 3 часа ночи:

```
0 3 * * * /var/www/hlpsy/backup.sh
```

### 2. Настройка логов

```bash
sudo mkdir /var/log/hlpsy
sudo chown www-data:www-data /var/log/hlpsy
```

Измените файл `/etc/systemd/system/hlpsy.service`, добавив параметр логирования:

```
ExecStart=/var/www/hlpsy/back/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000 --access-logfile /var/log/hlpsy/access.log --error-logfile /var/log/hlpsy/error.log
```

Перезапустите службу:

```bash
sudo systemctl daemon-reload
sudo systemctl restart hlpsy
```

### 3. Настройка мониторинга

Устанавливаем простой монитор для отслеживания состояния сервиса:

```bash
sudo apt install -y monit
sudo nano /etc/monit/conf.d/hlpsy
```

Добавьте в файл:

```
check process hlpsy with pidfile /run/hlpsy.pid
    start program = "/bin/systemctl start hlpsy"
    stop program = "/bin/systemctl stop hlpsy"
    if failed host 127.0.0.1 port 8000 protocol http
        request "/api/health"
        with timeout 10 seconds
        then restart
```

Перезапустите monit:

```bash
sudo systemctl restart monit
```

## Проверка работоспособности

1. Откройте в браузере `https://ваш_домен`
2. Проверьте работу API: `https://ваш_домен/api/health`
3. Проверьте документацию API: `https://ваш_домен/docs`

## Обновление проекта

Для обновления проекта выполните следующие шаги:

```bash
cd /var/www/hlpsy
git pull

# Обновление бэкенда
cd /var/www/hlpsy/back
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart hlpsy

# Обновление фронтенда
cd /var/www/hlpsy/front
npm install
npm run build
```

## Основные команды для управления сервисами

```bash
# Перезапуск бэкенда
sudo systemctl restart hlpsy

# Просмотр логов бэкенда
sudo journalctl -u hlpsy

# Перезапуск nginx
sudo systemctl restart nginx

# Просмотр логов nginx
sudo tail -f /var/log/nginx/error.log
```

Теперь ваш проект "Психолог ИИ" успешно развернут на VPS-сервере и готов к использованию! 