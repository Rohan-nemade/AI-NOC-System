from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base
import enum
import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
    grievances = relationship("Grievance", back_populates="student")
    attendance_records = relationship("Attendance", back_populates="student")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    cie_weightage = Column(Integer, default=0)       # marks or percentage
    ha_weightage = Column(Integer, default=0)
    tw_weightage = Column(Integer, default=0)
    pbl_weightage = Column(Integer, default=0)
    attendance_threshold = Column(Integer, default=0)  


class Parameter(Base):
    __tablename__ = "parameters"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    subject = relationship("Subject", back_populates="parameters")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    attendance_percent = Column(Float, default=0.0)
    student = relationship("User", back_populates="attendance_records")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    tfidf_vector = Column(String)  # store serialized vector as string; adjust as needed
    accepted = Column(Boolean, default=True)

class Grievance(Base):
    __tablename__ = "grievances"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    description = Column(Text)
    upload_path = Column(String)
    status = Column(Enum("pending", "accepted", "rejected", name="grievance_status"), default="pending")
    student = relationship("User", back_populates="grievances")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    from_id = Column(Integer, ForeignKey("users.id"))
    to_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
