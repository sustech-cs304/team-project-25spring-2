# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    is_teacher = Column(Boolean, default=False)
    courses = Column(ARRAY(String), nullable=True) # corresponding to course_id, but whole course in the api
    photo = Column(String, nullable=True)
    office_hour = Column(String, nullable=True)
    office_place = Column(String, nullable=True)