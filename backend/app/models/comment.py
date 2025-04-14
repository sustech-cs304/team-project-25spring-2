# app/models/comment.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(String, primary_key=True, index=True)
    content = Column(String, nullable=False)
    user_id =Column(String, ForeignKey("users.user_id"), index=True, nullable=False)
    material_id = Column(String, ForeignKey("materials.material_id"), index=True, nullable=False)
    page = Column(Integer, nullable=False)
    ancestor_id = Column(String, nullable=True)