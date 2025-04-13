# app/models/course.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    number = Column(String, nullable=False)
    teacher_id = Column(
        ARRAY(String), nullable=False
    )  # corresponding to the user_id, but whole user in the api
    sections = Column(
        ARRAY(String), nullable=False
    )  # corresponding to the section_id, but whole section in the api
    schedules = Column(
        ARRAY(String), nullable=False
    )  # corresponding to the schedule_id, but whole schedule in the api
    assignments = Column(
        ARRAY(String), nullable=False
    )  # corresponding to the assignment_id, but whole assignment in the api
