from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import require_role, UserRole

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

# List all subjects
@router.get("/subjects", response_model=List[schemas.SubjectOut], dependencies=[Depends(require_role(UserRole.admin))])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(models.Subject).all()

# Create new subject with full boolean parameter support
@router.post("/subjects", response_model=schemas.SubjectOut, dependencies=[Depends(require_role(UserRole.admin))])
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    db_subject = models.Subject(
        name=subject.name,
        has_cie=subject.has_cie,
        has_ha=subject.has_ha,
        has_tw=subject.has_tw,
        has_pbl=subject.has_pbl,
        has_sce_presentation=subject.has_sce_presentation,
        has_sce_certificate=subject.has_sce_certificate,
        has_sce_pbl=subject.has_sce_pbl,
        attendance_threshold=subject.attendance_threshold
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# Update subject partially
@router.put("/subjects/{subject_id}", response_model=schemas.SubjectOut, dependencies=[Depends(require_role(UserRole.admin))])
def update_subject(subject_id: int, subject: schemas.SubjectParamsUpdate, db: Session = Depends(get_db)):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    update_data = subject.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# List all teachers
@router.get("/teachers", response_model=List[schemas.UserOut], dependencies=[Depends(require_role(UserRole.admin))])
def list_teachers(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "teacher").all()

# List all students
@router.get("/students", response_model=List[schemas.UserOut], dependencies=[Depends(require_role(UserRole.admin))])
def list_students(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == "student").all()

# List all users
@router.get("/users", response_model=List[schemas.UserOut], dependencies=[Depends(require_role(UserRole.admin))])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
