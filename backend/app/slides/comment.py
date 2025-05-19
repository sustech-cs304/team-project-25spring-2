import uuid
from fastapi import APIRouter, Depends, Body, Form
from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.auth.middleware import get_current_user
from app.models.user import User
from app.db import get_db

router = APIRouter()


@router.get("/comment/{comment_id}")
async def get_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if comment is None:
        return {"error": "Comment not found"}
    replies = db.query(Comment).filter(Comment.ancestor_id == comment_id).all()
    return {
        "message": "Comment retrieved successfully",
        "comment": {
            "comment_id": comment.comment_id,
            "content": comment.content,
            "user_id": comment.user_id,
            "material_id": comment.material_id,
            "page": comment.page,
            "ancestor_id": comment.ancestor_id,
        },
        "replies": [
            {
                "comment_id": reply.comment_id,
                "content": reply.content,
                "user_id": reply.user_id,
                "material_id": reply.material_id,
                "page": reply.page,
                "ancestor_id": reply.ancestor_id,
            }
            for reply in replies
        ],
    }


@router.post("/comment")
async def create_comment(
    content: str = Form(...),
    current_user: User = Depends(get_current_user),
    material_id: str = Form(...),
    page: int = Form(...),
    db: Session = Depends(get_db),
):
    comment = Comment(
        comment_id=str(uuid.uuid4()),
        content=content,
        user_id=current_user.user_id,
        material_id=material_id,
        page=page,
        ancestor_id=None,
    )
    db.add(comment)
    db.commit()
    return {"message": "Comment created successfully"}


@router.post("/comment/{comment_id}")
async def reply_to_comment(
    comment_id: str,
    content: str = Form(...),
    current_user: User = Depends(get_current_user),
    material_id: str = Form(...),
    page: int = Form(...),
    ancestor_id: str = Form(...),
    db: Session = Depends(get_db),
):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if comment is None:
        return {"error": "Comment not found"}
    ancestor = db.query(Comment).filter(Comment.comment_id == ancestor_id).first()
    while ancestor.ancestor_id != None:
        ancestor = (
            db.query(Comment).filter(Comment.comment_id == ancestor.ancestor_id).first()
        )
    db.add(
        Comment(
            comment_id=str(uuid.uuid4()),
            content=content,
            user_id=current_user.user_id,
            material_id=material_id,
            page=page,
            ancestor_id=ancestor.comment_id,
        )
    )
    db.commit()
    return {"message": "Reply added successfully"}


@router.delete("/comment/{comment_id}")
async def delete_comment(
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if comment is None:
        return {"error": "Comment not found"}
    db.delete(comment)
    db.commit()
    return {"message": "comment deleted successfully"}
