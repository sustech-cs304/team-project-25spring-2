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


@router.get("/courses")
async def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    courses = db.query(Course).filter(Course.course_id.in_(current_user.courses)).all() if current_user.courses else []
    # Collect all teacher_ids from all courses
    all_teacher_ids = set()
    for course in courses:
        if course.teacher_id:
            all_teacher_ids.update(course.teacher_id)
    teachers = db.query(User).filter(User.user_id.in_(all_teacher_ids)).all() if all_teacher_ids else []
    teacher_id_to_name = {teacher.user_id: teacher.name for teacher in teachers}
    return {
        "message": "Courses retrieved successfully",
        "courses": [
            {
                "course_id": course.course_id,
                "name": course.name,
                "number": course.number,
                "description": course.description,
                "teachers_name": [teacher_id_to_name.get(tid, "Unknown") for tid in (course.teacher_id or [])],
            }
            for course in courses
        ],
    }


@router.get("/course_info/{course_id}")
async def get_course_info(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    return {
        "message": "Course retrieved successfully",
        "course_id": course.course_id if course else None,
        "name": course.name if course else None,
        "number": course.number if course else None,
        "description": course.description if course else None,
    }


@router.post("/course_info")
async def create_course(
    db: Session = Depends(get_db),
    course_id: str = Body(None),
    name: str = Body(None),
    description: str = Body(None),
    number: str = Body(None),
    teacher_id: list[str] = Body(None),
    sections: list[str] = Body(None),
    assignments: list[str] = Body(None),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course is None:
        course = Course(
            course_id=course_id,
            name=name,
            description=description,
            number=number,
            teacher_id=teacher_id if teacher_id != None else [],
            sections=sections if sections != None else [],
            assignments=assignments if assignments != None else [],
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return {"message": "Course created successfully"}
    else:
        if name is not None:
            course.name = name
        if description is not None:
            course.description = description
        if number is not None:
            course.number = number
        if teacher_id is not None:
            course.teacher_id = teacher_id
        if sections is not None:
            course.sections = sections
        if assignments is not None:
            course.assignments = assignments
        db.commit()
        db.refresh(course)
        return {"message": "Course updated successfully"}

@router.post("/add")
async def add_student_to_course(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    course_id: str = Body(None),
    student_id: str = Body(None),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if current_user.is_teacher == False:
        return {"message": "You are not a teacher"}
    if course is None:
        return {"message": "Course not found"}
    student = db.query(User).filter(User.user_id == student_id).first()
    if student is None:
        return {"message": "Student not found"}
    student.courses = list(set(student.courses + [course_id]))
    db.commit()
    db.refresh(student)
    return {"message": "Student added to course successfully"}

