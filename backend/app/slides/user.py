from fastapi import APIRouter, Depends, Body
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
from app.db import get_db

import json

router = APIRouter()


@router.get("/instructors/{course_id}")
async def get_instructors(
    course_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    teachers = db.query(User).filter(User.user_id.in_(course.teacher_id)).all()
    if not teachers:
        return {"message": "No instructors found for this course."}
    instructors = []
    for teacher in teachers:
        instructors.append(
            {
                "name": teacher.name,
                "photo": teacher.photo,
                "office_hour": teacher.office_hour,
                "office_place": teacher.office_place,
            }
        )
    return {"message": "Instructors retrieved successfully", "teachers": instructors}


@router.get("/search_user/{name}")
async def search_user(
    name: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.name.like(f"%{name}%")).all()
    if not users:
        return {"message": "No user found."}
    return {
        "message": "User found.",
        "user": [
            {
                "name": user.name,
                "user_id": user.user_id,
                "is_teacher": user.is_teacher,
            }
            for user in users
        ],
    }
