from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from sqlalchemy import func
from models import QuizAttempt
from datetime import datetime

router = APIRouter()

@router.get("/user-performance/{user_id}")
def get_user_performance(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"error": "User not found"}

    # Total quizzes
    total_quizzes = db.query(func.count(models.QuizLog.id)).filter(models.QuizLog.user_id == user_id).scalar()

    # Average score
    correct_answers = db.query(func.sum(models.QuizLog.correct)).filter(models.QuizLog.user_id == user_id).scalar() or 0
    avg_score = correct_answers / total_quizzes if total_quizzes > 0 else 0

    # XP and streak
    xp = user.xp
    streak = user.streak
    badges = user.badges or []

    return {
        "user_id": user_id,
        "total_quizzes": total_quizzes,
        "average_score": avg_score,
        "current_streak": streak,
        "xp": xp,
        "badges": badges
    }
# Get overall stats for a user
@router.get("/analytics/user/{user_id}")
def user_stats(user_id: int, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
    total_attempts = len(attempts)
    avg_score = sum([a.score for a in attempts]) / total_attempts if total_attempts > 0 else 0

    return {
        "user_id": user_id,
        "total_attempts": total_attempts,
        "average_score": avg_score,
        "last_attempt": attempts[-1].timestamp if total_attempts > 0 else None
    }

# Get quiz-wise stats
@router.get("/analytics/quiz/{quiz_id}")
def quiz_stats(quiz_id: int, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).all()
    total_attempts = len(attempts)
    avg_score = sum([a.score for a in attempts]) / total_attempts if total_attempts > 0 else 0

    return {
        "quiz_id": quiz_id,
        "total_attempts": total_attempts,
        "average_score": avg_score,
        "attempts": [
            {
                "user_id": a.user_id,
                "score": a.score,
                "timestamp": a.timestamp
            }
            for a in attempts
        ]
    }