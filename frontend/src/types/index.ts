export interface User {
  id: number;
  email: string;
  is_active: boolean;
  role_id: number;
  role?: {
    id: number;
    name: string;
    description: string | null;
  };
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Dataset {
  id: string;
  filename: string;
  filepath: string;
  size_bytes: number;
  format: string; // CSV or PCAP
  status: string; // uploaded, processing, completed, failed
  error_message?: string;
  row_count?: number;
  features?: string[];
  created_at: string;
  updated_at: string;
}

export interface PreprocessingJob {
  id: string;
  dataset_id: string;
  status: string; // queued, running, completed, failed
  config: {
    target_column: string;
    missing_value_strategy: string;
    scaling_strategy: string;
    encoding_strategy: string;
    test_size: number;
    random_state: number;
  };
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  processed_dataset?: {
    id: string;
    train_samples: number;
    test_samples: number;
    created_at: string;
  };
}

export interface DatasetProfile {
  id: string;
  dataset_id: string;
  duplicate_rows: number;
  numeric_features: string[];
  categorical_features: string[];
  class_distribution: Record<string, number>;
  created_at: string;
}

export interface TrainingJob {
  id: string;
  dataset_id: string;
  processed_dataset_id?: string;
  algorithm: string; // Logistic Regression, Decision Tree, Random Forest, Isolation Forest
  status: string; // queued, running, completed, failed
  created_at: string;
  started_at?: string;
  finished_at?: string;
  duration?: number;
  error_message?: string;
}

export interface TrainedModel {
  id: string;
  name: string;
  version: number;
  algorithm: string;
  dataset_id: string;
  accuracy?: number;
  f1_score?: number;
  precision?: number;
  recall?: number;
  roc_auc?: number;
  file_path: string;
  created_at: string;
  is_active: boolean;
  feature_importance?: Record<string, number>;
}

export interface Prediction {
  prediction_id: string;
  model_id: string;
  model_version: number;
  prediction_label: number; // 0 or 1
  confidence: number;
  threat_score: number;
  severity: string; // low, medium, high, critical
  explainability: Array<{ feature: string; weight: number }>;
  created_at: string;
}

export interface Threat {
  id: string;
  prediction_id: string;
  attack_category: string; // DoS, Port Scan, Brute Force, etc.
  severity: string; // low, medium, high, critical
  mitre_technique_id: string; // T1046, etc.
  mitre_technique_name: string;
  abuseipdb_score: number;
  virustotal_score: number;
  recommended_action: string;
  resolution_status: string; // Open, Investigating, Resolved, Dismissed
  created_at: string;
  updated_at: string;
  // Flow details
  src_ip?: string;
  dst_ip?: string;
  src_port?: number;
  dst_port?: number;
  protocol?: string;
  flow_id?: string;
}

export interface DetectionSession {
  id: string;
  interface: string;
  mode: string; // live or offline
  status: string; // running, stopped
  start_time: string;
  stop_time?: string;
  packet_count: number;
  flow_count: number;
  threat_count: number;
}

export interface DetectionStatistics {
  session_id: string;
  interface: string;
  duration_seconds: number;
  packet_count: number;
  flow_count: number;
  threat_count: number;
  benign_count: number;
  critical_count: number;
  packets_per_sec: number;
  flows_per_sec: number;
  average_latency: number;
  status?: string;
}

export interface ThreatAlert {
  type: 'threat_alert';
  flow_id: string;
  src_ip: string;
  dst_ip: string;
  dst_port: number;
  protocol: string;
  severity: string;
  confidence: number;
  threat_score: number;
  timestamp?: string;
}

export interface SystemEventPayload {
  type: 'system_event';
  event_type: string;
  payload: any;
  user_id: number | null;
}
