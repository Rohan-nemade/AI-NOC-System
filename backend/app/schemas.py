from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from datetime import datetime
from typing import Optional, List

# ===================================================================
# 1. User and Authentication Schemas
# ===================================================================

class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole
    roll_number: Optional[str] = None
    class_name: Optional[str] = None
    division: Optional[str] = None

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

# ===================================================================
# 2. Subject Schemas
# ===================================================================

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

# ===================================================================
# 3. Assignment and Submission Schemas
# ===================================================================

# --- Schemas for Backend CRUD Operations ---

class AssignmentCreate(BaseModel):
    """Schema for creating an assignment in the database."""
    title: str
    subject_id: int
    teacher_id: int
    class_name: str
    division: str
    assignment_type: str
    deadline: datetime
    max_marks: int
    status: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    batch: Optional[str] = None
    assignment_file_path: Optional[str] = None
    solution_file_path: Optional[str] = None


class AssignmentOut(BaseModel):
    """A comprehensive schema for representing an assignment from the DB."""
    id: int
    title: str
    subject_id: int
    teacher_id: int
    description: Optional[str]
    deadline: datetime
    status: str
    class_name: str
    division: str
    batch: Optional[str]
    assignment_type: str
    max_marks: int
    instructions: Optional[str]
    assignment_file_path: Optional[str]
    solution_file_path: Optional[str]
    created_at: datetime

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
    bert_score: Optional[float]
    marks: Optional[float]
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True


# --- Schemas specifically structured for the Frontend UI ---

class StudentSubmissionDetail(BaseModel):
    """Represents a single student submission inside the teacher's assignment detail view."""
    id: int
    assignmentId: int = Field(..., alias="assignment_id")
    studentName: str
    studentRollNo: Optional[str]
    submissionDate: datetime
    status: str
    grade: Optional[float] = Field(None, alias="marks")
    feedback: Optional[str] = None
    filePath: Optional[str] = Field(None, alias="file_path")

    class Config:
        from_attributes = True
        populate_by_name = True

class TeacherAssignmentDetail(BaseModel):
    """Represents the entire data object for the teacher's assignment management page."""
    id: int
    title: str
    description: Optional[str]
    subject: str
    class_name: str = Field(..., alias="class")
    division: str
    batch: Optional[str]
    dueDate: datetime = Field(..., alias="deadline")
    createdDate: datetime = Field(..., alias="created_at")
    maxMarks: int = Field(..., alias="max_marks")
    instructions: Optional[str]
    status: str
    teacherName: str
    assignmentType: str = Field(..., alias="assignment_type")
    submissions: List[StudentSubmissionDetail] = []
    assignmentFilePath: Optional[str] = Field(None, alias="assignment_file_path")
    solutionFilePath: Optional[str] = Field(None, alias="solution_file_path")

    class Config:
        from_attributes = True
        populate_by_name = True

# ===================================================================
# 4. Grievance Schemas
# ===================================================================

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

# ===================================================================
# 5. Messaging Schemas
# ===================================================================

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

# ===================================================================
# 6. Notification Schemas
# ===================================================================

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

# ===================================================================
# 7. NOC and Marks Schemas
# ===================================================================

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

