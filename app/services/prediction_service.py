import uuid
import numpy as np
from app.ml.model import artifact_manager
from app.services.preprocessing import preprocessor
from app.services.xai_service import xai_service
from app.services.evidence_service import evidence_service
from app.ml.drift import drift_manager

class PredictionService:
    @staticmethod
    def predict_claim(text: str, user_submitted: bool = True) -> dict:
        cleaned = preprocessor.clean_text(text)
        model = artifact_manager.model
        vectorizer = artifact_manager.vectorizer

        # 1. Base ML Model Prediction (Linguistic and stylistic analysis)
        if model is None or vectorizer is None:
            verdict = "unverified"
            confidence = 60
        else:
            vec = vectorizer.transform([cleaned])
            probabilities = model.predict_proba(vec)[0]
            prob_fake = probabilities[0]
            prob_real = probabilities[1]

            if prob_fake >= 0.58:
                verdict = "misinformation"
                confidence = int(np.round(prob_fake * 100))
            elif prob_real >= 0.58:
                verdict = "reliable"
                confidence = int(np.round(prob_real * 100))
            else:
                verdict = "unverified"
                confidence = int(np.round(max(prob_fake, prob_real) * 100))

        # 2. Retrieve Dynamic External Evidence
        sources = evidence_service.verify_claim(text, verdict)

        # 3. Dynamic Evidence-Model Synthesis
        if sources:
            max_source_reliability = max(s.get("reliability", 50) for s in sources)
            
            # If an official government/statutory domain (.gov, .gov.in) confirms the claim
            if max_source_reliability == 100 and verdict != "misinformation":
                verdict = "reliable"
                confidence = 100
            elif max_source_reliability >= 90 and verdict == "unverified":
                verdict = "reliable"
                confidence = max(confidence, 88)

        # 4. Generate Explainability
        words, explanation = xai_service.explain_prediction(text, verdict)
        if confidence == 100:
            explanation = "Verified through authoritative statutory and government portals matching official publications."

        claim_id = f"c_{uuid.uuid4().hex[:8]}"
        title = text if len(text) <= 90 else f"{text[:87]}..."

        return {
            "id": claim_id,
            "verdict": verdict,
            "confidence": confidence,
            "title": title,
            "category": "User Submitted" if user_submitted else "Trending Stream",
            "fullText": text,
            "trendLevel": 85 if user_submitted else 50,
            "engagement": "Live Verification",
            "growth": "+100%",
            "time": "Just now",
            "words": words,
            "explanation": explanation,
            "sources": sources,
            "model": "StreamGuard-XAI v1.0 · Dynamic Adaptive Pipeline",
            "userSubmitted": user_submitted
        }

    @staticmethod
    def update_model_incremental(text: str, ground_truth_label: int):
        model = artifact_manager.model
        vectorizer = artifact_manager.vectorizer

        if model is not None and vectorizer is not None:
            cleaned = preprocessor.clean_text(text)
            vec = vectorizer.transform([cleaned])
            pred_prob = model.predict_proba(vec)[0][ground_truth_label]
            error_val = 1.0 - pred_prob
            model.partial_fit(vec, [ground_truth_label])
            drift_manager.add_sample_error(error_val, f"Incremental update for label: {ground_truth_label}")

prediction_service = PredictionService()