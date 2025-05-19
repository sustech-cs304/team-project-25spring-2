from fastapi import APIRouter, Depends, Body, Form, status
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


@router.get("/marklist/{material_id}")
async def get_marklist(
    material_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    marklist = (
        db.query(BookmarkList).filter(BookmarkList.material_id == material_id).all()
    )
    return {
        "message": "Marklist retrieved successfully",
        "marklists": [
            {
                "list_id": marklist.list_id,
                "material_id": marklist.material_id,
                "user_id": marklist.user_id,
                "page": marklist.page,
                "bookmark_list": marklist.bookmark_list,
            }
            for marklist in marklist
        ],
    }


def convert_string_to_int_list(string):
    if string is None:
        return []
    try:
        return json.loads(string)
    except (ValueError, TypeError):
        return []


@router.post("/marklist/{list_id}/page/{page}")
async def create_marklist(
    list_id: str,
    page: int,
    current_user: User = Depends(get_current_user),
    material_id: str = Form(None),
    bookmark_list: str = Form(None),
    db: Session = Depends(get_db),
):
    marklist = db.query(BookmarkList).filter(BookmarkList.list_id == list_id).first()
    if marklist is None:
        marklist = BookmarkList(
            list_id=list_id,
            material_id=material_id,
            user_id=current_user.user_id,
            page=page,
            bookmark_list=convert_string_to_int_list(bookmark_list),
        )
        db.add(marklist)
        db.commit()
        db.refresh(marklist)
        return {
            "message": "Marklist created successfully",
            "marklist": {
                "list_id": marklist.list_id,
                "material_id": marklist.material_id,
                "user_id": marklist.user_id,
                "page": marklist.page,
                "bookmark_list": marklist.bookmark_list,
            },
        }
    else:
        if current_user.user_id is not None:
            marklist.user_id = current_user.user_id
        if page is not None:
            marklist.page = page
        if bookmark_list is not None:
            marklist.bookmark_list = convert_string_to_int_list(bookmark_list)
        if material_id is not None:
            marklist.material_id = material_id
        db.commit()
        db.refresh(marklist)
        return {
            "message": "Marklist updated successfully",
            "marklist": {
                "list_id": marklist.list_id,
                "material_id": marklist.material_id,
                "user_id": marklist.user_id,
                "page": marklist.page,
                "bookmark_list": marklist.bookmark_list,
            },
        }


@router.delete("/marklist/{list_id}")
async def delete_marklist(
    list_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    marklist = db.query(BookmarkList).filter(BookmarkList.list_id == list_id).first()
    if marklist is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marklist not found")
    elif current_user.user_id != marklist.user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized")
    else:
        db.delete(marklist)
        db.commit()
        return {"message": "Marklist deleted successfully"}
