# MedNexus B2B: Hackathon Implementation Plan & Zero-Conflict Architecture

**Project:** MedNexus B2B — Rural-to-Metro Clinical OS & Verified Pseudonymous Doctor Network  
**Target File:** `HACKATHON_PLAN.md`  
**Execution Model:** 3 Laptops, Independent Folders, Zero Git Merge Conflicts, Local Wi-Fi Integration

---

## 1. Architecture & Zero-Conflict Rules

```
                      +---------------------------------------+
                      |               LAPTOP 1                |
                      |         Frontend (Next.js 14)         |
                      |           Port 3000 (UI)              |
                      +-------------------+-------------------+
                                          |
                        Browser Direct HTTP / REST (CORS: *)
                                          |
                 +------------------------+------------------------+
                 |                                                 |
                 v                                                 v
+---------------------------------+               +---------------------------------+
|            LAPTOP 2             |               |            LAPTOP 3             |
|       Core Backend (FastAPI)    |               |        AI Engine (FastAPI)      |
|           Port 8000             |               |           Port 8001             |
|   - NMC Hash Verification       |               |   - Text & Image PHI Scrubber   |
|   - Pseudonym Auth & Badges     |               |   - Defamation & Toxicity Check |
|   - Case CRUD & MedBoard        |               |   - Semantic Case Search & RAG  |
|   - Weighted Consensus Engine   |               |   - SOAP Scribe & Urgency Score |
|   - Hospital k-Anonymity (k=5)  |               |   - Jan Aushadhi Generic Map    |
|   - SQLite (mednexus.db)        |               |   - Google Gemini API           |
+---------------------------------+               +---------------------------------+
```

### The 5 Ironclad Zero-Conflict Rules
1. **Isolated Workspace Folders**:
   - Laptop 1 touches **ONLY** `./frontend/`
   - Laptop 2 touches **ONLY** `./backend/`
   - Laptop 3 touches **ONLY** `./ai-service/`
   - No laptop ever modifies another folder. No cross-folder imports.
2. **Direct Browser-to-Service Topology**:
   - The Next.js frontend calls Laptop 2 (`:8000`) and Laptop 3 (`:8001`) directly via `fetch()` / `axios`.
   - Backend (`:8000`) and AI Engine (`:8001`) run with `CORSMiddleware` configured with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`.
3. **Deterministic Mock Data Fallback (Crash-Proof Demo)**:
   - Every frontend API client wrapper (`src/lib/api.ts`) contains an automated `try...catch` fallback.
   - If the network request fails, times out (>2.5s), or returns 5xx/404, it immediately resolves with deterministic pre-baked mock data and toggles a subtle UI indicator badge (`Demo Offline Mode`). **The demo never crashes on stage.**
4. **Frozen API Contract**:
   - URL paths, JSON key names, query parameter names, and HTTP status codes defined in Section 2 are frozen as of Minute 0. Neither backend nor AI service may rename keys without agreement.
5. **Configurable Base URLs via Single Environment File**:
   - Laptop 1 configures remote targets in `.env.local`:
     ```env
     NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
     NEXT_PUBLIC_AI_URL=http://localhost:8001
     ```
   - At Wi-Fi integration time, simply swap `localhost` for the laptops' Wi-Fi hotspot IP addresses.

---

## 2. Shared JSON API Contract (The Single Source of Truth)

### Part A: Core Backend Services (`Laptop 2` — `http://<LAPTOP_2_IP>:8000`)

#### 1. Authentication & NMC Doctor Verification
- **`POST /api/auth/verify-nmc`**
  - **Purpose:** Verifies doctor registration number, generates SHA-256 one-way hash, returns pseudonym and weighted badge.
  - **Request Body:**
    ```json
    {
      "doctor_name": "Dr. Rajesh Sharma",
      "nmc_reg_no": "NMC-MH-2016-08472",
      "state_council": "Maharashtra Medical Council",
      "year_of_reg": 2016,
      "specialty": "Cardiology",
      "degree": "DM Cardiology",
      "years_experience": 8
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "token": "eyJhGciOiJIUzI1NiIsIn...",
      "doctor_id": "doc_u8f93a12",
      "pseudonym": "Dr_Pulse_9482",
      "badge": "Verified Cardiologist, 8 yrs",
      "vote_weight": 5,
      "specialty": "Cardiology",
      "reputation_score": 120
    }
    ```
- **`GET /api/auth/me`**
  - **Headers:** `Authorization: Bearer <token>`
  - **Response (`200 OK`):**
    ```json
    {
      "doctor_id": "doc_u8f93a12",
      "pseudonym": "Dr_Pulse_9482",
      "badge": "Verified Cardiologist, 8 yrs",
      "vote_weight": 5,
      "specialty": "Cardiology",
      "reputation_score": 120
    }
    ```

