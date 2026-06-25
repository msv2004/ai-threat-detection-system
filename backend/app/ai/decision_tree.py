from typing import Dict, Any
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from app.ai.base_trainer import BaseTrainer

class DecisionTreeTrainer(BaseTrainer):
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, config: Dict[str, Any]) -> Any:
        params = {
            "criterion": config.get("criterion", "gini"),
            "max_depth": config.get("max_depth", None),
            "min_samples_split": config.get("min_samples_split", 2),
            "random_state": config.get("random_state", 42)
        }
        model = DecisionTreeClassifier(**params)
        model.fit(X_train, y_train)
        return model

    def evaluate(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        y_pred = model.predict(X_test)
        
        unique_classes = np.unique(y_test)
        is_binary = len(unique_classes) <= 2
        avg_method = "binary" if is_binary else "weighted"

        # Metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, average=avg_method, zero_division=0))
        rec = float(recall_score(y_test, y_pred, average=avg_method, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, average=avg_method, zero_division=0))

        # ROC-AUC
        roc_auc = None
        try:
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X_test)
                if is_binary:
                    roc_auc = float(roc_auc_score(y_test, probs[:, 1]))
                else:
                    roc_auc = float(roc_auc_score(y_test, probs, multi_class="ovr", average="weighted"))
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
        try:
            importances = model.feature_importances_
            feat_imp = [
                {"feature": str(name), "importance": float(imp)}
                for name, imp in zip(feature_names, importances)
            ]
            return sorted(feat_imp, key=lambda x: x["importance"], reverse=True)
        except Exception:
            return []
