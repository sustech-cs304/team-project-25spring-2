from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Annotated
from datetime import timedelta, datetime
import uuid

from app.auth.middleware import get_db, get_current_user
from app.models.user import (
    TokenSchema,
    UserCreate,
    UserLogin,
    UserResponse,
    User,
    Sessions,
)
from app.auth.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_user_by_id,
    decode_access_token,
    get_session_by_id,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()
security = HTTPBearer()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = get_user_by_id(db, user_data.user_id)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User ID already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        user_id=user_data.user_id,
        name=user_data.name,
        password=hashed_password,
        is_teacher=user_data.is_teacher,
        courses=[],
    )

    db.add(db_user)
    db.commit()

    return {"msg": "User registered successfully"}


@router.post("/login", response_model=TokenSchema)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Verify user
    user = get_user_by_id(db, user_data.name)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create session
    session = Sessions(
        user_id=user.user_id,
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(session)
    db.commit()

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": str(session.id)})

    return {
        "token": access_token,
        "user_id": user.user_id,
    }


@router.delete("/logout")
async def logout(token: str = Depends(security), db: Session = Depends(get_db)):
    payload = decode_access_token(token.credentials)
    session_id: str = payload.get("sub")
    session = get_session_by_id(db, session_id)
    db.delete(session)
    db.commit()

    return {"message": "Successfully logged out"}


@router.get("/user", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user