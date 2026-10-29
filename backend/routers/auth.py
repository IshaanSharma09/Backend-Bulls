# MedNexus Core Clinical Router: auth.py
import hashlib
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Doctor
from schemas import VerifyNmcRequest, VerifyNmcResponse, DoctorProfileResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

SALT = "mednexus_nmc_salt_2026"


def compute_nmc_hash(reg_no: str) -> str:
    cleaned = reg_no.strip().upper()
    return hashlib.sha256(f"{cleaned}:{SALT}".encode("utf-8")).hexdigest()


def compute_vote_weight(degree: str, years: int) -> int:
    deg_upper = degree.upper() if degree else ""
    if years >= 8 or "DM" in deg_upper or "MCH" in deg_upper:
        return 5
    return 2


def format_badge(specialty: str, years: int) -> str:
    spec = specialty.capitalize()
    if "cardio" in spec.lower():
        spec = "Cardiologist"
    elif "neuro" in spec.lower():
        spec = "Neurologist"
    return f"Verified {spec}, {years} yrs"


@router.post("/verify-nmc", response_model=VerifyNmcResponse)
def verify_nmc(payload: VerifyNmcRequest, db: Session = Depends(get_db)):
    nmc_hash = compute_nmc_hash(payload.nmc_reg_no)
    doctor = db.query(Doctor).filter(Doctor.nmc_hash == nmc_hash).first()

    if doctor:
        return VerifyNmcResponse(
            token=doctor.token,
            doctor_id=doctor.doctor_id,
            pseudonym=doctor.pseudonym,
            badge=doctor.badge,
            vote_weight=doctor.vote_weight,
            specialty=doctor.specialty,
            reputation_score=doctor.reputation_score,
        )

    vote_weight = compute_vote_weight(payload.degree, payload.years_experience)
    doc_id = f"doc_{secrets.token_hex(4)}"
    pseudonym = f"Dr_Pulse_{secrets.token_hex(2)}"
    badge = format_badge(payload.specialty, payload.years_experience)
    token = f"eyJhGciOiJIUzI1NiIsIn...{secrets.token_hex(16)}"

    doctor = Doctor(
        doctor_id=doc_id,
        hospital_id="HOSP-IIITD",
        name=payload.doctor_name,
        email=f"{payload.doctor_name.lower().replace(' ', '.')}@iiitd.ac.in",
        specialty=payload.specialty,
        degree=payload.degree,
        years_experience=payload.years_experience,
        nmc_reg_no=payload.nmc_reg_no,
        nmc_hash=nmc_hash,
        pseudonym=pseudonym,
        badge=badge,
        vote_weight=vote_weight,
        reputation_score=120,
        token=token,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return VerifyNmcResponse(
        token=doctor.token,
        doctor_id=doctor.doctor_id,
        pseudonym=doctor.pseudonym,
        badge=doctor.badge,
        vote_weight=doctor.vote_weight,
        specialty=doctor.specialty,
        reputation_score=doctor.reputation_score,
    )


@router.get("/me", response_model=DoctorProfileResponse)
def get_current_doctor(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        doctor = db.query(Doctor).filter(Doctor.token == token).first()
        if doctor:
            return DoctorProfileResponse(
                doctor_id=doctor.doctor_id,
                pseudonym=doctor.pseudonym,
                badge=doctor.badge,
                vote_weight=doctor.vote_weight,
                specialty=doctor.specialty,
                reputation_score=doctor.reputation_score,
            )

    # Default to Dr. Rajesh Sharma for testing
    default_doc = db.query(Doctor).first()
    if default_doc:
        return DoctorProfileResponse(
            doctor_id=default_doc.doctor_id,
            pseudonym=default_doc.pseudonym,
            badge=default_doc.badge,
            vote_weight=default_doc.vote_weight,
            specialty=default_doc.specialty,
            reputation_score=default_doc.reputation_score,
        )

    return DoctorProfileResponse(
        doctor_id="doc_u8f93a12",
        pseudonym="Dr_Pulse_9482",
        badge="Verified Cardiologist, 8 yrs",
        vote_weight=5,
        specialty="Cardiology",
        reputation_score=120,
    )
