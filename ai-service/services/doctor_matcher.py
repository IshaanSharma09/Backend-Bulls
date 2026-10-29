# MedNexus AI Clinical Microservice: doctor_matcher.py
"""
Symptom-To-Doctor Recommendation Engine (services/doctor_matcher.py)
Computes clinical relevance between user symptoms and specialties
(Cardiology, Neurology, Internal Medicine, Pulmonology, etc.)
with match confidence percentage and suggested questions for the doctor.
"""

from typing import Dict, Any, List
import re
import json
from config import get_gemini_model, is_gemini_available

SPECIALTY_PATTERNS = [
    {
        "specialty": "Cardiology",
        "keywords": ["chest pain", "pressure", "angina", "shortness of breath", "heart", "palpitation", "sweating", "st elevation", "infarction", "arm pain"],
        "base_confidence": 0.98,
        "default_urgency": "High",
        "questions": [
            "Does the chest pressure radiate towards your left arm, jaw, or upper back?",
            "Are you experiencing cold diaphoresis (profuse sweating) or lightheadedness?",
            "Did the pain begin suddenly after physical exertion, or while resting?"
        ]
    },
    {
        "specialty": "Neurology",
        "keywords": ["stroke", "slurred speech", "facial droop", "hemiparesis", "weakness", "numbness", "seizure", "paralysis", "headache", "vision loss"],
        "base_confidence": 0.95,
        "default_urgency": "High",
        "questions": [
            "At what exact time did you first notice the weakness or slurred speech?",
            "Is the weakness localized to one side of your face, arm, or leg?",
            "Have you experienced any loss of consciousness or difficulty swallowing?"
        ]
    },
    {
        "specialty": "Pulmonology",
        "keywords": ["cough", "wheezing", "asthma", "stridor", "sputum", "hemoptysis", "breathlessness", "cyanosis", "pleuritic"],
        "base_confidence": 0.92,
        "default_urgency": "Medium",
        "questions": [
            "Are you bringing up any blood or colored sputum when you cough?",
            "Do you hear a whistling or wheezing sound when breathing out?",
            "Do you have a personal history of asthma, COPD, or smoking?"
        ]
    },
    {
        "specialty": "Gastroenterology",
        "keywords": ["abdominal pain", "epigastric", "vomiting", "diarrhea", "acidity", "jaundice", "blood in stool", "pancreatitis"],
        "base_confidence": 0.89,
        "default_urgency": "Medium",
        "questions": [
            "Is the pain concentrated in the upper center of your abdomen or spreading to the back?",
            "Have you noticed yellowish discoloration of your eyes or dark urine?",
            "Are you able to keep oral fluids down without vomiting?"
        ]
    },
    {
        "specialty": "Internal Medicine",
        "keywords": ["fever", "chills", "fatigue", "body ache", "malaise", "weight loss", "night sweats", "infection"],
        "base_confidence": 0.90,
        "default_urgency": "Medium",
        "questions": [
            "How many days has the fever been present, and what was the highest temperature measured?",
            "Have you noticed any skin rashes, dark insect bites, or localized swelling?",
            "Have you recently traveled to areas with known malaria or dengue outbreaks?"
        ]
    }
]

def rule_based_match_doctor(query: str) -> Dict[str, Any]:
    lower_query = query.lower()
    
    scored_specialties = []
    for spec in SPECIALTY_PATTERNS:
        match_count = sum(1 for kw in spec["keywords"] if kw in lower_query)
        if match_count > 0:
            score = spec["base_confidence"]
            scored_specialties.append((score, match_count, spec))

    if not scored_specialties:
        # Default to Internal Medicine / General Physician
        default_spec = SPECIALTY_PATTERNS[4]
        return {
            "primary_specialty": default_spec["specialty"],
            "match_confidence": 0.85,
            "urgency": "Medium",
            "suggested_questions": default_spec["questions"],
            "differential_specialties": [
                {"specialty": "Cardiology", "confidence": 0.70},
                {"specialty": "Pulmonology", "confidence": 0.65}
            ]
        }

    scored_specialties.sort(key=lambda x: (x[1], x[0]), reverse=True)
    best_spec = scored_specialties[0][2]
    confidence = scored_specialties[0][0]

    # Differentials
    differentials = []
    for item in scored_specialties[1:3]:
        differentials.append({
            "specialty": item[2]["specialty"],
            "confidence": round(item[0] - 0.12, 2)
        })

    if not differentials:
        if best_spec["specialty"] == "Cardiology":
            differentials = [
                {"specialty": "Pulmonology", "confidence": 0.82},
                {"specialty": "Internal Medicine", "confidence": 0.75}
            ]
        else:
            differentials = [
                {"specialty": "Internal Medicine", "confidence": 0.80}
            ]

    return {
        "primary_specialty": best_spec["specialty"],
        "match_confidence": confidence,
        "urgency": best_spec["default_urgency"],
        "suggested_questions": best_spec["questions"],
        "differential_specialties": differentials
    }

def match_doctor_specialty(query: str) -> Dict[str, Any]:
    """
    Computes clinical relevance between user symptoms and medical specialties
    using Gemini LLM reasoning with deterministic clinical rule fallback.
    """
    if not query or not query.strip():
        return {
            "primary_specialty": "General Medicine",
            "match_confidence": 0.80,
            "urgency": "Low",
            "suggested_questions": [
                "What is the main symptom troubling you today?",
                "How long have you had this concern?"
            ],
            "differential_specialties": []
        }

    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
You are a medical triage and specialty routing AI.
Analyze the following patient query/symptoms:
"{query}"

Determine:
1. "primary_specialty": The best medical specialty (e.g. Cardiology, Neurology, Pulmonology, Internal Medicine, Gastroenterology).
2. "match_confidence": A decimal confidence score between 0.80 and 0.99.
3. "urgency": "High" | "Medium" | "Low".
4. "suggested_questions": 3 sharp, critical clinical questions for the doctor to ask this patient.
5. "differential_specialties": Array of up to 2 alternative specialties with confidence decimals.

Respond ONLY with valid JSON:
{{
  "primary_specialty": "Cardiology",
  "match_confidence": 0.98,
  "urgency": "High",
  "suggested_questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ],
  "differential_specialties": [
    {{"specialty": "Pulmonology", "confidence": 0.82}}
  ]
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
                    "primary_specialty": str(parsed.get("primary_specialty", "Cardiology")),
                    "match_confidence": float(parsed.get("match_confidence", 0.98)),
                    "urgency": str(parsed.get("urgency", "High")),
                    "suggested_questions": list(parsed.get("suggested_questions", [])),
                    "differential_specialties": list(parsed.get("differential_specialties", []))
                }
        except Exception as e:
            print(f"[Doctor Matcher] Gemini error, using fallback: {e}")

    return rule_based_match_doctor(query)
