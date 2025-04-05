# app/models/code_snippet.py
from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base

class CodeSnippet(Base):
    __tablename__ = "code_snippets"

    snippet_id = Column(String, primary_key=True, index=True)
    material_id = Column(String, nullable=False)
    lang = Column(String, nullable=False)
    page = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    position_x = Column(Integer, nullable=False)
    position_y = Column(Integer, nullable=False)