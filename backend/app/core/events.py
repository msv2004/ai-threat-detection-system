import asyncio
from typing import Callable, Dict, List, Any
from app.core.logger import logger

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
        logger.info(f"Subscribed handler {handler.__name__} to event {event_type}")

    def unsubscribe(self, event_type: str, handler: Callable):
        if event_type in self._subscribers:
            try:
                self._subscribers[event_type].remove(handler)
            except ValueError:
                pass

    async def publish(self, event_type: str, *args, **kwargs):
        if event_type not in self._subscribers:
            return

        handlers = self._subscribers[event_type]
        # Run handlers concurrently
        tasks = []
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    tasks.append(asyncio.create_task(handler(*args, **kwargs)))
                else:
                    # If synchronous, run in thread pool
                    loop = asyncio.get_running_loop()
                    tasks.append(loop.run_in_executor(None, lambda h=handler: h(*args, **kwargs)))
            except Exception as e:
                logger.error(f"Error scheduling event handler {handler.__name__} for event {event_type}: {e}")
        
        if tasks:
            # We don't necessarily want to wait for them here if it's fire-and-forget,
            # but for safety and tests, we can wait or just let them run.
            # Using asyncio.gather with return_exceptions=True
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for r in results:
                if isinstance(r, Exception):
                    logger.error(f"Event handler execution failed: {r}")

# Global singleton event bus
event_bus = EventBus()
