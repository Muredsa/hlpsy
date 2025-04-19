import asyncio
import logging
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from payment_utils import check_payment_status

logger = logging.getLogger(__name__)

async def check_pending_payments():
    """
    Проверяет все незавершенные платежи в базе данных
    и обновляет их статус.
    """
    logger.info("Начало проверки незавершенных платежей")
    db = SessionLocal()
    
    try:
        # Находим все платежи со статусом "pending"
        pending_payments = db.query(models.Payment).filter(
            models.Payment.status == "pending"
        ).all()
        
        updated_count = 0
        total_count = len(pending_payments)
        
        for payment in pending_payments:
            try:
                # Проверяем статус платежа через API
                payment_info = check_payment_status(payment.payment_id)
                
                # Если платеж успешно оплачен
                if payment_info["status"] == "succeeded" and payment_info["paid"]:
                    # Обновляем статус платежа в БД
                    payment.status = "completed"
                    
                    # Находим пользователя и добавляем ему время
                    user = db.query(models.User).filter(models.User.id == payment.user_id).first()
                    if user:
                        user.remaining_minutes += payment.minutes_added
                        logger.info(f"Пользователю {user.id} добавлено {payment.minutes_added} минут")
                    
                    updated_count += 1
                    
                # Если платеж отменен или не оплачен
                elif payment_info["status"] in ["canceled", "failed"]:
                    payment.status = "failed"
                    updated_count += 1
                
                db.commit()
                
            except Exception as e:
                logger.error(f"Ошибка при проверке платежа {payment.payment_id}: {str(e)}")
                continue
        
        logger.info(f"Проверка платежей завершена. Обновлено {updated_count} из {total_count} платежей")
        return {"total": total_count, "updated": updated_count}
    
    finally:
        db.close()

async def check_specific_payments(user_id: int):
    """
    Проверяет незавершенные платежи конкретного пользователя
    и возвращает информацию о количестве обновленных платежей.
    """
    db = SessionLocal()
    
    try:
        # Находим все платежи пользователя со статусом "pending"
        pending_payments = db.query(models.Payment).filter(
            models.Payment.user_id == user_id,
            models.Payment.status == "pending"
        ).all()
        
        updated_count = 0
        total_count = len(pending_payments)
        
        for payment in pending_payments:
            try:
                # Проверяем статус платежа через API
                payment_info = check_payment_status(payment.payment_id)
                
                # Если платеж успешно оплачен
                if payment_info["status"] == "succeeded" and payment_info["paid"]:
                    # Обновляем статус платежа в БД
                    payment.status = "completed"
                    
                    # Находим пользователя и добавляем ему время
                    user = db.query(models.User).filter(models.User.id == user_id).first()
                    if user:
                        user.remaining_minutes += payment.minutes_added
                        logger.info(f"Пользователю {user_id} добавлено {payment.minutes_added} минут")
                    
                    updated_count += 1
                    
                # Если платеж отменен или не оплачен
                elif payment_info["status"] in ["canceled", "failed"]:
                    payment.status = "failed"
                    updated_count += 1
                
                db.commit()
                
            except Exception as e:
                logger.error(f"Ошибка при проверке платежа {payment.payment_id}: {str(e)}")
                continue
        
        return {"total": total_count, "updated": updated_count}
    
    finally:
        db.close()

async def start_payment_checker():
    """
    Запускает периодическую проверку незавершенных платежей.
    """
    while True:
        try:
            await check_pending_payments()
        except Exception as e:
            logger.error(f"Ошибка в процессе проверки платежей: {str(e)}")
        
        # Ждем 5 минут перед следующей проверкой
        await asyncio.sleep(5)