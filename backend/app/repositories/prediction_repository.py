from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.models.prediction import PredictionHistory, Threat, PredictionJob

class PredictionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_prediction_history(
        self,
        user_id: int,
        model_id: UUID,
        dataset_id: Optional[UUID],
        prediction_job_id: Optional[UUID],
        input_data: dict,
        prediction_label: int,
        confidence: float,
        threat_score: int,
        processing_latency: Optional[float] = None
    ) -> PredictionHistory:
        record = PredictionHistory(
            user_id=user_id,
            model_id=model_id,
            dataset_id=dataset_id,
            prediction_job_id=prediction_job_id,
            input_data=input_data,
            prediction_label=prediction_label,
            confidence=confidence,
            threat_score=threat_score,
            processing_latency=processing_latency
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_prediction_history(self, prediction_id: UUID) -> Optional[PredictionHistory]:
        return self.db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()

    def list_prediction_histories(
        self, 
        user_id: int, 
        model_id: Optional[UUID] = None, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[PredictionHistory]:
        query = self.db.query(PredictionHistory).filter(PredictionHistory.user_id == user_id)
        if model_id:
            query = query.filter(PredictionHistory.model_id == model_id)
        return query.order_by(PredictionHistory.timestamp.desc()).offset(skip).limit(limit).all()

    def create_threat(self, threat_data: dict) -> Threat:
        threat = Threat(**threat_data)
        self.db.add(threat)
        self.db.commit()
        self.db.refresh(threat)
        return threat

    def get_threat(self, threat_id: UUID) -> Optional[Threat]:
        from sqlalchemy.orm import joinedload
        return self.db.query(Threat).options(joinedload(Threat.intelligence_reports)).filter(Threat.id == threat_id).first()

    def list_threats(self, user_id: int, resolution_status: Optional[str] = None) -> List[Threat]:
        from sqlalchemy.orm import joinedload
        query = self.db.query(Threat).options(joinedload(Threat.intelligence_reports)).filter(Threat.user_id == user_id)
        if resolution_status:
            query = query.filter(Threat.resolution_status == resolution_status)
        return query.order_by(Threat.detection_time.desc()).all()

    def update_threat_status(self, threat_id: UUID, resolution_status: str) -> Optional[Threat]:
        threat = self.get_threat(threat_id)
        if threat:
            threat.resolution_status = resolution_status
            self.db.commit()
            self.db.refresh(threat)
        return threat

    def create_prediction_job(self, user_id: int, model_id: UUID, dataset_id: UUID) -> PredictionJob:
        job = PredictionJob(
            user_id=user_id,
            model_id=model_id,
            dataset_id=dataset_id,
            status="queued"
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_prediction_job(self, job_id: UUID) -> Optional[PredictionJob]:
        return self.db.query(PredictionJob).filter(PredictionJob.id == job_id).first()

    def list_prediction_jobs(self, user_id: int) -> List[PredictionJob]:
        return self.db.query(PredictionJob)\
            .filter(PredictionJob.user_id == user_id)\
            .order_by(PredictionJob.created_at.desc())\
            .all()

    def update_prediction_job(
        self,
        job_id: UUID,
        status: str,
        output_file_path: Optional[str] = None,
        report: Optional[dict] = None,
        error_message: Optional[str] = None
    ) -> Optional[PredictionJob]:
        job = self.get_prediction_job(job_id)
        if job:
            job.status = status
            if output_file_path:
                job.output_file_path = output_file_path
            if report:
                job.report = report
            if error_message:
                job.error_message = error_message
            self.db.commit()
            self.db.refresh(job)
        return job
