from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import FeedbackModel, ClaimModel
from app.schemas.schemas import FeedbackRequest
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/api", tags=["Feedback"])

@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    feedback_entry = FeedbackModel(
        claim_id=req.claim_id,
        feedback_type=req.feedback_type,
        rating=req.rating,
        comment=req.comment
    )
    db.add(feedback_entry)
    db.commit()

    if req.feedback_type == "verified_real":
        claim = db.query(ClaimModel).filter(ClaimModel.id == req.claim_id).first()
        if claim:
            prediction_service.update_model_incremental(claim.full_text, ground_truth_label=1)
    elif req.feedback_type == "verified_fake":
        claim = db.query(ClaimModel).filter(ClaimModel.id == req.claim_id).first()
        if claim:
            prediction_service.update_model_incremental(claim.full_text, ground_truth_label=0)

    return {"status": "feedback_recorded"}
