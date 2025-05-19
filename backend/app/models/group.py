# app/models/section.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base


class Group(Base):
    __tablename__ = "groups"

    group_id = Column(String, primary_key=True, index=True)
    course_id = Column(
        String, ForeignKey("courses.course_id"), nullable=False, index=True
    )
    users = Column(ARRAY(String), index=True)
