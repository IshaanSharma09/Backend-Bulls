# MedNexus | Rural-to-Metro Clinical OS & Healthcare Intelligence Network

> **Hackathon 2026 Submission** | Team: **Backend Bulls**  
> **Repository:** [https://github.com/IshaanSharma09/Backend-Bulls](https://github.com/IshaanSharma09/Backend-Bulls)  
> **Target Track:** Healthcare Infrastructure, Clinical Workflow Optimization & Responsible AI

---

## Executive Summary: What We Are Solving

India faces a severe rural-to-metro healthcare asymmetry:
- **80% of specialists practice in tier-1 cities**, leaving rural primary care clinics ("spokes") isolated.
- **OPD Queue Inefficiencies:** High no-show rates cause idle doctor time while emergency patients wait hours.
- **Catastrophic Out-of-Pocket Prescription Costs:** Lack of generic medicine transparency burdens families with costly branded drugs.
- **Clinical Burnout & Friction:** Doctors spend up to 40% of consultation time typing notes instead of patient care.
- **Privacy Risks in Case Sharing:** Rural doctors seeking second opinions frequently share unredacted patient photos and labs over unsecure messaging apps.

**MedNexus** is an integrated, distributed Clinical Operating System connecting rural spoke clinics to metro tertiary medical centers. It pairs patient-governed data access with AI-assisted clinical scribing, automated PHI sanitization, smart OPD queue optimization, and verified peer consultations.

---

## System Architecture

MedNexus is designed as a modular 3-tier architecture with clear separation of concerns:

```
                          +------------------------------------------+
                          |                 LAPTOP 1                 |
                          |          Next.js 14 Frontend             |
                          |             Port 3000 (UI)               |
                          +--------------------+---------------------+
                                               |
                                    REST / HTTP Client Layer
                                               |
                     +-------------------------+-------------------------+
                     |                                                   |
                     v                                                   v
   +------------------------------------+             +------------------------------------+
   |              LAPTOP 2              |             |              LAPTOP 3              |
   |        Core Backend (FastAPI)      |             |         AI Service (FastAPI)       |
   |              Port 8000             |             |              Port 8001             |
   |  - Dynamic 15-Min Access Codes     |             |  - Client & Server PHI Redaction   |
   |  - Smart Queue & Reallocation      |             |  - Ambient SOAP Scribing Engine    |
   |  - Versioned Digital Prescriptions |             |  - Jan Aushadhi Generic Drug Map   |
   |  - Verified NMC Peer MedBoard      |             |  - ICMR Clinical Guidelines RAG    |
   |  - SQLite Database (mednexus.db)   |             |  - Google Gemini AI Integration    |
   +------------------------------------+             +------------------------------------+
```

### Component Roles & Engineering Ownership

| Component | Machine Role | Core Technologies | Primary Focus |
| :--- | :--- | :--- | :--- |
| **Frontend** (`./frontend`) | Laptop 1 | Next.js 14, React 18, Tailwind CSS, TypeScript | Clinician OS, Patient Portal, Tele-Consult, MedBoard UI |
| **Core Backend** (`./backend`) | Laptop 2 | FastAPI, SQLite, Pydantic, Python 3.10+ | Auth, 15-Min Consent Codes, Queue Allocation, Case CRUD |
| **AI Intelligence** (`./ai-service`) | Laptop 3 | FastAPI, Google Gemini API, Regex & NER Engine | PHI De-identification, SOAP Note Scribe, Drug Substitution |

---

## Core Innovations & Features

### 1. Patient-Governed Zero-Knowledge Health Portal
- **Dynamic 15-Minute Access Codes:** Patients generate disposable 6-digit access codes (e.g., `#482910`). Doctors only view records during active consultations; long-term unauthorized access is prevented.
- **Direct Interactive Records:** Real-time editable allergy checklists, hereditary condition tags, active medications, and vaccination records.
- **Client-Side Document Viewer:** In-browser diagnostic report inspection with interactive previews, download actions, and hospital verification stamps.
- **Find Verified Doctors:** Specialty search with reactive sorting by consultation fee (low to high / high to low) and geographic proximity.

### 2. Clinician OS & Smart Queue Reallocation
- **Intelligent OPD Lounge Reallocation:** When booked patients cancel, the system detects empty appointment slots and promotes high-urgency waiting room patients, saving critical minutes.
- **Digital Prescriptions with Audit Trail:** Doctors generate clean digital prescriptions (medication name, dosage, frequency, and instructions). 
- **Versioned Clinical Revisions:** Prescriptions can be updated with mandatory clinical reasoning. Past revisions remain preserved in an immutable audit history with doctor timestamps.
- **Instant Patient Portal Sync:** Prescription updates reflect immediately in the patient's record under "Prescription History".

### 3. Automated PHI De-Identification (Under 20ms)
- **Opaque Redaction Pipeline:** Identifies Protected Health Information (Names, Aadhaar numbers, phone numbers, addresses, and physician identities) using dual pattern-matching rules and AI classification.
- **Diagnostic Parameter Preservation:** Redacts personal identifiers into non-recoverable opaque blocks while preserving clinical diagnostic metrics (e.g., Blood Sugar, HbA1c, Lipid profiles) for peer review.
- **Pre-Upload Patient Verification:** Side-by-side inspection ensures no sensitive data is published to shared registries without consent.

### 4. Ambient SOAP Scribing & Urgency Triage
- **Natural Shorthand to Structured Clinical Notes:** Converts rough doctor voice/text notes into formal Subjective, Objective, Assessment, and Plan (SOAP) records.
- **Urgency Scoring (0 to 100):** Evaluates patient vitals, ECG abnormalities, and red-flag symptoms to recommend triage level and immediate bedside protocol.

### 5. Jan Aushadhi Generic Drug Substitution Engine
- **Affordable Healthcare Delivery:** Maps expensive branded medications to Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBI) government generics.
- **Up to 85% Cost Reduction:** Shows price comparisons (e.g., branded Ticagrelor at INR 48.50 vs. PMBI generic at INR 9.20).
- **Allergy Contraindication Alerting:** Flags severe drug interactions (e.g., NSAID intolerance contraindications) before prescription finalization.

