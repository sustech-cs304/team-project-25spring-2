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

@router.get("/classes/{course_id}/assignments")
async def get_assignments(
    course_id: str, 
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        return {"message": "Course not found."}
    assignments = db.query(Assignment).filter(Assignment.assignment_id.in_(course.assignments)).all()
    if not assignments:
        return {"message": "No assignments found for this course."}
    assignment_list = []
    for assignment in assignments:
        assignment_list.append({
            "assignment_id": assignment.assignment_id,
            "name": assignment.name,
            "deadline": assignment.deadline,
            "isOver": assignment.isOver,
        })
    return {
        "message": "Assignments found.",
        "assignments": assignment_list
    }