from fastapi import Depends, HTTPException, status, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db import SessionLocal
from app.auth.utils import SECRET_KEY, ALGORITHM, get_user_by_session, verify_token
from app.models.user import TokenData

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session_id: Optional[str] = Cookie(None, alias="session_id"),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # First check the JWT token
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)

        # Verify token exists and is not revoked in database
        if not verify_token(db, token):
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Then verify the session
    if not session_id:
        raise credentials_exception

    user = get_user_by_session(db, session_id)
    if user is None or user.user_id != token_data.user_id:
        raise credentials_exception

    return user


async def get_optional_user(request: Request, db: Session = Depends(get_db)):
    session_id = request.cookies.get("session_id")
    if not session_id:
        return None

    return get_user_by_session(db, session_id)
