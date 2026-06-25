import threading
from scapy.all import sniff
from app.capture.packet_capture import CaptureEngine

class LiveCapture(CaptureEngine):
    """
    Captures live packets from a specified network interface using Scapy.
    """
    def __init__(self):
        super().__init__()
        self._thread = None

    def start(self, interface: str = None, bpf_filter: str = None):
        """
        Starts live sniffing on a given interface.
        If interface is None, sniffs on all interfaces.
        """
        if self._is_running:
            return

        self._is_running = True
        self._thread = threading.Thread(
            target=self._sniff_loop, 
            args=(interface, bpf_filter),
            daemon=True
        )
        self._thread.start()

    def stop(self):
        self._is_running = False
        if self._thread:
            self._thread.join(timeout=2.0)

    def _should_stop(self, packet) -> bool:
        return not self._is_running

    def _sniff_loop(self, interface: str, bpf_filter: str):
        try:
            sniff(
                iface=interface,
                filter=bpf_filter,
                prn=self._on_packet_callback,
                stop_filter=self._should_stop,
                store=False
            )
        except Exception as e:
            # We could log this via a logger
            print(f"LiveCapture Error on {interface}: {e}")
        finally:
            self._is_running = False
