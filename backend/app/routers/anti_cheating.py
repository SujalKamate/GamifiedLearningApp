from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import QuizAttempt
from datetime import datetime, timedelta

router = APIRouter()

# Config (tweak as needed)
MIN_DURATION = 5   # Minimum seconds for a valid attempt
MAX_DUPLICATE_ATTEMPTS = 2

@router.get("/check/{quiz_id}/{user_id}")
def check_cheating(quiz_id: int, user_id: int, db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == user_id
    ).all()

    suspicious = []

    for attempt in attempts:
        # 1. Fast submissions
        if attempt.duration < MIN_DURATION:
            suspicious.append({
                "type": "fast_submission",
                "score": attempt.score,
                "timestamp": attempt.timestamp
            })

        # 2. Duplicate answers (compare with others)
        other_attempts = db.query(QuizAttempt).filter(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id != user_id
        ).all()

        for other in other_attempts:
            if attempt.answers == other.answers:
                suspicious.append({
                    "type": "duplicate_answers",
                    "user_id": other.user_id,
                    "timestamp": attempt.timestamp
                })

    # 3. Too many attempts
    if len(attempts) > MAX_DUPLICATE_ATTEMPTS:
        suspicious.append({
            "type": "too_many_attempts",
            "count": len(attempts)
        })

    return {
        "user_id": user_id,
        "quiz_id": quiz_id,
        "total_attempts": len(attempts),
        "suspicious_flags": suspicious
    }
