import os
import asyncio
from dotenv import load_dotenv

# Load .env file automatically
load_dotenv()
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.services.streaming_service import streaming_service
from app.routes import prediction, claims, chat, drift, activity, bookmarks, feedback, insights

# Initialize SQLite database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch real-time streaming worker in background
    stream_task = asyncio.create_task(streaming_service.run_continuous_stream(interval_seconds=20))
    yield
    # Shutdown: Stop stream
    streaming_service.is_running = False
    stream_task.cancel()

app = FastAPI(
    title="Verify-AI Backend API",
    description="Adaptive Explainable ML Framework for Real-Time Misinformation Detection",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for Vite frontend (Port 5173)
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(prediction.router)
app.include_router(claims.router)
app.include_router(chat.router)
app.include_router(drift.router)
app.include_router(activity.router)
app.include_router(bookmarks.router)
app.include_router(feedback.router)
app.include_router(insights.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "streaming": "active",
        "system": "Verify-AI Real-Time Engine",
        "docs": "/docs"
    }