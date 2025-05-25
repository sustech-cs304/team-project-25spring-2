from fastapi import APIRouter, Form, Response, BackgroundTasks
from fastapi import APIRouter, Depends, Body
from fastapi.responses import StreamingResponse
from openai import OpenAI
from sqlalchemy.orm import Session
from app.models.chat import Chat
from app.models.material import Material
from app.models.user import User
from app.auth.middleware import get_current_user
from app.db import get_db, SessionLocal
import base64
import os
import io
import json
import uuid


router = APIRouter()


client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)


@router.get("/chat")
async def chat(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    chats = db.query(Chat).all()
    if not chats:
        return []
    else:
        return [
            {
                "chat_id": chat.chat_id,
                "user_id": chat.user_id,
                "title": chat.title,
            }
            for chat in chats
        ]


@router.get("/chat/{chat_id}")
async def get_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        return None

    return {
        "chat_id": chat.chat_id,
        "user_id": chat.user_id,
        "material_id": chat.material_id,
        "title": chat.title,
        "messages": chat.messages,
    }


@router.post("/chat")
async def create_chat(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    chat_id = str(uuid.uuid4())
    chat = Chat(
        chat_id=chat_id,
        user_id=current_user.user_id,
        material_id=None,
        title="New Chat",
        messages=[],
    )

    db.add(chat)
    db.commit()
    db.refresh(chat)

    return {"chat_id": chat_id}


@router.post("/chat/{chat_id}/name")
async def update_chat_name(
    chat_id: str,
    title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        return None

    chat.title = title
    db.commit()
    db.refresh(chat)

    return {
        "chat_id": chat.chat_id,
        "user_id": chat.user_id,
        "material_id": chat.material_id,
        "title": chat.title,
        "messages": (
            [
                {"role": message.split(":")[0], "content": message.split(":")[1]}
                for message in chat.messages
            ]
            if chat.messages
            else []
        ),
    }


@router.delete("/chat/{chat_id}")
async def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        return {"message": "Chat not found"}

    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted successfully"}


@router.post("/chat/{chat_id}/message")
async def send_message(
    chat_id: str,
    background_tasks: BackgroundTasks,
    message: str = Form(...),
    material_id: str = Form(None),
    db: Session = Depends(get_db),
):
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        return None

    # Update material_id if provided
    if material_id:
        chat.material_id = material_id

    # Add user message
    if not chat.messages:
        messages = []
    else:
        messages = chat.messages

    # Handle material file if needed
    if chat.material_id:
        material = (
            db.query(Material).filter(Material.material_id == chat.material_id).first()
        )
        if material and not any(
            (
                "fileid://" in msg["content"]
                if isinstance(msg, dict) and "content" in msg
                else False
            )
            for msg in messages
        ):
            # Extract base64 data from the data URL
            base64_data = material.data
            if base64_data.startswith("data:application/pdf;base64,"):
                base64_data = base64_data.split(",", 1)[1]
            pdf_bytes = base64.b64decode(base64_data)
            file_like = io.BytesIO(pdf_bytes)
            file_like.name = "material.pdf"
            file_object = client.files.create(
                file=file_like,
                purpose="file-extract",
            )
            file_id = file_object.id
            messages.append(
                {
                    "role": "system",
                    "content": f"fileid://{file_id}",
                }
            )

    # Add user message to chat
    messages.append(
        {
            "role": "user",
            "content": message,
        }
    )

    # Get API response
    response = client.chat.completions.create(
        model="qwen-long",
        messages=messages,
        stream=True,
        stream_options={"include_usage": True},
    )

    # Create holder for the full assistant message
    full_assistant_message = ""

    # Simple streaming function that collects the complete message
    def stream_and_collect():
        nonlocal full_assistant_message
        for chunk in response:
            # Skip invalid chunks
            if not hasattr(chunk, "choices") or not chunk.choices:
                continue

            # Process valid chunks
            if chunk.choices[0].finish_reason != "stop":
                content = chunk.choices[0].delta.content or ""
                full_assistant_message += content
                yield content
            else:
                messages.append(
                    {
                        "role": "assistant",
                        "content": full_assistant_message,
                    }
                )
                print(full_assistant_message, "FULL_ASSISTANT_MESSAGE")

        # Signal end of stream
        yield ""

    def save_chat():
        with SessionLocal() as new_db:
            chat_obj = new_db.query(Chat).filter(Chat.chat_id == chat_id).first()
            if not chat_obj:
                print(f"ERROR: Chat {chat_id} not found in database")
                return
            chat_obj.messages = messages
            new_db.commit()
            new_db.refresh(chat_obj)

    background_tasks.add_task(save_chat)

    # Return streaming response
    return StreamingResponse(stream_and_collect(), media_type="text/event-stream")
