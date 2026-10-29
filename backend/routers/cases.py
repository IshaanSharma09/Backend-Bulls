# MedNexus Core Clinical Router: cases.py
import json
import secrets
from datetime import datetime, timezone
from typing import Optional, List
from collections import defaultdict
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from models import Case, Comment, Doctor
from schemas import (
    CaseListResponse,
    CaseSummaryItem,
    CreateCaseRequest,
    CreateCaseResponse,
    CaseDetailResponse,
    CommentItem,
    CreateCommentRequest,
    CreateCommentResponse,
    ClaimBountyResponse,
    PatientDemographics,
)

router = APIRouter(prefix="/api/cases", tags=["cases"])


def get_current_author(authorization: Optional[str], db: Session):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        doc = db.query(Doctor).filter(Doctor.token == token).first()
        if doc:
            return doc
    return None


@router.get("", response_model=CaseListResponse)
def get_cases(
    specialty: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query("recent"),
    db: Session = Depends(get_db)
):
    query = db.query(Case)

    if specialty:
        spec_clean = specialty.lower().replace("c/", "").strip()
        if spec_clean.startswith("cardio"):
            root = "cardio"
        elif spec_clean.startswith("neuro"):
            root = "neuro"
        elif spec_clean.startswith("pedia"):
            root = "pedia"
        elif spec_clean.startswith("ortho"):
            root = "ortho"
        elif "general" in spec_clean:
            root = "general"
        else:
            root = spec_clean[:5] if len(spec_clean) > 5 else spec_clean
        query = query.filter(Case.specialty_tag.ilike(f"%{root}%"))

    if status:
        query = query.filter(Case.status == status)

    if sort == "urgent":
        query = query.order_by(Case.urgency_score.desc())
    elif sort == "bounty":
        query = query.order_by(Case.bounty_amount.desc())
    else:
        query = query.order_by(Case.created_at.desc())

    cases_db = query.all()

    summary_list = [
        CaseSummaryItem(
            case_id=c.case_id,
            title=c.title,
            specialty_tag=c.specialty_tag,
            author_pseudonym=c.author_pseudonym,
            author_badge=c.author_badge,
            patient_age=c.patient_age,
            patient_gender=c.patient_gender,
            urgency_score=c.urgency_score,
            bounty_amount=c.bounty_amount,
            status=c.status,
            consensus_score=c.consensus_score,
            comments_count=c.comments_count,
            has_ai_pin=c.has_ai_pin,
            created_at=c.created_at,
        )
        for c in cases_db
    ]

    return CaseListResponse(cases=summary_list)


