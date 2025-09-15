from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List

from app import models, schemas, db
from app.dependencies import get_current_user, require_role, UserRole

# Initialize the router for SCE components
router = APIRouter(
    prefix="/sce",
    tags=["SCE Management"],
    dependencies=[Depends(require_role(UserRole.teacher))]
)

# Dependency to get a database session
def get_db():
    database = db.SessionLocal()
    try:
        yield database
    finally:
        database.close()

# Helper function to construct the detailed response, avoiding code duplication
def _construct_sce_detail_response(record: models.StudentSubjectLink) -> schemas.SCEDetailOut:
    """Constructs the SCEDetailOut response model from a database record."""
    if not record.student or not record.subject:
        return None
    
    # Calculate overall score (example logic, adjust as needed)
    overall_score = 0
    score_count = 0
    if record.pbl_score is not None:
        overall_score += record.pbl_score
        score_count += 1
    if record.presentation_score is not None:
        overall_score += record.presentation_score
        score_count += 1
    
    final_overall_score = (overall_score / score_count) if score_count > 0 else 0

    return schemas.SCEDetailOut(
        id=record.id,
        studentName=record.student.name,
        studentRollNo=record.student.roll_number,
        class_name=record.student.class_name,
        division=record.student.division,
        batch=record.batch, 
        year=record.year,
        subject=record.subject.name,
        pblStatus=record.pbl_status,
        pblScore=record.pbl_score,
        pblTitle=record.pbl_title,
        presentationStatus=record.presentation_status,
        presentationScore=record.presentation_score,
        presentationTopic=record.presentation_topic,
        certificationStatus=record.certification_status,
        certificationName=record.certification_name,
        certificationProvider=record.certification_provider,
        overallSCEScore=final_overall_score,
        lastUpdated=record.updated_at
    )

@router.get(
    "/teacher",
    response_model=List[schemas.SCEDetailOut],
    summary="Get all SCE component data for a teacher's students"
)
def get_all_sce_data_for_teacher(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves a comprehensive list of all SCE records for students in the
    subjects assigned to the currently authenticated teacher.
    """
    teacher_subject_ids = [s.id for s in current_user.assigned_subjects]

    if not teacher_subject_ids:
        return []

    student_sce_records = (
        db.query(models.StudentSubjectLink)
        .options(
            joinedload(models.StudentSubjectLink.student),
            joinedload(models.StudentSubjectLink.subject)
        )
        .filter(models.StudentSubjectLink.subject_id.in_(teacher_subject_ids))
        .all()
    )

    response_data = []
    for record in student_sce_records:
        sce_detail = _construct_sce_detail_response(record)
        if sce_detail:
            response_data.append(sce_detail)

    return response_data

@router.patch(
    "/teacher/sce-status",
    response_model=schemas.SCEDetailOut,
    summary="Update the status of SCE components for a student"
)
def update_student_sce_status(
    update_request: schemas.SCEStatusUpdateRequest, # Using the new, specific schema
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Updates the status (e.g., 'completed', 'pending', 'late') of SCE
    components for a single student in a specific subject. This endpoint
    only handles status changes and does not affect marks or other details.
    """
    # Find the specific student-subject link record to update
    record_to_update = db.query(models.StudentSubjectLink).filter(
        and_(
            models.StudentSubjectLink.student_id == update_request.student_id,
            models.StudentSubjectLink.subject_id == update_request.subject_id
        )
    ).first()

    if not record_to_update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No record found for the specified student and subject."
        )

    # Verify the teacher is assigned to this subject
    if record_to_update.subject_id not in [s.id for s in current_user.assigned_subjects]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update records for this subject."
        )

    # Update the record with the status data provided in the request
    update_data = update_request.model_dump(exclude_unset=True, exclude={"student_id", "subject_id"})
    for key, value in update_data.items():
        setattr(record_to_update, key, value)
    
    db.commit()
    db.refresh(record_to_update)

    # Re-fetch the full record with relationships to build the complete response
    full_updated_record = (
        db.query(models.StudentSubjectLink)
        .options(
            joinedload(models.StudentSubjectLink.student),
            joinedload(models.StudentSubjectLink.subject)
        )
        .filter(models.StudentSubjectLink.id == record_to_update.id)
        .one()
    )

    return _construct_sce_detail_response(full_updated_record)

