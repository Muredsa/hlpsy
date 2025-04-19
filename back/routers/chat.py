from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import models
import schemas
from database import get_db
from auth_utils import get_current_user
from ai_utils import get_ai_response, simulate_typing_delay
import time

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=schemas.ChatResponse)
async def send_message(
    message: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Отправляет сообщение от пользователя и получает ответ от ИИ
    """
    # Проверяем, есть ли у пользователя оставшееся время
    if current_user.remaining_minutes <= 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="У вас закончилось время. Пожалуйста, приобретите тариф для продолжения общения."
        )
    
    # Проверяем, есть ли уже обрабатываемое сообщение
    processing_message = db.query(models.Message).filter(
        models.Message.user_id == current_user.id,
        models.Message.is_processing == True
    ).first()
    
    if processing_message:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="У вас уже есть сообщение в обработке. Пожалуйста, дождитесь ответа."
        )
    
    # Фиксируем время начала обработки
    start_time = time.time()
    
    # Сохраняем сообщение пользователя с флагом обработки
    user_message = models.Message(
        content=message.content,
        user_id=current_user.id,
        is_from_user=True,
        is_processing=True
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    try:
        # Получаем последние 10 сообщений для контекста
        recent_messages = db.query(models.Message)\
            .filter(models.Message.user_id == current_user.id)\
            .order_by(desc(models.Message.created_at))\
            .limit(10)\
            .all()
        recent_messages.reverse()  # Меняем порядок на хронологический
        
        # Получаем ответ от ИИ
        ai_response_text = await get_ai_response(recent_messages, message.content)
        
        # Симулируем задержку, как будто психолог печатает ответ
        await simulate_typing_delay(ai_response_text)
        
        # Сохраняем ответ ИИ
        ai_message = models.Message(
            content=ai_response_text,
            user_id=current_user.id,
            is_from_user=False
        )
        db.add(ai_message)
        
        # Вычисляем затраченное время в минутах и обновляем оставшееся время пользователя
        end_time = time.time()
        spent_minutes = (end_time - start_time) / 60.0
        current_user.remaining_minutes -= spent_minutes
        
        if current_user.remaining_minutes < 0:
            current_user.remaining_minutes = 0
        
        # Снимаем флаг обработки с сообщения пользователя
        user_message.is_processing = False
        db.commit()
        
        return {
            "response": ai_response_text,
            "remaining_minutes": current_user.remaining_minutes
        }
    except Exception as e:
        # В случае ошибки снимаем флаг обработки
        user_message.is_processing = False
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обработке сообщения: {str(e)}"
        )


@router.get("/messages", response_model=List[schemas.Message])
async def get_messages(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получает историю сообщений пользователя
    """
    messages = db.query(models.Message)\
        .filter(models.Message.user_id == current_user.id)\
        .order_by(models.Message.created_at)\
        .all()
    
    return messages


@router.get("/remaining-time")
async def get_remaining_time(current_user: models.User = Depends(get_current_user)):
    """
    Получает оставшееся время пользователя
    """
    return {"remaining_minutes": current_user.remaining_minutes}


@router.get("/processing-status")
async def check_processing_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Проверяет, есть ли у пользователя сообщения в обработке
    """
    processing_message = db.query(models.Message).filter(
        models.Message.user_id == current_user.id,
        models.Message.is_processing == True
    ).first()
    
    return {
        "processing": processing_message is not None,
        "message_id": processing_message.id if processing_message else None
    } 