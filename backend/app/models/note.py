# app/models/note.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class Note(Base):
    __tablename__ = "notes"

    note_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    material_id = Column(String, nullable=False)
    is_snippet = Column(Boolean, default=False)
    content = Column(String, nullable=False)
    code_snippet = Column(String, nullable=True) # corresponding to the code_snippet id, but whole code_snippet in the api