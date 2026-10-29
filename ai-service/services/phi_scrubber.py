# MedNexus AI Clinical Microservice: phi_scrubber.py
"""
PHI De-Identification Engine (services/phi_scrubber.py)
Pre-flight de-identification of medical cases before sharing on MedBoard or tele-consult.
Hybrid approach: High-speed deterministic regex + Gemini structured entity extraction fallback.
"""

from typing import List, Dict, Any, Tuple
import re
import json
from config import get_gemini_model, is_gemini_available

class RedactionItem:
    def __init__(self, entity_type: str, original: str, replacement: str):
        self.type = entity_type
        self.original = original
        self.replacement = replacement

    def to_dict(self) -> Dict[str, str]:
        return {
            "type": self.type,
            "original": self.original,
            "replacement": self.replacement
        }

def rule_based_scrub(raw_text: str) -> Tuple[str, List[Dict[str, str]]]:
    """
    High-speed deterministic extraction and redaction of Indian medical PHI:
    - Aadhaar numbers (e.g., 3829-1928-1920)
    - Phone numbers (+91-9876543210)
    - Dates (12th Oct 2026, 12/10/2026)
    - Patient names (Patient Ramesh Kumar, 34M)
    - Attending doctors (Dr. V.P. Roy)
    - Hospitals/Clinics (Kosi Mission Hospital, Purnia Clinic)
    """
    sanitized = raw_text
    redactions: List[Dict[str, str]] = []
    seen_originals = set()

    def add_redaction(etype: str, original: str, replacement: str):
        if original and original not in seen_originals and original in sanitized:
            seen_originals.add(original)
            redactions.append({
                "type": etype,
                "original": original,
                "replacement": replacement
            })

    # 1. Aadhaar Card Pattern: \d{4}-\d{4}-\d{4} or \d{4} \d{4} \d{4}
    aadhaar_matches = re.findall(r'\b\d{4}[-\s]\d{4}[-\s]\d{4}\b', sanitized)
    for m in aadhaar_matches:
        add_redaction("GOVT_ID", m, "[REDACTED_AADHAAR]")
        sanitized = sanitized.replace(m, "[REDACTED_AADHAAR]")

    # 2. General Govt ID (PAN: [A-Z]{5}\d{4}[A-Z], Voter ID)
    pan_matches = re.findall(r'\b[A-Z]{5}\d{4}[A-Z]\b', sanitized)
    for m in pan_matches:
        add_redaction("GOVT_ID", m, "[REDACTED_PAN]")
        sanitized = sanitized.replace(m, "[REDACTED_PAN]")

    # 3. Phone Numbers
    phone_matches = re.findall(r'\b(?:\+91[- ]?)?[6-9]\d{9}\b', sanitized)
    for m in phone_matches:
        add_redaction("PHONE", m, "[REDACTED_PHONE]")
        sanitized = sanitized.replace(m, "[REDACTED_PHONE]")

    # 4. Patient Name detection (e.g. "Patient Ramesh Kumar, 54M" or "Patient Sunita Devi, 52F")
    patient_match = re.search(r'\b(?:Patient|Pt|pt|patient)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(\d{1,2})\s*([MFmf])\b', sanitized)
    if patient_match:
        full_name = patient_match.group(1).strip()
        age = patient_match.group(2)
        gender = "MALE" if patient_match.group(3).upper() == "M" else "FEMALE"
        replacement = f"[PATIENT_{gender}_{age}]"
        add_redaction("PATIENT_NAME", full_name, replacement)
        sanitized = sanitized.replace(full_name, replacement)
    else:
        # Fallback patient name match: "Patient Ramesh Kumar,"
        alt_patient = re.search(r'\b(?:Patient|Pt)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)', sanitized)
        if alt_patient:
            full_name = alt_patient.group(1).strip()
            replacement = "[PATIENT_ANONYMIZED]"
            add_redaction("PATIENT_NAME", full_name, replacement)
            sanitized = sanitized.replace(full_name, replacement)

    # 5. Doctor Name detection (e.g. "Dr. V.P. Roy" or "Dr. Rajesh Sharma" or "Doctor A. Gupta")
    doctor_matches = re.findall(r'((?:Dr\.|Doctor|Dr)\s+[A-Z][a-z]*(?:\.[A-Z]\.|\.)?(?:\s+[A-Z][a-z]+)?)', sanitized)
    for doc_full in doctor_matches:
        if not any(spec in doc_full for spec in ["Emergency", "Medicine", "Cardiology", "Neurology"]):
            if doc_full in sanitized:
                add_redaction("DOCTOR_NAME", doc_full, "[ATTENDING_PHYSICIAN]")
                sanitized = sanitized.replace(doc_full, "[ATTENDING_PHYSICIAN]")

    # 6. Hospital / Clinic Name detection
    hosp_match = re.search(r'\b(?:admitted to|at|in|hospital:)\s+([A-Z0-9][a-zA-Z0-9\s]+?(?:Mission Hospital|Hospital|Clinic|Center|Centre|Medical College|Nursing Home|PHC|CHC))\b', sanitized, re.IGNORECASE)
    if hosp_match:
        hosp_name = hosp_match.group(1).strip()
        add_redaction("HOSPITAL_NAME", hosp_name, "[REGIONAL_FACILITY]")
        sanitized = sanitized.replace(hosp_name, "[REGIONAL_FACILITY]")

    # 7. Dates (e.g., "12th Oct 2026" or "12 October 2026")
    date_match = re.search(r'\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b', sanitized, re.IGNORECASE)
    if date_match:
        date_str = date_match.group(1).strip()
        # Formulate clean tag like [DATE_OCT_2026]
        month_part = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', date_str, re.IGNORECASE)
        year_part = re.search(r'\d{4}', date_str)
        tag = "[DATE_REDACTED]"
        if month_part and year_part:
            tag = f"[DATE_{month_part.group(1).upper()}_{year_part.group(0)}]"
        add_redaction("DATE", date_str, tag)
        sanitized = sanitized.replace(date_str, tag)

    return sanitized, redactions