#### 2. MedBoard Structured Clinical Cases
- **`GET /api/cases`**
  - **Query Parameters:** `specialty` (optional, string), `status` ("open" | "resolved", optional), `sort` ("urgent" | "bounty" | "recent")
  - **Response (`200 OK`):**
    ```json
    {
      "cases": [
        {
          "case_id": "case_cardio_101",
          "title": "34M Post-Harvest Acute Chest Pain with ST Elevation (Rural Bihar)",
          "specialty_tag": "c/CardioEmergency",
          "author_pseudonym": "Dr_Kosi_Care",
          "author_badge": "Verified Spoke Physician, 4 yrs",
          "patient_age": 34,
          "patient_gender": "Male",
          "urgency_score": 92,
          "bounty_amount": 350,
          "status": "open",
          "consensus_score": 75,
          "comments_count": 4,
          "has_ai_pin": true,
          "created_at": "2026-10-17T14:30:00Z"
        }
      ]
    }
    ```
- **`POST /api/cases`**
  - **Purpose:** Post sanitized case.
  - **Request Body:**
    ```json
    {
      "title": "34M Post-Harvest Acute Chest Pain with ST Elevation",
      "specialty_tag": "c/CardioEmergency",
      "patient_demographics": {
        "age": 34,
        "gender": "Male"
      },
      "chief_complaint": "Severe retrosternal crushing chest pain radiating to left jaw for 2 hours",
      "vitals": {
        "bp": "90/60 mmHg",
        "pulse": 118,
        "spo2": 91,
        "temp": 98.4
      },
      "history": "Farmer, heavy lifting during paddy harvest. No prior known cardiac history. Smoker.",
      "labs_and_ecg": "ECG shows 3mm ST elevation in leads V2-V5. Troponin T rapid positive.",
      "imaging_urls": ["/uploads/cases/ecg_anonymized_01.jpg"],
      "bounty_amount": 350,
      "urgency_score": 92,
      "second_opinion_tags": ["Cardiology", "Emergency Medicine"]
    }
    ```
  - **Response (`201 Created`):**
    ```json
    {
      "case_id": "case_cardio_101",
      "status": "published",
      "created_at": "2026-10-17T15:10:00Z"
    }
    ```
- **`GET /api/cases/{case_id}`**
  - **Response (`200 OK`):**
    ```json
    {
      "case_id": "case_cardio_101",
      "title": "34M Post-Harvest Acute Chest Pain with ST Elevation",
      "specialty_tag": "c/CardioEmergency",
      "author_pseudonym": "Dr_Kosi_Care",
      "author_badge": "Verified Spoke Physician, 4 yrs",
      "patient_demographics": { "age": 34, "gender": "Male" },
      "chief_complaint": "Severe retrosternal crushing chest pain",
      "vitals": { "bp": "90/60 mmHg", "pulse": 118, "spo2": 91, "temp": 98.4 },
      "history": "Farmer, heavy lifting during paddy harvest.",
      "labs_and_ecg": "ST elevation leads V2-V5. Troponin T positive.",
      "imaging_urls": ["/uploads/cases/ecg_anonymized_01.jpg"],
      "bounty_amount": 350,
      "urgency_score": 92,
      "consensus_status": "in_progress",
      "consensus_percentage": 75,
      "leading_diagnosis": "Acute Anterior STEMI with Cardiogenic Shock Risk",
      "comments": [
        {
          "comment_id": "comm_882",
          "author_pseudonym": "Dr_Pulse_9482",
          "author_badge": "Verified Cardiologist, 8 yrs",
          "vote_weight": 5,
          "content": "Immediate loading dose: Aspirin 325mg + Clopidogrel 300mg + Atorvastatin 80mg. Administer Tenecteplase if PCI transfer > 120 mins.",
          "suggested_diagnosis": "Acute Anterior STEMI",
          "upvotes": 12,
          "created_at": "2026-10-17T14:45:00Z"
        }
      ]
    }
    ```
- **`POST /api/cases/{case_id}/comments`**
  - **Request Body:**
    ```json
    {
      "content": "Concur with thrombolysis protocol. Start IV fluids cautiously due to borderline BP 90/60.",
      "suggested_diagnosis": "Acute Anterior STEMI",
      "is_second_opinion": true
    }
    ```
  - **Response (`201 Created`):**
    ```json
    {
      "comment_id": "comm_883",
      "author_pseudonym": "Dr_NeuroMetro",
      "author_badge": "Verified Intensivist, 10 yrs",
      "vote_weight": 5,
      "new_consensus_percentage": 85,
      "consensus_reached": true
    }
    ```
- **`POST /api/cases/{case_id}/claim-bounty`**
  - **Purpose:** Claims the ₹350 bounty once verified consensus is achieved.
  - **Response (`200 OK`):**
    ```json
    {
      "status": "bounty_claimed",
      "amount": 350,
      "credited_to_pseudonym": "Dr_Pulse_9482",
      "hospital_escrow_settled": true
    }
    ```

