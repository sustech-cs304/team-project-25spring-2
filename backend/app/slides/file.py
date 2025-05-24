from fastapi import APIRouter, Depends, Body, HTTPException, File, Form
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.file import FileDB
from app.auth.middleware import get_current_user
from app.db import get_db
import base64

router = APIRouter()

@router.post("/file")
async def create_file(
    file_name: str = Form(None),
    file_path: str = Form(None),
    file = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = await file.read()
    data = base64.b64encode(data).decode("utf-8")
    
    db_file = FileDB(
        file_name=file_name,
        file_path=file_path,
        file_type="pdf" if file_name.endswith(".pdf") else "code",
        file_size=len(data),
        content=data,
        uploader_id=current_user.user_id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return {
        "message": "File created successfully",
        "file_id": db_file.file_id,
    }


@router.delete("/file/{file_id}")
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(FileDB).filter(FileDB.file_id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if current_user.user_id != db_file.uploader_id:
        raise HTTPException(
            status_code=404, detail="No privilege for modifying the file."
        )
    db_file.is_deleted = True
    db.commit()
    db.refresh(db_file)
    return db_file


@router.put("/file/{file_id}")
async def update_file(
    file_id: str,
    file_name: str = Form(None),
    file_path: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_file = db.query(FileDB).filter(FileDB.file_id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if current_user.user_id != db_file.uploader_id:
        raise HTTPException(
            status_code=404, detail="No privilege for modifying the file."
        )
    if file_name:
        db_file.file_name = file_name
        db_file.file_type = "pdf" if file_name.endswith(".pdf") else "code"
    if file_path:
        db_file.file_path = file_path
    db.commit()
    db.refresh(db_file)
    return db_file
