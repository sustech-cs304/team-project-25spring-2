# app/models/section.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class Section(Base):
    __tablename__ = "sections"

    section_id = Column(UUID, primary_key=True, index=True)
    course_id = Column(
        UUID, ForeignKey("courses.course_id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String, index=True)
    materials = Column(ARRAY(UUID), index=True)
    schedules = Column(ARRAY(String), index=True)
