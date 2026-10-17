# MedNexus AI Engine (Laptop 3)

> **Rural-to-Metro Clinical OS & Verified Pseudonymous Doctor Network**  
> **Role:** Laptop 3 — AI Engine & Clinical Intelligence Microservice  
> **Port:** `8001` (`http://localhost:8001` or `http://<LAPTOP_3_IP>:8001`)  
> **CORS:** Enabled (`*`) for direct cross-origin browser and microservice communication  
> **Contributor:** Raghav (AI Service & Clinical Engineering)

---

## 🚀 Overview

The MedNexus AI Engine provides high-speed clinical de-identification, content moderation, protocol similarity search, and automated clinical documentation designed specifically for Indian rural-to-metro tele-consultation workflows.

### Core Capabilities
1. **Full AI Health Report Generator (`POST /ai/generate-patient-report`)**: Synthesizes demographics, symptoms, ECG findings, and lab tests into a compassionate plain-language summary, critical allergy contraindications, vitals interpretation, and actionable AI care directives.
2. **Medication Dosage & Schedule Parser (`POST /ai/parse-medication-schedule`)**: Parses unstructured prescription text into structured daily dosing regimens (exact dose, timing, duration, remaining countdown) mapped to *Jan Aushadhi* generic equivalents.
3. **Symptom-To-Doctor Recommendation Engine (`POST /ai/match-doctor`)**: Routes patient symptoms to appropriate specialties (Cardiology, Neurology, Internal Medicine) with match confidence percentage (e.g. 0.98), urgency, and key questions for the physician.
4. **Mandatory Text PHI Scrubber (`POST /ai/sanitize/text`)**: Pre-flight de-identification of Aadhaar numbers, patient names, attending doctors, and clinic headers using regex combined with structured LLM entity extraction.
5. **Medical Image Header Masker (`POST /ai/sanitize/image`)**: Detaches identifying patient and hospital header metadata from ECG and diagnostic X-rays.
6. **Hospital Review Defamation Moderator (`POST /ai/moderate/review`)**: Protects anonymous hospital culture scorecards by allowing institutional workplace critiques while blocking personal defamation targeting named physicians.
7. **Semantic Case Search & Guidelines RAG (`POST /ai/search/cases`)**: Matches real-time rural cases against 15 curated Indian clinical benchmarks (STEMI, Organophosphate poisoning, Cerebral Malaria, Snakebite, Pediatric Dengue).
8. **MedBoard Pinned AI Assistant & Jan Aushadhi Engine (`POST /ai/case/assistant-pin`)**: Delivers immediate first-aid guidance, allergy alerts, and maps branded medications to *Pradhan Mantri Bhartiya Janaushadhi Pariyojana* (PMBI) generics, slashing drug costs by 80%+.
9. **Clinical SOAP Scribe & Urgency Gauge (`POST /ai/scribe/soap`)**: Converts rough doctor notes and longitudinal patient timelines into structured SOAP format, flags drug-allergy contraindications, and computes real-time urgency (1–100).

---

## 🛠️ Tech Stack & Setup

- **Language:** Python 3.10+ (Recommended: Python 3.12)
- **Framework:** FastAPI + Uvicorn
- **AI / LLM:** Google Gemini API (`google-genai` / `google-generativeai`) with intelligent deterministic clinical fallback
- **Computer Vision:** Pillow
- **Validation:** Pydantic v2

### Quickstart

1. **Activate Virtual Environment:**
   ```bash
   cd ai-service
   # Windows:
   .venv\Scripts\activate
   # Linux/Mac:
   source .venv/bin/activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY (optional - offline fallback included)
   ```

4. **Run the AI Service:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

5. **Run Integration Tests:**
   ```bash
   python test_ai_service.py
   ```

---

## 📡 API Contract Reference

| Endpoint | Method | Input Summary | Output Summary |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Service liveness & capability list |
| `/ai/generate-patient-report` | `POST` | Patient ID, symptoms, ECG, allergies, tests | Plain-English summary, allergy warning, vitals, directives |
| `/ai/parse-medication-schedule` | `POST` | Raw prescription string | Structured dose, frequency, timing, duration, Jan Aushadhi generic |
| `/ai/match-doctor` | `POST` | Free-text symptom query | Primary specialty (e.g. Cardiology), confidence (0.98), triage questions |
| `/ai/sanitize/text` | `POST` | `{"raw_text": "..."}` | Anonymized text, redaction list, `phi_risk_score: 0.0` |
| `/ai/sanitize/image` | `POST` | Multipart file or base64 | Sanitized image URL, masked header flag |
| `/ai/moderate/review` | `POST` | `{"review_text": "..."}` | `is_allowed`, verdict, violation flags |
| `/ai/search/cases` | `POST` | `{"query": "...", "top_k": 3}` | Matched protocols, similarity scores (0.91, 0.84) |
| `/ai/case/assistant-pin`| `POST` | Symptoms, labs, allergies | Protocol benchmark, first-aid, Jan Aushadhi savings |
| `/ai/scribe/soap` | `POST` | Rough notes + patient timeline | Structured SOAP, Urgency Score (1-100), allergy flags |

---

## 👥 Contributors

- **Raghav** — Contributor: AI Engine Architecture, Clinical Data Pipelines, and Zero-Conflict Contract Implementation.
