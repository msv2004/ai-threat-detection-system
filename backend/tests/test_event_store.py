import pytest
import asyncio
from uuid import uuid4
from app.models.system_event import SystemEvent
from app.services.event_store_service import EventStoreService
from app.core.events import event_bus

def test_record_event_persists_to_db(db_session):
    payload = {"key": "value"}
    correlation_id = uuid4()
    
    event = EventStoreService.record_event(
        db=db_session,
        event_type="test_event",
        payload=payload,
        correlation_id=correlation_id
    )
    
    # Assert database persistence
    db_event = db_session.query(SystemEvent).filter(SystemEvent.id == event.id).first()
    assert db_event is not None
    assert db_event.event_type == "test_event"
    assert db_event.payload["key"] == "value"
    assert db_event.correlation_id == correlation_id

@pytest.mark.asyncio
async def test_record_event_publishes_to_bus(db_session):
    triggered_events = []
    
    async def handler(event, **kwargs):
        triggered_events.append(event)
        
    event_bus.subscribe("test_bus_event", handler)
    
    try:
        event = EventStoreService.record_event(
            db=db_session,
            event_type="test_bus_event",
            payload={"foo": "bar"}
        )
        
        await asyncio.sleep(0.05) # Let event loop execute handlers
        
        assert len(triggered_events) == 1
        assert triggered_events[0].id == event.id
        assert triggered_events[0].payload["foo"] == "bar"
    finally:
        event_bus.unsubscribe("test_bus_event", handler)
