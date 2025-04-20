from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.comment import Comment
from app.auth.middleware import get_current_user
from app.models.user import User
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/comment/{comment_id}")
async def get_comment(comment_id: str, db: Session = Depends(get_db)):
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


@router.post("/comment/{comment_id}")
async def reply_to_comment(
    comment_id: str,
    content: str = Body(...),
    current_user: User = Depends(get_current_user),
    material_id: str = Body(...),
    page: int = Body(...),
    ancestor_id: str = Body(...),
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
            comment_id=comment_id,
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
):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if comment is None:
        return {"error": "Comment not found"}
    db.delete(comment)
    db.commit()
    return {"message": "comment deleted successfully"}
