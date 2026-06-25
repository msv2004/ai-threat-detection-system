import os
import time
import traceback
import pandas as pd
import numpy as np
from uuid import UUID
from typing import Optional

from app.database.session import SessionLocal
from app.repositories.prediction_repository import PredictionRepository
from app.services.prediction_service import PredictionService, model_cache
from app.models.prediction import PredictionHistory, Threat
from app.models.training import TrainedModel
from app.models.dataset import Dataset
from app.core.logger import logger

def run_prediction_job(job_id: UUID, dataset_id: UUID, model_id: Optional[UUID], user_id: int):
    """
    Background worker that runs batch predictions on an uploaded dataset.
    """
    logger.info(f"Starting batch prediction job {job_id} for dataset {dataset_id}")
    
    db = SessionLocal()
    repo = PredictionRepository(db)
    prediction_service = PredictionService(repo)
    
    repo.update_prediction_job(job_id, status="running")
    start_time = time.time()
    
    try:
        # 1. Resolve Model
        if model_id:
            model_record = db.query(TrainedModel).filter(TrainedModel.id == model_id).first()
            if not model_record or model_record.user_id != user_id:
                raise ValueError("Specified model not found or unauthorized")
        else:
            model_record = prediction_service.get_active_model(user_id)
            
        # 2. Resolve Dataset
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset or dataset.uploaded_by != user_id:
            raise ValueError("Dataset not found or unauthorized")

        # 3. Read dataset file from disk
        ext = os.path.splitext(dataset.file_path)[1].lower()
        if ext == '.csv':
            raw_df = pd.read_csv(dataset.file_path)
        elif ext == '.parquet':
            raw_df = pd.read_parquet(dataset.file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        if len(raw_df) == 0:
            raise ValueError("Dataset is empty")

        # 4. Load Model and Preprocessor
        model = model_cache.get_model(model_record.file_path)
        preprocessor_state = model_cache.get_preprocessor(model_record.file_path)

        # 5. Preprocess DataFrame
        preprocessed_df = prediction_service.preprocess_dataframe(raw_df, preprocessor_state)

        # 6. Predict in vectorised batch form
        if model_record.algorithm == "Isolation Forest":
            y_pred_raw = model.predict(preprocessed_df)
            predictions = np.where(y_pred_raw == -1, 1, 0)
            
            anomaly_scores = model.decision_function(preprocessed_df)
            threat_scores = np.clip((0.5 - anomaly_scores) * 100, 0, 100).astype(int)
            confidences = np.clip(np.where(predictions == 1, 0.5 - anomaly_scores, anomaly_scores + 0.5), 0.0, 1.0)
        else:
            predictions = model.predict(preprocessed_df).astype(int)
            probs = model.predict_proba(preprocessed_df)
            confidences = np.max(probs, axis=1)
            
            if probs.shape[1] > 1:
                threat_scores = (probs[:, 1] * 100).astype(int)
            else:
                threat_scores = (predictions * 100).astype(int)

        # Resolve severity list
        sevs = []
        for ts in threat_scores:
            sevs.append(prediction_service._resolve_severity(int(ts)))

        # Append predictions to raw dataframe
        output_df = raw_df.copy()
        output_df["prediction"] = predictions
        output_df["confidence"] = confidences
        output_df["threat_score"] = threat_scores
        output_df["severity"] = sevs

        # Save output dataframe as CSV on disk
        output_dir = os.path.join("datasets", str(user_id), "predictions")
        os.makedirs(output_dir, exist_ok=True)
        output_file_path = os.path.join(output_dir, f"{job_id}_predictions.csv")
        output_df.to_csv(output_file_path, index=False)

        # 7. Aggregate Threat Report
        total_samples = len(raw_df)
        num_threats = int(np.sum(predictions == 1))
        avg_confidence = float(np.mean(confidences))
        prediction_duration = float(time.time() - start_time)
        
        # Get highest severity detected
        unique_sevs = set(sevs)
        highest_sev = "Benign"
        for s in ["Critical", "High", "Medium", "Low", "Benign"]:
            if s in unique_sevs:
                highest_sev = s
                break

        report = {
            "total_samples": total_samples,
            "number_of_threats": num_threats,
            "threat_distribution": {
                "benign": total_samples - num_threats,
                "threat": num_threats
            },
            "average_confidence": avg_confidence,
            "highest_severity": highest_sev,
            "prediction_duration": prediction_duration
        }

        # 8. Bulk Database inserts
        prediction_records = []
        for idx, row in raw_df.iterrows():
            row_dict = row.to_dict()
            pred_label = int(predictions[idx])
            conf = float(confidences[idx])
            score = int(threat_scores[idx])
            
            # Clean dictionary (no appended results)
            input_data = {
                k: v for k, v in row_dict.items() 
                if k not in ["prediction", "confidence", "threat_score", "severity"]
            }
            
            rec = PredictionHistory(
                user_id=user_id,
                model_id=model_record.id,
                dataset_id=dataset_id,
                prediction_job_id=job_id,
                input_data=input_data,
                prediction_label=pred_label,
                confidence=conf,
                threat_score=score
            )
            prediction_records.append(rec)
            
        db.add_all(prediction_records)
        db.commit()

        # Insert incidents for threat detections
        threat_records = []
        for idx, rec in enumerate(prediction_records):
            if rec.prediction_label == 1:
                threat_rec = Threat(
                    prediction_id=rec.id,
                    severity=sevs[idx],
                    confidence=rec.confidence,
                    threat_score=rec.threat_score,
                    attack_type="Anomaly" if model_record.algorithm == "Isolation Forest" else "Malicious Traffic",
                    source_dataset_id=dataset_id,
                    model_version=model_record.version,
                    user_id=user_id
                )
                threat_records.append(threat_rec)
                
        if len(threat_records) > 0:
            db.add_all(threat_records)
            db.commit()

        # Update Job Status
        repo.update_prediction_job(
            job_id,
            status="completed",
            output_file_path=output_file_path,
            report=report
        )
        logger.info(f"Batch prediction job {job_id} finished successfully. Report: {report}")
        
    except Exception as e:
        logger.error(f"Batch prediction job {job_id} failed: {str(e)}")
        logger.error(traceback.format_exc())
        repo.update_prediction_job(
            job_id,
            status="failed",
            error_message=str(e)
        )
    finally:
        db.close()
