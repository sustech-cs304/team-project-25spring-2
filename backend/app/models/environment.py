from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from app.db import Base
from datetime import datetime, BJT
import uuid

class Environment(Base):
    __tablename__ = "environments"

    environment_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.course_id"), nullable=False)
    assignment_id = Column(String, ForeignKey("assignments.assignment_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=True)
    group_id = Column(String, ForeignKey("groups.group_id"), nullable=True)
    is_collaborative = Column(Boolean, default=False)
    wsUrl = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(BJT))
    updated_at = Column(DateTime, default=lambda: datetime.now(BJT), onupdate=lambda: datetime.now(BJT)) 
    layout = Column(String, nullable=True)
    is_running = Column(Boolean, default=False)