from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from auth_utils import get_current_user
from payment_utils import create_payment, check_payment_status, get_plan_info
from tasks import check_specific_payments
import uuid

router = APIRouter(tags=["payment"])


@router.post("/payment", response_model=schemas.PaymentResponse)
async def create_payment_session(
    payment_data: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Создает сессию оплаты для пользователя
    """
    try:
        # Получаем информацию о выбранном тарифе
        plan = get_plan_info(payment_data.plan_id)
        
        # Создаем платеж в Юкассе
        payment_url, yookassa_payment_id = create_payment(payment_data.plan_id, current_user.id)
        
        # Создаем запись о платеже в базе данных
        payment = models.Payment(
            user_id=current_user.id,
            payment_id=yookassa_payment_id,
            amount=plan["price"],
            minutes_added=plan["minutes"],
            status="pending"
        )
        db.add(payment)
        db.commit()
        
        return {
            "payment_url": payment_url,
            "payment_id": yookassa_payment_id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании платежа: {str(e)}")


@router.get("/payment/{payment_id}")
async def check_payment(
    payment_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Проверяет статус платежа и обновляет информацию в базе данных
    """
    # Находим платеж в базе данных
    payment = db.query(models.Payment).filter(
        models.Payment.payment_id == payment_id,
        models.Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    # Если платеж уже завершен, возвращаем его статус
    if payment.status == "completed":
        return {"status": "completed", "remaining_minutes": current_user.remaining_minutes}
    
    # Проверяем статус платежа в Юкассе
    try:
        payment_info = check_payment_status(payment_id)
        
        # Если платеж успешно оплачен
        if payment_info["status"] == "succeeded" and payment_info["paid"]:
            # Обновляем статус платежа в базе данных
            payment.status = "completed"
            
            # Добавляем время пользователю
            current_user.remaining_minutes += payment.minutes_added
            
            db.commit()
            
            return {"status": "completed", "remaining_minutes": current_user.remaining_minutes}
        
        # Если платеж отменен или не оплачен
        elif payment_info["status"] in ["canceled", "failed"]:
            payment.status = "failed"
            db.commit()
            return {"status": "failed"}
        
        # Если платеж в процессе
        else:
            return {"status": "pending"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при проверке статуса платежа: {str(e)}")


@router.get("/plans")
async def get_available_plans():
    """
    Возвращает список доступных тарифных планов
    """
    plans = [
        {
            "id": 1,
            "name": "1 час консультации",
            "price": 1290.0,
            "minutes": 60
        },
        {
            "id": 2,
            "name": "2 часа консультации",
            "price": 1990.0,
            "minutes": 120
        },
        {
            "id": 3,
            "name": "5 часов консультации",
            "price": 2990.0,
            "minutes": 300
        }
    ]
    
    return plans


@router.post("/check-all-payments")
async def check_all_user_payments(
    current_user: models.User = Depends(get_current_user)
):
    """
    Принудительно проверяет все ожидающие платежи пользователя
    """
    result = await check_specific_payments(current_user.id)
    
    return {
        "message": f"Проверено {result['total']} платежей, обновлено {result['updated']}",
        "checked": result["total"],
        "updated": result["updated"]
    } 