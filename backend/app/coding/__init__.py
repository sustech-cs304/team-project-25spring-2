from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from typing import Annotated
from kubernetes import config, client
from app.auth.middleware import get_current_user
from .api import *
import os

router = APIRouter()
if os.environ.get("ENVNAME") == "k3s":
    config.load_incluster_config()
else:
    config.load_kube_config()

@router.get("/environment/{env_id}/files")
async def get_environment_files(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass


@router.post("/environment/{course_id}")
async def get_environment(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    core_v1 = client.CoreV1Api()
