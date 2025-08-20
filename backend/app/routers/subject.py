from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, db

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/admin/subjects/", response_model=schemas.SubjectOut)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    db_subject = models.Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.put("/admin/subjects/{subject_id}/parameters", response_model=schemas.SubjectOut)
def update_subject_parameters(subject_id: int, params: schemas.SubjectParamsUpdate, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).get(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    for key, value in params.dict(exclude_unset=True).items():
        setattr(subject, key, value)
    db.commit()
    db.refresh(subject)
    return subject

@router.post("/admin/assign-subject/")
def assign_subject(req: schemas.AssignSubjectRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).get(req.user_id)
    subject = db.query(models.Subject).get(req.subject_id)
    if not user or not subject:
        raise HTTPException(status_code=404, detail="User or Subject not found")
    if req.role == "teacher":
        subject.assigned_teachers.append(user)
    elif req.role == "student":
        subject.registered_students.append(user)
    else:
        raise HTTPException(status_code=400, detail="Invalid role")
    db.commit()
    return {"message": f"Subject assigned to {req.role} successfully."}
