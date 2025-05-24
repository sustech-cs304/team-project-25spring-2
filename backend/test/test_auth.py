import uuid
import random
import string
from fastapi.testclient import TestClient
import pytest
from app.main import app

client = TestClient(app)

from app.db import Base, engine

@pytest.fixture(autouse=True)
def run_around_tests():
    # Startup: setup database
    Base.metadata.reflect(bind=engine)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def generate_random_string(length=8):
    """Generate a random string of specified length"""
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def generate_random_user_data():
    """Generate random user data for testing"""
    user_id = f"1221" + str(random.randint(1000, 9999))
    name = f"Test User {generate_random_string(4)}"
    password = f"password"
    email = f"test{generate_random_string(4)}@gmail.com"
    return {
        "user_id": user_id,
        "name": name,
        "password": password,
        "is_teacher": random.choice([True, False]),
        "email": email,
    }


def test_user_registration_and_login_flow():
    # Generate random user data
    user_data = generate_random_user_data()

    # Test user registration
    register_response = client.post("/api/register", json=user_data)
    assert register_response.status_code == 201
    assert register_response.json() == {"msg": "User registered successfully"}

    # Test login with correct credentials
    login_response = client.post(
        "/api/login",
        json={"name": user_data["user_id"], "password": user_data["password"]},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "token" in login_data
    assert "user_id" in login_data
    assert login_data["user_id"] == user_data["user_id"]

    # Test whoami endpoint with valid token
    token = login_data["token"]
    whoami_response = client.get(
        "/api/user", headers={"Authorization": f"Bearer {token}"}
    )
    assert whoami_response.status_code == 200
    whoami_data = whoami_response.json()
    assert whoami_data["user_id"] == user_data["user_id"]
    assert whoami_data["name"] == user_data["name"]
    assert whoami_data["is_teacher"] == user_data["is_teacher"]

    # Test logout
    logout_response = client.delete(
        "/api/logout", headers={"Authorization": f"Bearer {token}"}
    )
    assert logout_response.status_code == 200
    assert logout_response.json() == {"message": "Successfully logged out"}

    # Verify token is invalid after logout
    whoami_response = client.get(
        "/api/user", headers={"Authorization": f"Bearer {token}"}
    )
    assert whoami_response.status_code == 401


def test_duplicate_registration():
    # Generate random user data
    user_data = generate_random_user_data()

    # Register first user
    client.post("/api/register", json=user_data)

    # Try to register with same user_id but different other fields
    duplicate_data = user_data.copy()
    duplicate_data["name"] = f"Different {generate_random_string(6)}"
    duplicate_data["password"] = f"password"

    response = client.post("/api/register", json=duplicate_data)
    assert response.status_code == 400
    assert "User ID already registered" in response.json()["detail"]


def test_invalid_login_attempts():
    # Generate random user data
    user_data = generate_random_user_data()

    # Register a user
    client.post("/api/register", json=user_data)

    # Try login with wrong password
    wrong_password = f"Wrong_{generate_random_string(10)}"
    response = client.post(
        "/api/login", json={"name": user_data["user_id"], "password": wrong_password}
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]

    # Try login with non-existent user
    non_existent_user = f"nonexistent_{uuid.uuid4().hex[:8]}"
    response = client.post(
        "/api/login",
        json={
            "name": non_existent_user,
            "password": f"Any_{generate_random_string(10)}",
        },
    )
    assert response.status_code == 401
    assert "Incorrect username or password" in response.json()["detail"]


def test_protected_endpoint_access():
    # Try to access whoami without token
    response = client.get("/api/user")
    assert response.status_code == 403  # HTTPBearer default error

    # Try to access whoami with invalid token
    invalid_token = f"invalid_{uuid.uuid4().hex}"
    response = client.get(
        "/api/user", headers={"Authorization": f"Bearer {invalid_token}"}
    )
    assert response.status_code == 401
