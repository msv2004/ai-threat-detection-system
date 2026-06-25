import pandas as pd
import numpy as np
import os
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder
from app.schemas.preprocessing import PreprocessingConfig

class DatasetPreprocessor:
    """
    Core utility to process and profile datasets using pandas and scikit-learn.
    """
    def __init__(self, file_path: str, config: PreprocessingConfig):
        self.file_path = file_path
        self.config = config
        self.df = None
        self.scaler = None
        self.label_encoders = {}
        self.target_label_encoder = None
        self.categorical_cols = []
        self.numeric_cols = []

    def load_data(self):
        # Determine file type based on extension
        ext = os.path.splitext(self.file_path)[1].lower()
        if ext == '.csv':
            self.df = pd.read_csv(self.file_path)
        elif ext == '.parquet':
            self.df = pd.read_parquet(self.file_path)
        else:
            raise ValueError(f"Unsupported file type for preprocessing: {ext}")

    def profile_dataset(self) -> Dict[str, Any]:
        """
        Generates a profile report of the dataset.
        """
        if self.df is None:
            self.load_data()

        numeric_cols = self.df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = self.df.select_dtypes(exclude=[np.number]).columns.tolist()

        duplicate_rows = int(self.df.duplicated().sum())

        class_distribution = {}
        if self.config.target_column in self.df.columns:
            class_distribution = self.df[self.config.target_column].value_counts().to_dict()

        return {
            "duplicate_rows": duplicate_rows,
            "numeric_features": numeric_cols,
            "categorical_features": categorical_cols,
            "class_distribution": class_distribution
        }

    def process(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """
        Executes the preprocessing pipeline and returns (X_train, X_test, y_train, y_test).
        """
        if self.df is None:
            self.load_data()

        # 1. Handle Duplicates
        self.df.drop_duplicates(inplace=True)

        # 2. Handle Missing Values
        if self.config.missing_value_strategy == 'drop':
            self.df.dropna(inplace=True)
        else:
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            categorical_cols = self.df.select_dtypes(exclude=[np.number]).columns

            for col in numeric_cols:
                if self.config.missing_value_strategy == 'mean':
                    self.df[col] = self.df[col].fillna(self.df[col].mean())
                elif self.config.missing_value_strategy == 'median':
                    self.df[col] = self.df[col].fillna(self.df[col].median())
                elif self.config.missing_value_strategy == 'most_frequent':
                    self.df[col] = self.df[col].fillna(self.df[col].mode()[0] if not self.df[col].mode().empty else 0)

            for col in categorical_cols:
                self.df[col] = self.df[col].fillna(self.df[col].mode()[0] if not self.df[col].mode().empty else "Unknown")

        # Ensure target column exists
        if self.config.target_column not in self.df.columns:
            raise ValueError(f"Target column '{self.config.target_column}' not found in dataset.")

        # Separate Features (X) and Target (y)
        X = self.df.drop(columns=[self.config.target_column])
        y = self.df[self.config.target_column]

        # 3. Categorical Encoding (Features only)
        self.label_encoders = {}
        self.categorical_cols = list(X.select_dtypes(exclude=[np.number]).columns)
        if len(self.categorical_cols) > 0:
            if self.config.encoding_strategy == 'one-hot':
                X = pd.get_dummies(X, columns=self.categorical_cols, drop_first=True)
            elif self.config.encoding_strategy == 'label':
                for col in self.categorical_cols:
                    le = LabelEncoder()
                    X[col] = le.fit_transform(X[col].astype(str))
                    self.label_encoders[col] = le

        # Encode target if it is categorical
        self.target_label_encoder = None
        if y.dtype == 'object' or y.dtype.name == 'category':
            le_target = LabelEncoder()
            y = pd.Series(le_target.fit_transform(y.astype(str)), name=y.name, index=y.index)
            self.target_label_encoder = le_target

        # 4. Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=self.config.test_size, 
            random_state=self.config.random_state
        )

        # 5. Feature Scaling (Fit on train, transform train and test)
        self.scaler = None
        self.numeric_cols = list(X_train.select_dtypes(include=[np.number]).columns)
        if len(self.numeric_cols) > 0:
            if self.config.scaling_strategy == 'standard':
                self.scaler = StandardScaler()
            elif self.config.scaling_strategy == 'min-max':
                self.scaler = MinMaxScaler()

            if self.scaler:
                X_train[self.numeric_cols] = self.scaler.fit_transform(X_train[self.numeric_cols])
                X_test[self.numeric_cols] = self.scaler.transform(X_test[self.numeric_cols])
        return X_train, X_test, y_train, y_test
