import os
import sys
import pytest

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)


from app.db import Base, engine

@pytest.fixture(autouse=True)
def run_around_tests():
    # Startup: setup database
    Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)