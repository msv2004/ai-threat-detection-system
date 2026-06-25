from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_has_request_id():
    response = client.get("/health")
    assert response.status_code == 200
    assert "x-request-id" in response.headers
    data = response.json()
    assert data["status"] == "ok"

def test_health_database_has_request_id():
    response = client.get("/health/database")
    assert response.status_code == 200
    assert "x-request-id" in response.headers

def test_not_found_exception_format():
    # Trigger a 404
    response = client.get("/non-existent-route")
    assert response.status_code == 404
    assert "x-request-id" in response.headers
    data = response.json()
    assert "error" in data
    assert "request_id" in data
    assert data["request_id"] == response.headers["x-request-id"]

def test_validation_error_format():
    # Trigger a 422
    # Assuming /api/v1/auth/login requires a body
    response = client.post("/api/v1/auth/login", json={})
    assert response.status_code == 422
    assert "x-request-id" in response.headers
    data = response.json()
    assert "error" in data
    assert "details" in data
    assert "request_id" in data
    assert data["request_id"] == response.headers["x-request-id"]
