from datetime import datetime, timedelta
import os
import uuid
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User, AuthToken
from fastapi import HTTPException, status

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_auth_token(db: Session, user_id: str, token: str) -> str:
    # Create a session with native UUID
    session_id = uuid.uuid4()
    expires = datetime.now() + timedelta(days=1)

    # Create auth token in database
    auth_token = AuthToken(
        session_id=session_id, token=token, user_id=user_id, expires=expires
    )

    db.add(auth_token)
    db.commit()
    db.refresh(auth_token)

    # Return string representation for HTTP use
    return str(session_id)


def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.user_id == user_id).first()


def get_user_by_session(db: Session, session_id: str):
    try:
        # Convert string session_id to UUID for database query
        uuid_obj = uuid.UUID(session_id)
        auth_token = (
            db.query(AuthToken)
            .filter(
                AuthToken.session_id == uuid_obj,
                AuthToken.is_revoked == False,
                AuthToken.expires > datetime.now(),
            )
            .first()
        )

        if not auth_token:
            return None

        return get_user_by_id(db, auth_token.user_id)
    except ValueError:
        # Invalid UUID
        return None


def invalidate_session(db: Session, session_id: str):
    try:
        uuid_obj = uuid.UUID(session_id)
        db.query(AuthToken).filter(AuthToken.session_id == uuid_obj).update(
            {"is_revoked": True}
        )
        db.commit()
    except ValueError:
        # Invalid UUID
        pass


def verify_token(db: Session, token: str) -> Optional[AuthToken]:
    """Verify if a token exists and is valid"""
    return (
        db.query(AuthToken)
        .filter(
            AuthToken.token == token,
            AuthToken.is_revoked == False,
            AuthToken.expires > datetime.now(),
        )
        .first()
    )
