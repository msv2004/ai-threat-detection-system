import time
import threading
from scapy.all import PcapReader
from app.capture.packet_capture import CaptureEngine

class PcapCapture(CaptureEngine):
    """
    Reads packets from an offline PCAP file.
    """
    def __init__(self):
        super().__init__()
        self._thread = None

    def start(self, file_path: str, replay_speed: float = 0.0):
        """
        Starts reading the PCAP file.
        replay_speed: If > 0, attempts to delay between packets to simulate real-time.
                      If 0, processes as fast as possible.
        """
        if self._is_running:
            return

        self._is_running = True
        self._thread = threading.Thread(
            target=self._read_loop, 
            args=(file_path, replay_speed),
            daemon=True
        )
        self._thread.start()

    def stop(self):
        self._is_running = False
        if self._thread:
            self._thread.join(timeout=2.0)

    def _read_loop(self, file_path: str, replay_speed: float):
        try:
            with PcapReader(file_path) as pcap_reader:
                for packet in pcap_reader:
                    if not self._is_running:
                        break
                    
                    if self._on_packet_callback:
                        self._on_packet_callback(packet)

                    if replay_speed > 0:
                        # Optional: Sleep to simulate realistic arrival, 
                        # realistically this would calculate delta between packet timestamps.
                        # For simplicity, we just inject a constant delay if requested.
                        time.sleep(replay_speed)

        except Exception as e:
            print(f"PcapCapture Error on {file_path}: {e}")
        finally:
            self._is_running = False
