from pydantic import BaseModel, EmailStr, StringConstraints, Field
from enum import Enum
from datetime import datetime
from typing import Annotated, Optional

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class UserCreate(BaseModel):
    name: Annotated[str, StringConstraints(min_length=2, max_length=50)]
    email: EmailStr
    password: Annotated[str, StringConstraints(min_length=6)]
    role: UserRole


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True  # Updated for Pydantic v2


class Token(BaseModel):
    access_token: str
    token_type: str


class SubjectBase(BaseModel):
    name: str


class SubjectCreate(SubjectBase):
    cie_weightage: Annotated[int, Field(ge=0, le=100)]
    ha_weightage: Annotated[int, Field(ge=0, le=100)]
    tw_weightage: Annotated[int, Field(ge=0, le=100)]
    pbl_weightage: Annotated[int, Field(ge=0, le=100)]
    attendance_threshold: Annotated[int, Field(ge=0, le=100)]


class SubjectParamsUpdate(BaseModel):
    cie_weightage: Optional[int] = None
    ha_weightage: Optional[int] = None
    tw_weightage: Optional[int] = None
    pbl_weightage: Optional[int] = None
    attendance_threshold: Optional[int] = None


class SubjectOut(SubjectBase):
    id: int
    cie_weightage: int
    ha_weightage: int
    tw_weightage: int
    pbl_weightage: int
    attendance_threshold: int

    class Config:
        from_attributes = True


class AssignSubjectRequest(BaseModel):
    user_id: int
    subject_id: int
    role: str  # 'teacher' or 'student'


class AssignmentCreate(BaseModel):
    title: str
    subject_id: int
    teacher_id: int
    description: Optional[str] = None
    is_sample: int = 0


class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    content: str


class GrievanceCreate(BaseModel):
    student_id: int
    subject_id: Optional[int] = None
    title: str
    description: str


class GrievanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: Optional[int] = None
    title: str
    description: str
    status: str
    response: Optional[str] = None

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class NocStatusResponse(BaseModel):
    student_id: int
    subject_id: int
    eligible: bool
    reason: Optional[str] = None

class MarksUpdateRequest(BaseModel):
    student_id: int
    subject_id: int
    marks_cie: int | None = Field(None, ge=0, le=100)
    marks_ha: int | None = Field(None, ge=0, le=100)
    marks_tw: int | None = Field(None, ge=0, le=100)
    marks_pbl: int | None = Field(None, ge=0, le=100)
