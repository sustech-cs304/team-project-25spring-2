# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.db import Base, engine
from app.models import *

from app.ai import router as ai_router
from app.auth import router as auth_router
from app.coding import router as coding_router
from app.slides.assignment import router as assignment_router
from app.slides.bookmarklist import router as bookmarklist_router
from app.slides.code_snippet import router as code_snippet_router
from app.slides.course import router as course_router
from app.slides.comment import router as comment_router
from app.slides.group import router as group_router
from app.slides.material import router as material_router
from app.slides.note import router as note_router
from app.slides.section import router as section_router
from app.slides.user import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: setup database
    Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: no cleanup needed


app = FastAPI(
    title="PeachIDE API",
    description="API for the PeachIDE platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Register routers
app.include_router(ai_router, tags=["ai"], prefix="/api")
app.include_router(assignment_router, tags=["assignments"], prefix="/api")
app.include_router(bookmarklist_router, tags=["bookmarklists"], prefix="/api")
app.include_router(code_snippet_router, tags=["code_snippets"], prefix="/api")
app.include_router(coding_router, tags=["coding"], prefix="/api")
app.include_router(course_router, tags=["courses"], prefix="/api")
app.include_router(comment_router, tags=["comments"], prefix="/api")
app.include_router(group_router, tags=["groups"], prefix="/api")
app.include_router(material_router, tags=["materials"], prefix="/api")
app.include_router(note_router, tags=["notes"], prefix="/api")
app.include_router(section_router, tags=["sections"], prefix="/api")
app.include_router(user_router, tags=["users"], prefix="/api")
app.include_router(
    auth_router,
    tags=["authentication"],
    prefix="/api",
    responses={401: {"description": "Unauthorized"}},
)


@app.get("/api", tags=["health"])
async def root():
    return {"message": "Hello World"}
