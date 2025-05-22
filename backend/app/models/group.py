# app/models/section.py
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class Group(Base):
    __tablename__ = "groups"

    group_id = Column(UUID, primary_key=True, index=True)
    course_id = Column(
        UUID, ForeignKey("courses.course_id"), nullable=False, index=True
    )
    users = Column(ARRAY(String), index=True)
