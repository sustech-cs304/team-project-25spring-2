from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_headers():
    # Replace with your actual authentication logic or mock
    return {"Authorization": "Bearer testtoken"}

def test_create_file():
    response = client.post(
        "/file",
        headers=get_auth_headers(),
        data={
            "file_name": "test.pdf",
            "file_path": "assignments/test.pdf",
            "assignment_id": "test-assignment-id"
        },
        files={"file": ("test.pdf", b"PDF content")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "file_id" in data
    assert data["message"] == "File created successfully"

def test_update_file():
    # First, create a file
    create_resp = client.post(
        "/file",
        headers=get_auth_headers(),
        data={
            "file_name": "update.txt",
            "file_path": "assignments/update.txt",
            "assignment_id": "test-assignment-id"
        },
        files={"file": ("update.txt", b"Initial content")},
    )
    file_id = create_resp.json()["file_id"]

    # Now, update the file
    update_resp = client.put(
        f"/file/{file_id}",
        headers=get_auth_headers(),
        data={
            "file_name": "update2.txt",
            "file_path": "assignments/update2.txt",
        },
        files={"file": ("update2.txt", b"Updated content")},
    )
    assert update_resp.status_code == 200
    updated = update_resp.json()
    assert updated["file_name"] == "update2.txt"

def test_delete_file():
    # First, create a file
    create_resp = client.post(
        "/file",
        headers=get_auth_headers(),
        data={
            "file_name": "delete.txt",
            "file_path": "assignments/delete.txt",
            "assignment_id": "test-assignment-id"
        },
        files={"file": ("delete.txt", b"Delete me")},
    )
    file_id = create_resp.json()["file_id"]

    # Now, delete the file
    delete_resp = client.delete(
        f"/file/{file_id}",
        headers=get_auth_headers(),
    )
    assert delete_resp.status_code == 200
    deleted = delete_resp.json()
    assert deleted["is_deleted"] is True