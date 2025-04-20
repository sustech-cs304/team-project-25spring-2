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


@router.get("/instructors/{class_id}/")
async def get_instructors(class_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == class_id).first()
    # teacher_id = Column(ARRAY(String), nullable=False) # corresponding to the user_id, but whole user in the api
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
    return {"message": "Instructors retrieved successfully", 
            "teachers": instructors}
