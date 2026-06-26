import os
from uuid import UUID

# Resolve base directories relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../datasets"))
MODELS_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../models"))

# Ensure base folders exist
os.makedirs(DATASETS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def resolve_dataset_path(dataset) -> str:
    """
    Dynamically rebuilds the absolute file path for a raw dataset file
    based on the current runtime's DATASETS_DIR.
    """
    if not dataset:
        return ""
    return os.path.join(DATASETS_DIR, str(dataset.uploaded_by), dataset.filename)

def resolve_processed_path(processed_dataset, path_val: str) -> str:
    """
    Dynamically rebuilds the absolute file path for a processed dataset split
    based on the current runtime's DATASETS_DIR.
    """
    if not processed_dataset or not path_val:
        return ""
    # Retrieve filename from original path
    filename = os.path.basename(path_val)
    user_id = processed_dataset.original_dataset.uploaded_by
    return os.path.join(DATASETS_DIR, str(user_id), "processed", filename)

def resolve_model_path(model) -> str:
    """
    Dynamically rebuilds the absolute folder path for a trained model directory
    based on the current runtime's MODELS_DIR.
    """
    if not model:
        return ""
    return os.path.join(MODELS_DIR, str(model.user_id), model.name, f"v{model.version}")

def resolve_prediction_path(prediction_job, path_val: str) -> str:
    """
    Dynamically rebuilds the absolute file path for a prediction output CSV file
    based on the current runtime's DATASETS_DIR.
    """
    if not prediction_job or not path_val:
        return ""
    filename = os.path.basename(path_val)
    return os.path.join(DATASETS_DIR, str(prediction_job.user_id), "predictions", filename)
