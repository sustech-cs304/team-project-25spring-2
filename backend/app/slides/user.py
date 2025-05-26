from fastapi import APIRouter, Depends, Form, UploadFile
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.course import Course
from app.auth.middleware import get_current_user
from app.db import get_db
import base64


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

@router.post("/user/{user_id}")
async def modify_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    office_hour: str = Form(None),
    office_place: str = Form(None),
    photo: UploadFile = Form(None),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user.user_id != current_user.user_id:
        return {"message": "You are not allowed to modify this user."}
    if office_hour:
        user.office_hour = office_hour
    if office_place:
        user.office_place = office_place
    if photo:
        # convert to base64
        user.photo = base64.b64encode(photo.file.read()).decode("utf-8")
    db.commit()
    return {"message": "User modified successfully"}
