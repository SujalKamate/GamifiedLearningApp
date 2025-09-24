from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app import models

router = APIRouter()

@router.get("/streak/{user_id}")
def get_streak(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = datetime.now().date()
    last_quiz_date = datetime.strptime(user.last_quiz_date, "%Y-%m-%d").date() if user.last_quiz_date else None

    if last_quiz_date == today - timedelta(days=1):
        streak = user.streak + 1
    elif last_quiz_date == today:
        streak = user.streak
    else:
        streak = 1  # reset streak

    # Example reward logic
    badges = user.badges if user.badges else []
    if streak == 5 and "Consistent Learner" not in badges:
        badges.append("Consistent Learner")
    if streak == 10 and "Dedicated Scholar" not in badges:
        badges.append("Dedicated Scholar")

    # Update user
    user.streak = streak
    user.badges = badges
    user.last_quiz_date = today.strftime("%Y-%m-%d")
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "streak": streak,
        "badges": badges,
        "xp": user.xp
    }
