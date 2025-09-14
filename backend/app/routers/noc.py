from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user, UserRole, require_role
from app import models, schemas, db

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.get(
    "/student/noc-status",
    response_model=list[schemas.NocStatusResponse],
    dependencies=[Depends(require_role(UserRole.student))]
)
def get_noc_status(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    status_list = []
    subscriptions = db.query(models.StudentSubjectStatus).filter_by(student_id=current_user.id).all()
    for sub_status in subscriptions:
        reasons = []
        subject = db.query(models.Subject).filter_by(id=sub_status.subject_id).first()
        if subject is None:
            continue

        # Check attendance
        if sub_status.attendance_percentage < subject.attendance_threshold:
            reasons.append(f"Attendance below threshold ({sub_status.attendance_percentage}%)")

        # Now check boolean completions, not numeric marks
        if subject.has_cie and not sub_status.cie_completed:
            reasons.append("CIE component incomplete")
        if subject.has_ha and not sub_status.ha_completed:
            reasons.append("HA component incomplete")
        if subject.has_tw and not sub_status.tw_completed:
            reasons.append("TW component incomplete")
        if subject.has_pbl and not sub_status.pbl_completed:
            reasons.append("PBL component incomplete")

        # SCE components
        if subject.has_sce_presentation and not sub_status.sce_presentation_completed:
            reasons.append("SCE presentation incomplete")
        if subject.has_sce_certificate and not sub_status.sce_certificate_completed:
            reasons.append("SCE certificate incomplete")
        if subject.has_sce_pbl and not sub_status.sce_pbl_completed:
            reasons.append("SCE PBL incomplete")

        eligible = len(reasons) == 0
        status_list.append(schemas.NocStatusResponse(
            student_id=current_user.id,
            subject_id=sub_status.subject_id,
            eligible=eligible,
            reason=None if eligible else ", ".join(reasons)
        ))

    return status_list
