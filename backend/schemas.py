from typing import List, Optional, Any, Dict, Union
from pydantic import BaseModel, Field


# ---------------- 1. Patient Consent & Access Code Schemas ----------------
class GenerateCodeRequest(BaseModel):
    patient_id: str


class GenerateCodeResponse(BaseModel):
    patient_id: str
    code: str
    generated_at: int
    expires_at: int
    validity_minutes: int = 15


class VerifyCodeRequest(BaseModel):
    patient_id: Optional[str] = None
    code: str


class VaccinationItem(BaseModel):
    name: str
    status: str
    date: str


class MedicineItem(BaseModel):
    id: str
    name: str
    dose: str
    frequency: str
    instructions: str


class LabFileItem(BaseModel):
    id: str
    name: str
    category: str
    date: str
    fileSize: str
    notes: str


class PatientClinicalProfile(BaseModel):
    patientName: str
    age: int
    gender: str
    bloodGroup: str
    simpleSummary: str
    allergies: List[str]
    genetics: List[str]
    vaccinations: List[VaccinationItem]
    currentMedicines: List[MedicineItem]
    labFiles: List[LabFileItem]


class VerifyCodeResponse(BaseModel):
    success: bool
    patient_id: str
    profile: Optional[PatientClinicalProfile] = None
    error: Optional[str] = None


# ---------------- 2. Patient Record Editability Schemas ----------------
class UpdateProfileRequest(BaseModel):
    simpleSummary: Optional[str] = None
    allergies: Optional[List[str]] = None
    genetics: Optional[List[str]] = None
    vaccinations: Optional[List[VaccinationItem]] = None
    currentMedicines: Optional[List[MedicineItem]] = None


class CreateLabFileRequest(BaseModel):
    name: str
    category: str
    date: str
    fileSize: str
    notes: str


class UpdateLabFileRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    fileSize: Optional[str] = None
    notes: Optional[str] = None


# ---------------- 3. Hospital Queue Schemas ----------------
class QueueSlotItem(BaseModel):
    id: str
    hospitalId: str
    slotTime: str
    patientId: str
    patientName: str
    age: int
    gender: str
    severity: str
    status: str
    referringSpoke: str
    attendingDoctor: str
    notes: str


class WaitingPatientItem(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    requestedDoctor: str
    reason: str
    arrivalStatus: str
    requestedTime: str
    phone: str


class QueueResponse(BaseModel):
    queue: List[QueueSlotItem]
    waiting_patients: List[WaitingPatientItem]


class ReallocateSlotRequest(BaseModel):
    slot_id: str
    patient_name: str
    age: int
    gender: str
    reason: str


class PatientStatusUpdateRequest(BaseModel):
    status: str


# ---------------- 4. Digital Prescription & Jan Aushadhi Safety Check ----------------
class PrescribeDrugRequest(BaseModel):
    drug_name: str


class JanAushadhiAlternative(BaseModel):
    recommended_generic: str
    branded_mrp_inr: float
    jan_aushadhi_inr: float
    savings_percentage: str


class PrescribeDrugResponse(BaseModel):
    safety_status: str
    allergy_detected: Optional[str] = None
    warning_message: Optional[str] = None
    jan_aushadhi_alternative: JanAushadhiAlternative


# ---------------- 5. Doctor Verification & Auth ----------------
class VerifyNmcRequest(BaseModel):
    doctor_name: str
    nmc_reg_no: str
    state_council: str
    year_of_reg: int
    specialty: str
    degree: str
    years_experience: int


class VerifyNmcResponse(BaseModel):
    token: str
    doctor_id: str
    pseudonym: str
    badge: str
    vote_weight: int
    specialty: str
    reputation_score: int


class DoctorProfileResponse(BaseModel):
    doctor_id: str
    pseudonym: str
    badge: str
    vote_weight: int
    specialty: str
    reputation_score: int


# ---------------- 6. MedBoard Cases & Hospitals ----------------
class CaseSummaryItem(BaseModel):
    case_id: str
    title: str
    specialty_tag: str
    author_pseudonym: str
    author_badge: str
    patient_age: int
    patient_gender: str
    urgency_score: int
    bounty_amount: int
    status: str
    consensus_score: int
    comments_count: int
    has_ai_pin: bool
    created_at: str


class CaseListResponse(BaseModel):
    cases: List[CaseSummaryItem]


class PatientDemographics(BaseModel):
    age: int
    gender: str


class CreateCaseRequest(BaseModel):
    title: str
    specialty_tag: str
    patient_demographics: PatientDemographics
    chief_complaint: str
    vitals: Dict[str, Any]
    history: str
    labs_and_ecg: str
    imaging_urls: Optional[List[str]] = Field(default_factory=list)
    bounty_amount: Optional[int] = 350
    urgency_score: Optional[int] = 92
    second_opinion_tags: Optional[List[str]] = Field(default_factory=list)


class CreateCaseResponse(BaseModel):
    case_id: str
    status: str
    created_at: str


class CommentItem(BaseModel):
    comment_id: str
    author_pseudonym: str
    author_badge: str
    vote_weight: int
    content: str
    suggested_diagnosis: Optional[str] = None
    upvotes: int = 0
    created_at: str


class CaseDetailResponse(BaseModel):
    case_id: str
    title: str
    specialty_tag: str
    author_pseudonym: str
    author_badge: str
    patient_demographics: PatientDemographics
    chief_complaint: str
    vitals: Dict[str, Any]
    history: str
    labs_and_ecg: str
    imaging_urls: List[str]
    bounty_amount: int
    urgency_score: int
    consensus_status: str
    consensus_percentage: int
    leading_diagnosis: Optional[str] = None
    comments: List[CommentItem]


class CreateCommentRequest(BaseModel):
    content: str
    suggested_diagnosis: Optional[str] = None
    is_second_opinion: Optional[bool] = True


class CreateCommentResponse(BaseModel):
    comment_id: str
    author_pseudonym: str
    author_badge: str
    vote_weight: int
    new_consensus_percentage: int
    consensus_reached: bool


class ClaimBountyResponse(BaseModel):
    status: str
    amount: int
    credited_to_pseudonym: str
    hospital_escrow_settled: bool


class HospitalScores(BaseModel):
    workload: float
    safety: float
    bullying_free: float
    pay_fairness: float
    equipment: float
    overall_culture: float


class HospitalItem(BaseModel):
    hospital_id: str
    name: str
    city: str
    state: str
    review_count: int
    is_unlocked: bool
    reviews_needed_to_unlock: Optional[int] = None
    scores: Optional[HospitalScores] = None


class HospitalListResponse(BaseModel):
    hospitals: List[HospitalItem]


class CreateReviewRequest(BaseModel):
    department: str
    workload_rating: float
    safety_rating: float
    bullying_free_rating: float
    pay_fairness_rating: float
    equipment_rating: float
    review_text: str


class CreateReviewResponse(BaseModel):
    status: str
    message: str
    total_hospital_reviews: int
    is_now_unlocked: bool
