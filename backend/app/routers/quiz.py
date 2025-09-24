from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.get("/get-questions")
def get_quiz(subject: str, difficulty: str, db: Session = Depends(get_db)):
    questions = crud.get_questions(db, subject, difficulty)
    return questions

@router.post("/submit")
def submit_quiz(quiz: schemas.QuizSubmit, db: Session = Depends(get_db)):
    # Minimal placeholder logic for hackathon
    correct_count = 0
    for ans in quiz.answers:
        # You can implement correctness checking here
        correct_count += 1  # For demo, assume all correct
    return {"user_id": quiz.user_id, "score": correct_count}
