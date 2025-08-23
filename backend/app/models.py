from sqlalchemy import (
    Column, Integer, String, Enum, ForeignKey,
    Float, DateTime, Table, Boolean, Text
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime
from pydantic import BaseModel, Field

Base = declarative_base()


class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


# Association tables for many-to-many relations
teacher_subject = Table(
    "teacher_subject",
    Base.metadata,
    Column("teacher_id", Integer, ForeignKey("users.id")),
    Column("subject_id", Integer, ForeignKey("subjects.id")),
)

student_subject = Table(
    "student_subject",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("users.id")),
    Column("subject_id", Integer, ForeignKey("subjects.id")),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)

    # Relationships
    grievances = relationship("Grievance", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")
    assigned_subjects = relationship(
        "Subject",
        secondary=teacher_subject,
        back_populates="assigned_teachers"
    )
    registered_subjects = relationship(
        "Subject",
        secondary=student_subject,
        back_populates="registered_students"
    )


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    cie_weightage = Column(Integer, default=0)
    ha_weightage = Column(Integer, default=0)
    tw_weightage = Column(Integer, default=0)
    pbl_weightage = Column(Integer, default=0)
    attendance_threshold = Column(Integer, default=75)

    assigned_teachers = relationship(
        "User",
        secondary=teacher_subject,
        back_populates="assigned_subjects"
    )
    registered_students = relationship(
        "User",
        secondary=student_subject,
        back_populates="registered_subjects"
    )
    assignments = relationship("Assignment", back_populates="subject")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    attendance_percent = Column(Float, default=0.0)

    student = relationship("User", back_populates="attendance_records")


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))  # uploader
    description = Column(Text, nullable=True)
    is_sample = Column(Boolean, default=False)  # True for teacher sample, False for student submission
    file_path = Column(String, nullable=True)
    subject = relationship("Subject", back_populates="assignments")
    teacher = relationship("User", foreign_keys=[teacher_id])


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    file_path = Column(String, nullable=True)
    tfidf_vector = Column(Text, nullable=True)  # to store vector as string
    bert_score = Column(Float, nullable=True)   # BERT similarity score
    marks = Column(Float, nullable=True)
    status = Column(String, default="pending")  # pending, accepted, rejected

    assignment = relationship("Assignment")
    student = relationship("User")


class StudentSubjectStatus(Base):
    __tablename__ = "student_subject_status"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    attendance_percentage = Column(Float, default=0.0)
    marks_cie = Column(Float, default=0.0)
    marks_ha = Column(Float, default=0.0)
    marks_tw = Column(Float, default=0.0)
    marks_pbl = Column(Float, default=0.0)
    is_noc_eligible = Column(Boolean, default=False)
    noc_ineligibility_reason = Column(String, default="")

    student = relationship("User")
    subject = relationship("Subject")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="Pending")  # Pending, Resolved, Rejected, etc.
    response = Column(Text, nullable=True)

    student = relationship("User", back_populates="grievances")
    subject = relationship("Subject")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


# Pydantic Schema for Marks Update with validation
class MarksUpdateRequest(BaseModel):
    student_id: int
    subject_id: int
    marks_cie: int | None = Field(None, ge=0, le=100)
    marks_ha: int | None = Field(None, ge=0, le=100)
    marks_tw: int | None = Field(None, ge=0, le=100)
    marks_pbl: int | None = Field(None, ge=0, le=100)
