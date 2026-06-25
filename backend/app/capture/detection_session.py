import time
from uuid import UUID

class ActiveSession:
    """
    In-memory tracker for an active detection session's statistics.
    """
    def __init__(self, session_id: UUID, interface: str):
        self.session_id = session_id
        self.interface = interface
        
        self.start_time = time.time()
        self.stop_time = None
        
        self.packet_count = 0
        self.flow_count = 0
        self.threat_count = 0
        self.benign_count = 0
        self.critical_count = 0
        
        # For calculating rates
        self._last_metrics_time = self.start_time
        self._last_packet_count = 0
        self._last_flow_count = 0
        
        self.current_packets_per_sec = 0.0
        self.current_flows_per_sec = 0.0
        self.average_latency = 0.0
        
        self._total_latency = 0.0
        self._latency_samples = 0

    def increment_packets(self, count: int = 1):
        self.packet_count += count

    def increment_flows(self, count: int = 1):
        self.flow_count += count

    def record_prediction(self, is_threat: bool, severity: str, latency: float):
        if is_threat:
            self.threat_count += 1
            if severity.lower() == "critical":
                self.critical_count += 1
        else:
            self.benign_count += 1
            
        self._total_latency += latency
        self._latency_samples += 1

    def update_rates(self):
        """Updates packets/sec and flows/sec. Call this periodically (e.g., every 1 second)."""
        now = time.time()
        delta = now - self._last_metrics_time
        if delta > 0:
            self.current_packets_per_sec = (self.packet_count - self._last_packet_count) / delta
            self.current_flows_per_sec = (self.flow_count - self._last_flow_count) / delta
        
        if self._latency_samples > 0:
            self.average_latency = self._total_latency / self._latency_samples
            
        self._last_metrics_time = now
        self._last_packet_count = self.packet_count
        self._last_flow_count = self.flow_count

    def stop(self):
        self.stop_time = time.time()

    def get_statistics(self) -> dict:
        self.update_rates()
        duration = (self.stop_time or time.time()) - self.start_time
        return {
            "session_id": str(self.session_id),
            "interface": self.interface,
            "duration_seconds": duration,
            "packet_count": self.packet_count,
            "flow_count": self.flow_count,
            "threat_count": self.threat_count,
            "benign_count": self.benign_count,
            "critical_count": self.critical_count,
            "packets_per_sec": round(self.current_packets_per_sec, 2),
            "flows_per_sec": round(self.current_flows_per_sec, 2),
            "average_latency": round(self.average_latency, 4)
        }
