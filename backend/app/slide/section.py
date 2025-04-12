from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.material import Material
from app.models.comment import Comment
from app.models.note import Note
from app.models.code_snippet import CodeSnippet
from app.models.assignment import Assignment
from app.models.user import User
from app.models.course import Course
from app.models.section import Section
from app.models.bookmarklist import BookmarkList
import json

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/classes/{course_id}/sections")
async def get_sections(
    course_id: str,
    db: Session = Depends(get_db)
):
    sections = db.query(Section).filter(Section.course_id == course_id).all()
    return {
        "message": "Sections retrieved successfully",
        "sections": [
            {
                "section_id": section.section_id,
                "name": section.name,
                "materials": [
                    {
                        "material_id": material.material_id,
                        "material_name": material.name
                    } for material in db.query(Material).filter(Material.material_id.in_(section.materials)).all()
                ]
            } for section in sections
        ]
    }

