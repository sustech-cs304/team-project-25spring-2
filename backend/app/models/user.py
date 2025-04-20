# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional


class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    is_teacher = Column(Boolean, default=False)
    courses = Column(
        ARRAY(String), nullable=True
    )  # corresponding to course_id, but whole course in the api
    photo = Column(String, nullable=True)
    office_hour = Column(String, nullable=True)
    office_place = Column(String, nullable=True)


class AuthToken(Base):
    __tablename__ = "auth_tokens"
    id = Column(Integer, primary_key=True, index=True)

    # Session identification
    session_id = Column(UUID, unique=True, index=True, nullable=False)

    # Token data
    token = Column(String, nullable=False, index=True)
    token_type = Column(String, nullable=False, default="bearer")

    # User relationship
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)

    # Status and expiration
    expires = Column(
        DateTime, nullable=False, default=datetime.now() + timedelta(days=1)
    )
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now())


# Pydantic models for API schemas
class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    session_id: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class UserCreate(BaseModel):
    user_id: str
    name: str
    password: str
    is_teacher: bool = False


class UserLogin(BaseModel):
    user_id: str
    password: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    is_teacher: bool
    courses: Optional[list[str]] = None
    photo: Optional[str] = None
    office_hour: Optional[str] = None
    office_place: Optional[str] = None

    model_config = {"from_attributes": True}
