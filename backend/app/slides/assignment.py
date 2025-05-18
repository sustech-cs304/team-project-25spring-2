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
import json
from fastapi import Form
from app.auth.middleware import get_current_user
from . import get_db

router = APIRouter()


@router.get("/assignments/{course_id}")
async def get_assignments(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        return {"message": "Course not found."}
    assignments = (
        db.query(Assignment)
        .filter(Assignment.assignment_id.in_(course.assignments))
        .all()
    )
    if not assignments:
        return {"message": "No assignments found for this course."}
    return {
        "message": "Assignments found.",
        "assignments": [
            {
                "assignment_id": assignment.assignment_id,
                "is_group_assign": assignment.is_group_assign,
                "name": assignment.name,
                "course_id": assignment.course_id,
                "teacher_id": assignment.teacher_id,
                "deadline": assignment.deadline,
                "is_over": assignment.is_over,
            }
            for assignment in assignments
        ],
    }


@router.post("/assignment")
async def create_assignment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    is_group_assign: bool = Form(None),
    course_id: str = Form(None),
):
    pass
