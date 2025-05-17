from fastapi import APIRouter, Depends, Body, Form
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.material import Material
from app.models.comment import Comment
from app.models.note import Note
from app.models.code_snippet import CodeSnippet
from app.auth.middleware import get_current_user
from app.models.user import User

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/note/{material_id}")
async def get_note(material_id: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.material_id == material_id).all()
    return {
        "message": "Note retrieved successfully",
        "notes": [
            {
                "note_id": note.note_id,
                "user_id": note.user_id,
                "material_id": note.material_id,
                "is_snippet": note.is_snippet,
                "content": note.content,
                "code_snippet": db.query(CodeSnippet)
                .filter(CodeSnippet.snippet_id == note.code_snippet)
                .first(),
            }
            for note in note
        ],
    }


@router.post("/note/{note_id}")
async def create_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    material_id: str = Form(None),
    is_snippet: bool = Form(None),
    content: str = Form(None),
    code_snippet: str = Form(None),
    db: Session = Depends(get_db),
):
    note = db.query(Note).filter(Note.note_id == note_id).first()
    if note is None:
        note = Note(
            note_id=note_id,
            user_id=current_user.user_id,
            material_id=material_id,
            is_snippet=is_snippet,
            content=content,
            code_snippet=code_snippet,
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return {
            "message": "Note created successfully",
            "note_id": note.note_id,
            "user_id": note.user_id,
            "material_id": note.material_id,
            "is_snippet": note.is_snippet,
            "content": note.content,
            "code_snippet": {
                "snippet_id": note.code_snippet,
                "material_id": note.material_id,
                "lang": note.lang,
                "page": note.page,
                "content": note.content,
                "position": {"x": note.position_x, "y": note.position_y},
            },
        }
    else:
        if note_id is not None:
            note.note_id = note_id
        if current_user.user_id is not None:
            note.user_id = current_user.user_id
        if material_id is not None:
            note.material_id = material_id
        if is_snippet is not None:
            note.is_snippet = is_snippet
        if content is not None:
            note.content = content
        if code_snippet is not None:
            note.code_snippet = code_snippet
        db.commit()
        db.refresh(note)
        return {
            "message": "Note updated successfully",
            "note_id": note.note_id,
            "user_id": note.user_id,
            "material_id": note.material_id,
            "is_snippet": note.is_snippet,
            "content": note.content,
            "code_snippet": {
                "snippet_id": note.code_snippet,
                "material_id": note.material_id,
                "lang": note.lang,
                "page": note.page,
                "content": note.content,
                "position": {"x": note.position_x, "y": note.position_y},
            },
        }


@router.delete("/note/{note_id}")
async def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.note_id == note_id).first()
    if note is None:
        return {"message": "Note not found"}
    else:
        db.delete(note)
        db.commit()
        return {"message": "Note deleted successfully"}
