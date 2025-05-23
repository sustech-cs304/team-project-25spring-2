# app/models/course.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(UUID, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    number = Column(String, nullable=True)
    require_group = Column(Boolean, nullable=True)
    group_num = Column(Integer, nullable=True)
    people_per_group = Column(Integer, nullable=True)
    group_deadline = Column(String, nullable=True)
    teacher_id = Column(ARRAY(String), nullable=False)
    sections = Column(ARRAY(String), nullable=True)
    assignments = Column(ARRAY(String), nullable=True)