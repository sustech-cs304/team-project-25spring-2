# app/main.py
from fastapi import FastAPI

from app.db import Base, engine  
from app.models import assignment, bookmarklist, code_snippet, comment, course, material, note, section, user

from app.slide.comment import router as comment_router

app = FastAPI()

app.include_router(comment_router, tags=["comments"])

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Hello World"}