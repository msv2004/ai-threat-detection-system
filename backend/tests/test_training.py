import pytest
import os
import shutil
import uuid
import pandas as pd
import joblib
from fastapi.testclient import TestClient
from uuid import uuid4
from unittest.mock import patch

from app.main import app
from app.models.dataset import Dataset
from app.models.preprocessing import ProcessedDataset
from app.models.training import TrainingJob, TrainedModel

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_db_sessions(db_session):
    with patch("app.services.training_tasks.SessionLocal", return_value=db_session):
        yield


@pytest.fixture
def auth_headers(db_session):
    email = f"user_{uuid4()}@example.com"
    user_data = {"email": email, "password": "password123", "full_name": "Training User"}
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def dummy_processed_dataset_id(auth_headers, db_session):
    # 1. Create a User and Dataset
    # Since we logged in, a user already exists. We fetch the user id.
    # In conftest, the user_repo can find it, but we can query it directly.
    from app.models.user import User
    user = db_session.query(User).order_by(User.id.desc()).first()
    user_id = user.id
    
    # Create raw dataset record
    dataset = Dataset(
        filename="test_raw.csv",
        dataset_type="CSV",
        status="ready",
        size_bytes=1000,
        file_path=os.path.abspath(f"datasets/{user_id}/test_raw.csv"),
        uploaded_by=user_id
    )
    db_session.add(dataset)
    db_session.commit()
    
    # 2. Create mock Parquet files and Preprocessor artifact
    processed_dir = os.path.abspath(f"datasets/{user_id}/processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    job_id = uuid4()
    train_features_path = os.path.join(processed_dir, f"{job_id}_X_train.parquet")
    train_labels_path = os.path.join(processed_dir, f"{job_id}_y_train.parquet")
    test_features_path = os.path.join(processed_dir, f"{job_id}_X_test.parquet")
    test_labels_path = os.path.join(processed_dir, f"{job_id}_y_test.parquet")
    preprocessor_path = os.path.join(processed_dir, f"{job_id}_preprocessor.joblib")
    
    # Save dummy data
    X_train = pd.DataFrame({"feature1": [1.0, 2.0, 3.0, 4.0, 5.0], "feature2": [5.0, 4.0, 3.0, 2.0, 1.0]})
    y_train = pd.Series([0, 1, 0, 1, 0], name="label")
    X_test = pd.DataFrame({"feature1": [1.5, 2.5], "feature2": [4.5, 3.5]})
    y_test = pd.Series([0, 1], name="label")
    
    X_train.to_parquet(train_features_path, index=False)
    y_train.to_frame().to_parquet(train_labels_path, index=False)
    X_test.to_parquet(test_features_path, index=False)
    y_test.to_frame().to_parquet(test_labels_path, index=False)
    
    # Save dummy preprocessor state
    preprocessor_state = {
        "scaling_strategy": "standard",
        "encoding_strategy": "one-hot",
        "target_column": "label",
        "categorical_cols": [],
        "numeric_cols": ["feature1", "feature2"],
        "scaler": None,
        "label_encoders": {},
        "feature_names": ["feature1", "feature2"]
    }
    joblib.dump(preprocessor_state, preprocessor_path)
    
    # Create ProcessedDataset record
    processed = ProcessedDataset(
        original_dataset_id=dataset.id,
        job_id=job_id,
        train_features_path=train_features_path,
        train_labels_path=train_labels_path,
        test_features_path=test_features_path,
        test_labels_path=test_labels_path,
        preprocessor_path=preprocessor_path,
        train_samples=len(X_train),
        test_samples=len(X_test)
    )
    db_session.add(processed)
    db_session.commit()
    db_session.refresh(processed)
    
    yield processed.id
    
    # Clean up generated files
    shutil.rmtree(os.path.abspath(f"datasets/{user_id}"), ignore_errors=True)
    shutil.rmtree(os.path.abspath(f"models/{user_id}"), ignore_errors=True)


def test_start_training_job_success(auth_headers, dummy_processed_dataset_id):
    payload = {
        "processed_dataset_id": str(dummy_processed_dataset_id),
        "algorithm": "Logistic Regression",
        "model_name": "threat_lr_model",
        "hyperparameters": {"C": 0.5}
    }
    
    with patch("app.services.training_service.run_training_job") as mock_job:
        response = client.post("/api/v1/models/train", json=payload, headers=auth_headers)
        
        assert response.status_code == 202
        data = response.json()
        assert data["status"] == "queued"
        assert data["algorithm"] == "Logistic Regression"
        assert data["config"]["C"] == 0.5
        assert mock_job.called


def test_training_pipeline_synchronous(auth_headers, dummy_processed_dataset_id, db_session):
    """
    Test running the entire training pipeline synchronously using the TestClient's
    synchronous background task execution.
    """
    payload = {
        "processed_dataset_id": str(dummy_processed_dataset_id),
        "algorithm": "Random Forest",
        "model_name": "threat_rf_model",
        "hyperparameters": {"n_estimators": 10}
    }
    
    response = client.post("/api/v1/models/train", json=payload, headers=auth_headers)
    assert response.status_code == 202
    job_id = response.json()["id"]
    
    # In TestClient, the background task completes synchronously before returning.
    # Check that job has completed.
    job_resp = client.get(f"/api/v1/training/jobs/{job_id}", headers=auth_headers)
    assert job_resp.status_code == 200
    job_data = job_resp.json()
    assert job_data["status"] == "completed"
    assert job_data["duration"] is not None
    
    # Check that the model is in the registry
    models_resp = client.get("/api/v1/models", headers=auth_headers)
    assert models_resp.status_code == 200
    models_list = models_resp.json()
    assert len(models_list) == 1
    
    model_data = models_list[0]
    assert model_data["name"] == "threat_rf_model"
    assert model_data["algorithm"] == "Random Forest"
    assert model_data["version"] == 1
    assert model_data["accuracy"] is not None
    assert model_data["f1_score"] is not None
    assert model_data["roc_auc"] is not None
    assert model_data["active_flag"] is False
    
    # Verify file artifacts on disk
    model_id = model_data["id"]
    model_record = db_session.query(TrainedModel).filter(TrainedModel.id == uuid.UUID(model_id)).first()
    model_path = model_record.file_path
    
    assert os.path.exists(os.path.join(model_path, "model.joblib"))
    assert os.path.exists(os.path.join(model_path, "metrics.json"))
    assert os.path.exists(os.path.join(model_path, "feature_names.json"))
    assert os.path.exists(os.path.join(model_path, "preprocessor.joblib"))
    assert os.path.exists(os.path.join(model_path, "training_config.json"))


def test_isolation_forest_pipeline_synchronous(auth_headers, dummy_processed_dataset_id):
    """
    Test running the Isolation Forest (unsupervised) algorithm.
    It should evaluate successfully, returning F1 as None (N/A).
    """
    payload = {
        "processed_dataset_id": str(dummy_processed_dataset_id),
        "algorithm": "Isolation Forest",
        "model_name": "threat_if_model",
        "hyperparameters": {"n_estimators": 5}
    }
    
    response = client.post("/api/v1/models/train", json=payload, headers=auth_headers)
    assert response.status_code == 202
    
    models_resp = client.get("/api/v1/models", headers=auth_headers)
    assert models_resp.status_code == 200
    models_list = models_resp.json()
    assert len(models_list) == 1
    assert models_list[0]["f1_score"] is None  # F1 is N/A for Isolation Forest


def test_activate_model(auth_headers, dummy_processed_dataset_id):
    # Train version 1
    client.post(
        "/api/v1/models/train", 
        json={
            "processed_dataset_id": str(dummy_processed_dataset_id),
            "algorithm": "Decision Tree",
            "model_name": "threat_dt_model"
        },
        headers=auth_headers
    )
    
    # Train version 2
    client.post(
        "/api/v1/models/train", 
        json={
            "processed_dataset_id": str(dummy_processed_dataset_id),
            "algorithm": "Decision Tree",
            "model_name": "threat_dt_model"
        },
        headers=auth_headers
    )
    
    models_resp = client.get("/api/v1/models", headers=auth_headers)
    models = models_resp.json()
    assert len(models) == 2
    
    # Version 1 is models[1], Version 2 is models[0] (since sorted by created_at desc)
    v1 = models[1]
    v2 = models[0]
    
    assert v1["active_flag"] is False
    assert v2["active_flag"] is False
    
    # Activate version 2
    act_resp = client.post(f"/api/v1/models/{v2['id']}/activate", headers=auth_headers)
    assert act_resp.status_code == 200
    assert act_resp.json()["active_flag"] is True
    
    # Re-fetch models to verify version 1 is still inactive
    models_resp2 = client.get("/api/v1/models", headers=auth_headers)
    models2 = models_resp2.json()
    v1_updated = [m for m in models2 if m["id"] == v1["id"]][0]
    v2_updated = [m for m in models2 if m["id"] == v2["id"]][0]
    
    assert v1_updated["active_flag"] is False
    assert v2_updated["active_flag"] is True


def test_compare_models(auth_headers, dummy_processed_dataset_id):
    # Train Logistic Regression
    client.post(
        "/api/v1/models/train", 
        json={
            "processed_dataset_id": str(dummy_processed_dataset_id),
            "algorithm": "Logistic Regression",
            "model_name": "model_compare"
        },
        headers=auth_headers
    )
    
    # Train Random Forest
    client.post(
        "/api/v1/models/train", 
        json={
            "processed_dataset_id": str(dummy_processed_dataset_id),
            "algorithm": "Random Forest",
            "model_name": "model_compare"
        },
        headers=auth_headers
    )
    
    compare_resp = client.get("/api/v1/models/compare", headers=auth_headers)
    assert compare_resp.status_code == 200
    comparison = compare_resp.json()
    assert len(comparison) == 2
    
    # Should have model details and metrics
    for comp in comparison:
        assert "algorithm" in comp
        assert "accuracy" in comp
        assert "f1_score" in comp
        assert "training_time" in comp


def test_delete_model(auth_headers, dummy_processed_dataset_id, db_session):
    client.post(
        "/api/v1/models/train", 
        json={
            "processed_dataset_id": str(dummy_processed_dataset_id),
            "algorithm": "Logistic Regression",
            "model_name": "to_be_deleted"
        },
        headers=auth_headers
    )
    
    models = client.get("/api/v1/models", headers=auth_headers).json()
    model = models[0]
    model_id = model["id"]
    model_path = model["file_path"]
    
    assert os.path.exists(model_path)
    
    # Delete model
    del_resp = client.delete(f"/api/v1/models/{model_id}", headers=auth_headers)
    assert del_resp.status_code == 204
    
    # Check DB
    model_record = db_session.query(TrainedModel).filter(TrainedModel.id == uuid.UUID(model_id)).first()
    assert model_record is None
    
    # Check files removed
    assert not os.path.exists(model_path)
