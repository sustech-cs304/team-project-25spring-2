# app/models/section.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base


class Section(Base):
    __tablename__ = "sections"

    section_id = Column(String, primary_key=True, index=True)
    course_id = Column(String, ForeignKey("courses.course_id"), nullable=False, index=True)
    name = Column(String, index=True)
    materials = Column(
        ARRAY(String), index=True
    )  # corresponding to the material_id, but whole material in the api