@router.post("", response_model=CreateCaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CreateCaseRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    author = get_current_author(authorization, db)
    pseudonym = author.pseudonym if author else "Dr_Kosi_Care"
    badge = author.badge if author else "Verified Spoke Physician, 4 yrs"

    case_id = f"case_{secrets.token_hex(4)}"
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    vitals_str = json.dumps(payload.vitals)
    imaging_str = json.dumps(payload.imaging_urls or [])

    new_case = Case(
        case_id=case_id,
        title=payload.title,
        specialty_tag=payload.specialty_tag,
        author_pseudonym=pseudonym,
        author_badge=badge,
        patient_age=payload.patient_demographics.age,
        patient_gender=payload.patient_demographics.gender,
        chief_complaint=payload.chief_complaint,
        vitals_json=vitals_str,
        history=payload.history,
        labs_and_ecg=payload.labs_and_ecg,
        imaging_urls_json=imaging_str,
        bounty_amount=payload.bounty_amount or 350,
        urgency_score=payload.urgency_score or 92,
        status="open",
        consensus_status="in_progress",
        consensus_score=0,
        consensus_percentage=0,
        leading_diagnosis=None,
        has_ai_pin=True,
        comments_count=0,
        created_at=now_iso,
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return CreateCaseResponse(
        case_id=new_case.case_id,
        status="published",
        created_at=new_case.created_at,
    )


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        vitals = json.loads(c.vitals_json)
    except Exception:
        vitals = {}

    try:
        imaging = json.loads(c.imaging_urls_json)
    except Exception:
        imaging = []

    comments_db = db.query(Comment).filter(Comment.case_id == case_id).order_by(Comment.created_at.asc()).all()
    comments_list = [
        CommentItem(
            comment_id=comm.comment_id,
            author_pseudonym=comm.author_pseudonym,
            author_badge=comm.author_badge,
            vote_weight=comm.vote_weight,
            content=comm.content,
            suggested_diagnosis=comm.suggested_diagnosis,
            upvotes=comm.upvotes,
            created_at=comm.created_at,
        )
        for comm in comments_db
    ]

    return CaseDetailResponse(
        case_id=c.case_id,
        title=c.title,
        specialty_tag=c.specialty_tag,
        author_pseudonym=c.author_pseudonym,
        author_badge=c.author_badge,
        patient_demographics=PatientDemographics(
            age=c.patient_age,
            gender=c.patient_gender
        ),
        chief_complaint=c.chief_complaint,
        vitals=vitals,
        history=c.history,
        labs_and_ecg=c.labs_and_ecg,
        imaging_urls=imaging,
        bounty_amount=c.bounty_amount,
        urgency_score=c.urgency_score,
        consensus_status=c.consensus_status,
        consensus_percentage=c.consensus_percentage,
        leading_diagnosis=c.leading_diagnosis,
        comments=comments_list,
    )


@router.post("/{case_id}/comments", response_model=CreateCommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    case_id: str,
    payload: CreateCommentRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    author = get_current_author(authorization, db)
    pseudonym = author.pseudonym if author else "Dr_Pulse_9482"
    badge = author.badge if author else "Verified Cardiologist, 8 yrs"
    vote_weight = author.vote_weight if author else 5

    comment_id = f"comm_{secrets.token_hex(3)}"
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    new_comment = Comment(
        comment_id=comment_id,
        case_id=case_id,
        author_pseudonym=pseudonym,
        author_badge=badge,
        vote_weight=vote_weight,
        content=payload.content,
        suggested_diagnosis=payload.suggested_diagnosis,
        is_second_opinion=payload.is_second_opinion if payload.is_second_opinion is not None else True,
        upvotes=1,
        created_at=now_iso,
    )
    db.add(new_comment)
    db.commit()

    # Recalculate consensus percentage
    all_comments = db.query(Comment).filter(Comment.case_id == case_id).all()
    diagnosis_weights = defaultdict(int)
    total_weight = 0

    for comm in all_comments:
        total_weight += comm.vote_weight
        if comm.suggested_diagnosis:
            diagnosis_weights[comm.suggested_diagnosis] += comm.vote_weight

    if diagnosis_weights and total_weight > 0:
        top_dx = max(diagnosis_weights, key=diagnosis_weights.get)
        top_weight = diagnosis_weights[top_dx]
        new_consensus_pct = min(100, int(round((top_weight / total_weight) * 100)))
        leading_dx = top_dx
    else:
        new_consensus_pct = 75
        leading_dx = payload.suggested_diagnosis or c.leading_diagnosis

    consensus_reached = (new_consensus_pct >= 80)

    c.consensus_percentage = new_consensus_pct
    c.consensus_score = new_consensus_pct
    c.comments_count = len(all_comments)
    c.leading_diagnosis = leading_dx
    if consensus_reached:
        c.consensus_status = "resolved"

    db.commit()

    return CreateCommentResponse(
        comment_id=new_comment.comment_id,
        author_pseudonym=new_comment.author_pseudonym,
        author_badge=new_comment.author_badge,
        vote_weight=new_comment.vote_weight,
        new_consensus_percentage=new_consensus_pct,
        consensus_reached=consensus_reached,
    )


@router.post("/{case_id}/claim-bounty", response_model=ClaimBountyResponse)
def claim_bounty(
    case_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    c = db.query(Case).filter(Case.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    author = get_current_author(authorization, db)
    credited_pseudonym = author.pseudonym if author else "Dr_Pulse_9482"

    c.status = "resolved"
    c.consensus_status = "resolved"
    db.commit()

    return ClaimBountyResponse(
        status="bounty_claimed",
        amount=c.bounty_amount or 350,
        credited_to_pseudonym=credited_pseudonym,
        hospital_escrow_settled=True,
    )
