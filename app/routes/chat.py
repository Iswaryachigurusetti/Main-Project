from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.schemas import ChatRequest, ChatResponse
from app.database.database import get_db
from app.database.models import ClaimModel
from app.services.chat_service import chat_service

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest, db: Session = Depends(get_db)):
    claim = None
    if req.claim_id:
        claim = db.query(ClaimModel).filter(ClaimModel.id == req.claim_id).first()
    answer = chat_service.answer_question(req.question, claim)
    return ChatResponse(role="ai", text=answer)