#### 3. Anonymous Hospital Culture & Reviews (k-Anonymity)
- **`GET /api/hospitals`**
  - **Response (`200 OK`):**
    ```json
    {
      "hospitals": [
        {
          "hospital_id": "hosp_metro_apex",
          "name": "Apex Metro Super Specialty Hospital",
          "city": "Mumbai",
          "state": "Maharashtra",
          "review_count": 6,
          "is_unlocked": true,
          "scores": {
            "workload": 2.4,
            "safety": 4.5,
            "bullying_free": 3.8,
            "pay_fairness": 4.1,
            "equipment": 4.8,
            "overall_culture": 3.9
          }
        },
        {
          "hospital_id": "hosp_district_purnia",
          "name": "Purnia Regional Medical Center",
          "city": "Purnia",
          "state": "Bihar",
          "review_count": 4,
          "is_unlocked": false,
          "reviews_needed_to_unlock": 1,
          "scores": null
        }
      ]
    }
    ```
- **`POST /api/hospitals/{hospital_id}/reviews`**
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:**
    ```json
    {
      "department": "Cardiology",
      "workload_rating": 2,
      "safety_rating": 4,
      "bullying_free_rating": 4,
      "pay_fairness_rating": 4,
      "equipment_rating": 5,
      "review_text": "Equipment is top notch with 2 cath labs. However 36-hour weekend duties for junior residents are common without resting rooms."
    }
    ```
  - **Response (`201 Created`):**
    ```json
    {
      "status": "success",
      "message": "Review recorded anonymously. Identity detached.",
      "total_hospital_reviews": 5,
      "is_now_unlocked": true
    }
    ```

#### 4. B2B Tele-Consult Ledger & Smart Dynamic Queue
- **`GET /api/b2b/queue`**
  - **Query:** `hub_hospital_id=hosp_metro_apex`
  - **Response (`200 OK`):**
    ```json
    {
      "queue": [
        {
          "slot_id": "slot_01",
          "time": "15:30",
          "patient_masked": "P**** K**** (34M)",
          "spoke_origin": "Kosi Rural Health Spoke",
          "urgency_score": 92,
          "status": "confirmed",
          "fee_split": { "patient_paid": 500, "spoke_share": 150, "hub_fee": 350 }
        },
        {
          "slot_id": "slot_02",
          "time": "15:45",
          "patient_masked": "A**** D**** (52F)",
          "spoke_origin": "Purnia Clinic Spoke",
          "urgency_score": 58,
          "status": "booked",
          "fee_split": { "patient_paid": 500, "spoke_share": 150, "hub_fee": 350 }
        }
      ]
    }
    ```
- **`POST /api/b2b/simulate-cancellation`**
  - **Purpose:** Key hackathon demo action. Cancels standard appointment and instantly auto-promotes the highest-urgency rural B2B case.
  - **Request Body:** `{ "slot_id": "slot_02" }`
  - **Response (`200 OK`):**
    ```json
    {
      "cancelled_slot": "slot_02",
      "event": "INSTANT_GAP_DETECTED",
      "promoted_patient": {
        "b2b_ticket_id": "tkt_rural_urgent_902",
        "patient_masked": "M**** S**** (45M)",
        "spoke_hospital": "Araria Spoke Clinic",
        "diagnosis": "Suspected Intracranial Bleed / Hypertensive Encephalopathy",
        "urgency_score": 96,
        "wait_time_minutes": 14,
        "reallocated_time_slot": "15:45",
        "time_saved_minutes": 45
      }
    }
    ```

---

### Part B: AI Engine Services (`Laptop 3` — `http://<LAPTOP_3_IP>:8001`)

#### 1. Mandatory PHI De-Identification & Image Sanitizer
- **`POST /ai/sanitize/text`**
  - **Purpose:** Pre-flight de-identification of medical cases before they are posted to MedBoard or shared with specialists.
  - **Request Body:**
    ```json
    {
      "raw_text": "Patient Ramesh Kumar, 34M, admitted to Kosi Mission Hospital on 12th Oct 2026 under Dr. V.P. Roy. Aadhaar: 3829-1928-1920. Patient complains of crushing chest pain for 2 hours. Troponin T positive."
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "sanitized_text": "Patient [PATIENT_MALE_34], admitted to [SPOKE_FACILITY_A] on [DATE_OCT_2026] under [ATTENDING_PHYSICIAN]. Aadhaar: [REDACTED_AADHAAR]. Patient complains of crushing chest pain for 2 hours. Troponin T positive.",
      "redactions": [
        { "type": "PATIENT_NAME", "original": "Ramesh Kumar", "replacement": "[PATIENT_MALE_34]" },
        { "type": "HOSPITAL_NAME", "original": "Kosi Mission Hospital", "replacement": "[SPOKE_FACILITY_A]" },
        { "type": "DOCTOR_NAME", "original": "Dr. V.P. Roy", "replacement": "[ATTENDING_PHYSICIAN]" },
        { "type": "GOVT_ID", "original": "3829-1928-1920", "replacement": "[REDACTED_AADHAAR]" }
      ],
      "phi_risk_score": 0.0,
      "is_safe_to_publish": true
    }
    ```

