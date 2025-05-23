# app/models/bookmarklist.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from app.db import Base


class BookmarkList(Base):
    __tablename__ = "bookmark_lists"

    list_id = Column(UUID, primary_key=True, index=True)
    material_id = Column(UUID, ForeignKey("materials.material_id"), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    page = Column(Integer, index=True)
    bookmark_list = Column(ARRAY(Integer), index=True)
