# app/models/chat.py
from sqlalchemy import JSON, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base


class Chat(Base):
    __tablename__ = "chats"

    chat_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    material_id = Column(String, ForeignKey("materials.material_id"), index=True)
    title = Column(String, index=True)
    messages = Column(JSON)
