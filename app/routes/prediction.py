import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.schemas import PredictRequest, ClaimResponse
from app.services.prediction_service import prediction_service
from app.database.database import get_db
from app.database.models import ClaimModel, ActivityModel

router = APIRouter(prefix="/api", tags=["Prediction"])

@router.post("/predict", response_model=ClaimResponse)
def predict_claim(req: PredictRequest, db: Session = Depends(get_db)):
    data = prediction_service.predict_claim(req.text, user_submitted=True)

    claim_row = ClaimModel(
        id=data["id"],
        verdict=data["verdict"],
        confidence=data["confidence"],
        title=data["title"],
        category=data["category"],
        full_text=data["fullText"],
        trend_level=data["trendLevel"],
        engagement=data["engagement"],
        growth=data["growth"],
        time_str=data["time"],
        words_json=json.dumps(data["words"]),
        explanation=data["explanation"],
        sources_json=json.dumps(data["sources"]),
        model_name=data["model"],
        user_submitted=True
    )
    db.add(claim_row)
    db.add(ActivityModel(claim_id=data["id"], action="checked"))
    db.commit()

    return data
