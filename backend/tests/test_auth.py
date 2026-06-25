from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert data["role"]["name"] == "Viewer"

def test_register_duplicate():
    client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "anotherpassword"}
    )
    assert response.status_code == 400
    assert response.json()["error"] == "Email is already registered."

def test_login_success():
    client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "securepassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password():
    client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "Incorrect email or password."

def test_get_me():
    client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "securepassword"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"]["name"] == "Viewer"

def test_token_refresh_and_logout():
    client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepassword"}
    )
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "securepassword"}
    )
    refresh_token = login_resp.json()["refresh_token"]
    
    # Perform refresh
    refresh_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    
    # Try reusing old refresh token (should fail due to revocation rotation)
    old_refresh_resp = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert old_refresh_resp.status_code == 401
    
    # Logout using new refresh token
    logout_resp = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": new_tokens["refresh_token"]}
    )
    assert logout_resp.status_code == 200
    assert logout_resp.json()["detail"] == "Successfully logged out."
