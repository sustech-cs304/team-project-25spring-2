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


@router.get("/marklist/{material_id}")
async def get_marklist(material_id: str, db: Session = Depends(get_db)):
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
    user_id: str = Body(None),
    material_id: str = Body(None),
    bookmark_list: str = Body(None),
    db: Session = Depends(get_db),
):
    marklist = db.query(BookmarkList).filter(BookmarkList.list_id == list_id).first()
    if marklist is None:
        marklist = BookmarkList(
            list_id=list_id,
            material_id=material_id,
            user_id=user_id,
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
        if user_id is not None:
            marklist.user_id = user_id
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
async def delete_marklist(list_id: str, db: Session = Depends(get_db)):
    marklist = db.query(BookmarkList).filter(BookmarkList.list_id == list_id).first()
    if marklist is None:
        return {"message": "Marklist not found"}
    else:
        db.delete(marklist)
        db.commit()
        return {"message": "Marklist deleted successfully"}
