# MedNexus | Clinical Operating System & Healthcare Intelligence Network

> **Hackathon 2026 Submission** | Team: **Backend Bulls**  
> **Repository:** [https://github.com/IshaanSharma09/Backend-Bulls](https://github.com/IshaanSharma09/Backend-Bulls)

---

## Architecture & Team Contributions

MedNexus is an end-to-end clinical workflow operating system structured as a clean 3-tier zero-conflict monorepo:

| Service | Machine Role | Core Technologies | Primary Owner / Contributor |
| :--- | :--- | :--- | :--- |
| **Frontend** (`./frontend`) | Laptop 1 | Next.js 14, Tailwind CSS, Spline 3D, TypeScript | **Ishaan Sharma** (`@IshaanSharma09`) |
| **Core Backend** (`./backend`) | Laptop 2 | FastAPI, SQLite, Pydantic, Python 3.10+ | **Yash Sharma** (`@yashsharma1388`) |
| **AI Intelligence** (`./ai-service`) | Laptop 3 | FastAPI, Google Gemini API, PHI Sanitizer | **AI Engineer** (Laptop 3) |

---

## Key Features

1. **Patient-Governed Health Portal**:
   - Dynamic 15-minute one-time access codes preventing unauthorized long-term chart access.
   - Crisp, plain-English clinical summaries with zero medical jargon overload.
   - Direct inline pen editing for Allergies, Genetics, Active Medications, and Vaccinations.
   - Full diagnostic lab report upload and management.

2. **IIIT Delhi Hospital & Clinician OS**:
   - Smart Queue with instant vacancy flagging when appointments are cancelled.
   - OPD Lounge Early-Arrival Reallocation to reassign waiting patients into empty slots.
   - Strict institutional roster isolation for attending doctors and patients.

3. **Clinical Safety & Jan Aushadhi Generic Substitution**:
   - Real-time allergy contraindication checks (e.g. Penicillin, NSAIDs/Ibuprofen/Combiflam).
   - Direct mapping of expensive branded drugs to Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBI) generics with up to 85% cost savings.

4. **MedBoard & Hospital Workplace Culture**:
   - Pseudonymous doctor consensus for rural-to-metro complex cases.
   - Anonymous workplace reviews with k-anonymity (k=5) privacy protection.

---

## Quick Start (Local Setup)

### 1. Core Backend (Laptop 2)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. AI Intelligence Engine (Laptop 3)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Web Application (Laptop 1)
```bash
cd frontend
npm install
npm run dev
# App is live at http://localhost:3000
```
