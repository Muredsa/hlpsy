from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import List
import models
import asyncio

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", ""),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.rockapi.ru/openai/v1")
)

# Системный промпт для настройки модели как психолога
PSYCHOLOGIST_PROMPT = """
Ты - опытный психолог-консультант, предоставляющий поддержку и профессиональную помощь клиенту. 
Твоя задача - создать безопасное и доверительное пространство, где клиент может обсудить свои проблемы.

Твой подход включает:
1. Активное слушание и эмпатию
2. Открытые вопросы для глубокого понимания ситуации клиента
3. Отражение чувств клиента для валидации его опыта
4. Предложение стратегий и инструментов, основанных на научных методах психологии
5. Обеспечение конфиденциальности и профессиональной этики

При общении с клиентом избегай:
1. Предоставления медицинских диагнозов или назначения лекарств
2. Авторитарного подхода или оценочных суждений
3. Решения проблем вместо клиента
4. Упрощения сложных эмоциональных состояний

Следуй принципам когнитивно-поведенческой терапии, практикуй майндфулнесс и используй техники мотивационного интервьюирования, когда это уместно.

Используй русский язык и подстраивайся под стиль общения клиента, сохраняя профессиональный тон.
"""


async def get_ai_response(messages: List[models.Message], user_message: str) -> str:
    """
    Получает ответ от AI на основе истории сообщений и нового сообщения пользователя
    """
    conversation = [
        {"role": "system", "content": PSYCHOLOGIST_PROMPT}
    ]
    
    # Добавляем историю сообщений
    for msg in messages:
        role = "user" if msg.is_from_user else "assistant"
        conversation.append({"role": role, "content": msg.content})
    
    # Добавляем текущее сообщение пользователя
    conversation.append({"role": "user", "content": user_message})

    print(f"Запрос к OpenAI: {conversation}")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Ошибка при запросе к OpenAI: {e}")
        return "Извините, в данный момент я не могу обработать ваш запрос. Пожалуйста, попробуйте позже."


async def simulate_typing_delay(response: str) -> None:
    """
    Симулирует задержку ответа, как будто психолог печатает ответ
    со скоростью 200 знаков в минуту
    """
    # Скорость печати: 200 знаков в минуту = 3.33 знака в секунду
    # Вычисляем задержку на основе длины сообщения
    delay = len(response) / 3.33
    
    # Ограничиваем максимальную задержку до 30 секунд
    delay = min(delay, 30)
    
    await asyncio.sleep(delay)