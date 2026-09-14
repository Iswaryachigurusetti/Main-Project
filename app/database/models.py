import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime
from app.database.database import Base

class ClaimModel(Base):
    __tablename__ = "claims"

    id = Column(String, primary_key=True, index=True)
    verdict = Column(String, nullable=False)
    confidence = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="General")
    full_text = Column(Text, nullable=False)
    trend_level = Column(Integer, default=50)
    engagement = Column(String, default="10K")
    growth = Column(String, default="+10%")
    time_str = Column(String, default="Just now")
    words_json = Column(Text, default="[]")
    explanation = Column(Text, nullable=False)
    sources_json = Column(Text, default="[]")
    model_name = Column(String, default="StreamGuard-XAI v1.0")
    user_submitted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ActivityModel(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, index=True, nullable=False)
    action = Column(String, default="checked")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class BookmarkModel(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FeedbackModel(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(String, index=True, nullable=False)
    feedback_type = Column(String, nullable=False)
    rating = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DriftEventModel(Base):
    __tablename__ = "drift_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    time_str = Column(String, nullable=False)
    detail = Column(Text, nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
