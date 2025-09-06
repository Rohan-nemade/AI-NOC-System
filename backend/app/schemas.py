from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from datetime import datetime
from typing import Optional, List

# User role enum
class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

# User creation schema
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole
    roll_number: Optional[str] = None  # Only students
    class_name: Optional[str] = None   # Only students
    division: Optional[str] = None     # Only students

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    roll_number: Optional[str] = None
    class_name: Optional[str] = None
    division: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Subject schemas -- now with booleans for dynamic params
class SubjectBase(BaseModel):
    name: str

class SubjectCreate(SubjectBase):
    has_cie: bool = False
    has_ha: bool = False
    has_tw: bool = False
    has_pbl: bool = False
    has_sce_presentation: bool = False
    has_sce_certificate: bool = False
    has_sce_pbl: bool = False
    attendance_threshold: int = Field(..., ge=0, le=100)

class SubjectParamsUpdate(BaseModel):
    has_cie: Optional[bool] = None
    has_ha: Optional[bool] = None
    has_tw: Optional[bool] = None
    has_pbl: Optional[bool] = None
    has_sce_presentation: Optional[bool] = None
    has_sce_certificate: Optional[bool] = None
    has_sce_pbl: Optional[bool] = None
    attendance_threshold: Optional[int] = Field(None, ge=0, le=100)

class SubjectOut(SubjectBase):
    id: int
    has_cie: bool
    has_ha: bool
    has_tw: bool
    has_pbl: bool
    has_sce_presentation: bool
    has_sce_certificate: bool
    has_sce_pbl: bool
    attendance_threshold: int

    class Config:
        from_attributes = True

class AssignSubjectRequest(BaseModel):
    user_id: int
    subject_id: int
    role: UserRole

# Assignment schemas
class AssignmentCreate(BaseModel):
    title: str
    subject_id: int
    description: Optional[str] = None
    teacher_id: Optional[int] = None
    deadline: datetime
    is_sample: Optional[bool] = False

class AssignmentOut(BaseModel):
    id: int
    title: str
    subject_id: int
    teacher_id: int
    description: Optional[str]
    deadline: datetime
    is_sample: bool

    class Config:
        from_attributes = True

class AssignmentSubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int
    content: str
    file_path: Optional[str] = None

class AssignmentSubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    content: str
    file_path: Optional[str]
    deadline_met: bool
    bert_score: Optional[float]
    marks: Optional[float]
    status: str

    class Config:
        from_attributes = True

# Grievance schemas
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

# Messaging schemas
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

# Notification schemas
class NotificationCreate(BaseModel):
    student_id: int
    subject_id: int
    message: str

class NotificationOut(BaseModel):
    id: int
    student_id: int
    subject_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# NOC/Marks/Status (per student x subject)
class NocStatusResponse(BaseModel):
    student_id: int
    subject_id: int
    eligible: bool
    reason: Optional[str] = None

class MarksUpdateRequest(BaseModel):
    student_id: int
    subject_id: int
    cie_completed: Optional[bool] = None
    ha_completed: Optional[bool] = None
    tw_completed: Optional[bool] = None
    pbl_completed: Optional[bool] = None
    sce_presentation_completed: Optional[bool] = None
    sce_certificate_completed: Optional[bool] = None
    sce_pbl_completed: Optional[bool] = None
    marks_cie: Optional[int] = Field(None, ge=0, le=100)
    marks_ha: Optional[int] = Field(None, ge=0, le=100)
    marks_tw: Optional[int] = Field(None, ge=0, le=100)
    marks_pbl: Optional[int] = Field(None, ge=0, le=100)
    attendance_percentage: Optional[float] = Field(None, ge=0, le=100)
    is_noc_eligible: Optional[bool] = None
    noc_ineligibility_reason: Optional[str] = None
