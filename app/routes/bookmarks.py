from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import BookmarkModel
from app.schemas.schemas import BookmarkRequest

router = APIRouter(prefix="/api", tags=["Bookmarks"])

@router.get("/bookmarks")
def get_bookmarks(db: Session = Depends(get_db)):
    bms = db.query(BookmarkModel).all()
    return [b.claim_id for b in bms]

@router.post("/bookmarks")
def add_bookmark(req: BookmarkRequest, db: Session = Depends(get_db)):
    existing = db.query(BookmarkModel).filter(BookmarkModel.claim_id == req.claim_id).first()
    if not existing:
        db.add(BookmarkModel(claim_id=req.claim_id))
        db.commit()
    return {"status": "bookmarked", "claim_id": req.claim_id}

@router.delete("/bookmarks/{claim_id}")
def remove_bookmark(claim_id: str, db: Session = Depends(get_db)):
    db.query(BookmarkModel).filter(BookmarkModel.claim_id == claim_id).delete()
    db.commit()
    return {"status": "removed", "claim_id": claim_id}
