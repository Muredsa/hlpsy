from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MessageBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    user_id: int
    is_from_user: bool
    created_at: datetime
    
    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    remaining_minutes: float
    created_at: datetime
    
    class Config:
        orm_mode = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    remaining_minutes: float


class PaymentCreate(BaseModel):
    plan_id: int  # ID тарифного плана (1=1час, 2=2часа, 3=5часов)


class PaymentResponse(BaseModel):
    payment_url: str  # URL для редиректа на страницу оплаты
    payment_id: str  # Идентификатор платежа для дальнейшего отслеживания


class PaymentInfo(BaseModel):
    id: int
    payment_id: str
    amount: float
    minutes_added: float
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True


class ChatResponse(BaseModel):
    response: str
    remaining_minutes: float 