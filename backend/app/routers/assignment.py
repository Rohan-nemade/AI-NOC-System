from fastapi import APIRouter, Depends, HTTPException
from app import models, schemas, db
from sqlalchemy.orm import Session
from app.utils import tfidf_utils, bert_utils

router = APIRouter()

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@router.post("/teacher/assignment/", response_model=schemas.AssignmentCreate)
def upload_sample_assignment(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    assignment.is_sample = 1
    db_assignment = models.Assignment(**assignment.model_dump())
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.post("/student/submit-assignment/")
def submit_assignment(sub: schemas.AssignmentSubmissionCreate, db: Session = Depends(get_db)):

    # Fetch all previous submissions for this assignment
    previous_submissions = db.query(models.AssignmentSubmission).filter(
        models.AssignmentSubmission.assignment_id == sub.assignment_id,
        models.AssignmentSubmission.status == "accepted"
    ).all()

    # Calculate TF-IDF vector for new submission content
    existing_texts = [s.content for s in previous_submissions]
    if existing_texts:
        # Fit vectorizer on old submissions + new submission to keep consistent features
        documents = existing_texts + [sub.content]
        vectors = tfidf_utils.compute_tfidf_vectors(documents)
        new_vec = vectors[-1]
        similarities = []
        for i in range(len(existing_texts)):
            sim = tfidf_utils.compare_vectors(vectors[i], new_vec)
            similarities.append(sim)
        max_similarity = max(similarities) if similarities else 0
        if max_similarity >= 0.75:
            raise HTTPException(status_code=400, detail="Assignment submission rejected due to high similarity (potential plagiarism).")
        tfidf_vector_json = tfidf_utils.vector_to_json(new_vec)
    else:
        # First submission for this assignment
        tfidf_vector_json = tfidf_utils.vector_to_json(
            tfidf_utils.compute_single_tfidf_vector(sub.content)
        )
    
    assignment = db.query(models.Assignment).get(sub.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

     # Fetch teacher sample assignment content for this assignment’s subject
    teacher_sample = (
        db.query(models.Assignment)
        .filter(
            models.Assignment.subject_id == assignment.subject_id,
            models.Assignment.is_sample == 1
        )
        .first()
    )

    if teacher_sample:
        bert_score = bert_utils.compute_bert_similarity(sub.content, teacher_sample.description or "")
    else:
        bert_score = 0.0

    db_sub = models.AssignmentSubmission(
        assignment_id=sub.assignment_id,
        student_id=sub.student_id,
        content=sub.content,
        tfidf_vector=tfidf_vector_json,
        bert_score=bert_score,
        status="accepted"
    )
    db.add(db_sub)
    db.commit()
    db.refresh(db_sub)
    return {"message": "Assignment submitted successfully.", "bert_score": bert_score}