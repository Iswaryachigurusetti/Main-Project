from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import ActivityModel
from app.schemas.schemas import ActivityRequest

router = APIRouter(prefix="/api", tags=["Activity"])

@router.get("/activity")
def get_activities(db: Session = Depends(get_db)):
    acts = db.query(ActivityModel).order_by(ActivityModel.created_at.desc()).all()
    return [{"claimId": a.claim_id, "action": a.action, "at": a.created_at.isoformat()} for a in acts]

@router.post("/activity")
def record_activity(req: ActivityRequest, db: Session = Depends(get_db)):
    act = ActivityModel(claim_id=req.claim_id, action=req.action)
    db.add(act)
    db.commit()
    return {"status": "success"}