#### 2. Review Defamation & Toxicity Filter
- **`POST /ai/moderate/review`**
  - **Purpose:** Protects anonymous culture boards by permitting institutional critiques while strictly rejecting targeted personal defamation.
  - **Request Body:**
    ```json
    {
      "review_text": "Dr. Suresh Verma in Ortho is an incompetent thief who steals surgical kits."
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "is_allowed": false,
      "moderation_verdict": "REJECTED_DEFAMATION",
      "flags": ["PERSONAL_NAME_TARGETING", "UNSUBSTANTIATED_CRIMINAL_ACCUSATION"],
      "explanation": "Reviews must focus on departmental culture, hours, safety, and equipment. Personal targeting of named individuals is blocked.",
      "cleaned_suggestion": null
    }
    ```

#### 3. Semantic Case Search & Guidelines RAG
- **`POST /ai/search/cases`**
  - **Request Body:**
    ```json
    {
      "query": "34 year old male farmer with acute chest pain ST elevation in V2 V5 troponin positive",
      "specialty": "Cardiology",
      "top_k": 3
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "query": "34 year old male farmer with acute chest pain ST elevation in V2 V5",
      "matches": [
        {
          "match_id": "hist_case_09",
          "title": "Anterior Wall MI in Young Agricultural Worker Post-Organophosphate Exposure",
          "similarity_score": 0.91,
          "outcome": "Successful pharmacoinvasive strategy with Tenecteplase followed by delayed PCI at 18 hours. Complete recovery.",
          "protocol_reference": "ICMR Guidelines on Acute Coronary Syndromes in Rural Settings"
        },
        {
          "match_id": "hist_case_44",
          "title": "Hyperacute STEMI mimicking Myocarditis in 30yo",
          "similarity_score": 0.84,
          "outcome": "Primary angioplasty with drug-eluting stent to LAD.",
          "protocol_reference": "Cardiological Society of India (CSI) STEMI Protocol"
        }
      ]
    }
    ```

#### 4. MedBoard Pinned AI Assistant & Jan Aushadhi Generic Engine
- **`POST /ai/case/assistant-pin`**
  - **Request Body:**
    ```json
    {
      "case_id": "case_cardio_101",
      "symptoms": "Retrosternal crushing chest pain 2 hrs, BP 90/60, Pulse 118, SpO2 91%",
      "labs": "ST elevation V2-V5, Troponin T positive",
      "patient_allergies": ["NSAID intolerance"]
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "ai_pinned_summary": {
        "match_percentage": 91,
        "matched_benchmark": "ICMR Rural STEMI Protocol #4",
        "immediate_first_aid": [
          "Maintain semi-recumbent posture with supplemental oxygen to keep SpO2 > 90%",
          "Dual Antiplatelet Therapy (DAPT) loading: Aspirin 300mg chewable + Clopidogrel 300mg",
          "Stat high-intensity Statin (Atorvastatin 80mg)",
          "Avoid Nitrates due to borderline SBP (90 mmHg)",
          "ALERT: Patient has NSAID intolerance — avoid Diclofenac/Ibuprofen for pain relief; use Morphine 2-4mg IV cautiously"
        ],
        "jan_aushadhi_savings": [
          {
            "branded_drug": "Brilinta (Ticagrelor 90mg)",
            "branded_mrp_inr": 48.50,
            "jan_aushadhi_generic": "Generic Ticagrelor 90mg (PMBI)",
            "jan_aushadhi_inr": 9.20,
            "cost_reduction": "81% OFF"
          },
          {
            "branded_drug": "Lipitor (Atorvastatin 40mg)",
            "branded_mrp_inr": 28.00,
            "jan_aushadhi_generic": "Generic Atorvastatin 40mg (PMBI)",
            "jan_aushadhi_inr": 4.50,
            "cost_reduction": "84% OFF"
          }
        ]
      }
    }
    ```

#### 5. Clinical SOAP Scribe & Urgency Scorer
- **`POST /ai/scribe/soap`**
  - **Request Body:**
    ```json
    {
      "raw_doctor_notes": "pt 34m came clutching chest sweating profusely bp 90/60 p 118 spo2 91 st elevates v2 to v5 trop t pos allergic to brufen says chest feels crushed like elephant sitting on it since 1pm",
      "patient_timeline": [
        "15 Jan 2026: Acute Viral Gastroenteritis treated with ORS and Cipro",
        "02 Aug 2025: Bronchospasm attack after taking Ibuprofen (Severe NSAID intolerance documented)"
      ]
    }
    ```
  - **Response (`200 OK`):**
    ```json
    {
      "soap_note": {
        "subjective": "34-year-old male presents with acute severe retrosternal crushing chest pain ('elephant sitting on chest') of 2 hours duration, associated with diaphoresis and dyspnea. Known history of severe NSAID intolerance (bronchospasm).",
        "objective": "Vitals: BP 90/60 mmHg (borderline hypotensive), Pulse 118 bpm (sinus tachycardia), SpO2 91% on room air. Labs/ECG: 3mm ST-segment elevation in precordial leads V2-V5; Troponin T rapid test positive.",
        "assessment": "Acute Extensive Anterior Wall ST-Elevation Myocardial Infarction (STEMI) complicated by impending cardiogenic shock. High mortality risk without emergent reperfusion.",
        "plan": "1. Immediate DAPT (Aspirin 300mg + Clopidogrel 300mg chewable). 2. Atorvastatin 80mg. 3. Supplemental O2. 4. Strict contraindication: NO NSAIDs. 5. If PCI transfer >120 min, proceed with weight-adjusted Tenecteplase thrombolysis under continuous cardiac monitoring."
      },
      "urgency_score": 94,
      "urgency_tier": "CRITICAL_EMERGENCY",
      "contraindication_flag": "CRITICAL WARNING: NSAIDs contraindicated due to prior documented anaphylactoid bronchospasm."
    }
    ```

