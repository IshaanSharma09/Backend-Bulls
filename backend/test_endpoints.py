# MedNexus Core Clinical Router: test_endpoints.py
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def run_tests():
    print("=" * 65)
    print("MEDNEXUS IIIT DELHI HOSPITAL OS - AUTOMATED ENDPOINT VERIFICATION")
    print("=" * 65)

    # ---------------- 1. PATIENT CONSENT & DYNAMIC ACCESS CODE ----------------
    print("
--- 1.1: POST /api/patient/generate-code ---")
    resp = client.post("/api/patient/generate-code", json={"patient_id": "RAMESH-54"})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    gen_data = resp.json()
    print("generate-code response:", json.dumps(gen_data, indent=2))
    assert gen_data["patient_id"] == "RAMESH-54"
    assert len(gen_data["code"]) == 6
    assert gen_data["validity_minutes"] == 15
    active_code = gen_data["code"]

    print("
--- 1.2: POST /api/patient/verify-code (Valid Active Code) ---")
    resp = client.post("/api/patient/verify-code", json={"patient_id": "RAMESH-54", "code": active_code})
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    verify_data = resp.json()
    print("verify-code response profile name:", verify_data["profile"]["patientName"])
    assert verify_data["success"] is True
    assert verify_data["patient_id"] == "RAMESH-54"
    assert verify_data["profile"]["age"] == 54
    assert len(verify_data["profile"]["allergies"]) >= 2
    assert len(verify_data["profile"]["currentMedicines"]) >= 1

    print("
--- 1.3: POST /api/patient/verify-code (Invalid/Expired Code) ---")
    resp_invalid = client.post("/api/patient/verify-code", json={"patient_id": "RAMESH-54", "code": "000000"})
    assert resp_invalid.status_code == 403
    print("403 Forbidden verified for invalid access code:", resp_invalid.json())

    # ---------------- 2. PATIENT RECORD EDITABILITY ----------------
    print("
--- 2.1: PUT /api/patient/{patient_id}/profile ---")
    update_payload = {
        "simpleSummary": "Patient is in stable recovery following post-STEMI protocol. Vitals normalized.",
        "allergies": [
            "Penicillin (Causes severe skin rash and swelling)",
            "Ibuprofen / NSAIDs (Causes breathing tightness)",
            "Dust and pollen (Mild seasonal allergy)",
            "Sulfa Drugs (Mild hives)"
        ]
    }
    resp = client.put("/api/patient/RAMESH-54/profile", json=update_payload)
    assert resp.status_code == 200
    updated_prof = resp.json()
    print("Updated profile allergies count:", len(updated_prof["profile"]["allergies"]))
    assert len(updated_prof["profile"]["allergies"]) == 4

    print("
--- 2.2: POST & DELETE /api/patient/{patient_id}/lab-files ---")
    new_lab_payload = {
        "name": "Echocardiogram (2D Echo)",
        "category": "Cardiology / Ultrasound",
        "date": "18 Oct 2026",
        "fileSize": "3.5 MB",
        "notes": "LVEF 55%, mild anterior hypokinesia, no pericardial effusion."
    }
    resp_lab = client.post("/api/patient/RAMESH-54/lab-files", json=new_lab_payload)
    assert resp_lab.status_code == 200
    created_lab = resp_lab.json()
    print("Created lab file:", created_lab)
    lab_id = created_lab["labFile"]["id"]

    resp_del_lab = client.delete(f"/api/patient/RAMESH-54/lab-files/{lab_id}")
    assert resp_del_lab.status_code == 200
    print("Deleted lab file:", resp_del_lab.json())

    # ---------------- 3. DIGITAL PRESCRIPTION & JAN AUSHADHI CHECK ----------------
    print("
--- 3.1: POST /api/patient/{patient_id}/prescribe (Allergy Contraindication) ---")
    resp_contra = client.post("/api/patient/RAMESH-54/prescribe", json={"drug_name": "Combiflam (Ibuprofen + Paracetamol)"})
    assert resp_contra.status_code == 200
    contra_data = resp_contra.json()
    print("Prescribe Combiflam safety result:", contra_data["safety_status"])
    print("Warning:", contra_data["warning_message"])
    assert contra_data["safety_status"] == "CONTRAINDICATED_WARNING"
    assert "NSAID" in contra_data["allergy_detected"]
    assert "Paracetamol" in contra_data["jan_aushadhi_alternative"]["recommended_generic"]

    print("
--- 3.2: POST /api/patient/{patient_id}/prescribe (Safe Drug Prescription) ---")
    resp_safe = client.post("/api/patient/RAMESH-54/prescribe", json={"drug_name": "Lipitor (Atorvastatin 20mg)"})
    assert resp_safe.status_code == 200
    safe_data = resp_safe.json()
    print("Prescribe Lipitor safety result:", safe_data["safety_status"])
    print("Jan Aushadhi Alternative:", safe_data["jan_aushadhi_alternative"])
    assert safe_data["safety_status"] == "SAFE_TO_PRESCRIBE"
    assert safe_data["allergy_detected"] is None

    # ---------------- 4. IIIT DELHI HOSPITAL SMART QUEUE ----------------
    print("
--- 4.1: GET /api/hospital/HOSP-IIITD/queue ---")
    resp_queue = client.get("/api/hospital/HOSP-IIITD/queue")
    assert resp_queue.status_code == 200
    q_data = resp_queue.json()
    print(f"HOSP-IIITD Queue slots: {len(q_data['queue'])}, Waiting patients: {len(q_data['waiting_patients'])}")
    assert len(q_data["queue"]) >= 2
    assert len(q_data["waiting_patients"]) >= 1

    print("
--- 4.2: POST /api/hospital/HOSP-IIITD/queue/{slot_id}/cancel ---")
    resp_cancel = client.post("/api/hospital/HOSP-IIITD/queue/q-1/cancel")
    assert resp_cancel.status_code == 200
    print("Cancel slot response:", resp_cancel.json())
    assert resp_cancel.json()["status"] == "vacated"

    print("
--- 4.3: POST /api/hospital/HOSP-IIITD/queue/{slot_id}/reallocate ---")
    realloc_payload = {
        "slot_id": "q-2",
        "patient_name": "Sunita Verma",
        "age": 42,
        "gender": "Female",
        "reason": "Recurrent palpitations and acute chest tightness"
    }
    resp_realloc = client.post("/api/hospital/HOSP-IIITD/queue/q-2/reallocate", json=realloc_payload)
    assert resp_realloc.status_code == 200
    print("Reallocate slot response:", resp_realloc.json())
    assert resp_realloc.json()["status"] == "reallocated"

    print("
--- 4.4: PUT /api/hospital/HOSP-IIITD/patients/{patient_id}/status ---")
    resp_status = client.put("/api/hospital/HOSP-IIITD/patients/RAMESH-54/status", json={"status": "In Consultation"})
    assert resp_status.status_code == 200
    print("Patient status update response:", resp_status.json())
    assert resp_status.json()["new_status"] == "In Consultation"

    # ---------------- 5. DOCTOR VERIFICATION & AUTH ----------------
    print("
--- 5.1: POST /api/auth/verify-nmc ---")
    nmc_payload = {
        "doctor_name": "Dr. Rajesh Sharma",
        "nmc_reg_no": "NMC-MH-2016-08472",
        "state_council": "Maharashtra Medical Council",
        "year_of_reg": 2016,
        "specialty": "Cardiology",
        "degree": "DM Cardiology",
        "years_experience": 8
    }
    resp_nmc = client.post("/api/auth/verify-nmc", json=nmc_payload)
    assert resp_nmc.status_code == 200
    nmc_data = resp_nmc.json()
    print("verify-nmc response:", json.dumps(nmc_data, indent=2))
    assert nmc_data["pseudonym"] == "Dr_Pulse_9482"
    assert nmc_data["vote_weight"] == 5

    print("
--- 5.2: GET /api/auth/me ---")
    resp_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {nmc_data['token']}"})
    assert resp_me.status_code == 200
    print("auth/me profile:", resp_me.json())

    # ---------------- 6. MEDBOARD CASES & HOSPITALS ----------------
    print("
--- 6.1: GET /api/cases ---")
    resp_cases = client.get("/api/cases")
    assert resp_cases.status_code == 200
    print(f"MedBoard total cases: {len(resp_cases.json()['cases'])}")

    print("
--- 6.2: GET /api/hospitals (k-anonymity) ---")
    resp_hosps = client.get("/api/hospitals")
    assert resp_hosps.status_code == 200
    h_map = {h["hospital_id"]: h for h in resp_hosps.json()["hospitals"]}
    assert h_map["HOSP-IIITD"]["is_unlocked"] is True
    assert h_map["hosp_district_purnia"]["is_unlocked"] is False
    print("IIITD Hospital Unlocked:", h_map["HOSP-IIITD"]["is_unlocked"])
    print("Purnia Hospital Locked (k=5):", h_map["hosp_district_purnia"]["is_unlocked"])

    print("
" + "=" * 65)
    print(">>> ALL MEDNEXUS ENDPOINTS VERIFIED SUCCESSFULLY (200 OK)! <<<")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