### 6. MedBoard & Hospital Workplace Culture
- **Cross-Hospital Second Opinions:** Rural doctors post complex cases to verified specialists across India.
- **NMC Verification & Weighted Consensus:** Senior specialists vote on primary diagnoses with weighted reputation scores.
- **Protected Anonymous Reviews:** Hospital workplace transparency using k-anonymity (k=5 threshold) and automated anti-defamation moderation.

---

## 3-Minute Hackathon Judging Tour

Follow this walkthrough to experience the end-to-end MedNexus workflow:

```
[ Step 1: Patient Portal ]  -->  [ Step 2: Clinician OS ]  -->  [ Step 3: AI Scribing & PHI ]  -->  [ Step 4: MedBoard ]
  - Generate 6-digit code         - Load patient via code         - Run instant PHI scrubbing         - Review consensus
  - Browse verified doctors       - Create/edit prescription      - Check generic drug savings        - Test k-anonymity
```

### Step 1: Patient Portal & Security (`http://localhost:3000/patient`)
1. Open the **Patient Portal**. Notice the active **15-Minute One-Time Visit Code**. Click **Regenerate Code** to see dynamic invalidation of expired access.
2. Click **Find Doctor** tab: Search by symptom (e.g., `chest pain` or `asthma`) and toggle **Sort by Price** or **Sort by Location**.
3. Under **Diagnostic Documents**, click **View Document** on an uploaded lab report to inspect the sanitized records and hospital pathology verification.

### Step 2: Clinician OS & Digital Prescriptions (`http://localhost:3000/hospital`)
1. Enter the patient's 6-digit code to securely load their active health profile.
2. Under **Active Digital Prescriptions**, click **+ Add Prescription** to prescribe medication.
3. Click the **Edit (pen)** control on any existing prescription. Modify the dosage, enter a clinical reason (e.g., "Patient tolerating well, stepping down dosage"), and save.
4. Click **View Past Versions & Audit History** to verify the timestamped change log.
5. Switch back to `/patient` to see the updated prescription in the patient's **Prescription History**.

### Step 3: Smart Queue & AI Intelligence (`http://localhost:3000/tele-consult`)
1. View the **B2B Tele-Consult Dynamic Queue**.
2. Click **Simulate Patient Cancellation**: An empty OPD slot is identified, and an urgent spoke patient waiting in the lounge is reallocated.
3. Test **PHI De-Identification**: Run raw clinical text through the sanitizer to observe instant anonymization before case publishing.

### Step 4: MedBoard & Workplace Transparency (`http://localhost:3000/medboard`)
1. Explore open clinical cases posted from rural spoke centers.
2. Inspect peer doctor consensus diagnostics, weighted voting, and pinned ICMR guidance.
3. Visit `/hospital-culture` to view institutional metrics protected by k-anonymity (reviews remain locked until at least 5 verified submissions exist).

---

## Tech Stack & Specifications

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend:** FastAPI, Python 3.10+, Uvicorn, SQLite, Pydantic v2
- **AI & NLP:** Google Gemini 1.5 Pro/Flash, Regular Expression Rule Engines, Fast Pattern Matchers
- **Security & Privacy:** SHA-256 Doctor Registration Hashing, 15-Minute Ephemeral Access Tokens, Opaque Client-Side PHI Redaction, k-Anonymity (k=5)

---

## Quick Start (Local Setup)

### 1. Core Backend (Laptop 2)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API documentation available at `http://localhost:8000/docs`*

### 2. AI Intelligence Engine (Laptop 3)
```bash
cd ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
# Configure GEMINI_API_KEY in .env
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
*AI service documentation available at `http://localhost:8001/docs`*

### 3. Frontend Web Application (Laptop 1)
```bash
cd frontend
npm install
npm run build
npm run start
# Application is live at http://localhost:3000
```

---

## Hackathon Team: Backend Bulls

- **Ishaan Sharma** (`@IshaanSharma09`): Lead Frontend Architect, Patient Portal, Clinician OS & UI/UX
- **Yash Sharma** (`@yashsharma1388`): Core Backend Architect, NMC Auth, Dynamic Queue & Database
- **AI Intelligence Team**: PHI Redaction Engine, Ambient Scribe & Jan Aushadhi Intelligence

---

*MedNexus adheres to ethical healthcare AI principles: all automated insights serve as clinical decision support for certified medical practitioners, never autonomous medical diagnosis.*
