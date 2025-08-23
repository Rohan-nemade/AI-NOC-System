from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import require_role, get_current_user,get_current_user, require_role,UserRole
router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.put("/teacher/update-marks/", status_code=200, dependencies=[Depends(require_role(UserRole.teacher))])
def update_marks(
    marks_req: schemas.MarksUpdateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify subject exists
    subject = db.query(models.Subject).filter_by(id=marks_req.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Verify current user is assigned teacher for the subject
    if current_user not in subject.assigned_teachers:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    # Get or create StudentSubjectStatus entry
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

    # Update any provided marks
    for field in ["marks_cie", "marks_ha", "marks_tw", "marks_pbl"]:
        value = getattr(marks_req, field, None)
        if value is not None:
            setattr(status_record, field, value)

    db.commit()
    db.refresh(status_record)

    return {"message": "Marks updated successfully."}