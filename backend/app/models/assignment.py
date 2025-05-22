# app/models/assignment.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base
import uuid

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(UUID, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    course_id = Column(UUID, ForeignKey("courses.course_id"), index=True)
    teacher_id = Column(String, ForeignKey("users.user_id"), index=True)
    deadline = Column(String, index=True)
    is_over = Column(Boolean, index=True)
    is_group_assign = Column(Boolean, index=True)
    files = Column(ARRAY(String), index=True)
