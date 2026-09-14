import re

class TextPreprocessor:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text or not isinstance(text, str):
            return ""
        cleaned = text.lower()
        cleaned = re.sub(r'https?://\S+|www\.\S+', '', cleaned)
        cleaned = re.sub(r'<.*?>', '', cleaned)
        cleaned = re.sub(r'[^\w\s\$\₹\%\d\.\-]', ' ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

preprocessor = TextPreprocessor()
