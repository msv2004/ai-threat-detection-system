from typing import Tuple

class AttackClassificationService:
    @staticmethod
    def classify_threat(
        prediction_label: int, 
        threat_score: int, 
        features: dict, 
        algorithm: str
    ) -> Tuple[str, str, str]:
        """
        Analyzes the input features and the prediction to determine the attack category,
        MITRE ATT&CK technique, and recommended action.
        
        Returns: (attack_type, mitre_technique, recommended_action)
        """
        if prediction_label == 0:
            return "Benign", None, None

        attack_type = "Malicious Traffic"
        mitre_technique = "T1071 - Application Layer Protocol"
        recommended_action = "Review network logs and isolate the affected host."

        # Heuristic 1: Anomaly-based model (e.g., Isolation Forest)
        if algorithm == "Isolation Forest":
            attack_type = "Zero-day / Anomaly"
            mitre_technique = "T1562 - Impair Defenses"
            recommended_action = "Investigate anomalous behavior. Host may be compromised."

        # Try to infer from features if present (case-insensitive keys)
        feat_lower = {str(k).lower(): v for k, v in features.items()}
        
        # Check destination port
        dest_port = None
        for key in ["destination port", "dst port", "port"]:
            if key in feat_lower:
                dest_port = feat_lower[key]
                break
                
        if dest_port is not None:
            try:
                port = int(dest_port)
                if port in [21, 22, 23, 3389]:
                    attack_type = "Brute Force"
                    mitre_technique = "T1110 - Brute Force"
                    recommended_action = "Block source IP temporarily. Review authentication logs."
                elif port in [80, 443]:
                    attack_type = "Web Attack / DoS"
                    mitre_technique = "T1498 - Network Denial of Service"
                    recommended_action = "Check WAF logs and monitor web server resource usage."
            except ValueError:
                pass
                
        # Check specific flow metrics if we have them (e.g., flow duration, packet counts)
        if "flow duration" in feat_lower and "total fwd packets" in feat_lower:
            try:
                duration = float(feat_lower["flow duration"])
                packets = float(feat_lower["total fwd packets"])
                if duration > 10000000 and packets < 5:  # Slowloris / Slow DoS behavior
                    attack_type = "Slow DoS"
                    mitre_technique = "T1498.001 - Direct Network Flood"
                    recommended_action = "Adjust timeout settings on web server. Deploy DoS protection."
                elif packets > 10000:
                    attack_type = "Volumetric DoS"
                    mitre_technique = "T1498.001 - Direct Network Flood"
                    recommended_action = "Implement rate limiting. Contact ISP if volume increases."
            except ValueError:
                pass

        return attack_type, mitre_technique, recommended_action
