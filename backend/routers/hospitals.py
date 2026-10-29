# MedNexus Core Clinical Router: hospitals.py
import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Hospital, HospitalReview, Doctor
from schemas import (
    HospitalListResponse,
    HospitalItem,
    HospitalScores,
    CreateReviewRequest,
    CreateReviewResponse,
)

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])

K_ANONYMITY_THRESHOLD = 5


@router.get("", response_model=HospitalListResponse)
def get_hospitals(db: Session = Depends(get_db)):
    hospitals_db = db.query(Hospital).all()
    hospital_items: List[HospitalItem] = []

    for hosp in hospitals_db:
        reviews = db.query(HospitalReview).filter(HospitalReview.hospital_id == hosp.hospital_id).all()
        review_count = len(reviews)

        if hosp.review_count != review_count:
            hosp.review_count = review_count
            db.commit()

        is_unlocked = review_count >= K_ANONYMITY_THRESHOLD

        if is_unlocked and review_count > 0:
            avg_workload = round(sum(r.workload_rating for r in reviews) / review_count, 1)
            avg_safety = round(sum(r.safety_rating for r in reviews) / review_count, 1)
            avg_bullying = round(sum(r.bullying_free_rating for r in reviews) / review_count, 1)
            avg_pay = round(sum(r.pay_fairness_rating for r in reviews) / review_count, 1)
            avg_equip = round(sum(r.equipment_rating for r in reviews) / review_count, 1)
            overall = round((avg_workload + avg_safety + avg_bullying + avg_pay + avg_equip) / 5.0, 1)

            scores = HospitalScores(
                workload=avg_workload,
                safety=avg_safety,
                bullying_free=avg_bullying,
                pay_fairness=avg_pay,
                equipment=avg_equip,
                overall_culture=overall,
            )
            reviews_needed = None
        else:
            scores = None
            reviews_needed = max(0, K_ANONYMITY_THRESHOLD - review_count)

        hospital_items.append(
            HospitalItem(
                hospital_id=hosp.hospital_id,
                name=hosp.name,
                city=hosp.city,
                state=hosp.state,
                review_count=review_count,
                is_unlocked=is_unlocked,
                reviews_needed_to_unlock=reviews_needed,
                scores=scores,
            )
        )

    return HospitalListResponse(hospitals=hospital_items)


@router.post("/{hospital_id}/reviews", response_model=CreateReviewResponse, status_code=status.HTTP_201_CREATED)
def create_hospital_review(
    hospital_id: str,
    payload: CreateReviewRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    hosp = db.query(Hospital).filter(Hospital.hospital_id == hospital_id).first()
    if not hosp:
        raise HTTPException(status_code=404, detail="Hospital not found")

    doctor_hash = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        doc = db.query(Doctor).filter(Doctor.token == token).first()
        if doc:
            doctor_hash = doc.nmc_hash

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    month_year = datetime.now(timezone.utc).strftime("%B %Y")
    rev_id = f"rev_{secrets.token_hex(4)}"

    new_review = HospitalReview(
        id=rev_id,
        hospital_id=hospital_id,
        doctor_hash=doctor_hash,
        department=payload.department,
        workload_rating=payload.workload_rating,
        safety_rating=payload.safety_rating,
        bullying_free_rating=payload.bullying_free_rating,
        pay_fairness_rating=payload.pay_fairness_rating,
        equipment_rating=payload.equipment_rating,
        review_text=payload.review_text,
        month_year=month_year,
        created_at=now_iso,
    )
    db.add(new_review)

    current_reviews = db.query(HospitalReview).filter(HospitalReview.hospital_id == hospital_id).count() + 1
    hosp.review_count = current_reviews
    db.commit()

    is_now_unlocked = current_reviews >= K_ANONYMITY_THRESHOLD

    return CreateReviewResponse(
        status="success",
        message="Review recorded anonymously. Identity detached.",
        total_hospital_reviews=current_reviews,
        is_now_unlocked=is_now_unlocked,
    )
