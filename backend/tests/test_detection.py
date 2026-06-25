import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.capture.detection_session import ActiveSession
from app.flow.flow_builder import FlowBuilder
from app.flow.feature_extractor import FeatureExtractor
from app.flow.validators import FeatureValidator
from scapy.all import IP, TCP, Ether

client = TestClient(app)

@pytest.fixture
def mock_db_session():
    return MagicMock()

def test_flow_builder_adds_packet():
    builder = FlowBuilder()
    
    # Create mock packet
    pkt = Ether()/IP(src="192.168.1.2", dst="10.0.0.5")/TCP(sport=12345, dport=80, flags="S")
    
    builder.process_packet(pkt)
    
    assert len(builder.active_flows) == 1
    key = list(builder.active_flows.keys())[0]
    flow = builder.active_flows[key]
    
    assert flow.src_ip == "192.168.1.2"
    assert flow.dst_ip == "10.0.0.5"
    assert flow.src_port == 12345
    assert flow.dst_port == 80
    assert flow.packet_count == 1
    assert flow.fwd_packets == 1
    assert flow.bwd_packets == 0

def test_feature_extractor():
    builder = FlowBuilder()
    
    # Send SYN
    pkt1 = Ether()/IP(src="192.168.1.2", dst="10.0.0.5")/TCP(sport=12345, dport=80, flags="S")
    builder.process_packet(pkt1)
    
    # Send SYN-ACK reply
    pkt2 = Ether()/IP(src="10.0.0.5", dst="192.168.1.2")/TCP(sport=80, dport=12345, flags="SA")
    builder.process_packet(pkt2)
    
    flow = list(builder.active_flows.values())[0]
    
    features = FeatureExtractor.extract(flow)
    assert features["Protocol"] == 6 # TCP
    assert features["Total Fwd Packets"] == 1
    assert features["Total Backward Packets"] == 1
    assert features["SYN Flag Count"] == 1
    assert features["ACK Flag Count"] == 1

def test_feature_validator():
    features = {"Protocol": 6, "Total Fwd Packets": 5}
    preprocessor_state = {
        "numeric_cols": ["Protocol", "Total Fwd Packets", "Missing Col"],
        "categorical_cols": ["Cat Col"]
    }
    
    aligned = FeatureValidator.align_features(features, preprocessor_state)
    assert aligned["Protocol"] == 6.0
    assert aligned["Total Fwd Packets"] == 5.0
    assert aligned["Missing Col"] == 0.0
    assert aligned["Cat Col"] == "Unknown"

def test_active_session_stats():
    import uuid
    session = ActiveSession(uuid.uuid4(), "eth0")
    session.increment_packets(10)
    session.increment_flows(2)
    session.record_prediction(is_threat=True, severity="Critical", latency=0.01)
    
    stats = session.get_statistics()
    assert stats["packet_count"] == 10
    assert stats["flow_count"] == 2
    assert stats["threat_count"] == 1
    assert stats["critical_count"] == 1
