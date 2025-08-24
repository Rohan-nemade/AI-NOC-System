from typing import List
from fastapi import APIRouter, Depends, HTTPException
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

@router.get("/admin/users", response_model=List[schemas.UserOut], dependencies=[Depends(require_role(UserRole.admin))])
def list_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found")
    return users
