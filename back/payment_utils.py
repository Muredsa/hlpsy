import uuid
from yookassa import Configuration, Payment
import os
from dotenv import load_dotenv
from typing import Dict, Tuple, Any

load_dotenv()

# Настройка Юкассы
Configuration.account_id = os.getenv("YOOKASSA_ACCOUNT_ID", "")
Configuration.secret_key = os.getenv("YOOKASSA_SECRET_KEY", "")

# Тарифные планы
PRICING_PLANS = {
    1: {"name": "1 час консультации", "price": 1290.0, "minutes": 60},
    2: {"name": "2 часа консультации", "price": 1990.0, "minutes": 120},
    3: {"name": "5 часов консультации", "price": 2990.0, "minutes": 300}
}

# URL для возврата после оплаты
SUCCESS_URL = os.getenv("PAYMENT_SUCCESS_URL", "http://localhost:3000/success")


def get_plan_info(plan_id: int) -> Dict[str, Any]:
    """Получает информацию о тарифном плане"""
    if plan_id not in PRICING_PLANS:
        raise ValueError(f"Тарифный план с ID {plan_id} не существует")
    return PRICING_PLANS[plan_id]


def create_payment(plan_id: int, user_id: int) -> Tuple[str, str]:
    """
    Создает платеж в Юкассе
    
    Возвращает:
        Tuple[str, str]: URL для оплаты и ID платежа
    """
    plan = get_plan_info(plan_id)
    
    # Создаем идентификатор платежа
    payment_id = str(uuid.uuid4())
    
    # Создаем платеж в Юкассе
    payment = Payment.create({
        "amount": {
            "value": plan["price"],
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": SUCCESS_URL
        },
        "capture": True,
        "description": f"Оплата тарифа '{plan['name']}' для пользователя {user_id}",
        "metadata": {
            "user_id": user_id,
            "plan_id": plan_id,
            "minutes": plan["minutes"],
            "internal_payment_id": payment_id
        }
    })
    
    # Получаем URL для оплаты
    confirmation_url = payment.confirmation.confirmation_url
    
    return confirmation_url, payment.id


def check_payment_status(payment_id: str) -> Dict[str, Any]:
    """
    Проверяет статус платежа в Юкассе
    
    Возвращает:
        Dict[str, Any]: Информация о платеже
    """
    payment = Payment.find_one(payment_id)
    
    return {
        "id": payment.id,
        "status": payment.status,
        "paid": payment.paid,
        "amount": float(payment.amount.value),
        "currency": payment.amount.currency,
        "metadata": payment.metadata
    } 