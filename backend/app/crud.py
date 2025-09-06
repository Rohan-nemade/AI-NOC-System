from sqlalchemy.orm import Session
from app import models
from app.routers import auth
from app.schemas import UserCreate
from app import schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=auth.get_password_hash(user.password),  # Hash here
        role=user.role,
        roll_number=user.roll_number,
        class_name=user.class_name,
        division=user.division
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not auth.verify_password(password, user.hashed_password):
        return False
    return user
