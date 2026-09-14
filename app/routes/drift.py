from fastapi import APIRouter
from app.schemas.schemas import DriftStatusResponse
from app.ml.drift import drift_manager

router = APIRouter(prefix="/api", tags=["Drift"])

@router.get("/drift", response_model=DriftStatusResponse)
def get_drift_status():
    return drift_manager.get_status()
