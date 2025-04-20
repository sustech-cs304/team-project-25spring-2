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
from app.auth.middleware import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/Courses")
async def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    courses = db.query(Course).filter(Course.user_id == current_user.user_id).all()
    return {
        "message": "Courses retrieved successfully",
        "courses": [
            {
                "course_id": course.course_id,
                "name": course.name,
                "number": course.number,
                "description": course.description,
            } for course in courses
        ],
    }


@router.get("/course_info/{course_id}")
async def get_course_info(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    return {
        "message": "Course retrieved successfully",
        "course_id": course.course_id,
        "name": course.name,
        "number": course.number,
        "description": course.description,
        "schedules": [
            {
                "date": schedule.date,
                "section_name": schedule.section_name,
            }
            for schedule in course.schedules
        ],
    }
