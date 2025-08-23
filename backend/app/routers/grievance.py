from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import UserRole,require_role,require_roles

router = APIRouter()

def get_db():
    db = db.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/grievance/", response_model=schemas.GrievanceOut, dependencies=[Depends(require_role(UserRole.student))])
def submit_grievance(grievance: schemas.GrievanceCreate, db: Session = Depends(get_db)):
    db_grievance = models.Grievance(**grievance.model_dump())
    db.add(db_grievance)
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@router.get("/grievance/{student_id}", response_model=list[schemas.GrievanceOut], dependencies=[Depends(require_role(UserRole.student))])
def get_student_grievances(student_id: int, db: Session = Depends(get_db)):
    grievances = db.query(models.Grievance).filter(models.Grievance.student_id == student_id).all()
    return grievances

@router.put("/grievance/{grievance_id}/status", dependencies=[Depends(require_role(UserRole.admin))])
def update_grievance_status(grievance_id: int, status: str, response: str | None = None, db: Session = Depends(get_db)):
    grievance = db.query(models.Grievance).get(grievance_id)
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found")
    grievance.status = status
    grievance.response = response
    db.commit()
    return {"message": "Grievance updated"}
