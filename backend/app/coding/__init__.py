from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import SessionLocal
from typing import Annotated

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/environment/{env_id}/files")
async def get_environment_files(env_id: int, db: Session = Depends(get_db)):
    pass
