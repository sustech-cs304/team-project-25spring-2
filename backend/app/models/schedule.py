# app/models/schedule.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base


class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(String, primary_key=True, index=True)
    date = Column(String, nullable=False)
    section_name = Column(String, nullable=False)
