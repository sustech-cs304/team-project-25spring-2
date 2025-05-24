from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base
from datetime import datetime
import uuid


class Environment(Base):
    __tablename__ = "environments"

    environment_id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(UUID, ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=False)
    assignment_id = Column(UUID, ForeignKey("assignments.assignment_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=True)
    group_id = Column(UUID, ForeignKey("groups.group_id", ondelete="CASCADE"), nullable=True)
    is_collaborative = Column(Boolean, default=False)
    wsUrl = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now())
    updated_at = Column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now()) 
    layout = Column(String, nullable=True, default='{"global":{"splitterEnableHandle":true,"tabSetEnableActiveIcon":true,"tabSetMinWidth":130,"tabSetMinHeight":100,"tabSetEnableTabScrollbar":true,"borderMinSize":100,"borderEnableTabScrollbar":true},"borders":[],"layout":{"type":"row","weight":100,"children":[{"type":"tabset","weight":100,"id":"main","children":[]}]}}')
    is_running = Column(Boolean, default=False)