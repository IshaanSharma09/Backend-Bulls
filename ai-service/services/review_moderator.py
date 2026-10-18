"""
Review Defamation & Toxicity Moderator (services/review_moderator.py)
Distinguishes between protected institutional feedback (workload, equipment, safety, pay)
and prohibited personal defamation (naming doctors, criminal accusations, harassment).
"""

from typing import Dict, Any, List
import re
import json
from config import get_gemini_model, is_gemini_available

DEFAMATION_KEYWORDS = [
    "thief", "steals", "stole", "theft", "bribe", "corrupt", "fraud",
    "quack", "scam", "cheat", "scammer", "murderer", "criminal", "extortion", "incompetent"
]

PERSONAL_NAME_PATTERNS = [
    r'\b(?:Dr\.|Doctor|Dr)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b',
    r'\b(?:Dr\.|Doctor)\s+[A-Z]\b',
    r'\b(?:Sister|Nurse)\s+[A-Z][a-z]+\b',
    r'\b(?:Prof\.|Professor)\s+[A-Z][a-z]+\b'
]

INSTITUTIONAL_KEYWORDS = [
    "hours", "duty", "shift", "workload", "cath lab", "equipment", "safety",
    "pay", "stipend", "salary", "management", "culture", "resident", "intern",
    "resting room", "toxic", "burnout", "icu", "ward", "infrastructure", "supplies"
]

def rule_based_moderate(review_text: str) -> Dict[str, Any]:
    flags: List[str] = []
    
    # 1. Check for personal naming
    found_names = []
    for pat in PERSONAL_NAME_PATTERNS:
        matches = re.findall(pat, review_text)
        if matches:
            found_names.extend(matches)
            
    if found_names:
        flags.append("PERSONAL_NAME_TARGETING")
        
    # 2. Check for defamation / criminal accusations
    lower_text = review_text.lower()
    has_criminal_words = any(re.search(r'\b' + re.escape(kw) + r'\b', lower_text) for kw in DEFAMATION_KEYWORDS)
    if has_criminal_words:
        flags.append("UNSUBSTANTIATED_CRIMINAL_ACCUSATION")
        
    # 3. Check for profanity or harassment
    if re.search(r'\b(?:bastard|idiot|bitch|asshole|worthless|scumbag)\b', lower_text):
        flags.append("TOXIC_LANGUAGE")
        
    if flags:
        explanation = "Reviews must focus on workplace culture, hours, safety, and equipment. Personal targeting of named individuals is blocked."
        return {
            "is_allowed": False,
            "moderation_verdict": "REJECTED_DEFAMATION",
            "flags": flags,
            "explanation": explanation,
            "cleaned_suggestion": None
        }
    else:
        return {
            "is_allowed": True,
            "moderation_verdict": "APPROVED",
            "flags": [],
            "explanation": "Review focuses on departmental culture, hours, safety, and equipment. Complies with institutional critique standards.",
            "cleaned_suggestion": None
        }

def moderate_review(review_text: str) -> Dict[str, Any]:
    """
    Moderates hospital culture review using Gemini when available,
    falling back to rule-based classification.
    """
    if not review_text or not review_text.strip():
        return {
            "is_allowed": False,
            "moderation_verdict": "REJECTED_EMPTY",
            "flags": ["EMPTY_TEXT"],
            "explanation": "Review text cannot be empty.",
            "cleaned_suggestion": None
        }

    # Run rule-based first
    rb_result = rule_based_moderate(review_text)

    # If Gemini is available, supplement with LLM reasoning
    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
You are a content moderator for an anonymous doctor workplace review board.
Your job is to strictly enforce these policies:
1. PERMITTED: Constructive or negative feedback on institutional workplace issues:
   - Extreme shift hours (e.g., 36-hour duties)
   - Lack of resting rooms or safety equipment
   - Malfunctioning medical equipment (e.g. broken cath lab)
   - Delayed stipends or unfair pay
   - High administrative pressure and departmental culture
2. STRICTLY PROHIBITED:
   - Naming specific doctors, nurses, or individuals with personal attacks
   - Accusing specific named people of crimes (theft, bribes, malpractice)
   - Personal defamation, slander, or abusive language

Review to analyze:
"{review_text}"

Respond with ONLY valid JSON with this exact structure:
{{
  "is_allowed": true/false,
  "moderation_verdict": "APPROVED" | "REJECTED_DEFAMATION",
  "flags": ["PERSONAL_NAME_TARGETING", "UNSUBSTANTIATED_CRIMINAL_ACCUSATION", ...],
  "explanation": "Clear reason for decision",
  "cleaned_suggestion": null
}}
"""
            response = model.generate_content(prompt)
            if response and response.text:
                json_str = response.text.strip()
                if "```json" in json_str:
                    json_str = json_str.split("```json")[1].split("```")[0].strip()
                elif "```" in json_str:
                    json_str = json_str.split("```")[1].split("```")[0].strip()
                parsed = json.loads(json_str)
                # Enforce key contracts
                return {
                    "is_allowed": bool(parsed.get("is_allowed", False)),
                    "moderation_verdict": str(parsed.get("moderation_verdict", "REJECTED_DEFAMATION")),
                    "flags": list(parsed.get("flags", [])),
                    "explanation": str(parsed.get("explanation", "")),
                    "cleaned_suggestion": parsed.get("cleaned_suggestion")
                }
        except Exception as e:
            print(f"[Review Moderator] Gemini error, using fallback: {e}")

    return rb_result
