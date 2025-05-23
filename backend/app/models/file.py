from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db import Base
from datetime import datetime
import uuid
from pydantic import BaseModel

class File(Base):
    __tablename__ = "files"

    file_id = Column(UUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False) # In an environment, the relative path to the root directory
    file_type = Column(String, nullable=False) # example: "code" or "pdf"
    file_size = Column(String, nullable=False)
    content = Column(String, nullable=False)
    uploader_id = Column(String, ForeignKey("users.user_id"), nullable=False) # Teacher's id
    assignment_id = Column(UUID, ForeignKey("assignments.assignment_id"), nullable=False) # Assignment's id
    is_deleted = Column(Boolean, default=False) # Soft delete