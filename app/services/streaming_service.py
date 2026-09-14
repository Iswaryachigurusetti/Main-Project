import os
import json
import asyncio
import logging
import feedparser
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.models import ClaimModel
from app.services.prediction_service import prediction_service

logger = logging.getLogger("StreamingEngine")

# Live syndication endpoints for continuous text ingestion
LIVE_RSS_FEEDS = [
    {"url": "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en", "category": "Top News"},
    {"url": "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1", "category": "Government & Policy"},
    {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "category": "World Affairs"},
    {"url": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", "category": "National"}
]

class LiveStreamingEngine:
    def __init__(self):
        self.seen_titles = set()
        self.is_running = False

    def ingest_claim_item(self, db: Session, title: str, full_text: str, category: str):
        # Prevent processing duplicate headlines
        if title in self.seen_titles:
            return None

        # Verify against database record
        existing = db.query(ClaimModel).filter(ClaimModel.title == title).first()
        if existing:
            self.seen_titles.add(title)
            return None

        # Run through NLP, ML Model, and XAI attribution pipeline
        pred_data = prediction_service.predict_claim(full_text or title, user_submitted=False)

        claim_model = ClaimModel(
            id=pred_data["id"],
            verdict=pred_data["verdict"],
            confidence=pred_data["confidence"],
            title=title,
            category=category,
            full_text=full_text or title,
            trend_level=pred_data.get("trendLevel", 75),
            engagement=pred_data.get("engagement", "Streaming"),
            growth=pred_data.get("growth", "+15%"),
            time_str="Just now",
            words_json=json.dumps(pred_data["words"]),
            explanation=pred_data["explanation"],
            sources_json=json.dumps(pred_data["sources"]),
            model_name=pred_data["model"],
            user_submitted=False
        )

        db.add(claim_model)
        db.commit()
        db.refresh(claim_model)

        self.seen_titles.add(title)
        logger.info(f"Stream Ingested: [{pred_data['verdict'].upper()}] - {title[:60]}...")
        return claim_model

    async def run_continuous_stream(self, interval_seconds: int = 15):
        """Asynchronous loop polling live incoming streaming text every interval."""
        self.is_running = True
        logger.info("Real-Time Streaming Text Pipeline Initialized.")

        while self.is_running:
            try:
                for feed_source in LIVE_RSS_FEEDS:
                    parsed_feed = feedparser.parse(feed_source["url"])
                    
                    if not parsed_feed.entries:
                        continue

                    # Process the latest entry from the feed
                    latest_entry = parsed_feed.entries[0]
                    title = getattr(latest_entry, "title", "").strip()
                    summary = getattr(latest_entry, "summary", "").strip()

                    if title:
                        with SessionLocal() as db:
                            self.ingest_claim_item(
                                db=db,
                                title=title,
                                full_text=summary if summary else title,
                                category=feed_source["category"]
                            )

                    await asyncio.sleep(2)  # Smooth rate limiting across feeds

            except Exception as e:
                logger.error(f"Streaming error encountered: {e}")

            await asyncio.sleep(interval_seconds)

streaming_service = LiveStreamingEngine()