---

## 3. Laptop 1 Checklist (`./frontend` Tasks)

**Stack:** Next.js 14 (App Router), Tailwind CSS, Lucide React, Axios, Framer Motion.  
**Port:** `3000` (`http://localhost:3000`)

### Directory Structure to Create
```
frontend/
├── .env.local
├── package.json
├── tailwind.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Header with Doctor Badge, Switch Personas & Hotspot status
│   │   ├── page.tsx                       # Hero + Flow Navigator (Portal Landing)
│   │   ├── ehr-vault/page.tsx             # Module 1: Patient Longitudinal Timeline + Contraindications
│   │   ├── tele-consult/page.tsx          # Module 2: AI SOAP Scribe + B2B Fee Split (₹500 -> ₹150 + ₹350)
│   │   ├── scheduler/page.tsx             # Module 3: OPD Dynamic Queue + "Simulate No-Show" promotion demo
│   │   ├── medboard/page.tsx              # Module 4: Reddit for Doctors feed with specialty filters
│   │   ├── medboard/new-case/page.tsx     # Case Poster with Mandatory Pre-Flight AI PHI Scrubber
│   │   ├── medboard/[case_id]/page.tsx    # Case Detail: Pinned AI RAG Card + Credential-Weighted Voting
│   │   └── hospital-culture/page.tsx      # Module 5: Anonymous k-Anonymity Scorecard & Defamation Mod
│   ├── components/
│   │   ├── Navbar.tsx                     # Shows verified badge: "Dr_Pulse_9482 (Cardiologist, 8y - 5x Weight)"
│   │   ├── PhiRedactionViewer.tsx         # Side-by-side diff: original text with strikethroughs vs redacted text
│   │   ├── ConsensusBar.tsx               # Animated progress bar that turns green at 80% consensus
│   │   ├── JanAushadhiCard.tsx            # Branded vs Generic 80% price comparison table
│   │   ├── UrgentQueueCard.tsx            # Animated slot allocation with visual pulse on high urgency
│   │   └── PersonaSwitcher.tsx            # Switch between: Rural Spoke Doctor vs Metro Cardiologist
│   ├── lib/
│   │   ├── api.ts                         # Robust fetch client with auto-mock fallback on timeout
│   │   └── config.ts                      # Reads NEXT_PUBLIC_BACKEND_URL & NEXT_PUBLIC_AI_URL
│   └── mock/
│       ├── cases.json                     # Fallback mock cases with pre-baked AI pins
│       ├── hospitals.json                 # Fallback mock hospitals (locked vs unlocked)
│       └── queue.json                     # Fallback mock queue
```

### Action Items
- [ ] **Task 1.1: Setup Project & Tailwind Styling**:
  - Initialize Next.js project with Tailwind.
  - Setup medical dark/light slate color theme (`slate-900`, `emerald-500`, `rose-500`, `sky-500`, `amber-500`).
- [ ] **Task 1.2: Build Fail-Safe API Client (`src/lib/api.ts`)**:
  - Implement wrappers for all endpoints defined in Section 2.
  - Wrap every call in `try { ... } catch (err) { return fallbackMockData; }` with a 2.5-second timeout so the UI never stalls or shows an error screen if Laptop 2 or 3 is offline.
- [ ] **Task 1.3: Build Patient Health Vault (Timeline Module)**:
  - Visual vertical timeline with icons (past fevers, tetanus toxoids, drug allergies).
  - Prominent red alert banner: `Warning: Documented NSAID Intolerance`.
- [ ] **Task 1.4: Build Tele-Consult SOAP Scribe & Fee Split UI**:
  - Left pane: Raw symptom input + "Run AI Scribe" button.
  - Right pane: Formatted SOAP note card + Urgency Gauge (1–100) + B2B financial split pill:
    `Patient Pays: ₹500 | Rural Clinic Retains: ₹150 | Metro Super-Specialist Bounty: ₹350`.
- [ ] **Task 1.5: Build Smart Scheduler with "Simulate No-Show" Demo Button**:
  - Render specialist's daily OPD slot table.
  - Add prominent red button: **`[⚡ Simulate Patient No-Show / Cancellation]`**.
  - Clicking this triggers `POST /api/b2b/simulate-cancellation` (or mock fallback), immediately frees Slot #2 (`15:45`), and renders an animated green banner promoting the rural emergency patient with high AI Urgency score (96) into the slot.
