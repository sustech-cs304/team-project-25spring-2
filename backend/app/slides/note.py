from fastapi import APIRouter, Depends, Body, Form
from sqlalchemy.orm import Session
from app.models.note import Note
from app.auth.middleware import get_current_user
from app.models.user import User
from app.db import get_db


router = APIRouter()


@router.get("/note/{material_id}")
async def get_note(
    material_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = (
        db.query(Note)
        .filter(
            Note.material_id == material_id,
            Note.user_id == current_user.user_id,
        )
        .first()
    )
    return {
        "note_id": note.note_id if note else None,
        "user_id": note.user_id if note else None,
        "material_id": note.material_id if note else None,
        "content": note.content if note else None,
    }


@router.post("/note/{note_id}")
async def create_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    material_id: str = Form(None),
    content: str = Form(None),
    db: Session = Depends(get_db),
):
    note = (
        db.query(Note)
        .filter(
            Note.note_id == note_id,
            Note.user_id == current_user.user_id,
        )
        .first()
    )
    if note is None:
        note = Note(
            note_id=note_id,
            user_id=current_user.user_id,
            material_id=material_id,
            content=content,
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return {
            "message": "Note created successfully",
            "note_id": note.note_id,
            "user_id": note.user_id,
            "material_id": note.material_id,
            "content": note.content,
        }
    else:
        if note_id is not None:
            note.note_id = note_id
        if current_user.user_id is not None:
            note.user_id = current_user.user_id
        if material_id is not None:
            note.material_id = material_id
        if content is not None:
            note.content = content
        db.commit()
        db.refresh(note)
        return {
            "message": "Note updated successfully",
            "note_id": note.note_id,
            "user_id": note.user_id,
            "material_id": note.material_id,
            "content": note.content,
        }


@router.delete("/note/{note_id}")
async def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = (
        db.query(Note)
        .filter(Note.note_id == note_id, Note.user_id == current_user.user_id)
        .first()
    )
    if note is None:
        return {"message": "Note not found"}
    else:
        db.delete(note)
        db.commit()
        return {"message": "Note deleted successfully"}
