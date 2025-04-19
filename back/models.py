from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import random
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=func.now())
    remaining_minutes = Column(Float, default=5.0)  # Стартовые 5 минут для новых пользователей
    
    # Отношение к сообщениям
    messages = relationship("Message", back_populates="user")
    # Отношение к платежам
    payments = relationship("Payment", back_populates="user")
    
    @classmethod
    def generate_random_credentials(cls):
        """Генерирует случайный логин и пароль из 6 цифр"""
        username = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        password = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return username, password


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_from_user = Column(Boolean, default=True)  # True если от пользователя, False если от AI
    created_at = Column(DateTime, default=func.now())
    is_processing = Column(Boolean, default=False)  # Флаг обработки сообщения
    
    # Отношение к пользователю
    user = relationship("User", back_populates="messages")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    payment_id = Column(String, unique=True, index=True)  # ID платежа от платежной системы
    amount = Column(Float)  # Сумма платежа в рублях
    minutes_added = Column(Float)  # Сколько минут добавлено
    status = Column(String)  # "pending", "completed", "failed"
    created_at = Column(DateTime, default=func.now())
    
    # Отношение к пользователю
    user = relationship("User", back_populates="payments") 