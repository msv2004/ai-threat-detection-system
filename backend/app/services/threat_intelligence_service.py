from abc import ABC, abstractmethod
from typing import Dict, Any, List
import random
from uuid import UUID
from app.models.prediction import Threat, ThreatIntelligence
from app.database.session import SessionLocal
from app.core.logger import logger

class ThreatIntelligenceProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def enrich(self, ip_address: str) -> Dict[str, Any]:
        pass

class AbuseIPDBMock(ThreatIntelligenceProvider):
    @property
    def name(self) -> str:
        return "AbuseIPDB"

    def enrich(self, ip_address: str) -> Dict[str, Any]:
        # Mock behavior
        is_malicious = random.choice([True, False, False])
        score = random.uniform(0.0, 100.0) if is_malicious else 0.0
        return {
            "malicious_score": score,
            "tags": ["Port Scan", "Brute Force"] if is_malicious else [],
            "details": {
                "ip": ip_address,
                "usageType": "Data Center",
                "domain": "example.com",
                "totalReports": int(score),
            }
        }

class VirusTotalMock(ThreatIntelligenceProvider):
    @property
    def name(self) -> str:
        return "VirusTotal"

    def enrich(self, ip_address: str) -> Dict[str, Any]:
        is_malicious = random.choice([True, False])
        score = random.uniform(50.0, 100.0) if is_malicious else 0.0
        return {
            "malicious_score": score,
            "tags": ["Malware", "C2"] if is_malicious else [],
            "details": {
                "ip": ip_address,
                "reputation": int(-score / 10),
                "harmless_votes": 10 if not is_malicious else 0,
                "malicious_votes": int(score / 10)
            }
        }

class ThreatIntelligenceService:
    def __init__(self):
        self.providers: List[ThreatIntelligenceProvider] = [
            AbuseIPDBMock(),
            VirusTotalMock()
        ]

    def _extract_ip(self, features: dict) -> str:
        feat_lower = {str(k).lower(): v for k, v in features.items()}
        for key in ["source ip", "src ip", "destination ip", "dst ip", "ip"]:
            if key in feat_lower:
                return str(feat_lower[key])
        return "192.168.1.100"  # Fallback mock IP

    async def handle_threat_detected(self, threat_id: UUID, features: dict):
        """
        Event handler for 'threat_detected'.
        """
        logger.info(f"ThreatIntelligenceService: Processing threat {threat_id}")
        ip_address = self._extract_ip(features)
        
        db = SessionLocal()
        try:
            threat = db.query(Threat).filter(Threat.id == threat_id).first()
            if not threat:
                logger.error(f"Threat {threat_id} not found.")
                return

            for provider in self.providers:
                try:
                    result = provider.enrich(ip_address)
                    ti_record = ThreatIntelligence(
                        threat_id=threat.id,
                        provider=provider.name,
                        malicious_score=result.get("malicious_score"),
                        tags=result.get("tags", []),
                        details=result.get("details", {})
                    )
                    db.add(ti_record)
                except Exception as e:
                    logger.error(f"Error enriching with {provider.name}: {e}")
            
            db.commit()
            logger.info(f"ThreatIntelligenceService: Enriched threat {threat_id} with {len(self.providers)} providers.")
        except Exception as e:
            logger.error(f"Database error in ThreatIntelligenceService: {e}")
            db.rollback()
        finally:
            db.close()

    async def handle_threat_generated(self, event, **kwargs):
        """
        Event handler for 'threat_generated' event from the Event Store.
        """
        from app.models.system_event import SystemEvent
        if not isinstance(event, SystemEvent):
            logger.error(f"Invalid event object passed to handle_threat_generated: {type(event)}")
            return
            
        threat_id_str = event.payload.get("threat_id")
        features = event.payload.get("features", {})
        if not threat_id_str:
            logger.error("Event payload does not contain threat_id")
            return
            
        threat_id = UUID(threat_id_str)
        logger.info(f"ThreatIntelligenceService: Processing threat {threat_id} from Event Store")
        await self.handle_threat_detected(threat_id, features)

# Singleton service
threat_intelligence_service = ThreatIntelligenceService()
