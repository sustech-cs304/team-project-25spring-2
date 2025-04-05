# app/models/bookmarklist.py
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from app.db import Base

class BookmarkList(Base):
    __tablename__ = "bookmark_lists"

    bookmarklist_id = Column(String, primary_key=True, index=True)
    material_id = Column(String, index=True)
    list_id = Column(String, index=True)
    user_id = Column(String, index=True)
    bookmark_list = Column(ARRAY(Integer), index=True)  