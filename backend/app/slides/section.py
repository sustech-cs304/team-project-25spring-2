from fastapi import APIRouter, Depends, Body, Form
from sqlalchemy.orm import Session
from app.models.material import Material
from app.models.comment import Comment
from app.models.note import Note
from app.models.code_snippet import CodeSnippet
from app.models.assignment import Assignment
from app.models.user import User
from app.models.course import Course
from app.models.section import Section
from app.models.bookmarklist import BookmarkList
from app.auth.middleware import get_current_user
import json
from app.db import get_db

router = APIRouter()


@router.get("/sections/{course_id}")
async def get_sections(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sections = db.query(Section).filter(Section.course_id == course_id).all()
    return {
        "message": "Sections retrieved successfully",
        "sections": [
            {
                "section_id": section.section_id,
                "name": section.name,
                "schedules": section.schedules,
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
    db: Session = Depends(get_db),
    section_id: str = Form(None),
    course_id: str = Form(None),
    name: str = Form(None),
    schedules: list[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    section = db.query(Section).filter(Section.section_id == section_id).first()
    if section is None:
        section = Section(
            section_id=section_id,
            course_id=course_id,
            name=name,
            materials=[],
            schedules=schedules if schedules is not None else [],
        )
        course = db.query(Course).filter(Course.course_id == course_id).first()
        if course is None:
            return {"message": "Course not found"}
        if section_id not in course.sections:
            course.sections = course.sections + [section_id]
        course.sections = list(set(course.sections))
        db.add(section)
        db.commit()
        db.refresh(section)
        return {"message": "Section created successfully"}
    else:
        if course_id is not None and course_id != section.course_id:
            origin_course = (
                db.query(Course).filter(Course.course_id == section.course_id).first()
            )
            if origin_course is not None:
                origin_course.sections.remove(section_id)
            new_course = db.query(Course).filter(Course.course_id == course_id).first()
            if new_course is not None:
                new_course.sections = new_course.sections + [section_id]
            section.course_id = course_id

        if name is not None:
            section.name = name
        if schedules is not None:
            section.schedules = schedules
        db.commit()
        db.refresh(section)
        return {"message": "Section updated successfully"}


@router.delete("/section/{section_id}")
async def delete_section(
    section_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    section = db.query(Section).filter(Section.section_id == section_id).first()
    if section is None:
        return {"message": "Section not found"}
    db.delete(section)
    db.commit()
