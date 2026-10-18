"""
Crisp AI Patient Health Summary (services/patient_health_summary.py)
Generates a 2-sentence plain English, jargon-free health status for the patient portal,
highlights critical allergy/medication alerts, and assigns a status tag.
"""

from typing import Dict, Any, List, Optional
import json
from config import get_gemini_model, is_gemini_available

def fallback_health_summary(
    patient_name: str,
    age: int,
    vitals: Dict[str, Any],
    diagnostics: List[str],
    allergies: List[str]
) -> Dict[str, Any]:
    bp = vitals.get("bp", "120/80")
    pulse = vitals.get("pulse", 72)
    spo2 = vitals.get("spo2", 98)

    # 1. Allergy Alert
    allergy_items = [a.lower() for a in allergies]
    has_penicillin = any("penicillin" in a or "amox" in a for a in allergy_items)
    has_nsaid = any("nsaid" in a or "brufen" in a or "ibuprofen" in a or "combiflam" in a or "diclofenac" in a for a in allergy_items)

    if has_penicillin and has_nsaid:
        allergy_alert = "Strictly avoid Penicillin antibiotics and Ibuprofen/Combiflam painkillers."
    elif has_penicillin:
        allergy_alert = "Strictly avoid Penicillin and Amoxicillin family antibiotics."
    elif has_nsaid:
        allergy_alert = "Strictly avoid Ibuprofen, Combiflam, and other NSAID painkillers."
    elif allergies:
        allergy_alert = f"Known drug sensitivities flagged: {', '.join(allergies)}."
    else:
        allergy_alert = "No known drug allergies on record."

    # 2. Vitals Analysis & Simple Summary
    is_normal_bp = True
    try:
        sys_bp, dia_bp = map(int, str(bp).split("/"))
        if sys_bp > 140 or sys_bp < 95 or dia_bp > 90 or dia_bp < 60:
            is_normal_bp = False
    except Exception:
        pass

    if is_normal_bp and 60 <= int(pulse) <= 100:
        status_tag = "Stable Under Cardiac Observation"
        simple_summary = (
            "Your heart rhythm and blood pressure are currently stable and in the healthy target range. "
            "Continue taking your daily prescribed aspirin with breakfast and avoid painkillers with ibuprofen."
        )
    else:
        status_tag = "Requires Medical Follow-Up"
        simple_summary = (
            "Your vital signs are currently being monitored closely by the clinical team to ensure your heart is resting comfortably. "
            "Please rest in bed and let the nursing staff know immediately if you feel any chest heaviness."
        )

    return {
        "simple_summary": simple_summary,
        "allergy_alert": allergy_alert,
        "status_tag": status_tag
    }

def generate_crisp_health_summary(
    patient_name: str,
    age: int,
    vitals: Dict[str, Any],
    diagnostics: List[str],
    allergies: List[str]
) -> Dict[str, Any]:
    """
    Generates 2-sentence plain English patient health summary via Gemini or fallback.
    """
    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
You are a compassionate doctor writing a patient portal summary.
Patient Name: {patient_name}, Age: {age}
Vitals: {json.dumps(vitals)}
Diagnostics: {json.dumps(diagnostics)}
Allergies: {json.dumps(allergies)}

REQUIREMENTS:
1. "simple_summary": Exactly 2 sentences written in simple, plain English without medical jargon that a patient can understand immediately.
2. "allergy_alert": A clear, sharp instruction warning against their specific allergies (especially Penicillin, Ibuprofen/Combiflam/NSAIDs).
3. "status_tag": A short 3-5 word status tag (e.g. "Stable Under Cardiac Observation").

Respond ONLY with valid JSON:
{{
  "simple_summary": "Your heart rhythm and blood pressure are currently stable and in the healthy target range. Continue taking your daily prescribed aspirin with breakfast and avoid painkillers with ibuprofen.",
  "allergy_alert": "Strictly avoid Penicillin antibiotics and Ibuprofen/Combiflam painkillers.",
  "status_tag": "Stable Under Cardiac Observation"
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
                return {
                    "simple_summary": str(parsed.get("simple_summary", "")),
                    "allergy_alert": str(parsed.get("allergy_alert", "")),
                    "status_tag": str(parsed.get("status_tag", "Stable Under Cardiac Observation"))
                }
        except Exception as e:
            print(f"[Health Summary] Gemini error, using fallback: {e}")

    return fallback_health_summary(patient_name, age, vitals, diagnostics, allergies)
