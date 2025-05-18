from fastapi import APIRouter, Depends, Body, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.models.material import Material
from app.models.comment import Comment
from app.auth.middleware import get_current_user
from app.models.user import User
from app.models.section import Section
import uuid
from . import get_db

router = APIRouter()


@router.get("/materials")
async def get_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).all()
    return {
        "message": "Materials retrieved successfully",
        "materials": [
            {
                "material_id": material.material_id,
                "material_name": material.material_name,
                "section_id": material.section_id,
                "data": material.data,
            }
            for material in materials
        ],
    }


@router.post("/materials")
async def create_material(
    current_user: User = Depends(get_current_user),
    material_id: str = Form(None),
    material_name: str = Form(None),
    section_id: str = Form(None),
    data: str = Form(None),
    comments: list[str] = Form(None),
    db: Session = Depends(get_db),
):
    material = Material(
        material_id=material_id,
        material_name=material_name,
        section_id=section_id,
        data=data,
        comments=comments,
    )
    section = db.query(Section).filter(Section.section_id == section_id).first()
    if section is None:
        return {"message": "Section not found"}
    if material_id not in section.materials:
        section.materials = section.materials + [material_id]
    db.add(material)
    db.commit()
    db.refresh(material)

    return {
        "message": "Material created successfully",
        "material_id": material.material_id,
        "material_name": material.material_name,
        "data": material.data,
    }


@router.get("/material/{material_id}")
async def get_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Material not found"
        )
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
    material_name: str = Form(None),
    section_id: str = Form(None),
    data: str = Form(None),
):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if material is None:
        section = db.query(Section).filter(Section.section_id == section_id).first()
        if section is None:
            return {"message": "Section not found"}
        if material_id not in section.materials:
            section.materials = section.materials + [material_id]
        section.materials = list(set(section.materials))
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
        return {"message": "Material created successfully"}
    else:
        if material_name is not None:
            material.material_name = material_name
        if section_id is not None and section_id != material.section_id:
            origin_section = (
                db.query(Section)
                .filter(Section.section_id == material.section_id)
                .first()
            )
            if origin_section is not None:
                origin_section.materials.remove(material_id)
            new_section = (
                db.query(Section).filter(Section.section_id == section_id).first()
            )
            if new_section is not None:
                new_section.materials = new_section.materials + [material_id]
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
    section = (
        db.query(Section).filter(Section.section_id == material.section_id).first()
    )
    if section is not None and material_id in section.materials:
        section.materials.remove(material_id)
    db.delete(material)
    db.commit()
    return {"message": "Material deleted successfully"}
