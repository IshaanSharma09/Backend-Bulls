# MedNexus AI Clinical Microservice: test_ai_service.py
"""
MedNexus AI Engine Integration & Audit Test Suite
Verifies 100% compliance with the Frontend Audit Specification:
1. POST /ai/sanitize/text
2. POST /ai/patient/health-summary
3. POST /ai/scribe/soap
4. POST /ai/case/assistant-pin
5. POST /ai/moderate/review
6. POST /ai/search/cases
"""

import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["port"] == 8001
    print("[PASS] GET /health")

def test_phi_scrubber():
    payload = {
        "raw_text": "Patient Ramesh Kumar, 54M, admitted to IIIT Delhi Hospital under Dr. Rajesh Sharma. Aadhaar: 3829-1928-1920. Patient complains of chest tightness. Troponin T positive."
    }
    res = client.post("/ai/sanitize/text", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    
    assert "[PATIENT_MALE_54]" in data["sanitized_text"]
    assert "54M" in data["sanitized_text"]
    assert "[REGIONAL_FACILITY]" in data["sanitized_text"]
    assert "[ATTENDING_PHYSICIAN]" in data["sanitized_text"]
    assert "[REDACTED_AADHAAR]" in data["sanitized_text"]
    assert data["phi_risk_score"] == 0.0
    assert data["is_safe_to_publish"] is True
    print("[PASS] POST /ai/sanitize/text (Pre-Flight Privacy Guard)")

def test_patient_health_summary():
    payload = {
        "patient_name": "Ramesh Kumar",
        "age": 54,
        "vitals": { "bp": "118/76", "pulse": 72, "spo2": 98 },
        "diagnostics": ["Normal Sinus Rhythm 72 bpm", "Fasting Sugar 92 mg/dL"],
        "allergies": ["Penicillin", "Ibuprofen / NSAIDs"]
    }
    res = client.post("/ai/patient/health-summary", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    
    assert "heart" in data["simple_summary"].lower() or "blood pressure" in data["simple_summary"].lower()
    assert "Penicillin" in data["allergy_alert"] and ("Ibuprofen" in data["allergy_alert"] or "Combiflam" in data["allergy_alert"])
    assert data["status_tag"] == "Stable Under Cardiac Observation"
    print("[PASS] POST /ai/patient/health-summary (Crisp Plain English)")

def test_soap_scribe():
    payload = {
        "raw_doctor_notes": "54yo male chest discomfort during exertion, BP 118/76, pulse 72. ECG normal sinus. History of allergy to penicillin and combiflam.",
        "patient_timeline": ["Admitted 09:30 AM", "ECG at 09:45 AM"]
    }
    res = client.post("/ai/scribe/soap", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    
    soap = data["soap_note"]
    assert "exertional" in soap["subjective"].lower()
    assert "118/76" in soap["objective"]
    assert "stable" in soap["assessment"].lower()
    assert "aspirin" in soap["plan"].lower()
    assert data["urgency_score"] == 45
    assert data["urgency_tier"] == "ROUTINE_OBSERVATION"
    assert "NSAIDs" in data["contraindication_flag"] and "Penicillins" in data["contraindication_flag"]
    print("[PASS] POST /ai/scribe/soap (Stable Observation & Dual Allergy Guard)")

def test_assistant_pin():
    payload = {
        "case_id": "case_cardio_101",
        "symptoms": "Acute ST elevation chest pain",
        "labs": "Troponin T positive",
        "patient_allergies": ["Penicillin", "NSAIDs"]
    }
    res = client.post("/ai/case/assistant-pin", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    
    summary = data["ai_pinned_summary"]
    assert summary["match_percentage"] >= 90
    assert summary["matched_benchmark"] == "ICMR Rural STEMI Protocol #4"
    assert any("NSAID" in step for step in summary["immediate_first_aid"])
    assert len(summary["jan_aushadhi_savings"]) >= 2
    savings = summary["jan_aushadhi_savings"][0]
    assert "Brilinta" in savings["branded_drug"]
    assert "Ticagrelor" in savings["jan_aushadhi_generic"]
    assert "81% OFF" in savings["cost_reduction"]
    print("[PASS] POST /ai/case/assistant-pin (ICMR Benchmark + Jan Aushadhi 80%+ Savings)")

def test_review_moderator():
    payload = { "review_text": "Dr. Sharma is a fraud who stole hospital medicines." }
    res = client.post("/ai/moderate/review", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["is_allowed"] is False
    assert data["moderation_verdict"] == "REJECTED_DEFAMATION"
    assert "PERSONAL_NAME_TARGETING" in data["flags"]
    assert "workplace culture" in data["explanation"]
    print("[PASS] POST /ai/moderate/review (Defamation Guard)")

def test_semantic_search():
    payload = {
        "query": "acute anterior wall infarction",
        "specialty": "Cardiology",
        "top_k": 2
    }
    res = client.post("/ai/search/cases", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data["matches"]) >= 1
    top = data["matches"][0]
    assert "Anterior Wall MI" in top["title"]
    assert top["similarity_score"] >= 0.90
    assert "Tenecteplase" in top["outcome"]
    assert "ICMR Guidelines on Acute Coronary Syndromes" in top["protocol_reference"]
    print("[PASS] POST /ai/search/cases (Semantic Benchmark Search)")

if __name__ == "__main__":
    print("--- Running MedNexus AI Service Frontend Audit Test Suite ---")
    test_health()
    test_phi_scrubber()
    test_patient_health_summary()
    test_soap_scribe()
    test_assistant_pin()
    test_review_moderator()
    test_semantic_search()
    print("--- ALL AUDIT TESTS PASSED WITH 100% SUCCESS! ---")
