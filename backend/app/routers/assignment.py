from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app import models, schemas, db
from app.dependencies import get_current_user, require_role, UserRole
from app.utils import bert_utils, tfidf_utils, file_utils
import shutil
import os
import uuid
import aiofiles

async def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    async with aiofiles.open(destination, "wb") as out_file:
        while content := await upload_file.read(1024):
            await out_file.write(content)


router = APIRouter()

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
@router.post("/teacher/assignment", status_code=201, dependencies=[Depends(require_role(UserRole.teacher))])
async def upload_sample_assignment(
    title: str = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    deadline: datetime = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
    ):
    # Get the subject from DB
    subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Validate the role as teacher
    if current_user.role != UserRole.teacher:
        raise HTTPException(status_code=403, detail="Only teachers can upload assignments")

    # Check if teacher is assigned (compare by id to avoid object identity issues)
    if current_user.id not in [teacher.id for teacher in subject.assigned_teachers]:
        raise HTTPException(status_code=403, detail="You are not assigned to this subject")

    # Generate unique filename and save file (async compatible)
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Note: save_upload_file should be async and compatible with UploadFile
    await save_upload_file(file, file_path)

    # Create DB Assignment record with required fields as per model and schema
    db_assignment = models.Assignment(
        title=title,
        subject_id=subject_id,
        teacher_id=current_user.id,
        description=description,
        is_sample=True,
        deadline=deadline,
        file_path=file_path
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)

    return {"message": "Sample assignment uploaded successfully.", "assignment_id": db_assignment.id}
@router.post("/student/submit-assignment", dependencies=[Depends(require_role(UserRole.student))])
async def submit_assignment(
    assignment_id: int = Form(...),
    student_id: int = Form(...),
    content: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    assignment = db.query(models.Assignment).get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    file_text = None
    file_path = None
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        await save_upload_file(file, file_path)

        file_text = file_utils.extract_text(file_path, file.filename)
        if file_text is None:
            raise HTTPException(status_code=400, detail="Cannot extract text from uploaded file.")

    text_for_check = file_text if file_text else content
    if not text_for_check:
        raise HTTPException(status_code=400, detail="No content provided.")

    previous_subs = (
        db.query(models.AssignmentSubmission)
        .filter(
            models.AssignmentSubmission.assignment_id == assignment_id,
            models.AssignmentSubmission.status == "accepted"
        )
        .all()
    )
    existing_texts = [s.content for s in previous_subs if s.content]

    if existing_texts:
        documents = existing_texts + [text_for_check]
        vectors, v = tfidf_utils.compute_tfidf_vectors(documents)  # unpack tuple here
        new_vec = vectors[-1]
        max_similarity = max(
            tfidf_utils.compare_vectors(vectors[i], new_vec) for i in range(len(existing_texts))
        )
        if max_similarity >= 0.75:
            raise HTTPException(status_code=400, detail="Potential plagiarism detected. Submission rejected.")
        tfidf_vector_json = tfidf_utils.vector_to_json(new_vec)
    else:
        vec, v = tfidf_utils.compute_single_tfidf_vector(text_for_check)  # unpack tuple here
        tfidf_vector_json = tfidf_utils.vector_to_json(vec)

    teacher_sample = (
        db.query(models.Assignment)
        .filter(
            models.Assignment.subject_id == assignment.subject_id,
            models.Assignment.is_sample == True,
        )
        .first()
    )

    bert_score = 0.0
    if teacher_sample:
        sample_text = teacher_sample.description or ""
        if teacher_sample.file_path:
            extracted_sample_text = file_utils.extract_text(teacher_sample.file_path, teacher_sample.file_path)
            if extracted_sample_text:
                sample_text = extracted_sample_text
        bert_score = bert_utils.compute_bert_similarity(text_for_check, sample_text)

    db_sub = models.AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=student_id,
        content=text_for_check,
        file_path=file_path,
        tfidf_vector=tfidf_vector_json,
        bert_score=bert_score,
        status="accepted"
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return {"message": "Assignment submitted successfully.", "bert_score": bert_score}
