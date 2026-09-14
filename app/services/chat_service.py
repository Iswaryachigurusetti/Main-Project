import os
import re
import requests
from dotenv import load_dotenv
from typing import Optional
from app.database.models import ClaimModel
from app.services.evidence_service import evidence_service

# Ensure environment variables are loaded
load_dotenv()

class ChatService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
        self.model = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")
        self.search_api_key = os.getenv("SEARCH_API_KEY", "")

    def _clean_scraped_text(self, text: str) -> str:
        """Converts raw scraped text and pipe tables into clean bulleted lines."""
        if not text:
            return ""

        # If text contains raw pipe tables, parse them cleanly
        if "|" in text:
            raw_parts = [p.strip() for p in text.split("|") if p.strip() and p.strip() not in ["S.No", "Particulars", "Dates & Timings", "---"]]
            formatted = []
            i = 0
            while i < len(raw_parts):
                part = raw_parts[i]
                if re.match(r"^\d+$", part) and i + 2 < len(raw_parts):
                    # Pattern: [S.No, Event, Date]
                    formatted.append(f"• **{raw_parts[i+1]}**: {raw_parts[i+2]}")
                    i += 3
                elif re.match(r"^\d+$", part) and i + 1 < len(raw_parts):
                    formatted.append(f"• {raw_parts[i+1]}")
                    i += 2
                else:
                    if len(part) > 3 and not part.isdigit():
                        formatted.append(f"• {part}")
                    i += 1
            return "\n".join(formatted[:10])

        # Standard text cleaning
        lines = text.split("\n")
        cleaned_lines = []
        for line in lines:
            line_str = line.strip()
            if len(line_str) > 20:
                cleaned_lines.append(f"• {line_str}")
        return "\n".join(cleaned_lines[:6])

    def answer_question(self, question: str, claim: Optional[ClaimModel] = None) -> str:
        q_clean = question.strip()
        if not q_clean:
            return "Please enter a question or claim to verify."

        # 1. Fetch live official evidence
        search_query = f"{claim.title} {q_clean}" if claim else q_clean
        live_evidence = evidence_service.verify_claim(search_query, "unverified")

        context_snippets = []
        for item in live_evidence[:3]:
            raw_snippet = item.get("snippet", "")
            if raw_snippet:
                context_snippets.append(f"Source [{item.get('name')} - {item.get('domain')}]:\n{raw_snippet}")

        context_block = "\n\n".join(context_snippets)

        # 2. Synthesize using Groq LLM
        if self.api_key and not self.api_key.startswith("YOUR_"):
            try:
                system_prompt = (
                    "You are VerifyAI's factual verification assistant. "
                    "Synthesize the provided web evidence into a clear, structured response. "
                    "Extract official dates, fee structures, and application guidelines. "
                    "Format with clean bullet points and bold key dates/events. "
                    "Never output raw markdown table pipes (|) or ad text."
                )
                user_prompt = (
                    f"User Question: {q_clean}\n\n"
                    f"Verified Official Evidence:\n{context_block}\n\n"
                    "Provide a clean, direct answer:"
                )

                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.1
                }
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }

                res = requests.post(f"{self.base_url}/chat/completions", json=payload, headers=headers, timeout=8)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
            except Exception as e:
                print("LLM Error:", e)

        # 3. Clean fallback formatter (if LLM is offline)
        if live_evidence:
            top = live_evidence[0]
            clean_snip = self._clean_scraped_text(top.get("snippet", ""))
            return (
                f"### Official Notification Details\n"
                f"**Source:** {top.get('name')} (`{top.get('domain')}`)\n\n"
                f"{clean_snip}\n\n"
                f"*Verified against official statutory records.*"
            )

        return f"No official records found matching '{q_clean}'."

chat_service = ChatService()