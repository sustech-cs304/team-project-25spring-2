# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base
from datetime import datetime, timedelta


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

class Session(Base):
    __tablename__ = "sessions"
    session_id = Column(UUID, primary_key=True, index=True)
    user_id = Column(UUID, nullable=False)
    expires = Column(DateTime, nullable=False, default=datetime.now() + timedelta(days=1))