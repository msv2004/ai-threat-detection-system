from typing import Dict, Any

class FeatureValidator:
    """
    Validates and aligns extracted flow features with the exact schema
    expected by the active machine learning model.
    """
    
    @staticmethod
    def align_features(features: Dict[str, Any], preprocessor_state: dict) -> Dict[str, Any]:
        """
        Ensures the feature dictionary matches the expected columns.
        Adds missing columns with defaults.
        Converts datatypes.
        """
        aligned = {}
        
        # The preprocessor state from PredictionService contains the raw columns
        numeric_cols = preprocessor_state.get("numeric_cols", [])
        categorical_cols = preprocessor_state.get("categorical_cols", [])
        
        # 1. Align Numeric Columns
        for col in numeric_cols:
            if col in features:
                try:
                    aligned[col] = float(features[col])
                except (ValueError, TypeError):
                    aligned[col] = 0.0
            else:
                # Fill missing with default
                aligned[col] = 0.0
                
        # 2. Align Categorical Columns
        for col in categorical_cols:
            if col in features:
                aligned[col] = str(features[col])
            else:
                # Fill missing with default
                aligned[col] = "Unknown"
                
        # Optional: We could strictly drop extra columns to keep the payload clean
        # But prediction service will reindex anyway. We just ensure we provide a clean aligned dict.
        
        return aligned
