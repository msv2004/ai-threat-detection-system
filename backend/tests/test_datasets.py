import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from unittest.mock import patch
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers(db_session):
    # Register and login a user to get token
    # Use random email to avoid duplicate user issues
    email = f"user_{uuid4()}@example.com"
    user_data = {"email": email, "password": "password123", "full_name": "Dataset User"}
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def _upload_dummy_dataset(headers, filename="test_data.csv"):
    file_content = b"col1,col2\n1,2\n3,4"
    files = {"file": (filename, file_content, "text/csv")}
    return client.post("/api/v1/datasets/upload", headers=headers, files=files)

@patch("app.services.dataset_service.process_dataset_background_task")
def test_upload_dataset(mock_bg_task, auth_headers):
    response = _upload_dummy_dataset(auth_headers)
    assert response.status_code == 202
    data = response.json()
    assert data["filename"] == "test_data.csv"
    assert data["dataset_type"] == "CSV"
    assert data["status"] == "processing"
    assert mock_bg_task.called

@patch("app.services.dataset_service.process_dataset_background_task")
def test_list_datasets(mock_bg_task, auth_headers):
    _upload_dummy_dataset(auth_headers, "list_test.csv")
    response = client.get("/api/v1/datasets/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["filename"] == "list_test.csv"

@patch("app.services.dataset_service.process_dataset_background_task")
def test_get_dataset(mock_bg_task, auth_headers):
    upload_resp = _upload_dummy_dataset(auth_headers, "get_test.csv")
    dataset_id = upload_resp.json()["id"]
    
    response = client.get(f"/api/v1/datasets/{dataset_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == dataset_id
    assert data["filename"] == "get_test.csv"

@patch("app.services.dataset_service.process_dataset_background_task")
def test_delete_dataset(mock_bg_task, auth_headers):
    upload_resp = _upload_dummy_dataset(auth_headers, "delete_test.csv")
    dataset_id = upload_resp.json()["id"]
    
    response = client.delete(f"/api/v1/datasets/{dataset_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify it's deleted
    get_resp = client.get(f"/api/v1/datasets/{dataset_id}", headers=auth_headers)
    assert get_resp.status_code == 404
