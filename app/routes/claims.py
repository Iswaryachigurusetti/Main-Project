import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import ClaimModel
from app.schemas.schemas import ClaimResponse

router = APIRouter(prefix="/api/claims", tags=["Claims"])

def model_to_dict(c: ClaimModel) -> dict:
    return {
        "id": c.id,
        "verdict": c.verdict,
        "confidence": c.confidence,
        "title": c.title,
        "category": c.category,
        "fullText": c.full_text,
        "trendLevel": c.trend_level,
        "engagement": c.engagement,
        "growth": c.growth,
        "time": c.time_str,
        "words": json.loads(c.words_json) if c.words_json else [],
        "explanation": c.explanation,
        "sources": json.loads(c.sources_json) if c.sources_json else [],
        "model": c.model_name,
        "userSubmitted": c.user_submitted
    }

@router.get("/trending", response_model=List[ClaimResponse])
def get_trending_claims(db: Session = Depends(get_db)):
    claims = db.query(ClaimModel).order_by(ClaimModel.trend_level.desc()).all()
    return [model_to_dict(c) for c in claims]

@router.get("/{claim_id}", response_model=ClaimResponse)
def get_claim_by_id(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(ClaimModel).filter(ClaimModel.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return model_to_dict(claim)

@router.get("/{claim_id}/evidence")
def get_claim_evidence(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(ClaimModel).filter(ClaimModel.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"sources": json.loads(claim.sources_json) if claim.sources_json else []}