- [ ] **Task 1.6: Build MedBoard ("Reddit for Doctors") Feed & Pinned AI Card**:
  - Specialty channels: `c/CardioEmergency`, `c/Neurology`, `c/Pediatrics`, `c/GeneralMedicine`.
  - Case Cards displaying urgency badges, upvotes, and `₹350 Bounty` tags.
  - Case Detail Page with:
    - **Pinned AI Assistant Box** at the very top: Similarity Match (91%), Immediate First-Aid stabilization steps, and *Jan Aushadhi Generic Alternatives* card slashes drug prices by 80%.
    - **Discussion Thread**: Specialist responses displaying badges (e.g. `DM Cardiologist, 5x Weight`).
    - **Interactive Vote Button**: Increases consensus meter. At 80%, displays celebratory banner: `Consensus Finalized! ₹350 Bounty Awarded to Metro Specialist`.
- [ ] **Task 1.7: Build Pre-Flight AI PHI Scrubber Modal**:
  - In `medboard/new-case`, doctor enters draft text or uploads ECG image.
  - Clicking "Submit Case" first opens a modal that calls Laptop 3's `/ai/sanitize/text`.
  - Shows visual redactions in real time before sending the final sanitized payload to Laptop 2.
- [ ] **Task 1.8: Build Anonymous Hospital Culture Scorecard (k-Anonymity)**:
  - Display list of hospitals.
  - Hospital with 6 reviews displays full radar/star ratings (Workload 2.4/5, Safety 4.5/5, Pay 4.1/5).
  - Hospital with 4 reviews displays a locked padlock: `Protected by k-Anonymity (k=5). Need 1 more verified review to reveal score`.
  - Review form with live AI defamation warning if a doctor's personal name is typed.

---

## 4. Laptop 2 Checklist (`./backend` Tasks + Seed Data)

**Stack:** Python 3.10+, FastAPI, SQLite, SQLAlchemy / SQLModel, Pydantic v2, Uvicorn.  
**Port:** `8000` (`http://localhost:8000`)

### Directory Structure to Create
```
backend/
├── main.py                    # FastAPI entrypoint, CORS configuration
├── database.py                # SQLite engine & session setup (mednexus.db)
├── models.py                  # SQLAlchemy ORM models
├── schemas.py                 # Pydantic request/response schemas (matches Section 2)
├── seed.py                    # Pre-seeds demo doctors, cases, hospitals, and queue
├── requirements.txt           # fastapi, uvicorn, pydantic, sqlalchemy
└── routers/
    ├── auth.py                # NMC verification hash, badge generator, token
    ├── cases.py               # MedBoard cases, comments, consensus calculator
    ├── hospitals.py           # Reviews, k-anonymity gatekeeper (k=5)
    └── b2b.py                 # Tele-consult ledger, queue & no-show simulation
```

### Action Items
- [ ] **Task 2.1: FastAPI Setup & Universal CORS**:
  - Initialize FastAPI app.
  - Apply `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`.
- [ ] **Task 2.2: Database Models & SQLite Engine (`models.py`)**:
  - `Doctor`: id, nmc_hash (SHA-256), pseudonym, specialty, degree, years_experience, vote_weight, reputation.
  - `Case`: id, title, specialty_tag, author_pseudonym, author_badge, age, gender, vitals_json, labs, urgency_score, bounty_amount, status, consensus_score.
  - `Comment`: id, case_id, author_pseudonym, author_badge, vote_weight, content, suggested_diagnosis, is_second_opinion.
  - `Hospital`: id, name, city, state, review_count.
  - `HospitalReview`: id, hospital_id, doctor_hash (to prevent duplicate spam), workload, safety, bullying_free, pay_fairness, equipment, review_text, month_year.
  - `B2BQueueSlot`: id, time_slot, patient_masked, spoke_origin, urgency_score, status, fee_patient, fee_spoke, fee_hub.
- [ ] **Task 2.3: Implement Routers**:
  - `routers/auth.py`: Hash NMC reg no (`hashlib.sha256(reg_no + salt)`). Compute `vote_weight = 5 if years >= 8 or 'DM' in degree else 2`.
  - `routers/cases.py`: CRUD for clinical cases. In comment submission, recalculate `consensus_percentage = sum(comment.vote_weight for top_dx) / total_weight * 100`.
  - `routers/hospitals.py`: Get hospital reviews. If `review_count < 5`, return `is_unlocked: false` and strip score averages.
  - `routers/b2b.py`: Queue manager. Implement `/simulate-cancellation` which marks Slot 2 cancelled and returns the high-urgency rural patient ticket.
- [ ] **Task 2.4: Build Robust Seed Script (`seed.py`)**:
  - Execute `python seed.py` to populate `mednexus.db` instantly:
    - **Doctor 1 (Persona: Metro Hub):** `Dr_Pulse_9482` (Cardiology, DM, 8 yrs, Weight 5).
    - **Doctor 2 (Persona: Rural Spoke):** `Dr_Kosi_Care` (General Physician, MBBS, 4 yrs, Weight 2).
    - **Doctor 3 (Persona: Neuro Specialist):** `Dr_Synapse_71` (Neurology, DM, 12 yrs, Weight 5).
    - **Case 1 (High Urgency Cardio):** "34M Post-Harvest Acute Chest Pain with ST Elevation", Urgency 92, Bounty ₹350.
    - **Case 2 (Pediatric Fever):** "7yo Child with High Spiking Fever & Thrombocytopenia", Urgency 85, Bounty ₹350.
    - **Case 3 (Atypical Stroke):** "62F Sudden Hemiparesis & Slurred Speech", Urgency 98, Bounty ₹350.
    - **Hospital 1 (Unlocked):** "Apex Metro Super Specialty Hospital" (6 reviews -> unlocked, culture scores visible).
    - **Hospital 2 (Locked Threshold Demo):** "Purnia Regional Medical Center" (4 reviews -> locked; adding 1 review unlocks it live in the demo!).
    - **Queue Slots:** 15:30 Booked, 15:45 Booked (Ready for Cancellation Demo), 16:00 Booked.

