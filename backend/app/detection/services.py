import asyncio
import time
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from app.models.detection import DetectionSession
from app.models.training import TrainedModel
from app.capture.live_capture import LiveCapture
from app.capture.pcap_reader import PcapCapture
from app.capture.detection_session import ActiveSession
from app.flow.flow_builder import FlowBuilder, FlowRecord
from app.flow.feature_extractor import FeatureExtractor
from app.flow.validators import FeatureValidator
from app.services.prediction_service import PredictionService, model_cache
from app.services.event_store_service import EventStoreService
from app.schemas.prediction import PredictionRequest
from app.websocket.manager import websocket_manager
from app.core.exceptions import NotFoundError, BadRequestError

class DetectionService:
    def __init__(self, db: Session, prediction_service: PredictionService, event_store: EventStoreService):
        self.db = db
        self.prediction_service = prediction_service
        self.event_store = event_store
        
        # Single active capture engine and session per instance for simplicity.
        # In a real distributed system, we'd use Redis or similar.
        self.current_capture_engine = None
        self.current_session: ActiveSession = None
        self.flow_builder = None
        self.active_model_record: TrainedModel = None
        self.preprocessor_state = None

    def start_session(self, user_id: int, request_data: dict, background_tasks: BackgroundTasks) -> DetectionSession:
        if self.current_session and self.current_session.stop_time is None:
            raise BadRequestError("A detection session is already running. Please stop it first.")

        # 1. Resolve Active Model (required before starting)
        self.active_model_record = self.prediction_service.get_active_model(user_id)
        try:
            # We must load preprocessor state to know which features to validate
            self.preprocessor_state = model_cache.get_preprocessor(self.active_model_record.file_path)
        except Exception as e:
            raise BadRequestError(f"Failed to load model artifacts: {e}")

        # 2. Create DB Session Record
        db_session = DetectionSession(
            user_id=user_id,
            interface=request_data.interface,
            mode=request_data.mode,
            status="running"
        )
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)

        # 3. Initialize In-Memory Session
        self.current_session = ActiveSession(db_session.id, request_data.interface)

        # 4. Initialize Flow Builder
        self.flow_builder = FlowBuilder()
        self.flow_builder.set_callback(self._on_flow_complete)

        # 5. Initialize Capture Engine
        if request_data.mode == "live":
            self.current_capture_engine = LiveCapture()
            self.current_capture_engine.set_callback(self._on_packet_captured)
            self.current_capture_engine.start(interface=request_data.interface)
        elif request_data.mode == "offline":
            if not request_data.file_path:
                raise BadRequestError("file_path is required for offline mode")
            self.current_capture_engine = PcapCapture()
            self.current_capture_engine.set_callback(self._on_packet_captured)
            self.current_capture_engine.start(file_path=request_data.file_path, replay_speed=request_data.replay_speed)
        else:
            raise BadRequestError(f"Invalid mode: {request_data.mode}")

        # 6. Start Maintenance Background Task
        background_tasks.add_task(self._maintenance_loop, user_id)

        # 7. Audit log
        self.event_store.record_event(
            db=self.db,
            event_type="detection_started",
            user_id=user_id,
            payload={"session_id": str(db_session.id), "mode": request_data.mode}
        )

        return db_session

    def stop_session(self, user_id: int):
        if not self.current_session or self.current_session.stop_time is not None:
            raise BadRequestError("No active detection session to stop.")

        # Stop Capture
        if self.current_capture_engine:
            self.current_capture_engine.stop()

        # Flush remaining flows
        if self.flow_builder:
            self.flow_builder.flush_oldest_flows(count=len(self.flow_builder.active_flows))

        self.current_session.stop()

        # Update DB Record
        db_session = self.db.query(DetectionSession).filter(DetectionSession.id == self.current_session.session_id).first()
        if db_session:
            db_session.status = "completed"
            db_session.stop_time = self.current_session.stop_time
            db_session.packet_count = self.current_session.packet_count
            db_session.flow_count = self.current_session.flow_count
            db_session.threat_count = self.current_session.threat_count
            self.db.commit()

        self.event_store.record_event(
            db=self.db,
            event_type="detection_stopped",
            user_id=user_id,
            payload=self.current_session.get_statistics()
        )

    def _on_packet_captured(self, packet):
        if self.current_session:
            self.current_session.increment_packets()
        if self.flow_builder:
            self.flow_builder.process_packet(packet)

    def _on_flow_complete(self, flow: FlowRecord):
        if not self.current_session:
            return
            
        self.current_session.increment_flows()
        
        # 1. Extract Features
        raw_features = FeatureExtractor.extract(flow)
        
        # 2. Validate/Align Features to model's expected schema
        aligned_features = FeatureValidator.align_features(raw_features, self.preprocessor_state)
        
        # 3. Predict via PredictionService
        try:
            # Note: User_id technically requires access here, for simplicity we assume the session creator's user_id 
            # In a real implementation we'd pass user_id explicitly. We'll query db_session to get it.
            # But prediction_service expects user_id. We'll use the active model's user_id.
            
            user_id = self.active_model_record.user_id
            
            pred_req = PredictionRequest(input_data=aligned_features, model_id=self.active_model_record.id)
            response = self.prediction_service.predict(pred_req, user_id=user_id)
            
            is_threat = (response.prediction_label == 1)
            
            # 4. Record Metrics
            # response.processing_latency is not exposed directly in PredictionResponse usually, 
            # but we can measure time locally or use a placeholder.
            self.current_session.record_prediction(is_threat, response.severity, 0.01)

            # 5. Emit WebSocket Alert if malicious
            if is_threat:
                alert = {
                    "type": "threat_alert",
                    "flow_id": flow.flow_id,
                    "src_ip": flow.src_ip,
                    "dst_ip": flow.dst_ip,
                    "dst_port": flow.dst_port,
                    "protocol": flow.protocol,
                    "severity": response.severity,
                    "confidence": response.confidence,
                    "threat_score": response.threat_score
                }
                # Create asyncio task to avoid blocking the scapy sniff thread
                # Wait, this runs in sniff thread! asyncio.run or schedule is needed.
                # It's safer to push to a queue or just run threadsafe.
                asyncio.run_coroutine_threadsafe(
                    websocket_manager.broadcast_json(alert),
                    asyncio.get_event_loop()
                )

        except Exception as e:
            print(f"Prediction Error for Flow {flow.flow_id}: {e}")

    async def _maintenance_loop(self, user_id: int):
        """Runs in background while session is active to push stats and clean flows."""
        loop = asyncio.get_event_loop()
        while self.current_session and self.current_session.stop_time is None:
            # 1. Check for flow timeouts
            if self.flow_builder:
                # Need to run in executor to avoid blocking the async loop?
                # It's fast enough.
                self.flow_builder.check_timeouts()

            # 2. Broadcast Stats
            stats = self.current_session.get_statistics()
            await websocket_manager.broadcast_json({
                "type": "detection_stats",
                "stats": stats
            })
            
            await asyncio.sleep(1)

    def get_status(self) -> dict:
        if not self.current_session:
            return {"status": "inactive"}
            
        stats = self.current_session.get_statistics()
        stats["status"] = "running" if self.current_session.stop_time is None else "completed"
        return stats
