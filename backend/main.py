"""
MedNexus Central Clinical Gateway - High-Concurrency OPD Triage & Consent Verification
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Hospital
from seed import seed_database
from routers import auth, patient, queue, cases, hospitals

# Create tables if not present
Base.metadata.create_all(bind=engine)

# Auto-seed database if empty
db = SessionLocal()
try:
    if db.query(Hospital).count() == 0:
        print("[MedNexus Backend] Empty database detected. Seeding initial datasets...")
        seed_database()
finally:
    db.close()

app = FastAPI(
    title="MedNexus Core Backend — IIIT Delhi Hospital OS",
    description="Rural-to-Metro Clinical OS, Verified Pseudonymous Network & Dynamic Smart Queue",
    version="3.0.0",
)

# Mandatory Universal CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Feature Routers
app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(queue.router)
app.include_router(cases.router)
app.include_router(hospitals.router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MedNexus Core Backend",
        "hospital": "IIIT Delhi Hospital (HOSP-IIITD)",
        "version": "3.0.0",
        "port": 8000,
        "docs_url": "/docs"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "hospital_id": "HOSP-IIITD",
        "database": "connected"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
