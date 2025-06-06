from fastapi import APIRouter, Depends, HTTPException, WebSocket, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.group import Group
from app.models.environment import Environment
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.file import FileDB
from typing import Dict, Any
from kubernetes import config, client
from app.auth.middleware import get_current_user
from .api import *
import os
import websockets
import asyncio
import shutil
import base64
import httpx

router = APIRouter()
if os.environ.get("ENVNAME") == "k3s":
    config.load_incluster_config()
else:
    config.load_kube_config()


# Establish WebSocket connection to the environment
@router.websocket("/environment/{env_id}/wsurl/{file_path:path}")
async def websocket_endpoint(
    websocket: WebSocket,
    env_id: str,
    file_path: str,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    async def forward_to_pod(source: WebSocket, destination):
        try:
            while True:
                message = await source.receive_bytes()
                await destination.send(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error in forward_to_pod: {e}")
            
    async def forward_from_pod(source, destination: WebSocket):
        try:
            while True:
                message = await source.recv()
                await destination.send_bytes(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error in forward_from_pod: {e}")
    
    await websocket.accept()
    
    port = 1234 # Default port for WebSocket connection
    websocket_url = f"{env.wsUrl}:{port}{file_path}"
    print(f"[Debug] Connecting to WebSocket URL: {websocket_url}")
        
    try:
        async with websockets.connect(websocket_url) as internal_ws:
            client_to_internal = asyncio.create_task(forward_to_pod(websocket, internal_ws))
            internal_to_client = asyncio.create_task(forward_from_pod(internal_ws, websocket))
            
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
        
@router.post("/terminal/{env_id}/init")
async def init_terminal(
    env_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{env.wsUrl}:4000/init")
            response.raise_for_status()
            data = response.json()
            pid = data.get("pid")
            if not pid:
                raise HTTPException(status_code=500, detail="Failed to initialize terminal")
    except Exception as e:
        print(f"[init_terminal] error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize terminal")

    return {"message": "Terminal initialized successfully", "pid": pid}
        
@router.websocket("/terminal/{env_id}/{pid}")
async def terminal_endpoint(
    websocket: WebSocket,
    env_id: str,
    pid: str,
    db: Session = Depends(get_db),
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    await websocket.accept()
    
    async def forward_to_pod(source: WebSocket, destination):
        try:
            while True:
                message = await source.receive_text()
                await destination.send(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error in forward_to_pod: {e}")
            
    async def forward_from_pod(source, destination: WebSocket):
        try:
            while True:
                message = await source.recv()
                await destination.send_text(message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"Error in forward_from_pod: {e}")
    
    port = 4000 # Default port for WebSocket connection
    websocket_url = f"{env.wsUrl}:{port}/?pid={pid}"
    print(f"[Debug] Connecting to WebSocket URL: {websocket_url}")
        
    try:
        async with websockets.connect(websocket_url) as internal_ws:
            client_to_internal = asyncio.create_task(forward_to_pod(websocket, internal_ws))
            internal_to_client = asyncio.create_task(forward_from_pod(internal_ws, websocket))
            
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
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
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
    file_path: str = Form(...),
    file_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    if env.is_collaborative:
        group_id = env.group_id
        group = db.query(Group).filter(Group.group_id == group_id).first()
        if not group or current_user.user_id not in group.users:
            raise HTTPException(status_code=403, detail="You are not a member of this group")
    else:
        if env.user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You are not the owner of this environment")
    
    env_path = f"/app/data/{env_id}/{file_path}"
    os.makedirs(os.path.dirname(env_path), exist_ok=True)
    with open(env_path + "/" + file_name, "w") as f:
        f.write("")
    return {
        "message": "File created successfully",
    }

@router.post("/environment/{env_id}/directory")
async def create_environment_directory(
    env_id: str,
    directory_path: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    if env.is_collaborative:
        group_id = env.group_id
        group = db.query(Group).filter(Group.group_id == group_id).first()
        if not group or current_user.user_id not in group.users:
            raise HTTPException(status_code=403, detail="You are not a member of this group")
    else:
        if env.user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You are not the owner of this environment")
    
    env_path = f"/app/data/{env_id}"
    directory_path = os.path.join(env_path, directory_path.lstrip('/'))
    
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        return {"message": "Directory created successfully"}
    else:
        raise HTTPException(status_code=400, detail="Directory already exists")


@router.post("/environment/{env_id}/move")
async def update_environment_path(
    env_id: str,
    from_uri: str = Form(...),  # File or a directory
    to_uri: str = Form(...),    # Always a directory
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")

    if env.is_collaborative:
        group_id = env.group_id
        group = db.query(Group).filter(Group.group_id == group_id).first()
        if not group or current_user.user_id not in group.users:
            raise HTTPException(status_code=403, detail="You are not a member of this group")
    else:
        if env.user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You are not the owner of this environment")
    
    env_path = f"/app/data/{env_id}"
    origin_path = os.path.join(env_path, from_uri.lstrip('/'))
    destination_dir = os.path.join(env_path, to_uri.lstrip('/'))

    if not os.path.exists(origin_path):
        raise HTTPException(status_code=404, detail="Source path not found")
    if not os.path.isdir(destination_dir):
        os.makedirs(destination_dir, exist_ok=True)

    try:
        if os.path.isfile(origin_path):
            dest_path = os.path.join(destination_dir, os.path.basename(origin_path))
            os.rename(origin_path, dest_path)
        elif os.path.isdir(origin_path):
            dir_name = os.path.basename(os.path.normpath(origin_path))
            dest_path = os.path.join(destination_dir, dir_name)
            if os.path.exists(dest_path):
                raise HTTPException(status_code=400, detail="Destination directory already exists")
            os.rename(origin_path, dest_path)
        else:
            raise HTTPException(status_code=400, detail="Source is neither file nor directory")
        return {"message": "Move operation successful"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to move: {str(e)}")
    
@router.delete("/environment/{env_id}/delete")
async def delete_environment_path(
    env_id: str,
    uri: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    env = db.query(Environment).filter(Environment.environment_id == env_id).first()
    if not env:
        raise HTTPException(status_code=404, detail="Environment not found")
    
    if env.is_collaborative:
        group_id = env.group_id
        group = db.query(Group).filter(Group.group_id == group_id).first()
        if not group or current_user.user_id not in group.users:
            raise HTTPException(status_code=403, detail="You are not a member of this group")
    else:
        if env.user_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="You are not the owner of this environment")
    
    env_path = f"/app/data/{env_id}"
    file_path = os.path.join(env_path, uri.lstrip('/'))
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Path not found")
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete: {str(e)}")

@router.post("/file/{env_id}/pdf")
async def get_pdf_file(
    env_id: str,
    file_path: str = Form(...),
):
    env_path = f"/app/data/{env_id}"
    file_path = os.path.join(env_path, file_path.lstrip('/'))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type='application/pdf',
        filename=os.path.basename(file_path)
    )
    
@router.get("/environment/{course_id}/{assign_id}")
async def get_environments(
    course_id: str,
    assign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # This is a teacher account
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assign = db.query(Assignment).filter(Assignment.assignment_id == assign_id).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    is_group = assign.is_group_assign
    
    envs = db.query(Environment).filter(
        Environment.assignment_id == assign_id,
        Environment.course_id == course_id,
        Environment.is_collaborative == is_group
    ).all()
    
    return {
        "message": "Environments retrieved successfully",
        "environments": [
            {
                "env_id": env.environment_id,
                "users": [
                    {
                        "name": user.name,
                        "avatar": user.photo,
                        "user_id": user.user_id
                    } for user in db.query(User).filter(
                        (User.user_id == env.user_id) | (User.user_id.in_(db.query(Group).filter(Group.group_id == env.group_id).first().users if env.group_id else []))
                    ).all()
                ],
                "is_group_assign": env.is_collaborative,
                "create_time": env.created_at.isoformat(),
                "last_update_time": env.updated_at.isoformat()
            } for env in envs
        ]
    }

@router.post("/environment")
async def get_environment(
    course_id: str = Form(...),
    assign_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    core_v1 = client.CoreV1Api()
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    assign = db.query(Assignment).filter(Assignment.assignment_id == assign_id).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if the user is in a group for the course
    is_group = assign.is_group_assign
    if is_group:
        groups = db.query(Group).filter(Group.course_id == course_id).all()
        group_id = None
        for group in groups:
            if current_user.user_id in group.users:
                group_id = group.group_id
                break
        if not group_id:
            return {
                "message": "Require group",
                "group_required": True
            }
    else:
        group_id = None
        
    # Check if the environment already exists
    env = check_environment(assign_id, current_user.user_id if not is_group else group_id, is_group, db)
    
    newly_created = False
    if not env:
        if is_group:
            env = Environment(course_id=course_id, assignment_id=assign_id, group_id=group_id, is_collaborative=True)
        else:
            env = Environment(course_id=course_id, assignment_id=assign_id, user_id=current_user.user_id, is_collaborative=False)
        db.add(env)
        db.commit()
        db.refresh(env)
        name = create_pod(core_v1, env.environment_id)
        env.wsUrl = f"ws://{name}" # Set the WebSocket URL to the pod name
        db.add(env)
        db.commit()
        db.refresh(env)
        newly_created = True
        
    env_id = env.environment_id
    
    if newly_created:
        assign = db.query(Assignment).filter(Assignment.assignment_id == assign_id).first()
        if not assign:
            raise HTTPException(status_code=404, detail="Assignment not found")
        files = assign.files
        for file in files:
            file_obj = db.query(FileDB).filter(FileDB.file_id == file).first()
            file_name = file_obj.file_name
            file_path = file_obj.file_path
            file_content = base64.b64decode(file_obj.content)  # Decode the base64 content from 'data'
            os.makedirs(f"/app/data/{env_id}/{file_path}", exist_ok=True)
            with open(f"/app/data/{env_id}/{file_path}/{file_name}", "wb") as f:
                f.write(file_content)
    return {
        "message": "Environment created successfully",
        "environment_id": env_id
    }

def check_environment(assign_id: str, id: str, is_group: bool, db: Session = Depends(get_db)):
    if is_group:
        env = db.query(Environment).filter(Environment.assignment_id == assign_id, Environment.group_id == id, Environment.is_collaborative == True).first()
    else:
        env = db.query(Environment).filter(Environment.assignment_id == assign_id, Environment.user_id == id, Environment.is_collaborative == False).first()
    return env