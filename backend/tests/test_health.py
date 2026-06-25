from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_aggregated():
    response = client.get("/health")
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

def test_health_storage():
    response = client.get("/health/storage")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_health_cache():
    response = client.get("/health/cache")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
