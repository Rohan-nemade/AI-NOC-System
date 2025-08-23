from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import get_current_user,UserRole,require_role

router = APIRouter()

def get_db():
    db = db.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/update-status/", dependencies=[Depends(require_role(UserRole.admin))])
def update_student_status(
    student_id: int,
    subject_id: int,
    attendance: float,
    marks_cie: float,
    marks_ha: float,
    marks_tw: float,
    marks_pbl: float,
    db: Session = Depends(get_db)
):
    status = (
        db.query(models.StudentSubjectStatus)
        .filter_by(student_id=student_id, subject_id=subject_id)
        .first()
    )
    if not status:
        status = models.StudentSubjectStatus(
            student_id=student_id,
            subject_id=subject_id
        )
        db.add(status)

    status.attendance_percentage = attendance
    status.marks_cie = marks_cie
    status.marks_ha = marks_ha
    status.marks_tw = marks_tw
    status.marks_pbl = marks_pbl

    # Calculate eligibility based on attendance threshold and marks thresholds
    subject = db.query(models.Subject).get(subject_id)
    reasons = []
    if attendance < subject.attendance_threshold:
        reasons.append("Attendance below required threshold")

    total_marks = marks_cie + marks_ha + marks_tw + marks_pbl
    # Example minimal mark threshold, adjust as needed
    min_total_marks = 40  
    if total_marks < min_total_marks:
        reasons.append("Marks below required threshold")

    if reasons:
        status.is_noc_eligible = False
        status.noc_ineligibility_reason = "; ".join(reasons)
    else:
        status.is_noc_eligible = True
        status.noc_ineligibility_reason = ""

    db.commit()
    db.refresh(status)

    return {"is_noc_eligible": status.is_noc_eligible, "reason": status.noc_ineligibility_reason}
