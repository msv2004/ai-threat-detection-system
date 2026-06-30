import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers(db_session):
    # Register and login a user to get token
    email = f"user_{uuid4()}@example.com"
    user_data = {"email": email, "password": "password123", "full_name": "Health User"}
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_health_aggregated_public():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "components" not in data

def test_health_aggregated_authenticated(auth_headers):
    response = client.get("/health", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "components" in data
    assert "database" in data["components"]
    assert "model" in data["components"]
    assert "storage" in data["components"]
    assert "cache" in data["components"]

def test_health_database():
    response = client.get("/health/database")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_health_storage(auth_headers):
    response = client.get("/health/storage", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_health_cache(auth_headers):
    response = client.get("/health/cache", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
