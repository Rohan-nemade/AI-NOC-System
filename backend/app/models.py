from sqlalchemy import (
    Column, Integer, String, Enum, ForeignKey,
    Float, DateTime, Table, Boolean, Text
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime

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
    roll_number = Column(String, nullable=True)    # For students only
    class_name = Column(String, nullable=True)
    division = Column(String, nullable=True)

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
    has_cie = Column(Boolean, default=False)
    has_ha = Column(Boolean, default=False)
    has_tw = Column(Boolean, default=False)
    has_pbl = Column(Boolean, default=False)
    has_sce_presentation = Column(Boolean, default=False)
    has_sce_certificate = Column(Boolean, default=False)
    has_sce_pbl = Column(Boolean, default=False)
    attendance_threshold = Column(Integer, default=75)

    assigned_teachers = relationship(
        "User",
        secondary=teacher_subject,
        back_populates="assigned_subjects"
    )
    registered_students = relationship(
    "User",
    secondary=student_subject,
    back_populates="registered_subjects"  # **Correct**
    )


    assignments = relationship("Assignment", back_populates="subject")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    attendance_percent = Column(Float, default=0.0)

    student = relationship("User", back_populates="attendance_records")
    subject = relationship("Subject")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    description = Column(Text, nullable=True)
    is_sample = Column(Boolean, default=False)
    deadline = Column(DateTime, nullable=False)
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
    deadline_met = Column(Boolean, default=True)
    bert_score = Column(Float, nullable=True)
    marks = Column(Float, nullable=True)
    status = Column(String, default="pending")
    tfidf_vector = Column(Text, nullable=True) 

    assignment = relationship("Assignment")
    student = relationship("User")

class StudentSubjectStatus(Base):
    __tablename__ = "student_subject_status"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    attendance_percentage = Column(Float, default=0.0)
    cie_completed = Column(Boolean, default=False)
    ha_completed = Column(Boolean, default=False)
    tw_completed = Column(Boolean, default=False)
    pbl_completed = Column(Boolean, default=False)
    sce_presentation_completed = Column(Boolean, default=False)
    sce_certificate_completed = Column(Boolean, default=False)
    sce_pbl_completed = Column(Boolean, default=False)
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
    status = Column(String, default="Pending")
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

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
