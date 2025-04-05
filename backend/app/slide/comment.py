from fastapi import APIRouter

router = APIRouter()

@router.get("/comments")
async def get_comments():
    return {"message": "Get comments"}
         