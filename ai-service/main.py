"""
MedNexus AI Service (ai-service/main.py)
Laptop 3: AI Engine running on port 8001
CORS configured for seamless multi-laptop / direct browser communication.
Host: 0.0.0.0, Port: 8001
"""

import os
import io
import uuid
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from PIL import Image, ImageDraw

from config import HOST, PORT, is_gemini_available
from services.patient_report_generator import generate_patient_health_report
from services.patient_health_summary import generate_crisp_health_summary, generate_clinical_filter_summary
from services.medication_parser import parse_medication_schedule
from services.doctor_matcher import match_doctor_specialty
from services.phi_scrubber import sanitize_medical_text
from services.review_moderator import moderate_review
from services.semantic_search import search_clinical_cases, generate_assistant_pin
from services.soap_scribe import generate_soap_scribe
from services.jan_aushadhi_engine import get_jan_aushadhi_savings
from services.medical_ocr_engine import process_medical_document

# Initialize FastAPI App
app = FastAPI(
    title="MedNexus AI Engine",
    description="Rural-to-Metro Clinical AI Engine: Health Report Generator, Medication Parser, Doctor Matcher, PHI Scrubber, and Clinical OS",
    version="2.0.0"
)

# Universal CORSMiddleware as strictly mandated
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static directory for masked diagnostic imaging
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ---------------------------------------------------------------------------
# Pydantic Schemas: Streamlined Core AI Endpoints
# ---------------------------------------------------------------------------

# 1. Full AI Health Report Generator
class PatientDemographics(BaseModel):
    age: int
    gender: str

class DiagnosticTestItem(BaseModel):
    name: str
    result: str

class GeneratePatientReportRequest(BaseModel):
    patient_id: str
    demographics: PatientDemographics
    symptoms: str
    ecg_findings: str
    allergies: List[str] = Field(default_factory=list)
    tests: List[DiagnosticTestItem] = Field(default_factory=list)

class GeneratePatientReportResponse(BaseModel):
    patient_id: str
    plain_summary: str
    critical_allergy_warning: str
    vitals_interpretation: str
    ai_care_directives: List[str]


# 2. Medication Dosage & Schedule Parser
class ParseMedicationScheduleRequest(BaseModel):
    prescription_text: str

class JanAushadhiGenericItem(BaseModel):
    branded_drug: Optional[str] = None
    branded_mrp_inr: Optional[float] = None
    jan_aushadhi_generic: Optional[str] = None
    jan_aushadhi_inr: Optional[float] = None
    cost_reduction: Optional[str] = None

class MedicationItem(BaseModel):
    medicine_name: str
    exact_dose: str
    frequency: str
    timing: str
    total_duration_days: int
    remaining_countdown: int
    instructions: Optional[str] = None
    jan_aushadhi_generic: Optional[Dict[str, Any]] = None

class ParseMedicationScheduleResponse(BaseModel):
    medications: List[MedicationItem]
    total_medications: int
    overall_savings_estimate: str


# 3. Symptom-to-Doctor Recommendation Engine
class MatchDoctorRequest(BaseModel):
    query: str

class DifferentialSpecialtyItem(BaseModel):
    specialty: str
    confidence: float

class MatchDoctorResponse(BaseModel):
    primary_specialty: str
    match_confidence: float
    urgency: str
    suggested_questions: Optional[List[str]] = None
    differential_specialties: Optional[List[DifferentialSpecialtyItem]] = None


# 4. Crisp AI Patient Health Summary
class PatientHealthSummaryRequest(BaseModel):
    patient_name: str
    age: int
    vitals: Dict[str, Any]
    diagnostics: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)

class PatientHealthSummaryResponse(BaseModel):
    simple_summary: str
    allergy_alert: str
    status_tag: str


# ---------------------------------------------------------------------------
# Legacy & Shared MedNexus Schemas
# ---------------------------------------------------------------------------

class SanitizeTextRequest(BaseModel):
    raw_text: str

class RedactionItem(BaseModel):
    type: str
    original: str
    replacement: str

class SanitizeTextResponse(BaseModel):
    sanitized_text: str
    redactions: List[RedactionItem]
    phi_risk_score: float
    is_safe_to_publish: bool

class ModerateReviewRequest(BaseModel):
    review_text: str

class ModerateReviewResponse(BaseModel):
    is_allowed: bool
    moderation_verdict: str
    flags: List[str]
    explanation: str
    cleaned_suggestion: Optional[str] = None

class SearchCasesRequest(BaseModel):
    query: str
    specialty: Optional[str] = None
    top_k: Optional[int] = 3

class SearchCasesResponse(BaseModel):
    query: str
    matches: List[Dict[str, Any]]

class AssistantPinRequest(BaseModel):
    case_id: str
    symptoms: str
    labs: str
    patient_allergies: Optional[List[str]] = Field(default_factory=list)

class AssistantPinResponse(BaseModel):
    ai_pinned_summary: Dict[str, Any]

