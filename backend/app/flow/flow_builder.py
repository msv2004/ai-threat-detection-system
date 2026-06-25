import time
from typing import Dict, Any, Callable
from scapy.all import IP, TCP, UDP, Packet

class FlowRecord:
    def __init__(self, flow_id: str, src_ip: str, dst_ip: str, src_port: int, dst_port: int, protocol: int):
        self.flow_id = flow_id
        self.src_ip = src_ip
        self.dst_ip = dst_ip
        self.src_port = src_port
        self.dst_port = dst_port
        self.protocol = protocol
        
        self.start_time = time.time()
        self.last_seen = self.start_time
        
        self.packet_count = 0
        self.fwd_packets = 0
        self.bwd_packets = 0
        self.byte_count = 0
        self.fwd_bytes = 0
        self.bwd_bytes = 0
        
        # TCP Flags aggregation
        self.tcp_flags = 0

    @property
    def duration(self) -> float:
        return max(0.0001, self.last_seen - self.start_time)

    def add_packet(self, packet: Packet, is_forward: bool, length: int):
        self.packet_count += 1
        self.byte_count += length
        self.last_seen = time.time()
        
        if is_forward:
            self.fwd_packets += 1
            self.fwd_bytes += length
        else:
            self.bwd_packets += 1
            self.bwd_bytes += length
            
        if TCP in packet:
            # bitwise OR of flags
            self.tcp_flags |= int(packet[TCP].flags)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "flow_id": self.flow_id,
            "src_ip": self.src_ip,
            "dst_ip": self.dst_ip,
            "src_port": self.src_port,
            "dst_port": self.dst_port,
            "protocol": self.protocol,
            "duration": self.duration,
            "packet_count": self.packet_count,
            "byte_count": self.byte_count,
            "fwd_packets": self.fwd_packets,
            "bwd_packets": self.bwd_packets,
            "fwd_bytes": self.fwd_bytes,
            "bwd_bytes": self.bwd_bytes,
            "tcp_flags": self.tcp_flags
        }

class FlowBuilder:
    """
    Builds FlowRecords from incoming raw packets.
    """
    def __init__(self, flow_timeout: int = 10, max_flows: int = 10000):
        self.active_flows: Dict[str, FlowRecord] = {}
        self.flow_timeout = flow_timeout
        self.max_flows = max_flows
        self._on_flow_complete: Callable[[FlowRecord], None] = None

    def set_callback(self, callback: Callable[[FlowRecord], None]):
        """Callback triggered when a flow times out or finishes."""
        self._on_flow_complete = callback

    def process_packet(self, packet: Packet):
        """Processes a single raw packet."""
        if IP not in packet:
            return

        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        protocol = packet[IP].proto
        length = len(packet)

        src_port = 0
        dst_port = 0
        if TCP in packet:
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
        elif UDP in packet:
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        # Generate bi-directional flow key
        is_forward = True
        key = f"{src_ip}:{src_port}-{dst_ip}:{dst_port}-{protocol}"
        rev_key = f"{dst_ip}:{dst_port}-{src_ip}:{src_port}-{protocol}"

        flow_id = key
        if rev_key in self.active_flows:
            flow_id = rev_key
            is_forward = False

        if flow_id not in self.active_flows:
            # Prevent unbounded memory growth under attacks (e.g. syn flood)
            if len(self.active_flows) >= self.max_flows:
                self.flush_oldest_flows(int(self.max_flows * 0.1))
                
            self.active_flows[flow_id] = FlowRecord(flow_id, src_ip, dst_ip, src_port, dst_port, protocol)
            
        flow = self.active_flows[flow_id]
        flow.add_packet(packet, is_forward, length)

    def flush_oldest_flows(self, count: int = 100):
        """Evicts the oldest flows."""
        sorted_flows = sorted(self.active_flows.values(), key=lambda f: f.last_seen)
        for i in range(min(count, len(sorted_flows))):
            f = sorted_flows[i]
            if self._on_flow_complete:
                self._on_flow_complete(f)
            del self.active_flows[f.flow_id]

    def check_timeouts(self):
        """Checks for timed out flows and triggers callbacks."""
        now = time.time()
        timed_out_keys = []
        for key, flow in self.active_flows.items():
            if now - flow.last_seen > self.flow_timeout:
                timed_out_keys.append(key)
                if self._on_flow_complete:
                    self._on_flow_complete(flow)
                    
        for key in timed_out_keys:
            del self.active_flows[key]
