# app/models/chat.py
from sqlalchemy import JSON, Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class Chat(Base):
    __tablename__ = "chats"

    chat_id = Column(UUID, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    material_id = Column(UUID, ForeignKey("materials.material_id", ondelete="CASCADE"), index=True)
    title = Column(String, index=True)
    messages = Column(JSON)
