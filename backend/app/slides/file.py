from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.file import File, FileCreate
from app.auth.middleware import get_current_user
from app.db import get_db


router = APIRouter()

@router.post("/file")
async def create_file(
    filename: str = Body(...),
    filepath: str = Body(...),
    base64: str = Body(...),
    assignment_id: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = File(
        file_name=filename,
        file_path=filepath,
        file_type="pdf" if filename.endswith(".pdf") else "code",
        file_size=len(base64),
        content=base64,
        uploader_id=current_user.user_id,
        assignment_id=assignment_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


@router.delete("/file/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(File).filter(File.file_id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if current_user.user_id != db_file.creator_id:
        raise HTTPException(status_code=404, detail="No privilege for modifying the file.")
    db_file.is_deleted = True
    db.commit()
    db.refresh(db_file)
    return db_file

@router.put("/file/{file_id}")
async def update_file(
    file_id: str,
    filename: str = Body(...),
    filepath: str = Body(...),
    base64: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_file = db.query(File).filter(File.file_id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if current_user.user_id != db_file.creator_id:
        raise HTTPException(status_code=404, detail="No privilege for modifying the file.")
    if filename: 
        db_file.file_name = filename
        db_file.file_type = "pdf" if filename.endswith(".pdf") else "code"
    if filepath:
        db_file.file_path = filepath
    if base64:
        db_file.content = base64
        db_file.file_size = len(base64)
    db.commit()
    db.refresh(db_file)
    return db_file