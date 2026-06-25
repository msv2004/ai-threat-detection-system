import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers(db_session):
    email = f"analyst_{uuid4()}@example.com"
    user_data = {"email": email, "password": "password123", "full_name": "Analytics Analyst"}
    
    # Register and login user to get token and populate login event
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_analytics_endpoints_empty(auth_headers):
    # 1. Overview
    resp = client.get("/api/v1/analytics/overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_predictions"] == 0
    assert data["total_threats"] == 0
    assert data["total_datasets"] == 0
    assert data["total_training_jobs"] == 0
    assert data["average_latency"] == 0.0
    assert data["active_model"] is None

    # 2. Threats Breakdown
    resp = client.get("/api/v1/analytics/threats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_threats"] == 0
    assert data["by_severity"]["Critical"] == 0
    assert len(data["recent_threats"]) == 0

    # 3. Timeline
    resp = client.get("/api/v1/analytics/threats/timeline", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["range"] == "this_week"
    assert len(data["timeline"]) > 0

    # 4. Models
    resp = client.get("/api/v1/analytics/models", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_models"] == 0
    assert data["active_model_metrics"] is None

    # 5. Monitoring
    resp = client.get("/api/v1/analytics/models/monitoring", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["prediction_count"] == 0
    assert data["failure_count"] == 0

    # 6. Datasets
    resp = client.get("/api/v1/analytics/datasets", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_datasets"] == 0
    assert data["total_size_bytes"] == 0

    # 7. Audit Logs
    resp = client.get("/api/v1/analytics/audit-logs", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["event_type"] == "user_login"
