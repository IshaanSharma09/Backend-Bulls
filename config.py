import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from ai-service directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))

def is_gemini_available() -> bool:
    return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 5)

def get_gemini_model():
    """
    Returns a configured Gemini generative model or None if unavailable/misconfigured.
    Supports google-generativeai and google-genai.
    """
    if not is_gemini_available():
        return None
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        # Use gemini-1.5-flash or gemini-2.0-flash
        return genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"[Warning] Failed to initialize Google Generative AI client: {e}")
        return None
