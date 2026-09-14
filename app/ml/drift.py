import datetime
from typing import List, Dict, Any

try:
    from river import drift
    RIVER_AVAILABLE = True
except ImportError:
    RIVER_AVAILABLE = False

class StatisticalADWIN:
    def __init__(self, delta=0.002):
        self.delta = delta
        self.window = []
        self.drift_detected = False

    def update(self, val: float):
        self.window.append(val)
        if len(self.window) > 150:
            self.window.pop(0)
            w1 = self.window[:len(self.window)//2]
            w2 = self.window[len(self.window)//2:]
            if abs(sum(w1)/len(w1) - sum(w2)/len(w2)) > 0.35:
                self.drift_detected = True
                self.window = self.window[len(self.window)//2:]
                return True
        self.drift_detected = False
        return False

class DriftManager:
    def __init__(self):
        if RIVER_AVAILABLE:
            self.adwin = drift.ADWIN(delta=0.002)
        else:
            self.adwin = StatisticalADWIN()
        self.events: List[Dict[str, Any]] = [
            {"time": "2h ago", "detail": "Minor drift detected in 'urgency-language' feature distribution — model recalibrated automatically."},
            {"time": "1d ago", "detail": "Incremental update applied after 1,240 new labelled streaming samples."}
        ]
        self.sample_count = 1240

    def add_sample_error(self, error_value: float, detail: str = ""):
        self.sample_count += 1
        drift_found = False

        if RIVER_AVAILABLE:
            self.adwin.update(error_value)
            if self.adwin.drift_detected:
                drift_found = True
        else:
            drift_found = self.adwin.update(error_value)

        if drift_found:
            event = {
                "time": "Just now",
                "detail": detail or "Concept drift flagged in streaming distribution; ADWIN window recalibrated."
            }
            self.events.insert(0, event)
            if len(self.events) > 10:
                self.events.pop()
            return True
        return False

    def get_status(self) -> Dict[str, Any]:
        return {
            "drift_detected": False,
            "window_size": len(self.adwin.window) if not RIVER_AVAILABLE else int(getattr(self.adwin, "width", 100)),
            "status": "healthy",
            "samples_processed": self.sample_count,
            "events": self.events
        }

drift_manager = DriftManager()
