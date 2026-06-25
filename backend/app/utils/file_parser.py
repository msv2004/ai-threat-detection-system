import hashlib
import pandas as pd
from typing import Dict, Any

def calculate_sha256(file_path: str) -> str:
    """Calculates the SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def parse_csv_metadata(file_path: str) -> Dict[str, Any]:
    """Parses a CSV file to extract rows, columns, and missing values."""
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Calculate metadata
        rows = len(df)
        columns = len(df.columns)
        # isnull().sum().sum() gets the total number of missing values across all columns
        missing_values = int(df.isnull().sum().sum())
        
        return {
            "rows": rows,
            "columns": columns,
            "missing_values": missing_values
        }
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file: {str(e)}")
