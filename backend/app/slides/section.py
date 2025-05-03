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


@router.get("/sections/{course_id}")
async def get_sections(course_id: str, db: Session = Depends(get_db)):
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
                        "material_name": material.name,
                    }
                    for material in db.query(Material)
                    .filter(Material.material_id.in_(section.materials))
                    .all()
                ],
            }
            for section in sections
        ],
    }


@router.post("/section")
async def create_section(
    section: Section,
    db: Session = Depends(get_db),
    section_id: str = Body(None),
    course_id: str = Body(None),
    name: str = Body(None),
    materials: list[str] = Body(None),
    schedules: list[str] = Body(None),
):
    section = db.query(Section).filter(Section.section_id == section_id).first()
    if section is None:
        section = Section(
            section_id=section_id,
            course_id=course_id,
            name=name,
            materials=materials,
            schedules=schedules,
        )
        db.add(section)
        db.commit()
        db.refresh(section)
        return {"message": "Section created successfully"}
    else:
        if course_id is not None:
            section.course_id = course_id
        if name is not None:
            section.name = name
        if materials is not None:
            section.materials = materials
        if schedules is not None:
            section.schedules = schedules
        db.commit()
        db.refresh(section)
        return {"message": "Section updated successfully"}
