from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter()

@router.get("/quiz-history/{user_id}")
def quiz_history(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    logs = db.query(models.QuizLog).filter(models.QuizLog.user_id == user_id).all()
    
    history = []
    for log in logs:
        history.append({
            "question_id": log.question_id,
            "chosen_answer": log.chosen_answer,
            "correct": bool(log.correct),
            "response_time": log.response_time,
            "subject": log.subject,
            "difficulty": log.difficulty
        })
    
    return {"user_id": user_id, "quiz_history": history}
