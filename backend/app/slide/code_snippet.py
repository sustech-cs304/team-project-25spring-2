from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.material import Material
from app.models.comment import Comment
from app.models.note import Note
from app.models.code_snippet import CodeSnippet

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/snippet/{material_id}")
async def get_code_snippet(
    material_id: str,
    db: Session = Depends(get_db)
):
    code_snippets = db.query(CodeSnippet).filter(CodeSnippet.material_id == material_id).all()
    return {
        "message": "Code snippets retrieved successfully",
        "code_snippets": [
            {
                "snippet_id": snippet.snippet_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {
                    "x": snippet.position_x,
                    "y": snippet.position_y
                }
            } for snippet in code_snippets
        ]
    }

@router.post("/teacher/snippet/{material_id}/page/{page}")
async def create_code_snippet(
    material_id: str,
    page: int,
    snippet_id: str = Body(...),
    lang: str = Body(None),
    content: str = Body(None),
    position_x: float = Body(None),
    position_y: float = Body(None),
    db: Session = Depends(get_db)
):
    snippet = db.query(CodeSnippet).filter(CodeSnippet.snippet_id == snippet_id).first()
    if snippet is None:
        snippet = CodeSnippet(
            snippet_id=snippet_id,
            material_id=material_id,
            lang=lang,
            page=page,
            content=content,
            position_x=position_x,
            position_y=position_y
        )
        db.add(snippet)
        db.commit()
        db.refresh(snippet)
        return {
            "message": "Code snippet created successfully",
            "code_snippet": {
                "snippet_id": snippet.snippet_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {
                    "x": snippet.position_x,
                    "y": snippet.position_y
                }
            }
        }
    else:
        if lang is not None:
            snippet.lang = lang
        if content is not None:
            snippet.content = content
        if position_x is not None:
            snippet.position_x = position_x
        if position_y is not None:
            snippet.position_y = position_y
        db.commit()
        db.refresh(snippet)
        return {
            "message": "Code snippet updated successfully",
            "code_snippet": {
                "snippet_id": snippet.snippet_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {
                    "x": snippet.position_x,
                    "y": snippet.position_y
                }
            }
        }

@router.delete("/teacher/{snippet_id}")
async def delete_code_snippet(
    snippet_id: str,
    db: Session = Depends(get_db)
):
    snippet = db.query(CodeSnippet).filter(CodeSnippet.snippet_id == snippet_id).first()
    if snippet:
        db.delete(snippet)
        db.commit()
        return {"message": "Code snippet deleted successfully"}
    else:
        return {"message": "Code snippet not found"}