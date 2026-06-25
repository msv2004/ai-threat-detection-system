from uuid import UUID
from app.database.session import SessionLocal
from app.repositories.dataset_repository import DatasetRepository
from app.utils.file_parser import calculate_sha256, parse_csv_metadata
from app.core.logger import logger

def process_dataset_background_task(dataset_id: UUID, file_path: str, dataset_type: str):
    """
    Background task to process an uploaded dataset.
    Generates SHA-256 hash and extracts metadata (rows, columns, etc.).
    """
    logger.info(f"Started processing background task for dataset {dataset_id}")
    db = SessionLocal()
    try:
        repo = DatasetRepository(db)
        dataset = repo.get_by_id(dataset_id)
        
        if not dataset:
            logger.error(f"Dataset {dataset_id} not found in DB during background processing")
            return

        # 1. Calculate Hash
        dataset.sha256_hash = calculate_sha256(file_path)
        logger.info(f"Calculated SHA-256 for dataset {dataset_id}")

        # 2. Extract Metadata based on type
        if dataset_type == "CSV":
            try:
                metadata = parse_csv_metadata(file_path)
                dataset.rows = metadata["rows"]
                dataset.columns = metadata["columns"]
                dataset.missing_values = metadata["missing_values"]
                logger.info(f"Parsed CSV metadata for dataset {dataset_id}")
            except Exception as e:
                logger.error(f"Failed to parse CSV for dataset {dataset_id}: {e}")
                dataset.status = "failed"
                repo.update(dataset)
                return

        # 3. Mark as Ready
        dataset.status = "ready"
        repo.update(dataset)
        logger.info(f"Dataset {dataset_id} processing completed successfully")

    except Exception as e:
        logger.error(f"Unexpected error processing dataset {dataset_id}: {e}", exc_info=True)
        # Attempt to mark as failed
        try:
            dataset = repo.get_by_id(dataset_id)
            if dataset:
                dataset.status = "failed"
                repo.update(dataset)
        except Exception:
            pass
    finally:
        db.close()
