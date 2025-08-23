from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user,UserRole,require_role
from app import models, schemas, db

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.get("/student/noc-status/", response_model=list[schemas.NocStatusResponse], dependencies=[Depends(require_role(UserRole.student))])
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
            continue  # or handle missing subject as appropriate

        # Attendance check
        if sub_status.attendance_percentage < subject.attendance_threshold:
            reasons.append(f"Attendance below threshold ({sub_status.attendance_percentage}%)")

        # Marks checks: can adjust thresholds as needed
        if sub_status.marks_cie is not None and sub_status.marks_cie < 40:
            reasons.append("CIE marks below passing")
        if sub_status.marks_ha is not None and sub_status.marks_ha < 40:
            reasons.append("HA marks below passing")
        if sub_status.marks_tw is not None and sub_status.marks_tw < 40:
            reasons.append("TW marks below passing")
        if sub_status.marks_pbl is not None and sub_status.marks_pbl < 40:
            reasons.append("PBL marks below passing")

        eligible = len(reasons) == 0
        status_list.append(schemas.NocStatusResponse(
            student_id=current_user.id,
            subject_id=sub_status.subject_id,
            eligible=eligible,
            reason=None if eligible else ", ".join(reasons)
        ))

    return status_list
