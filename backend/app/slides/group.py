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
from app.models.group import Group
from app.auth.middleware import get_current_user
import json
from . import get_db

router = APIRouter()


@router.get("/group/{course_id}")
async def get_group(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    groups = db.query(Group).filter(Group.course_id == course_id).all()
    if groups is None:
        return {"message": "Group not found"}
    else:
        return {
            "message": "Group found",
            "groups": [
                {
                    "group_id": group.group_id,
                    "course_id": group.course_id,
                    "users": group.users,
                }
                for group in groups
            ],
        }


# delete a user from a group
@router.delete("/group/{group_id}/user/{user_id}")
async def delete_group(
    group_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if group is None:
        return {"message": "Group not found"}
    else:
        users = group.users
        users.remove(user_id)
        group.users = users
        db.commit()
        return {"message": "User deleted from group"}


@router.post("/group/{group_id}/user/{user_id}")
async def add_user_to_group(
    group_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if group is None:
        return {"message": "Group not found"}
    else:
        users = group.users
        users.append(user_id)
        group.users = users
        db.commit()
        return {"message": "User added to group"}
