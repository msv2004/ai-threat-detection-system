import os
import joblib
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from uuid import UUID

from app.repositories.prediction_repository import PredictionRepository
from app.models.training import TrainedModel
from app.models.prediction import PredictionHistory, Threat
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.core.exceptions import NotFoundError, BadRequestError
from app.core.logger import logger

class ModelCache:
    def __init__(self):
        self._models = {}
        self._preprocessors = {}

    def get_model(self, file_path: str) -> Any:
        if file_path not in self._models:
            full_path = os.path.join(file_path, "model.joblib")
            if not os.path.exists(full_path):
                raise FileNotFoundError(f"Model file not found at {full_path}")
            self._models[file_path] = joblib.load(full_path)
        return self._models[file_path]

    def get_preprocessor(self, file_path: str) -> dict:
        if file_path not in self._preprocessors:
            full_path = os.path.join(file_path, "preprocessor.joblib")
            if not os.path.exists(full_path):
                raise FileNotFoundError(f"Preprocessor file not found at {full_path}")
            self._preprocessors[file_path] = joblib.load(full_path)
        return self._preprocessors[file_path]

    def clear(self):
        self._models.clear()
        self._preprocessors.clear()

# Global in-memory cache instance
model_cache = ModelCache()


class PredictionService:
    def __init__(self, repo: PredictionRepository):
        self.repo = repo

    def get_active_model(self, user_id: int) -> TrainedModel:
        model = self.repo.db.query(TrainedModel)\
            .filter(TrainedModel.user_id == user_id, TrainedModel.active_flag)\
            .first()
        if not model:
            raise BadRequestError("No active model found. Please activate a model in the registry first.")
        return model

    def _preprocess_single(self, input_data: dict, preprocessor_state: dict) -> pd.DataFrame:
        """
        Preprocesses a single raw input record to match training dimensions.
        """
        df = pd.DataFrame([input_data])
        return self.preprocess_dataframe(df, preprocessor_state)

    def preprocess_dataframe(self, df: pd.DataFrame, preprocessor_state: dict) -> pd.DataFrame:
        """
        Preprocesses a DataFrame of raw inputs to match training dimensions.
        """
        # Create a copy to prevent modifying the original dataframe
        df = df.copy()
        
        categorical_cols = preprocessor_state.get("categorical_cols", [])
        numeric_cols = preprocessor_state.get("numeric_cols", [])
        feature_names = preprocessor_state.get("feature_names", [])
        encoding_strategy = preprocessor_state.get("encoding_strategy", "one-hot")
        preprocessor_state.get("scaling_strategy", "standard")
        target_column = preprocessor_state.get("target_column")

        # Drop target column if it exists in the raw dataframe
        if target_column and target_column in df.columns:
            df = df.drop(columns=[target_column])

        # 1. Fill missing columns with defaults
        for col in categorical_cols:
            if col not in df.columns:
                df[col] = "Unknown"
            else:
                df[col] = df[col].fillna("Unknown")

        for col in numeric_cols:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = df[col].fillna(0.0)

        # 2. Categorical encoding
        if len(categorical_cols) > 0:
            if encoding_strategy == 'label':
                label_encoders = preprocessor_state.get("label_encoders", {})
                for col in categorical_cols:
                    le = label_encoders.get(col)
                    if le:
                        # Apply transformation row-wise or convert to str and map
                        # Handle unseen categories gracefully by mapping to first class
                        first_class = le.classes_[0] if len(le.classes_) > 0 else "Unknown"
                        
                        def encode_val(x):
                            val = str(x)
                            return val if val in le.classes_ else first_class
                            
                        df[col] = le.transform(df[col].apply(encode_val))
            elif encoding_strategy == 'one-hot':
                df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

        # Ensure all training features are present (reindex handles new one-hot cols or missing features)
        df = df.reindex(columns=feature_names, fill_value=0)

        # 3. Scaling
        scaler = preprocessor_state.get("scaler")
        if scaler and len(numeric_cols) > 0:
            numeric_present = [c for c in numeric_cols if c in df.columns]
            if len(numeric_present) > 0:
                df[numeric_present] = scaler.transform(df[numeric_present])

        # Ensure exact column alignment and ordering
        df = df.reindex(columns=feature_names, fill_value=0)
        return df

    def predict(
        self,
        request: PredictionRequest,
        user_id: int,
        dataset_id: Optional[UUID] = None,
        job_id: Optional[UUID] = None
    ) -> PredictionResponse:
        import time
        from uuid import uuid4
        start_time = time.time()
        correlation_id = uuid4()
        db = self.repo.db
        
        try:
            # 1. Resolve Model
            if request.model_id:
                model_record = db.query(TrainedModel).filter(TrainedModel.id == request.model_id).first()
                if not model_record or model_record.user_id != user_id:
                    raise NotFoundError("Model not found")
            else:
                model_record = self.get_active_model(user_id)

            # 2. Resolve Model Path and Load from Cache
            from app.utils.path_resolver import resolve_model_path
            resolved_model_dir = resolve_model_path(model_record)
            if not resolved_model_dir or not os.path.exists(resolved_model_dir):
                raise BadRequestError(
                    "Model binary folder is missing from disk. "
                    "Because Render containers are ephemeral, local files are wiped periodically on container restarts. "
                    "Please re-train or activate a model first."
                )

            try:
                model = model_cache.get_model(resolved_model_dir)
                preprocessor_state = model_cache.get_preprocessor(resolved_model_dir)
            except Exception as e:
                logger.error(f"Failed to load cached model artifacts: {e}")
                raise BadRequestError(f"Failed to load model artifacts. Ensure model files exist on disk. Error: {str(e)}")

            # 3. Preprocess Input
            features = self._preprocess_single(request.input_data, preprocessor_state)

            # 4. Perform Inference
            if model_record.algorithm == "Isolation Forest":
                y_pred_raw = model.predict(features)[0]
                prediction_label = 1 if y_pred_raw == -1 else 0
                
                # Anomaly score logic (negate decision function)
                anomaly_score = float(model.decision_function(features)[0])
                # Normalize anomaly score [-0.5, 0.5] to [0, 100] threat score
                # outlier threshold is 0.0. anomaly_score < 0 means anomaly.
                threat_score = int(max(0, min(100, (0.5 - anomaly_score) * 100)))
                
                # Confidence proxy
                confidence = float(min(1.0, max(0.0, (0.5 - anomaly_score) if prediction_label == 1 else (anomaly_score + 0.5))))
            else:
                prediction_label = int(model.predict(features)[0])
                probs = model.predict_proba(features)[0]
                confidence = float(max(probs))
                
                # Threat score: probability of threat class (index 1)
                if len(probs) > 1:
                    threat_score = int(probs[1] * 100)
                else:
                    threat_score = int(prediction_label * 100)

            # 5. Resolve Severity Level
            severity = self._resolve_severity(threat_score)
            latency = float(time.time() - start_time)

            # 6. Save Prediction History Audit
            history_record = self.repo.create_prediction_history(
                user_id=user_id,
                model_id=model_record.id,
                dataset_id=dataset_id,
                prediction_job_id=job_id,
                input_data=request.input_data,
                prediction_label=prediction_label,
                confidence=confidence,
                threat_score=threat_score,
                processing_latency=latency
            )

            # Record Prediction Requested Event
            from app.services.event_store_service import EventStoreService
            try:
                EventStoreService.record_event(
                    db=db,
                    event_type="prediction_requested",
                    payload={
                        "prediction_id": str(history_record.id),
                        "model_id": str(model_record.id),
                        "prediction_label": prediction_label,
                        "confidence": confidence,
                        "threat_score": threat_score,
                        "latency": latency
                    },
                    user_id=user_id,
                    correlation_id=correlation_id
                )
            except Exception as e:
                logger.error(f"Failed to record prediction_requested event: {e}")

            # 7. Create Incident Threat Record if threat detected
            if prediction_label == 1:
                from app.services.attack_classification import AttackClassificationService
                attack_type, mitre_technique, recommended_action = AttackClassificationService.classify_threat(
                    prediction_label, threat_score, request.input_data, model_record.algorithm
                )
                
                threat_data = {
                    "prediction_id": history_record.id,
                    "severity": severity,
                    "confidence": confidence,
                    "threat_score": threat_score,
                    "attack_type": attack_type,
                    "mitre_technique": mitre_technique,
                    "recommended_action": recommended_action,
                    "source_dataset_id": dataset_id,
                    "model_version": model_record.version,
                    "detection_time": datetime.now(timezone.utc),
                    "resolution_status": "Open",
                    "user_id": user_id
                }
                threat_record = self.repo.create_threat(threat_data)
                
                # Record Threat Generated Event
                try:
                    EventStoreService.record_event(
                        db=db,
                        event_type="threat_generated",
                        payload={
                            "threat_id": str(threat_record.id),
                            "prediction_id": str(history_record.id),
                            "severity": severity,
                            "threat_score": threat_score,
                            "attack_type": attack_type,
                            "mitre_technique": mitre_technique,
                            "features": request.input_data
                        },
                        user_id=user_id,
                        correlation_id=correlation_id
                    )
                except Exception as e:
                    logger.error(f"Failed to record threat_generated event: {e}")

            # 8. Compute Explainability Top Features
            explainability = self._resolve_explainability(model_record, model, preprocessor_state, features)

            return PredictionResponse(
                prediction_id=history_record.id,
                model_id=model_record.id,
                model_version=model_record.version,
                prediction_label=prediction_label,
                confidence=confidence,
                threat_score=threat_score,
                severity=severity,
                explainability=explainability
            )

        except Exception as e:
            active_model_id = None
            try:
                model_rec = self.get_active_model(user_id)
                active_model_id = str(model_rec.id)
            except Exception:
                pass

            from app.services.event_store_service import EventStoreService
            try:
                EventStoreService.record_event(
                    db=db,
                    event_type="prediction_failed",
                    payload={
                        "model_id": active_model_id,
                        "error": str(e),
                        "input_data": request.input_data
                    },
                    user_id=user_id,
                    correlation_id=correlation_id
                )
            except Exception:
                pass
            raise e

    def _resolve_severity(self, threat_score: int) -> str:
        if threat_score <= 20:
            return "Benign"
        elif threat_score <= 40:
            return "Low"
        elif threat_score <= 60:
            return "Medium"
        elif threat_score <= 80:
            return "High"
        else:
            return "Critical"

    def _resolve_explainability(self, model_record: TrainedModel, model: Any, preprocessor_state: dict, features: pd.DataFrame) -> List[Dict[str, Any]]:
        explainability = []
        feature_names = preprocessor_state.get("feature_names", [])
        try:
            if model_record.algorithm in ["Random Forest", "Decision Tree"] and hasattr(model, "feature_importances_"):
                importances = model.feature_importances_
                feat_imp = [
                    {"feature": str(n), "importance": float(imp)}
                    for n, imp in zip(feature_names, importances)
                ]
                explainability = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)[:5]
            elif model_record.algorithm == "Logistic Regression" and hasattr(model, "coef_"):
                coefs = model.coef_[0]
                vals = features.iloc[0].values
                contribs = coefs * vals  # Log-odds contribution
                feat_contrib = [
                    {"feature": str(n), "importance": float(c)}
                    for n, c in zip(feature_names, contribs)
                ]
                explainability = sorted(feat_contrib, key=lambda x: abs(x["importance"]), reverse=True)[:5]
        except Exception as e:
            logger.warning(f"Failed to generate explainability features: {e}")
        return explainability

    def get_prediction(self, prediction_id: UUID, user_id: int) -> PredictionHistory:
        record = self.repo.get_prediction_history(prediction_id)
        if not record or record.user_id != user_id:
            raise NotFoundError("Prediction record not found")
        return record

    def list_predictions(self, user_id: int, model_id: Optional[UUID] = None, skip: int = 0, limit: int = 100) -> List[PredictionHistory]:
        return self.repo.list_prediction_histories(user_id, model_id, skip, limit)

    def list_threats(self, user_id: int, resolution_status: Optional[str] = None) -> List[Threat]:
        return self.repo.list_threats(user_id, resolution_status)

    def update_threat_status(self, threat_id: UUID, resolution_status: str, user_id: int) -> Threat:
        threat = self.repo.get_threat(threat_id)
        if not threat or threat.user_id != user_id:
            raise NotFoundError("Threat incident not found")
        
        old_status = threat.resolution_status
        updated_threat = self.repo.update_threat_status(threat_id, resolution_status)
        
        # Log threat_closed event if transition is to a closed status
        if resolution_status in ["Resolved", "False Positive"]:
            from app.services.event_store_service import EventStoreService
            try:
                EventStoreService.record_event(
                    db=self.repo.db,
                    event_type="threat_closed",
                    payload={
                        "threat_id": str(threat_id),
                        "old_status": old_status,
                        "new_status": resolution_status
                    },
                    user_id=user_id
                )
            except Exception:
                pass
                
        return updated_threat

    def start_batch_job(
        self,
        config: Any,
        user_id: int,
        background_tasks: Any
    ) -> Any:
        db = self.repo.db
        
        # Verify dataset exists and belongs to user
        from app.models.dataset import Dataset
        from app.utils.path_resolver import resolve_dataset_path, resolve_model_path
        
        dataset = db.query(Dataset).filter(Dataset.id == config.dataset_id).first()
        if not dataset or dataset.uploaded_by != user_id:
            raise NotFoundError("Dataset not found")
            
        if dataset.status != "ready":
            raise BadRequestError("Dataset is not ready for predictions.")

        # Verify raw dataset file exists
        resolved_dataset_path_val = resolve_dataset_path(dataset)
        if not resolved_dataset_path_val or not os.path.exists(resolved_dataset_path_val):
            raise BadRequestError(
                "Dataset file is missing from backend disk. "
                "Because Render containers are ephemeral, local files are wiped periodically on container restarts. "
                "Please delete this dataset and re-upload the CSV file."
            )

        # Resolve model
        if config.model_id:
            model_record = db.query(TrainedModel).filter(TrainedModel.id == config.model_id).first()
            if not model_record or model_record.user_id != user_id:
                raise NotFoundError("Model not found")
        else:
            model_record = self.get_active_model(user_id)

        # Verify model directory exists
        resolved_model_dir = resolve_model_path(model_record)
        if not resolved_model_dir or not os.path.exists(resolved_model_dir):
            raise BadRequestError(
                "Model files are missing from backend disk. "
                "Because Render containers are ephemeral, local files are wiped periodically on container restarts. "
                "Please retrain or activate a model."
            )

        # Create Prediction Job
        job = self.repo.create_prediction_job(user_id, model_record.id, dataset.id)

        # Enqueue background task
        from app.services.prediction_tasks import run_prediction_job
        background_tasks.add_task(
            run_prediction_job,
            job.id,
            dataset.id,
            model_record.id,
            user_id
        )

        return job

    def get_prediction_job(self, job_id: UUID, user_id: int) -> Any:
        job = self.repo.get_prediction_job(job_id)
        if not job or job.user_id != user_id:
            raise NotFoundError("Prediction job not found")
        return job

    def list_prediction_jobs(self, user_id: int) -> List[Any]:
        return self.repo.list_prediction_jobs(user_id)
