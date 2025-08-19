from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
