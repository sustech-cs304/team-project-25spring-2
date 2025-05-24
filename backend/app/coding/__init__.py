from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, FileResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.group import Group
from app.models.environment import Environment
from app.models.assignment import Assignment
from app.models.file import File
from typing import Annotated, List, Dict, Any
from kubernetes import config, client
from app.auth.middleware import get_current_user
from .api import *
import os
import websockets
import asyncio
import shutil
router = APIRouter()
if os.environ.get("ENVNAME") == "k3s":
    config.load_incluster_config()
else:
    config.load_kube_config()
    
# Establish WebSocket connection to the environment
@router.websocket("/environment/{env_id}/wsurl")
async def websocket_endpoint(
    websocket: WebSocket,
    env_id: str,
    db: Session = Depends(get_db),
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    await websocket.accept()
    
    try:
        async with websockets.connect(env.wsUrl) as internal_ws:
            client_to_internal = asyncio.create_task(forward_messages(websocket, internal_ws))
            internal_to_client = asyncio.create_task(forward_messages(internal_ws, websocket))
            
            done, pending = await asyncio.wait(
                [client_to_internal, internal_to_client],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            for task in pending:
                task.cancel()
                
    except websockets.exceptions.WebSocketException as e:
        print(f"WebSocket error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        await websocket.close()

async def forward_messages(source, destination):
    try:
        while True:
            message = await source.receive_text()
            await destination.send_text(message)
    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        print(f"Error in forward_messages: {e}")

def build_file_structure(path: str, base_uri: str = "/") -> Dict[str, Any]:
    if os.path.isfile(path):
        return {
            "type": "file",
            "uri": base_uri
        }
    
    children = []
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        item_uri = os.path.join(base_uri, item).replace("\\", "/")
        children.append(build_file_structure(item_path, item_uri))
    
    return {
        "type": "directory",
        "uri": base_uri,
        "children": children
    }


@router.get("/environment/{env_id}/files")
async def get_environment_files(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: add auth check
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    if not os.path.exists(env_path):
        return {
            "type": "directory",
            "uri": "/",
            "children": []
        }
    
    return build_file_structure(env_path)

@router.post("/environment/{env_id}/file")
async def create_environment_file(
    env_id: str,
    file_path: str,
    file_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    env_path = f"/app/data/{env_id}/{file_path}"
    os.makedirs(os.path.dirname(env_path), exist_ok=True)
    with open(env_path + "/" + file_name, "w") as f:
        f.write("")

@router.put("/environment/{env_id}/file")
async def update_environment_file(
    env_id: str,
    origin: str,
    destination: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    origin_path = os.path.join(env_path, origin.lstrip('/'))
    destination_path = os.path.join(env_path, destination.lstrip('/'))
    
    if not os.path.exists(origin_path):
        raise HTTPException(status_code=404, detail="Source file not found")
    
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    
    try:
        os.rename(origin_path, destination_path)
        return {"message": "File moved successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to move file: {str(e)}")
    
@router.delete("/environment/{env_id}/file")
async def delete_environment_file(
    env_id: str,
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    file_path = os.path.join(env_path, file_path.lstrip('/'))
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")
    
@router.post("/environment/{env_id}/directory")
async def create_environment_directory(
    env_id: str,
    directory_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    directory_path = os.path.join(env_path, directory_path.lstrip('/'))
    
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        return {"message": "Directory created successfully"}
    else:
        raise HTTPException(status_code=400, detail="Directory already exists")

@router.put("/environment/{env_id}/directory")
async def update_environment_directory(
    env_id: str,
    origin: str,
    destination: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    origin_path = os.path.join(env_path, origin.lstrip('/'))
    destination_path = os.path.join(env_path, destination.lstrip('/'))
    
    if not os.path.exists(origin_path):
        raise HTTPException(status_code=404, detail="Source directory not found")
    
    os.makedirs(destination_path, exist_ok=True)
    
    try:
        for item in os.listdir(origin_path):
            item_path = os.path.join(origin_path, item)
            if os.path.isfile(item_path):
                shutil.move(item_path, os.path.join(destination_path, item))
            else:
                shutil.move(item_path, os.path.join(destination_path, item))
        return {"message": "Directory moved successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to move directory: {str(e)}")

@router.delete("/environment/{env_id}/directory")
async def delete_environment_directory(
    env_id: str,
    directory_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env_path = f"/app/data/{env_id}"
    directory_path = os.path.join(env_path, directory_path.lstrip('/'))
    
    if not os.path.exists(directory_path):
        raise HTTPException(status_code=404, detail="Directory not found")
    
    try:
        shutil.rmtree(directory_path)
        return {"message": "Directory deleted successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete directory: {str(e)}")

@router.post("/environment/{env_id}/layout")
async def save_environment_layout(
    env_id: str,
    layout: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    env.layout = layout
    db.commit()
    return {"message": "Layout saved successfully"}

@router.get("/environment/{env_id}/layout")
async def get_environment_layout(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    return env.layout

@router.post("/terminal/{env_id}")
async def terminal_exec(
    env_id: str,
    command: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return exec_pod(env_id, command)

@router.get("/file/{env_id}/pdf")
async def get_pdf_file(
    env_id: str,
    file_path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env_path = f"/app/data/{env_id}"
    file_path = os.path.join(env_path, file_path.lstrip('/'))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return send_file(file_path, mimetype='application/pdf')

def send_file(file_path: str, mimetype: str):
    return FileResponse(file_path, media_type=mimetype)

@router.post("/environment")
async def get_environment(
    is_group: bool,
    assign_id: str,
    group_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    core_v1 = client.CoreV1Api()
    newly_created = False
    env = check_environment(assign_id, current_user.id if not is_group else group_id, is_group, db)
    if not env:
        # create environment
        if is_group:
            env = Environment(assignment_id=assign_id, group_id=group_id, is_collaborative=True)
        else:
            env = Environment(assignment_id=assign_id, user_id=current_user.id, is_collaborative=False)
        db.add(env)
        db.commit()
        db.refresh(env)
        newly_created = True
    env_id = env.id
    create_pod(core_v1, env_id)
    if newly_created:
        assign = db.query(Assignment).filter(Assignment.id == assign_id).first()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
        files = assign.files
        for file in files:
            file_obj = db.query(File).filter(File.id == file).first()
            file_name = file_obj.file_name
            file_path = file_obj.file_path
            file_content = file_obj.content
            os.makedirs(f"/app/data/{env_id}/{file_path}", exist_ok=True)
            with open(f"/app/data/{env_id}/{file_path}/{file_name}", "w") as f:
                f.write(file_content)
    return env_id

def check_environment(env_id: str, id: str, is_group: bool, db: Session = Depends(get_db)):
    if is_group:
        env = db.query(Environment).filter(Environment.id == env_id, Environment.group_id == id, Environment.is_collaborative == True).first()
    else:
        env = db.query(Environment).filter(Environment.id == env_id, Environment.user_id == id, Environment.is_collaborative == False).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    return env

# TODO: add auth check
def check_environment_auth(env_id: str, user_id: str, is_group: bool, db: Session = Depends(get_db)):
    pass