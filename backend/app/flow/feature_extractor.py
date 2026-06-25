from typing import Dict, Any
from app.flow.flow_builder import FlowRecord

class FeatureExtractor:
    """
    Extracts numerical ML features from a FlowRecord.
    """
    
    @staticmethod
    def extract(flow: FlowRecord) -> Dict[str, Any]:
        """
        Calculates rates, ratios, and protocol encodings.
        Returns a dictionary representing the FeatureVector.
        """
        duration = flow.duration
        
        # Standard rates
        bytes_per_sec = flow.byte_count / duration
        packets_per_sec = flow.packet_count / duration
        
        fwd_packets_per_sec = flow.fwd_packets / duration
        bwd_packets_per_sec = flow.bwd_packets / duration
        
        # Ratios
        packet_ratio = (flow.fwd_packets / flow.bwd_packets) if flow.bwd_packets > 0 else float(flow.fwd_packets)
        byte_ratio = (flow.fwd_bytes / flow.bwd_bytes) if flow.bwd_bytes > 0 else float(flow.fwd_bytes)
        
        # Basic derived numeric features that mimic common datasets (e.g. CICIDS)
        features = {
            "Protocol": flow.protocol,
            "Flow Duration": duration,
            "Total Fwd Packets": flow.fwd_packets,
            "Total Backward Packets": flow.bwd_packets,
            "Total Length of Fwd Packets": flow.fwd_bytes,
            "Total Length of Bwd Packets": flow.bwd_bytes,
            "Flow Bytes/s": bytes_per_sec,
            "Flow Packets/s": packets_per_sec,
            "Fwd Packets/s": fwd_packets_per_sec,
            "Bwd Packets/s": bwd_packets_per_sec,
            
            # TCP Flags Breakdown (bitmasks)
            "FIN Flag Count": 1 if (flow.tcp_flags & 0x01) else 0,
            "SYN Flag Count": 1 if (flow.tcp_flags & 0x02) else 0,
            "RST Flag Count": 1 if (flow.tcp_flags & 0x04) else 0,
            "PSH Flag Count": 1 if (flow.tcp_flags & 0x08) else 0,
            "ACK Flag Count": 1 if (flow.tcp_flags & 0x10) else 0,
            "URG Flag Count": 1 if (flow.tcp_flags & 0x20) else 0,
        }
        
        return features
