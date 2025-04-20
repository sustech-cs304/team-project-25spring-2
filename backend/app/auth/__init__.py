from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Annotated
import uuid
from datetime import timedelta, datetime

from app.auth.middleware import get_db, get_current_user
from app.models.user import (
    TokenSchema,
    UserCreate,
    UserLogin,
    UserResponse,
    User,
    AuthToken,
)
from app.auth.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_auth_token,
    get_user_by_id,
    invalidate_session,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter()
security = HTTPBearer()


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
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
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=TokenSchema)
async def login(
    response: Response, user_data: UserLogin, db: Session = Depends(get_db)
):
    # Verify user
    user = get_user_by_id(db, user_data.user_id)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_id}, expires_delta=access_token_expires
    )

    # Create auth token with session
    session_id = create_auth_token(db, user.user_id, access_token)

    # Set cookie
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "session_id": session_id,
    }


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    session_id: str = Depends(lambda request: request.cookies.get("session_id")),
    db: Session = Depends(get_db),
):
    # Invalidate session and related tokens
    if session_id:
        invalidate_session(db, session_id)

    # Revoke all tokens for this user
    db.query(AuthToken).filter(
        AuthToken.user_id == current_user.user_id,
        AuthToken.is_revoked == False,
        AuthToken.expires > datetime.now(),
    ).update({"is_revoked": True})
    db.commit()

    # Clear cookie
    response.delete_cookie(key="session_id")

    return {"message": "Successfully logged out"}


@router.get("/whoami", response_model=UserResponse)
async def get_user_me(current_user: User = Depends(get_current_user)):
    return current_user
