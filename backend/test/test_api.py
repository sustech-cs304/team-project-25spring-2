from fastapi.testclient import TestClient
from datetime import timedelta
import random
import string

from app.main import app
from app.auth.utils import create_access_token

client = TestClient(app)


# Helper functions
def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def random_email() -> str:
    return f"{random_string()}@example.com"


def create_test_user(is_teacher: bool = False) -> dict:
    user_data = {
        "user_id": random_email(),
        "name": random_string(),
        "password": "testpassword123",
        "is_teacher": is_teacher,
    }
    return user_data


def get_auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# Authentication tests
def test_register_user():
    user_data = create_test_user()
    response = client.post("/api/register", json=user_data)
    assert response.status_code == 201
    assert response.json()["user_id"] == user_data["user_id"]
    assert response.json()["name"] == user_data["name"]
    assert "password" not in response.json()


def test_login_success():
    # First register a user
    user_data = create_test_user()
    client.post("/api/register", json=user_data)

    # Then try to login
    response = client.post(
        "/api/login",
        json={"user_id": user_data["user_id"], "password": user_data["password"]},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_credentials():
    # Test with wrong password
    user_data = create_test_user()
    client.post("/api/register", json=user_data)

    response = client.post(
        "/api/login",
        json={"user_id": user_data["user_id"], "password": "wrongpassword"},
    )
    assert response.status_code == 401

    # Test with non-existent user
    response = client.post(
        "/api/login",
        json={"user_id": "nonexistent@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_whoami_authenticated():
    # Register and login
    user_data = create_test_user()
    client.post("/api/register", json=user_data)
    login_response = client.post(
        "/api/login",
        json={"user_id": user_data["user_id"], "password": user_data["password"]},
    )
    token = login_response.json()["access_token"]

    # Test whoami endpoint
    headers = get_auth_headers(token)
    response = client.get("/api/whoami", headers=headers)
    assert response.status_code == 200
    assert "user_id" in response.json()
    assert "name" in response.json()
    assert "is_teacher" in response.json()


def test_whoami_unauthenticated():
    response = client.get("/api/whoami")
    assert response.status_code == 403


def test_whoami_invalid_token():
    headers = get_auth_headers("invalid_token")
    response = client.get("/api/whoami", headers=headers)
    assert response.status_code == 401


def test_logout():
    # Register and login
    user_data = create_test_user()
    client.post("/api/register", json=user_data)
    login_response = client.post(
        "/api/login",
        json={"user_id": user_data["user_id"], "password": user_data["password"]},
    )
    token = login_response.json()["access_token"]

    # Test logout
    headers = get_auth_headers(token)
    response = client.post("/api/logout", headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"

    # Verify token is still valid after logout (since we're using JWT)
    response = client.get("/api/whoami", headers=headers)
    assert response.status_code == 200


def test_protected_endpoints():
    # Register and login
    user_data = create_test_user()
    client.post("/api/register", json=user_data)
    login_response = client.post(
        "/api/login",
        json={"user_id": user_data["user_id"], "password": user_data["password"]},
    )
    token = login_response.json()["access_token"]
    headers = get_auth_headers(token)

    # Test slides endpoint
    response = client.get("/api/slides", headers=headers)
    assert response.status_code == 200

    # Test materials endpoint
    response = client.get("/api/materials", headers=headers)
    assert response.status_code == 200

    # Test notes endpoint
    response = client.get("/api/notes", headers=headers)
    assert response.status_code == 200


def test_teacher_specific_endpoints():
    # Register and login as teacher
    teacher_data = create_test_user(is_teacher=True)
    client.post("/api/register", json=teacher_data)
    login_response = client.post(
        "/api/login",
        json={"user_id": teacher_data["user_id"], "password": teacher_data["password"]},
    )
    teacher_token = login_response.json()["access_token"]
    teacher_headers = get_auth_headers(teacher_token)

    # Test teacher-specific endpoints
    response = client.post(
        "/api/materials",
        headers=teacher_headers,
        json={"title": "Test Material", "content": "Test Content"},
    )
    assert response.status_code == 201
    assert response.json()["material_name"] == "Test Material"
    assert response.json()["data"] == "Test Content"

    # Register and login as student
    student_data = create_test_user(is_teacher=False)
    client.post("/api/register", json=student_data)
    login_response = client.post(
        "/api/login",
        json={"user_id": student_data["user_id"], "password": student_data["password"]},
    )
    student_token = login_response.json()["access_token"]
    student_headers = get_auth_headers(student_token)

    # Test teacher-specific endpoints as student
    response = client.post(
        "/api/materials",
        headers=student_headers,
        json={"title": "Test Material", "content": "Test Content"},
    )
    assert response.status_code == 403


def test_token_expiration():
    # Create an expired token
    expired_token = create_access_token(
        data={"sub": "test@example.com"}, expires_delta=timedelta(minutes=-1)
    )
    headers = get_auth_headers(expired_token)
    response = client.get("/api/whoami", headers=headers)
    assert response.status_code == 401
