# app/models/comment.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(String, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    material_id = Column(String, nullable=False)
    page = Column(Integer, nullable=False)
    ancestor_id = Column(String, nullable=True)