from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter()

@router.get("/user-dashboard/{user_id}")
def user_dashboard(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch quiz stats
    total_quizzes = db.query(models.QuizLog).filter(models.QuizLog.user_id == user_id).count()
    correct_answers = db.query(models.QuizLog).filter(models.QuizLog.user_id == user_id, models.QuizLog.correct == 1).count()
    accuracy = (correct_answers / total_quizzes) if total_quizzes > 0 else 0
    
    dashboard_data = {
        "user_id": user.id,
        "name": user.name,
        "xp": user.xp,
        "streak": user.streak,
        "badges": user.badges,
        "total_quizzes": total_quizzes,
        "accuracy": round(accuracy * 100, 2)
    }
    
    return dashboard_data
