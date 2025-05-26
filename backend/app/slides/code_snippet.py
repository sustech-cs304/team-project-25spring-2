from fastapi import APIRouter, Depends, Body, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.models.code_snippet import CodeSnippet
from pyston import PystonClient, File
from app.auth.middleware import get_current_user
from app.models.user import User
from app.db import get_db

router = APIRouter()


@router.get("/snippet/{material_id}")
async def get_code_snippet(
    material_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    code_snippets = (
        db.query(CodeSnippet).filter(CodeSnippet.material_id == material_id).all()
    )
    # 找出所有code_snippetes中user_id对应的user是老师的
    teacher_code_snippets = []
    for snippet in code_snippets:
        user = db.query(User).filter(User.user_id == snippet.user_id).first()
        if user.is_teacher:
            teacher_code_snippets.append(snippet)
    current_user_code_snippets = []
    for snippet in teacher_code_snippets:
        # 搜索出 当前user的code_snippet中snippet_id与snippet.snippet_id相同的snippet
        current_user_code_snippet = (
            db.query(CodeSnippet)
            .filter(
                CodeSnippet.snippet_id == snippet.snippet_id,
                CodeSnippet.user_id == current_user.user_id,
            )
            .first()
        )
        if current_user_code_snippet is None:
            current_user_code_snippets.append(snippet)
        else:
            current_user_code_snippets.append(current_user_code_snippet)

    return {
        "message": "Code snippets retrieved successfully",
        "code_snippets": [
            {
                "snippet_id": snippet.snippet_id,
                "user_id": snippet.user_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {"x": snippet.position_x, "y": snippet.position_y},
            }
            for snippet in current_user_code_snippets
        ],
    }


@router.post("/snippet/{material_id}/page/{page}")
async def create_code_snippet(
    material_id: str,
    page: int,
    snippet_id: str = Form(None),
    lang: str = Form(None),
    content: str = Form(None),
    position_x: float = Form(None),
    position_y: float = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    snippet = (
        db.query(CodeSnippet)
        .filter(
            CodeSnippet.snippet_id == snippet_id,
            CodeSnippet.user_id == current_user.user_id,
        )
        .first()
    )
    if snippet is None:
        snippet = CodeSnippet(
            snippet_id=snippet_id,
            user_id=current_user.user_id,
            material_id=material_id,
            lang=lang,
            page=page,
            content=content,
            position_x=position_x,
            position_y=position_y,
        )
        db.add(snippet)
        db.commit()
        db.refresh(snippet)
        return {
            "message": "Code snippet created successfully",
            "code_snippet": {
                "snippet_id": snippet.snippet_id,
                "user_id": snippet.user_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {"x": snippet.position_x, "y": snippet.position_y},
            },
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
                "user_id": snippet.user_id,
                "material_id": snippet.material_id,
                "lang": snippet.lang,
                "page": snippet.page,
                "content": snippet.content,
                "position": {"x": snippet.position_x, "y": snippet.position_y},
            },
        }


@router.delete("/teacher/{snippet_id}")
async def delete_code_snippet(
    snippet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_teacher:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
        )

    snippets = db.query(CodeSnippet).filter(CodeSnippet.snippet_id == snippet_id).all()
    if snippets:
        for snippet in snippets:
            db.delete(snippet)
        db.commit()
        return {"message": "Code snippets deleted successfully"}
    else:
        return {"message": "Code snippet not found"}


@router.post("/execute/snippet/{snippet_id}")
async def execute_code_snippet(
    snippet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = db.query(CodeSnippet).filter(CodeSnippet.snippet_id == snippet_id).first()
    if not snippet:
        return {"error": "Snippet not found"}

    try:
        client = PystonClient(base_url="http://piston:2000/api/v2/")
        result = await client.execute(snippet.lang, [File(snippet.content)])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

    return {
        "result": result.run_stage.output,
        "error": result.run_stage.stdrr,
    }
