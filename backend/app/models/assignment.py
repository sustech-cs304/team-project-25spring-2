# app/models/assignment.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    course_id = Column(String, index=True)
    teacher_id = Column(String, index=True)
    deadline = Column(String, index=True)
    isOver = Column(Boolean, index=True)
    materials = Column(ARRAY(String), index=True) # corresponding to the material_id, but whole material in the api