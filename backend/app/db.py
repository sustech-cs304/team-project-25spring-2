# app/db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

db_port = 5432
K8S_DB_HOST = "postgres"
if os.environ.get("envname") == "k8s":
    DATABASE_URL = f"postgresql://{os.environ.get('POSTGRES_USER')}:{os.environ.get('POSTGRES_PASSWORD')}@{K8S}:{K8S_DB_HOST}/{os.environ.get('POSTGRES_DB')}"
else:
    DATABASE_URL = f"postgresql://serendipity:chenmingzhi2004@localhost:{db_port}/cs304"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
