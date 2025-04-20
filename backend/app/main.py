# app/main.py
from fastapi import FastAPI

from app.db import Base, engine
from app.models import *

from app.slide.comment import router as comment_router
from app.slide.material import router as material_router
from app.slide.note import router as note_router
from app.slide.code_snippet import router as code_snippet_router
from app.slide.bookmarklist import router as bookmarklist_router
from app.auth import router as auth_router

app = FastAPI()

app.include_router(comment_router, tags=["comments"], prefix="/api")
app.include_router(material_router, tags=["materials"], prefix="/api")
app.include_router(note_router, tags=["notes"], prefix="/api")
app.include_router(code_snippet_router, tags=["code_snippets"], prefix="/api")
app.include_router(bookmarklist_router, tags=["bookmarklists"], prefix="/api")
app.include_router(auth_router, tags=["auth"], prefix="/api")


@app.on_event("startup")
def startup():
    Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


@app.get("/api")
async def root():
    return {"message": "Hello World"}