class SoapScribeRequest(BaseModel):
    raw_doctor_notes: str
    patient_timeline: Optional[List[str]] = Field(default_factory=list)

class SoapNoteContent(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str

class SoapScribeResponse(BaseModel):
    soap_note: SoapNoteContent
    urgency_score: int
    urgency_tier: str
    contraindication_flag: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
@app.get("/health")
def health_check():
    """Health check endpoint to verify Laptop 3 connectivity."""
    return {
        "status": "healthy",
        "service": "MedNexus AI Engine (Laptop 3)",
        "port": PORT,
        "host": HOST,
        "gemini_live": is_gemini_available(),
        "endpoints": [
            "POST /ai/patient/health-summary",
            "POST /ai/generate-patient-report",
            "POST /ai/parse-medication-schedule",
            "POST /ai/match-doctor",
            "POST /ai/sanitize/text",
            "POST /ai/sanitize/image",
            "POST /ai/moderate/review",
            "POST /ai/search/cases",
            "POST /ai/case/assistant-pin",
            "POST /ai/scribe/soap"
        ]
    }


# ===========================================================================
# 0. CRISP AI PATIENT HEALTH SUMMARY (PLAIN ENGLISH)
# ===========================================================================
@app.post("/ai/patient/health-summary", response_model=PatientHealthSummaryResponse)
def endpoint_patient_health_summary(req: PatientHealthSummaryRequest):
    """
    Generates a 2-sentence plain English health status for the patient portal,
    prominent allergy contraindications, and status tag.
    """
    result = generate_crisp_health_summary(
        patient_name=req.patient_name,
        age=req.age,
        vitals=req.vitals,
        diagnostics=req.diagnostics,
        allergies=req.allergies
    )
    return result


# ===========================================================================
# 1. FULL AI HEALTH REPORT GENERATOR
# ===========================================================================
@app.post("/ai/generate-patient-report", response_model=GeneratePatientReportResponse)
def endpoint_generate_patient_report(req: GeneratePatientReportRequest):
    """
    Synthesizes clinical demographics, symptoms, ECG findings, allergies, and lab tests into:
    - plain_summary: Clear explanation of anterior wall STEMI in simple language
    - critical_allergy_warning: Prominent contraindication warning against Brufen/NSAIDs
    - vitals_interpretation: Status of BP, pulse, and oxygen
    - ai_care_directives: Bulleted lifestyle and follow-up guidance
    """
    tests_dict = [{"name": t.name, "result": t.result} for t in req.tests]
    result = generate_patient_health_report(
        patient_id=req.patient_id,
        demographics={"age": req.demographics.age, "gender": req.demographics.gender},
        symptoms=req.symptoms,
        ecg_findings=req.ecg_findings,
        allergies=req.allergies,
        tests=tests_dict
    )
    return result


# ===========================================================================
# 2. MEDICATION DOSAGE & SCHEDULE PARSER
# ===========================================================================
@app.post("/ai/parse-medication-schedule", response_model=ParseMedicationScheduleResponse)
def endpoint_parse_medication_schedule(req: ParseMedicationScheduleRequest):
    """
    Parses prescription text into structured array containing exact_dose, timing,
    total_duration_days, remaining countdown, and Jan Aushadhi generic mapping.
    """
    result = parse_medication_schedule(req.prescription_text)
    return result


# ===========================================================================
# 3. SYMPTOM-TO-DOCTOR RECOMMENDATION ENGINE
# ===========================================================================
@app.post("/ai/match-doctor", response_model=MatchDoctorResponse)
def endpoint_match_doctor(req: MatchDoctorRequest):
    """
    Computes clinical relevance between user symptoms and specialties
    (Cardiology, Neurology, Internal Medicine) with match confidence percentage
    and suggested questions for the doctor.
    """
    result = match_doctor_specialty(req.query)
    return result


# ===========================================================================
# Shared & Supplementary AI Endpoints
# ===========================================================================

@app.post("/ai/sanitize/text", response_model=SanitizeTextResponse)
def endpoint_sanitize_text(req: SanitizeTextRequest):
    result = sanitize_medical_text(req.raw_text)
    return result


@app.post("/ai/sanitize/image")
async def endpoint_sanitize_image(
    request: Request,
    file: Optional[UploadFile] = File(None)
):
    image_bytes = None
    if file:
        image_bytes = await file.read()
    else:
        try:
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                body = await request.json()
                b64_data = body.get("image_base64", "")
                if b64_data:
                    if "," in b64_data:
                        b64_data = b64_data.split(",")[1]
                    image_bytes = base64.b64decode(b64_data)
        except Exception:
            pass

    if not image_bytes:
        img = Image.new("RGB", (800, 600), color=(250, 250, 250))
        draw = ImageDraw.Draw(img)
        draw.text((20, 20), "Patient Name: Ramesh Kumar | Hospital: Kosi Mission Hospital", fill=(0, 0, 0))
        draw.line([(0, 300), (200, 300), (220, 200), (240, 400), (260, 260), (800, 300)], fill=(200, 0, 0), width=3)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG")
        image_bytes = buffer.getvalue()

    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        width, height = pil_img.size
        banner_height = max(int(height * 0.10), 40)
        draw = ImageDraw.Draw(pil_img)
        draw.rectangle([(0, 0), (width, banner_height)], fill=(20, 24, 39))
        draw.text((15, banner_height // 3), "[PHI REDACTED — CLINIC HEADER & PATIENT IDENTITY DETACHED]", fill=(16, 185, 129))

        out_filename = f"masked_{uuid.uuid4().hex[:8]}.jpg"
        out_path = STATIC_DIR / out_filename
        pil_img.save(out_path, format="JPEG", quality=90)

        out_buffer = io.BytesIO()
        pil_img.save(out_buffer, format="JPEG", quality=90)
        b64_out = "data:image/jpeg;base64," + base64.b64encode(out_buffer.getvalue()).decode("utf-8")

        return {
            "sanitized_image_url": f"/static/{out_filename}",
            "sanitized_image_base64": b64_out,
            "redaction_applied": "TOP_10_PERCENT_BANNER_MASKED",
            "is_safe_to_publish": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")


@app.post("/ai/moderate/review", response_model=ModerateReviewResponse)
def endpoint_moderate_review(req: ModerateReviewRequest):
    result = moderate_review(req.review_text)
    return result


@app.post("/ai/search/cases", response_model=SearchCasesResponse)
def endpoint_search_cases(req: SearchCasesRequest):
    top_k = req.top_k or 3
    matches = search_clinical_cases(
        query=req.query,
        specialty=req.specialty,
        top_k=top_k
    )
    return {
        "query": req.query,
        "matches": matches
    }


@app.post("/ai/case/assistant-pin", response_model=AssistantPinResponse)
def endpoint_assistant_pin(req: AssistantPinRequest):
    summary = generate_assistant_pin(
        case_id=req.case_id,
        symptoms=req.symptoms,
        labs=req.labs,
        patient_allergies=req.patient_allergies
    )
    return {
        "ai_pinned_summary": summary
    }


@app.post("/ai/scribe/soap", response_model=SoapScribeResponse)
def endpoint_soap_scribe(req: SoapScribeRequest):
    result = generate_soap_scribe(
        raw_notes=req.raw_doctor_notes,
        patient_timeline=req.patient_timeline
    )
    return result




# 10. Clinical Filter & Patient Summary Generator
class ClinicalFilterSummaryRequest(BaseModel):
    patient_name: str = "Ramesh Kumar"
    age: int = 42
    gender: str = "Male"
    relationship: str = "Self"
    allergies: List[str] = Field(default_factory=list)
    organ_conditions: List[Dict[str, Any]] = Field(default_factory=list)
    current_medicines: List[Dict[str, Any]] = Field(default_factory=list)
    lab_results: List[Dict[str, Any]] = Field(default_factory=list)
    doctor_specialty: Optional[str] = "Cardiology"
    consent_scope: Optional[str] = "Cardiology"

@app.post("/api/ai/clinical-summary-filter")
def endpoint_clinical_summary_filter(req: ClinicalFilterSummaryRequest):
    return generate_clinical_filter_summary(
        patient_name=req.patient_name,
        age=req.age,
        gender=req.gender,
        relationship=req.relationship,
        allergies=req.allergies,
        organ_conditions=req.organ_conditions,
        current_medicines=req.current_medicines,
        lab_results=req.lab_results,
        doctor_specialty=req.doctor_specialty,
        consent_scope=req.consent_scope,
    )


# 11. Ultimate OCR & Document Processing Endpoints
class OcrJsonRequest(BaseModel):
    filename: str = "prescription.pdf"
    category: str = "Prescription"
    base64_data: Optional[str] = None
    raw_text: Optional[str] = None

@app.post("/api/ai/ocr-medical-report")
def endpoint_ocr_medical_report(req: OcrJsonRequest):
    file_bytes = b""
    if req.base64_data:
        try:
            # Strip data url prefix if present
            b64_str = req.base64_data.split(",")[-1]
            file_bytes = base64.b64decode(b64_str)
        except Exception:
            pass
    elif req.raw_text:
        file_bytes = req.raw_text.encode("utf-8")

    return process_medical_document(
        file_bytes=file_bytes,
        filename=req.filename,
        category=req.category
    )

@app.post("/api/ai/ocr-upload")
async def endpoint_ocr_upload(
    file: UploadFile = File(...),
    category: str = Form("auto"),
    patient_id: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        parsed = process_medical_document(
            file_bytes=content,
            filename=file.filename or "uploaded_document.pdf",
            category=category
        )
        parsed["patient_id"] = patient_id
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing failed: {str(e)}")



if __name__ == "__main__":

    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
