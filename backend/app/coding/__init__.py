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

@router.post("/environment/{env_id}/file")
async def create_environment_file(
    env_id: str,
    file_path: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.put("/environment/{env_id}/file")
async def update_environment_file(
    env_id: str,
    file_path: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.delete("/environment/{env_id}/file")
async def delete_environment_file(
    env_id: str,
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass


@router.post("/environment/{env_id}/directory")
async def create_environment_directory(
    env_id: str,
    directory_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.put("/environment/{env_id}/directory")
async def update_environment_directory(
    env_id: str,
    directory_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.delete("/environment/{env_id}/directory")
async def delete_environment_directory(
    env_id: str,
    directory_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.get("/environment/{env_id}/collaboration/url")
async def get_environment_collaboration_url(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.post("/environment/{env_id}/layout")
async def save_environment_layout(
    env_id: str,
    layout: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.get("/environment/{env_id}/layout")
async def get_environment_layout(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.post("/terminal/{env_id}")
async def terminal_exec(
    env_id: str,
    command: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pass

@router.post("/environment")
async def get_environment(
    course_id: str,
    user_id: str,
    is_group: bool,
    assign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    core_v1 = client.CoreV1Api()