---

## 5. Laptop 3 Checklist (`./ai-service` Tasks) & 5-Minute Hotspot Integration

**Stack:** Python 3.10+, FastAPI, Google Gemini API (`google-genai` or `google-generativeai`), Pydantic v2, Pillow, OpenCV (or fallback image mask).  
**Port:** `8001` (`http://localhost:8001`)

### Directory Structure to Create
```
ai-service/
├── main.py                     # FastAPI entrypoint on port 8001, CORS="*"
├── config.py                   # GEMINI_API_KEY loader
├── requirements.txt            # fastapi, uvicorn, google-genai, pydantic, pillow
└── services/
    ├── phi_scrubber.py         # Regex + Gemini JSON structured output for PHI redaction
    ├── review_moderator.py     # Gemini defamation & institutional critique classifier
    ├── semantic_search.py      # Case similarity search against curated benchmark dataset
    ├── soap_scribe.py          # Plain text notes -> Structured SOAP + Urgency Score
    └── jan_aushadhi_engine.py  # Branded-to-Generic price discount calculator
```

### Action Items
- [ ] **Task 3.1: FastAPI Setup & Gemini Client Configuration**:
  - Initialize FastAPI on port `8001`.
  - Set `CORSMiddleware` with `allow_origins=["*"]`.
  - Load `GEMINI_API_KEY` from environment or `.env`.
- [ ] **Task 3.2: Build Text PHI Scrubber (`services/phi_scrubber.py`)**:
  - Combine high-speed Regex for Aadhaar numbers (`\d{4}-\d{4}-\d{4}`), phone numbers, and dates with Gemini structured output (`Pydantic` schema) to detect patient names, doctor names, and clinic locations.
  - Replace detected entities with standardized placeholders: `[PATIENT_AGE_GENDER]`, `[SPOKE_FACILITY]`, `[DATE_REDACTED]`.
- [ ] **Task 3.3: Build Image PHI & Face Masker (`main.py` -> `/ai/sanitize/image`)**:
  - Accept `UploadFile` (ECG or X-Ray image).
  - Use Pillow to crop/black out the top 10% banner of the image where patient names and clinic hospital headers are printed.
  - Return base64 or served sanitized image URL.
- [ ] **Task 3.4: Build Hospital Review Defamation Moderator (`services/review_moderator.py`)**:
  - Gemini prompt configured to distinguish:
    - *Allowed Institutional Feedback:* "36-hour shifts, broken defibrillator in ER, toxic residency workload."
    - *Prohibited Personal Defamation:* "Dr. XYZ is a fraud who took bribes."
  - Returns `is_allowed: false` with explanation if personal naming is detected.
- [ ] **Task 3.5: Build Semantic Search & AI Pinned Assistant (`services/semantic_search.py`)**:
  - Maintain a curated JSON benchmark library of 15 classic Indian rural-to-metro clinical dilemmas (Acute STEMI, Organophosphate Poisoning, Cerebral Malaria, Snakebite Envenomation, Pediatric Dengue).
  - Compute similarity score between input case and benchmark library.
  - Return the top match (e.g. 91% match with ICMR STEMI protocol) and immediate first-aid protocols.
- [ ] **Task 3.6: Build Jan Aushadhi Generic Mapping Engine (`services/jan_aushadhi_engine.py`)**:
  - Dictionary mapping common high-cost branded medications to *Pradhan Mantri Bhartiya Janaushadhi Pariyojana* (PMBI) generic equivalents.
  - Calculates cost savings percentage (e.g. Brilinta ₹48.50 -> Generic Ticagrelor ₹9.20 = 81% savings).
- [ ] **Task 3.7: Build SOAP Scribe & Urgency Scorer (`services/soap_scribe.py`)**:
  - Gemini prompt taking raw doctor rough notes + historical timeline.
  - Generates structured SOAP note (Subjective, Objective, Assessment, Plan).
  - Computes AI Urgency Score (1–100) and highlights contraindications (e.g., flags allergy to Brufen/NSAIDs).

---

### The 5-Minute Hotspot IP Integration Steps (Final Dry Run)

Follow these steps **30 minutes before judging** to connect all 3 laptops over a phone Wi-Fi hotspot with zero conflicts:

