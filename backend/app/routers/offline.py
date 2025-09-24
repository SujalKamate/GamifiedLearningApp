from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models
from app.database import get_db

router = APIRouter()

@router.post("/sync/{user_id}")
def sync_offline_attempts(user_id: int, db: Session = Depends(get_db)):
    """
    Sync all unsynced offline quiz attempts for a user.
    - Marks them as synced
    - Returns them to frontend
    """
    attempts = db.query(models.QuizLog).filter(
        models.QuizLog.user_id == user_id,
        models.QuizLog.synced == False
    ).all()

    if not attempts:
        raise HTTPException(status_code=404, detail="No offline attempts to sync")

    # Mark attempts as synced
    for attempt in attempts:
        attempt.synced = True
    db.commit()

    return {
        "message": f"{len(attempts)} attempts synced successfully.",
        "synced_attempts": [ 
            {
                "id": a.id,
                "question_id": a.question_id,
                "chosen_answer": a.chosen_answer,
                "correct": a.correct,
                "response_time": a.response_time,
                "subject": a.subject,
                "difficulty": a.difficulty,
                "timestamp": a.timestamp.isoformat() if hasattr(a, "timestamp") else None
            }
            for a in attempts
        ]
    }
