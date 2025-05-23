# app/models/note.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db import Base


class Note(Base):
    __tablename__ = "notes"

    note_id = Column(UUID, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    material_id = Column(UUID, ForeignKey("materials.material_id"), nullable=False)
    content = Column(String, nullable=False)
