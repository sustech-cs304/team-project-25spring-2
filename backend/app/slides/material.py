from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db import SessionLocal
from app.models.material import Material
from app.models.comment import Comment

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/material/{material_id}")
async def get_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    comments = (
        db.query(Comment)
        .filter(Comment.material_id == material_id, Comment.ancestor_id == None)
        .all()
    )
    return {
        "message": "Material retrieved successfully",
        "material_id": material.material_id,
        "material_name": material.material_name,
        "section_id": material.section_id,
        "data": material.data,
        "comments": [
            {
                "comment_id": comment.comment_id,
                "content": comment.content,
                "user_id": comment.user_id,
                "material_id": comment.material_id,
                "page": comment.page,
                "ancestor_id": comment.ancestor_id,
            }
            for comment in comments
        ],
    }


@router.post("/material/{material_id}")
async def update_material(
    material_id: str,
    db: Session = Depends(get_db),
    material_name: str = Body(None),
    section_id: str = Body(None),
    data: str = Body(None),
):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if material is None:
        db.add(
            Material(
                material_id=material_id,
                material_name=material_name,
                section_id=section_id,
                data=data,
                comments=[],
            )
        )
        db.commit()
    else:
        if material_name is not None:
            material.material_name = material_name
        if section_id is not None:
            material.section_id = section_id
        if data is not None:
            material.data = data
        db.commit()
    db.refresh(material)
    return {
        "message": "Material updated successfully",
        "material_id": material.material_id,
        "material_name": material.material_name,
        "section_id": material.section_id,
        "data": material.data,
        "comments": [
            {
                "comment_id": comment.comment_id,
                "content": comment.content,
                "user_id": comment.user_id,
                "material_id": comment.material_id,
                "page": comment.page,
                "ancestor_id": comment.ancestor_id,
            }
            for comment in material.comments
        ],
    }


@router.delete("/material/{material_id}")
async def delete_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if material is None:
        return {"message": "Material not found"}
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
