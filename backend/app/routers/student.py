from fastapi import APIRouter, Depends, HTTPException
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

@router.get("/student/noc-status/{subject_id}", response_model=schemas.NocStatusResponse, dependencies=[Depends(require_role("student"))])
def get_noc_status(subject_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    status_record = db.query(models.StudentSubjectStatus).filter_by(
        student_id=current_user.id,
        subject_id=subject_id
    ).first()

    if not status_record:
        return schemas.NocStatusResponse(
            student_id=current_user.id,
            subject_id=subject_id,
            eligible=False,
            reason="No record found for this subject."
        )

    return schemas.NocStatusResponse(
        student_id=current_user.id,
        subject_id=subject_id,
        eligible=status_record.noc_eligible,
        reason=status_record.noc_reason
    )
