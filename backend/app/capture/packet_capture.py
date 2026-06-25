from abc import ABC, abstractmethod
from typing import Callable, Any

class CaptureEngine(ABC):
    """
    Base interface for all packet capture engines.
    """
    
    def __init__(self):
        self._on_packet_callback = None
        self._is_running = False

    def set_callback(self, callback: Callable[[Any], None]):
        """Set the callback to be executed for each captured packet."""
        self._on_packet_callback = callback

    @property
    def is_running(self) -> bool:
        return self._is_running

    @abstractmethod
    def start(self, **kwargs):
        """Start capturing packets."""
        pass

    @abstractmethod
    def stop(self):
        """Stop capturing packets."""
        pass
