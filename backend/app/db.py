# app/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

db_port = 5432
DATABASE_URL = f"postgresql://serendipity:chenmingzhi2004@localhost:{db_port}/cs304"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
