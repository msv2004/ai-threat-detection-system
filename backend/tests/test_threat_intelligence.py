import pytest
import asyncio
from uuid import uuid4
from fastapi.testclient import TestClient
from app.main import app
from app.models.prediction import Threat, ThreatIntelligence
from app.core.events import event_bus
from app.services.threat_intelligence_service import threat_intelligence_service

@pytest.mark.asyncio
async def test_event_bus_pub_sub():
    test_data = []
    
    async def dummy_handler(threat_id, features):
        test_data.append((threat_id, features))
        
    event_bus.subscribe("test_event", dummy_handler)
    
    tid = uuid4()
    feats = {"Dest Port": 80}
    await event_bus.publish("test_event", threat_id=tid, features=feats)
    
    # Wait a bit for async tasks to complete
    await asyncio.sleep(0.1)
    
    assert len(test_data) == 1
    assert test_data[0][0] == tid
    assert test_data[0][1] == feats

def test_attack_classification_brute_force():
    from app.services.attack_classification import AttackClassificationService
    
    features = {"Destination Port": 22, "Flow Duration": 1000}
    attack_type, mitre, action = AttackClassificationService.classify_threat(1, 95, features, "Random Forest")
    
    assert attack_type == "Brute Force"
    assert "T1110" in mitre

def test_attack_classification_anomaly():
    from app.services.attack_classification import AttackClassificationService
    
    features = {"Destination Port": 4444}
    attack_type, mitre, action = AttackClassificationService.classify_threat(1, 80, features, "Isolation Forest")
    
    assert attack_type == "Zero-day / Anomaly"
    assert "T1562" in mitre

@pytest.fixture
def test_user(db_session):
    from app.models.user import User
    from app.repositories.user_repository import UserRepository
    repo = UserRepository(db_session)
    role = repo.get_role_by_name("Security Analyst")
    user = User(email="analyst@example.com", hashed_password="hashed_password", role_id=role.id)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def test_dataset(db_session, test_user):
    from app.models.dataset import Dataset
    from uuid import uuid4
    dataset = Dataset(
        filename="test_dataset.csv",
        dataset_type="network_traffic",
        size_bytes=1024,
        file_path="/tmp/test_dataset.csv",
        status="ready",
        uploaded_by=test_user.id
    )
    db_session.add(dataset)
    db_session.commit()
    db_session.refresh(dataset)
    return dataset

@pytest.mark.asyncio
async def test_threat_intelligence_enrichment(db_session, test_user, test_dataset):
    # Patch SessionLocal to use the test session
    from app.services import threat_intelligence_service as tis
    import app.services.threat_intelligence_service
    
    # Create a dummy threat first
    from app.models.prediction import PredictionHistory
    
    history = PredictionHistory(
        user_id=test_user.id,
        dataset_id=test_dataset.id,
        input_data={"Source IP": "8.8.8.8", "Destination Port": 80},
        prediction_label=1,
        confidence=0.99,
        threat_score=99
    )
    db_session.add(history)
    db_session.commit()
    db_session.refresh(history)
    
    threat = Threat(
        prediction_id=history.id,
        severity="Critical",
        confidence=0.99,
        threat_score=99,
        attack_type="Web Attack / DoS",
        model_version=1,
        user_id=test_user.id
    )
    db_session.add(threat)
    db_session.commit()
    db_session.refresh(threat)
    
    # Monkeypatch SessionLocal to yield the active test db_session transaction
    class MockSessionLocal:
        def __call__(self):
            return db_session
            
    original_session_local = tis.SessionLocal
    tis.SessionLocal = MockSessionLocal()
    original_close = db_session.close
    db_session.close = lambda: None
    
    try:
        # Invoke event handler manually
        await threat_intelligence_service.handle_threat_detected(threat.id, history.input_data)
        
        # Assert Threat Intelligence created
        # Query fresh rather than refresh if session issues occur, but since we disabled close, refresh should work too
        reports = db_session.query(ThreatIntelligence).filter(ThreatIntelligence.threat_id == threat.id).all()
        
        assert len(reports) == 2  # AbuseIPDBMock and VirusTotalMock
        providers = [r.provider for r in reports]
        assert "AbuseIPDB" in providers
        assert "VirusTotal" in providers
    finally:
        tis.SessionLocal = original_session_local
        db_session.close = original_close
