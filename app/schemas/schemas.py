from typing import List, Optional, Any
from pydantic import BaseModel, Field

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Claim text to verify")

class SourceItem(BaseModel):
    name: str
    domain: str
    reliability: int
    snippet: str

class ClaimResponse(BaseModel):
    id: str
    verdict: str
    confidence: int
    title: str
    category: str
    fullText: str
    trendLevel: Optional[int] = 50
    engagement: Optional[str] = "1K"
    growth: Optional[str] = "+5%"
    time: Optional[str] = "Just now"
    words: List[Any] = []
    explanation: str
    sources: List[SourceItem] = []
    model: str = "StreamGuard-XAI v1.0"
    userSubmitted: bool = False

class ChatRequest(BaseModel):
    claim_id: Optional[str] = None
    question: str

class ChatResponse(BaseModel):
    role: str = "ai"
    text: str

class FeedbackRequest(BaseModel):
    claim_id: str
    feedback_type: str
    rating: Optional[str] = None
    comment: Optional[str] = None

class BookmarkRequest(BaseModel):
    claim_id: str

class ActivityRequest(BaseModel):
    claim_id: str
    action: Optional[str] = "checked"

class DriftStatusResponse(BaseModel):
    drift_detected: bool
    window_size: int
    status: str
    events: List[Any] = []

class InsightsResponse(BaseModel):
    total_claims: int
    misinformation: int
    reliable: int
    unverified: int
    model_status: str
    drift_detected: bool
    recent_drift_events: List[Any] = []
