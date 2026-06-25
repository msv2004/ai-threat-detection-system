import pytest
import os
import uuid
from fastapi.testclient import TestClient
from uuid import uuid4
from unittest.mock import patch
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_db_sessions(db_session):
    with patch("app.services.preprocessing_tasks.SessionLocal", return_value=db_session):
        yield

@pytest.fixture
def auth_headers(db_session):
    email = f"user_{uuid4()}@example.com"
    user_data = {"email": email, "password": "password123", "full_name": "Preprocessing User"}
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def dummy_dataset_id(auth_headers, db_session):
    # Upload a dummy dataset for preprocessing
    # The dataset has a target column 'label', a numeric feature 'age', and a categorical 'color'
    csv_content = b"age,color,label\n25,red,0\n,blue,1\n30,red,0\n40,,1\n25,red,0"
    files = {"file": ("test_preprocessing.csv", csv_content, "text/csv")}
    
    # We mock the background task so it doesn't process immediately, we just need the DB record
    with patch("app.services.dataset_service.process_dataset_background_task"):
        response = client.post("/api/v1/datasets/upload", headers=auth_headers, files=files)
        
    dataset_id = response.json()["id"]
    
    # The dataset status will be "processing" by default. We need it to be "ready" to start a job.
    # We will manually set it to "ready" using the existing db_session fixture
    from app.models.dataset import Dataset
    dataset = db_session.query(Dataset).filter(Dataset.id == uuid.UUID(dataset_id)).first()
    dataset.status = "ready"
    dataset.file_path = os.path.abspath(f"datasets/{dataset.uploaded_by}/test_preprocessing.csv")
    
    # Actually save the file so preprocessor can read it
    os.makedirs(os.path.dirname(dataset.file_path), exist_ok=True)
    with open(dataset.file_path, "wb") as f:
        f.write(csv_content)

    db_session.commit()

    return dataset_id

def test_start_preprocessing_job(auth_headers, dummy_dataset_id):
    payload = {
        "dataset_id": str(dummy_dataset_id),
        "target_column": "label",
        "missing_value_strategy": "mean",
        "scaling_strategy": "standard",
        "encoding_strategy": "one-hot",
        "test_size": 0.2,
        "random_state": 42
    }
    
    with patch("app.services.preprocessing_service.run_preprocessing_job") as mock_job:
        response = client.post("/api/v1/preprocessing/start", json=payload, headers=auth_headers)
        
        assert response.status_code == 202
        data = response.json()
        assert data["status"] == "queued"
        assert mock_job.called

def test_preprocessing_pipeline_synchronous(auth_headers, dummy_dataset_id):
    """
    Test the actual preprocessor logic (preprocessor.py) synchronously.
    """
    payload = {
        "dataset_id": str(dummy_dataset_id),
        "target_column": "label",
        "missing_value_strategy": "mean",
        "scaling_strategy": "standard",
        "encoding_strategy": "one-hot",
        "test_size": 0.2,
        "random_state": 42
    }
    
    # Call the API which will trigger the background task synchronously since we won't mock it here
    response = client.post("/api/v1/preprocessing/start", json=payload, headers=auth_headers)
    assert response.status_code == 202
    job_id = response.json()["id"]

    # In FastAPI TestClient, background tasks run synchronously after the response is returned!
    # So the job should now be completed in the DB.
    
    job_resp = client.get(f"/api/v1/preprocessing/jobs/{job_id}", headers=auth_headers)
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert job_data["status"] == "completed"

    # Check that report is generated
    report_resp = client.get(f"/api/v1/preprocessing/report/{dummy_dataset_id}", headers=auth_headers)
    assert report_resp.status_code == 200
    report_data = report_resp.json()
    assert "age" in report_data["numeric_features"]
    assert "color" in report_data["categorical_features"]
    assert report_data["duplicate_rows"] == 1