```
+--------------------------------------------------------------------------+
|                       5-MINUTE HOTSPOT INTEGRATION                       |
+--------------------------------------------------------------------------+
| 1. Turn ON Phone Mobile Hotspot (e.g., "Hackathon-Mesh").                |
| 2. Connect Laptop 1, Laptop 2, and Laptop 3 to this hotspot.             |
|                                                                          |
| 3. Find IP Addresses:                                                    |
|    - On Laptop 2 (Backend), run in terminal:                             |
|      Windows: ipconfig  | findstr IPv4                                   |
|      Mac/Linux: ifconfig | grep "inet "                                  |
|      --> Example: 192.168.43.120                                         |
|    - On Laptop 3 (AI Service), run in terminal:                          |
|      --> Example: 192.168.43.145                                         |
|                                                                          |
| 4. Start Backend on Laptop 2:                                            |
|    uvicorn main:app --host 0.0.0.0 --port 8000                          |
|                                                                          |
| 5. Start AI Service on Laptop 3:                                         |
|    uvicorn main:app --host 0.0.0.0 --port 8001                          |
|                                                                          |
| 6. Configure Frontend on Laptop 1:                                       |
|    Open `./frontend/.env.local` and set:                                 |
|    NEXT_PUBLIC_BACKEND_URL=http://192.168.43.120:8000                   |
|    NEXT_PUBLIC_AI_URL=http://192.168.43.145:8001                        |
|                                                                          |
| 7. Start Frontend on Laptop 1:                                           |
|    npm run dev                                                           |
|                                                                          |
| 8. Verify 10-Second Smoke Test:                                          |
|    Open http://localhost:3000 on Laptop 1. The status pills in the top  |
|    navbar should turn GREEN:                                             |
|    [● Backend: 192.168.43.120:8000 (Connected)]                          |
|    [● AI Service: 192.168.43.145:8001 (Connected)]                       |
|    If any service is yellow, the built-in mock fallback seamlessly kicks |
|    in so the demo presentation proceeds without disruption!              |
+--------------------------------------------------------------------------+
```

---

## 6. Ten-Hour Sprint Timeline & Hackathon Pitch Script

| Hour | Laptop 1 (`./frontend`) | Laptop 2 (`./backend`) | Laptop 3 (`./ai-service`) |
| :--- | :--- | :--- | :--- |
| **00:00 – 01:30** | Next.js scaffold + Tailwind theme + Mock data files | SQLite schema + models + `seed.py` | FastAPI setup + Gemini API key verification |
| **01:30 – 03:30** | EHR Vault Timeline UI + SOAP Scribe Form | Auth & NMC hashing + Case CRUD endpoints | Regex & Gemini PHI scrubber + Image header mask |
| **03:30 – 05:30** | MedBoard feed + AI Pinned Card + Jan Aushadhi UI | Consensus vote weighting + Bounty claim logic | Review defamation filter + Semantic search benchmark |
| **05:30 – 07:30** | Scheduler table + "Simulate No-Show" animation | B2B queue manager + `/simulate-cancellation` | SOAP Scribe & Urgency Score (1–100) endpoint |
| **07:30 – 08:30** | Hospital culture scorecard (k=5 unlock animation) | Hospital k-anonymity gatekeeper (k=5) | End-to-end AI latency test & prompt tuning |
| **08:30 – 09:15** | **HOTSPOT INTEGRATION:** Put Laptop 2 & 3 IPs in `.env.local`, test all live calls |
| **09:15 – 10:00** | **Pitch Practice & Demo Run:** Execute the 3-minute winning demo sequence below |

### The 3-Minute Judge Winning Demo Sequence
1. **Minute 1: Rural Tele-Consult & AI SOAP Scribe (Spoke-to-Hub Bridge)**
   - Log in as rural doctor `Dr_Kosi_Care`. Open patient vault showing past fevers and severe NSAID allergy.
   - Enter raw notes for farmer with acute chest pain. Click **"Generate AI SOAP Note"**.
   - Show instant SOAP conversion, AI Urgency Score `94/100`, and red flag: `NSAID Contraindicated`.
   - Show transparent B2B fee split: **₹500 Patient fee = ₹150 Rural Clinic + ₹350 Metro Specialist Bounty**.
2. **Minute 2: MedBoard Second Opinion & Pinned AI Assistant**
   - Click "Post to MedBoard". Demonstrate the **Pre-Flight PHI Scrubber** redacting Aadhaar and clinic names in real time.
   - Switch persona to metro specialist `Dr_Pulse_9482` (5x weight badge).
   - Show **Pinned AI Card**: 91% match with ICMR STEMI protocol and Jan Aushadhi generic mapping cutting drug costs by 81%.
   - Add specialist comment and vote. Consensus jumps to 85% and triggers **₹350 B2B Bounty Settled**.
3. **Minute 3: Dynamic Smart Queue & Hospital Culture (k=5)**
   - Navigate to Metro Hospital OPD queue. Click **`[Simulate Patient No-Show]`**.
   - Watch the cancelled slot instantly re-allocated to the critical rural farmer in real time.
   - Open Hospital Culture Scoreboard. Show Hospital A (unlocked with 6 reviews) vs Hospital B (locked with 4 reviews). Add 1 review on stage to demonstrate **k-anonymity (k=5) live unlock**.
