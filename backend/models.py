"""
MedNexus Data Models - Clinical Profiles, Dynamic 15-Minute Safe Codes & OPD Triage
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    hospital_id = Column(String, primary_key=True, index=True)
    hospital_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    review_count = Column(Integer, default=0)

    reviews = relationship("HospitalReview", back_populates="hospital", cascade="all, delete-orphan")


class HospitalReview(Base):
    __tablename__ = "hospital_reviews"

    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String, ForeignKey("hospitals.hospital_id"), nullable=False, index=True)
    doctor_hash = Column(String, nullable=True)
    department = Column(String, nullable=False)
    workload_rating = Column(Float, nullable=False)
    safety_rating = Column(Float, nullable=False)
    bullying_free_rating = Column(Float, nullable=False)
    pay_fairness_rating = Column(Float, nullable=False)
    equipment_rating = Column(Float, nullable=False)
    review_text = Column(Text, nullable=False)
    month_year = Column(String, nullable=True)
    created_at = Column(String, nullable=False)

    hospital = relationship("Hospital", back_populates="reviews")


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    specialty = Column(String, nullable=False)
    degree = Column(String, nullable=True)
    years_experience = Column(Integer, default=0)
    nmc_reg_no = Column(String, nullable=True)
    nmc_hash = Column(String, unique=True, index=True, nullable=False)
    pseudonym = Column(String, unique=True, index=True, nullable=False)
    badge = Column(String, nullable=False)
    vote_weight = Column(Integer, default=2)
    reputation_score = Column(Integer, default=100)
    token = Column(String, index=True, nullable=False)


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    blood_group = Column(String, default="B+")
    simple_summary = Column(Text, nullable=False)
    allergies_json = Column(Text, default="[]")
    genetics_json = Column(Text, default="[]")
    vaccinations_json = Column(Text, default="[]")
    current_medicines_json = Column(Text, default="[]")
    lab_files_json = Column(Text, default="[]")
    status = Column(String, default="Observation Ward")


class PatientAccessCode(Base):
    __tablename__ = "patient_access_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String, ForeignKey("patients.patient_id"), nullable=False, index=True)
    code = Column(String, nullable=False, index=True)
    generated_at = Column(BigInteger, nullable=False)  # epoch ms
    expires_at = Column(BigInteger, nullable=False)    # epoch ms
    is_active = Column(Boolean, default=True, index=True)


class HospitalQueueSlot(Base):
    __tablename__ = "hospital_queue"

    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String, nullable=False, default="HOSP-IIITD", index=True)
    slot_time = Column(String, nullable=False)
    patient_id = Column(String, default="")
    patient_name = Column(String, nullable=False)
    age = Column(Integer, default=0)
    gender = Column(String, default="")
    severity = Column(String, nullable=False, default="Routine")
    status = Column(String, nullable=False, default="Confirmed")
    referring_spoke = Column(String, default="OPD Walk-in")
    attending_doctor = Column(String, default="Dr. Rajesh Sharma (DM Cardiology)")
    notes = Column(Text, default="")


class WaitingPatient(Base):
    __tablename__ = "waiting_patients"

    id = Column(String, primary_key=True, index=True)
    hospital_id = Column(String, nullable=False, default="HOSP-IIITD", index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    requested_doctor = Column(String, default="Dr. Rajesh Sharma")
    reason = Column(Text, default="")
    arrival_status = Column(String, default="Waiting in OPD Lounge")
    requested_time = Column(String, default="Arrived early")
    phone = Column(String, default="")


class Case(Base):
    __tablename__ = "cases"

    case_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    specialty_tag = Column(String, index=True, nullable=False)
    author_pseudonym = Column(String, nullable=False)
    author_badge = Column(String, nullable=False)
    patient_age = Column(Integer, nullable=False)
    patient_gender = Column(String, nullable=False)
    chief_complaint = Column(Text, nullable=False)
    vitals_json = Column(Text, nullable=False)
    history = Column(Text, nullable=False)
    labs_and_ecg = Column(Text, nullable=False)
    imaging_urls_json = Column(Text, default="[]")
    bounty_amount = Column(Integer, default=350)
    urgency_score = Column(Integer, default=92)
    status = Column(String, default="open", index=True)
    consensus_status = Column(String, default="in_progress")
    consensus_score = Column(Integer, default=75)
    consensus_percentage = Column(Integer, default=75)
    leading_diagnosis = Column(String, nullable=True)
    has_ai_pin = Column(Boolean, default=True)
    comments_count = Column(Integer, default=0)
    created_at = Column(String, nullable=False)

    comments = relationship("Comment", back_populates="case", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), index=True, nullable=False)
    author_pseudonym = Column(String, nullable=False)
    author_badge = Column(String, nullable=False)
    vote_weight = Column(Integer, default=2)
    content = Column(Text, nullable=False)
    suggested_diagnosis = Column(String, nullable=True)
    is_second_opinion = Column(Boolean, default=True)
    upvotes = Column(Integer, default=0)
    created_at = Column(String, nullable=False)

    case = relationship("Case", back_populates="comments")
