# app/models/material.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class Material(Base):
    __tablename__ = "materials"

    material_id = Column(UUID, primary_key=True, index=True)
    material_name = Column(String, nullable=False)
    section_id = Column(
        UUID, ForeignKey("sections.section_id", ondelete="CASCADE"), index=True, nullable=True
    )
    data = Column(String, nullable=False)
    comments = Column(
        ARRAY(String), nullable=True
    )  # corresponding to the comment_id, but whole comment in the api
