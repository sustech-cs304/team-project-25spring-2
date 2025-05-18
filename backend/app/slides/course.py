from fastapi import APIRouter, Depends, Body, Form
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
from app.models.group import Group
import uuid
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
                "require_group": course.require_group,
                "group_num": course.group_num,
                "people_per_group": course.people_per_group,
                "group_deadline": course.group_deadline,
                "teachers_name": [teacher_id_to_name.get(tid, "Unknown") for tid in (course.teacher_id or [])],
            }
            for course in courses
        ],
    }


@router.get("/course_info/{course_id}")
async def get_course_info(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course is None:
        return {"message": "Course not found"}
    return {
        "message": "Course retrieved successfully",
        "course_id": course.course_id,
        "name": course.name,
        "number": course.number,
        "description": course.description,
        "schedules": course.schedules,
    }


@router.post("/course_info")
async def create_course(
    db: Session = Depends(get_db),
    course_id: str = Form(None),
    name: str = Form(None),
    description: str = Form(None),
    number: str = Form(None),
    require_group: bool = Form(None),
    group_num: int = Form(None),
    people_per_group: int = Form(None),
    group_deadline: str = Form(None),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course is None:
        course = Course(
            course_id=course_id,
            name=name,
            description=description,
            number=number,
            require_group=require_group,
            group_num=group_num,
            people_per_group=people_per_group,
            group_deadline=group_deadline,
            teacher_id=[current_user.user_id],
            sections=[],
            assignments=[],
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        if require_group:
            for _ in range(group_num):
                group = Group(
                    group_id=str(uuid.uuid4()),
                    course_id=course_id,
                    users=[]
                )
                db.add(group)
                db.commit()
                db.refresh(group)
        return {"message": "Course created successfully"}
    else:
        if name is not None:
            course.name = name
        if description is not None:
            course.description = description
        if number is not None:
            course.number = number
        if require_group is not None:
            if course.require_group == False and require_group == True:
                if group_num is None:
                    return {"message": "Group number is required when require_group is True"}
                for _ in range(group_num):
                    group = Group(
                        group_id=str(uuid.uuid4()),
                        course_id=course_id,
                        users=[]
                    )
                    db.add(group)
                    db.commit()
                    db.refresh(group)
            elif course.require_group == True and require_group == False:
                for group in course.groups:
                    db.delete(group)
                    db.commit()
                    db.refresh(group)
                course.require_group = require_group
        if group_num is not None:
            course.group_num = group_num
        if people_per_group is not None:
            course.people_per_group = people_per_group
        db.commit()
        db.refresh(course)
        return {"message": "Course updated successfully"}

@router.post("/enroll")
async def enroll_student_to_course(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    course_id: str = Form(None),
    user_id: str = Form(None),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if current_user.is_teacher == False:
        return {"message": "You are not a teacher"}
    if course is None:
        return {"message": "Course not found"}
    member = db.query(User).filter(User.user_id == user_id).first()
    if member is None:
        return {"message": "Student or Teachers not found"}
    member.courses = list(set(member.courses + [course_id]))
    if member.is_teacher == True:
        course.teacher_id = list(set(course.teacher_id + [member.user_id]))
    db.commit()
    db.refresh(member)
    return {"message": "Student added to course successfully"}

@router.get("/courses/calendar")
async def get_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    courses = db.query(Course).filter(Course.course_id.in_(current_user.courses)).all() if current_user.courses else []
    return {"message": "Calendar retrieved successfully", 
            "courses": [
                {
                    "sections": [
                        {
                            "name": section.name,
                            "schedules": section.schedules
                        } for section in course.sections
                    ],
                    "course_name": course.name,
                    "assignments": [
                        {
                            "name": assignment.name,
                            "deadline": assignment.deadline
                        } for assignment in course.assignments
                    ]
                } for course in courses
            ]
        }

@router.get("/fetch_member/{course_id}")
async def fetch_member(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if course is None:
        return {"message": "Course not found"}
    teachers = db.query(User).filter(User.user_id.in_(course.teacher_id)).all() if course.teacher_id else []
    students = db.query(User).filter(User.is_teacher == False).all()
    enrolled_students = [student for student in students if course_id in student.courses]
    return {"message": "Members retrieved successfully",
            "users": [
                {
                    "user_id": user.user_id,
                    "name": user.name,
                    "email": user.email,
                    "is_teacher": user.is_teacher,
                    "photo": user.photo,
                    "office_hour": user.office_hour,
                    "office_place": user.office_place,
                } for user in teachers + enrolled_students
            ]
        }

