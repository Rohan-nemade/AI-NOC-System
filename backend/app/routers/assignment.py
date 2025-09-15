from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session, selectinload, joinedload
from app import models, schemas, db
from app.dependencies import get_current_user, require_role, UserRole
from app.utils import bert_utils, tfidf_utils, file_utils
import os
import uuid
import aiofiles

# ===================================================================
# Configuration and Helper Functions
# ===================================================================

router = APIRouter(
    tags=["Assignments"],
    prefix="/assignments"
)

UPLOAD_DIR = "backend/uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

async def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    """Asynchronously saves an uploaded file to a destination."""
    async with aiofiles.open(destination, "wb") as out_file:
        while content := await upload_file.read(1024):
            await out_file.write(content)

# ===================================================================
# Teacher Endpoints
# ===================================================================

@router.post(
    "/teacher",
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.AssignmentOut,
    summary="Create a New Assignment",
    dependencies=[Depends(require_role(UserRole.teacher))]
)
async def create_assignment(
    title: str = Form(...),
    subject: str = Form(...),
    class_name: str = Form(...),
    division: str = Form(...),
    assignment_type: str = Form(...),
    due_date: datetime = Form(...),
    max_marks: int = Form(...),
    status: str = Form(...),
    description: Optional[str] = Form(None),
    instructions: Optional[str] = Form(None),
    batch: Optional[str] = Form(None),
    is_sample: bool = Form(False),  # **CORRECTED**: Added is_sample flag from old code
    assignment_file: Optional[UploadFile] = File(None),
    solution_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Creates a new assignment with all details from the frontend form.
    This endpoint is restricted to users with the 'teacher' role.
    """
    db_subject = db.query(models.Subject).filter(models.Subject.name == subject).first()
    if not db_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Subject '{subject}' not found")

    if current_user.id not in [teacher.id for teacher in db_subject.assigned_teachers]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to teach this subject."
        )

    assignment_file_path, solution_file_path = None, None
    if assignment_file:
        filename = f"{uuid.uuid4()}_{assignment_file.filename}"
        assignment_file_path = os.path.join(UPLOAD_DIR, filename)
        await save_upload_file(assignment_file, assignment_file_path)

    if solution_file:
        filename = f"{uuid.uuid4()}_{solution_file.filename}"
        solution_file_path = os.path.join(UPLOAD_DIR, filename)
        await save_upload_file(solution_file, solution_file_path)

    db_assignment = models.Assignment(
        title=title, subject_id=db_subject.id, teacher_id=current_user.id,
        class_name=class_name, division=division, batch=batch,
        assignment_type=assignment_type, deadline=due_date, max_marks=max_marks,
        status=status, description=description, instructions=instructions,
        is_sample=is_sample,  # **CORRECTED**: Saving the flag to the database
        assignment_file_path=assignment_file_path, solution_file_path=solution_file_path
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.get(
    "/teacher",
    response_model=List[schemas.TeacherAssignmentDetail],
    summary="Get All Assignments for a Teacher",
    dependencies=[Depends(require_role(UserRole.teacher))]
)
def get_teacher_assignments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a list of all assignments for the authenticated teacher, including
    nested student submissions, for the management dashboard.
    """
    assignments = (
        db.query(models.Assignment)
        .options(
            selectinload(models.Assignment.submissions).joinedload(models.AssignmentSubmission.student),
            joinedload(models.Assignment.teacher),
            joinedload(models.Assignment.subject)
        )
        .filter(models.Assignment.teacher_id == current_user.id)
        .order_by(models.Assignment.created_at.desc())
        .all()
    )
    
    # **CORRECTED**: Using robust manual mapping to build the response
    response_data = []
    for ass in assignments:
        submission_list = [schemas.StudentSubmissionDetail.from_orm(sub) for sub in ass.submissions]
        
        response_data.append(schemas.TeacherAssignmentDetail(
            id=ass.id,
            title=ass.title,
            description=ass.description,
            subject=ass.subject.name,
            class_name=ass.class_name,
            division=ass.division,
            batch=ass.batch,
            dueDate=ass.deadline,
            createdDate=ass.created_at,
            maxMarks=ass.max_marks,
            instructions=ass.instructions,
            status=ass.status,
            teacherName=ass.teacher.name,
            assignmentType=ass.assignment_type,
            submissions=submission_list,
            assignmentFilePath=ass.assignment_file_path,
            solutionFilePath=ass.solution_file_path
        ))
    return response_data

# ===================================================================
# Student Endpoints
# ===================================================================

@router.post(
    "/student/{assignment_id}/submissions",
    summary="Submit an Assignment",
    response_model=schemas.AssignmentSubmissionOut,
    dependencies=[Depends(require_role(UserRole.student))]
)
async def create_student_submission(
    assignment_id: int,
    file: UploadFile = File(...),
    content: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Allows a student to submit a file for a specific assignment.
    This endpoint includes the fully integrated plagiarism and similarity checks.
    """
    assignment = db.query(models.Assignment).get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    file_path, file_text = None, None
    if file:
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        await save_upload_file(file, file_path)
        file_text = file_utils.extract_text(file_path, file.filename)
        if file_text is None:
            raise HTTPException(status_code=400, detail="Cannot extract text from uploaded file.")

    text_for_check = file_text or content
    if not text_for_check:
        raise HTTPException(status_code=400, detail="No content provided for submission.")

    previous_subs = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.assignment_id == assignment_id,
        models.AssignmentSubmission.status == "accepted"
    ).all()
    existing_texts = [s.content for s in previous_subs if s.content]

    tfidf_vector_json = None
    if existing_texts:
        documents = existing_texts + [text_for_check]
        vectors, _ = tfidf_utils.compute_tfidf_vectors(documents)
        new_vec = vectors[-1]
        similarities = [tfidf_utils.compare_vectors(vectors[i], new_vec) for i in range(len(existing_texts))]
        if similarities and max(similarities) >= 0.75:
            raise HTTPException(status_code=400, detail="Potential plagiarism detected. Submission rejected.")
        tfidf_vector_json = tfidf_utils.vector_to_json(new_vec)
    else:
        vec, _ = tfidf_utils.compute_single_tfidf_vector(text_for_check)
        tfidf_vector_json = tfidf_utils.vector_to_json(vec)

    teacher_sample = db.query(models.Assignment).filter(
        models.Assignment.subject_id == assignment.subject_id,
        models.Assignment.is_sample == True,
    ).first()

    bert_score = 0.0
    if teacher_sample:
        sample_text = teacher_sample.description or ""
        if teacher_sample.assignment_file_path:
            sample_filename = os.path.basename(teacher_sample.assignment_file_path)
            extracted_sample_text = file_utils.extract_text(teacher_sample.assignment_file_path, sample_filename)
            if extracted_sample_text:
                sample_text = extracted_sample_text
        
        if sample_text:
            bert_score = bert_utils.compute_bert_similarity(text_for_check, sample_text)

    db_sub = models.AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        content=text_for_check,
        file_path=file_path,
        tfidf_vector=tfidf_vector_json,
        bert_score=bert_score,
        status="submitted"
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    
    return db_sub

