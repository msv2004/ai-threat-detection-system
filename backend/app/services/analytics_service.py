from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

from app.models.prediction import PredictionHistory, Threat
from app.models.training import TrainingJob, TrainedModel
from app.models.dataset import Dataset
from app.models.system_event import SystemEvent

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_overview(self, user_id: int) -> Dict[str, Any]:
        # Predictions count
        total_predictions = self.db.query(func.count(PredictionHistory.id))\
            .filter(PredictionHistory.user_id == user_id).scalar() or 0

        # Threats count
        total_threats = self.db.query(func.count(Threat.id))\
            .filter(Threat.user_id == user_id).scalar() or 0

        # Datasets count
        total_datasets = self.db.query(func.count(Dataset.id))\
            .filter(Dataset.uploaded_by == user_id).scalar() or 0

        # Training Jobs count
        total_training_jobs = self.db.query(func.count(TrainingJob.id))\
            .filter(TrainingJob.user_id == user_id).scalar() or 0

        # Average Latency
        avg_latency = self.db.query(func.avg(PredictionHistory.processing_latency))\
            .filter(PredictionHistory.user_id == user_id).scalar() or 0.0

        # Active Model Info
        active_model = self.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id, TrainedModel.active_flag).first()

        active_model_info = None
        if active_model:
            active_model_info = {
                "id": active_model.id,
                "name": active_model.name,
                "version": active_model.version,
                "algorithm": active_model.algorithm,
                "accuracy": active_model.accuracy
            }

        return {
            "total_predictions": total_predictions,
            "total_threats": total_threats,
            "total_datasets": total_datasets,
            "total_training_jobs": total_training_jobs,
            "average_latency": float(avg_latency),
            "active_model": active_model_info
        }

    def get_threats_analytics(self, user_id: int) -> Dict[str, Any]:
        # Total threats
        total_threats = self.db.query(func.count(Threat.id))\
            .filter(Threat.user_id == user_id).scalar() or 0

        # Severity breakdown
        sev_counts = self.db.query(Threat.severity, func.count(Threat.id))\
            .filter(Threat.user_id == user_id)\
            .group_by(Threat.severity).all()
        by_severity = {severity: count for severity, count in sev_counts}
        # Fill defaults
        for s in ["Critical", "High", "Medium", "Low", "Benign"]:
            if s not in by_severity:
                by_severity[s] = 0

        # Category breakdown
        cat_counts = self.db.query(Threat.attack_type, func.count(Threat.id))\
            .filter(Threat.user_id == user_id)\
            .group_by(Threat.attack_type).all()
        by_category = {cat: count for cat, count in cat_counts}

        # Status breakdown
        status_counts = self.db.query(Threat.resolution_status, func.count(Threat.id))\
            .filter(Threat.user_id == user_id)\
            .group_by(Threat.resolution_status).all()
        by_status = {status: count for status, count in status_counts}
        for st in ["Open", "Investigating", "Resolved", "False Positive"]:
            if st not in by_status:
                by_status[st] = 0

        # Recent threats (limit 5)
        recent = self.db.query(Threat)\
            .filter(Threat.user_id == user_id)\
            .order_by(Threat.detection_time.desc())\
            .limit(5).all()

        recent_threats_list = []
        for t in recent:
            recent_threats_list.append({
                "id": t.id,
                "prediction_id": t.prediction_id,
                "severity": t.severity,
                "confidence": t.confidence,
                "threat_score": t.threat_score,
                "attack_type": t.attack_type,
                "mitre_technique": t.mitre_technique,
                "recommended_action": t.recommended_action,
                "detection_time": t.detection_time,
                "resolution_status": t.resolution_status
            })

        return {
            "total_threats": total_threats,
            "by_severity": by_severity,
            "by_category": by_category,
            "by_status": by_status,
            "recent_threats": recent_threats_list
        }

    def get_threats_timeline(
        self,
        user_id: int,
        time_range: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        
        # 1. Parse time filters
        if time_range == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
            group_by_hour = True
        elif time_range == "yesterday":
            start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=1) - timedelta(microseconds=1)
            group_by_hour = True
        elif time_range == "this_week":
            start = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
            group_by_hour = False
        elif time_range == "this_month":
            start = (now - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
            group_by_hour = False
        elif time_range == "custom":
            start = start_date or (now - timedelta(days=7))
            end = end_date or now
            group_by_hour = (end - start).days < 2
        else:
            time_range = "this_week"
            start = (now - timedelta(days=7)).replace(hour=0, minute=0, second=0, microsecond=0)
            end = now
            group_by_hour = False

        # Query all threats within time bound
        threats = self.db.query(Threat)\
            .filter(Threat.user_id == user_id, Threat.detection_time >= start, Threat.detection_time <= end)\
            .order_by(Threat.detection_time.asc()).all()

        # Group data points
        # If group_by_hour, key is "YYYY-MM-DD HH:00". Else key is "YYYY-MM-DD".
        groups = {}
        
        # Initialize groups for timeline labels to ensure timeline is fully populated even with 0 counts
        curr = start
        while curr <= end:
            if group_by_hour:
                label = curr.strftime("%Y-%m-%d %H:00")
                curr += timedelta(hours=1)
            else:
                label = curr.strftime("%Y-%m-%d")
                curr += timedelta(days=1)
            groups[label] = {
                "time_label": label,
                "total_threats": 0,
                "by_severity": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Benign": 0},
                "by_category": {}
            }

        # Populate groups with actual threat records
        for t in threats:
            if group_by_hour:
                label = t.detection_time.strftime("%Y-%m-%d %H:00")
            else:
                label = t.detection_time.strftime("%Y-%m-%d")
            
            # If label not pre-initialized (e.g. edge timezone cases), add it
            if label not in groups:
                groups[label] = {
                    "time_label": label,
                    "total_threats": 0,
                    "by_severity": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0, "Benign": 0},
                    "by_category": {}
                }
            
            groups[label]["total_threats"] += 1
            sev = t.severity
            groups[label]["by_severity"][sev] = groups[label]["by_severity"].get(sev, 0) + 1
            cat = t.attack_type
            groups[label]["by_category"][cat] = groups[label]["by_category"].get(cat, 0) + 1

        # Return sorted list of timeline points
        return sorted(list(groups.values()), key=lambda x: x["time_label"])

    def get_models_analytics(self, user_id: int) -> Dict[str, Any]:
        total_models = self.db.query(func.count(TrainedModel.id))\
            .filter(TrainedModel.user_id == user_id).scalar() or 0

        # Active Model Metrics
        active_model = self.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id, TrainedModel.active_flag).first()
            
        active_metrics = None
        if active_model:
            active_metrics = {
                "accuracy": active_model.accuracy,
                "precision": active_model.precision,
                "recall": active_model.recall,
                "f1_score": active_model.f1_score,
                "roc_auc": active_model.roc_auc
            }

        # Model Performance History
        models = self.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id)\
            .order_by(TrainedModel.created_at.desc()).all()

        history_items = []
        for m in models:
            history_items.append({
                "id": m.id,
                "name": m.name,
                "version": m.version,
                "algorithm": m.algorithm,
                "accuracy": m.accuracy,
                "precision": m.precision,
                "recall": m.recall,
                "f1_score": m.f1_score,
                "created_at": m.created_at
            })

        # Training Job Stats
        job_counts = self.db.query(TrainingJob.status, func.count(TrainingJob.id))\
            .filter(TrainingJob.user_id == user_id)\
            .group_by(TrainingJob.status).all()
        training_job_stats = {status: count for status, count in job_counts}
        for st in ["queued", "running", "completed", "failed"]:
            if st not in training_job_stats:
                training_job_stats[st] = 0

        return {
            "total_models": total_models,
            "active_model_metrics": active_metrics,
            "model_performance_history": history_items,
            "training_job_stats": training_job_stats
        }

    def get_model_monitoring(self, user_id: int) -> Dict[str, Any]:
        active_model = self.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id, TrainedModel.active_flag).first()

        if not active_model:
            return {
                "active_model_id": None,
                "active_model_name": None,
                "active_model_version": None,
                "prediction_count": 0,
                "average_confidence": 0.0,
                "average_latency": 0.0,
                "failure_count": 0
            }

        # Count predictions for active model
        pred_stats = self.db.query(
            func.count(PredictionHistory.id),
            func.avg(PredictionHistory.confidence),
            func.avg(PredictionHistory.processing_latency)
        ).filter(PredictionHistory.model_id == active_model.id).first()

        pred_count = pred_stats[0] or 0
        avg_confidence = float(pred_stats[1] or 0.0)
        avg_latency = float(pred_stats[2] or 0.0)

        # Count failures in System Events
        failure_events = self.db.query(SystemEvent)\
            .filter(SystemEvent.user_id == user_id, SystemEvent.event_type == "prediction_failed").all()
        
        failure_count = 0
        active_model_id_str = str(active_model.id)
        for event in failure_events:
            payload = event.payload or {}
            if payload.get("model_id") == active_model_id_str:
                failure_count += 1

        return {
            "active_model_id": active_model.id,
            "active_model_name": active_model.name,
            "active_model_version": active_model.version,
            "prediction_count": pred_count,
            "average_confidence": avg_confidence,
            "average_latency": avg_latency,
            "failure_count": failure_count
        }

    def get_datasets_analytics(self, user_id: int) -> Dict[str, Any]:
        total_datasets = self.db.query(func.count(Dataset.id))\
            .filter(Dataset.uploaded_by == user_id).scalar() or 0

        total_size = self.db.query(func.sum(Dataset.size_bytes))\
            .filter(Dataset.uploaded_by == user_id).scalar() or 0

        type_counts = self.db.query(Dataset.dataset_type, func.count(Dataset.id))\
            .filter(Dataset.uploaded_by == user_id)\
            .group_by(Dataset.dataset_type).all()
        by_type = {dtype: count for dtype, count in type_counts}
        for dt in ["CSV", "PCAP"]:
            if dt not in by_type:
                by_type[dt] = 0

        recent = self.db.query(Dataset)\
            .filter(Dataset.uploaded_by == user_id)\
            .order_by(Dataset.created_at.desc())\
            .limit(5).all()

        recent_list = []
        for d in recent:
            recent_list.append({
                "id": d.id,
                "filename": d.filename,
                "dataset_type": d.dataset_type,
                "size_bytes": d.size_bytes,
                "status": d.status,
                "created_at": d.created_at
            })

        return {
            "total_datasets": total_datasets,
            "total_size_bytes": int(total_size),
            "by_type": by_type,
            "recent_datasets": recent_list
        }

    def get_audit_logs(
        self,
        user_id: int,
        event_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[SystemEvent]:
        query = self.db.query(SystemEvent).filter(SystemEvent.user_id == user_id)
        if event_type:
            query = query.filter(SystemEvent.event_type == event_type)
            
        return query.order_by(SystemEvent.timestamp.desc()).offset(skip).limit(limit).all()
