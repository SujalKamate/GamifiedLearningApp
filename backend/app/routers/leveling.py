from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter()

LEVEL_XP_THRESHOLDS = [0, 50, 150, 300, 500, 800]  # Example thresholds for levels 1-6

def calculate_level(xp: int):
    level = 1
    for threshold in LEVEL_XP_THRESHOLDS:
        if xp >= threshold:
            level += 1
    return level - 1

@router.get("/level/{user_id}")
def get_user_level(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    level = calculate_level(user.xp)
    next_level_xp = next((t for t in LEVEL_XP_THRESHOLDS if t > user.xp), None)
    xp_to_next_level = next_level_xp - user.xp if next_level_xp else 0

    return {
        "user_id": user.id,
        "xp": user.xp,
        "level": level,
        "xp_to_next_level": xp_to_next_level,
        "badges": user.badges
    }
