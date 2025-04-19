from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import models
import schemas
from database import get_db, engine
from auth_utils import (
    get_password_hash, 
    authenticate_user, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)

# Создаем таблицы в базе данных
# models.Base.metadata.create_all(bind=engine)

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=schemas.Token)
async def register_user(db: Session = Depends(get_db)):
    """
    Регистрирует нового пользователя с случайным логином и паролем
    """
    # Генерируем случайные логин и пароль
    username, password = models.User.generate_random_credentials()
    
    # Хешируем пароль
    hashed_password = get_password_hash(password)
    
    # Создаем нового пользователя
    user = models.User(username=username, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Создаем JWT токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "remaining_minutes": user.remaining_minutes
    }


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Получает JWT токен по логину и паролю
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "remaining_minutes": user.remaining_minutes
    }


@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    """
    Получает информацию о текущем пользователе
    """
    return current_user 