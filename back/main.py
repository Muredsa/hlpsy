from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
import asyncio

from tasks import start_payment_checker

from routers import chat, auth, payment

# Загрузка переменных окружения
load_dotenv()

app = FastAPI(title="Психолог ИИ API", version="1.0.0")

# Настройка CORS для взаимодействия с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(payment.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_payment_checker())

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 