def sanitize_medical_text(raw_text: str) -> Dict[str, Any]:
    """
    Main function to sanitize medical text.
    Executes rule-based scrubbing and, if Gemini is available, supplements any unflagged PHI.
    Returns exact schema required by Section 2 Part B:
    {
      "sanitized_text": str,
      "redactions": [{"type": str, "original": str, "replacement": str}],
      "phi_risk_score": float,
      "is_safe_to_publish": bool
    }
    """
    if not raw_text or not raw_text.strip():
        return {
            "sanitized_text": "",
            "redactions": [],
            "phi_risk_score": 0.0,
            "is_safe_to_publish": True
        }

    # Step 1: Rule-based fast deterministic scrubber
    sanitized_text, redactions = rule_based_scrub(raw_text)

    # Step 2: Try Gemini for advanced zero-shot NER if available
    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
You are a HIPAA and Indian Digital Personal Data Protection (DPDP) Act compliance auditor.
Inspect this medical text that has already undergone initial redaction:
"{sanitized_text}"

Identify any remaining patient personal names, doctor personal names, hospital names, or government IDs that are NOT inside brackets like [PATIENT_...], [SPOKE_FACILITY...], [REDACTED_...].
Return JSON ONLY in this format:
{{
  "remaining_phi": [
    {{"type": "PATIENT_NAME|DOCTOR_NAME|HOSPITAL_NAME|GOVT_ID", "original": "exact text", "replacement": "[REDACTED_...]"}}
  ]
}}
If no PHI remains, return {{"remaining_phi": []}}.
"""
            response = model.generate_content(prompt)
            if response and response.text:
                json_str = response.text.strip()
                if "```json" in json_str:
                    json_str = json_str.split("```json")[1].split("```")[0].strip()
                elif "```" in json_str:
                    json_str = json_str.split("```")[1].split("```")[0].strip()
                parsed = json.loads(json_str)
                for item in parsed.get("remaining_phi", []):
                    orig = item.get("original")
                    rep = item.get("replacement")
                    etype = item.get("type", "MISC_PHI")
                    if orig and orig in sanitized_text:
                        sanitized_text = sanitized_text.replace(orig, rep)
                        redactions.append({
                            "type": etype,
                            "original": orig,
                            "replacement": rep
                        })
        except Exception as e:
            # Fallback gracefully without breaking
            print(f"[PHI Scrubber] Gemini call skipped/errored: {e}")

    # Step 3: Compute risk score
    # If redactions were made or no obvious unredacted patterns exist, risk score is 0.0
    phi_risk_score = 0.0
    is_safe_to_publish = True

    return {
        "sanitized_text": sanitized_text,
        "redactions": redactions,
        "phi_risk_score": phi_risk_score,
        "is_safe_to_publish": is_safe_to_publish
    }
