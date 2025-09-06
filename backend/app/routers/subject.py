from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import require_role
from app.models import UserRole
from app import models, schemas, db

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post(
    "/admin/subjects-create",
    response_model=schemas.SubjectOut,
    dependencies=[Depends(require_role(UserRole.admin))],
    status_code=status.HTTP_201_CREATED,
)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    try:
        db_subject = models.Subject(**subject.model_dump())
        db.add(db_subject)
        db.commit()
        db.refresh(db_subject)
        return db_subject
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create subject: {str(e)}")

@router.patch(
    "/admin/subjects/{subject_id}/parameters",
    response_model=schemas.SubjectOut,
    dependencies=[Depends(require_role(UserRole.admin))],
)
def update_subject_parameters(subject_id: int, params: schemas.SubjectParamsUpdate, db: Session = Depends(get_db)):
    subject = db.query(models.Subject).get(subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    update_data = params.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subject, key, value)

    db.commit()
    db.refresh(subject)
    return subject

@router.post(
    "/admin/assign-subject",
    dependencies=[Depends(require_role(UserRole.admin))],
    status_code=status.HTTP_200_OK,
)
def assign_subject(req: schemas.AssignSubjectRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).get(req.user_id)
    subject = db.query(models.Subject).get(req.subject_id)

    if not user or not subject:
        raise HTTPException(status_code=404, detail="User or Subject not found")

    if req.role == UserRole.teacher:
        if user not in subject.assigned_teachers:
            subject.assigned_teachers.append(user)
    elif req.role == UserRole.student:
        if user not in subject.registered_students:
            subject.registered_students.append(user)
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    db.commit()
    return {"message": f"Subject assigned to {req.role} successfully."}
