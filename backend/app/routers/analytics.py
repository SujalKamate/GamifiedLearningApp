from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from sqlalchemy import func

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
