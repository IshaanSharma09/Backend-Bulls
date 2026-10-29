"""
MedNexus Database Seeder - Rural Family Profiles, 15-Minute Dynamic Codes & Generic Formularies
"""
import json
import time
import hashlib
from database import engine, SessionLocal, Base
from models import (
    Hospital,
    HospitalReview,
    Doctor,
    Patient,
    PatientAccessCode,
    HospitalQueueSlot,
    WaitingPatient,
    Case,
    Comment,
)

SALT = "mednexus_nmc_salt_2026"


def compute_nmc_hash(reg_no: str) -> str:
    cleaned = reg_no.strip().upper()
    return hashlib.sha256(f"{cleaned}:{SALT}".encode("utf-8")).hexdigest()


def seed_database():
    print("[Seed] Resetting and creating all database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("[Seed] Seeding Hospitals...")
        h_hosp = Hospital(
            hospital_id="HOSP-01",
            hospital_code="HOSP",
            name="Hospital",
            city="New Delhi",
            state="Delhi",
            review_count=6,
        )
        h_apex = Hospital(
            hospital_id="hosp_metro_apex",
            hospital_code="APEX",
            name="Apex Metro Super Specialty Hospital",
            city="Mumbai",
            state="Maharashtra",
            review_count=6,
        )
        h_purnia = Hospital(
            hospital_id="hosp_district_purnia",
            hospital_code="PUR03",
            name="Purnia Regional Medical Center",
            city="Purnia",
            state="Bihar",
            review_count=4,
        )
        db.add_all([h_hosp, h_apex, h_purnia])
        db.commit()

        print("[Seed] Seeding Hospital Reviews...")
        for i in range(1, 7):
            db.add(HospitalReview(
                id=f"rev_hosp_{i}",
                hospital_id="HOSP-01",
                doctor_hash=compute_nmc_hash(f"HOSP-DOC-{i}"),
                department="Cardiology" if i % 2 == 0 else "Emergency Medicine",
                workload_rating=2.4 if i == 1 else 3.5,
                safety_rating=4.8,
                bullying_free_rating=4.5,
                pay_fairness_rating=4.2,
                equipment_rating=4.9,
                review_text="Excellent digital research infrastructure, modern cath labs, and collaborative team.",
                month_year="October 2026",
                created_at="2026-10-15T10:00:00Z"
            ))
            db.add(HospitalReview(
                id=f"rev_apex_{i}",
                hospital_id="hosp_metro_apex",
                doctor_hash=compute_nmc_hash(f"APEX-DOC-{i}"),
                department="Cardiology",
                workload_rating=2.4 if i == 1 else 3.0,
                safety_rating=4.5,
                bullying_free_rating=3.8,
                pay_fairness_rating=4.1,
                equipment_rating=4.8,
                review_text="Top notch equipment and cath labs. High weekend patient volume.",
                month_year="September 2026",
                created_at="2026-09-12T10:00:00Z"
            ))

        for i in range(1, 5):
            db.add(HospitalReview(
                id=f"rev_purnia_{i}",
                hospital_id="hosp_district_purnia",
                doctor_hash=compute_nmc_hash(f"PURNIA-DOC-{i}"),
                department="General Medicine",
                workload_rating=2.0,
                safety_rating=3.5,
                bullying_free_rating=3.0,
                pay_fairness_rating=3.0,
                equipment_rating=2.5,
                review_text="Resident doctors work diligently despite limited bed capacity.",
                month_year="August 2026",
                created_at="2026-08-20T12:00:00Z"
            ))
        db.commit()

        print("[Seed] Seeding Doctors...")
        d1 = Doctor(
            doctor_id="doc_u8f93a12",
            hospital_id="HOSP-01",
            name="Dr. Rajesh Sharma",
            email="rajesh.sharma@hospital.org",
            specialty="Cardiology",
            degree="DM Cardiology",
            years_experience=8,
            nmc_reg_no="NMC-MH-2016-08472",
            nmc_hash=compute_nmc_hash("NMC-MH-2016-08472"),
            pseudonym="Dr_Pulse_9482",
            badge="Verified Cardiologist, 8 yrs",
            vote_weight=5,
            reputation_score=120,
            token="eyJhGciOiJIUzI1NiIsIn...rajesh_sharma",
        )
        db.add(d1)
        db.commit()

        print("[Seed] Seeding Patient Ramesh Kumar (RAMESH-54)...")
        p_ramesh = Patient(
            patient_id="RAMESH-54",
            name="Ramesh Kumar",
            age=54,
            gender="Male",
            blood_group="B+",
            simple_summary="Stable and recovering well. Blood pressure and pulse are in the healthy target range.",
            allergies_json=json.dumps([
                "Penicillin (Causes severe skin rash and swelling)",
                "Ibuprofen / NSAIDs (Causes breathing tightness)",
                "Dust and pollen (Mild seasonal allergy)"
            ]),
            genetics_json=json.dumps([
                "Father: Coronary Artery Disease diagnosed at age 58",
                "Mother: Type 2 Diabetes diagnosed at age 62"
            ]),
            vaccinations_json=json.dumps([
                { "name": "COVID-19 Booster", "status": "Completed (3 doses)", "date": "Jan 2023" },
                { "name": "Influenza (Annual Flu Shot)", "status": "Up to date", "date": "Oct 2025" }
            ]),
            current_medicines_json=json.dumps([
                { "id": "med-1", "name": "Aspirin Chewable (75 mg)", "dose": "1 Tablet (75 mg)", "frequency": "Once daily in morning", "instructions": "Chew thoroughly after meal with water." },
                { "id": "med-2", "name": "Atorvastatin (20 mg)", "dose": "1 Tablet (20 mg)", "frequency": "Once daily at bedtime", "instructions": "Take every night before sleeping." }
            ]),
            lab_files_json=json.dumps([
                { "id": "lab-1", "name": "12-Lead ECG Tracing", "category": "Cardiology / ECG", "date": "16 Oct 2026", "fileSize": "1.2 MB", "notes": "Normal sinus rhythm, HR 72 bpm." }
            ]),
            status="Observation Ward"
        )
        db.add(p_ramesh)
        db.commit()

        print("[Seed] Seeding Active 15-Minute Access Code (742918)...")
        now_ms = int(time.time() * 1000)
        expires_at_ms = now_ms + (15 * 60 * 1000)
        code_record = PatientAccessCode(
            patient_id="RAMESH-54",
            code="742918",
            generated_at=now_ms,
            expires_at=expires_at_ms,
            is_active=True
        )
        db.add(code_record)
        db.commit()

        print("[Seed] Seeding Hospital Queue Slots & Waiting Patients...")
        q1 = HospitalQueueSlot(
            id="q-1",
            hospital_id="HOSP-01",
            slot_time="09:30 AM",
            patient_id="PAT-0912",
            patient_name="Ramesh Kumar",
            age=54,
            gender="Male",
            severity="Emergency",
            status="Confirmed",
            referring_spoke="HOSP Rural Health Extension",
            attending_doctor="Dr. Rajesh Sharma (DM Cardiology)",
            notes="Post-STEMI stabilization.",
        )
        q2 = HospitalQueueSlot(
            id="q-2",
            hospital_id="HOSP-01",
            slot_time="10:15 AM",
            patient_id="",
            patient_name="Cancelled by Patient",
            age=0,
            gender="",
            severity="Routine",
            status="Empty (Cancelled)",
            referring_spoke="OPD Walk-in",
            attending_doctor="Dr. Rajesh Sharma (DM Cardiology)",
            notes="Slot cancelled. Flagged as FREE for waiting patients.",
        )
        w1 = WaitingPatient(
            id="WAIT-01",
            hospital_id="HOSP-01",
            name="Sunita Verma",
            age=42,
            gender="Female",
            requested_doctor="Dr. Rajesh Sharma",
            reason="Recurrent palpitations and acute chest tightness",
            arrival_status="Waiting in OPD Lounge",
            requested_time="Arrived 45m early",
            phone="+91 98112-40912",
        )
        db.add_all([q1, q2, w1])
        db.commit()

        print("[Seed] Seeding MedBoard Cases & Comments...")
        c1 = Case(
            case_id="case_cardio_101",
            title="34M Post-Harvest Acute Chest Pain with ST Elevation",
            specialty_tag="c/CardioEmergency",
            author_pseudonym="Dr_Kosi_Care",
            author_badge="Verified Spoke Physician, 4 yrs",
            patient_age=34,
            patient_gender="Male",
            chief_complaint="Severe retrosternal crushing chest pain radiating to left jaw for 2 hours",
            vitals_json=json.dumps({ "bp": "90/60 mmHg", "pulse": 118, "spo2": 91, "temp": 98.4 }),
            history="Farmer, heavy lifting during paddy harvest. No prior known cardiac history. Smoker.",
            labs_and_ecg="ECG shows 3mm ST elevation in leads V2-V5. Troponin T rapid positive.",
            imaging_urls_json=json.dumps(["/uploads/cases/ecg_anonymized_01.jpg"]),
            bounty_amount=350,
            urgency_score=92,
            status="open",
            consensus_status="in_progress",
            consensus_score=75,
            consensus_percentage=75,
            leading_diagnosis="Acute Anterior STEMI with Cardiogenic Shock Risk",
            has_ai_pin=True,
            comments_count=1,
            created_at="2026-10-17T14:30:00Z",
        )
        comm1 = Comment(
            comment_id="comm_882",
            case_id="case_cardio_101",
            author_pseudonym="Dr_Pulse_9482",
            author_badge="Verified Cardiologist, 8 yrs",
            vote_weight=5,
            content="Immediate loading dose: Aspirin 325mg + Clopidogrel 300mg + Atorvastatin 80mg. Administer Tenecteplase if PCI transfer > 120 mins.",
            suggested_diagnosis="Acute Anterior STEMI",
            is_second_opinion=True,
            upvotes=12,
            created_at="2026-10-17T14:45:00Z",
        )
        db.add_all([c1, comm1])
        db.commit()

        print("[Seed] All initial data seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
