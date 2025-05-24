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
from app.db import get_db

router = APIRouter()


@router.get("/group/{course_id}")
async def get_group(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    groups = db.query(Group).filter(Group.course_id == course_id).all()
    user_info = []
    for group in groups:
        for user_id in group.users:
            user_info.append(db.query(User).filter(User.user_id == user_id).first())
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
                    "user_info": user_info,
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
    current_user: User = Depends(get_current_user),
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if group is None:
        return {"message": "Group not found"}
    else:
        new_users = [user for user in group.users if user != user_id]
        setattr(group, "users", new_users)
        user = db.query(User).filter(User.user_id == user_id).first()
        new_groups = [group for group in user.groups if group.split(":")[1] != group_id]
        setattr(user, "groups", new_groups)
        db.commit()
        db.refresh(user)
        db.refresh(group)
        return {"message": "User deleted from group", "group_users": new_users, "user_groups": new_groups}


@router.post("/group/{group_id}/user/{user_id}")
async def add_user_to_group(
    group_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(Group).filter(Group.group_id == group_id).first()
    if group is None:
        return {"message": "Group not found"}

    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        return {"message": "User not found"}

    if user.user_id in group.users:
        return {"message": "User already in group"}

    group.users = group.users + [user.user_id]  
    user.groups = user.groups + [f"{group.course_id}:{group.group_id}"]
    db.commit()
    db.refresh(user)
    db.refresh(group)
    print("USER", user.user_id, "GROUP", group.users)
    return {"message": "User added to group"}
