from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, db

router = APIRouter()

def get_db():
    db = db.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/messages/", response_model=schemas.MessageOut)
def send_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/messages/{user1_id}/{user2_id}", response_model=list[schemas.MessageOut])
def get_messages_between_users(user1_id: int, user2_id: int, db: Session = Depends(get_db)):
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == user1_id) & (models.Message.receiver_id == user2_id)) |
        ((models.Message.sender_id == user2_id) & (models.Message.receiver_id == user1_id))
    ).order_by(models.Message.timestamp.asc()).all()
    return messages
