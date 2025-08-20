from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import require_role, get_current_user

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.put("/teacher/update-marks/", dependencies=[Depends(require_role("teacher"))])
def update_marks(
    marks_req: schemas.MarksUpdateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if current_user is assigned teacher for this subject
    subject = db.query(models.Subject).get(marks_req.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if current_user not in subject.assigned_teachers:
        raise HTTPException(status_code=403, detail="Not allowed to update marks for this subject")

    # Fetch or create StudentSubjectStatus record
    status_record = (
        db.query(models.StudentSubjectStatus)
        .filter_by(student_id=marks_req.student_id, subject_id=marks_req.subject_id)
        .first()
    )
    if not status_record:
        status_record = models.StudentSubjectStatus(
            student_id=marks_req.student_id,
            subject_id=marks_req.subject_id
        )
        db.add(status_record)

    # Update marks fields if provided
    for field in ["marks_cie", "marks_ha", "marks_tw", "marks_pbl"]:
        value = getattr(marks_req, field)
        if value is not None:
            setattr(status_record, field, value)

    # Optionally, recalculate NOC eligibility here or via separate process
    db.commit()
    db.refresh(status_record)

    return {"message": "Marks updated successfully."}
