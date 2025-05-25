# app/models/assignment.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base
import uuid

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, index=True)
    description = Column(String, index=True, nullable=True)
    course_id = Column(UUID, ForeignKey("courses.course_id", ondelete="CASCADE"), index=True)
    teacher_id = Column(String, ForeignKey("users.user_id"), index=True)
    deadline = Column(String, index=True)
    is_over = Column(Boolean, index=True)
    is_group_assign = Column(Boolean, index=True)
    files = Column(ARRAY(String), index=True)
