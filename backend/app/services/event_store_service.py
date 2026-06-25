import asyncio
from uuid import UUID, uuid4
from sqlalchemy.orm import Session
from app.models.system_event import SystemEvent
from app.core.events import event_bus
from app.core.logger import logger

class EventStoreService:
    @staticmethod
    def record_event(
        db: Session,
        event_type: str,
        payload: dict,
        user_id: int = None,
        correlation_id: UUID = None
    ) -> SystemEvent:
        """
        Record a system event to the database Event Store and publish it to the in-memory Event Bus.
        """
        if correlation_id is None:
            # Try to extract correlation_id from payload, or generate a new one
            corr_val = payload.get("correlation_id")
            if corr_val:
                try:
                    correlation_id = UUID(str(corr_val))
                except ValueError:
                    correlation_id = uuid4()
            else:
                correlation_id = uuid4()
        
        # Ensure correlation_id is in payload
        payload["correlation_id"] = str(correlation_id)
        
        event = SystemEvent(
            event_type=event_type,
            payload=payload,
            correlation_id=correlation_id,
            user_id=user_id
        )
        
        try:
            db.add(event)
            db.commit()
            db.refresh(event)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record event {event_type} to Event Store: {e}")
            raise e
            
        # Dispatch to in-memory event bus
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(event_bus.publish(event_type, event=event))
        except RuntimeError:
            # Fallback if no running event loop
            try:
                asyncio.run(event_bus.publish(event_type, event=event))
            except Exception as ex:
                logger.error(f"Failed to publish event {event_type} synchronously: {ex}")
                
        return event
