from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import ClaimModel
from app.schemas.schemas import InsightsResponse
from app.ml.drift import drift_manager

router = APIRouter(prefix="/api", tags=["Insights"])

@router.get("/insights", response_model=InsightsResponse)
def get_insights(db: Session = Depends(get_db)):
    total = db.query(ClaimModel).count()
    misinfo = db.query(ClaimModel).filter(ClaimModel.verdict == "misinformation").count()
    reliable = db.query(ClaimModel).filter(ClaimModel.verdict == "reliable").count()
    unverified = db.query(ClaimModel).filter(ClaimModel.verdict == "unverified").count()

    drift_info = drift_manager.get_status()

    return InsightsResponse(
        total_claims=total,
        misinformation=misinfo,
        reliable=reliable,
        unverified=unverified,
        model_status="healthy",
        drift_detected=drift_info["drift_detected"],
        recent_drift_events=drift_info["events"]
    )
