from fastapi import APIRouter, Depends
from app.database import get_db
from sqlalchemy.orm import Session
from app import models

router = APIRouter()

def determine_next_difficulty(current_difficulty: str, score_percentage: float):
    if score_percentage >= 0.8:
        if current_difficulty == "easy":
            return "medium"
        elif current_difficulty == "medium":
            return "hard"
        else:
            return "hard"
    elif score_percentage <= 0.4:
        if current_difficulty == "hard":
            return "medium"
        elif current_difficulty == "medium":
            return "easy"
        else:
            return "easy"
    else:
        return current_difficulty

@router.get("/next-difficulty/{user_id}")
def get_next_difficulty(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    # Placeholder: calculate last quiz score percentage
    last_quiz = db.query(models.QuizLog).filter(models.QuizLog.user_id == user_id).order_by(models.QuizLog.id.desc()).first()
    if not last_quiz:
        return {"next_difficulty": "easy"}

    # Calculate score percentage from last quiz
    user_answers = db.query(models.QuizLog).filter(models.QuizLog.user_id == user_id).all()
    if not user_answers:
        return {"next_difficulty": "easy"}

    correct_count = sum([log.correct for log in user_answers])
    total_questions = len(user_answers)
    score_percentage = correct_count / total_questions if total_questions else 0

    current_difficulty = last_quiz.difficulty
    next_diff = determine_next_difficulty(current_difficulty, score_percentage)
    return {"next_difficulty": next_diff}
