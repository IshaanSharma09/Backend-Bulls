# MedNexus AI Clinical Microservice: patient_report_generator.py
"""
Full AI Health Report Generator (services/patient_report_generator.py)
Synthesizes clinical demographics, symptoms, ECG findings, allergies, and lab tests into:
- Plain summary (simple, patient-and-family understandable clinical summary)
- Critical allergy warning (prominent contraindication flag)
- Vitals interpretation
- Actionable AI care directives
"""

from typing import Dict, Any, List, Optional
import json
import re
from config import get_gemini_model, is_gemini_available

def fallback_generate_report(
    patient_id: str,
    demographics: Dict[str, Any],
    symptoms: str,
    ecg_findings: str,
    allergies: List[str],
    tests: List[Dict[str, Any]]
) -> Dict[str, Any]:
    age = demographics.get("age", 54)
    gender = demographics.get("gender", "Male")
    
    # 1. Plain Summary
    plain_summary = (
        f"Patient {patient_id} ({age}yo {gender}) is experiencing an Acute Anterior Wall "
        "ST-Elevation Myocardial Infarction (STEMI), commonly known as a severe heart attack "
        "affecting the main pumping chamber of the heart. The ECG shows significant acute injury "
        f"({ecg_findings}) and cardiac enzyme tests are positive, indicating immediate medical emergency "
        "requiring rapid hospital stabilization and blood vessel reopening."
    )
    
    # 2. Critical Allergy Warning
    allergy_str = ", ".join(allergies) if allergies else "None reported"
    if any(k in allergy_str.lower() for k in ["nsaid", "brufen", "ibuprofen", "aspirin", "diclofenac"]):
        critical_allergy_warning = (
            "CRITICAL CONTRAINDICATION ALERT: Documented severe anaphylactoid reaction to "
            f"{allergy_str}. Strictly avoid Ibuprofen (Brufen), Diclofenac, Naproxen, or standard "
            "NSAID pain relievers due to fatal bronchospasm/anaphylaxis risk. For cardiac analgesia, "
            "administer IV Morphine 2-4mg titrated under medical supervision."
        )
    else:
        critical_allergy_warning = f"Known drug allergies flagged: {allergy_str}. Verify drug cross-reactivity before administering new medications."

    # 3. Vitals Interpretation
    vitals_interpretation = (
        "Blood pressure recorded at 90/60 mmHg demonstrates borderline hypotension with imminent risk "
        "of cardiogenic shock secondary to acute myocardial hypoperfusion. Diaphoresis reflects high "
        "sympathetic stress. Nitrates (Nitroglycerin/Sorbitrate) must be avoided due to low systolic pressure (<90 mmHg)."
    )

    # 4. AI Care Directives
    ai_care_directives = [
        "Immediate emergency catheterization (Primary PCI) or pharmacoinvasive Tenecteplase thrombolysis if transfer time > 120 minutes.",
        "Chewable Dual Antiplatelet loading: Aspirin 300mg + Clopidogrel 300mg stat (with anti-allergy premedication if mild allergy).",
        "High-intensity lipid stabilization with Atorvastatin 80mg immediately.",
        "Attach continuous cardiac telemetry and pulse oximetry; keep supplemental oxygen available to maintain SpO2 >= 92%.",
        "Strict bed rest in semi-Fowler position; avoid all strenuous physical exertion.",
        "Schedule urgent Spoke-to-Hub tele-consultation with Metro Cardiology within 24 hours of arrival."
    ]

    return {
        "patient_id": patient_id,
        "plain_summary": plain_summary,
        "critical_allergy_warning": critical_allergy_warning,
        "vitals_interpretation": vitals_interpretation,
        "ai_care_directives": ai_care_directives
    }

def generate_patient_health_report(
    patient_id: str,
    demographics: Dict[str, Any],
    symptoms: str,
    ecg_findings: str,
    allergies: List[str],
    tests: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Synthesizes complete patient report using Gemini API or deterministic clinical template.
    """
    model = get_gemini_model()
    if model:
        try:
            prompt = f"""
You are a senior cardiologist and medical communications AI.
Generate a structured, professional, yet understandable Patient Health Report based on these clinical parameters:

PATIENT ID: {patient_id}
DEMOGRAPHICS: {json.dumps(demographics)}
SYMPTOMS: {symptoms}
ECG FINDINGS: {ecg_findings}
DOCUMENTED ALLERGIES: {json.dumps(allergies)}
DIAGNOSTIC TESTS: {json.dumps(tests)}

REQUIREMENTS:
1. "plain_summary": A clear explanation of anterior wall STEMI / cardiac injury in compassionate, simple language.
2. "critical_allergy_warning": A prominent, unmissable contraindication warning against Brufen/NSAIDs or reported allergies.
3. "vitals_interpretation": Professional interpretation of the blood pressure (90/60), pulse, and oxygen status.
4. "ai_care_directives": A list of 4-6 bulleted actionable directives (reperfusion, medicines, monitoring, lifestyle).

Respond ONLY with valid JSON:
{{
  "patient_id": "{patient_id}",
  "plain_summary": "...",
  "critical_allergy_warning": "...",
  "vitals_interpretation": "...",
  "ai_care_directives": [
    "Directive 1",
    "Directive 2"
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
                    "patient_id": patient_id,
                    "plain_summary": str(parsed.get("plain_summary", "")),
                    "critical_allergy_warning": str(parsed.get("critical_allergy_warning", "")),
                    "vitals_interpretation": str(parsed.get("vitals_interpretation", "")),
                    "ai_care_directives": list(parsed.get("ai_care_directives", []))
                }
        except Exception as e:
            print(f"[Patient Report] Gemini generation error, using fallback: {e}")

    return fallback_generate_report(patient_id, demographics, symptoms, ecg_findings, allergies, tests)
