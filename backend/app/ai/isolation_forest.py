from typing import Dict, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, confusion_matrix
from app.ai.base_trainer import BaseTrainer

class IsolationForestTrainer(BaseTrainer):
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, config: Dict[str, Any]) -> Any:
        params = {
            "n_estimators": config.get("n_estimators", 100),
            "contamination": config.get("contamination", "auto"),
            "random_state": config.get("random_state", 42)
        }
        model = IsolationForest(**params)
        # Unsupervised, fit on features only
        model.fit(X_train)
        return model

    def evaluate(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        # predict returns 1 (normal) and -1 (anomaly)
        y_pred_raw = model.predict(X_test)
        
        # Map normal (1) -> 0, anomaly (-1) -> 1 to match target label schema
        y_pred = np.where(y_pred_raw == -1, 1, 0)

        unique_classes = np.unique(y_test)
        is_binary = len(unique_classes) <= 2
        avg_method = "binary" if is_binary else "weighted"

        # Metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average=avg_method, zero_division=0))
        rec = float(recall_score(y_test, y_pred, average=avg_method, zero_division=0))
        
        # F1 score is "N/A" for Isolation Forest as per specification comparison table
        f1 = None

        # ROC-AUC: Use the decision function (anomalies have lower values)
        # So we negate it, meaning higher score = more anomalous
        roc_auc = None
        try:
            scores = -model.decision_function(X_test)
            roc_auc = float(roc_auc_score(y_test, scores))
        except Exception:
            pass

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred).tolist()

        return {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "confusion_matrix": cm
        }

    def get_explainability(self, model: Any, feature_names: list) -> list:
        # Isolation Forest has no direct feature importances. Return empty list.
        return []
