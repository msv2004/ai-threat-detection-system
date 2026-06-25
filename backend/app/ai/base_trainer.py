from abc import ABC, abstractmethod
from typing import Dict, Any
import pandas as pd

class BaseTrainer(ABC):
    @abstractmethod
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, config: Dict[str, Any]) -> Any:
        """
        Train the model on the preprocessed training dataset.
        Returns the trained model object.
        """
        pass

    @abstractmethod
    def evaluate(self, model: Any, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """
        Evaluate the trained model on test dataset and return metrics:
        - accuracy (float)
        - precision (float)
        - recall (float)
        - f1_score (float or None)
        - roc_auc (float or None)
        - confusion_matrix (list of lists or None)
        """
        pass

    @abstractmethod
    def get_explainability(self, model: Any, feature_names: list) -> list:
        """
        Calculate and return feature importance list of dicts:
        [{"feature": name, "importance": score}] sorted descending.
        """
        pass
