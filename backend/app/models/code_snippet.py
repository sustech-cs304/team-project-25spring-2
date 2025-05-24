# app/models/code_snippet.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    PrimaryKeyConstraint,
)
from app.db import Base
from sqlalchemy.dialects.postgresql import UUID


class CodeSnippet(Base):
    __tablename__ = "code_snippets"

    snippet_id = Column(UUID, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    material_id = Column(
        UUID, ForeignKey("materials.material_id", ondelete="CASCADE"), index=True, nullable=False
    )
    lang = Column(String, nullable=False)
    page = Column(Integer, nullable=False)
    content = Column(String, nullable=False)
    position_x = Column(Integer, nullable=False)
    position_y = Column(Integer, nullable=False)

    __table_args__ = (PrimaryKeyConstraint("snippet_id", "user_id"),)
