# MedNexus Core Clinical Router: queue.py
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models import HospitalQueueSlot, WaitingPatient, Patient
from schemas import (
    QueueResponse,
    QueueSlotItem,
    WaitingPatientItem,
    ReallocateSlotRequest,
    PatientStatusUpdateRequest,
)

router = APIRouter(prefix="/api", tags=["hospital-queue"])


@router.get("/hospital/HOSP-01/queue", response_model=QueueResponse)
@router.get("/b2b/queue", response_model=QueueResponse)
def get_iiitd_hospital_queue(
    hub_hospital_id: Optional[str] = Query("HOSP-01"),
    db: Session = Depends(get_db)
):
    slots = db.query(HospitalQueueSlot).order_by(HospitalQueueSlot.slot_time.asc()).all()
    waiting = db.query(WaitingPatient).all()

    queue_items = [
        QueueSlotItem(
            id=s.id,
            hospitalId=s.hospital_id,
            slotTime=s.slot_time,
            patientId=s.patient_id or "",
            patientName=s.patient_name,
            age=s.age or 0,
            gender=s.gender or "",
            severity=s.severity,
            status=s.status,
            referringSpoke=s.referring_spoke,
            attendingDoctor=s.attending_doctor,
            notes=s.notes or "",
        )
        for s in slots
    ]

    waiting_items = [
        WaitingPatientItem(
            id=w.id,
            name=w.name,
            age=w.age,
            gender=w.gender,
            requestedDoctor=w.requested_doctor,
            reason=w.reason,
            arrivalStatus=w.arrival_status,
            requestedTime=w.requested_time,
            phone=w.phone,
        )
        for w in waiting
    ]

    return QueueResponse(
        queue=queue_items,
        waiting_patients=waiting_items
    )


@router.post("/hospital/HOSP-01/queue/{slot_id}/cancel")
def cancel_queue_slot(slot_id: str, db: Session = Depends(get_db)):
    slot = db.query(HospitalQueueSlot).filter(HospitalQueueSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail=f"Slot {slot_id} not found.")

    slot.status = "Empty (Cancelled)"
    slot.patient_id = ""
    slot.patient_name = "Cancelled by Patient"
    slot.age = 0
    slot.gender = ""
    slot.notes = "Slot cancelled. Flagged as FREE for waiting patients."
    db.commit()

    return {"status": "vacated", "slot_id": slot_id}


@router.post("/hospital/HOSP-01/queue/{slot_id}/reallocate")
def reallocate_queue_slot(
    slot_id: str,
    payload: ReallocateSlotRequest,
    db: Session = Depends(get_db)
):
    slot = db.query(HospitalQueueSlot).filter(HospitalQueueSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail=f"Slot {slot_id} not found.")

    slot.patient_name = payload.patient_name
    slot.age = payload.age
    slot.gender = payload.gender
    slot.status = "Reallocated (Early Arrival)"
    slot.notes = f"Reallocated early arrival: {payload.reason}"

    # Remove from waiting_patients list if present
    waiting = db.query(WaitingPatient).filter(WaitingPatient.name.ilike(f"%{payload.patient_name}%")).first()
    if waiting:
        db.delete(waiting)

    db.commit()

    return {
        "status": "reallocated",
        "slot_id": slot_id,
        "time_saved_minutes": 45
    }


@router.put("/hospital/HOSP-01/patients/{patient_id}/status")
def update_patient_status(
    patient_id: str,
    payload: PatientStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    patient.status = payload.status
    db.commit()

    return {
        "status": "updated",
        "patient_id": patient_id,
        "new_status": payload.status
    }
