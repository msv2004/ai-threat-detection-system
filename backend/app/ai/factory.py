from app.ai.base_trainer import BaseTrainer
from app.ai.logistic_regression import LogisticRegressionTrainer
from app.ai.decision_tree import DecisionTreeTrainer
from app.ai.random_forest import RandomForestTrainer
from app.ai.isolation_forest import IsolationForestTrainer

class TrainerFactory:
    _trainers = {
        "Logistic Regression": LogisticRegressionTrainer,
        "Decision Tree": DecisionTreeTrainer,
        "Random Forest": RandomForestTrainer,
        "Isolation Forest": IsolationForestTrainer
    }

    @classmethod
    def get_trainer(cls, algorithm_name: str) -> BaseTrainer:
        trainer_class = cls._trainers.get(algorithm_name)
        if not trainer_class:
            raise ValueError(
                f"Unsupported algorithm: '{algorithm_name}'. "
                f"Supported algorithms are: {list(cls._trainers.keys())}"
            )
        return trainer_class()
