# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
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


# Pydantic models for API schemas
class TokenSchema(BaseModel):
    token: str
    user_id: str


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
